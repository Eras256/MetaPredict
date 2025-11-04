'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InsuranceStats } from '@/components/insurance/InsuranceStats';
import { DepositPanel } from '@/components/insurance/DepositPanel';
import { ClaimPanel } from '@/components/insurance/ClaimPanel';

export default function InsurancePage() {
  const [activeTab, setActiveTab] = useState<'stats' | 'deposit' | 'claims'>('stats');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Insurance Pool
          </h1>
          <p className="text-gray-400 text-lg">
            Protect your investments with insurance coverage
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'stats', label: 'Pool Stats', icon: Shield },
            { id: 'deposit', label: 'Deposit', icon: DollarSign },
            { id: 'claims', label: 'Claims', icon: AlertCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab === 'stats' && <InsuranceStats />}
          {activeTab === 'deposit' && <DepositPanel />}
          {activeTab === 'claims' && <ClaimPanel />}
        </div>
      </div>
    </div>
  );
}

