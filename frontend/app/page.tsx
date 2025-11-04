'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Shield, Zap, TrendingUp, Lock, Users, ArrowRight, CheckCircle, BarChart3, Globe, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/effects/GlassCard';

const features = [
  {
    icon: Brain,
    title: 'Multi-AI Oracle',
    description: '5 LLMs (GPT-4, Claude, Gemini, Llama, Mistral) consensus-based resolution with 95%+ accuracy',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Shield,
    title: 'Insurance Protected',
    description: 'First prediction market with financial guarantee against oracle manipulation. 100% refund if oracle fails',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Resolution in <1 hour on opBNB, gas costs <$0.001 per transaction. Gasless UX with Thirdweb',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Globe,
    title: 'Cross-Chain Aggregation',
    description: 'Compare prices across multiple chains and get best execution via Chainlink CCIP',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Award,
    title: 'Reputation System',
    description: 'Stake to earn, vote in disputes, climb tiers, earn NFT badges. Economic incentives for honesty',
    gradient: 'from-red-500 to-rose-500'
  },
  {
    icon: Users,
    title: 'DAO Governance',
    description: 'Quadratic voting with expertise weighting. Community-driven resolution for subjective markets',
    gradient: 'from-indigo-500 to-purple-500'
  }
];

const stats = [
  { label: 'Total Volume', value: '$0', prefix: '', suffix: '', description: 'Across all markets' },
  { label: 'Active Markets', value: '0', prefix: '', suffix: '', description: 'Live predictions' },
  { label: 'Oracle Accuracy', value: '95', prefix: '', suffix: '%', description: 'AI consensus rate' },
  { label: 'Avg Resolution', value: '<1', prefix: '', suffix: 'h', description: 'Lightning fast' },
];

const howItWorks = [
  {
    step: '01',
    title: 'Create or Browse Markets',
    description: 'Anyone can create a prediction market on any future event. Browse active markets and find opportunities.',
    items: ['Permissionless creation', 'Binary, conditional, or subjective', 'IPFS metadata storage', 'Customizable resolution time']
  },
  {
    step: '02',
    title: 'Place Your Bets',
    description: 'Buy YES or NO shares with USDC. Our AMM ensures always-available liquidity at fair prices.',
    items: ['Ultra-low gas (<$0.001)', '0.5% trading fee', '0.1% insurance premium', 'Instant execution']
  },
  {
    step: '03',
    title: 'AI Oracle Resolves',
    description: 'At resolution time, 5 AI models vote. 80%+ consensus required. If disputed, insurance activates automatically.',
    items: ['GPT-4, Claude, Gemini, Llama, Mistral', '<1 hour resolution', '100% refund if oracle fails', 'Transparent on-chain']
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
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-purple-300">Live on opBNB Testnet</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Prediction Markets</span>
              <br />
              <span className="text-white">Powered by AI</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              The first all-in-one platform with multi-AI oracle, cross-chain aggregation, and insurance protection
            </p>
            
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Bet on anything. Trust AI consensus. Get protected. Built on opBNB for ultra-low fees.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
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
            </div>
          </motion.div>
          
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
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
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why MetaPredict.ai?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Solving the $7M+ oracle manipulation problem with cutting-edge AI and insurance protection
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard hover className="p-6 h-full">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-900/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Simple, secure, and transparent prediction markets
            </p>
          </div>
          
          <div className="space-y-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl font-bold text-white">
                        {step.step}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-3">
                        {step.title}
                      </h3>
                      
                      <p className="text-gray-400 mb-4">
                        {step.description}
                      </p>
                      
                      <ul className="space-y-2">
                        {step.items.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-gray-300">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Market Types */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Three Types of Markets
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From simple predictions to complex conditional logic
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6">
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
                  
                  <p className="text-gray-400 mb-6">
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
      
      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20" />
            
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Start?
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join the most advanced prediction market platform. Protected by AI, secured by insurance.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/markets">
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Explore Markets
                  </Button>
                </Link>
                
                <Link href="https://docs.metapredict.ai" target="_blank">
                  <Button size="lg" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
                    Read Docs
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
