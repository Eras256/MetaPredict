'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Calendar, BarChart3, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { venusService } from '@/lib/services/venusService';

interface HistoricalData {
  timestamp: number;
  supplyApy: number;
  borrowApy: number;
  totalSupply: string;
  totalBorrows: string;
  utilizationRate: number;
}

export function YieldHistoryPanel() {
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const fetchHistoricalData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get vUSDC address (primary yield source for Insurance Pool)
      let vTokenAddress: string | null = null;
      
      try {
        const apyData = await venusService.getInsurancePoolAPY();
        if (apyData.vUSDCAddress && apyData.vUSDCAddress.trim() !== '') {
          vTokenAddress = apyData.vUSDCAddress;
        }
      } catch (err) {
        console.warn('Could not get vUSDC from APY data:', err);
      }

      // Fallback: Try to get vUSDC from markets directly
      if (!vTokenAddress) {
        try {
          const markets = await venusService.getMarkets();
          const vUSDC = markets.find(
            (m) => m.underlyingSymbol === "USDC" || m.symbol === "vUSDC" || m.symbol.includes("USDC")
          );
          
          if (vUSDC) {
            vTokenAddress = vUSDC.address;
          } else if (markets.length > 0) {
            // Use the market with highest APY as fallback
            const bestMarket = markets.reduce((best, current) => 
              (current.supplyApy || 0) > (best.supplyApy || 0) ? current : best
            );
            vTokenAddress = bestMarket.address;
            console.log('Using fallback market for yield history:', bestMarket.symbol);
          }
        } catch (err) {
          console.warn('Could not get markets for fallback:', err);
        }
      }

      if (!vTokenAddress) {
        setError('Venus Protocol markets are not available. Please ensure the backend service is running and Venus API is accessible.');
        setHistoricalData([]);
        return;
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const data = await venusService.getHistoricalAPY(
        vTokenAddress,
        startDate,
        endDate
      );

      setHistoricalData(data);
    } catch (err: any) {
      console.error('Error fetching yield history:', err);
      const errorMessage = err.message || 'Failed to load yield history';
      
      // Provide more helpful error messages
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        setError('Network error: Unable to connect to Venus Protocol API. Please check your connection and try again.');
      } else if (errorMessage.includes('timeout')) {
        setError('Request timeout: Venus Protocol API is taking too long to respond. Please try again later.');
      } else {
        setError(`Unable to load yield history: ${errorMessage}`);
      }
      
      setHistoricalData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalData();
  }, [timeRange]);

  // Calculate statistics
  const stats = historicalData.length > 0 ? {
    avgAPY: historicalData.reduce((sum, d) => sum + d.supplyApy, 0) / historicalData.length,
    maxAPY: Math.max(...historicalData.map(d => d.supplyApy)),
    minAPY: Math.min(...historicalData.map(d => d.supplyApy)),
    currentAPY: historicalData[historicalData.length - 1]?.supplyApy || 0,
  } : null;

  // Simple chart data preparation
  const chartData = historicalData.slice(-20).map((d, index) => ({
    x: index,
    apy: d.supplyApy,
    date: new Date(d.timestamp),
  }));

  const maxAPY = chartData.length > 0 ? Math.max(...chartData.map(d => d.apy)) : 1;
  const minAPY = chartData.length > 0 ? Math.min(...chartData.map(d => d.apy)) : 0;
  const range = maxAPY - minAPY || 1;

  return (
    <GlassCard className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
          <h3 className="text-base sm:text-lg font-semibold">Yield History</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 sm:gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <Button
            onClick={fetchHistoricalData}
            disabled={loading}
            variant="ghost"
            size="sm"
            className="w-auto"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error ? (
        <div className="text-center py-6 sm:py-8">
          <BarChart3 className="w-8 h-8 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-2 sm:mb-3" />
          <p className="text-xs sm:text-sm text-gray-400 mb-2">Unable to load yield history</p>
          <p className="text-xs text-gray-500 mb-3 sm:mb-4 px-4 max-w-md mx-auto leading-relaxed">{error}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <Button onClick={fetchHistoricalData} variant="outline" size="sm" className="w-full sm:w-auto">
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Retry
            </Button>
            <p className="text-xs text-gray-600 mt-2 sm:mt-0">
              This feature requires Venus Protocol API access
            </p>
          </div>
        </div>
      ) : historicalData.length === 0 ? (
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400 mb-2">No historical data available</p>
          <p className="text-xs text-gray-500">Historical data will appear here once available</p>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-xs text-gray-400 mb-1">Current APY</div>
              <div className="text-lg sm:text-xl font-bold text-green-400">
                {stats?.currentAPY.toFixed(2)}%
              </div>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-xs text-gray-400 mb-1">Average APY</div>
              <div className="text-lg sm:text-xl font-bold text-blue-400">
                {stats?.avgAPY.toFixed(2)}%
              </div>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="text-xs text-gray-400 mb-1">Max APY</div>
              <div className="text-lg sm:text-xl font-bold text-purple-400">
                {stats?.maxAPY.toFixed(2)}%
              </div>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="text-xs text-gray-400 mb-1">Min APY</div>
              <div className="text-lg sm:text-xl font-bold text-yellow-400">
                {stats?.minAPY.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Simple Chart */}
          <div className="mb-4 sm:mb-6">
            <div className="p-4 sm:p-6 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h4 className="text-sm sm:text-base font-semibold text-white">APY Trend</h4>
                <span className="text-xs text-gray-400">
                  {chartData.length} data points
                </span>
              </div>
              
              {chartData.length > 0 ? (
                <div className="relative h-48 sm:h-64 w-full overflow-x-auto">
                  <svg 
                    className="w-full h-full min-w-full" 
                    viewBox={`0 0 ${Math.max(chartData.length * 20, 400)} 200`} 
                    preserveAspectRatio="none"
                  >
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map((percent) => (
                      <line
                        key={percent}
                        x1="0"
                        y1={percent * 2}
                        x2={chartData.length * 20}
                        y2={percent * 2}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                      />
                    ))}
                    
                    {/* APY Line */}
                    <polyline
                      points={chartData.map((d, i) => 
                        `${i * 20},${200 - ((d.apy - minAPY) / range) * 180}`
                      ).join(' ')}
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                    />
                    
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    
                    {/* Area fill */}
                    <polygon
                      points={`0,200 ${chartData.map((d, i) => 
                        `${i * 20},${200 - ((d.apy - minAPY) / range) * 180}`
                      ).join(' ')} ${chartData.length * 20},200`}
                      fill="url(#gradient)"
                      opacity="0.2"
                    />
                  </svg>
                  
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2 pointer-events-none">
                    <span className="bg-black/50 px-1 rounded">{maxAPY.toFixed(2)}%</span>
                    <span className="bg-black/50 px-1 rounded">{((maxAPY + minAPY) / 2).toFixed(2)}%</span>
                    <span className="bg-black/50 px-1 rounded">{minAPY.toFixed(2)}%</span>
                  </div>
                  
                  {/* X-axis info */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-2 pb-1">
                    <span>{chartData[0]?.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>{chartData[chartData.length - 1]?.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              ) : (
                <div className="h-48 sm:h-64 flex items-center justify-center text-gray-500 text-sm">
                  No chart data available
                </div>
              )}
            </div>
          </div>

          {/* Recent Data Table */}
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="text-xs sm:text-sm font-semibold text-gray-400 mb-2 px-1">
                Recent Data Points
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {historicalData.slice(-10).reverse().map((data, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-300 truncate">
                        {new Date(data.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-xs sm:text-sm font-semibold text-green-400">
                          {data.supplyApy.toFixed(2)}%
                        </div>
                        <div className="text-xs text-gray-500">APY</div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className="text-xs sm:text-sm font-semibold text-white">
                          {data.utilizationRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Utilization</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </GlassCard>
  );
}

