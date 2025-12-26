import axios from "axios";

/**
 * Venus Protocol API Service
 * @description Service to query Venus Protocol data (APY, rates, historical data)
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
    // Base URLs for Venus Protocol API
    this.baseUrl = process.env.VENUS_API_URL || "https://api.venus.io";
    this.testnetBaseUrl = process.env.VENUS_TESTNET_API_URL || "https://testnetapi.venus.io";
  }

  /**
   * Gets the base URL based on environment (mainnet or testnet)
   */
  private getBaseUrl(): string {
    const isTestnet = process.env.NODE_ENV === "development" || 
                     process.env.VENUS_USE_TESTNET === "true";
    return isTestnet ? this.testnetBaseUrl : this.baseUrl;
  }

  /**
   * Gets all Venus Protocol markets
   * @param chainId - Chain ID (default: 56 for BSC mainnet, 97 for BSC testnet)
   */
  async getMarkets(chainId?: number): Promise<VenusMarketData[]> {
    try {
      const baseUrl = this.getBaseUrl();
      // Default chainId: BSC mainnet (56) or testnet (97) based on environment
      const defaultChainId = process.env.NODE_ENV === "development" || 
                             process.env.VENUS_USE_TESTNET === "true" ? 97 : 56;
      const targetChainId = chainId || defaultChainId;
      
      const response = await axios.get(`${baseUrl}/markets`, {
        params: {
          chainId: targetChainId,
        },
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'accept-version': 'stable', // Venus API versioning header
        },
        validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      });
      
      if (response.status !== 200) {
        const errorMsg = response.data?.error || response.data?.message || response.statusText;
        console.warn(`[VenusService] Venus API returned status ${response.status}: ${errorMsg}`);
        // Return empty array for 400/404 errors to allow graceful degradation
        if (response.status === 400 || response.status === 404) {
          console.warn("[VenusService] Venus API endpoint may not be available or requires different parameters, returning empty array");
          return [];
        }
        throw new Error(`Venus API returned status ${response.status}: ${errorMsg}`);
      }
      
      // Handle different response formats based on Venus API v4 documentation
      // Response can be: { result: [...], limit: 20, page: 0, total: 1 }
      let markets: any[] = [];
      if (response.data?.result && Array.isArray(response.data.result)) {
        markets = response.data.result;
      } else if (Array.isArray(response.data)) {
        markets = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        markets = response.data.data;
      } else if (response.data?.markets && Array.isArray(response.data.markets)) {
        markets = response.data.markets;
      }
      
      if (markets.length === 0) {
        console.warn("[VenusService] Unexpected response format, returning empty array");
        return [];
      }
      
      // Normalize data: convert string APY values to numbers and map Venus API fields
      // Venus API v4 returns: totalSupplyMantissa, cashMantissa (available liquidity), totalBorrowsMantissa, etc.
      return markets.map((market: any) => {
        // Map Venus API fields to our interface
        // totalSupplyMantissa is in wei (1e18), use directly
        const totalSupply = market.totalSupplyMantissa || market.totalSupply || "0";
        // cashMantissa is the available liquidity in wei (1e18)
        // liquidityCents is in USD cents, but we prefer cashMantissa for actual token liquidity
        const liquidity = market.cashMantissa || market.liquidity || "0";
        const totalBorrows = market.totalBorrowsMantissa || market.totalBorrows || "0";
        
        return {
          ...market,
          supplyApy: typeof market.supplyApy === 'string' 
            ? parseFloat(market.supplyApy) || 0 
            : (typeof market.supplyApy === 'number' ? market.supplyApy : 0),
          borrowApy: typeof market.borrowApy === 'string' 
            ? parseFloat(market.borrowApy) || 0 
            : (typeof market.borrowApy === 'number' ? market.borrowApy : 0),
          totalSupply: String(totalSupply),
          totalBorrows: String(totalBorrows),
          liquidity: String(liquidity),
          // Ensure other fields are strings
          collateralFactor: String(market.collateralFactorMantissa || market.collateralFactor || "0"),
          exchangeRate: String(market.exchangeRateMantissa || market.exchangeRate || "0"),
          underlyingPrice: String(market.underlyingPriceMantissa || market.underlyingPrice || "0"),
        };
      });
    } catch (error: any) {
      console.error("[VenusService] Error fetching markets:", error.message);
      
      // Return empty array instead of throwing to allow graceful degradation
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
        console.warn("[VenusService] Venus API is not available, returning empty array");
        return [];
      }
      
      // For axios errors with response, check if it's a 400/404
      if (error.response) {
        const status = error.response.status;
        if (status === 400 || status === 404) {
          console.warn("[VenusService] Venus API endpoint returned 400/404, returning empty array");
          return [];
        }
      }
      
      // Re-throw other errors
      throw new Error(`Failed to fetch Venus markets: ${error.message}`);
    }
  }

  /**
   * Gets data for a specific market by vToken address
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
   * Gets the current APY for a specific vToken
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
   * Gets vUSDC (USDC vToken) information
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
   * Gets historical market data using /markets/history endpoint
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

      // Add date filters if provided
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

      // API returns paginated data
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
      // If endpoint doesn't exist or fails, return current data as fallback
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
        // Ignore fallback error
      }
      throw new Error(`Failed to fetch historical APY: ${error.message}`);
    }
  }

  /**
   * Calculates estimated APY for Insurance Pool based on vUSDC
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
      // Return default values on error
      return {
        currentAPY: 0,
        vUSDCAddress: process.env.VENUS_VUSDC_ADDRESS || "",
        vUSDCInfo: null,
      };
    }
  }

  /**
   * Gets transactions related to Venus Protocol
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
      // If endpoint doesn't exist, return null
      if (error.response?.status === 404) {
        return null;
      }
      console.error("[VenusService] Error fetching transactions:", error.message);
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  }

  /**
   * Gets Insurance Pool transactions related to Venus
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
   * Gets historical data until December 2025 (or specified date)
   */
  async getHistoricalDataUntil(
    vTokenAddress: string,
    endDate: Date = new Date("2025-12-31")
  ): Promise<VenusHistoricalData[]> {
    try {
      // Get data from 1 year ago until specified date
      const startDate = new Date(endDate);
      startDate.setFullYear(startDate.getFullYear() - 1);

      return await this.getHistoricalAPY(vTokenAddress, startDate, endDate);
    } catch (error: any) {
      console.error("[VenusService] Error fetching historical data until date:", error.message);
      throw new Error(`Failed to fetch historical data: ${error.message}`);
    }
  }
}

// Export singleton instance
export const venusService = new VenusService();

