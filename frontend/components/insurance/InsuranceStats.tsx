'use client';

import { Shield, TrendingUp, Users, DollarSign } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';

export function InsuranceStats() {
  // Mock data - replace with real data from contract
  const stats = {
    totalAssets: 1000000,
    totalInsured: 50000,
    totalClaimed: 0,
    available: 950000,
    utilizationRate: 5,
    apy: 8.5
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Shield className="h-8 w-8 text-purple-400" />
          <span className="text-2xl font-bold text-white">${(stats.totalAssets / 1000000).toFixed(2)}M</span>
        </div>
        <p className="text-sm text-gray-400">Total Pool Assets</p>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <TrendingUp className="h-8 w-8 text-green-400" />
          <span className="text-2xl font-bold text-white">{stats.apy}%</span>
        </div>
        <p className="text-sm text-gray-400">Current APY (Venus)</p>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Users className="h-8 w-8 text-blue-400" />
          <span className="text-2xl font-bold text-white">{stats.utilizationRate}%</span>
        </div>
        <p className="text-sm text-gray-400">Utilization Rate</p>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <DollarSign className="h-8 w-8 text-yellow-400" />
          <span className="text-2xl font-bold text-white">${(stats.totalInsured / 1000).toFixed(0)}K</span>
        </div>
        <p className="text-sm text-gray-400">Total Insured</p>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <DollarSign className="h-8 w-8 text-green-400" />
          <span className="text-2xl font-bold text-white">${(stats.available / 1000).toFixed(0)}K</span>
        </div>
        <p className="text-sm text-gray-400">Available for Claims</p>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <DollarSign className="h-8 w-8 text-red-400" />
          <span className="text-2xl font-bold text-white">${(stats.totalClaimed / 1000).toFixed(0)}K</span>
        </div>
        <p className="text-sm text-gray-400">Total Claimed</p>
      </GlassCard>
    </div>
  );
}

