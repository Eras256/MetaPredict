'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketCard } from '@/components/markets/MarketCard';
import { useMarkets } from '@/lib/hooks/useMarkets';
import { MarketFilters } from '@/components/markets/MarketFilters';
import { GlassCard } from '@/components/effects/GlassCard';
import { formatModelName } from '@/lib/utils/model-formatter';
import { MARKET_STATUS, MARKET_TYPES } from '@/lib/config/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Loader2, TrendingUp } from 'lucide-react';
import { callGemini } from '@/lib/services/ai/gemini';
import { toast } from 'sonner';
import { readContract } from 'thirdweb';
import { getContract } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import InsurancePoolABI from '@/lib/contracts/abi/InsurancePool.json';
import { client } from '@/lib/config/thirdweb';

const opBNBTestnet = defineChain({
  id: 5611,
  name: 'opBNB Testnet',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpc: 'https://opbnb-testnet-rpc.bnbchain.org',
});

export default function MarketsPage() {
  const { markets, loading: isLoading, refresh } = useMarkets();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [analyzingTrends, setAnalyzingTrends] = useState(false);
  const [trendAnalysis, setTrendAnalysis] = useState<any>(null);
  const [insuredMarketsCount, setInsuredMarketsCount] = useState<number>(0);
  const [loadingInsured, setLoadingInsured] = useState(false);

  // Calcular volumen total de todos los mercados
  const totalVolume = useMemo(() => {
    if (!markets || markets.length === 0) return 0;
    
    const volume = markets.reduce((sum: bigint, market: any) => {
      const yesPool = market.yesPool || BigInt(0);
      const noPool = market.noPool || BigInt(0);
      return sum + yesPool + noPool;
    }, BigInt(0));
    
    // Convertir de wei a BNB (18 decimales)
    return Number(volume) / 1e18;
  }, [markets]);

  // Formatear volumen como BNB
  const formattedVolume = useMemo(() => {
    if (totalVolume === 0) return '0 BNB';
    if (totalVolume < 0.01) return `${totalVolume.toFixed(4)} BNB`;
    if (totalVolume < 1) return `${totalVolume.toFixed(2)} BNB`;
    return `${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })} BNB`;
  }, [totalVolume]);

  // Calcular mercados resolviendo pronto (en las próximas 24 horas)
  const resolvingSoon = useMemo(() => {
    if (!markets || markets.length === 0) return 0;
    const now = Math.floor(Date.now() / 1000);
    const oneDay = 24 * 60 * 60;
    return markets.filter((market: any) => {
      // Solo contar mercados activos con tiempo de resolución válido
      if (market.status !== MARKET_STATUS.ACTIVE) return false;
      if (!market.resolutionTime || market.resolutionTime <= 0) return false;
      const timeUntilResolution = market.resolutionTime - now;
      return timeUntilResolution > 0 && timeUntilResolution <= oneDay;
    }).length;
  }, [markets]);

  // Calcular mercados asegurados (con datos reales del contrato)
  useEffect(() => {
    const fetchInsuredMarkets = async () => {
      if (!markets || markets.length === 0) {
        setInsuredMarketsCount(0);
        return;
      }

      setLoadingInsured(true);
      try {
        const insurancePoolContract = getContract({
          client,
          chain: opBNBTestnet,
          address: CONTRACT_ADDRESSES.INSURANCE_POOL,
          abi: InsurancePoolABI as any,
        });

        // Verificar solo mercados activos
        const activeMarkets = markets.filter((m: any) => m.status === MARKET_STATUS.ACTIVE);
        
        if (activeMarkets.length === 0) {
          setInsuredMarketsCount(0);
          setLoadingInsured(false);
          return;
        }

        // Verificar cada mercado activo para ver si tiene seguro
        const policyChecks = activeMarkets.map(async (market: any) => {
          try {
            const policyStatus = await readContract({
              contract: insurancePoolContract,
              method: 'getPolicyStatus',
              params: [BigInt(market.id)],
            }) as any;

            // Un mercado tiene seguro si tiene reserve > 0
            const hasInsurance = policyStatus && policyStatus.reserve && BigInt(policyStatus.reserve) > BigInt(0);
            return hasInsurance ? 1 : 0;
          } catch (error) {
            // Si hay error al obtener el estado, asumir que no tiene seguro
            console.warn(`Error checking insurance for market ${market.id}:`, error);
            return 0;
          }
        });

        const results = await Promise.all(policyChecks);
        const count = results.reduce((sum, val) => sum + val, 0);
        setInsuredMarketsCount(count);
      } catch (error) {
        console.error('Error fetching insured markets:', error);
        setInsuredMarketsCount(0);
      } finally {
        setLoadingInsured(false);
      }
    };

    fetchInsuredMarkets();
  }, [markets]);

  // Función para filtrar mercados por tipo de categoría
  const filterByCategory = (markets: any[], category: string) => {
    return markets.filter((market: any) => {
      if (category === 'all') return true;
      if (category === 'active') return market.status === MARKET_STATUS.ACTIVE;
      if (category === 'binary') return market.marketType === MARKET_TYPES.BINARY;
      if (category === 'conditional') return market.marketType === MARKET_TYPES.CONDITIONAL;
      if (category === 'subjective') return market.marketType === MARKET_TYPES.SUBJECTIVE;
      return true;
    });
  };

  // Función para filtrar por búsqueda
  const filterBySearch = (markets: any[], query: string) => {
    if (!query) return markets;
    return markets.filter((market: any) => 
      market.question?.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Función para ordenar mercados
  const sortMarkets = (markets: any[], sort: string) => {
    return [...markets].sort((a: any, b: any) => {
      if (sort === 'newest') return b.createdAt - a.createdAt;
      if (sort === 'ending-soon') return a.resolutionTime - b.resolutionTime;
      if (sort === 'volume') {
        const volumeA = Number(a.yesPool || BigInt(0)) + Number(a.noPool || BigInt(0));
        const volumeB = Number(b.yesPool || BigInt(0)) + Number(b.noPool || BigInt(0));
        return volumeB - volumeA;
      }
      return 0;
    });
  };

  // Mercados filtrados para "All Markets"
  const filteredMarkets = useMemo(() => {
    if (!markets || markets.length === 0) return [];
    let filtered = filterByCategory(markets, filterType);
    filtered = filterBySearch(filtered, searchQuery);
    return sortMarkets(filtered, sortBy);
  }, [markets, filterType, searchQuery, sortBy]);

  // Mercados "Trending" - mayor volumen o actividad reciente
  const trendingMarkets = useMemo(() => {
    if (!markets || markets.length === 0) return [];
    let filtered = filterByCategory(markets, filterType);
    filtered = filterBySearch(filtered, searchQuery);
    // Filtrar solo mercados activos con volumen
    filtered = filtered.filter((market: any) => {
      const volume = Number(market.yesPool || BigInt(0)) + Number(market.noPool || BigInt(0));
      return market.status === MARKET_STATUS.ACTIVE && volume > 0;
    });
    // Ordenar por volumen descendente
    return sortMarkets(filtered, 'volume');
  }, [markets, filterType, searchQuery]);

  // Mercados "New" - recién creados (últimos 7 días)
  const newMarkets = useMemo(() => {
    if (!markets || markets.length === 0) return [];
    const now = Math.floor(Date.now() / 1000);
    const sevenDays = 7 * 24 * 60 * 60;
    let filtered = filterByCategory(markets, filterType);
    filtered = filterBySearch(filtered, searchQuery);
    // Filtrar mercados creados en los últimos 7 días
    filtered = filtered.filter((market: any) => {
      if (!market.createdAt || market.createdAt <= 0) return false;
      const age = now - market.createdAt;
      return age >= 0 && age <= sevenDays;
    });
    // Ordenar por más reciente primero
    return sortMarkets(filtered, 'newest');
  }, [markets, filterType, searchQuery]);

  // Mercados "Ending Soon" - se resuelven pronto (próximos 3 días)
  const endingSoonMarkets = useMemo(() => {
    if (!markets || markets.length === 0) return [];
    const now = Math.floor(Date.now() / 1000);
    const threeDays = 3 * 24 * 60 * 60;
    let filtered = filterByCategory(markets, filterType);
    filtered = filterBySearch(filtered, searchQuery);
    // Filtrar mercados activos que se resuelven en los próximos 3 días
    filtered = filtered.filter((market: any) => {
      if (market.status !== MARKET_STATUS.ACTIVE) return false;
      if (!market.resolutionTime || market.resolutionTime <= 0) return false;
      const timeUntilResolution = market.resolutionTime - now;
      return timeUntilResolution > 0 && timeUntilResolution <= threeDays;
    });
    // Ordenar por más próximo primero
    return sortMarkets(filtered, 'ending-soon');
  }, [markets, filterType, searchQuery]);

  // Función helper para renderizar mercados
  const renderMarkets = (marketsToRender: any[]) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 sm:h-80 w-full" />
          ))}
        </div>
      );
    }

    if (!marketsToRender || marketsToRender.length === 0) {
      return (
        <GlassCard className="p-8 sm:p-12 text-center">
          <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">No markets found</p>
          <Button onClick={() => {
            setSearchQuery('');
            setFilterType('all');
          }} size="sm" className="text-xs sm:text-sm">
            Clear Filters
          </Button>
        </GlassCard>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {marketsToRender.map((market: any) => {
          // Calcular volumen y odds para cada mercado en tiempo real
          const totalPool = Number(market.yesPool || 0) + Number(market.noPool || 0);
          const yesOdds = totalPool > 0 ? (Number(market.yesPool || 0) / totalPool) * 100 : 50;
          const noOdds = totalPool > 0 ? (Number(market.noPool || 0) / totalPool) * 100 : 50;
          const volume = totalPool / 1e18; // Convertir de wei a BNB
          
          return (
            <MarketCard 
              key={market.id} 
              market={{
                ...market,
                yesOdds: Math.round(yesOdds),
                noOdds: Math.round(noOdds),
                totalVolume: volume,
              }} 
            />
          );
        })}
      </div>
    );
  };

  const handleAnalyzeTrends = async () => {
    if (!markets || markets.length === 0) {
      toast.error('No markets to analyze');
      return;
    }

    setAnalyzingTrends(true);
    try {
      const marketsSummary = markets.slice(0, 10).map((m: any) => ({
        question: m.question,
        status: m.status,
        volume: m.totalVolume || 0,
      }));

      const prompt = `Analyze the trends of these prediction markets and provide an analysis in JSON:

Markets:
${JSON.stringify(marketsSummary, null, 2)}

Respond with a JSON in this format:
{
  "trends": ["trend 1", "trend 2", "trend 3"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "riskLevel": "low" | "medium" | "high",
  "summary": "overall analysis summary"
}`;

      const result = await callGemini(prompt, undefined, true);
      if (result.success && result.data) {
        setTrendAnalysis(result.data);
        toast.success(`Analysis completed with ${formatModelName(result.modelUsed)}`);
      } else {
        toast.error(result.error || 'Error analyzing trends');
      }
    } catch (error: any) {
      toast.error('Error analyzing trends');
      console.error(error);
    } finally {
      setAnalyzingTrends(false);
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Explore Markets</h1>
              <p className="text-sm sm:text-base text-gray-400">Discover and trade on prediction markets powered by AI oracles</p>
            </div>
            {markets && markets.length > 0 && (
              <Button
                onClick={handleAnalyzeTrends}
                disabled={analyzingTrends}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xs sm:text-sm w-full sm:w-auto"
                size="sm"
              >
                {analyzingTrends ? (
                  <>
                    <Loader2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    <span className="hidden sm:inline">Analyzing...</span>
                    <span className="sm:hidden">Analyzing</span>
                  </>
                ) : (
                  <>
                    <Brain className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Analyze Trends with AI</span>
                    <span className="sm:hidden">AI Analysis</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Trend Analysis Results */}
        {trendAnalysis && (
          <GlassCard className="p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 border-purple-500/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                Trend Analysis
              </h3>
              <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                trendAnalysis.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                trendAnalysis.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                Risk: {trendAnalysis.riskLevel}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4 leading-relaxed">{trendAnalysis.summary}</p>
            {trendAnalysis.trends && trendAnalysis.trends.length > 0 && (
              <div className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2">Identified Trends:</h4>
                <ul className="list-disc list-inside space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-gray-300">
                  {trendAnalysis.trends.map((trend: string, idx: number) => (
                    <li key={idx}>{trend}</li>
                  ))}
                </ul>
              </div>
            )}
            {trendAnalysis.recommendations && trendAnalysis.recommendations.length > 0 && (
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2">Recommendations:</h4>
                <ul className="list-disc list-inside space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-gray-300">
                  {trendAnalysis.recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </GlassCard>
        )}

        {/* Stats and Filters */}
        <MarketFilters
          search={searchQuery}
          category={filterType}
          sortBy={sortBy}
          onSearchChange={setSearchQuery}
          onCategoryChange={setFilterType}
          onSortByChange={setSortBy}
          stats={{
            activeMarkets: markets?.length || 0,
            volume24h: formattedVolume,
            resolvingSoon: resolvingSoon,
            insuredMarkets: loadingInsured ? '...' : insuredMarketsCount.toString(),
          }}
        />

        {/* Markets Grid */}
        <Tabs defaultValue="all" className="mb-6 sm:mb-8">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto">
            <TabsTrigger value="all" className="text-xs sm:text-sm py-2 sm:py-2.5">All Markets</TabsTrigger>
            <TabsTrigger value="trending" className="text-xs sm:text-sm py-2 sm:py-2.5">Trending</TabsTrigger>
            <TabsTrigger value="new" className="text-xs sm:text-sm py-2 sm:py-2.5">New</TabsTrigger>
            <TabsTrigger value="ending" className="text-xs sm:text-sm py-2 sm:py-2.5">Ending Soon</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 sm:mt-6">
            {renderMarkets(filteredMarkets)}
          </TabsContent>

          <TabsContent value="trending" className="mt-4 sm:mt-6">
            {renderMarkets(trendingMarkets)}
          </TabsContent>

          <TabsContent value="new" className="mt-4 sm:mt-6">
            {renderMarkets(newMarkets)}
          </TabsContent>

          <TabsContent value="ending" className="mt-4 sm:mt-6">
            {renderMarkets(endingSoonMarkets)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
