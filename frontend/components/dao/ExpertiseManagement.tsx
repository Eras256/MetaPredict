'use client';

import { useState } from 'react';
import { Brain, CheckCircle, Users, Loader2, AlertCircle, Award } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useRegisterExpertise, useAttestExpertise, useExpertise } from '@/lib/hooks/dao/useDAO';
import { useActiveAccount } from 'thirdweb/react';
import { toast } from 'sonner';
import { formatAddress } from '@/lib/utils/blockchain';

export function ExpertiseManagement() {
  const account = useActiveAccount();
  const { registerExpertise, isPending: isRegistering } = useRegisterExpertise();
  const { attestExpertise, isPending: isAttesting } = useAttestExpertise();
  
  const [registerDomain, setRegisterDomain] = useState('');
  const [registerEvidence, setRegisterEvidence] = useState('');
  const [attestAddress, setAttestAddress] = useState('');
  const [attestDomain, setAttestDomain] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [searchDomain, setSearchDomain] = useState('');

  // Get expertise for searched user
  const { expertise: searchedExpertise, isLoading: isLoadingExpertise } = useExpertise(
    searchAddress || account?.address || '',
    searchDomain || ''
  );

  const handleRegister = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!registerDomain.trim()) {
      toast.error('Domain is required');
      return;
    }

    try {
      await registerExpertise(registerDomain, registerEvidence || '');
      setRegisterDomain('');
      setRegisterEvidence('');
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleAttest = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!attestAddress || !attestDomain.trim()) {
      toast.error('Expert address and domain are required');
      return;
    }

    try {
      await attestExpertise(attestAddress, attestDomain);
      setAttestAddress('');
      setAttestDomain('');
    } catch (error) {
      // Error already handled in hook
    }
  };

  // Get current user's expertise
  const { expertise: myExpertise } = useExpertise(
    account?.address || '',
    registerDomain || attestDomain || ''
  );

  return (
    <div className="space-y-6">
      <GlassCard className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-semibold">Register Your Expertise</h2>
        </div>

        {!account ? (
          <div className="p-6 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <p className="text-gray-300 mb-2">Connect your wallet to register expertise</p>
            <p className="text-sm text-gray-400">Register your expertise to get voting power boosts in domain-specific proposals</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-300 mb-2">
                Expertise Domain *
              </label>
              <Input
                id="domain"
                type="text"
                placeholder="e.g., crypto, film, sports, economics, technology"
                value={registerDomain}
                onChange={(e) => setRegisterDomain(e.target.value)}
                className="w-full"
                disabled={isRegistering}
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">Examples: crypto, film critics, sports analysts, economics, technology</p>
            </div>

            <div>
              <label htmlFor="evidence" className="block text-sm font-medium text-gray-300 mb-2">
                Evidence (Optional)
              </label>
              <Textarea
                id="evidence"
                placeholder="Provide links, credentials, or evidence of your expertise..."
                value={registerEvidence}
                onChange={(e) => setRegisterEvidence(e.target.value)}
                className="w-full min-h-[80px]"
                disabled={isRegistering}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{registerEvidence.length}/500 characters</p>
            </div>

            {myExpertise && (
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Your Status in "{myExpertise.domain}"</span>
                  {myExpertise.verified ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      Pending
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">Score:</span>
                    <span className="ml-2 text-white font-semibold">{myExpertise.score}/100</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Attestations:</span>
                    <span className="ml-2 text-white font-semibold">{myExpertise.attestations?.length || 0}/3</span>
                  </div>
                </div>
                {myExpertise.attestations && myExpertise.attestations.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    Need {3 - myExpertise.attestations.length} more attestation{3 - myExpertise.attestations.length !== 1 ? 's' : ''} for auto-verification
                  </p>
                )}
              </div>
            )}

            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <p className="text-sm text-gray-300 mb-2">
                <strong>How Expertise Works:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
                <li>Register your expertise domain to start with a base score of 50</li>
                <li>Get attested by verified experts (score ≥70) to increase your score</li>
                <li>3+ attestations automatically verify your expertise</li>
                <li>Verified expertise gives 2x voting power boost in domain-specific proposals</li>
                <li>You can only attest others if you're verified in that domain</li>
              </ul>
            </div>

            <Button
              onClick={handleRegister}
              disabled={!registerDomain.trim() || isRegistering}
              size="lg"
              className="w-full"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-5 w-5" />
                  Register Expertise
                </>
              )}
            </Button>
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-semibold">Attest Expertise</h2>
        </div>

        {!account ? (
          <div className="p-6 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <p className="text-gray-300 mb-2">Connect your wallet to attest expertise</p>
            <p className="text-sm text-gray-400">Attest other users' expertise to help build the expert network</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="attestAddress" className="block text-sm font-medium text-gray-300 mb-2">
                Expert Address *
              </label>
              <Input
                id="attestAddress"
                type="text"
                placeholder="0x..."
                value={attestAddress}
                onChange={(e) => setAttestAddress(e.target.value)}
                className="w-full font-mono"
                disabled={isAttesting}
              />
            </div>

            <div>
              <label htmlFor="attestDomain" className="block text-sm font-medium text-gray-300 mb-2">
                Domain *
              </label>
              <Input
                id="attestDomain"
                type="text"
                placeholder="e.g., crypto, film, sports"
                value={attestDomain}
                onChange={(e) => setAttestDomain(e.target.value)}
                className="w-full"
                disabled={isAttesting}
              />
            </div>

            <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-orange-300 font-semibold mb-1">Requirements</p>
                  <ul className="text-xs text-orange-200 space-y-1 list-disc list-inside">
                    <li>You must be verified in the same domain (score ≥70)</li>
                    <li>The expert must have registered expertise in that domain</li>
                    <li>Each attestation increases the expert's score by 5 points</li>
                    <li>3+ attestations automatically verify the expert</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={handleAttest}
              disabled={!attestAddress || !attestDomain.trim() || isAttesting}
              size="lg"
              className="w-full"
              variant="outline"
            >
              {isAttesting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Attesting...
                </>
              ) : (
                <>
                  <Award className="mr-2 h-5 w-5" />
                  Attest Expertise
                </>
              )}
            </Button>
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-semibold">Search Expertise</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="searchAddress" className="block text-sm font-medium text-gray-300 mb-2">
              User Address
            </label>
            <Input
              id="searchAddress"
              type="text"
              placeholder={account?.address || "0x..."}
              value={searchAddress || account?.address || ''}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="w-full font-mono"
            />
          </div>

          <div>
            <label htmlFor="searchDomain" className="block text-sm font-medium text-gray-300 mb-2">
              Domain
            </label>
            <Input
              id="searchDomain"
              type="text"
              placeholder="e.g., crypto, film, sports"
              value={searchDomain}
              onChange={(e) => setSearchDomain(e.target.value)}
              className="w-full"
            />
          </div>

          {isLoadingExpertise ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
            </div>
          ) : searchedExpertise ? (
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {formatAddress(searchAddress || account?.address || '')}
                  </p>
                  <p className="text-xs text-gray-400">Domain: {searchedExpertise.domain}</p>
                </div>
                {searchedExpertise.verified ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    Pending
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Score:</span>
                  <span className="ml-2 text-white font-semibold">{searchedExpertise.score}/100</span>
                </div>
                <div>
                  <span className="text-gray-400">Attestations:</span>
                  <span className="ml-2 text-white font-semibold">{searchedExpertise.attestations?.length || 0}</span>
                </div>
                {searchedExpertise.verifiedAt > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-400">Verified At:</span>
                    <span className="ml-2 text-white font-semibold">
                      {new Date(searchedExpertise.verifiedAt * 1000).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-500/10 rounded-lg border border-gray-500/20 text-center">
              <p className="text-sm text-gray-400">No expertise found. Enter an address and domain to search.</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

