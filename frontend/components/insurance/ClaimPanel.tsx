'use client';

import { useState } from 'react';
import { Shield, AlertCircle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInsurance } from '@/lib/hooks/insurance/useInsurance';
import { useActiveAccount } from 'thirdweb/react';
import { toast } from 'sonner';
import { getTransactionUrl, formatTxHash } from '@/lib/utils/blockchain';

export function ClaimPanel() {
  const account = useActiveAccount();
  const { claimInsurance, loading } = useInsurance();
  const [claimingMarketId, setClaimingMarketId] = useState<number | null>(null);

  // Mercados disponibles para reclamar seguro (mercados en estado Disputed)
  // En producción, estos deberían obtenerse del contrato
  const claims = [
    {
      id: 1,
      marketId: 1,
      question: 'Will Bitcoin reach $100K by end of 2025?',
      amount: 100,
      status: 'pending',
      reason: 'Oracle confidence below 80%',
      invested: 0.1, // BNB invertido
    },
    {
      id: 2,
      marketId: 2,
      question: 'Will Ethereum reach $5,000 by Q2 2025?',
      amount: 250,
      status: 'pending',
      reason: 'Oracle timeout - no resolution received',
      invested: 0.25,
    },
    {
      id: 3,
      marketId: 3,
      question: 'Will the S&P 500 close above 6,000 by end of 2025?',
      amount: 150,
      status: 'pending',
      reason: 'Oracle confidence below 80%',
      invested: 0.15,
    },
    {
      id: 4,
      marketId: 4,
      question: 'Will Tesla stock reach $300 by end of 2025?',
      amount: 200,
      status: 'pending',
      reason: 'Oracle data inconsistency detected',
      invested: 0.2,
    },
    {
      id: 5,
      marketId: 5,
      question: 'Will gold price exceed $2,500 per ounce by end of 2025?',
      amount: 180,
      status: 'pending',
      reason: 'Oracle confidence below 80%',
      invested: 0.18,
    },
    {
      id: 6,
      marketId: 6,
      question: 'Will the Fed cut rates by more than 1% in 2025?',
      amount: 120,
      status: 'pending',
      reason: 'Oracle timeout - no resolution received',
      invested: 0.12,
    },
  ];

  const handleClaim = async (marketId: number) => {
    if (!account) {
      toast.error('Por favor conecta tu wallet primero');
      return;
    }

    try {
      setClaimingMarketId(marketId);
      const result = await claimInsurance(marketId);
      
      if (result?.transactionHash) {
        toast.success('Reclamo procesado exitosamente!', {
          duration: 5000,
          action: {
            label: 'Ver TX',
            onClick: () => window.open(getTransactionUrl(result.transactionHash), '_blank'),
          },
        });
      }
    } catch (error: any) {
      // El error ya se maneja en el hook
      console.error('Error en handleClaim:', error);
    } finally {
      setClaimingMarketId(null);
    }
  };

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
                      <span className="text-gray-400">Amount:</span>
                      <span className="ml-2 text-white font-semibold">${claim.amount}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Invertido:</span>
                      <span className="ml-2 text-white font-semibold">{claim.invested} BNB</span>
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
                  </div>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {claim.reason}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="ml-4 min-w-[120px]"
                  onClick={() => handleClaim(claim.marketId)}
                  disabled={isDisabled}
                >
                  {isClaiming ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : claim.status === 'pending' ? (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Claim Now
                    </>
                  ) : (
                    'View Details'
                  )}
                </Button>
              </div>
            </GlassCard>
          );
        })
      ) : (
        <GlassCard className="p-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No hay reclamos pendientes</p>
          <p className="text-gray-500 text-sm mt-2">Todas tus posiciones están protegidas</p>
        </GlassCard>
      )}
    </div>
  );
}

