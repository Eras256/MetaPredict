'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Brain, Shield, Zap, TrendingUp, ArrowRight, CheckCircle, 
  Award, ExternalLink, Activity, Trophy, Sparkles, Target, 
  Coins, ArrowRightCircle, FileQuestion, GitBranch, Users,
  BarChart3, Clock, DollarSign, Lock, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/effects/GlassCard';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';

// Helper function to generate opBNBScan link
const getContractLink = (address: string) => 
  `https://testnet.opbnbscan.com/address/${address}#code`;

// Real stats from project - verified information only
const stats = [
  { label: 'Test Coverage', value: '115/115', icon: CheckCircle, color: 'text-green-400', description: 'All tests passing' },
  { label: 'Smart Contracts', value: '10', icon: Shield, color: 'text-blue-400', description: 'Deployed on opBNB' },
  { label: 'AI Models', value: '5', icon: Brain, color: 'text-purple-400', description: 'From 3 providers' },
  { label: 'Price Feeds', value: '8', icon: Activity, color: 'text-pink-400', description: 'Chainlink Streams' },
];

// Core features - concise with contract links
const getCoreFeatures = () => [
  {
    icon: Brain,
    title: 'Multi-AI Oracle Consensus',
    description: '5 AI models from 3 providers (Gemini, Llama, Mistral). 80%+ consensus required. 95%+ accuracy.',
    gradient: 'from-purple-500 to-pink-500',
    link: getContractLink(CONTRACT_ADDRESSES.AI_ORACLE)
  },
  {
    icon: Shield,
    title: 'Insurance Protected',
    description: '100% refund if oracle fails. Yield-generating insurance pool. ERC-4626 compatible.',
    gradient: 'from-blue-500 to-cyan-500',
    link: getContractLink(CONTRACT_ADDRESSES.INSURANCE_POOL)
  },
  {
    icon: Zap,
    title: 'Lightning Fast on opBNB',
    description: 'Gas costs <$0.001 per transaction. Resolution in <1 hour. Built on opBNB Testnet.',
    gradient: 'from-yellow-500 to-orange-500',
    link: 'https://testnet.opbnbscan.com/'
  },
  {
    icon: Activity,
    title: 'Chainlink Data Streams',
    description: 'Sub-second price feeds (100ms) for 8 trading pairs. Real-time updates.',
    gradient: 'from-green-500 to-emerald-500',
    link: getContractLink(CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION)
  },
  {
    icon: Award,
    title: 'Reputation System',
    description: 'Stake to earn, vote in disputes, climb tiers, earn NFT badges. On-chain reputation.',
    gradient: 'from-red-500 to-rose-500',
    link: getContractLink(CONTRACT_ADDRESSES.REPUTATION_STAKING)
  },
  {
    icon: Users,
    title: 'DAO Governance',
    description: 'Quadratic voting with expertise weighting. Community-driven resolution for subjective markets.',
    gradient: 'from-indigo-500 to-purple-500',
    link: getContractLink(CONTRACT_ADDRESSES.DAO_GOVERNANCE)
  },
  {
    icon: FileQuestion,
    title: 'Binary Markets',
    description: 'Simple YES/NO predictions. Permissionless creation. AMM-based liquidity.',
    gradient: 'from-cyan-500 to-blue-500',
    link: getContractLink(CONTRACT_ADDRESSES.BINARY_MARKET)
  },
  {
    icon: GitBranch,
    title: 'Conditional Markets',
    description: 'If-then predictions with parent-child relationships. Complex prediction chains.',
    gradient: 'from-teal-500 to-cyan-500',
    link: getContractLink(CONTRACT_ADDRESSES.CONDITIONAL_MARKET)
  },
  {
    icon: Award,
    title: 'Subjective Markets',
    description: 'DAO-governed markets resolved by community voting. Quadratic weighting.',
    gradient: 'from-violet-500 to-purple-500',
    link: getContractLink(CONTRACT_ADDRESSES.SUBJECTIVE_MARKET)
  },
  {
    icon: Activity,
    title: 'Cross-Chain Aggregation',
    description: 'OmniRouter finds best prices across chains. Save 1-5% per bet. Chainlink CCIP.',
    gradient: 'from-pink-500 to-rose-500',
    link: getContractLink(CONTRACT_ADDRESSES.OMNI_ROUTER)
  }
];

// Simplified how it works - 3 clear steps
const howItWorks = [
  {
    step: 1,
    icon: Search,
    title: 'Choose Your Market',
    description: 'Browse active markets or create your own. Bet on crypto, sports, politics, or anything.',
    cta: 'Browse Markets',
  },
  {
    step: 2,
    icon: Coins,
    title: 'Place Your Bet',
    description: 'Buy YES or NO shares instantly. Our AMM ensures fair prices and always-available liquidity.',
    cta: 'Start Betting',
  },
  {
    step: 3,
    icon: Trophy,
    title: 'Win & Get Paid',
    description: 'AI consensus resolves markets automatically. Winners get paid within 1 hour.',
    cta: 'View Markets',
  },
];

// Market types - simplified with clear examples
const marketTypes = [
  {
    title: 'Binary Markets',
    description: 'Simple YES/NO predictions',
    example: 'Will Bitcoin reach $100K by 2026?',
    icon: FileQuestion,
  },
  {
    title: 'Conditional Markets',
    description: 'If-then predictions',
    example: 'IF BTC hits $100K, THEN will ETH reach $5K?',
    icon: GitBranch,
  },
  {
    title: 'Subjective Markets',
    description: 'Community-governed opinions',
    example: 'Which AI model will dominate in 2026?',
    icon: Users,
  },
];

export default function HomePage() {
  // Memoize core features inside component
  const coreFeaturesData = useMemo(() => getCoreFeatures(), []);
  
  return (
    <div className="relative">
      {/* Hero Section - Optimized for Conversion */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Social Proof Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border-2 border-yellow-500/50 backdrop-blur-sm shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                <Trophy className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span className="text-base sm:text-lg font-bold text-yellow-300">
                  🏆 Top 20 Finalist • BNB Chain Hackathon
                </span>
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              </div>
            </motion.div>

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
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
            
            {/* Headline - Benefit-focused */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-2">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Bet on Anything.
              </span>
              <br />
              <span className="text-white">Win with AI.</span>
            </h1>
            
            {/* Subheadline - Real value prop */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 max-w-3xl mx-auto px-4 font-medium">
              The world's first prediction market with <strong className="text-purple-400">5-AI consensus oracle</strong> (Gemini, Llama, Mistral) and <strong className="text-green-400">100% insurance protection</strong>. Built on opBNB for ultra-low fees.
            </p>

            {/* Primary CTA - Above the fold */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 px-4">
              <Link href="/markets">
                <Button size="lg" className="gap-2 group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6 shadow-xl">
                  Start Betting Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Link href="/create">
                <Button size="lg" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 text-lg px-8 py-6">
                  Create Market
                </Button>
              </Link>
            </div>

            {/* Trust Indicators - Real features */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8 px-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Fees under $0.001</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>100% insured</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span>Resolves in &lt;1 hour</span>
              </div>
            </div>
          </motion.div>
          
          {/* Social Proof Stats - Real verified data */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto px-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <GlassCard className="p-6 text-center hover:scale-105 transition-transform">
                  <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                  <div className="text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold text-gray-300 mb-1">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.description}</div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-sm text-gray-400">Scroll to learn more</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowRight className="w-5 h-5 text-purple-400 rotate-90" />
          </motion.div>
        </motion.div>
      </section>
      
      {/* Core Features - Benefit-focused */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose MetaPredict?
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              The only prediction market that combines AI accuracy with financial protection
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {coreFeaturesData.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard hover className="p-6 h-full group">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-400 mb-4 text-sm">
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

      {/* How It Works - Simplified */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-900/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Start betting in 3 simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5">
              <div className="absolute left-[16.66%] right-[16.66%] h-full bg-gradient-to-r from-purple-500/20 via-pink-500/40 to-purple-500/20" />
            </div>
            
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
                  <GlassCard hover className="p-8 text-center h-full">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-500/30 mb-6 mx-auto">
                      {step.step}
                    </div>
                    
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
                      <StepIcon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4">
                      {step.title}
                    </h3>
                    
                    <p className="text-gray-400 mb-6 text-lg">
                      {step.description}
                    </p>

                    {index === 0 && (
                      <Link href="/markets">
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                          {step.cta}
                        </Button>
                      </Link>
                    )}
                  </GlassCard>

                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-16 -right-4 z-10">
                      <ArrowRightCircle className="w-8 h-8 text-purple-500/40" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Market Types - Simplified */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Bet on Anything
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Three market types for every prediction
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {marketTypes.map((type, index) => {
              const TypeIcon = type.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <GlassCard hover className="p-8 h-full">
                    <TypeIcon className="w-12 h-12 text-purple-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-3">
                      {type.title}
                    </h3>
                    <p className="text-gray-400 mb-6">
                      {type.description}
                    </p>
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <p className="text-sm text-gray-300 italic">
                        "{type.example}"
                      </p>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA - Conversion-focused */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-12 text-center relative overflow-hidden border-2 border-purple-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20" />
            
            <div className="relative z-10">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to Start Winning?
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Connect your wallet and start betting with <strong className="text-green-400">100% insurance protection</strong>. <strong className="text-purple-400">115/115 tests passing</strong> | <strong className="text-yellow-400">Top 20 Hackathon Finalist</strong>.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/markets">
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6 shadow-xl">
                    <ArrowRight className="w-5 h-5" />
                    Start Betting Now
                  </Button>
                </Link>
                
                <Link href="/create">
                  <Button size="lg" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 text-lg px-8 py-6">
                    Create Your Market
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>100% Test Coverage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Fully Insured</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>5-AI Consensus</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
