'use client';

import { useState } from 'react';
import { TrendingUp, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLastVerifiedPrice, usePriceCondition, useValidateMarketPrice, useMarketStreamConfig } from '@/lib/hooks/oracle/useChainlinkDataStreams';
import { Skeleton } from '@/components/ui/skeleton';

interface ChainlinkDataStreamsPanelProps {
  marketId: number;
}

export function ChainlinkDataStreamsPanel({ marketId }: ChainlinkDataStreamsPanelProps) {
  const [predictedPrice, setPredictedPrice] = useState('');
  
  const { price, timestamp, isStale, isLoading: priceLoading } = useLastVerifiedPrice(marketId);
  const { conditionMet, currentPrice, targetPrice, isLoading: conditionLoading } = usePriceCondition(marketId);
  const { streamId, targetPrice: configTargetPrice } = useMarketStreamConfig(marketId);
  const { isValid, actualPrice, difference, isLoading: validationLoading } = useValidateMarketPrice(
    marketId,
    predictedPrice ? parseFloat(predictedPrice) : 0
  );

  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold">Chainlink Data Streams</h3>
        </div>

        {priceLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="space-y-4">
            {streamId ? (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Stream ID</span>
                  <Badge className="bg-blue-500/20 text-blue-400">
                    {streamId.slice(0, 10)}...{streamId.slice(-8)}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-gray-500/10 border border-gray-500/20 text-center">
                <p className="text-xs text-gray-400">No stream configured for this market</p>
              </div>
            )}

            {price !== null ? (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Last Verified Price</span>
                  <Badge className={isStale ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                    {isStale ? (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Stale
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Fresh
                      </>
                    )}
                  </Badge>
                </div>
                <div className="text-sm font-semibold text-white mb-1">
                  ${price.toFixed(2)}
                </div>
                {timestamp && (
                  <div className="text-xs text-gray-400">
                    Updated: {new Date(timestamp * 1000).toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-gray-500/10 border border-gray-500/20 text-center">
                <p className="text-xs text-gray-400">No price data available</p>
              </div>
            )}

            {configTargetPrice !== null && (
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Target Price</span>
                  <span className="text-sm font-semibold text-white">${configTargetPrice.toFixed(2)}</span>
                </div>
                {conditionLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">Condition Met</span>
                    <Badge className={conditionMet ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                      {conditionMet ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Yes
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          No
                        </>
                      )}
                    </Badge>
                  </div>
                )}
                {currentPrice !== null && (
                  <div className="text-xs text-gray-400 mt-2">
                    Current: ${currentPrice.toFixed(2)} / Target: ${configTargetPrice.toFixed(2)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Validate Predicted Price</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Predicted Price ($)
            </label>
            <Input
              type="number"
              placeholder="100000"
              value={predictedPrice}
              onChange={(e) => setPredictedPrice(e.target.value)}
              step="0.01"
            />
          </div>

          {predictedPrice && parseFloat(predictedPrice) > 0 && (
            <div>
              {validationLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Validation Result</span>
                    <Badge className={isValid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {isValid ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Valid
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Invalid
                        </>
                      )}
                    </Badge>
                  </div>
                  {actualPrice !== null && (
                    <div className="text-xs text-gray-300 space-y-1 mt-2">
                      <div>Actual Price: ${actualPrice.toFixed(2)}</div>
                      {difference !== null && (
                        <div>Difference: ${Math.abs(difference).toFixed(2)}</div>
                      )}
                      <div className="text-gray-400 mt-1">
                        {isValid 
                          ? 'Predicted price is within 1% of actual price'
                          : 'Predicted price differs by more than 1% from actual price'}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

