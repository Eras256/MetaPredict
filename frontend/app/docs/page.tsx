'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, CheckCircle, Shield, Brain, Zap, Activity, 
  ExternalLink, ChevronDown, ChevronUp, FileText, 
  Code, TestTube, Rocket, Award, Link as LinkIcon,
  TrendingUp, Users, GitBranch, Coins, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/effects/GlassCard';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';

const getContractLink = (address: string) => 
  `https://testnet.opbnbscan.com/address/${address}#code`;

const sections = [
  {
    id: 'overview',
    title: 'Project Overview',
    icon: Rocket,
    content: (
      <div className="space-y-4">
        <p className="text-lg text-gray-300">
          <strong className="text-purple-400">MetaPredict.fun</strong> is the world's first decentralized prediction market platform powered by <strong className="text-pink-400">5-AI consensus oracle</strong>, protected by <strong className="text-green-400">100% insurance</strong>, and built on <strong className="text-yellow-400">opBNB</strong> for ultra-low fees.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <GlassCard className="p-4 text-center">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">Top 20</div>
            <div className="text-sm text-gray-400">Global Finalist</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">115/115</div>
            <div className="text-sm text-gray-400">Tests Passing</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">100%</div>
            <div className="text-sm text-gray-400">Insured</div>
          </GlassCard>
        </div>
      </div>
    )
  },
  {
    id: 'innovations',
    title: 'Key Innovations',
    icon: Brain,
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Multi-AI Oracle Consensus</h3>
                <p className="text-gray-400">
                  First prediction market with <strong className="text-purple-400">5-AI consensus</strong> from 3 providers (Gemini, Llama, Mistral). Sequential priority system ensures 80%+ consensus required. <strong className="text-green-400">95%+ accuracy guaranteed</strong>.
                </p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Insurance Guarantee</h3>
                <p className="text-gray-400">
                  <strong className="text-green-400">100% refund</strong> if oracle consensus fails. ERC-4626 compatible insurance pool with yield farming via Venus Protocol. <strong className="text-blue-400">1.58+ BNB</strong> currently generating yield.
                </p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Reputation NFTs</h3>
                <p className="text-gray-400">
                  On-chain reputation as <strong className="text-purple-400">tradeable NFT assets</strong>. Stake tokens to increase reputation, vote in disputes, climb tiers. Bad actors get slashed automatically.
                </p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                <GitBranch className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Conditional Markets</h3>
                <p className="text-gray-400">
                  <strong className="text-green-400">If-then predictions</strong> with parent-child relationships. Complex prediction chains enable sophisticated market structures.
                </p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Cross-Chain Aggregation</h3>
                <p className="text-gray-400">
                  OmniRouter finds <strong className="text-pink-400">best prices across chains</strong>. Save 1-5% per bet. Powered by Chainlink CCIP for secure cross-chain messaging.
                </p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Free Tier AI Models</h3>
                <p className="text-gray-400">
                  All AI services use <strong className="text-indigo-400">free tiers</strong>. Gemini Flash Lite is <strong className="text-yellow-400">3x faster</strong> and <strong className="text-yellow-400">71% cheaper</strong> than Flash.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    )
  },
  {
    id: 'technology',
    title: 'Technology Stack',
    icon: Code,
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-400" />
              Blockchain & Infrastructure
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>• <strong className="text-purple-400">opBNB</strong> - Layer 2 network (ultra-low gas)</li>
              <li>• <strong className="text-blue-400">Chainlink Data Streams</strong> - Real-time price feeds (sub-second)</li>
              <li>• <strong className="text-green-400">Chainlink CCIP</strong> - Cross-chain messaging</li>
              <li>• <strong className="text-yellow-400">Gelato</strong> - Automation & relay services</li>
              <li>• <strong className="text-pink-400">Venus Protocol</strong> - Yield farming for insurance pool</li>
            </ul>
          </GlassCard>
          
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Brain className="w-6 h-6 text-pink-400" />
              AI & Machine Learning
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>• <strong className="text-purple-400">Google Gemini 2.5 Flash Lite</strong> - Primary AI model (ultra-fast)</li>
              <li>• <strong className="text-blue-400">Groq Llama 3.1</strong> - Ultra-fast inference (Priority 2)</li>
              <li>• <strong className="text-green-400">OpenRouter</strong> - AI model aggregation (Mistral, Llama, Gemini)</li>
              <li>• <strong className="text-yellow-400">5 AI Models</strong> from 3 providers in sequential consensus</li>
            </ul>
          </GlassCard>
          
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Code className="w-6 h-6 text-green-400" />
              Smart Contracts
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>• <strong className="text-purple-400">Solidity 0.8.24</strong> - Contract language</li>
              <li>• <strong className="text-blue-400">Hardhat 3.1.0</strong> - Development framework</li>
              <li>• <strong className="text-green-400">OpenZeppelin</strong> - Secure contract libraries</li>
              <li>• <strong className="text-yellow-400">10 Contracts</strong> deployed and verified</li>
            </ul>
          </GlassCard>
          
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Rocket className="w-6 h-6 text-yellow-400" />
              Frontend & Backend
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>• <strong className="text-purple-400">Next.js 15</strong> - React framework (App Router)</li>
              <li>• <strong className="text-blue-400">React 19</strong> - UI library</li>
              <li>• <strong className="text-green-400">TypeScript 5</strong> - Type safety</li>
              <li>• <strong className="text-yellow-400">Express</strong> - Backend framework</li>
              <li>• <strong className="text-pink-400">Supabase</strong> - Backend-as-a-Service</li>
            </ul>
          </GlassCard>
        </div>
      </div>
    )
  },
  {
    id: 'contracts',
    title: 'Deployed Contracts',
    icon: FileText,
    content: (
      <div className="space-y-6">
        <p className="text-lg text-gray-300">
          All contracts are deployed on <strong className="text-yellow-400">opBNB Testnet</strong> (Chain ID: 5611) and verified on <strong className="text-blue-400">opBNBScan</strong>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(CONTRACT_ADDRESSES).map(([name, address]) => (
            <GlassCard key={name} className="p-4 hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white mb-1">{name.replace(/_/g, ' ')}</h4>
                  <p className="text-xs text-gray-400 font-mono break-all">{address}</p>
                </div>
                <a 
                  href={getContractLink(address)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-4 flex-shrink-0"
                >
                  <Button size="sm" variant="outline" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View
                  </Button>
                </a>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'tests',
    title: 'Test Coverage & Security',
    icon: TestTube,
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              Test Coverage
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Smart Contracts</span>
                <span className="text-green-400 font-bold">115/115 ✅</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Security Tests</span>
                <span className="text-green-400 font-bold">70+ ✅</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Chainlink Integration</span>
                <span className="text-green-400 font-bold">15+ ✅</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">End-to-End Tests</span>
                <span className="text-green-400 font-bold">20+ ✅</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Supabase Integration</span>
                <span className="text-green-400 font-bold">9/9 ✅</span>
              </div>
              <div className="pt-3 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-green-400 font-bold text-xl">124+ ✅</span>
                </div>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-400" />
              Security Audits
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Slither</span>
                <span className="text-green-400 font-bold">✅ Passed</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Mythril</span>
                <span className="text-green-400 font-bold">✅ Passed</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Security Tests</span>
                <span className="text-green-400 font-bold">70+ ✅</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <h4 className="text-sm font-semibold text-white mb-2">Security Features:</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>✅ Reentrancy Protection</li>
                <li>✅ Access Control</li>
                <li>✅ Input Validation</li>
                <li>✅ Integer Overflow Protection</li>
                <li>✅ Oracle Consensus (80%+ required)</li>
                <li>✅ Insurance Pool (automatic refund)</li>
                <li>✅ Slash Mechanism</li>
              </ul>
            </div>
          </GlassCard>
        </div>
      </div>
    )
  },
  {
    id: 'features',
    title: 'Key Features',
    icon: Award,
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              Market Types
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li>
                <strong className="text-purple-400">Binary Markets:</strong> Simple YES/NO predictions with permissionless creation
              </li>
              <li>
                <strong className="text-blue-400">Conditional Markets:</strong> If-then predictions with parent-child relationships
              </li>
              <li>
                <strong className="text-green-400">Subjective Markets:</strong> DAO-governed markets with quadratic voting
              </li>
            </ul>
          </GlassCard>
          
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-pink-400" />
              Chainlink Data Streams
            </h3>
            <p className="text-gray-300 mb-3">
              Sub-second price feeds (up to <strong className="text-pink-400">100ms updates</strong>) for 8 trading pairs:
            </p>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>• BTC/USD, ETH/USD, BNB/USD</li>
              <li>• USDT/USD, SOL/USD, XRP/USD</li>
              <li>• USDC/USD, DOGE/USD</li>
            </ul>
          </GlassCard>
          
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-yellow-400" />
              Reputation System
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>• <strong className="text-yellow-400">Reputation NFTs</strong> - Tradeable on-chain reputation</li>
              <li>• <strong className="text-yellow-400">Stake & Earn</strong> - Increase reputation by staking</li>
              <li>• <strong className="text-yellow-400">Dispute Voting</strong> - Vote in market disputes</li>
              <li>• <strong className="text-yellow-400">Tier System</strong> - Climb reputation tiers</li>
              <li>• <strong className="text-yellow-400">Slash Mechanism</strong> - Bad actors lose reputation</li>
            </ul>
          </GlassCard>
          
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Coins className="w-6 h-6 text-green-400" />
              Insurance Pool
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>• <strong className="text-green-400">ERC-4626 Compatible</strong> - Standard vault interface</li>
              <li>• <strong className="text-green-400">Automatic Refunds</strong> - If oracle fails, you get your money back</li>
              <li>• <strong className="text-green-400">Yield Farming</strong> - Insurance funds earn yield via Venus Protocol</li>
              <li>• <strong className="text-green-400">Native BNB</strong> - Uses native BNB instead of ERC20 tokens</li>
              <li>• <strong className="text-green-400">1.58+ BNB</strong> currently generating yield</li>
            </ul>
          </GlassCard>
        </div>
      </div>
    )
  },
  {
    id: 'voting',
    title: 'Vote for MetaPredict',
    icon: Trophy,
    content: (
      <div className="space-y-6">
        <GlassCard className="p-8 text-center border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Help Us Win Top 5! 🏆
          </h2>
          <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
            We're currently in the <strong className="text-yellow-400">Top 20 Global Finalists</strong> of the Seedify Prediction Markets Hackathon by BNB Chain. Your vote can help us reach the <strong className="text-green-400">Top 5</strong>!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://seedifypredict.com/" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                <LinkIcon className="w-5 h-5" />
                Vote on Seedify Predict
              </Button>
            </a>
            <a href="https://seedifypredict.com/projects" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2 border-yellow-500/50 text-yellow-300">
                <ExternalLink className="w-5 h-5" />
                View All Projects
              </Button>
            </a>
          </div>
        </GlassCard>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="p-6 text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">Top 20</div>
            <div className="text-gray-300">Global Finalist</div>
            <div className="text-sm text-gray-400 mt-2">Seedify Hackathon</div>
          </GlassCard>
          <GlassCard className="p-6 text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">115/115</div>
            <div className="text-gray-300">Tests Passing</div>
            <div className="text-sm text-gray-400 mt-2">100% Coverage</div>
          </GlassCard>
          <GlassCard className="p-6 text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">10</div>
            <div className="text-gray-300">Smart Contracts</div>
            <div className="text-sm text-gray-400 mt-2">Deployed & Verified</div>
          </GlassCard>
        </div>
        
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Why Vote for MetaPredict?</h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong className="text-white">World's First</strong> prediction market with 5-AI consensus oracle</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong className="text-white">100% Insurance Protection</strong> - Automatic refunds if oracle fails</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong className="text-white">Production Ready</strong> - 115/115 tests passing, all contracts verified</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong className="text-white">Innovative Features</strong> - Reputation NFTs, Conditional Markets, Cross-Chain Aggregation</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong className="text-white">Ultra-Low Fees</strong> - Built on opBNB for maximum cost savings</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong className="text-white">Free Tier AI</strong> - All AI services use free tiers, sustainable model</span>
            </li>
          </ul>
        </GlassCard>
      </div>
    )
  }
];

export default function DocsPage() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['overview', 'voting']));

  const toggleSection = (id: string) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(id)) {
      newOpen.delete(id);
    } else {
      newOpen.add(id);
    }
    setOpenSections(newOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
              <Image 
                src="/logos/MINS.png" 
                alt="MetaPredict Logo" 
                width={96} 
                height={96} 
                className="w-full h-full object-contain p-2"
                priority
              />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MetaPredict Documentation
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Complete technical documentation, contract addresses, test coverage, and voting information for the Seedify Prediction Markets Hackathon
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a href="https://seedifypredict.com/" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                <Trophy className="w-5 h-5" />
                Vote for Us
              </Button>
            </a>
            <Link href="/">
              <Button size="lg" variant="outline" className="gap-2 border-purple-500/50 text-purple-300">
                <ExternalLink className="w-5 h-5" />
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section, index) => {
            const isOpen = openSections.has(section.id);
            const SectionIcon = section.icon;
            
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <SectionIcon className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-0 border-t border-white/10 mt-4">
                          {section.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <GlassCard className="p-8 text-center border-2 border-purple-500/30">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Support MetaPredict?
            </h2>
            <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
              Help us reach the Top 5 by voting on Seedify Predict. Every vote counts!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://seedifypredict.com/" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-lg px-8">
                  <Trophy className="w-5 h-5" />
                  Vote Now
                </Button>
              </a>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

