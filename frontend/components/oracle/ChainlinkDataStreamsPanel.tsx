'use client';

import { useState } from 'react';
import { TrendingUp, Clock, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLastVerifiedPrice, usePriceCondition, useValidateMarketPrice, useMarketStreamConfig, useVerifyPriceReport } from '@/lib/hooks/oracle/useChainlinkDataStreams';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ChainlinkDataStreamsPanelProps {
  marketId: number;
}

export function ChainlinkDataStreamsPanel({ marketId }: ChainlinkDataStreamsPanelProps) {
  const [predictedPrice, setPredictedPrice] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Check if we're in mock mode
  const isMockMode = process.env.NEXT_PUBLIC_CHAINLINK_DATA_STREAMS_USE_MOCK === 'true' || 
                     (!process.env.NEXT_PUBLIC_CHAINLINK_DATA_STREAMS_API_KEY && 
                      !process.env.CHAINLINK_DATA_STREAMS_API_KEY);
  
  const { price, timestamp, isStale, isLoading: priceLoading } = useLastVerifiedPrice(marketId);
  const { conditionMet, currentPrice, targetPrice, isLoading: conditionLoading } = usePriceCondition(marketId);
  const { streamId, targetPrice: configTargetPrice } = useMarketStreamConfig(marketId);
  const { isValid, actualPrice, difference, isLoading: validationLoading } = useValidateMarketPrice(
    marketId,
    predictedPrice ? parseFloat(predictedPrice) : 0
  );
  const { verifyPrice, isPending: isVerifyingOnChain } = useVerifyPriceReport();

  const handleVerifyPrice = async () => {
    if (!streamId) {
      toast.error('No Stream ID configured for this market');
      return;
    }

    try {
      setIsVerifying(true);
      
      // Obtener reporte desde el backend
      const response = await axios.get(`${API_URL}/oracle/chainlink/report/${streamId}`);
      
      if (!response.data.success || !response.data.report) {
        throw new Error('Failed to fetch Chainlink report from backend');
      }

      const reportHex = response.data.report;
      
      // Verificar precio on-chain
      await verifyPrice(marketId, reportHex);
      
      // Refrescar datos (el hook debería actualizarse automáticamente)
      toast.success('Price verified successfully!');
      
      // Esperar un poco para que se actualice
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Error verifying price:', error);
      
      // Provide helpful error message
      let errorMessage = error.message || 'Failed to verify price. Please try again.';
      
      // Check if it's a transaction revert (mock reports can't be verified)
      if (errorMessage.includes('execution reverted') || errorMessage.includes('Execution Reverted')) {
        if (isMockMode) {
          errorMessage = 
            'Price verification is currently unavailable. This feature is being configured and will be available soon.';
        } else {
          errorMessage = 
            'Price report verification failed. The report may be invalid or the Stream ID may not match. ' +
            'Please ensure you are using a valid report from Chainlink Data Streams API.';
        }
      } else if (errorMessage.includes('credentials not configured')) {
        errorMessage = 
          'Chainlink Data Streams API credentials are required. ' +
          'Contact Chainlink to get your API key and secret: https://chain.link/contact?ref_id=datafeeds';
      } else if (error.response?.status === 401 || errorMessage.includes('authentication')) {
        errorMessage = 
          'Chainlink Data Streams authentication failed. ' +
          'Please verify your API_KEY and USER_SECRET are correct. ' +
          'To get credentials, contact Chainlink: https://chain.link/contact?ref_id=datafeeds';
      } else if (error.response?.status === 404 || errorMessage.includes('not found')) {
        errorMessage = 
          'Stream ID not found. Please verify the Stream ID is correct and exists on this network.';
      } else if (error.response?.status === 500) {
        errorMessage = 
          'Server error while fetching report. Please check your Chainlink Data Streams configuration.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

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
                {price === null && (
                  <>
                    {isMockMode ? (
                      <div className="mt-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-xs text-yellow-300 mb-2 font-semibold">
                          ⚠️ Price Verification Temporarily Unavailable
                        </p>
                        <p className="text-xs text-gray-300 leading-relaxed mb-2">
                          On-chain price verification is currently in testing mode. This feature requires Chainlink Data Streams integration to be fully configured.
                        </p>
                        <p className="text-xs text-gray-400">
                          Price data will be available once the Chainlink Data Streams service is activated. Market resolution will continue to work through our AI Oracle system.
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={handleVerifyPrice}
                        disabled={isVerifying || isVerifyingOnChain}
                        size="sm"
                        className="mt-2 w-full"
                        variant="outline"
                      >
                        {isVerifying || isVerifyingOnChain ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Verify Price from Chainlink
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}
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
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Last Verified Price</span>
                  <Badge className="bg-yellow-500/20 text-yellow-400">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                </div>
                <p className="text-xs text-gray-300">
                  {isMockMode 
                    ? 'Chainlink Data Streams integration is being set up. Price verification will be available soon.'
                    : 'Stream ID is configured. Price data will appear once a Chainlink Data Streams report is verified on-chain.'}
                </p>
                {!isMockMode && (
                  <p className="text-xs text-gray-400 mt-1">
                    Click "Verify Price from Chainlink" to fetch the latest price data and verify it on-chain.
                  </p>
                )}
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

