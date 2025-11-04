'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MarketCard } from '@/components/markets/MarketCard';
import { GlassCard } from '@/components/effects/GlassCard';
import { useMarkets } from '@/lib/hooks/markets/useMarkets';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MARKET_TYPES, MARKET_STATUS } from '@/lib/config/constants';

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'binary' | 'conditional' | 'subjective'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'resolved' | 'disputed'>('all');
  
  const { markets, isLoading } = useMarkets();

  const filteredMarkets = markets.filter((market: any) => {
    const matchesSearch = !searchQuery || 
      market.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || 
      (filterType === 'binary' && market.marketType === MARKET_TYPES.BINARY) ||
      (filterType === 'conditional' && market.marketType === MARKET_TYPES.CONDITIONAL) ||
      (filterType === 'subjective' && market.marketType === MARKET_TYPES.SUBJECTIVE);
    
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && market.status === MARKET_STATUS.ACTIVE) ||
      (filterStatus === 'resolved' && market.status === MARKET_STATUS.RESOLVED) ||
      (filterStatus === 'disputed' && market.status === MARKET_STATUS.DISPUTED);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Prediction Markets
          </h1>
          <p className="text-gray-400 text-lg">
            Browse and participate in prediction markets powered by multi-AI oracle
          </p>
        </div>

        {/* Search and Filters */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            
            <div className="flex gap-2">
              <Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                <TabsList>
                  <TabsTrigger value="all">All Types</TabsTrigger>
                  <TabsTrigger value="binary">Binary</TabsTrigger>
                  <TabsTrigger value="conditional">Conditional</TabsTrigger>
                  <TabsTrigger value="subjective">Subjective</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
                <TabsList>
                  <TabsTrigger value="all">All Status</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                  <TabsTrigger value="disputed">Disputed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </GlassCard>

        {/* Markets Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : filteredMarkets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarkets.map((market: any, index: number) => (
              <motion.div
                key={market.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <MarketCard market={market} />
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard className="p-12 text-center">
            <p className="text-gray-400 text-lg">No markets found. Be the first to create one!</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
