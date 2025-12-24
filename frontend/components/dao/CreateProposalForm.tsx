'use client';

import { useState } from 'react';
import { FileText, Loader2, AlertCircle, Info } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProposal } from '@/lib/hooks/dao/useDAO';
import { useActiveAccount } from 'thirdweb/react';
import { useBNBBalance } from '@/lib/hooks/useBNBBalance';
import { toast } from 'sonner';

interface CreateProposalFormProps {
  refetchProposals: () => void;
}

export function CreateProposalForm({ refetchProposals }: CreateProposalFormProps) {
  const account = useActiveAccount();
  const { balance } = useBNBBalance();
  const { createProposal, isPending } = useCreateProposal();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bnbAmount, setBnbAmount] = useState('0.1');

  const minBNB = 0.1;
  const hasEnoughBalance = balance >= minBNB;
  const isValid = title.trim().length > 0 && description.trim().length > 0 && parseFloat(bnbAmount) >= minBNB;

  const handleCreateProposal = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!isValid) {
      toast.error('Please fill in all fields and ensure BNB amount is at least 0.1');
      return;
    }

    try {
      const amountBigInt = BigInt(Math.floor(parseFloat(bnbAmount) * 1e18));
      await createProposal(title, description, amountBigInt);
      
      // Reset form
      setTitle('');
      setDescription('');
      setBnbAmount('0.1');
      
      // Refresh proposals list
      setTimeout(() => {
        refetchProposals();
      }, 2000);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-semibold">Create Parameter Change Proposal</h2>
        </div>

        {!account ? (
          <div className="p-6 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <p className="text-gray-300 mb-2">Connect your wallet to create a proposal</p>
            <p className="text-sm text-gray-400">You need to connect your wallet to submit governance proposals</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p className="font-semibold mb-1">Parameter Change Proposals</p>
                  <p className="text-gray-400">
                    Create proposals to modify protocol parameters such as voting periods, quorum requirements, fees, and other governance settings.
                  </p>
                  <p className="text-gray-400 mt-2">
                    <strong>Note:</strong> Market Resolution, Treasury Spend, and Emergency Action proposals are initiated by the Core contract or require special permissions.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Proposal Title *
              </label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Increase voting period to 7 days"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
                disabled={isPending}
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Proposal Description *
              </label>
              <Textarea
                id="description"
                placeholder="Describe your proposal in detail. Explain what parameters you want to change, why, and the expected impact..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[120px]"
                disabled={isPending}
                maxLength={2000}
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/2000 characters</p>
            </div>

            <div>
              <label htmlFor="bnbAmount" className="block text-sm font-medium text-gray-300 mb-2">
                BNB Amount (Minimum: 0.1 BNB) *
              </label>
              <Input
                id="bnbAmount"
                type="number"
                placeholder="0.1"
                value={bnbAmount}
                onChange={(e) => setBnbAmount(e.target.value)}
                className="w-full"
                disabled={isPending}
                step="0.01"
                min={minBNB}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">Your balance: {balance.toFixed(4)} BNB</p>
                {!hasEnoughBalance && (
                  <p className="text-xs text-red-400">Insufficient balance</p>
                )}
              </div>
            </div>

            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <p className="text-sm text-gray-300 mb-2">
                <strong>Proposal Requirements:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
                <li>Minimum 0.1 BNB required to create a proposal</li>
                <li>Proposals are active immediately after creation</li>
                <li>Voting period: 3 days (configurable by governance)</li>
                <li>Minimum quorum: 1 BNB total voting power</li>
                <li>Quadratic voting applies: Your voting power = √(staked BNB)</li>
              </ul>
            </div>

            <Button
              onClick={handleCreateProposal}
              disabled={!isValid || isPending || !hasEnoughBalance}
              size="lg"
              className="w-full"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Proposal...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-5 w-5" />
                  Create Proposal ({bnbAmount} BNB)
                </>
              )}
            </Button>

            {!hasEnoughBalance && (
              <p className="text-xs text-red-400 text-center">
                You need at least {minBNB} BNB to create a proposal. Your current balance: {balance.toFixed(4)} BNB
              </p>
            )}
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Other Proposal Types</h3>
        <div className="space-y-3 text-sm text-gray-400">
          <div>
            <p className="font-semibold text-gray-300 mb-1">Market Resolution</p>
            <p>Resolve subjective markets. Automatically initiated by the Core contract when a subjective market expires.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-300 mb-1">Treasury Spend</p>
            <p>Propose spending from protocol treasury. Requires special permissions (not yet implemented).</p>
          </div>
          <div>
            <p className="font-semibold text-gray-300 mb-1">Emergency Action</p>
            <p>Emergency protocol actions (pause/unpause). Requires special permissions (not yet implemented).</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

