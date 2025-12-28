'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Brain, Shield, Zap, TrendingUp, Lock, Users, ArrowRight, CheckCircle, BarChart3, Globe, Award, Link2, ExternalLink, Activity, Trophy, Sparkles, Target, TrendingDown, Search, Coins, ArrowRightCircle, FileQuestion, GitBranch, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/effects/GlassCard';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';

// Helper function to generate opBNBScan link
const getContractLink = (address: string) => 
  `https://testnet.opbnbscan.com/address/${address}#code`;

const stats = [
  { label: 'Hackathon Ranking', value: 'Top 20', prefix: '', suffix: '', description: 'Global Finalist' },
  { label: 'Smart Contracts', value: '10', prefix: '', suffix: '', description: 'Deployed on opBNB Testnet' },
  { label: 'Test Coverage', value: '115', prefix: '', suffix: '/115', description: 'All tests passing (100%)' },
  { label: 'AI Models', value: '5', prefix: '', suffix: '', description: 'From 3 providers (Gemini, Llama, Mistral)' },
  { label: 'Oracle Accuracy', value: '95', prefix: '', suffix: '%+', description: 'Multi-AI consensus rate' },
  { label: 'Price Feeds', value: '8', prefix: '', suffix: '', description: 'Chainlink Data Streams' },
];

const technologies = [
  { name: 'opBNB', description: 'Ultra-low gas Layer 2', icon: '⚡' },
  { name: 'Chainlink', description: 'Data Streams & CCIP', icon: '🔗' },
  { name: 'Gemini', description: 'AI Model Priority 1', icon: '🧠' },
  { name: 'Llama', description: 'AI Model Priority 2', icon: '⚡' },
  { name: 'Mistral', description: 'AI Models Priority 3-5', icon: '🌐' },
  { name: 'Gelato', description: 'Automation & Relay', icon: '🤖' },
  { name: 'Venus Protocol', description: 'Yield Farming', icon: '💰' },
  { name: 'Thirdweb', description: 'Gasless Wallets', icon: '🔐' },
  { name: 'Next.js', description: 'Full-stack Framework', icon: '⚛️' },
  { name: 'Hardhat', description: 'Smart Contract Dev', icon: '🛠️' },
];

const howItWorks = [
  {
    step: 1,
    icon: Search,
    title: 'Create or Browse Markets',
    description: 'Anyone can create a prediction market on any future event. Browse active markets and find opportunities.',
    items: ['Permissionless creation', 'Three market types', 'IPFS metadata storage', 'Customizable resolution']
  },
  {
    step: 2,
    icon: Coins,
    title: 'Place Your Bets',
    description: 'Buy YES or NO shares with native BNB. Our AMM ensures always-available liquidity at fair prices.',
    items: ['Ultra-low gas (<$0.001)', '0.5% trading fee', '0.1% insurance premium', 'Instant execution']
  },
  {
    step: 3,
    icon: Brain,
    title: 'Automated Resolution System',
    description: 'Multi-layer automated resolution: First, manual initiation is required when markets expire (call initiateResolution). Then, our automated system resolves using multi-AI consensus via Backend Event Monitor (1 min polling when server is running - most reliable), GitHub Actions workflow (configured for 10 min but executes irregularly due to throttling), and Vercel Cron Jobs (daily at midnight and noon). Event Monitor queries 5 models sequentially. 80%+ agreement required. Automatic resolution on-chain via Gelato Relay.',
    items: ['Manual initiation required first (initiateResolution)', 'Backend Event Monitor: Monitors every 1 minute (when server is running) - Most reliable', 'GitHub Actions workflow: Configured for 10 min but executes irregularly (30-60+ min intervals)', 'Vercel Cron Jobs: Daily checks at midnight (00:00 UTC) and 12 PM (12:00 UTC)', '5 AI models (Gemini, Llama, Mistral)', '80%+ consensus required', 'Gelato Relay executes on-chain', '<1 hour resolution time after initiation', '100% refund if oracle fails']
  }
];

const marketTypes = [
  {
    title: 'Binary Markets',
    description: 'Simple YES/NO predictions on any future event',
    examples: ['Will Bitcoin reach $100K by EOY?', 'Will there be snow in NYC on Christmas?', 'Will SpaceX launch Starship in Q1?']
  },
  {
    title: 'Conditional Markets',
    description: 'If-then predictions that depend on parent market outcomes',
    examples: ['IF Bitcoin hits $100K, THEN will Ethereum reach $5K?', 'IF Fed cuts rates, THEN will S&P 500 rally 10%?', 'IF Trump wins, THEN will crypto regulation ease?']
  },
  {
    title: 'Subjective Markets',
    description: 'Opinion-based predictions resolved by expert DAO voting',
    examples: ['Was Oppenheimer better than Barbie?', 'Is GPT-5 a significant improvement over GPT-4?', 'Will 2025 be the year of AI agents?']
  }
];

export default function HomePage() {
  // Calculate features inside component to avoid hydration mismatch
  const features = useMemo(() => [
    {
      icon: Brain,
      title: 'Multi-AI Oracle Consensus',
      description: '5 AI models from 3 providers working in sequential priority: Gemini (1st - ultra-fast, free), Llama (2nd), Mistral (3rd), Llama (4th), Gemini (5th). 80%+ consensus required. Automatic fallback ensures 95%+ accuracy.',
      gradient: 'from-purple-500 to-pink-500',
      link: getContractLink(CONTRACT_ADDRESSES.AI_ORACLE)
    },
    {
      icon: Shield,
      title: 'Insurance Protected (ERC-4626 Compatible)',
      description: 'First prediction market with financial guarantee. 100% refund if oracle fails. Yield-generating insurance pool with native BNB. All deposits and yields transparent on-chain.',
      gradient: 'from-blue-500 to-cyan-500',
      link: getContractLink(CONTRACT_ADDRESSES.INSURANCE_POOL)
    },
    {
      icon: Zap,
      title: 'Lightning Fast on opBNB',
      description: 'Resolution in <1 hour. Gas costs <$0.001 per transaction. Built on opBNB Testnet (Chain ID: 5611). Gasless UX with Thirdweb Embedded Wallets.',
      gradient: 'from-yellow-500 to-orange-500',
      link: 'https://testnet.opbnbscan.com/'
    },
    {
      icon: Activity,
      title: 'Chainlink Data Streams',
      description: 'Sub-second price feeds (up to 100ms) for 8 trading pairs: BTC/USD, ETH/USD, BNB/USD, USDT/USD, SOL/USD, XRP/USD, USDC/USD, DOGE/USD. Real-time updates for price-based predictions. All Stream IDs verified and tested.',
      gradient: 'from-green-500 to-emerald-500',
      link: getContractLink(CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION)
    },
    {
      icon: Award,
      title: 'Reputation System',
      description: 'Stake to earn, vote in disputes, climb tiers, earn NFT badges. Economic incentives for honesty. On-chain reputation as tradeable assets.',
      gradient: 'from-red-500 to-rose-500',
      link: getContractLink(CONTRACT_ADDRESSES.REPUTATION_STAKING)
    },
    {
      icon: Users,
      title: 'DAO Governance',
      description: 'Quadratic voting with expertise weighting. Community-driven resolution for subjective markets. Transparent on-chain governance.',
      gradient: 'from-indigo-500 to-purple-500',
      link: getContractLink(CONTRACT_ADDRESSES.DAO_GOVERNANCE)
    },
    {
      icon: FileQuestion,
      title: 'Binary Markets',
      description: 'Simple YES/NO predictions on any future event. Permissionless market creation with customizable resolution times. AMM-based liquidity ensures always-available trading.',
      gradient: 'from-cyan-500 to-blue-500',
      link: getContractLink(CONTRACT_ADDRESSES.BINARY_MARKET)
    },
    {
      icon: GitBranch,
      title: 'Conditional Markets',
      description: 'If-then predictions that depend on parent market outcomes. Create complex prediction chains and conditional logic. Perfect for multi-event scenarios and cascading predictions.',
      gradient: 'from-teal-500 to-cyan-500',
      link: getContractLink(CONTRACT_ADDRESSES.CONDITIONAL_MARKET)
    },
    {
      icon: Award,
      title: 'Subjective Markets',
      description: 'DAO-governed markets for opinion-based questions. Resolved through community voting with quadratic weighting. Ideal for subjective questions requiring expert judgment.',
      gradient: 'from-violet-500 to-purple-500',
      link: getContractLink(CONTRACT_ADDRESSES.SUBJECTIVE_MARKET)
    },
    {
      icon: Network,
      title: 'Cross-Chain Aggregation',
      description: 'OmniRouter enables cross-chain price aggregation via Chainlink CCIP. Save 1-5% per bet by finding best prices across chains. Secure cross-chain messaging with automatic price discovery.',
      gradient: 'from-pink-500 to-rose-500',
      link: getContractLink(CONTRACT_ADDRESSES.OMNI_ROUTER)
    }
  ], []);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Hackathon Finalist Badge - PROMINENT */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border-2 border-yellow-500/50 backdrop-blur-sm shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                <Trophy className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span className="text-base sm:text-lg font-bold text-yellow-300">
                  🏆 TOP 20 FINALIST • Seedify Prediction Markets Hackathon by BNB Chain
                </span>
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              </div>
            </motion.div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-purple-300">Live on opBNB Testnet (Chain ID: 5611)</span>
            </div>
            
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 sm:mb-8 flex justify-center"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                <Image 
                  src="/logos/MINS.png" 
                  alt="MetaPredict Logo" 
                  width={128} 
                  height={128} 
                  className="w-full h-full object-contain p-2 sm:p-3"
                  priority
                />
              </div>
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-2">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">MetaPredict.fun</span>
              <br />
              <span className="text-white">AI-Powered Prediction Markets</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-3 sm:mb-4 max-w-3xl mx-auto px-4">
              The world's first prediction market platform with <strong className="text-purple-400">5-AI consensus oracle</strong>. Powered by <strong className="text-blue-400">Gemini (Google)</strong>, <strong className="text-blue-400">Llama (Meta)</strong>, and <strong className="text-purple-400">Mistral AI</strong>. Protected by <strong className="text-green-400">insurance</strong> and powered by <strong className="text-orange-400">Chainlink Data Streams</strong>.
            </p>
            
            <p className="text-sm sm:text-base md:text-lg text-gray-400 mb-4 sm:mb-5 max-w-2xl mx-auto px-4">
              Bet on anything. Trust multi-AI consensus. Get protected. Built on opBNB for ultra-low fees. <strong className="text-green-400">115/115 tests passing</strong> | <strong className="text-yellow-400">84+ markets created</strong> | <strong className="text-blue-400">200+ transactions</strong>.
            </p>

            {/* Automated Resolution Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-6 sm:mb-8 px-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 border border-purple-500/30 backdrop-blur-sm">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 animate-pulse" />
                <span className="text-xs sm:text-sm text-purple-300">
                  <strong className="text-white">Automated Resolution System:</strong> Markets require manual initiation (initiateResolution) when they expire. Then our multi-layer automation (Backend Event Monitor 1 min polling when server is running - most reliable, GitHub Actions configured for 10 min but executes irregularly due to throttling, Vercel Cron daily at midnight and noon) automatically resolves them using multi-AI consensus within 1 hour.
                </span>
              </div>
            </motion.div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4">
              <Link href="/markets">
                <Button size="lg" className="gap-2 group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Explore Markets
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Link href="/create">
                <Button size="lg" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
                  Create Market
                </Button>
              </Link>

              <a href={getContractLink(CONTRACT_ADDRESSES.CORE_CONTRACT)} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10 gap-2">
                  <ExternalLink className="w-4 h-4" />
                  View Contracts
                </Button>
              </a>
            </div>
          </motion.div>
          
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 max-w-7xl mx-auto px-4"
          >
            {stats.map((stat, index) => (
              <GlassCard key={index} className="p-6 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                  {stat.prefix}{stat.value}{stat.suffix}
                </div>
                <div className="text-sm font-semibold text-white mb-1">{stat.label}</div>
                <div className="text-xs text-gray-400">{stat.description}</div>
              </GlassCard>
            ))}
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-sm text-gray-400">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowRight className="w-5 h-5 text-purple-400 rotate-90" />
          </motion.div>
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-3 sm:mb-4 backdrop-blur-sm">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
              <span className="text-xs sm:text-sm text-purple-300">Why We're Top 20</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-4">
              Why MetaPredict.fun?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Solving the oracle manipulation problem with <strong className="text-purple-400">multi-AI consensus</strong> (Gemini, Llama, Mistral), sequential fallback, and <strong className="text-green-400">100% insurance protection</strong>
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard hover className="p-6 h-full group">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-400 mb-4">
                    {feature.description}
                  </p>

                  <a 
                    href={feature.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Contract
                  </a>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-900/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-4">
              Built With Best-in-Class Tech
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Powered by industry-leading protocols and AI providers
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {technologies.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6 text-center">
                  <div className="text-4xl mb-3">{tech.icon}</div>
                  <div className="font-semibold text-white mb-1">{tech.name}</div>
                  <div className="text-xs text-gray-400">{tech.description}</div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-3 sm:mb-4 px-4">
              Simple, secure, and transparent prediction markets in three easy steps
            </p>
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm max-w-full mx-4">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-purple-300">
                <strong>Automated Resolution System:</strong> Markets require manual initiation first (initiateResolution). Then our automated workflow resolves them using multi-AI consensus via Backend Event Monitor (1 min polling when server is running - most reliable), GitHub Actions workflow (configured for 10 min but executes irregularly), and Vercel Cron Jobs (daily at midnight and noon).
              </span>
            </div>
          </div>
          
          {/* Horizontal Steps Layout */}
          <div className="relative">
            {/* Connection Lines - Desktop Only */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5">
              <div className="absolute left-[16.66%] right-[16.66%] h-full bg-gradient-to-r from-purple-500/20 via-pink-500/40 to-purple-500/20" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
              {howItWorks.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    <GlassCard hover className="p-8 h-full flex flex-col items-center text-center group">
                      {/* Step Number Badge */}
                      <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                          {step.step}
                        </div>
                        {/* Icon Overlay */}
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <StepIcon className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      {/* Arrow Connector - Between Steps */}
                      {index < howItWorks.length - 1 && (
                        <div className="hidden md:block absolute top-24 -right-6 lg:-right-10 z-10">
                          <ArrowRightCircle className="w-12 h-12 text-purple-500/40 group-hover:text-purple-400 transition-colors" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-4">
                          {step.title}
                        </h3>
                        
                        <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                          {step.description}
                        </p>
                        
                        <ul className="space-y-3 text-left">
                          {step.items.map((item, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: (index * 0.15) + (i * 0.1) }}
                              viewport={{ once: true }}
                              className="flex items-start gap-3 text-gray-300 text-sm"
                            >
                              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Market Types */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-4">
              Three Types of Markets
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              From simple predictions to complex conditional logic
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {marketTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard hover className="p-6 h-full">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {type.title}
                  </h3>
                  
                  <p className="text-gray-400 mb-4">
                    {type.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-purple-300 mb-2">Examples:</div>
                    {type.examples.map((example, i) => (
                      <div key={i} className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10 text-sm text-gray-300">
                        {example}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hackathon Achievement Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-yellow-500/5 via-orange-500/5 to-red-500/5">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-12 text-center relative overflow-hidden border-2 border-yellow-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 via-orange-600/20 to-red-600/20" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-4">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <span className="text-2xl font-bold text-yellow-300">Hackathon Finalist</span>
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-4">
                Top 20 Global Finalist
              </h2>
              
              <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
                Selected as one of the <strong className="text-yellow-400">Top 20 global finalists</strong> in the <strong className="text-yellow-400">Seedify Prediction Markets Hackathon by BNB Chain</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-xl mx-auto">
                <GlassCard className="p-4 bg-yellow-500/10 border-yellow-500/30">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">Top 20</div>
                  <div className="text-sm text-gray-300">Global Finalists</div>
                </GlassCard>
                <GlassCard className="p-4 bg-green-500/10 border-green-500/30">
                  <div className="text-3xl font-bold text-green-400 mb-1">🏆</div>
                  <div className="text-sm text-gray-300">Hackathon Winner</div>
                </GlassCard>
              </div>
              
              <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                <strong className="text-white">Top 20 Global Finalist</strong> in the <strong className="text-yellow-400">Seedify Prediction Markets Hackathon by BNB Chain</strong>. 🚀
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link href="/markets">
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                    <Sparkles className="w-5 h-5" />
                    Try MetaPredict Now
                  </Button>
                </Link>
                
                <a href={getContractLink(CONTRACT_ADDRESSES.CORE_CONTRACT)} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10 gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View on opBNBScan
                  </Button>
                </a>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20" />
            
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-4">
                Ready to Start?
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join the most advanced prediction market platform. Protected by <strong className="text-purple-400">5-AI consensus</strong>, secured by <strong className="text-green-400">insurance</strong>, powered by <strong className="text-orange-400">Chainlink Data Streams</strong>.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link href="/markets">
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <ArrowRight className="w-5 h-5" />
                    Explore Markets
                  </Button>
                </Link>
                
                <Link href="/create">
                  <Button size="lg" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
                    Create Your Market
                  </Button>
                </Link>
                
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
