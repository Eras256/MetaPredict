'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Shield, 
  Zap, 
  TrendingUp, 
  Lock, 
  Users,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/effects/GlassCard';
import { AnimatedGradient } from '@/components/effects/AnimatedGradient';

const features = [
  {
    icon: Brain,
    title: 'Multi-AI Oracle',
    description: '5 LLMs (GPT-4, Claude, Gemini, Llama, Bloom) consensus-based resolution',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Shield,
    title: 'Insurance Protected',
    description: 'First prediction market with financial guarantee against oracle manipulation',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Resolution in <1 hour on opBNB, gas costs <$0.001 per transaction',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    icon: TrendingUp,
    title: 'Fair Pricing',
    description: 'Constant product AMM ensures always-available liquidity',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Lock,
    title: 'CertiK Audited',
    description: 'Security-first design with comprehensive smart contract audits',
    gradient: 'from-red-500 to-rose-500'
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Permissionless market creation, transparent resolution',
    gradient: 'from-indigo-500 to-purple-500'
  }
];

const stats = [
  { label: 'Total Volume', value: '$0', prefix: '' },
  { label: 'Active Markets', value: '0', prefix: '' },
  { label: 'Oracle Accuracy', value: '95', prefix: '', suffix: '%' },
  { label: 'Avg Resolution', value: '<1', prefix: '', suffix: 'h' }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      <AnimatedGradient />
      
      {/* Hero Section */}
      <section className="relative pt-32 px-4 md:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-purple-300">Live on opBNB Testnet</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Truth Powered by AI
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              The first prediction market with multi-AI oracle consensus and insurance protection
            </p>
            
            <p className="text-lg text-gray-400 mb-12 max-w-xl mx-auto">
              Bet on anything. Trust AI consensus. Get protected. Built on opBNB for ultra-low fees.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/markets">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Explore Markets
                  <ArrowRight className="ml-2 h-5 w-5" />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              >
                <GlassCard className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {stat.prefix}{stat.value}{stat.suffix}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
        >
          <span className="text-sm text-gray-400 mb-2 block">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-purple-500/50 rounded-full mx-auto flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-purple-500 rounded-full"
            />
          </motion.div>
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="relative py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Why TruthChain?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Solving the $7M+ oracle manipulation problem with cutting-edge AI and insurance protection
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <GlassCard hover className="p-6 h-full">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  
                  <p className="text-gray-400">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="relative py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Simple, secure, and transparent prediction markets
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create or Browse Markets',
                description: 'Anyone can create a prediction market on any future event. Browse active markets and find opportunities.',
                items: ['Permissionless creation', 'IPFS metadata storage', 'Customizable resolution time']
              },
              {
                step: '02',
                title: 'Place Your Bets',
                description: 'Buy YES or NO shares with USDC. Our AMM ensures always-available liquidity at fair prices.',
                items: ['Ultra-low gas (<$0.001)', '0.5% trading fee', 'Instant execution']
              },
              {
                step: '03',
                title: 'AI Oracle Resolves',
                description: 'At resolution time, 5 AI models vote. 80%+ consensus required. If disputed, insurance activates.',
                items: ['GPT-4, Claude, Gemini, Llama, Bloom', '<1 hour resolution', '100% refund if oracle fails']
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <GlassCard className="p-8 h-full">
                  <div className="text-6xl font-bold text-purple-500/20 mb-4">{step.step}</div>
                  
                  <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                  
                  <p className="text-gray-400 mb-6">{step.description}</p>
                  
                  <ul className="space-y-2">
                    {step.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-12 text-center">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ready to Start?
            </h2>
            
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join the most advanced prediction market platform. Protected by AI, secured by insurance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/markets">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Explore Markets
                </Button>
              </Link>
              <Link href="/docs">
                <Button size="lg" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
                  Read Docs
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
