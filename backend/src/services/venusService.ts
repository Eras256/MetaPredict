import axios from "axios";

/**
 * Venus Protocol API Service
 * @description Servicio para consultar datos de Venus Protocol (APY, tasas, datos históricos)
 * @see https://docs-v4.venus.io/services/api
 */
export interface VenusMarketData {
  address: string;
  symbol: string;
  name: string;
  underlyingSymbol: string;
  underlyingAddress: string;
  supplyApy: number;
  borrowApy: number;
  totalSupply: string;
  totalBorrows: string;
  liquidity: string;
  collateralFactor: string;
  exchangeRate: string;
  underlyingPrice: string;
}

export interface VenusHistoricalData {
  timestamp: number;
  supplyApy: number;
  borrowApy: number;
  totalSupply: string;
  totalBorrows: string;
  utilizationRate: number;
}

export interface VenusVTokenInfo {
  address: string;
  symbol: string;
  underlyingSymbol: string;
  supplyApy: number;
  exchangeRate: string;
  totalSupply: string;
}

class VenusService {
  private baseUrl: string;
  private testnetBaseUrl: string;

  constructor() {
    // URLs base de la API de Venus Protocol
    this.baseUrl = process.env.VENUS_API_URL || "https://api.venus.io";
    this.testnetBaseUrl = process.env.VENUS_TESTNET_API_URL || "https://testnetapi.venus.io";
  }

  /**
   * Obtiene la URL base según el entorno (mainnet o testnet)
   */
  private getBaseUrl(): string {
    const isTestnet = process.env.NODE_ENV === "development" || 
                     process.env.VENUS_USE_TESTNET === "true";
    return isTestnet ? this.testnetBaseUrl : this.baseUrl;
  }

  /**
   * Obtiene todos los mercados de Venus Protocol
   */
  async getMarkets(): Promise<VenusMarketData[]> {
    try {
      const response = await axios.get(`${this.getBaseUrl()}/markets`, {
        timeout: 10000,
      });
      return response.data || [];
    } catch (error: any) {
      console.error("[VenusService] Error fetching markets:", error.message);
      throw new Error(`Failed to fetch Venus markets: ${error.message}`);
    }
  }

  /**
   * Obtiene datos de un mercado específico por dirección del vToken
   */
  async getMarketByAddress(vTokenAddress: string): Promise<VenusMarketData | null> {
    try {
      const markets = await this.getMarkets();
      return markets.find((m) => m.address.toLowerCase() === vTokenAddress.toLowerCase()) || null;
    } catch (error: any) {
      console.error("[VenusService] Error fetching market by address:", error.message);
      throw new Error(`Failed to fetch Venus market: ${error.message}`);
    }
  }

  /**
   * Obtiene el APY actual de un vToken específico
   */
  async getVTokenAPY(vTokenAddress: string): Promise<number> {
    try {
      const market = await this.getMarketByAddress(vTokenAddress);
      if (!market) {
        throw new Error(`vToken not found: ${vTokenAddress}`);
      }
      return market.supplyApy;
    } catch (error: any) {
      console.error("[VenusService] Error fetching APY:", error.message);
      throw new Error(`Failed to fetch APY: ${error.message}`);
    }
  }

  /**
   * Obtiene información del vUSDC (vToken de USDC)
   */
  async getVUSDCInfo(): Promise<VenusVTokenInfo | null> {
    try {
      const markets = await this.getMarkets();
      const vUSDC = markets.find(
        (m) => m.underlyingSymbol === "USDC" || m.symbol === "vUSDC"
      );
      
      if (!vUSDC) {
        return null;
      }

      return {
        address: vUSDC.address,
        symbol: vUSDC.symbol,
        underlyingSymbol: vUSDC.underlyingSymbol,
        supplyApy: vUSDC.supplyApy,
        exchangeRate: vUSDC.exchangeRate,
        totalSupply: vUSDC.totalSupply,
      };
    } catch (error: any) {
      console.error("[VenusService] Error fetching vUSDC info:", error.message);
      throw new Error(`Failed to fetch vUSDC info: ${error.message}`);
    }
  }

  /**
   * Obtiene datos históricos de mercado usando el endpoint /markets/history
   * @see https://docs-v4.venus.io/services/api
   */
  async getHistoricalAPY(
    vTokenAddress: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<VenusHistoricalData[]> {
    try {
      const params: any = {
        address: vTokenAddress,
      };

      // Agregar filtros de fecha si se proporcionan
      if (startDate) {
        params.startTimestamp = Math.floor(startDate.getTime() / 1000);
      }
      if (endDate) {
        params.endTimestamp = Math.floor(endDate.getTime() / 1000);
      }

      const response = await axios.get(`${this.getBaseUrl()}/markets/history`, {
        params,
        timeout: 15000,
      });

      // La API devuelve datos en formato paginado
      const historyData = response.data?.result || response.data || [];
      
      return historyData.map((item: any) => {
        const utilizationRate = item.totalBorrowsMantissa && item.totalSupplyMantissa
          ? (parseFloat(item.totalBorrowsMantissa) / parseFloat(item.totalSupplyMantissa)) * 100
          : 0;

        return {
          timestamp: item.timestamp || item.blockTimestamp || Date.now(),
          supplyApy: parseFloat(item.supplyApy || 0),
          borrowApy: parseFloat(item.borrowApy || 0),
          totalSupply: item.totalSupplyMantissa || item.totalSupply || "0",
          totalBorrows: item.totalBorrowsMantissa || item.totalBorrows || "0",
          utilizationRate,
        };
      });
    } catch (error: any) {
      console.error("[VenusService] Error fetching historical APY:", error.message);
      // Si el endpoint no existe o falla, retornar datos actuales como fallback
      try {
        const market = await this.getMarketByAddress(vTokenAddress);
        if (market) {
          const utilizationRate = market.totalBorrows && market.totalSupply
            ? (parseFloat(market.totalBorrows) / parseFloat(market.totalSupply)) * 100
            : 0;

          return [
            {
              timestamp: Date.now(),
              supplyApy: market.supplyApy,
              borrowApy: market.borrowApy,
              totalSupply: market.totalSupply,
              totalBorrows: market.totalBorrows,
              utilizationRate,
            },
          ];
        }
      } catch (fallbackError) {
        // Ignorar error del fallback
      }
      throw new Error(`Failed to fetch historical APY: ${error.message}`);
    }
  }

  /**
   * Calcula el APY estimado para el Insurance Pool basado en el vUSDC
   */
  async getInsurancePoolAPY(): Promise<{
    currentAPY: number;
    vUSDCAddress: string;
    vUSDCInfo: VenusVTokenInfo | null;
  }> {
    try {
      const vUSDCInfo = await this.getVUSDCInfo();
      
      if (!vUSDCInfo) {
        return {
          currentAPY: 0,
          vUSDCAddress: process.env.VENUS_VUSDC_ADDRESS || "",
          vUSDCInfo: null,
        };
      }

      return {
        currentAPY: vUSDCInfo.supplyApy,
        vUSDCAddress: vUSDCInfo.address,
        vUSDCInfo,
      };
    } catch (error: any) {
      console.error("[VenusService] Error fetching Insurance Pool APY:", error.message);
      // Retornar valores por defecto en caso de error
      return {
        currentAPY: 0,
        vUSDCAddress: process.env.VENUS_VUSDC_ADDRESS || "",
        vUSDCInfo: null,
      };
    }
  }

  /**
   * Obtiene transacciones relacionadas con Venus Protocol
   * @see https://testnetapi.venus.io/api/transactions/
   */
  async getTransactions(params?: {
    address?: string;
    vTokenAddress?: string;
    limit?: number;
    page?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    try {
      const queryParams: any = {};
      
      if (params?.address) {
        queryParams.address = params.address;
      }
      if (params?.vTokenAddress) {
        queryParams.vTokenAddress = params.vTokenAddress;
      }
      if (params?.limit) {
        queryParams.limit = params.limit;
      }
      if (params?.page) {
        queryParams.page = params.page;
      }
      if (params?.startDate) {
        queryParams.startTimestamp = Math.floor(params.startDate.getTime() / 1000);
      }
      if (params?.endDate) {
        queryParams.endTimestamp = Math.floor(params.endDate.getTime() / 1000);
      }

      const response = await axios.get(`${this.getBaseUrl()}/api/transactions/`, {
        params: queryParams,
        timeout: 15000,
      });
      
      return response.data;
    } catch (error: any) {
      // Si el endpoint no existe, retornar null
      if (error.response?.status === 404) {
        return null;
      }
      console.error("[VenusService] Error fetching transactions:", error.message);
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  }

  /**
   * Obtiene transacciones del Insurance Pool relacionadas con Venus
   */
  async getInsurancePoolTransactions(
    poolAddress?: string,
    limit: number = 50
  ): Promise<any> {
    try {
      return await this.getTransactions({
        address: poolAddress,
        limit,
      });
    } catch (error: any) {
      console.error("[VenusService] Error fetching insurance pool transactions:", error.message);
      return null;
    }
  }

  /**
   * Obtiene datos históricos hasta noviembre 2025 (o fecha especificada)
   */
  async getHistoricalDataUntil(
    vTokenAddress: string,
    endDate: Date = new Date("2025-11-30")
  ): Promise<VenusHistoricalData[]> {
    try {
      // Obtener datos desde hace 1 año hasta la fecha especificada
      const startDate = new Date(endDate);
      startDate.setFullYear(startDate.getFullYear() - 1);

      return await this.getHistoricalAPY(vTokenAddress, startDate, endDate);
    } catch (error: any) {
      console.error("[VenusService] Error fetching historical data until date:", error.message);
      throw new Error(`Failed to fetch historical data: ${error.message}`);
    }
  }
}

// Exportar instancia singleton
export const venusService = new VenusService();

