'use client';

import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  Target,
  CheckCircle2,
  Clock,
  DollarSign,
  BarChart3,
  RefreshCw,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/effects/GlassCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserDashboard } from '@/lib/hooks/dashboard/useUserDashboard';
import { useBNBBalance } from '@/lib/hooks/useBNBBalance';
import { useReputation } from '@/lib/hooks/reputation/useReputation';
import { useClaimWinnings } from '@/lib/hooks/betting/usePlaceBet';
import Link from 'next/link';
import { formatAddress } from '@/lib/utils/blockchain';
import { MARKET_STATUS } from '@/lib/config/constants';
import { toast } from 'sonner';

export default function DashboardPage() {
  const account = useActiveAccount();
  const { balance } = useBNBBalance();
  const { stakedAmount, reputationScore, tier } = useReputation();
  const { userMarkets, userPositions, stats, loading, refresh } = useUserDashboard();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const ClaimButton = ({ marketId }: { marketId: number }) => {
    const { claim, isPending } = useClaimWinnings(marketId);
    
    const handleClaim = async () => {
      if (!account) {
        toast.error('Por favor, conecta tu wallet primero');
        return;
      }
      
      try {
        await claim();
        // Refrescar datos después de reclamar
        setTimeout(() => {
          refresh();
        }, 2000);
      } catch (error) {
        // Error ya manejado por el hook
      }
    };
    
    return (
      <Button
        onClick={handleClaim}
        disabled={isPending}
        className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
      >
        {isPending ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Reclamando...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Reclamar
          </>
        )}
      </Button>
    );
  };

  const tierNames = ['Novice', 'Expert', 'Oracle', 'Legend'];
  const tierColors = ['gray', 'blue', 'purple', 'gold'];

  if (!account) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <GlassCard className="p-12 text-center">
            <LayoutDashboard className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Conecta tu Wallet</h2>
            <p className="text-gray-400">
              Por favor, conecta tu wallet para ver tu dashboard personal
            </p>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Mi Dashboard
              </h1>
              <p className="text-gray-400">
                Gestiona tus mercados, apuestas y estadísticas
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Wallet className="w-4 h-4" />
            <span>{formatAddress(account.address)}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Balance BNB</p>
                <div className="text-2xl font-bold text-white">
                  {loading ? <Skeleton className="h-8 w-24" /> : `${balance.toFixed(4)} BNB`}
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Mercados Creados</p>
                <div className="text-2xl font-bold text-white">
                  {loading ? <Skeleton className="h-8 w-24" /> : stats.totalMarketsCreated}
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Apuestas Totales</p>
                <div className="text-2xl font-bold text-white">
                  {loading ? <Skeleton className="h-8 w-24" /> : stats.totalBetsPlaced}
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Invertido</p>
                <div className="text-2xl font-bold text-white">
                  {loading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    `${stats.totalInvested.toFixed(4)} BNB`
                  )}
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Estadísticas
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Posiciones Activas</span>
                <span className="text-lg font-semibold text-white">
                  {loading ? <Skeleton className="h-6 w-12" /> : stats.activePositions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Posiciones Resueltas</span>
                <span className="text-lg font-semibold text-white">
                  {loading ? <Skeleton className="h-6 w-12" /> : stats.resolvedPositions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Ganancias Potenciales</span>
                <span className="text-lg font-semibold text-green-400">
                  {loading ? (
                    <Skeleton className="h-6 w-20" />
                  ) : (
                    `${stats.totalPotentialWinnings.toFixed(4)} BNB`
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Ganancias Reclamadas</span>
                <span className="text-lg font-semibold text-green-400">
                  {loading ? <Skeleton className="h-6 w-12" /> : stats.claimedWinnings}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-400" />
                Reputación
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Tier</span>
                <Badge variant="outline" className="text-purple-300">
                  {tierNames[tier] || 'N/A'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Puntuación</span>
                <span className="text-lg font-semibold text-white">{reputationScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Staked</span>
                <span className="text-sm text-white">{stakedAmount.toFixed(4)} BNB</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                Acciones Rápidas
              </h3>
            </div>
            <div className="space-y-2">
              <Link href="/create">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Crear Mercado
                </Button>
              </Link>
              <Link href="/markets">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Explorar Mercados
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Wallet className="w-4 h-4" />
                  Ver Portfolio
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>

        {/* Tabs for Markets and Positions */}
        <Tabs defaultValue="markets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="markets" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Mis Mercados ({userMarkets.length})
            </TabsTrigger>
            <TabsTrigger value="positions" className="gap-2">
              <Target className="w-4 h-4" />
              Mis Apuestas ({userPositions.length})
            </TabsTrigger>
          </TabsList>

          {/* My Markets Tab */}
          <TabsContent value="markets">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            ) : userMarkets.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userMarkets.map((market) => (
                  <GlassCard key={market.id} className="p-6 hover:border-purple-500/30 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                          {market.question}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                          {market.description}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Estado</span>
                        <Badge
                          variant="outline"
                          className={
                            market.status === MARKET_STATUS.ACTIVE
                              ? 'border-green-500/30 text-green-400'
                              : market.status === MARKET_STATUS.RESOLVED
                              ? 'border-blue-500/30 text-blue-400'
                              : 'border-gray-500/30 text-gray-400'
                          }
                        >
                          {market.status === MARKET_STATUS.ACTIVE
                            ? 'Activo'
                            : market.status === MARKET_STATUS.RESOLVING
                            ? 'Resolviendo'
                            : market.status === MARKET_STATUS.RESOLVED
                            ? 'Resuelto'
                            : 'Desconocido'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Volumen</span>
                        <span className="text-white">
                          {((Number(market.yesPool) + Number(market.noPool)) / 1e18).toFixed(4)} BNB
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Resolución</span>
                        <span className="text-white text-xs">
                          {new Date(market.resolutionTime * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link href={`/markets/${market.id}`}>
                      <Button variant="outline" className="w-full gap-2">
                        Ver Detalles
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard className="p-12 text-center">
                <TrendingUp className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No has creado mercados aún</h3>
                <p className="text-gray-400 mb-6">
                  Crea tu primer mercado de predicción para comenzar
                </p>
                <Link href="/create">
                  <Button className="gap-2">
                    Crear Mercado
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </GlassCard>
            )}
          </TabsContent>

          {/* My Positions Tab */}
          <TabsContent value="positions">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : userPositions.length > 0 ? (
              <div className="space-y-4">
                {userPositions.map((position) => (
                  <GlassCard key={position.marketId} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {position.market?.question || `Market #${position.marketId}`}
                          </h3>
                          <Badge
                            variant="outline"
                            className={
                              position.market?.status === MARKET_STATUS.ACTIVE
                                ? 'border-green-500/30 text-green-400'
                                : position.market?.status === MARKET_STATUS.RESOLVED
                                ? 'border-blue-500/30 text-blue-400'
                                : 'border-gray-500/30 text-gray-400'
                            }
                          >
                            {position.market?.status === MARKET_STATUS.ACTIVE
                              ? 'Activo'
                              : position.market?.status === MARKET_STATUS.RESOLVED
                              ? 'Resuelto'
                              : 'Desconocido'}
                          </Badge>
                          {position.claimed && (
                            <Badge variant="outline" className="border-green-500/30 text-green-400">
                              Reclamado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-1">
                          {position.market?.description || 'Sin descripción'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">YES Shares</p>
                        <p className="text-sm font-semibold text-white">
                          {(Number(position.yesShares) / 1e18).toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">NO Shares</p>
                        <p className="text-sm font-semibold text-white">
                          {(Number(position.noShares) / 1e18).toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Total Invertido</p>
                        <p className="text-sm font-semibold text-white">
                          {(Number(position.totalInvested) / 1e18).toFixed(4)} BNB
                        </p>
                      </div>
                      {position.market?.status === MARKET_STATUS.RESOLVED && position.potentialPayout > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Ganancias</p>
                          <p className="text-sm font-semibold text-green-400">
                            {!position.claimed
                              ? `${(Number(position.potentialPayout) / 1e18).toFixed(4)} BNB`
                              : 'Reclamado'}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/markets/${position.marketId}`} className="flex-1">
                        <Button variant="outline" className="w-full gap-2">
                          Ver Mercado
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                      {position.market?.status === MARKET_STATUS.RESOLVED &&
                        position.potentialPayout > 0 &&
                        !position.claimed && (
                          <ClaimButton marketId={position.marketId} />
                        )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard className="p-12 text-center">
                <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tienes apuestas aún</h3>
                <p className="text-gray-400 mb-6">
                  Explora los mercados y haz tu primera apuesta
                </p>
                <Link href="/markets">
                  <Button className="gap-2">
                    Explorar Mercados
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </GlassCard>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

