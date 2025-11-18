import { ethers } from "ethers";
import axios from "axios";
import { gelatoService } from "./gelatoService";
import { logger } from "../utils/logger";

/**
 * Event Monitor Service
 * @description Monitorea eventos del contrato AIOracle y automatiza resoluciones
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
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private processedRequests: Set<string> = new Set();

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
    this.backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    
    if (!this.aiOracleAddress) {
      logger.warn("[EventMonitor] AI_ORACLE_ADDRESS not configured");
    }
    if (!this.predictionMarketAddress) {
      logger.warn("[EventMonitor] CORE_CONTRACT_ADDRESS not configured");
    }
  }

  /**
   * Inicializa el provider y el contrato
   */
  async initialize(): Promise<void> {
    try {
      // Usar RPC privado de Gelato si está disponible, sino usar RPC público
      const rpcUrl = gelatoService.getRpcUrl() || 
                     process.env.GELATO_RPC_URL_TESTNET ||
                     process.env.RPC_URL_TESTNET ||
                     process.env.NEXT_PUBLIC_OPBNB_TESTNET_RPC ||
                     "https://opbnb-testnet-rpc.bnbchain.org";

      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.aiOracleContract = new ethers.Contract(
        this.aiOracleAddress,
        this.AI_ORACLE_ABI,
        this.provider
      );

      logger.info(`[EventMonitor] Initialized with AIOracle at ${this.aiOracleAddress}`);
      logger.info(`[EventMonitor] Using RPC: ${rpcUrl.substring(0, 50)}...`);
    } catch (error: any) {
      logger.error(`[EventMonitor] Failed to initialize: ${error.message}`);
      throw error;
    }
  }

  /**
   * Inicia el monitoreo de eventos
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      logger.warn("[EventMonitor] Already monitoring");
      return;
    }

    if (!this.provider || !this.aiOracleContract) {
      await this.initialize();
    }

    this.isMonitoring = true;
    logger.info("[EventMonitor] Starting event monitoring...");

    // Monitorear eventos en tiempo real
    this.monitorEvents();

    // También hacer polling periódico como backup
    this.monitoringInterval = setInterval(() => {
      this.checkPendingResolutions();
    }, 60000); // Cada minuto
  }

  /**
   * Detiene el monitoreo
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    logger.info("[EventMonitor] Stopped monitoring");
  }

  /**
   * Monitorea eventos ResolutionRequested en tiempo real
   */
  private async monitorEvents(): Promise<void> {
    if (!this.aiOracleContract) return;

    try {
      // Escuchar eventos ResolutionRequested
      this.aiOracleContract.on("ResolutionRequested", async (
        requestId: string,
        marketId: bigint,
        question: string,
        event: any
      ) => {
        const requestIdStr = requestId;
        const marketIdNum = Number(marketId);

        // Evitar procesar el mismo evento dos veces
        if (this.processedRequests.has(requestIdStr)) {
          return;
        }

        logger.info(`[EventMonitor] ResolutionRequested detected: requestId=${requestIdStr}, marketId=${marketIdNum}`);

        // Procesar la resolución
        await this.processResolution({
          requestId: requestIdStr,
          marketId: marketIdNum,
          question,
          timestamp: Date.now(),
          processed: false,
        });
      });

      logger.info("[EventMonitor] Event listener attached");
    } catch (error: any) {
      logger.error(`[EventMonitor] Error setting up event listener: ${error.message}`);
    }
  }

  /**
   * Verifica resoluciones pendientes (polling como backup)
   */
  private async checkPendingResolutions(): Promise<void> {
    if (!this.aiOracleContract || !this.provider) return;

    try {
      // Obtener eventos de las últimas 24 horas
      const currentBlock = await this.provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000); // Últimos ~10000 bloques

      const filter = this.aiOracleContract.filters.ResolutionRequested();
      const events = await this.aiOracleContract.queryFilter(filter, fromBlock, currentBlock);

      for (const event of events) {
        // Verificar que es un EventLog y tiene args
        if (event instanceof ethers.EventLog && event.args) {
          const requestId = event.args[0];
          const marketId = Number(event.args[1]);
          const question = event.args[2];

          const requestIdStr = requestId;

          // Solo procesar si no se ha procesado antes
          if (!this.processedRequests.has(requestIdStr)) {
            logger.info(`[EventMonitor] Found pending resolution: requestId=${requestIdStr}, marketId=${marketId}`);

            await this.processResolution({
              requestId: requestIdStr,
              marketId,
              question,
              timestamp: Date.now(),
              processed: false,
            });
          }
        }
      }
    } catch (error: any) {
      logger.error(`[EventMonitor] Error checking pending resolutions: ${error.message}`);
    }
  }

  /**
   * Procesa una resolución: llama al backend y luego usa Gelato Relay
   */
  private async processResolution(request: ResolutionRequest): Promise<void> {
    try {
      // Marcar como procesado inmediatamente para evitar duplicados
      this.processedRequests.add(request.requestId);

      logger.info(`[EventMonitor] Processing resolution for marketId=${request.marketId}`);

      // Paso 1: Llamar al backend para obtener el consenso multi-AI
      const backendResponse = await axios.post(
        `${this.backendUrl}/oracle/resolve`,
        {
          marketDescription: request.question,
          priceId: null, // Opcional
        },
        {
          timeout: 60000, // 60 segundos timeout
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { outcome, confidence } = backendResponse.data;

      if (!outcome || !confidence) {
        throw new Error("Invalid response from backend");
      }

      logger.info(
        `[EventMonitor] Backend resolved: outcome=${outcome}, confidence=${confidence}`
      );

      // Paso 2: Usar Gelato Relay para ejecutar la resolución en el contrato AIOracle
      // AIOracle.fulfillResolutionManual() resuelve el mercado y llama a PredictionMarket internamente
      const gelatoResult = await gelatoService.fulfillResolution(
        this.aiOracleAddress,
        request.marketId,
        outcome,
        confidence,
        this.chainId
      );

      logger.info(
        `[EventMonitor] Gelato Relay task created: taskId=${gelatoResult.taskId} for marketId=${request.marketId}`
      );

      // Marcar como procesado exitosamente
      request.processed = true;
    } catch (error: any) {
      logger.error(
        `[EventMonitor] Error processing resolution for marketId=${request.marketId}: ${error.message}`
      );
      
      // Remover de procesados para reintentar más tarde
      this.processedRequests.delete(request.requestId);
      
      // Reintentar después de 5 minutos
      setTimeout(() => {
        if (!this.processedRequests.has(request.requestId)) {
          this.processResolution(request);
        }
      }, 300000); // 5 minutos
    }
  }

  /**
   * Obtiene el estado del monitor
   */
  getStatus(): {
    isMonitoring: boolean;
    aiOracleAddress: string;
    predictionMarketAddress: string;
    chainId: number;
    processedCount: number;
  } {
    return {
      isMonitoring: this.isMonitoring,
      aiOracleAddress: this.aiOracleAddress,
      predictionMarketAddress: this.predictionMarketAddress,
      chainId: this.chainId,
      processedCount: this.processedRequests.size,
    };
  }
}

// Exportar instancia singleton
export const eventMonitorService = new EventMonitorService();

