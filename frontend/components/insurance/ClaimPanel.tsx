'use client';

import { useState } from 'react';
import { Shield, AlertCircle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInsurance } from '@/lib/hooks/insurance/useInsurance';
import { useInsuranceClaims } from '@/lib/hooks/insurance/useInsuranceClaims';
import { useActiveAccount } from 'thirdweb/react';
import { toast } from 'sonner';
import { getTransactionUrl, formatTxHash } from '@/lib/utils/blockchain';

export function ClaimPanel() {
  const account = useActiveAccount();
  const { claimInsurance, loading } = useInsurance();
  const { claims, loading: claimsLoading, refresh: refreshClaims } = useInsuranceClaims();
  const [claimingMarketId, setClaimingMarketId] = useState<number | null>(null);

  // Helper function to format BNB
  const formatBNB = (value: bigint): string => {
    const bnbValue = Number(value) / 1e18;
    return `${bnbValue.toFixed(4)} BNB`;
  };

  const handleClaim = async (marketId: number) => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setClaimingMarketId(marketId);
      const result = await claimInsurance(marketId);
      
      if (result?.transactionHash) {
        toast.success('Claim processed successfully!', {
          duration: 5000,
          action: {
            label: 'View TX',
            onClick: () => window.open(getTransactionUrl(result.transactionHash), '_blank'),
          },
        });
        // Refresh claims list after successful claim
        setTimeout(() => {
          refreshClaims();
        }, 2000);
      }
    } catch (error: any) {
      // Error is already handled in the hook
      console.error('Error in handleClaim:', error);
    } finally {
      setClaimingMarketId(null);
    }
  };

  if (claimsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!account) {
    return (
      <GlassCard className="p-12 text-center">
        <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">Connect your wallet</p>
        <p className="text-gray-500 text-sm mt-2">You need to connect your wallet to view your insurance claims</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {claims.length > 0 ? (
        claims.map((claim) => {
          const isClaiming = claimingMarketId === claim.marketId;
          const isDisabled = loading || isClaiming;

          return (
            <GlassCard key={claim.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{claim.question}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-400">Market ID:</span>
                      <span className="ml-2 text-white font-semibold">#{claim.marketId}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Invested:</span>
                      <span className="ml-2 text-white font-semibold">{formatBNB(claim.invested)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <Badge className={`ml-2 ${
                        claim.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 
                        'bg-green-500/20 text-green-400 border-green-500/30'
                      }`}>
                        {claim.status}
                      </Badge>
                    </div>
                    {claim.policyActivated && (
                      <div>
                        <span className="text-gray-400">Policy:</span>
                        <span className="ml-2 text-white font-semibold">
                          {claim.expired ? 'Expired' : 'Active'}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {claim.reason}
                  </p>
                  {claim.policyActivated && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">Policy Status</span>
                        <Badge className={
                          claim.expired 
                            ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                            : 'bg-green-500/20 text-green-400 border-green-500/30'
                        }>
                          {claim.expired ? 'Expired' : 'Active'}
                        </Badge>
                      </div>
                      {claim.policyReserve > BigInt(0) && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-400">Reserve:</span>
                            <span className="ml-1 text-white font-semibold">{formatBNB(claim.policyReserve)}</span>
                          </div>
                          {claim.policyClaimed > BigInt(0) && (
                            <div>
                              <span className="text-gray-400">Claimed:</span>
                              <span className="ml-1 text-white font-semibold">{formatBNB(claim.policyClaimed)}</span>
                            </div>
                          )}
                          {claim.expiresAt > BigInt(0) && (
                            <div className="col-span-2">
                              <span className="text-gray-400">Expires:</span>
                              <span className="ml-1 text-white font-semibold">
                                {new Date(Number(claim.expiresAt) * 1000).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  className="ml-4 min-w-[120px]"
                  onClick={() => handleClaim(claim.marketId)}
                  disabled={isDisabled || claim.status !== 'pending'}
                >
                  {isClaiming ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : claim.status === 'pending' ? (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Claim Now
                    </>
                  ) : (
                    'Already Claimed'
                  )}
                </Button>
              </div>
            </GlassCard>
          );
        })
      ) : (
        <GlassCard className="p-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No pending claims</p>
          <p className="text-gray-500 text-sm mt-2">
            {account 
              ? 'You have no disputed markets with eligible investments to claim insurance'
              : 'Connect your wallet to view your insurance claims'}
          </p>
        </GlassCard>
      )}
    </div>
  );
}

