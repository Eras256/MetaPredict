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
import { AutoRefreshBanner } from '@/components/common/AutoRefreshBanner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp as StreamIcon } from 'lucide-react';
import { useConfigureMarketStream } from '@/lib/hooks/oracle/useChainlinkDataStreams';

// Real Chainlink Data Stream IDs from https://data.chain.link/streams
const STREAM_IDS = {
  BTC_USD: '0x00039d9e45394f473ab1f050a1b963e6b05351e52d71e507509ada0c95ed75b8',
  ETH_USD: '0x000362205e10b3a147d02792eccee483dca6c7b44ecce7012cb8c6e0b68b3ae9',
  USDT_USD: '0x0003a910a43485e0685ff5d6d366541f5c21150f0634c5b14254392d1a1c06db',
  BNB_USD: '0x000335fd3f3ffa06cfd9297b97367f77145d7a5f132e84c736cc471dd98621fe',
  SOL_USD: '0x0003b778d3f6b2ac4991302b89cb313f99a42467d6c9c5f96f57c29c0d2bc24f',
  USDC_USD: '0x00038f83323b6b08116d1614cf33a9bd71ab5e0abf0c9f1b783a74a43e7bd992',
  XRP_USD: '0x0003c16c6aed42294f5cb4741f6e59ba2d728f0eae2eb9e6d3f555808c59fc45',
  DOGE_USD: '0x000356ca64d3b32135e17dc0dc721a645bf50d0303be8ceb2cdca0a50bab8fdc',
} as const;

// Available Chainlink Data Streams options
// Users can select a common stream or enter a custom Stream ID
const STREAM_ID_PRESETS = [
  { value: '', label: 'None (No Chainlink Data Streams)', streamId: '' },
  { value: 'BTC_USD', label: 'BTC/USD', streamId: STREAM_IDS.BTC_USD },
  { value: 'ETH_USD', label: 'ETH/USD', streamId: STREAM_IDS.ETH_USD },
  { value: 'BNB_USD', label: 'BNB/USD', streamId: STREAM_IDS.BNB_USD },
  { value: 'SOL_USD', label: 'SOL/USD', streamId: STREAM_IDS.SOL_USD },
  { value: 'USDC_USD', label: 'USDC/USD', streamId: STREAM_IDS.USDC_USD },
  { value: 'USDT_USD', label: 'USDT/USD', streamId: STREAM_IDS.USDT_USD },
  { value: 'XRP_USD', label: 'XRP/USD', streamId: STREAM_IDS.XRP_USD },
  { value: 'DOGE_USD', label: 'DOGE/USD', streamId: STREAM_IDS.DOGE_USD },
  { value: 'custom', label: 'Custom Stream ID', streamId: '' },
] as const;

export default function CreateMarketPage() {
  const account = useActiveAccount();
  
  // Hooks para crear mercados
  const { createMarket: createBinary, isPending: isCreatingBinary } = useCreateBinaryMarket();
  const { createMarket: createConditional, isPending: isCreatingConditional } = useCreateConditionalMarket();
  const { createMarket: createSubjective, isPending: isCreatingSubjective } = useCreateSubjectiveMarket();
  const { configureStream, isPending: isConfiguringStream } = useConfigureMarketStream();

  // Binary Market
  const [binaryQuestion, setBinaryQuestion] = useState('');
  const [binaryDescription, setBinaryDescription] = useState('');
  const [binaryResolutionTime, setBinaryResolutionTime] = useState('');
  const [binaryMetadata, setBinaryMetadata] = useState('');
  const [binaryStreamIdPreset, setBinaryStreamIdPreset] = useState('');
  const [binaryStreamIdCustom, setBinaryStreamIdCustom] = useState('');
  const [binaryTargetPrice, setBinaryTargetPrice] = useState('');

  // Conditional Market
  const [conditionalParentId, setConditionalParentId] = useState('');
  const [conditionalCondition, setConditionalCondition] = useState('');
  const [conditionalQuestion, setConditionalQuestion] = useState('');
  const [conditionalResolutionTime, setConditionalResolutionTime] = useState('');
  const [conditionalMetadata, setConditionalMetadata] = useState('');
  const [conditionalStreamIdPreset, setConditionalStreamIdPreset] = useState('');
  const [conditionalStreamIdCustom, setConditionalStreamIdCustom] = useState('');
  const [conditionalTargetPrice, setConditionalTargetPrice] = useState('');

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
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const minResolutionTime = currentTimestamp + 3600 + 300; // 1 hora + 5 minutos buffer
      
      if (resolutionTimestamp < minResolutionTime) {
        const minDate = new Date(minResolutionTime * 1000);
        toast.error(`Resolution time must be at least 1 hour 5 minutes in the future. Minimum time: ${minDate.toLocaleString()}`);
        return;
      }
      
      const result = await createBinary(binaryQuestion, binaryDescription, resolutionTimestamp, binaryMetadata);
      
      // Try to configure Stream ID if provided (either preset or custom)
      const targetPriceValue = binaryTargetPrice ? parseFloat(binaryTargetPrice) : undefined;
      let streamIdToUse: string | null = null;

      // Determine which Stream ID to use
      if (binaryStreamIdCustom && binaryStreamIdCustom.trim() !== '') {
        // Use custom Stream ID if provided
        streamIdToUse = binaryStreamIdCustom.trim();
      } else if (binaryStreamIdPreset && binaryStreamIdPreset !== '' && binaryStreamIdPreset !== 'none' && binaryStreamIdPreset !== 'custom') {
        // Use preset Stream ID
        const preset = STREAM_ID_PRESETS.find(p => p.value === binaryStreamIdPreset);
        if (preset && preset.streamId) {
          streamIdToUse = preset.streamId;
        }
      }

      if (result.marketId && streamIdToUse) {
        try {
          await configureStream(result.marketId, streamIdToUse, targetPriceValue);
          toast.success('Stream ID configured successfully!');
        } catch (error: any) {
          // If configuration fails (e.g., user is not owner), show informative message
          console.error('Failed to configure Stream ID:', error);
          toast.warning(`Market created successfully, but Stream ID could not be configured: ${error.message}. Please contact admin to configure it.`);
        }
      }

      setBinaryQuestion('');
      setBinaryDescription('');
      setBinaryResolutionTime('');
      setBinaryMetadata('');
      setBinaryStreamIdPreset('');
      setBinaryStreamIdCustom('');
      setBinaryTargetPrice('');
      
      // The 'marketCreated' event is emitted from the hook, which will automatically refresh
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

    // Verify that parent market exists
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
      
      // Validar que el tiempo sea al menos 1 hora + buffer desde ahora
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const minResolutionTime = currentTimestamp + 3600 + 300; // 1 hora + 5 minutos buffer
      
      if (resolutionTimestamp < minResolutionTime) {
        const minDate = new Date(minResolutionTime * 1000);
        toast.error(`Resolution time must be at least 1 hour 5 minutes in the future. Minimum time: ${minDate.toLocaleString()}`);
        return;
      }
      
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
      const result = await createConditional(
        parentId,
        conditionalCondition,
        conditionalQuestion,
        resolutionTimestamp,
        conditionalMetadata
      );
      
      // Try to configure Stream ID if provided (either preset or custom)
      const targetPriceValue = conditionalTargetPrice ? parseFloat(conditionalTargetPrice) : undefined;
      let streamIdToUse: string | null = null;

      // Determine which Stream ID to use
      if (conditionalStreamIdCustom && conditionalStreamIdCustom.trim() !== '') {
        // Use custom Stream ID if provided
        streamIdToUse = conditionalStreamIdCustom.trim();
      } else if (conditionalStreamIdPreset && conditionalStreamIdPreset !== '' && conditionalStreamIdPreset !== 'none' && conditionalStreamIdPreset !== 'custom') {
        // Use preset Stream ID
        const preset = STREAM_ID_PRESETS.find(p => p.value === conditionalStreamIdPreset);
        if (preset && preset.streamId) {
          streamIdToUse = preset.streamId;
        }
      }

      if (result.marketId && streamIdToUse) {
        try {
          await configureStream(result.marketId, streamIdToUse, targetPriceValue);
          toast.success('Stream ID configured successfully!');
        } catch (error: any) {
          // If configuration fails (e.g., user is not owner), show informative message
          console.error('Failed to configure Stream ID:', error);
          toast.warning(`Market created successfully, but Stream ID could not be configured: ${error.message}. Please contact admin to configure it.`);
        }
      }

      setConditionalParentId('');
      setConditionalCondition('');
      setConditionalQuestion('');
      setConditionalResolutionTime('');
      setConditionalMetadata('');
      setConditionalStreamIdPreset('');
      setConditionalStreamIdCustom('');
      setConditionalTargetPrice('');
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
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const minResolutionTime = currentTimestamp + 3600 + 300; // 1 hora + 5 minutos buffer
      
      if (resolutionTimestamp < minResolutionTime) {
        const minDate = new Date(minResolutionTime * 1000);
        toast.error(`Resolution time must be at least 1 hour 5 minutes in the future. Minimum time: ${minDate.toLocaleString()}`);
        return;
      }
      
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
    <div className="min-h-screen text-white pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20">
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

        {/* Auto-refresh Banner */}
        <AutoRefreshBanner
          refreshInterval={120}
          onRefresh={async () => {
            // Refresh market data to show latest markets for conditional parent selection
            // Only refresh if no form fields have values to avoid interrupting user input
            const hasFormData = binaryQuestion || binaryDescription || binaryResolutionTime ||
                              conditionalParentId || conditionalQuestion || conditionalResolutionTime ||
                              subjectiveQuestion || subjectiveDescription || subjectiveResolutionTime;
            if (!hasFormData) {
              window.location.reload();
            }
          }}
          description="Market creation form refreshes to show the latest available markets for conditional market parent selection."
          sectionName="Create Market"
          pauseRefresh={!!(binaryQuestion || binaryDescription || binaryResolutionTime ||
                          conditionalParentId || conditionalQuestion || conditionalResolutionTime ||
                          subjectiveQuestion || subjectiveDescription || subjectiveResolutionTime ||
                          isCreatingBinary || isCreatingConditional || isCreatingSubjective)}
          className="mb-4 sm:mb-6"
        />

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
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">Must be at least 1 hour 5 minutes in the future (to account for blockchain time differences)</p>
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

                {/* Chainlink Data Streams Configuration */}
                <div className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-blue-500/20 via-blue-600/15 to-purple-500/20 border-2 border-blue-500/30 shadow-lg shadow-blue-500/10 space-y-4 sm:space-y-5">
                  <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                    <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30">
                      <StreamIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                    </div>
                    <div>
                      <label className="text-sm sm:text-base font-semibold text-blue-200">Chainlink Data Streams</label>
                      <p className="text-xs text-blue-300/80 mt-0.5">Optional: Enable price validation</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-200 mb-2">
                        Stream ID <span className="text-gray-500 font-normal">(optional)</span>
                      </label>
                      <Select value={binaryStreamIdPreset} onValueChange={setBinaryStreamIdPreset}>
                        <SelectTrigger className="w-full bg-white/10 border-2 border-blue-400/30 text-white hover:border-blue-400/50 focus:border-blue-400/70 h-11">
                          <SelectValue placeholder="Select a Chainlink Data Stream" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-blue-500/30">
                          {STREAM_ID_PRESETS.map((stream) => (
                            <SelectItem 
                              key={stream.value || 'none'} 
                              value={stream.value || 'none'}
                              className="hover:bg-blue-500/20 focus:bg-blue-500/20 cursor-pointer"
                            >
                              {stream.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                        Select a Chainlink Data Stream for price validation. Configuration will be completed by admin after market creation.
                      </p>
                    </div>

                    {binaryStreamIdPreset === 'custom' && (
                      <div className="p-3 sm:p-4 rounded-lg bg-white/5 border border-blue-400/20">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-200 mb-2">
                          Custom Stream ID
                        </label>
                        <Input
                          type="text"
                          placeholder="0x00039d9e45394f473ab1f050a1b963e6b05351e52d71e507509ada0c95ed75b8"
                          value={binaryStreamIdCustom}
                          onChange={(e) => setBinaryStreamIdCustom(e.target.value)}
                          className="w-full text-xs sm:text-sm font-mono bg-white/5 border-blue-400/30 focus:border-blue-400/50"
                        />
                        <p className="mt-2 text-xs text-gray-400">
                          Enter a valid Chainlink Data Stream ID (bytes32 hex format, 64 characters with 0x prefix)
                        </p>
                      </div>
                    )}

                    {((binaryStreamIdPreset && binaryStreamIdPreset !== '' && binaryStreamIdPreset !== 'none') || binaryStreamIdCustom !== '') && (
                      <div className="p-3 sm:p-4 rounded-lg bg-white/5 border border-green-400/20">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-200 mb-2">
                          Target Price ($) <span className="text-gray-500 font-normal">(optional)</span>
                        </label>
                        <Input
                          type="number"
                          placeholder="e.g., 50000"
                          value={binaryTargetPrice}
                          onChange={(e) => setBinaryTargetPrice(e.target.value)}
                          step="0.01"
                          className="w-full text-xs sm:text-base bg-white/5 border-green-400/30 focus:border-green-400/50"
                        />
                        <p className="mt-2 text-xs text-gray-400">
                          Set a target price for automatic resolution when the condition is met
                        </p>
                      </div>
                    )}
                  </div>
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
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">Must be at least 1 hour 5 minutes in the future and after the parent market's resolution time</p>
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

                {/* Chainlink Data Streams Configuration */}
                <div className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-blue-500/20 via-blue-600/15 to-purple-500/20 border-2 border-blue-500/30 shadow-lg shadow-blue-500/10 space-y-4 sm:space-y-5">
                  <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                    <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30">
                      <StreamIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                    </div>
                    <div>
                      <label className="text-sm sm:text-base font-semibold text-blue-200">Chainlink Data Streams</label>
                      <p className="text-xs text-blue-300/80 mt-0.5">Optional: Enable price validation</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-200 mb-2">
                        Stream ID <span className="text-gray-500 font-normal">(optional)</span>
                      </label>
                      <Select value={conditionalStreamIdPreset} onValueChange={setConditionalStreamIdPreset}>
                        <SelectTrigger className="w-full bg-white/10 border-2 border-blue-400/30 text-white hover:border-blue-400/50 focus:border-blue-400/70 h-11">
                          <SelectValue placeholder="Select a Chainlink Data Stream" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-blue-500/30">
                          {STREAM_ID_PRESETS.map((stream) => (
                            <SelectItem 
                              key={stream.value || 'none'} 
                              value={stream.value || 'none'}
                              className="hover:bg-blue-500/20 focus:bg-blue-500/20 cursor-pointer"
                            >
                              {stream.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                        Select a Chainlink Data Stream for price validation. Configuration will be completed by admin after market creation.
                      </p>
                    </div>

                    {conditionalStreamIdPreset === 'custom' && (
                      <div className="p-3 sm:p-4 rounded-lg bg-white/5 border border-blue-400/20">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-200 mb-2">
                          Custom Stream ID
                        </label>
                        <Input
                          type="text"
                          placeholder="0x00039d9e45394f473ab1f050a1b963e6b05351e52d71e507509ada0c95ed75b8"
                          value={conditionalStreamIdCustom}
                          onChange={(e) => setConditionalStreamIdCustom(e.target.value)}
                          className="w-full text-xs sm:text-sm font-mono bg-white/5 border-blue-400/30 focus:border-blue-400/50"
                        />
                        <p className="mt-2 text-xs text-gray-400">
                          Enter a valid Chainlink Data Stream ID (bytes32 hex format, 64 characters with 0x prefix)
                        </p>
                      </div>
                    )}

                    {((conditionalStreamIdPreset && conditionalStreamIdPreset !== '' && conditionalStreamIdPreset !== 'none') || conditionalStreamIdCustom !== '') && (
                      <div className="p-3 sm:p-4 rounded-lg bg-white/5 border border-green-400/20">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-200 mb-2">
                          Target Price ($) <span className="text-gray-500 font-normal">(optional)</span>
                        </label>
                        <Input
                          type="number"
                          placeholder="e.g., 50000"
                          value={conditionalTargetPrice}
                          onChange={(e) => setConditionalTargetPrice(e.target.value)}
                          step="0.01"
                          className="w-full text-xs sm:text-base bg-white/5 border-green-400/30 focus:border-green-400/50"
                        />
                        <p className="mt-2 text-xs text-gray-400">
                          Set a target price for automatic resolution when the condition is met
                        </p>
                      </div>
                    )}
                  </div>
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
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">Must be at least 1 hour 5 minutes in the future (to account for blockchain time differences)</p>
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

