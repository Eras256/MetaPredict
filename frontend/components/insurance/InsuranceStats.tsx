'use client';

import { Shield, TrendingUp, Users, DollarSign, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { useInsurancePool } from '@/lib/hooks/insurance/useInsurancePool';

export function InsuranceStats() {
  const { stats, apy, loading } = useInsurancePool();

  // Función helper para formatear BNB
  const formatBNB = (value: bigint | null | undefined): string => {
    if (!value || value === BigInt(0)) return '0.00';
    const bnbValue = Number(value) / 1e18;
    if (bnbValue >= 1000000) {
      return `$${(bnbValue / 1000000).toFixed(2)}M`;
    } else if (bnbValue >= 1000) {
      return `$${(bnbValue / 1000).toFixed(0)}K`;
    } else {
      return `${bnbValue.toFixed(4)}`;
    }
  };

  // Función helper para formatear porcentaje
  const formatPercentage = (value: bigint | null | undefined, decimals: number = 2): string => {
    if (!value || value === BigInt(0)) return '0.00';
    // Si viene en basis points (0-10000), dividir por 100
    const percentage = Number(value) / 100;
    return `${percentage.toFixed(decimals)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  const totalAssets = stats?.totalAssets || BigInt(0);
  const totalInsured = stats?.totalInsured || BigInt(0);
  const totalClaimed = stats?.totalClaimed || BigInt(0);
  const available = stats?.available || BigInt(0);
  const utilizationRate = stats?.utilizationRate || BigInt(0);
  const currentAPY = apy || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Shield className="h-8 w-8 text-purple-400" />
          <span className="text-2xl font-bold text-white">{formatBNB(totalAssets)}</span>
        </div>
        <p className="text-sm text-gray-400">Total Pool Assets</p>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <TrendingUp className="h-8 w-8 text-green-400" />
          <span className="text-2xl font-bold text-white">{currentAPY.toFixed(2)}%</span>
        </div>
        <p className="text-sm text-gray-400">Current APY</p>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Users className="h-8 w-8 text-blue-400" />
          <span className="text-2xl font-bold text-white">{formatPercentage(utilizationRate)}</span>
        </div>
        <p className="text-sm text-gray-400">Utilization Rate</p>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <DollarSign className="h-8 w-8 text-yellow-400" />
          <span className="text-2xl font-bold text-white">{formatBNB(totalInsured)}</span>
        </div>
        <p className="text-sm text-gray-400">Total Insured</p>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <DollarSign className="h-8 w-8 text-green-400" />
          <span className="text-2xl font-bold text-white">{formatBNB(available)}</span>
        </div>
        <p className="text-sm text-gray-400">Available for Claims</p>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <DollarSign className="h-8 w-8 text-red-400" />
          <span className="text-2xl font-bold text-white">{formatBNB(totalClaimed)}</span>
        </div>
        <p className="text-sm text-gray-400">Total Claimed</p>
      </GlassCard>
    </div>
  );
}

