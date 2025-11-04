'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Button } from '@/components/ui/button';

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<'positions' | 'history' | 'claims'>('positions');

  // Mock data - replace with real data from contract
  const positions = [
    {
      id: 1,
      question: 'Will Bitcoin reach $100K by end of 2025?',
      yesShares: 100,
      noShares: 0,
      totalValue: 150,
      status: 'active'
    },
    // Add more positions...
  ];

  const stats = {
    totalValue: 150,
    activePositions: 1,
    totalWinnings: 0,
    pendingClaims: 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Portfolio
          </h1>
          <p className="text-gray-400 text-lg">
            Manage your positions and claims
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Value', value: `$${stats.totalValue}`, icon: Wallet },
            { label: 'Active Positions', value: stats.activePositions.toString(), icon: TrendingUp },
            { label: 'Total Winnings', value: `$${stats.totalWinnings}`, icon: CheckCircle },
            { label: 'Pending Claims', value: stats.pendingClaims.toString(), icon: Clock },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="h-5 w-5 text-purple-400" />
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'positions', label: 'Active Positions' },
            { id: 'history', label: 'History' },
            { id: 'claims', label: 'Claims' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'positions' && (
            positions.length > 0 ? (
              positions.map((position) => (
                <GlassCard key={position.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{position.question}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">YES Shares:</span>
                          <span className="ml-2 text-white font-semibold">{position.yesShares}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">NO Shares:</span>
                          <span className="ml-2 text-white font-semibold">{position.noShares}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Total Value:</span>
                          <span className="ml-2 text-white font-semibold">${position.totalValue}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Status:</span>
                          <span className="ml-2 text-green-400 font-semibold capitalize">{position.status}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline">View Market</Button>
                  </div>
                </GlassCard>
              ))
            ) : (
              <GlassCard className="p-12 text-center">
                <p className="text-gray-400 text-lg">No active positions</p>
              </GlassCard>
            )
          )}

          {activeTab === 'history' && (
            <GlassCard className="p-12 text-center">
              <p className="text-gray-400 text-lg">No history yet</p>
            </GlassCard>
          )}

          {activeTab === 'claims' && (
            <GlassCard className="p-12 text-center">
              <p className="text-gray-400 text-lg">No pending claims</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

