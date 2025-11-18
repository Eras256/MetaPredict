'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketCard } from '@/components/markets/MarketCard';
import { useMarkets } from '@/lib/hooks/useMarkets';
import { MarketFilters } from '@/components/markets/MarketFilters';
import { GlassCard } from '@/components/effects/GlassCard';
import { MARKET_STATUS, MARKET_TYPES } from '@/lib/config/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Loader2, TrendingUp } from 'lucide-react';
import { callGemini } from '@/lib/services/ai/gemini';
import { toast } from 'sonner';

export default function MarketsPage() {
  const { markets, loading: isLoading, refresh } = useMarkets();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [analyzingTrends, setAnalyzingTrends] = useState(false);
  const [trendAnalysis, setTrendAnalysis] = useState<any>(null);

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

  // Formatear volumen como moneda
  const formattedVolume = useMemo(() => {
    if (totalVolume === 0) return '$0';
    if (totalVolume < 0.01) return `$${totalVolume.toFixed(4)}`;
    if (totalVolume < 1) return `$${totalVolume.toFixed(2)}`;
    return `$${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }, [totalVolume]);

  // Calcular mercados resolviendo pronto (en las próximas 24 horas)
  const resolvingSoon = useMemo(() => {
    if (!markets || markets.length === 0) return 0;
    const now = Math.floor(Date.now() / 1000);
    const oneDay = 24 * 60 * 60;
    return markets.filter((market: any) => {
      const timeUntilResolution = market.resolutionTime - now;
      return timeUntilResolution > 0 && timeUntilResolution <= oneDay && market.status === MARKET_STATUS.ACTIVE;
    }).length;
  }, [markets]);

  const filteredMarkets = markets
    ?.filter((market: any) => {
      if (filterType === 'all') return true;
      if (filterType === 'active') return market.status === MARKET_STATUS.ACTIVE;
      if (filterType === 'binary') return market.marketType === MARKET_TYPES.BINARY;
      if (filterType === 'conditional') return market.marketType === MARKET_TYPES.CONDITIONAL;
      if (filterType === 'subjective') return market.marketType === MARKET_TYPES.SUBJECTIVE;
      return true;
    })
    .filter((market: any) => {
      if (!searchQuery) return true;
      return market.question?.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      if (sortBy === 'ending-soon') return a.resolutionTime - b.resolutionTime;
      if (sortBy === 'volume') {
        const volumeA = Number(a.yesPool || BigInt(0)) + Number(a.noPool || BigInt(0));
        const volumeB = Number(b.yesPool || BigInt(0)) + Number(b.noPool || BigInt(0));
        return volumeB - volumeA;
      }
      return 0;
    });

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
        toast.success(`Analysis completed with ${result.modelUsed}`);
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Explore Markets</h1>
              <p className="text-gray-400">Discover and trade on prediction markets powered by AI oracles</p>
            </div>
            {markets && markets.length > 0 && (
              <Button
                onClick={handleAnalyzeTrends}
                disabled={analyzingTrends}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {analyzingTrends ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Analyze Trends with AI
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Trend Analysis Results */}
        {trendAnalysis && (
          <GlassCard className="p-6 mb-6 border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Trend Analysis
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                trendAnalysis.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                trendAnalysis.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                Risk: {trendAnalysis.riskLevel}
              </span>
            </div>
            <p className="text-sm text-gray-300 mb-4">{trendAnalysis.summary}</p>
            {trendAnalysis.trends && trendAnalysis.trends.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Identified Trends:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  {trendAnalysis.trends.map((trend: string, idx: number) => (
                    <li key={idx}>{trend}</li>
                  ))}
                </ul>
              </div>
            )}
            {trendAnalysis.recommendations && trendAnalysis.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Recommendations:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
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
            insuredMarkets: '98%',
          }}
        />

        {/* Markets Grid */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Markets</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="ending">Ending Soon</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-80 w-full" />
                ))}
              </div>
            ) : filteredMarkets && filteredMarkets.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMarkets.map((market: any) => (
                  <MarketCard key={market.id} market={market} />
                ))}
              </div>
            ) : (
              <GlassCard className="p-12 text-center">
                <p className="text-gray-400 mb-4">No markets found matching your filters</p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}>
                  Clear Filters
                </Button>
              </GlassCard>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
