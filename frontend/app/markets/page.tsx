'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketCard } from '@/components/markets/MarketCard';
import { useMarkets } from '@/lib/hooks/markets/useMarkets';
import { MarketFilters } from '@/components/markets/MarketFilters';
import { Search, Filter, TrendingUp, Clock, Users } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { MARKET_STATUS, MARKET_TYPES } from '@/lib/config/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

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
          <h1 className="text-4xl font-bold text-white mb-2">Markets</h1>
          <p className="text-gray-400">Browse and bet on active prediction markets</p>
        </div>

        {/* Filters */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="flex gap-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Markets</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="binary">Binary</SelectItem>
                  <SelectItem value="conditional">Conditional</SelectItem>
                  <SelectItem value="subjective">Subjective</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="ending-soon">Ending Soon</SelectItem>
                  <SelectItem value="volume">Highest Volume</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{markets?.length || 0}</div>
                <div className="text-sm text-gray-400">Total Markets</div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {markets?.filter((m: any) => m.status === MARKET_STATUS.ACTIVE).length || 0}
                </div>
                <div className="text-sm text-gray-400">Active Markets</div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-sm text-gray-400">Total Participants</div>
              </div>
            </div>
          </GlassCard>
        </div>

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
