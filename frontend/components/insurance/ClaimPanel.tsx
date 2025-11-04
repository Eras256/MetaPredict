'use client';

import { Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Button } from '@/components/ui/button';

export function ClaimPanel() {
  // Mock data - replace with real data from contract
  const claims = [
    {
      id: 1,
      marketId: 1,
      question: 'Will Bitcoin reach $100K by end of 2025?',
      amount: 100,
      status: 'pending',
      reason: 'Oracle confidence below 80%'
    },
    // Add more claims...
  ];

  return (
    <div className="space-y-4">
      {claims.length > 0 ? (
        claims.map((claim) => (
          <GlassCard key={claim.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{claim.question}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-400">Market ID:</span>
                    <span className="ml-2 text-white font-semibold">#{claim.marketId}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Amount:</span>
                    <span className="ml-2 text-white font-semibold">${claim.amount}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className={`ml-2 font-semibold capitalize ${
                      claim.status === 'pending' ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  {claim.reason}
                </p>
              </div>
              <Button variant="outline" className="ml-4">
                {claim.status === 'pending' ? 'Claim Now' : 'View Details'}
              </Button>
            </div>
          </GlassCard>
        ))
      ) : (
        <GlassCard className="p-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No pending claims</p>
          <p className="text-gray-500 text-sm mt-2">All your positions are protected</p>
        </GlassCard>
      )}
    </div>
  );
}

