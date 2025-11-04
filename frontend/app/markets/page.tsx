'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MarketCard } from '@/components/markets/MarketCard';
import { GlassCard } from '@/components/effects/GlassCard';

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with real data from contract
  const markets = [
    {
      id: 1,
      question: 'Will Bitcoin reach $100K by end of 2025?',
      description: 'Bitcoin price prediction for end of year 2025',
      yesPool: 150000,
      noPool: 120000,
      resolutionTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
      status: 'active',
      creator: '0x123...abc'
    },
    // Add more markets...
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Prediction Markets
          </h1>
          <p className="text-gray-400 text-lg">
            Browse and participate in prediction markets powered by AI
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Markets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((market, index) => (
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

        {markets.length === 0 && (
          <GlassCard className="p-12 text-center">
            <p className="text-gray-400 text-lg">No markets found. Be the first to create one!</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

