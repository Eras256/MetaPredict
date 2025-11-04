'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketCard } from '@/components/markets/MarketCard';
import { useMarkets } from '@/lib/hooks/markets/useMarkets';
import { MarketFilters } from '@/components/markets/MarketFilters';
import { GlassCard } from '@/components/effects/GlassCard';
import { MARKET_STATUS, MARKET_TYPES } from '@/lib/config/constants';
import { Skeleton } from '@/components/ui/skeleton';

export default function MarketsPage() {
  const { markets, isLoading } = useMarkets();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

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
      if (sortBy === 'volume') return (b.totalVolume || 0) - (a.totalVolume || 0);
      return 0;
    });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Explore Markets</h1>
          <p className="text-gray-400">Discover and trade on prediction markets powered by AI oracles</p>
        </div>

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
            volume24h: '$0',
            resolvingSoon: 0,
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
