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

  // Función helper para formatear BNB
  const formatBNB = (value: bigint): string => {
    const bnbValue = Number(value) / 1e18;
    return `${bnbValue.toFixed(4)} BNB`;
  };

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
        // Refrescar la lista de claims después de un reclamo exitoso
        setTimeout(() => {
          refreshClaims();
        }, 2000);
      }
    } catch (error: any) {
      // El error ya se maneja en el hook
      console.error('Error en handleClaim:', error);
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
        <p className="text-gray-400 text-lg">Conecta tu wallet</p>
        <p className="text-gray-500 text-sm mt-2">Necesitas conectar tu wallet para ver tus reclamos de seguro</p>
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
                      <span className="text-gray-400">Invertido:</span>
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
                        <span className="text-gray-400">Póliza:</span>
                        <span className="ml-2 text-white font-semibold">
                          {claim.expired ? 'Expirada' : 'Activa'}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {claim.reason}
                  </p>
                  {claim.policyActivated && claim.policyReserve > BigInt(0) && (
                    <p className="text-xs text-gray-500 mt-2">
                      Reserva de póliza: {formatBNB(claim.policyReserve)}
                    </p>
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
                      Procesando...
                    </>
                  ) : claim.status === 'pending' ? (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Claim Now
                    </>
                  ) : (
                    'Ya Reclamado'
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
          <p className="text-gray-500 text-sm mt-2">
            {account 
              ? 'No tienes mercados disputados con inversiones elegibles para reclamar seguro'
              : 'Conecta tu wallet para ver tus reclamos de seguro'}
          </p>
        </GlassCard>
      )}
    </div>
  );
}

