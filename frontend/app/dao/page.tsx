'use client';

// Force dynamic rendering to avoid SSG issues with contract addresses
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProposal, useVoteOnProposal, useUserProposals, useExecuteProposal } from '@/lib/hooks/dao/useDAO';
import { Vote, CheckCircle, XCircle, Clock, TrendingUp, Users, Brain, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { analyzeDAOProposal } from '@/lib/services/ai/gemini';
import { toast } from 'sonner';

export default function DAOPage() {
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);
  const [voteSupport, setVoteSupport] = useState<0 | 1 | 2>(1);
  const { proposalIds, isLoading: proposalsLoading } = useUserProposals();
  const { vote, isPending: isVoting } = useVoteOnProposal();
  const { execute, isPending: isExecuting } = useExecuteProposal();
  const [analyzing, setAnalyzing] = useState<number | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<number, any>>({});

  // Mock proposals - in production, fetch from contract
  const proposals = [
    {
      id: 1,
      title: 'Resolve Market #123: Will Bitcoin reach $100K?',
      description: 'Vote on the resolution of market #123',
      type: 'MarketResolution',
      forVotes: 1500,
      againstVotes: 800,
      abstainVotes: 200,
      status: 'Active',
      endTime: Date.now() + 2 * 24 * 60 * 60 * 1000,
    },
  ];

  const handleVote = async (proposalId: number) => {
    await vote(proposalId, voteSupport, '');
  };

  const handleExecute = async (proposalId: number) => {
    await execute(proposalId);
  };

  const handleAnalyzeProposal = async (proposal: any) => {
    setAnalyzing(proposal.id);
    try {
      const proposalData = {
        title: proposal.title,
        description: proposal.description,
        type: proposal.type,
        proposerReputation: 75, // TODO: obtener del contrato
      };

      const result = await analyzeDAOProposal(proposalData);
      if (result.success && result.data) {
        setAnalysisResults({ ...analysisResults, [proposal.id]: result.data });
        toast.success(`Analysis completed with ${result.modelUsed}`);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            DAO Governance
          </h1>
          <p className="text-gray-400 text-lg">
            Participate in protocol governance with quadratic voting and expertise validation
          </p>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Proposals</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="create">Create Proposal</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {proposalsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : proposals.length > 0 ? (
              proposals.map((proposal) => {
                const totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
                const forPercentage = totalVotes > 0 ? (proposal.forVotes / totalVotes) * 100 : 0;
                const againstPercentage = totalVotes > 0 ? (proposal.againstVotes / totalVotes) * 100 : 0;

                const analysis = analysisResults[proposal.id];

                return (
                  <GlassCard key={proposal.id} className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline">{proposal.type}</Badge>
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                            {proposal.status}
                          </Badge>
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
                        <h3 className="text-2xl font-semibold mb-2">{proposal.title}</h3>
                        <p className="text-gray-400 mb-4">{proposal.description}</p>

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
                          <span className="text-sm font-semibold">{proposal.forVotes.toLocaleString()} votes</span>
                        </div>
                        <Progress value={forPercentage} className="h-2" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Against</span>
                          <span className="text-sm font-semibold">{proposal.againstVotes.toLocaleString()} votes</span>
                        </div>
                        <Progress value={againstPercentage} className="h-2" />
                      </div>

                      <div className="text-sm text-gray-400">
                        Abstain: {proposal.abstainVotes.toLocaleString()} votes
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={() => {
                          setSelectedProposal(proposal.id);
                          setVoteSupport(1);
                          handleVote(proposal.id);
                        }}
                        disabled={isVoting}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Vote For
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedProposal(proposal.id);
                          setVoteSupport(0);
                          handleVote(proposal.id);
                        }}
                        disabled={isVoting}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Vote Against
                      </Button>
                      {proposal.status === 'Succeeded' && (
                        <Button
                          onClick={() => handleExecute(proposal.id)}
                          disabled={isExecuting}
                          variant="outline"
                        >
                          Execute
                        </Button>
                      )}
                    </div>
                  </GlassCard>
                );
              })
            ) : (
              <GlassCard className="p-12 text-center">
                <p className="text-gray-400 text-lg">No active proposals</p>
              </GlassCard>
            )}
          </TabsContent>

          <TabsContent value="resolved">
            <GlassCard className="p-12 text-center">
              <p className="text-gray-400 text-lg">Resolved proposals will appear here</p>
            </GlassCard>
          </TabsContent>

          <TabsContent value="create">
            <GlassCard className="p-8">
              <h2 className="text-2xl font-semibold mb-6">Create Proposal</h2>
              <p className="text-gray-400 mb-4">
                Create a new governance proposal. Requires 100+ governance tokens to propose.
              </p>
              <Button disabled>Coming Soon</Button>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

