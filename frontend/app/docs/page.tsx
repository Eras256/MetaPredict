'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, CheckCircle, Shield, Brain, Zap, Activity, 
  ExternalLink, ArrowRight, Clock, Users, TrendingUp,
  Award, Star, Heart, Target, AlertCircle, Sparkles,
  LogIn, Wallet, FileText, GitBranch, Lock, RefreshCw,
  BarChart3, FileCheck, Eye, Vote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/effects/GlassCard';

export default function VotePage() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Simulate countdown - update every minute
    const updateCountdown = () => {
      setTimeLeft('Voting ends soon!');
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      {/* Hero Section - Maximum Persuasion */}
      <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-red-500/10 to-purple-500/10 animate-pulse" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Urgency Badge */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-red-500/30 via-orange-500/30 to-yellow-500/30 border-2 border-red-500/50 backdrop-blur-sm shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                <AlertCircle className="w-5 h-5 text-red-400 animate-pulse" />
                <span className="text-base sm:text-lg font-bold text-red-300">
                  ⚡ URGENT: Help Us Reach Top 5! ⚡
                </span>
                <Clock className="w-5 h-5 text-red-400 animate-pulse" />
              </div>
            </motion.div>

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 flex justify-center"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                <Image 
                  src="/logos/METAPREDICT.png" 
                  alt="MetaPredict Logo" 
                  width={112} 
                  height={112} 
                  className="w-full h-full object-contain p-2"
                  priority
                />
              </div>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <motion.span
                animate={{
                  backgroundPosition: ['0%', '100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
                className="bg-gradient-to-r from-yellow-400 via-red-400 via-purple-400 to-yellow-400 bg-clip-text text-transparent bg-[length:200%_auto]"
              >
                Your Vote Can Make Us Win! 🏆
              </motion.span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 mb-8 max-w-4xl mx-auto font-semibold">
              We're <span className="text-yellow-400">Top 20 Global Finalist</span> competing for <span className="text-green-400">Top 5</span>. 
              <br className="hidden sm:block" />
              <span className="text-purple-400">Every single vote counts!</span>
            </p>

            {/* Primary CTA - Large and Prominent */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="mb-6 sm:mb-8"
            >
              <a href="https://seedifypredict.com/" target="_blank" rel="noopener noreferrer" className="block w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="gap-2 sm:gap-3 text-base sm:text-lg md:text-xl lg:text-2xl px-6 sm:px-8 md:px-12 py-4 sm:py-6 md:py-8 shadow-2xl font-bold w-full sm:w-auto"
                  style={{
                    background: 'linear-gradient(135deg, #fbbf24, #ef4444, #8b5cf6, #10b981, #3b82f6)',
                    backgroundSize: '300% 300%',
                    animation: 'gradientShift 3s ease infinite',
                  }}
                >
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex-shrink-0" />
                  <span className="break-words">VOTE NOW - IT TAKES 10 SECONDS!</span>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex-shrink-0" />
                </Button>
              </a>
            </motion.div>

            {/* Social Proof Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              {[
                { icon: Trophy, value: 'Top 20', label: 'Global Finalist', color: 'text-yellow-400' },
                { icon: CheckCircle, value: '115/115', label: 'Tests Passing', color: 'text-green-400' },
                { icon: Shield, value: '100%', label: 'Insured', color: 'text-blue-400' },
                { icon: Users, value: '10', label: 'Smart Contracts', color: 'text-purple-400' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <GlassCard className="p-4 text-center hover:scale-105 transition-transform">
                    <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Official Voting Steps Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Predict Hackathon Winners
            </h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto font-semibold">
              Earn <span className="text-yellow-400">IMO Allocations</span> by voting for your top 5 projects
            </p>
          </div>

          {/* Voting Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard hover className="p-6 sm:p-8 h-full border-2 border-blue-500/30">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-2xl font-bold text-white">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-center gap-2">
                      <LogIn className="w-6 h-6 text-blue-400" />
                      Connect & Vote
                    </h3>
                    <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                      Connect your <strong className="text-blue-400">X account</strong>, vote for your <strong className="text-purple-400">top 5 hackathon projects</strong>, and submit your <strong className="text-green-400">0x wallet</strong>.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard hover className="p-6 sm:p-8 h-full border-2 border-yellow-500/30">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0 text-2xl font-bold text-white">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-yellow-400" />
                      Earn Rewards
                    </h3>
                    <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                      Higher <strong className="text-yellow-400">Kaito scores</strong> mean higher voting power and <strong className="text-green-400">bigger allocations</strong> if you predict winners right.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Cardify Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <GlassCard className="p-6 sm:p-8 border-2 border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    Cardify - AI Prediction Cards
                  </h3>
                  <p className="text-gray-300 text-base sm:text-lg mb-4">
                    Generate a unique <strong className="text-purple-400">AI-powered trading card</strong> featuring your profile and top 5 project predictions. 
                  </p>
                  <a href="https://seedifypredict.com/" target="_blank" rel="noopener noreferrer">
                    <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <LogIn className="w-4 h-4" />
                      Login with X to Generate Card
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Secondary CTA */}
          <div className="text-center">
            <a href="https://seedifypredict.com/" target="_blank" rel="noopener noreferrer">
              <Button 
                size="lg" 
                className="gap-3 text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl"
              >
                <Heart className="w-5 h-5" />
                Show Your Support - Vote Now!
                <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Initial Milestones Offering (IMO) Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-900/10 to-transparent">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Initial Milestones Offering
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              <strong className="text-purple-400">IMO</strong> is designed to align funding, delivery, and accountability.
            </p>
          </div>

          {/* IMO Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <GlassCard className="p-6 sm:p-8 border-2 border-green-500/30">
              <div className="text-center mb-6">
                <Lock className="w-12 h-12 sm:w-16 sm:h-16 text-green-400 mx-auto mb-4" />
                <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
                  Instead of releasing funds upfront, <strong className="text-green-400">IMO ties capital and token vesting</strong> to clearly defined milestones, 
                  verified through <strong className="text-purple-400">AI-powered oracles</strong>, <strong className="text-blue-400">dispute resolution</strong>, 
                  and <strong className="text-yellow-400">community governance</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <GlassCard className="p-4 text-center bg-blue-500/10 border border-blue-500/20">
                  <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h4 className="font-bold text-white mb-2">Builders Protected</h4>
                  <p className="text-sm text-gray-400">Get first part of funding and unlock funds as milestones are achieved</p>
                </GlassCard>
                <GlassCard className="p-4 text-center bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h4 className="font-bold text-white mb-2">Investors Protected</h4>
                  <p className="text-sm text-gray-400">Protected if milestones are not met</p>
                </GlassCard>
                <GlassCard className="p-4 text-center bg-purple-500/10 border border-purple-500/20">
                  <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h4 className="font-bold text-white mb-2">Real-World Ready</h4>
                  <p className="text-sm text-gray-400">Designed for delays, pivots, disputes, and real-world outcomes</p>
                </GlassCard>
              </div>
            </GlassCard>
          </motion.div>

          {/* How IMO Works - Steps */}
          <div className="mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">
              How It Works
            </h3>
            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: 'Project Selection & Milestone Definition',
                  description: 'Projects define a milestone roadmap reviewed against Seedify\'s Milestone Guidelines and approved through community voting before fundraising begins.',
                  icon: FileCheck,
                  color: 'from-blue-500 to-cyan-500',
                },
                {
                  step: 2,
                  title: 'Fundraising & Escrow',
                  description: 'Non-TGE funds and tokens are locked in 3rd party escrow with multisig protections. Only the portion tied to a completed milestone can be released.',
                  icon: Lock,
                  color: 'from-green-500 to-emerald-500',
                },
                {
                  step: 3,
                  title: 'Milestone Delivery & Evidence',
                  description: 'When a milestone deadline arrives, the project submits verifiable evidence of completion.',
                  icon: FileText,
                  color: 'from-purple-500 to-pink-500',
                },
                {
                  step: 4,
                  title: 'AI-Assisted Oracle Verification',
                  description: 'AI-powered oracles evaluate evidence against pre-approved conditions. They provide structured analysis — not final decisions.',
                  icon: Brain,
                  color: 'from-indigo-500 to-purple-500',
                },
                {
                  step: 5,
                  title: 'Seedify Review & Transparency',
                  description: 'Seedify reviews oracle findings, adds contextual analysis, and publishes a transparent report for the community.',
                  icon: Eye,
                  color: 'from-yellow-500 to-orange-500',
                },
                {
                  step: 6,
                  title: 'DAO Decision',
                  description: 'DAO voters make the final call: release funds, deny and refund, or approve partial releases when justified.',
                  icon: Vote,
                  color: 'from-red-500 to-rose-500',
                },
                {
                  step: 7,
                  title: 'Repeat Until Completion',
                  description: 'This process repeats for every milestone until all are completed or the project is terminated.',
                  icon: RefreshCw,
                  color: 'from-teal-500 to-cyan-500',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <GlassCard hover className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 text-xl sm:text-2xl font-bold text-white`}>
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 flex-shrink-0" />
                          <h4 className="text-lg sm:text-xl font-bold text-white">{item.title}</h4>
                        </div>
                        <p className="text-gray-300 text-sm sm:text-base">{item.description}</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Designed for Real-World Complexity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-6 sm:p-8 border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
                Designed for Real-World Complexity
              </h3>
              <p className="text-gray-300 text-center mb-6 text-base sm:text-lg">
                IMO explicitly supports these scenarios through structured community votes:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  'Milestone delays',
                  'Partial releases',
                  'Strategic pivots',
                  'Early delivery',
                  'Disputes & appeals',
                ].map((scenario, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 font-medium">{scenario}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-sm text-center mt-6 italic">
                A full protocol specification and edge-case framework will be published. IMO was designed with real-world complexity in mind — 
                balancing decentralization, accountability, and operational practicality.
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-900/20 via-orange-900/20 to-yellow-900/20">
        <div className="container mx-auto max-w-4xl">
          <GlassCard className="p-6 sm:p-8 md:p-12 text-center border-2 border-red-500/30">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              <Target className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-red-400 mx-auto mb-3 sm:mb-4" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-2">
              We're So Close to Top 5! 🎯
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-4 sm:mb-6 px-2">
              Every vote brings us closer to victory. <strong className="text-yellow-400">Your support matters!</strong>
            </p>
            <p className="text-base sm:text-lg text-gray-400 mb-6 sm:mb-8 px-2">
              Only the <strong className="text-red-400">Top 5 projects win</strong>. We're currently in Top 20. 
              With your help, we can make it to the top!
            </p>
            <a href="https://seedifypredict.com/" target="_blank" rel="noopener noreferrer" className="block w-full sm:w-auto">
              <Button 
                size="lg" 
                className="gap-2 sm:gap-3 text-base sm:text-lg md:text-xl px-6 sm:px-8 md:px-10 py-5 sm:py-6 md:py-7 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-2xl font-bold w-full sm:w-auto"
              >
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <span className="break-words">VOTE NOW - Help Us Win!</span>
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              </Button>
            </a>
          </GlassCard>
        </div>
      </section>

      {/* Testimonials / Social Proof */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              What Makes Us Special? ⭐
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <GlassCard className="p-6">
              <div className="flex items-start gap-4">
                <Star className="w-12 h-12 text-yellow-400 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Proven Technology</h3>
                  <p className="text-gray-300 mb-4">
                    <strong className="text-green-400">115/115 tests passing</strong>. All smart contracts verified on opBNBScan. 
                    Security audits passed. We're not promises - we're <strong className="text-purple-400">production-ready</strong>.
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-start gap-4">
                <Award className="w-12 h-12 text-purple-400 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Real Innovation</h3>
                  <p className="text-gray-300 mb-4">
                    <strong className="text-purple-400">World's first</strong> prediction market with 5-AI consensus oracle. 
                    First with 100% insurance guarantee. First with Reputation NFTs. We're <strong className="text-yellow-400">leading the way</strong>.
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-start gap-4">
                <Shield className="w-12 h-12 text-blue-400 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Your Money is Safe</h3>
                  <p className="text-gray-300 mb-4">
                    <strong className="text-green-400">100% insurance protection</strong>. If our oracle fails, you get FULL refund. 
                    No other prediction market offers this level of protection. We <strong className="text-blue-400">guarantee your safety</strong>.
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-start gap-4">
                <Zap className="w-12 h-12 text-yellow-400 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Built for Everyone</h3>
                  <p className="text-gray-300 mb-4">
                    Ultra-low fees (<strong className="text-yellow-400">&lt;$0.001</strong> per transaction). 
                    Free tier AI models. We're building for the <strong className="text-pink-400">community, not profits</strong>.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <GlassCard className="p-6 sm:p-8 md:p-10 lg:p-16 text-center relative overflow-hidden border-4 border-yellow-500/50">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-red-500/20 to-purple-500/20 animate-pulse" />
            
            <div className="relative z-10">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              >
                <Trophy className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 text-yellow-400 mx-auto mb-4 sm:mb-6" />
              </motion.div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 px-2">
                Ready to Help Us Win? 🏆
              </h2>
              
              <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 mb-6 sm:mb-8 font-semibold px-2">
                Your vote takes <strong className="text-yellow-400">10 seconds</strong> but means <strong className="text-green-400">everything to us</strong>!
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 sm:mb-8 px-2">
                <a href="https://seedifypredict.com/" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto"
                  >
                    <Button 
                      size="lg" 
                      className="gap-2 sm:gap-3 text-base sm:text-lg md:text-xl lg:text-2xl px-6 sm:px-8 md:px-10 lg:px-16 py-5 sm:py-6 md:py-7 lg:py-9 shadow-2xl font-bold w-full sm:w-auto"
                      style={{
                        background: 'linear-gradient(135deg, #fbbf24, #ef4444, #8b5cf6, #10b981, #3b82f6)',
                        backgroundSize: '300% 300%',
                        animation: 'gradientShift 2s ease infinite',
                      }}
                    >
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 flex-shrink-0" />
                      <span className="break-words">VOTE NOW - IT'S FREE!</span>
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 flex-shrink-0" />
                    </Button>
                  </motion.div>
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Takes 10 seconds</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>100% free</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>No signup required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  <span>You're helping innovation</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Additional Links */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-gray-400 mb-4">More ways to support us:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://seedifypredict.com/projects" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2 border-purple-500/50 text-purple-300">
                <ExternalLink className="w-4 h-4" />
                View All Projects
              </Button>
            </a>
            <Link href="/">
              <Button variant="outline" className="gap-2 border-purple-500/50 text-purple-300">
                <ArrowRight className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
