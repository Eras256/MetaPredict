import { ethers } from "ethers";
import axios from "axios";
import { gelatoService } from "./gelatoService";

/**
 * Event Monitor Service (Serverless Version)
 * @description Monitors AIOracle events and automates resolutions
 * Adapted for Vercel Cron Jobs - runs periodically instead of continuously
 */
interface ResolutionRequest {
  requestId: string;
  marketId: number;
  question: string;
  timestamp: number;
  processed: boolean;
}

class EventMonitorService {
  private provider: ethers.Provider | null = null;
  private aiOracleAddress: string;
  private predictionMarketAddress: string;
  private aiOracleContract: ethers.Contract | null = null;
  private chainId: number;
  private backendUrl: string;

  // ABI simplificado del contrato AIOracle
  private readonly AI_ORACLE_ABI = [
    "event ResolutionRequested(bytes32 indexed requestId, uint256 indexed marketId, string question)",
    "event ResolutionFulfilled(bytes32 indexed requestId, uint256 indexed marketId, uint8 outcome, uint8 confidence)",
    "function fulfillResolutionManual(uint256 marketId, uint8 outcome, uint8 confidence) external",
  ];

  constructor() {
    this.aiOracleAddress = process.env.NEXT_PUBLIC_AI_ORACLE_ADDRESS || "";
    this.predictionMarketAddress = process.env.NEXT_PUBLIC_CORE_CONTRACT_ADDRESS || "";
    this.chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "5611");
    // Use relative path for Next.js API Routes
    this.backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "/api";
  }

  /**
   * Initialize provider and contract
   */
  async initialize(): Promise<void> {
    try {
      // Prefer standard RPC over Gelato RPC (Gelato RPC may not be available for opBNB Testnet)
      const rpcUrl = process.env.RPC_URL_TESTNET || 
                    process.env.NEXT_PUBLIC_OPBNB_TESTNET_RPC || 
                    process.env.GELATO_RPC_URL_TESTNET || 
                    "https://opbnb-testnet-rpc.bnbchain.org";

      console.log(`[EventMonitor] Initializing with RPC: ${rpcUrl.replace(/\/rpc\/[^/]+/, '/rpc/***')}`);
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      if (this.aiOracleAddress) {
        this.aiOracleContract = new ethers.Contract(
          this.aiOracleAddress,
          this.AI_ORACLE_ABI,
          this.provider
        );
      }
    } catch (error: any) {
      console.error("[EventMonitor] Initialization error:", error.message);
      throw error;
    }
  }

  /**
   * Check for pending resolutions (called by Vercel Cron)
   * This replaces the continuous monitoring with periodic checks
   */
  async checkPendingResolutions(): Promise<{
    checked: number;
    processed: number;
    errors: number;
  }> {
    try {
      if (!this.aiOracleContract) {
        await this.initialize();
      }

      if (!this.aiOracleContract) {
        throw new Error("AIOracle contract not initialized");
      }

      // Get events from last 24 hours
      const fromBlock = await this.provider!.getBlockNumber() - 1000; // Last ~1000 blocks
      const toBlock = "latest";

      const filter = this.aiOracleContract.filters.ResolutionRequested();
      const events = await this.aiOracleContract.queryFilter(filter, fromBlock, toBlock);

      let processed = 0;
      let errors = 0;

      for (const event of events) {
        if (event instanceof ethers.EventLog && event.args) {
          const requestId = event.args[0];
          const marketId = event.args[1];
          const question = event.args[2];

          // Check if already fulfilled
          const fulfilledFilter = this.aiOracleContract.filters.ResolutionFulfilled(requestId);
          const fulfilledEvents = await this.aiOracleContract.queryFilter(fulfilledFilter, fromBlock, toBlock);

          if (fulfilledEvents.length > 0) {
            continue; // Already resolved
          }

          // Process resolution
          try {
            await this.processResolution({
              requestId: requestId.toString(),
              marketId: Number(marketId),
              question: question.toString(),
              timestamp: event.blockNumber,
              processed: false,
            });
            processed++;
          } catch (error: any) {
            console.error(`[EventMonitor] Error processing marketId=${marketId}:`, error.message);
            errors++;
          }
        }
      }

      return {
        checked: events.length,
        processed,
        errors,
      };
    } catch (error: any) {
      console.error("[EventMonitor] Error checking pending resolutions:", error.message);
      throw error;
    }
  }

  /**
   * Process a single resolution request
   */
  private async processResolution(request: ResolutionRequest): Promise<void> {
    try {
      console.log(`[EventMonitor] Processing resolution for marketId=${request.marketId}`);

      // Step 1: Call backend to get multi-AI consensus
      const backendResponse = await axios.post(
        `${this.backendUrl}/oracle/resolve`,
        {
          marketDescription: request.question,
          priceId: null,
        },
        {
          timeout: 60000, // 60 seconds timeout
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { outcome, confidence } = backendResponse.data;

      if (!outcome || confidence === undefined) {
        throw new Error("Invalid response from backend");
      }

      console.log(
        `[EventMonitor] Backend resolved: outcome=${outcome}, confidence=${confidence}`
      );

      // Step 2: Try to use Gelato Relay to execute resolution on AIOracle contract
      // If Gelato fails (e.g., doesn't support opBNB Testnet), log the error but don't fail completely
      // The market will need to be resolved manually using the script
      try {
        const gelatoResult = await gelatoService.fulfillResolution(
          this.aiOracleAddress,
          request.marketId,
          outcome,
          confidence,
          this.chainId
        );

        console.log(
          `[EventMonitor] ✅ Gelato Relay task created: taskId=${gelatoResult.taskId} for marketId=${request.marketId}`
        );
        console.log(
          `[EventMonitor] Market ${request.marketId} will be resolved via Gelato Relay`
        );
      } catch (gelatoError: any) {
        // Gelato failed - log detailed error but don't throw
        // This allows the cron job to continue processing other markets
        const errorMsg = gelatoError.message || String(gelatoError);
        console.error(
          `[EventMonitor] ⚠️ Gelato Relay failed for marketId=${request.marketId}: ${errorMsg}`
        );
        
        // Check if it's a chain support issue
        if (errorMsg.includes("chain") || errorMsg.includes("network") || errorMsg.includes("not support")) {
          console.error(
            `[EventMonitor] 💡 Gelato Relay does not support opBNB Testnet (chainId: ${this.chainId})`
          );
          console.error(
            `[EventMonitor] 💡 Market ${request.marketId} needs manual resolution. Run: pnpm hardhat run scripts/resolve-all-pending-markets.ts --network opBNBTestnet`
          );
        } else if (errorMsg.includes("API key") || errorMsg.includes("401") || errorMsg.includes("403")) {
          console.error(
            `[EventMonitor] 💡 Gelato API key issue. Check GELATO_RELAY_API_KEY configuration.`
          );
        }
        
        // Don't throw - allow cron job to continue and log this for manual resolution
        // The market will remain in "Resolving" state until manually resolved
        throw new Error(
          `Gelato Relay failed: ${errorMsg}. Market ${request.marketId} needs manual resolution. ` +
          `Backend consensus obtained: outcome=${outcome}, confidence=${confidence}. ` +
          `Use script: resolve-all-pending-markets.ts`
        );
      }
    } catch (error: any) {
      // Re-throw Gelato errors with context
      if (error.message.includes("Gelato Relay failed")) {
        throw error;
      }
      
      // Other errors (backend, etc.)
      console.error(
        `[EventMonitor] ❌ Error processing resolution for marketId=${request.marketId}: ${error.message}`
      );
      throw error;
    }
  }
}

// Export singleton instance
export const eventMonitorService = new EventMonitorService();

