import axios from "axios";
import { ethers } from "ethers";

/**
 * Gelato Automation Service
 * @description Servicio para automatizar resoluciones del AIOracle usando Gelato
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
    this.apiKey = process.env.GELATO_AUTOMATE_API_KEY || process.env.GELATO_RELAY_API_KEY || "";
    // Gelato API endpoints
    this.baseUrl = "https://api.gelato.digital";
    this.testnetBaseUrl = "https://api.gelato.digital";
    // RPC privado de Gelato (si está configurado)
    this.rpcUrl = process.env.GELATO_RPC_URL_TESTNET || null;
  }

  /**
   * Obtiene el RPC URL de Gelato (privado si está disponible)
   */
  getRpcUrl(): string | null {
    return this.rpcUrl;
  }

  /**
   * Obtiene la URL base según el entorno
   */
  private getBaseUrl(): string {
    const isTestnet = process.env.NODE_ENV === "development" || 
                     process.env.VENUS_USE_TESTNET === "true";
    return isTestnet ? this.testnetBaseUrl : this.baseUrl;
  }

  /**
   * Crea una tarea automatizada en Gelato
   * @param taskConfig Configuración de la tarea
   */
  async createTask(taskConfig: {
    name: string;
    execAddress: string;
    execSelector: string;
    execData: string;
    interval: number; // segundos
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
   * Cancela una tarea de Gelato
   * @param taskId ID de la tarea a cancelar
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
   * Obtiene el estado de una tarea
   * @param taskId ID de la tarea
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
   * Envía una transacción usando Gelato Relay (gasless)
   * @param transaction Transacción a enviar
   */
  async relayTransaction(transaction: {
    chainId: number;
    target: string;
    data: string;
    user?: string;
  }): Promise<{ taskId: string }> {
    try {
      if (!this.apiKey) {
        throw new Error("GELATO_RELAY_API_KEY not configured");
      }

      const response = await axios.post(
        `${this.getBaseUrl()}/relays/v2/sponsored-call`,
        {
          chainId: transaction.chainId,
          target: transaction.target,
          data: transaction.data,
          user: transaction.user,
        },
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
        console.error("[GelatoService] Response:", error.response.data);
      }
      throw new Error(`Failed to relay transaction: ${error.message}`);
    }
  }

  /**
   * Resuelve un mercado usando Gelato después de obtener el resultado del backend
   * @param aiOracleAddress Dirección del contrato AIOracle
   * @param marketId ID del mercado a resolver
   * @param outcome Resultado del consenso (1=Yes, 2=No, 3=Invalid)
   * @param confidence Nivel de confianza (0-100)
   * @param chainId ID de la cadena (opBNB Testnet = 5611)
   */
  async fulfillResolution(
    aiOracleAddress: string,
    marketId: number,
    outcome: number,
    confidence: number,
    chainId: number = 5611
  ): Promise<{ taskId: string }> {
    try {
      // Llamar a AIOracle.fulfillResolutionManual()
      // Esta función permite resolver mercados sin Chainlink Functions
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
   * Crea una tarea automatizada para monitorear eventos del AIOracle
   * @param aiOracleAddress Dirección del contrato AIOracle
   * @param backendUrl URL del backend para llamar cuando se detecte un evento
   * @param chainId ID de la cadena (opBNB Testnet = 5611)
   */
  async setupOracleAutomation(
    aiOracleAddress: string,
    backendUrl: string,
    chainId: number = 5611
  ): Promise<GelatoTaskResponse> {
    try {
      // Nota: Gelato Automation requiere un contrato executor que monitoree eventos
      // y llame al backend. Esto se puede hacer con un contrato dedicado o
      // usando Gelato Web3 Functions (si está disponible)
      
      // Por ahora, creamos una tarea que se ejecuta periódicamente
      // El contrato debe tener una función que pueda ser llamada por Gelato
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
        interval: 300, // Revisar cada 5 minutos
        useTreasury: true,
      });
    } catch (error: any) {
      console.error("[GelatoService] Error setting up automation:", error.message);
      throw new Error(`Failed to setup Gelato automation: ${error.message}`);
    }
  }

  /**
   * Verifica si Gelato está configurado correctamente
   */
  async checkConfiguration(): Promise<{
    configured: boolean;
    apiKeyPresent: boolean;
    message: string;
  }> {
    const apiKeyPresent = !!this.apiKey;
    
    if (!apiKeyPresent) {
      return {
        configured: false,
        apiKeyPresent: false,
        message: "GELATO_AUTOMATE_API_KEY or GELATO_RELAY_API_KEY not configured",
      };
    }

    // Intentar hacer una llamada de prueba (opcional)
    try {
      // Podríamos hacer una llamada de prueba aquí
      return {
        configured: true,
        apiKeyPresent: true,
        message: "Gelato is configured and ready",
      };
    } catch (error: any) {
      return {
        configured: false,
        apiKeyPresent: true,
        message: `Gelato API key present but test failed: ${error.message}`,
      };
    }
  }
}

// Exportar instancia singleton
export const gelatoService = new GelatoService();

