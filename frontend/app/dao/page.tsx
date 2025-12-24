'use client';

// Force dynamic rendering to avoid SSG issues with contract addresses
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProposal, useVoteOnProposal, useUserProposals, useExecuteProposal, useAllProposals } from '@/lib/hooks/dao/useDAO';
import { Vote, CheckCircle, XCircle, Clock, TrendingUp, Users, Brain, Loader2, RefreshCw, ExternalLink, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { analyzeDAOProposal } from '@/lib/services/ai/gemini';
import { toast } from 'sonner';
import { formatModelName } from '@/lib/utils/model-formatter';
import { formatAddress } from '@/lib/utils/blockchain';
import { useActiveAccount } from 'thirdweb/react';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';

export default function DAOPage() {
  const account = useActiveAccount();
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);
  const [voteSupport, setVoteSupport] = useState<0 | 1 | 2>(1);
  const { proposalIds, isLoading: userProposalsLoading } = useUserProposals();
  const { proposals: allProposals, isLoading: allProposalsLoading, refetch: refetchProposals } = useAllProposals();
  const { vote, isPending: isVoting } = useVoteOnProposal();
  const { execute, isPending: isExecuting } = useExecuteProposal();
  const [analyzing, setAnalyzing] = useState<number | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<number, any>>({});

  // Filter active and resolved proposals
  const activeProposals = allProposals.filter((p) => p.status === 1); // Active = 1
  const resolvedProposals = allProposals.filter((p) => p.status !== 1 && p.status !== 0); // All others except Pending
  const proposalsLoading = allProposalsLoading;

  // Listen to vote events to refresh
  useEffect(() => {
    const handleVote = () => {
      // Wait a bit to ensure the block has been mined
      setTimeout(() => {
        refetchProposals();
      }, 3000);
    };

    window.addEventListener('proposal-voted', handleVote);
    return () => window.removeEventListener('proposal-voted', handleVote);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVote = async (proposalId: number, support: 0 | 1 | 2) => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    try {
      // Proposal state validation is done in useVoteOnProposal hook
      await vote(proposalId, support, '');
      // Refresh proposals after successful vote
      setTimeout(() => {
        refetchProposals();
      }, 4000);
    } catch (error) {
      // Error is already handled and shows a toast in the hook
      console.error('Error in handleVote:', error);
    }
  };

  const handleExecute = async (proposalId: number) => {
    await execute(proposalId);
  };

  const handleAnalyzeProposal = async (proposal: any) => {
    setAnalyzing(proposal.id);
    try {
      // Get proposer reputation from contract
      let proposerReputation = 0;
      try {
        const { readContract } = await import('thirdweb');
        const { getContract } = await import('thirdweb');
        const { defineChain } = await import('thirdweb/chains');
        const opBNBTestnet = defineChain({
          id: 5611,
          name: 'opBNB Testnet',
          nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
          rpc: 'https://opbnb-testnet-rpc.bnbchain.org',
        });
        
        const reputationContract = getContract({
          client: (await import('@/lib/config/thirdweb')).client,
          chain: opBNBTestnet,
          address: (await import('@/lib/contracts/addresses')).CONTRACT_ADDRESSES.REPUTATION_STAKING as `0x${string}`,
          abi: [
            {
              name: 'getStaker',
              type: 'function',
              stateMutability: 'view',
              inputs: [{ name: '_user', type: 'address' }],
              outputs: [
                { name: 'stakedAmount', type: 'uint256' },
                { name: 'reputationScore', type: 'uint256' },
                { name: 'tier', type: 'uint8' },
                { name: 'correctVotes', type: 'uint256' },
                { name: 'totalVotes', type: 'uint256' },
                { name: 'slashedAmount', type: 'uint256' },
              ],
            },
          ] as any,
        });
        
        const stakerData = await readContract({
          contract: reputationContract,
          method: 'getStaker',
          params: [proposal.proposer],
        }) as any;
        
        proposerReputation = stakerData?.[1] ? Number(stakerData[1]) : 0;
      } catch (error) {
        console.warn('Could not fetch proposer reputation:', error);
        // If we can't fetch, use 0 instead of a hardcoded value
        proposerReputation = 0;
      }
      
      const proposalData = {
        title: proposal.title,
        description: proposal.description,
        type: proposal.type,
        proposerReputation, // Real reputation from contract
      };

      const result = await analyzeDAOProposal(proposalData);
      if (result.success && result.data) {
        setAnalysisResults({ ...analysisResults, [proposal.id]: result.data });
        toast.success(`Analysis completed with ${formatModelName(result.modelUsed)}`);
      } else {
        toast.error(result.error || 'Error analyzing proposal');
      }
    } catch (error: any) {
      toast.error('Error analyzing proposal');
      console.error(error);
    } finally {
      setAnalyzing(null);
    }
  };

  return (
    <div className="min-h-screen text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              DAO Governance
            </h1>
            <p className="text-gray-400 text-lg">
              Participate in protocol governance with quadratic voting and expertise validation
            </p>
            <div className="mt-2">
              <a
                href={`https://testnet.opbnbscan.com/address/${CONTRACT_ADDRESSES.DAO_GOVERNANCE}#readContract`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                View contract on opBNBScan
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <Button
            onClick={() => refetchProposals()}
            disabled={proposalsLoading}
            variant="outline"
            size="sm"
            className="ml-4"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${proposalsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Proposals</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="create">Create Proposal</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {proposalsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : activeProposals.length > 0 ? (
              activeProposals.map((proposal) => {
                const totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
                const forPercentage = totalVotes > 0 ? (proposal.forVotes / totalVotes) * 100 : 0;
                const againstPercentage = totalVotes > 0 ? (proposal.againstVotes / totalVotes) * 100 : 0;
                const abstainPercentage = totalVotes > 0 ? (proposal.abstainVotes / totalVotes) * 100 : 0;

                const analysis = analysisResults[proposal.id];
                const isUserProposal = proposal.proposer.toLowerCase() === account?.address?.toLowerCase();

                return (
                  <GlassCard key={proposal.id} className="p-6 sm:p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <Badge variant="outline" className="text-xs sm:text-sm">
                            {proposal.type}
                          </Badge>
                          <Badge className={
                            proposal.status === 1 ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                            proposal.status === 2 ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                            proposal.status === 3 ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                            'bg-gray-500/20 text-gray-300 border-gray-500/30'
                          }>
                            {proposal.statusLabel}
                          </Badge>
                          {isUserProposal && (
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                              Your Proposal
                            </Badge>
                          )}
                          <Button
                            onClick={() => handleAnalyzeProposal(proposal)}
                            disabled={analyzing === proposal.id}
                            size="sm"
                            variant="outline"
                            className="ml-auto"
                          >
                            {analyzing === proposal.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Brain className="mr-2 h-4 w-4" />
                                Analyze with AI
                              </>
                            )}
                          </Button>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-semibold mb-2">{proposal.title || `Proposal #${proposal.id}`}</h3>
                        <p className="text-gray-400 mb-4 text-sm sm:text-base">{proposal.description || 'No description provided.'}</p>
                        
                        {/* Proposer Info */}
                        <div className="flex items-center gap-2 mb-4 text-xs sm:text-sm text-gray-500">
                          <User className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Proposed by:</span>
                          <a
                            href={`https://testnet.opbnbscan.com/address/${proposal.proposer}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                          >
                            {formatAddress(proposal.proposer)}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        {/* AI Analysis Results */}
                        {analysis && (
                          <div className="mb-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold flex items-center gap-2 text-purple-400">
                                <Brain className="h-4 w-4" />
                                AI Analysis
                              </h4>
                              <div className="flex items-center gap-2">
                                <Badge className={
                                  analysis.recommendation === 'approve' ? 'bg-green-500/20 text-green-400' :
                                  analysis.recommendation === 'reject' ? 'bg-red-500/20 text-red-400' :
                                  'bg-yellow-500/20 text-yellow-400'
                                }>
                                  {analysis.recommendation === 'approve' ? 'Approve' :
                                   analysis.recommendation === 'reject' ? 'Reject' : 'Modify'}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  Score: {analysis.qualityScore}/100
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-300 mb-3">{analysis.reasoning}</p>
                            {analysis.suggestedAmendments && analysis.suggestedAmendments.length > 0 && (
                              <div>
                                <p className="text-xs text-gray-400 mb-2">Suggested amendments:</p>
                                <ul className="list-disc list-inside space-y-1 text-xs text-gray-300">
                                  {analysis.suggestedAmendments.map((amendment: string, idx: number) => (
                                    <li key={idx}>{amendment}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">For</span>
                          <span className="text-sm font-semibold">
                            {proposal.forVotes > 0 
                              ? `${proposal.forVotes.toLocaleString()} votes` 
                              : '0 votes'}
                          </span>
                        </div>
                        <Progress value={forPercentage} className="h-2" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Against</span>
                          <span className="text-sm font-semibold">
                            {proposal.againstVotes > 0 
                              ? `${proposal.againstVotes.toLocaleString()} votes` 
                              : '0 votes'}
                          </span>
                        </div>
                        <Progress value={againstPercentage} className="h-2" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Abstain</span>
                          <span className="text-sm font-semibold">
                            {proposal.abstainVotes > 0 
                              ? `${proposal.abstainVotes.toLocaleString()} votes` 
                              : '0 votes'}
                          </span>
                        </div>
                        <Progress value={abstainPercentage} className="h-2" />
                      </div>

                      {totalVotes > 0 && (
                        <div className="text-xs text-gray-500 mt-2">
                          Total voting power: {totalVotes.toLocaleString()} votes (quadratic)
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => {
                          setSelectedProposal(proposal.id);
                          handleVote(proposal.id, 1);
                        }}
                        disabled={isVoting || !account}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Vote For
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedProposal(proposal.id);
                          handleVote(proposal.id, 0);
                        }}
                        disabled={isVoting || !account}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Vote Against
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedProposal(proposal.id);
                          handleVote(proposal.id, 2);
                        }}
                        disabled={isVoting || !account}
                        variant="outline"
                        className="flex-1"
                      >
                        <Vote className="w-4 h-4 mr-2" />
                        Abstain
                      </Button>
                    </div>
                    
                    {!account && (
                      <p className="text-xs text-yellow-400 mt-2 text-center">
                        Connect your wallet to vote on proposals
                      </p>
                    )}
                  </GlassCard>
                );
              })
            ) : (
              <GlassCard className="p-12 text-center">
                <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No Active Proposals</p>
                <p className="text-gray-500 text-sm mt-2">
                  Active proposals will appear here when they are available for voting
                </p>
                <p className="text-gray-500 text-xs mt-4">
                  Create a new proposal to start governance participation
                </p>
              </GlassCard>
            )}
          </TabsContent>

          <TabsContent value="resolved">
            {proposalsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : resolvedProposals.length > 0 ? (
              resolvedProposals.map((proposal) => {
                const totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
                const forPercentage = totalVotes > 0 ? (proposal.forVotes / totalVotes) * 100 : 0;
                const againstPercentage = totalVotes > 0 ? (proposal.againstVotes / totalVotes) * 100 : 0;
                const abstainPercentage = totalVotes > 0 ? (proposal.abstainVotes / totalVotes) * 100 : 0;

                return (
                  <GlassCard key={proposal.id} className="p-6 sm:p-8 mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <Badge variant="outline" className="text-xs sm:text-sm">
                            {proposal.type}
                          </Badge>
                          <Badge className={
                            proposal.status === 2 ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                            proposal.status === 3 ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                            proposal.status === 4 ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                            'bg-gray-500/20 text-gray-300 border-gray-500/30'
                          }>
                            {proposal.statusLabel}
                          </Badge>
                          {proposal.executed && (
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                              Executed
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-semibold mb-2">{proposal.title || `Proposal #${proposal.id}`}</h3>
                        <p className="text-gray-400 mb-4 text-sm sm:text-base">{proposal.description || 'No description provided.'}</p>
                        
                        {/* Proposer Info */}
                        <div className="flex items-center gap-2 mb-4 text-xs sm:text-sm text-gray-500">
                          <User className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Proposed by:</span>
                          <a
                            href={`https://testnet.opbnbscan.com/address/${proposal.proposer}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                          >
                            {formatAddress(proposal.proposer)}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">For</span>
                          <span className="text-sm font-semibold">
                            {proposal.forVotes > 0 
                              ? `${proposal.forVotes.toLocaleString()} votes` 
                              : '0 votes'}
                          </span>
                        </div>
                        <Progress value={forPercentage} className="h-2" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Against</span>
                          <span className="text-sm font-semibold">
                            {proposal.againstVotes > 0 
                              ? `${proposal.againstVotes.toLocaleString()} votes` 
                              : '0 votes'}
                          </span>
                        </div>
                        <Progress value={againstPercentage} className="h-2" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Abstain</span>
                          <span className="text-sm font-semibold">
                            {proposal.abstainVotes > 0 
                              ? `${proposal.abstainVotes.toLocaleString()} votes` 
                              : '0 votes'}
                          </span>
                        </div>
                        <Progress value={abstainPercentage} className="h-2" />
                      </div>

                      {totalVotes > 0 && (
                        <div className="text-xs text-gray-500 mt-2">
                          Total voting power: {totalVotes.toLocaleString()} votes (quadratic)
                        </div>
                      )}
                    </div>

                    {proposal.status === 2 && !proposal.executed && (
                      <Button
                        onClick={() => handleExecute(proposal.id)}
                        disabled={isExecuting || !account}
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        {isExecuting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Executing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Execute Proposal
                          </>
                        )}
                      </Button>
                    )}
                  </GlassCard>
                );
              })
            ) : (
              <GlassCard className="p-12 text-center">
                <TrendingUp className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No Resolved Proposals</p>
                <p className="text-gray-500 text-sm mt-2">
                  Resolved proposals will appear here once voting periods end
                </p>
              </GlassCard>
            )}
          </TabsContent>

          <TabsContent value="create">
            <GlassCard className="p-8">
              <h2 className="text-2xl font-semibold mb-6">Create Proposal</h2>
              <p className="text-gray-400 mb-4">
                Create a new governance proposal. Requires a minimum of 0.1 BNB to create a parameter change proposal.
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Proposal types:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-400 mb-6">
                <li><strong>Parameter Change:</strong> Modify protocol parameters (requires 0.1 BNB)</li>
                <li><strong>Market Resolution:</strong> Resolve subjective markets (initiated by Core contract)</li>
                <li><strong>Treasury Spend:</strong> Propose spending from treasury</li>
                <li><strong>Emergency Action:</strong> Emergency protocol actions</li>
              </ul>
              <Button disabled className="w-full sm:w-auto">
                Coming Soon
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                Proposal creation interface will be available soon. For now, proposals can be created directly through the smart contract.
              </p>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

