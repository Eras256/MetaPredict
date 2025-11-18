import { eventMonitorService } from "../services/eventMonitorService";
import { logger } from "../utils/logger";

/**
 * Oracle Bot
 * @description Bot que monitorea eventos del AIOracle y automatiza resoluciones usando Gelato
 */
class OracleBot {
  private isRunning: boolean = false;

  /**
   * Inicia el bot
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn("[OracleBot] Bot is already running");
      return;
    }

    try {
      logger.info("[OracleBot] Starting Oracle Bot...");
      
      // Inicializar y empezar el monitoreo
      await eventMonitorService.initialize();
      await eventMonitorService.startMonitoring();

      this.isRunning = true;
      logger.info("[OracleBot] Oracle Bot started successfully");
    } catch (error: any) {
      logger.error(`[OracleBot] Failed to start: ${error.message}`);
      throw error;
    }
  }

  /**
   * Detiene el bot
   */
  stop(): void {
    if (!this.isRunning) {
      logger.warn("[OracleBot] Bot is not running");
      return;
    }

    try {
      logger.info("[OracleBot] Stopping Oracle Bot...");
      eventMonitorService.stopMonitoring();
      this.isRunning = false;
      logger.info("[OracleBot] Oracle Bot stopped");
    } catch (error: any) {
      logger.error(`[OracleBot] Error stopping bot: ${error.message}`);
    }
  }

  /**
   * Obtiene el estado del bot
   */
  getStatus(): {
    isRunning: boolean;
    monitorStatus: ReturnType<typeof eventMonitorService.getStatus>;
  } {
    return {
      isRunning: this.isRunning,
      monitorStatus: eventMonitorService.getStatus(),
    };
  }
}

// Exportar instancia singleton
export const oracleBot = new OracleBot();

