'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, FileText, Sparkles, Loader2, TrendingUp, Brain, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/effects/GlassCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { suggestMarketCreation, analyzeMarket } from '@/lib/services/ai/gemini';
import { toast } from 'sonner';
import { formatModelName } from '@/lib/utils/model-formatter';
import { useActiveAccount } from 'thirdweb/react';
import {
  useCreateBinaryMarket,
  useCreateConditionalMarket,
  useCreateSubjectiveMarket,
} from '@/lib/hooks/markets/useCreateMarket';
import { readContract } from 'thirdweb';
import { getContract } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import PREDICTION_MARKET_CORE_ABI from '@/lib/contracts/abi/PredictionMarketCore.json';
import { client } from '@/lib/config/thirdweb';

export default function CreateMarketPage() {
  const account = useActiveAccount();
  
  // Hooks para crear mercados
  const { createMarket: createBinary, isPending: isCreatingBinary } = useCreateBinaryMarket();
  const { createMarket: createConditional, isPending: isCreatingConditional } = useCreateConditionalMarket();
  const { createMarket: createSubjective, isPending: isCreatingSubjective } = useCreateSubjectiveMarket();

  // Binary Market
  const [binaryQuestion, setBinaryQuestion] = useState('');
  const [binaryDescription, setBinaryDescription] = useState('');
  const [binaryResolutionTime, setBinaryResolutionTime] = useState('');
  const [binaryMetadata, setBinaryMetadata] = useState('');

  // Conditional Market
  const [conditionalParentId, setConditionalParentId] = useState('');
  const [conditionalCondition, setConditionalCondition] = useState('');
  const [conditionalQuestion, setConditionalQuestion] = useState('');
  const [conditionalResolutionTime, setConditionalResolutionTime] = useState('');
  const [conditionalMetadata, setConditionalMetadata] = useState('');

  // Subjective Market
  const [subjectiveQuestion, setSubjectiveQuestion] = useState('');
  const [subjectiveDescription, setSubjectiveDescription] = useState('');
  const [subjectiveResolutionTime, setSubjectiveResolutionTime] = useState('');
  const [subjectiveExpertise, setSubjectiveExpertise] = useState('');
  const [subjectiveMetadata, setSubjectiveMetadata] = useState('');

  // AI Features
  const [suggestions, setSuggestions] = useState<Array<{ question: string; description: string; category: string }>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [validating, setValidating] = useState(false);

  const handleGetSuggestions = async (question: string) => {
    if (!question.trim()) {
      toast.error('Please enter a topic first to generate suggestions');
      return;
    }

    setLoadingSuggestions(true);
    try {
      const result = await suggestMarketCreation(question);
      if (result.success && result.data) {
        setSuggestions(result.data.suggestions);
        toast.success(`Generated ${result.data.suggestions.length} suggestions with ${formatModelName(result.modelUsed)}`);
      } else {
        toast.error(result.error || 'Error generating suggestions');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error generating suggestions';
      if (errorMessage.includes('GEMINI_API_KEY')) {
        toast.error('⚠️ Gemini API Key not configured. Check your .env.local file');
      } else {
        toast.error(errorMessage);
      }
      console.error('[Create Market] Error:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleValidateQuestion = async (question: string, description: string) => {
    if (!question.trim()) {
      toast.error('Please enter a question first');
      return;
    }

    setValidating(true);
    try {
      const result = await analyzeMarket(question, description);
      if (result.success && result.data) {
        if (result.data.answer === 'INVALID') {
          toast.warning(`Invalid question: ${result.data.reasoning}`);
        } else {
          toast.success(`Valid question (Confidence: ${result.data.confidence}%)`);
        }
      } else {
        toast.error(result.error || 'Error validating question');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error validating question';
      if (errorMessage.includes('GEMINI_API_KEY')) {
        toast.error('⚠️ Gemini API Key not configured. Check your .env.local file');
      } else {
        toast.error(errorMessage);
      }
      console.error('[Create Market] Error:', error);
    } finally {
      setValidating(false);
    }
  };

  const handleUseSuggestion = (suggestion: { question: string; description: string }, marketType: 'binary' | 'conditional' | 'subjective') => {
    if (marketType === 'binary') {
      setBinaryQuestion(suggestion.question);
      setBinaryDescription(suggestion.description);
    } else if (marketType === 'conditional') {
      setConditionalQuestion(suggestion.question);
    } else {
      setSubjectiveQuestion(suggestion.question);
      setSubjectiveDescription(suggestion.description);
    }
    setSuggestions([]);
    toast.success('Suggestion applied');
  };

  const handleCreateBinary = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!binaryQuestion || !binaryDescription || !binaryResolutionTime) {
      toast.error('Please complete all required fields');
      return;
    }
    try {
      const resolutionTimestamp = Math.floor(new Date(binaryResolutionTime).getTime() / 1000);
      await createBinary(binaryQuestion, binaryDescription, resolutionTimestamp, binaryMetadata);
      setBinaryQuestion('');
      setBinaryDescription('');
      setBinaryResolutionTime('');
      setBinaryMetadata('');
      toast.success('Binary market created successfully!');
      // El evento 'marketCreated' se emite desde el hook, que refrescará automáticamente
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleCreateConditional = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!conditionalParentId || !conditionalCondition || !conditionalQuestion || !conditionalResolutionTime) {
      toast.error('Please complete all required fields');
      return;
    }

    const parentId = parseInt(conditionalParentId);
    if (isNaN(parentId) || parentId <= 0) {
      toast.error('Parent market ID must be a valid number greater than 0');
      return;
    }

    // Verificar que el mercado padre existe
    try {
      const opBNBTestnet = defineChain({
        id: 5611,
        name: 'opBNB Testnet',
        nativeCurrency: {
          name: 'tBNB',
          symbol: 'tBNB',
          decimals: 18,
        },
        rpc: 'https://opbnb-testnet-rpc.bnbchain.org',
      });

      const contract = getContract({
        client,
        chain: opBNBTestnet,
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_CORE_ABI as any,
      });

      const parentMarket = await readContract({
        contract,
        method: 'getMarket',
        params: [BigInt(parentId)],
      });

      // Verificar que el mercado existe (id != 0)
      if (!parentMarket || Number(parentMarket.id) === 0) {
        toast.error(`Parent market (ID: ${parentId}) does not exist. Please verify that the ID is correct.`);
        return;
      }

      // Verificar que el tiempo de resolución es posterior al del mercado padre
      const parentResolutionTime = Number(parentMarket.resolutionTime);
      const resolutionTimestamp = Math.floor(new Date(conditionalResolutionTime).getTime() / 1000);
      
      if (resolutionTimestamp <= parentResolutionTime) {
        toast.error(`Resolution time must be after the parent market's resolution time (${new Date(parentResolutionTime * 1000).toLocaleString()}).`);
        return;
      }

    } catch (error: any) {
      console.error('Error verificando mercado padre:', error);
      // Si hay error al leer el mercado, probablemente no existe
      toast.error(`Could not verify parent market (ID: ${parentId}). Make sure the ID is correct and the market exists.`);
      return;
    }

    try {
      const resolutionTimestamp = Math.floor(new Date(conditionalResolutionTime).getTime() / 1000);
      await createConditional(
        parentId,
        conditionalCondition,
        conditionalQuestion,
        resolutionTimestamp,
        conditionalMetadata
      );
      setConditionalParentId('');
      setConditionalCondition('');
      setConditionalQuestion('');
      setConditionalResolutionTime('');
      setConditionalMetadata('');
      toast.success('Conditional market created successfully!');
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleCreateSubjective = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!subjectiveQuestion || !subjectiveDescription || !subjectiveResolutionTime || !subjectiveExpertise) {
      toast.error('Please complete all required fields');
      return;
    }
    try {
      const resolutionTimestamp = Math.floor(new Date(subjectiveResolutionTime).getTime() / 1000);
      await createSubjective(
        subjectiveQuestion,
        subjectiveDescription,
        resolutionTimestamp,
        subjectiveExpertise,
        subjectiveMetadata
      );
      setSubjectiveQuestion('');
      setSubjectiveDescription('');
      setSubjectiveResolutionTime('');
      setSubjectiveExpertise('');
      setSubjectiveMetadata('');
      toast.success('Subjective market created successfully!');
    } catch (error) {
      // Error already handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Create Market
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">
            Create a new prediction market on any future event
          </p>
        </motion.div>

        <Tabs defaultValue="binary" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 h-auto">
            <TabsTrigger value="binary" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Binary</span>
              <span className="sm:hidden">Bin</span>
            </TabsTrigger>
            <TabsTrigger value="conditional" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Conditional</span>
              <span className="sm:hidden">Cond</span>
            </TabsTrigger>
            <TabsTrigger value="subjective" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Subjective</span>
              <span className="sm:hidden">Subj</span>
            </TabsTrigger>
          </TabsList>

          {/* Binary Market Tab */}
          <TabsContent value="binary">
            <GlassCard className="p-4 sm:p-6 md:p-8">
              <CardHeader className="p-0 pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-xl">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  Create Binary Market
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">Simple yes/no predictions. Perfect for straightforward questions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-0">
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2 sm:gap-0">
                    <label className="block text-xs sm:text-sm font-medium text-gray-300">Question *</label>
                    <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleValidateQuestion(binaryQuestion, binaryDescription)}
                        disabled={validating || !binaryQuestion.trim()}
                        className="text-xs sm:text-sm flex-1 sm:flex-initial"
                      >
                        {validating ? (
                          <>
                            <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                            <span className="hidden sm:inline">Validating...</span>
                            <span className="sm:hidden">Validating</span>
                          </>
                        ) : (
                          <>
                            <span className="hidden sm:inline">Validate with AI</span>
                            <span className="sm:hidden">Validate</span>
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleGetSuggestions(binaryQuestion)}
                        disabled={loadingSuggestions || !binaryQuestion.trim()}
                        className="text-xs sm:text-sm flex-1 sm:flex-initial"
                      >
                        {loadingSuggestions ? (
                          <>
                            <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                            <span className="hidden sm:inline">Generating...</span>
                            <span className="sm:hidden">Generating</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">AI Suggestions</span>
                            <span className="sm:hidden">AI</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <Input
                    type="text"
                    placeholder="e.g., Will Bitcoin reach $100K by end of 2025?"
                    value={binaryQuestion}
                    onChange={(e) => setBinaryQuestion(e.target.value)}
                    className="w-full"
                  />
                </div>

                {suggestions.length > 0 && (
                  <GlassCard className="p-3 sm:p-4 border-purple-500/20">
                    <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
                      AI Suggestions
                    </h4>
                    <div className="space-y-1.5 sm:space-y-2">
                      {suggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 sm:p-3 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors cursor-pointer"
                          onClick={() => handleUseSuggestion(suggestion, 'binary')}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-white mb-1 break-words">{suggestion.question}</p>
                              <p className="text-xs text-gray-400 line-clamp-2">{suggestion.description}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUseSuggestion(suggestion, 'binary');
                              }}
                              className="flex-shrink-0 text-xs"
                            >
                              Use
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Description *</label>
                  <textarea
                    rows={4}
                    placeholder="Provide detailed context about the market..."
                    value={binaryDescription}
                    onChange={(e) => setBinaryDescription(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Resolution Time *</label>
                  <Input
                    type="datetime-local"
                    value={binaryResolutionTime}
                    onChange={(e) => setBinaryResolutionTime(e.target.value)}
                    className="w-full text-xs sm:text-base"
                  />
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">Must be at least 1 hour in the future</p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Metadata (IPFS Hash)</label>
                  <Input
                    type="text"
                    placeholder="Optional: IPFS hash for additional context"
                    value={binaryMetadata}
                    onChange={(e) => setBinaryMetadata(e.target.value)}
                    className="w-full text-xs sm:text-base"
                  />
                </div>

                <Button
                  onClick={handleCreateBinary}
                  disabled={isCreatingBinary || !account}
                  size="lg"
                  className="w-full text-sm sm:text-base"
                >
                  {isCreatingBinary ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Create Binary Market
                    </>
                  )}
                </Button>
              </CardContent>
            </GlassCard>
          </TabsContent>

          {/* Conditional Market Tab */}
          <TabsContent value="conditional">
            <GlassCard className="p-4 sm:p-6 md:p-8">
              <CardHeader className="p-0 pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-xl">
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  Create Conditional Market
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">If-then predictions with parent-child relationships.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-0">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Parent Market ID *</label>
                  <Input
                    type="number"
                    placeholder="e.g., 1"
                    value={conditionalParentId}
                    onChange={(e) => setConditionalParentId(e.target.value)}
                    className="w-full text-xs sm:text-base"
                  />
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">ID of the parent market this depends on</p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Condition *</label>
                  <Input
                    type="text"
                    placeholder="e.g., if YES on parent"
                    value={conditionalCondition}
                    onChange={(e) => setConditionalCondition(e.target.value)}
                    className="w-full text-xs sm:text-base"
                  />
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">Condition that must be met for this market to be active</p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Question *</label>
                  <Input
                    type="text"
                    placeholder="e.g., Will ETH reach $10K?"
                    value={conditionalQuestion}
                    onChange={(e) => setConditionalQuestion(e.target.value)}
                    className="w-full text-xs sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Resolution Time *</label>
                  <Input
                    type="datetime-local"
                    value={conditionalResolutionTime}
                    onChange={(e) => setConditionalResolutionTime(e.target.value)}
                    className="w-full text-xs sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Metadata (IPFS Hash)</label>
                  <Input
                    type="text"
                    placeholder="Optional: IPFS hash for additional context"
                    value={conditionalMetadata}
                    onChange={(e) => setConditionalMetadata(e.target.value)}
                    className="w-full text-xs sm:text-base"
                  />
                </div>

                <Button
                  onClick={handleCreateConditional}
                  disabled={isCreatingConditional || !account}
                  size="lg"
                  className="w-full text-sm sm:text-base"
                >
                  {isCreatingConditional ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Create Conditional Market
                    </>
                  )}
                </Button>
              </CardContent>
            </GlassCard>
          </TabsContent>

          {/* Subjective Market Tab */}
          <TabsContent value="subjective">
            <GlassCard className="p-4 sm:p-6 md:p-8">
              <CardHeader className="p-0 pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-xl">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  Create Subjective Market
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">DAO-governed markets with quadratic voting.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-0">
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2 sm:gap-0">
                    <label className="block text-xs sm:text-sm font-medium text-gray-300">Question *</label>
                    <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleValidateQuestion(subjectiveQuestion, subjectiveDescription)}
                        disabled={validating || !subjectiveQuestion.trim()}
                        className="text-xs sm:text-sm flex-1 sm:flex-initial"
                      >
                        {validating ? (
                          <>
                            <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                            <span className="hidden sm:inline">Validating...</span>
                            <span className="sm:hidden">Validating</span>
                          </>
                        ) : (
                          <>
                            <span className="hidden sm:inline">Validate with AI</span>
                            <span className="sm:hidden">Validate</span>
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleGetSuggestions(subjectiveQuestion)}
                        disabled={loadingSuggestions || !subjectiveQuestion.trim()}
                        className="text-xs sm:text-sm flex-1 sm:flex-initial"
                      >
                        {loadingSuggestions ? (
                          <>
                            <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                            <span className="hidden sm:inline">Generating...</span>
                            <span className="sm:hidden">Generating</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">AI Suggestions</span>
                            <span className="sm:hidden">AI</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <Input
                    type="text"
                    placeholder="e.g., Which DeFi protocol will have the most TVL in 2026?"
                    value={subjectiveQuestion}
                    onChange={(e) => setSubjectiveQuestion(e.target.value)}
                    className="w-full"
                  />
                </div>

                {suggestions.length > 0 && (
                  <GlassCard className="p-3 sm:p-4 border-purple-500/20">
                    <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
                      AI Suggestions
                    </h4>
                    <div className="space-y-1.5 sm:space-y-2">
                      {suggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 sm:p-3 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors cursor-pointer"
                          onClick={() => handleUseSuggestion(suggestion, 'subjective')}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-white mb-1 break-words">{suggestion.question}</p>
                              <p className="text-xs text-gray-400 line-clamp-2">{suggestion.description}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUseSuggestion(suggestion, 'subjective');
                              }}
                              className="flex-shrink-0 text-xs"
                            >
                              Use
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Description *</label>
                  <textarea
                    rows={4}
                    placeholder="Provide detailed context about the market..."
                    value={subjectiveDescription}
                    onChange={(e) => setSubjectiveDescription(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Resolution Time *</label>
                  <Input
                    type="datetime-local"
                    value={subjectiveResolutionTime}
                    onChange={(e) => setSubjectiveResolutionTime(e.target.value)}
                    className="w-full text-xs sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Expertise Required *</label>
                  <Input
                    type="text"
                    placeholder="e.g., film critics, financial analysts"
                    value={subjectiveExpertise}
                    onChange={(e) => setSubjectiveExpertise(e.target.value)}
                    className="w-full text-xs sm:text-base"
                  />
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">Type of expertise needed to resolve this market</p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Metadata (IPFS Hash)</label>
                  <Input
                    type="text"
                    placeholder="Optional: IPFS hash for additional context"
                    value={subjectiveMetadata}
                    onChange={(e) => setSubjectiveMetadata(e.target.value)}
                    className="w-full text-xs sm:text-base"
                  />
                </div>

                <Button
                  onClick={handleCreateSubjective}
                  disabled={isCreatingSubjective || !account}
                  size="lg"
                  className="w-full text-sm sm:text-base"
                >
                  {isCreatingSubjective ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Create Subjective Market
                    </>
                  )}
                </Button>
              </CardContent>
            </GlassCard>
          </TabsContent>
        </Tabs>

        {/* Info */}
        <GlassCard className="p-4 sm:p-5 md:p-6 mt-4 sm:mt-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Market Creation Guidelines</h3>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
            <li>• Questions must be clear and unambiguous</li>
            <li>• Resolution time must be between 1 hour and 365 days</li>
            <li>• Market creation fee: 0.1 BNB</li>
            <li>• All markets are permissionless and transparent</li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}

