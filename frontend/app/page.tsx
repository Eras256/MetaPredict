'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Shield, Zap, TrendingUp, Lock, Users, ArrowRight, CheckCircle, BarChart3, Globe, Award, Link2, Code, ExternalLink, FileCode, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/effects/GlassCard';

const features = [
  {
    icon: Brain,
    title: 'Multi-AI Oracle Consensus',
    description: '5 AI models from 3 providers (Gemini 2.5 Flash, Groq Llama 3.1, OpenRouter Mistral/Llama/Gemini) working in sequential priority. 80%+ consensus required. Automatic fallback ensures 95%+ accuracy.',
    gradient: 'from-purple-500 to-pink-500',
    link: 'https://testnet.opbnbscan.com/address/0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c#code'
  },
  {
    icon: Shield,
    title: 'Insurance Protected (ERC-4626)',
    description: 'First prediction market with financial guarantee. 100% refund if oracle fails. Yield-generating insurance pool with native BNB. All deposits and yields transparent on-chain.',
    gradient: 'from-blue-500 to-cyan-500',
    link: 'https://testnet.opbnbscan.com/address/0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA#code'
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
    description: 'Sub-second price feeds (up to 100ms) for 8 trading pairs (BTC, ETH, USDT, BNB, SOL, XRP, DOGE). Real-time updates for price-based predictions.',
    gradient: 'from-green-500 to-emerald-500',
    link: 'https://testnet.opbnbscan.com/address/0x1758d4da0bAd4DB90Dfd56Be259C19cabDcF03fd#code'
  },
  {
    icon: Award,
    title: 'Reputation System',
    description: 'Stake to earn, vote in disputes, climb tiers, earn NFT badges. Economic incentives for honesty. On-chain reputation as tradeable assets.',
    gradient: 'from-red-500 to-rose-500',
    link: 'https://testnet.opbnbscan.com/address/0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7#code'
  },
  {
    icon: Users,
    title: 'DAO Governance',
    description: 'Quadratic voting with expertise weighting. Community-driven resolution for subjective markets. Transparent on-chain governance.',
    gradient: 'from-indigo-500 to-purple-500',
    link: 'https://testnet.opbnbscan.com/address/0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123#code'
  }
];

const stats = [
  { label: 'Verified Contracts', value: '10', prefix: '', suffix: '/10', description: 'All contracts verified on opBNBScan' },
  { label: 'AI Models', value: '5', prefix: '', suffix: '', description: 'From 3 providers' },
  { label: 'Oracle Accuracy', value: '95', prefix: '', suffix: '%+', description: 'Multi-AI consensus rate' },
  { label: 'Price Feeds', value: '8', prefix: '', suffix: '', description: 'Chainlink Data Streams' },
];

const contracts = [
  {
    name: 'Prediction Market Core',
    address: '0x5eaa77CC135b82c254F1144c48f4d179964fA0b1',
    explorer: 'https://testnet.opbnbscan.com/address/0x5eaa77CC135b82c254F1144c48f4d179964fA0b1#code',
    status: 'Verified'
  },
  {
    name: 'AI Oracle',
    address: '0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c',
    explorer: 'https://testnet.opbnbscan.com/address/0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c#code',
    status: 'Verified'
  },
  {
    name: 'Insurance Pool',
    address: '0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA',
    explorer: 'https://testnet.opbnbscan.com/address/0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA#code',
    status: 'Verified'
  },
  {
    name: 'Chainlink Data Streams',
    address: '0x1758d4da0bAd4DB90Dfd56Be259C19cabDcF03fd',
    explorer: 'https://testnet.opbnbscan.com/address/0x1758d4da0bAd4DB90Dfd56Be259C19cabDcF03fd#code',
    status: 'Verified'
  }
];

const technologies = [
  { name: 'opBNB', description: 'Ultra-low gas Layer 2', icon: '⚡' },
  { name: 'Chainlink', description: 'Data Streams & CCIP', icon: '🔗' },
  { name: 'Google Gemini', description: 'AI Model Priority 1', icon: '🧠' },
  { name: 'Groq', description: 'AI Model Priority 2', icon: '⚡' },
  { name: 'OpenRouter', description: 'AI Models Priority 3-5', icon: '🌐' },
  { name: 'Gelato', description: 'Automation & Relay', icon: '🤖' },
  { name: 'Venus Protocol', description: 'Yield Farming', icon: '💰' },
  { name: 'Thirdweb', description: 'Gasless Wallets', icon: '🔐' },
  { name: 'Next.js', description: 'Full-stack Framework', icon: '⚛️' },
  { name: 'Hardhat', description: 'Smart Contract Dev', icon: '🛠️' },
];

const howItWorks = [
  {
    step: '01',
    title: 'Create or Browse Markets',
    description: 'Anyone can create a prediction market on any future event. Browse active markets and find opportunities. Three market types: Binary, Conditional, and Subjective.',
    items: ['Permissionless creation', 'Binary, conditional, or subjective markets', 'IPFS metadata storage', 'Customizable resolution time']
  },
  {
    step: '02',
    title: 'Place Your Bets',
    description: 'Buy YES or NO shares with native BNB. Our AMM ensures always-available liquidity at fair prices. Ultra-low gas costs on opBNB.',
    items: ['Ultra-low gas (<$0.001)', '0.5% trading fee', '0.1% insurance premium', 'Instant execution']
  },
  {
    step: '03',
    title: 'Multi-AI Oracle Consensus Resolves',
    description: 'At resolution time, our Oracle Bot detects the event and queries 5 AI models sequentially: Gemini 2.5 Flash → Groq Llama 3.1 → OpenRouter Mistral 7B → OpenRouter Llama 3.2 3B → OpenRouter Gemini. 80%+ consensus required. Gelato Relay executes resolution on-chain.',
    items: ['5 AI models from 3 providers', 'Sequential priority system', '80%+ consensus required', '<1 hour resolution', '100% refund if oracle fails', 'Transparent on-chain']
  }
];

const marketTypes = [
  {
    title: 'Binary Markets',
    description: 'Simple YES/NO predictions on any future event',
    contract: '0x41A5CFeEf9C7fc50e68E13bAbB11b3B8872a0b6d',
    examples: ['Will Bitcoin reach $100K by EOY?', 'Will there be snow in NYC on Christmas?', 'Will SpaceX launch Starship in Q1?']
  },
  {
    title: 'Conditional Markets',
    description: 'If-then predictions that depend on parent market outcomes',
    contract: '0x41C2b1FB595Ad18cb111c3a3Fc1B2d6307e43741',
    examples: ['IF Bitcoin hits $100K, THEN will Ethereum reach $5K?', 'IF Fed cuts rates, THEN will S&P 500 rally 10%?', 'IF Trump wins, THEN will crypto regulation ease?']
  },
  {
    title: 'Subjective Markets',
    description: 'Opinion-based predictions resolved by expert DAO voting',
    contract: '0xAE88cE8f797FCBD36b0Ae78f80FDb11774d766f8',
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
              <span className="text-sm text-purple-300">Live on opBNB Testnet (Chain ID: 5611)</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">MetaPredict.ai</span>
              <br />
              <span className="text-white">AI-Powered Prediction Markets</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              The first prediction market platform with <strong>5-AI consensus oracle</strong> (Gemini, Groq, OpenRouter), <strong>insurance protection</strong>, and <strong>Chainlink Data Streams</strong>
            </p>
            
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Bet on anything. Trust multi-AI consensus. Get protected. Built on opBNB for ultra-low fees. <strong>10/10 contracts verified</strong> on opBNBScan.
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

              <a href="https://testnet.opbnbscan.com/address/0x5eaa77CC135b82c254F1144c48f4d179964fA0b1#code" target="_blank" rel="noopener noreferrer">
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
              Solving the oracle manipulation problem with multi-AI consensus (5 models from 3 providers), sequential fallback, and insurance protection
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
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built With Best-in-Class Tech
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powered by industry-leading protocols and AI providers
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-900/10 to-transparent">
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
                  
                  <p className="text-gray-400 mb-4">
                    {type.description}
                  </p>

                  <a 
                    href={`https://testnet.opbnbscan.com/address/${type.contract}#code`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 mb-4 transition-colors"
                  >
                    <Code className="w-3 h-3" />
                    {type.contract.slice(0, 6)}...{type.contract.slice(-4)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  
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

      {/* Contracts Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Verified Smart Contracts
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              All contracts verified and auditable on opBNBScan
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {contracts.map((contract, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard hover className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {contract.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400 font-mono">
                        <FileCode className="w-4 h-4" />
                        {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                      <span className="text-xs text-green-400 font-semibold">{contract.status}</span>
                    </div>
                  </div>
                  <a 
                    href={contract.explorer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    View on opBNBScan
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <a 
              href="https://testnet.opbnbscan.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 gap-2">
                View All Contracts on opBNBScan
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
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
                Join the most advanced prediction market platform. Protected by 5-AI consensus, secured by insurance, powered by Chainlink Data Streams.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/markets">
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Explore Markets
                  </Button>
                </Link>
                
                <a href="https://github.com/vaiosx01/MetaPredict" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View on GitHub
                  </Button>
                </a>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
