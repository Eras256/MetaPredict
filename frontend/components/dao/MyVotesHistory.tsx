'use client';

import { useState, useEffect } from 'react';
import { Vote, CheckCircle, XCircle, Clock, Loader2, ExternalLink } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Badge } from '@/components/ui/badge';
import { useUserVotesList, useUserVote, useProposal } from '@/lib/hooks/dao/useDAO';
import { useActiveAccount } from 'thirdweb/react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatAddress } from '@/lib/utils/blockchain';

export function MyVotesHistory() {
  const account = useActiveAccount();
  const { proposalIds, isLoading } = useUserVotesList();
  const [votesData, setVotesData] = useState<any[]>([]);
  const [loadingVotes, setLoadingVotes] = useState(true);

  useEffect(() => {
    if (!account || !proposalIds || proposalIds.length === 0) {
      setVotesData([]);
      setLoadingVotes(false);
      return;
    }

    const fetchVotes = async () => {
      setLoadingVotes(true);
      try {
        const votes = await Promise.all(
          proposalIds.map(async (proposalId: bigint) => {
            const id = Number(proposalId);
            // We'll fetch the vote data using the hook
            return { proposalId: id };
          })
        );
        setVotesData(votes);
      } catch (error) {
        console.error('Error fetching votes:', error);
        setVotesData([]);
      } finally {
        setLoadingVotes(false);
      }
    };

    fetchVotes();
  }, [account, proposalIds]);

  if (!account) {
    return (
      <GlassCard className="p-12 text-center">
        <Vote className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">
          Please connect your wallet to view your voting history
        </p>
      </GlassCard>
    );
  }

  if (isLoading || loadingVotes) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (proposalIds.length === 0) {
    return (
      <GlassCard className="p-12 text-center">
        <Vote className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Votes Yet</h2>
        <p className="text-gray-400">
          You haven't voted on any proposals yet. Start participating in governance!
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Vote className="w-6 h-6 text-purple-400" />
            My Voting History
          </h2>
          <Badge>{proposalIds.length} {proposalIds.length === 1 ? 'Vote' : 'Votes'}</Badge>
        </div>
        <p className="text-sm text-gray-400">
          View all proposals you've voted on and your voting decisions
        </p>
      </GlassCard>

      {proposalIds.map((proposalId: bigint) => {
        const id = Number(proposalId);
        return <VoteCard key={id} proposalId={id} />;
      })}
    </div>
  );
}

function VoteCard({ proposalId }: { proposalId: number }) {
  const account = useActiveAccount();
  const { proposal, isLoading: proposalLoading } = useProposal(proposalId);
  const { vote, isLoading: voteLoading } = useUserVote(proposalId);

  if (proposalLoading || voteLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (!proposal || !vote || !vote.hasVoted) {
    return null;
  }

  const supportLabels = {
    0: 'Against',
    1: 'For',
    2: 'Abstain',
  };

  const supportColors = {
    0: 'bg-red-500/20 text-red-400 border-red-500/30',
    1: 'bg-green-500/20 text-green-400 border-green-500/30',
    2: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  const supportIcons = {
    0: XCircle,
    1: CheckCircle,
    2: Clock,
  };

  const SupportIcon = supportIcons[vote.support as keyof typeof supportIcons];

  return (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold">
              Proposal #{proposalId}
            </h3>
            <Badge className={supportColors[vote.support as keyof typeof supportColors]}>
              <SupportIcon className="w-3 h-3 mr-1" />
              {supportLabels[vote.support as keyof typeof supportLabels]}
            </Badge>
            {vote.isExpert && (
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <span className="mr-1">🧠</span>
                Expert Boost
              </Badge>
            )}
          </div>
          {proposal.title && (
            <p className="text-sm text-gray-400 mb-2">{proposal.title}</p>
          )}
          {proposal.description && (
            <p className="text-xs text-gray-500 line-clamp-2">{proposal.description}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
        <div>
          <p className="text-xs text-gray-400">Voting Power</p>
          <p className="text-sm font-semibold text-white">{vote.votes.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Quadratic Votes</p>
          <p className="text-sm font-semibold text-white">{vote.quadraticVotes.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Status</p>
          <Badge className={
            proposal.status === 1 ? 'bg-green-500/20 text-green-400' :
            proposal.status === 2 ? 'bg-blue-500/20 text-blue-400' :
            proposal.status === 3 ? 'bg-red-500/20 text-red-400' :
            'bg-gray-500/20 text-gray-400'
          }>
            {proposal.status === 1 ? 'Active' :
             proposal.status === 2 ? 'Succeeded' :
             proposal.status === 3 ? 'Defeated' :
             'Pending'}
          </Badge>
        </div>
        <div>
          <p className="text-xs text-gray-400">Result</p>
          <p className="text-sm font-semibold text-white">
            {proposal.forVotes > proposal.againstVotes ? 'Won' :
             proposal.againstVotes > proposal.forVotes ? 'Lost' :
             'Tied'}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <a
          href={`https://testnet.opbnbscan.com/address/${account?.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
        >
          View on opBNBScan
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </GlassCard>
  );
}

