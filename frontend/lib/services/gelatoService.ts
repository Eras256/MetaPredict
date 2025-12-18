import axios from "axios";
import { ethers } from "ethers";

/**
 * Gelato Automation Service
 * @description Service to automate AIOracle resolutions using Gelato
 * @see https://docs.gelato.network/
 */
export interface GelatoTask {
  taskId: string;
  name: string;
  execAddress: string;
  execSelector: string;
  execData: string;
  useTreasury: boolean;
  dedicatedMsgSender: string;
}

export interface GelatoTaskResponse {
  taskId: string;
  status: string;
  createdAt: number;
}

class GelatoService {
  private apiKey: string;
  private baseUrl: string;
  private testnetBaseUrl: string;
  private rpcUrl: string | null;

  constructor() {
    // Gelato Relay API Key (preferred for sponsored calls)
    // Gelato Automate API Key (for scheduled tasks)
    this.apiKey = process.env.GELATO_RELAY_API_KEY || process.env.GELATO_AUTOMATE_API_KEY || "";
    // Gelato API endpoints
    this.baseUrl = "https://api.gelato.digital";
    this.testnetBaseUrl = "https://api.gelato.digital";
    // Private Gelato RPC (if configured)
    this.rpcUrl = process.env.GELATO_RPC_URL_TESTNET || null;
  }

  /**
   * Gets Gelato RPC URL (private if available)
   */
  getRpcUrl(): string | null {
    return this.rpcUrl;
  }

  /**
   * Gets base URL based on environment
   */
  private getBaseUrl(): string {
    const isTestnet = process.env.NODE_ENV === "development" || 
                     process.env.VENUS_USE_TESTNET === "true";
    return isTestnet ? this.testnetBaseUrl : this.baseUrl;
  }

  /**
   * Creates an automated task in Gelato
   * @param taskConfig Task configuration
   */
  async createTask(taskConfig: {
    name: string;
    execAddress: string;
    execSelector: string;
    execData: string;
    interval: number; // seconds
    startTime?: number; // timestamp
    useTreasury?: boolean;
  }): Promise<GelatoTaskResponse> {
    try {
      if (!this.apiKey) {
        throw new Error("GELATO_AUTOMATE_API_KEY not configured");
      }

      const response = await axios.post(
        `${this.getBaseUrl()}/tasks`,
        {
          name: taskConfig.name,
          execAddress: taskConfig.execAddress,
          execSelector: taskConfig.execSelector,
          execData: taskConfig.execData,
          interval: taskConfig.interval,
          startTime: taskConfig.startTime || Math.floor(Date.now() / 1000),
          useTreasury: taskConfig.useTreasury ?? true,
        },
        {
          headers: {
            "X-API-KEY": this.apiKey,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("[GelatoService] Error creating task:", error.message);
      if (error.response) {
        console.error("[GelatoService] Response:", error.response.data);
      }
      throw new Error(`Failed to create Gelato task: ${error.message}`);
    }
  }

  /**
   * Cancels a Gelato task
   * @param taskId Task ID to cancel
   */
  async cancelTask(taskId: string): Promise<boolean> {
    try {
      if (!this.apiKey) {
        throw new Error("GELATO_AUTOMATE_API_KEY not configured");
      }

      const response = await axios.delete(
        `${this.getBaseUrl()}/tasks/${taskId}`,
        {
          headers: {
            "X-API-KEY": this.apiKey,
          },
          timeout: 10000,
        }
      );

      return response.status === 200;
    } catch (error: any) {
      console.error("[GelatoService] Error canceling task:", error.message);
      throw new Error(`Failed to cancel Gelato task: ${error.message}`);
    }
  }

  /**
   * Gets task status
   * @param taskId Task ID
   */
  async getTaskStatus(taskId: string): Promise<any> {
    try {
      if (!this.apiKey) {
        throw new Error("GELATO_AUTOMATE_API_KEY not configured");
      }

      const response = await axios.get(
        `${this.getBaseUrl()}/tasks/${taskId}`,
        {
          headers: {
            "X-API-KEY": this.apiKey,
          },
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("[GelatoService] Error getting task status:", error.message);
      throw new Error(`Failed to get Gelato task status: ${error.message}`);
    }
  }

  /**
   * Sends a transaction using Gelato Relay (gasless)
   * @param transaction Transaction to send
   */
  async relayTransaction(transaction: {
    chainId: number;
    target: string;
    data: string;
    user?: string;
  }): Promise<{ taskId: string }> {
    try {
      if (!this.apiKey) {
        throw new Error("GELATO_RELAY_API_KEY or GELATO_AUTOMATE_API_KEY not configured");
      }

      // Gelato Relay v2 endpoint for sponsored calls
      // Note: Gelato Relay may not support all chains. For opBNB Testnet (5611),
      // you may need to use a different approach or check Gelato's supported chains
      const endpoint = `${this.getBaseUrl()}/relays/v2/sponsored-call`;
      
      const payload = {
        chainId: transaction.chainId,
        target: transaction.target,
        data: transaction.data,
        ...(transaction.user && { user: transaction.user }),
      };

      console.log(`[GelatoService] Relaying transaction to chainId ${transaction.chainId}:`, {
        target: transaction.target,
        dataLength: transaction.data.length,
        endpoint,
      });

      const response = await axios.post(
        endpoint,
        payload,
        {
          headers: {
            "X-API-KEY": this.apiKey,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("[GelatoService] Error relaying transaction:", error.message);
      if (error.response) {
        console.error("[GelatoService] Response status:", error.response.status);
        console.error("[GelatoService] Response data:", JSON.stringify(error.response.data, null, 2));
        
        // Provide helpful error messages
        if (error.response.status === 401) {
          throw new Error("Gelato API key is invalid or expired. Please check your GELATO_RELAY_API_KEY.");
        } else if (error.response.status === 400) {
          const errorMsg = error.response.data?.message || error.response.data?.error || "Invalid request";
          if (errorMsg.includes("chain") || errorMsg.includes("network")) {
            throw new Error(`Gelato Relay may not support opBNB Testnet (chainId: ${transaction.chainId}). ${errorMsg}`);
          }
          throw new Error(`Invalid request to Gelato: ${errorMsg}`);
        } else if (error.response.status === 403) {
          throw new Error("Gelato API key does not have permission for this operation. Check your API key permissions.");
        }
      }
      throw new Error(`Failed to relay transaction: ${error.message}`);
    }
  }

  /**
   * Resolves a market using Gelato after getting backend result
   * @param aiOracleAddress AIOracle contract address
   * @param marketId Market ID to resolve
   * @param outcome Consensus result (1=Yes, 2=No, 3=Invalid)
   * @param confidence Confidence level (0-100)
   * @param chainId Chain ID (opBNB Testnet = 5611)
   */
  async fulfillResolution(
    aiOracleAddress: string,
    marketId: number,
    outcome: number,
    confidence: number,
    chainId: number = 5611
  ): Promise<{ taskId: string }> {
    try {
      // Call AIOracle.fulfillResolutionManual()
      // This function allows resolving markets without Chainlink Functions
      const iface = new ethers.Interface([
        "function fulfillResolutionManual(uint256 marketId, uint8 outcome, uint8 confidence) external"
      ]);
      
      const execData = iface.encodeFunctionData("fulfillResolutionManual", [
        marketId,
        outcome,
        confidence
      ]);

      return await this.relayTransaction({
        chainId,
        target: aiOracleAddress,
        data: execData,
      });
    } catch (error: any) {
      console.error("[GelatoService] Error fulfilling resolution:", error.message);
      throw new Error(`Failed to fulfill resolution: ${error.message}`);
    }
  }

  /**
   * Creates automated task to monitor AIOracle events
   * @param aiOracleAddress AIOracle contract address
   * @param backendUrl Backend URL to call when event is detected
   * @param chainId Chain ID (opBNB Testnet = 5611)
   */
  async setupOracleAutomation(
    aiOracleAddress: string,
    backendUrl: string,
    chainId: number = 5611
  ): Promise<GelatoTaskResponse> {
    try {
      // Note: Gelato Automation requires an executor contract that monitors events
      // and calls the backend. This can be done with a dedicated contract or
      // using Gelato Web3 Functions (if available)
      
      // For now, create a task that runs periodically
      // The contract must have a function that can be called by Gelato
      const iface = new ethers.Interface([
        "function checkAndResolvePendingMarkets() external"
      ]);
      
      const execData = iface.encodeFunctionData("checkAndResolvePendingMarkets", []);
      const func = iface.getFunction("checkAndResolvePendingMarkets");
      
      if (!func) {
        throw new Error("Function checkAndResolvePendingMarkets not found in interface");
      }

      return await this.createTask({
        name: "MetaPredict AIOracle Automation",
        execAddress: aiOracleAddress,
        execSelector: func.selector,
        execData: execData,
        interval: 300, // Check every 5 minutes
        useTreasury: true,
      });
    } catch (error: any) {
      console.error("[GelatoService] Error setting up automation:", error.message);
      throw new Error(`Failed to setup Gelato automation: ${error.message}`);
    }
  }

  /**
   * Checks if Gelato is configured correctly
   */
  async checkConfiguration(): Promise<{
    configured: boolean;
    apiKeyPresent: boolean;
    message: string;
    details?: {
      relayKeyPresent: boolean;
      automateKeyPresent: boolean;
      rpcUrlPresent: boolean;
      apiKeyLength: number;
      apiKeyPrefix: string;
    };
    warnings?: string[];
  }> {
    const relayKey = process.env.GELATO_RELAY_API_KEY;
    const automateKey = process.env.GELATO_AUTOMATE_API_KEY;
    const rpcUrl = process.env.GELATO_RPC_URL_TESTNET;
    const apiKeyPresent = !!this.apiKey;
    
    const details = {
      relayKeyPresent: !!relayKey,
      automateKeyPresent: !!automateKey,
      rpcUrlPresent: !!rpcUrl,
      apiKeyLength: this.apiKey.length,
      apiKeyPrefix: this.apiKey.substring(0, 10) + "...",
    };

    const warnings: string[] = [];

    if (!apiKeyPresent) {
      return {
        configured: false,
        apiKeyPresent: false,
        message: "GELATO_RELAY_API_KEY or GELATO_AUTOMATE_API_KEY not configured",
        details,
        warnings: [
          "Configure GELATO_RELAY_API_KEY in Vercel environment variables",
          "Get your API key from https://relay.gelato.network/",
        ],
      };
    }

    // Check if API key looks valid (Gelato keys are usually long strings)
    if (this.apiKey.length < 20) {
      warnings.push("API key seems too short. Verify it's correct.");
    }

    // Check for opBNB Testnet support
    warnings.push(
      "Note: Gelato Relay may not support opBNB Testnet (chainId: 5611). " +
      "If transactions fail, use the manual resolution script instead."
    );

    return {
      configured: true,
      apiKeyPresent: true,
      message: "Gelato is configured. Note: opBNB Testnet support may be limited.",
      details,
      warnings,
    };
  }
}

// Export singleton instance
export const gelatoService = new GelatoService();

