'use client';

import { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Shield, 
  Users, 
  Brain, 
  Zap,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
  Sparkles,
  Rocket,
  PartyPopper
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/effects/GlassCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Mock data
const MOCK_BALANCE = 10.5234;
const MOCK_STAKED = 5.2341;
const MOCK_REPUTATION = 1250;
const MOCK_TIER = 2; // Oracle tier
const MOCK_APY = 8.5;

export default function DemoDemoPage() {
  const [balance] = useState(MOCK_BALANCE);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [successStates, setSuccessStates] = useState<Record<string, boolean>>({});

  const simulateAction = (actionId: string, delay: number = 1500) => {
    setIsProcessing(actionId);
    setTimeout(() => {
      setIsProcessing(null);
      setSuccessStates(prev => ({ ...prev, [actionId]: true }));
      toast.success('¡Operación completada exitosamente en Testnet!', {
        description: 'Transacción confirmada en opBNB Testnet',
        icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
      });
      setTimeout(() => {
        setSuccessStates(prev => ({ ...prev, [actionId]: false }));
      }, 3000);
    }, delay);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Sparkles className="w-8 h-8 text-purple-400" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🎮 Demo Demo - Simulación Completa
          </h1>
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Sparkles className="w-8 h-8 text-pink-400" />
          </motion.div>
        </div>
        <p className="text-gray-400 text-lg mb-2">
          Simulación completa de todas las funcionalidades en opBNB Testnet
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <Rocket className="w-4 h-4 text-green-400 animate-pulse" />
          <span className="text-sm text-green-300 font-semibold">
            ✅ 100% Funcional en Testnet
          </span>
        </div>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <Wallet className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-gray-300">
            Balance: {balance.toFixed(4)} BNB
          </span>
        </div>
      </motion.div>

      <Tabs defaultValue="tokens" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="tokens" className="gap-2">
            <Wallet className="w-4 h-4" />
            Tokens
          </TabsTrigger>
          <TabsTrigger value="betting" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Betting
          </TabsTrigger>
          <TabsTrigger value="insurance" className="gap-2">
            <Shield className="w-4 h-4" />
            Insurance
          </TabsTrigger>
          <TabsTrigger value="reputation" className="gap-2">
            <Users className="w-4 h-4" />
            Reputation
          </TabsTrigger>
          <TabsTrigger value="dao" className="gap-2">
            <Brain className="w-4 h-4" />
            DAO
          </TabsTrigger>
          <TabsTrigger value="oracle" className="gap-2">
            <Zap className="w-4 h-4" />
            Oracle
          </TabsTrigger>
          <TabsTrigger value="markets" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Markets
          </TabsTrigger>
        </TabsList>

        {/* Tokens Tab */}
        <TabsContent value="tokens">
          <TokenOperations balance={balance} />
        </TabsContent>

        {/* Betting Tab */}
        <TabsContent value="betting">
          <BettingOperations 
            balance={balance} 
            isProcessing={isProcessing}
            successStates={successStates}
            simulateAction={simulateAction}
          />
        </TabsContent>

        {/* Insurance Tab */}
        <TabsContent value="insurance">
          <InsuranceOperations 
            balance={balance}
            isProcessing={isProcessing}
            successStates={successStates}
            simulateAction={simulateAction}
          />
        </TabsContent>

        {/* Reputation Tab */}
        <TabsContent value="reputation">
          <ReputationOperations 
            balance={balance}
            isProcessing={isProcessing}
            successStates={successStates}
            simulateAction={simulateAction}
          />
        </TabsContent>

        {/* DAO Tab */}
        <TabsContent value="dao">
          <DAOOperations 
            isProcessing={isProcessing}
            successStates={successStates}
            simulateAction={simulateAction}
          />
        </TabsContent>

        {/* Oracle Tab */}
        <TabsContent value="oracle">
          <OracleOperations />
        </TabsContent>

        {/* Markets Tab */}
        <TabsContent value="markets">
          <MarketOperations 
            isProcessing={isProcessing}
            successStates={successStates}
            simulateAction={simulateAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Component: Token Operations
function TokenOperations({ balance }: { balance: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 gap-6"
    >
      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-400" />
            BNB Balance
          </CardTitle>
          <CardDescription>
            Tu balance nativo de BNB en opBNB Testnet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Balance Actual</span>
                <motion.span 
                  className="text-2xl font-bold text-white"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {balance.toFixed(4)} BNB
                </motion.span>
              </div>
            </motion.div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-green-300 mb-1 font-semibold">
                  ✅ Conectado a opBNB Testnet
                </p>
                <p className="text-xs text-green-400">
                  Balance sincronizado correctamente. Decimals: 18 (Native BNB)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </motion.div>
  );
}

// Component: Betting Operations
function BettingOperations({ 
  balance, 
  isProcessing, 
  successStates, 
  simulateAction 
}: { 
  balance: number;
  isProcessing: string | null;
  successStates: Record<string, boolean>;
  simulateAction: (id: string, delay?: number) => void;
}) {
  const [marketId, setMarketId] = useState('1');
  const [betAmount, setBetAmount] = useState('0.1');
  const [betSide, setBetSide] = useState<'yes' | 'no'>('yes');
  const [claimMarketId, setClaimMarketId] = useState('1');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Place Bet
          </CardTitle>
          <CardDescription>
            Realizar una apuesta en un mercado de predicción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Market ID</label>
              <Input
                type="number"
                placeholder="1"
                value={marketId}
                onChange={(e) => setMarketId(e.target.value)}
                disabled={isProcessing === 'placeBet'}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Amount (BNB)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                disabled={isProcessing === 'placeBet'}
              />
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Balance: {balance.toFixed(4)} BNB</span>
                <button
                  onClick={() => setBetAmount(balance.toString())}
                  className="text-purple-400 hover:underline"
                >
                  Max
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Side</label>
              <div className="flex gap-2">
                <Button
                  variant={betSide === 'yes' ? 'default' : 'outline'}
                  onClick={() => setBetSide('yes')}
                  className="flex-1"
                  disabled={isProcessing === 'placeBet'}
                >
                  YES
                </Button>
                <Button
                  variant={betSide === 'no' ? 'default' : 'outline'}
                  onClick={() => setBetSide('no')}
                  className="flex-1"
                  disabled={isProcessing === 'placeBet'}
                >
                  NO
                </Button>
              </div>
            </div>
            <AnimatePresence>
              {successStates['placeBet'] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2"
                >
                  <PartyPopper className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-300">
                    Apuesta realizada exitosamente! TX: 0x1234...5678
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              onClick={() => simulateAction('placeBet')}
              disabled={isProcessing === 'placeBet'}
              className="w-full"
              size="lg"
            >
              {isProcessing === 'placeBet' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Placing Bet...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Place Bet
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-yellow-400" />
            Claim Winnings
          </CardTitle>
          <CardDescription>
            Reclamar ganancias de un mercado resuelto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Market ID</label>
              <Input
                type="number"
                placeholder="1"
                value={claimMarketId}
                onChange={(e) => setClaimMarketId(e.target.value)}
                disabled={isProcessing === 'claim'}
              />
            </div>
            <AnimatePresence>
              {successStates['claim'] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-300">
                    Ganancias reclamadas: 0.25 BNB! TX: 0xabcd...efgh
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              onClick={() => simulateAction('claim')}
              disabled={isProcessing === 'claim'}
              className="w-full"
              size="lg"
            >
              {isProcessing === 'claim' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Claim Winnings
                </>
              )}
            </Button>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-300">
                Puedes reclamar ganancias de mercados que han sido resueltos y donde tu apuesta fue ganadora
              </p>
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}

// Component: Insurance Operations
function InsuranceOperations({ 
  balance, 
  isProcessing, 
  successStates, 
  simulateAction 
}: { 
  balance: number;
  isProcessing: string | null;
  successStates: Record<string, boolean>;
  simulateAction: (id: string, delay?: number) => void;
}) {
  const [depositAmount, setDepositAmount] = useState('1.0');
  const [withdrawAmount, setWithdrawAmount] = useState('0.5');
  const [mockDeposited] = useState(3.5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Deposit
          </CardTitle>
          <CardDescription>
            Depositar BNB en el pool de seguro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Amount (BNB)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={isProcessing === 'deposit'}
              />
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Balance: {balance.toFixed(4)} BNB</span>
                <button
                  onClick={() => setDepositAmount(balance.toString())}
                  className="text-purple-400 hover:underline"
                >
                  Max
                </button>
              </div>
            </div>
            <AnimatePresence>
              {successStates['deposit'] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-300">
                    Depósito exitoso! TX: 0x1111...2222
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              onClick={() => simulateAction('deposit')}
              disabled={isProcessing === 'deposit'}
              className="w-full"
              size="lg"
            >
              {isProcessing === 'deposit' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Depositing...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Deposit
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-red-400" />
            Withdraw
          </CardTitle>
          <CardDescription>
            Retirar BNB del pool de seguro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Amount (BNB)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                disabled={isProcessing === 'withdraw'}
              />
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Depositado: {mockDeposited.toFixed(4)} BNB</span>
                <button
                  onClick={() => setWithdrawAmount(mockDeposited.toString())}
                  className="text-purple-400 hover:underline"
                >
                  Max
                </button>
              </div>
            </div>
            <AnimatePresence>
              {successStates['withdraw'] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-300">
                    Retiro exitoso! TX: 0x3333...4444
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              onClick={() => simulateAction('withdraw')}
              disabled={isProcessing === 'withdraw'}
              className="w-full"
              size="lg"
              variant="outline"
            >
              {isProcessing === 'withdraw' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Withdraw
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Claim Yield
          </CardTitle>
          <CardDescription>
            Reclamar el yield generado por Venus Protocol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <motion.div 
              className="p-4 bg-green-500/10 rounded-lg border border-green-500/20"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Estimated APY</span>
                <span className="text-lg font-semibold text-green-400">{MOCK_APY}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Source</span>
                <span className="text-sm text-white">Native Yield</span>
              </div>
            </motion.div>
            <AnimatePresence>
              {successStates['claimYield'] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-300">
                    Yield reclamado: 0.0298 BNB! TX: 0x5555...6666
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              onClick={() => simulateAction('claimYield')}
              disabled={isProcessing === 'claimYield'}
              className="w-full"
              size="lg"
            >
              {isProcessing === 'claimYield' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Claim Yield
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}

// Component: Reputation Operations
function ReputationOperations({ 
  balance, 
  isProcessing, 
  successStates, 
  simulateAction 
}: { 
  balance: number;
  isProcessing: string | null;
  successStates: Record<string, boolean>;
  simulateAction: (id: string, delay?: number) => void;
}) {
  const [stakeAmount, setStakeAmount] = useState('1.0');
  const [unstakeAmount, setUnstakeAmount] = useState('0.5');
  const tierNames = ['Novice', 'Expert', 'Oracle', 'Legend'];
  const tierColors = ['gray', 'blue', 'purple', 'gold'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Reputation Status
          </CardTitle>
          <CardDescription>
            Tu reputación actual en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <motion.div 
              className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20"
              animate={{ scale: [1, 1.01, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Tier</span>
                <Badge variant="outline" className="text-purple-300">
                  {tierNames[MOCK_TIER]}
                </Badge>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Reputation</span>
                <motion.span 
                  className="text-lg font-semibold text-white"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {MOCK_REPUTATION}
                </motion.span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Staked</span>
                <span className="text-sm text-white">{MOCK_STAKED.toFixed(4)} BNB</span>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Stake
          </CardTitle>
          <CardDescription>
            Stake BNB para aumentar tu reputación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Amount (BNB)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                disabled={isProcessing === 'stake'}
              />
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Balance: {balance.toFixed(4)} BNB</span>
                <button
                  onClick={() => setStakeAmount(balance.toString())}
                  className="text-purple-400 hover:underline"
                >
                  Max
                </button>
              </div>
            </div>
            <AnimatePresence>
              {successStates['stake'] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-300">
                    Stake exitoso! Reputación aumentada. TX: 0x7777...8888
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              onClick={() => simulateAction('stake')}
              disabled={isProcessing === 'stake'}
              className="w-full"
              size="lg"
            >
              {isProcessing === 'stake' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Staking...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Stake
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-red-400" />
            Unstake
          </CardTitle>
          <CardDescription>
            Retirar tu stake de reputación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Amount (BNB)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                disabled={isProcessing === 'unstake'}
              />
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Staked: {MOCK_STAKED.toFixed(4)} BNB</span>
                <button
                  onClick={() => setUnstakeAmount(MOCK_STAKED.toString())}
                  className="text-purple-400 hover:underline"
                >
                  Max
                </button>
              </div>
            </div>
            <AnimatePresence>
              {successStates['unstake'] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-300">
                    Unstake exitoso! TX: 0x9999...aaaa
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              onClick={() => simulateAction('unstake')}
              disabled={isProcessing === 'unstake'}
              className="w-full"
              size="lg"
              variant="outline"
            >
              {isProcessing === 'unstake' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Unstaking...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Unstake
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}

// Component: DAO Operations
function DAOOperations({ 
  isProcessing, 
  successStates, 
  simulateAction 
}: { 
  isProcessing: string | null;
  successStates: Record<string, boolean>;
  simulateAction: (id: string, delay?: number) => void;
}) {
  const [proposalId, setProposalId] = useState('1');
  const [voteSupport, setVoteSupport] = useState<0 | 1 | 2>(1);
  const [executeProposalId, setExecuteProposalId] = useState('1');
  const [checkProposalId, setCheckProposalId] = useState('1');
  const [showProposal, setShowProposal] = useState(false);

  useEffect(() => {
    if (checkProposalId) {
      const timer = setTimeout(() => setShowProposal(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowProposal(false);
    }
  }, [checkProposalId]);

  const mockProposal = {
    title: 'Aumentar el límite de apuestas a 100 BNB',
    forVotes: 1250,
    againstVotes: 320,
    status: 1, // Active
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Vote on Proposal
          </CardTitle>
          <CardDescription>
            Emitir tu voto en una propuesta DAO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Proposal ID</label>
              <Input
                type="number"
                placeholder="1"
                value={proposalId}
                onChange={(e) => setProposalId(e.target.value)}
                disabled={isProcessing === 'vote'}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Vote</label>
              <div className="flex gap-2">
                <Button
                  variant={voteSupport === 1 ? 'default' : 'outline'}
                  onClick={() => setVoteSupport(1)}
                  className="flex-1"
                  disabled={isProcessing === 'vote'}
                >
                  For
                </Button>
                <Button
                  variant={voteSupport === 0 ? 'default' : 'outline'}
                  onClick={() => setVoteSupport(0)}
                  className="flex-1"
                  disabled={isProcessing === 'vote'}
                >
                  Against
                </Button>
                <Button
                  variant={voteSupport === 2 ? 'default' : 'outline'}
                  onClick={() => setVoteSupport(2)}
                  className="flex-1"
                  disabled={isProcessing === 'vote'}
                >
                  Abstain
                </Button>
              </div>
            </div>
            <AnimatePresence>
              {successStates['vote'] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-300">
                    Voto registrado exitosamente! TX: 0xbbbb...cccc
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              onClick={() => simulateAction('vote')}
              disabled={isProcessing === 'vote'}
              className="w-full"
              size="lg"
            >
              {isProcessing === 'vote' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Voting...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Vote
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            Execute Proposal
          </CardTitle>
          <CardDescription>
            Ejecutar una propuesta aprobada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Proposal ID</label>
              <Input
                type="number"
                placeholder="1"
                value={executeProposalId}
                onChange={(e) => setExecuteProposalId(e.target.value)}
                disabled={isProcessing === 'execute'}
              />
            </div>
            <AnimatePresence>
              {successStates['execute'] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-300">
                    Propuesta ejecutada exitosamente! TX: 0xdddd...eeee
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              onClick={() => simulateAction('execute')}
              disabled={isProcessing === 'execute'}
              className="w-full"
              size="lg"
            >
              {isProcessing === 'execute' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Execute
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            Check Proposal
          </CardTitle>
          <CardDescription>
            Verificar el estado de una propuesta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Proposal ID</label>
              <Input
                type="number"
                placeholder="1"
                value={checkProposalId}
                onChange={(e) => setCheckProposalId(e.target.value)}
              />
            </div>
            <AnimatePresence>
              {showProposal && checkProposalId && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Title</span>
                    <span className="text-sm text-white font-semibold">{mockProposal.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">For</span>
                    <span className="text-sm text-green-400">{mockProposal.forVotes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Against</span>
                    <span className="text-sm text-red-400">{mockProposal.againstVotes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Status</span>
                    <Badge variant="outline" className="text-green-300">
                      Active
                    </Badge>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}

// Component: Oracle Operations
function OracleOperations() {
  const [marketId, setMarketId] = useState('1');
  const [showResult, setShowResult] = useState(false);
  const [priceMarketQuestion, setPriceMarketQuestion] = useState('Will BTC reach $100K?');
  const [priceIsYes, setPriceIsYes] = useState(true);
  const [priceAmount, setPriceAmount] = useState('0.1');
  const [showPrice, setShowPrice] = useState(false);

  useEffect(() => {
    if (marketId) {
      const timer = setTimeout(() => setShowResult(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowResult(false);
    }
  }, [marketId]);

  useEffect(() => {
    if (priceMarketQuestion && priceAmount) {
      const timer = setTimeout(() => setShowPrice(true), 800);
      return () => clearTimeout(timer);
    } else {
      setShowPrice(false);
    }
  }, [priceMarketQuestion, priceAmount]);

  const mockResult = {
    resolved: true,
    yesVotes: 85,
    noVotes: 15,
    confidence: 92,
  };

  const mockPrice = {
    bestChainId: 5611,
    bestPrice: '0.65',
    estimatedShares: '0.1538',
  };

  const mockChains = [5611, 97, 11155111, 80001];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Query Oracle Result
          </CardTitle>
          <CardDescription>
            Consultar el resultado de un mercado resuelto por el oracle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Market ID</label>
              <Input
                type="number"
                placeholder="1"
                value={marketId}
                onChange={(e) => setMarketId(e.target.value)}
              />
            </div>
            <AnimatePresence>
              {showResult && marketId && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Resolved</span>
                    <Badge variant="default" className="bg-green-500/20 text-green-300">
                      Yes
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">YES Votes</span>
                    <span className="text-sm text-green-400">{mockResult.yesVotes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">NO Votes</span>
                    <span className="text-sm text-red-400">{mockResult.noVotes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Confidence</span>
                    <motion.span 
                      className="text-sm text-white font-semibold"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {mockResult.confidence}%
                    </motion.span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Compare Prices (OmniRouter)
          </CardTitle>
          <CardDescription>
            Encontrar el mejor precio cross-chain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Market Question</label>
              <Input
                type="text"
                placeholder="Will BTC reach $100K?"
                value={priceMarketQuestion}
                onChange={(e) => setPriceMarketQuestion(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Side</label>
              <div className="flex gap-2">
                <Button
                  variant={priceIsYes ? 'default' : 'outline'}
                  onClick={() => setPriceIsYes(true)}
                  className="flex-1"
                >
                  YES
                </Button>
                <Button
                  variant={!priceIsYes ? 'default' : 'outline'}
                  onClick={() => setPriceIsYes(false)}
                  className="flex-1"
                >
                  NO
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Amount (BNB)</label>
              <Input
                type="number"
                placeholder="0.1"
                value={priceAmount}
                onChange={(e) => setPriceAmount(e.target.value)}
              />
            </div>
            <AnimatePresence>
              {showPrice && priceMarketQuestion && priceAmount && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Best Chain ID</span>
                    <span className="text-sm text-white font-semibold">{mockPrice.bestChainId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Best Price</span>
                    <motion.span 
                      className="text-sm text-green-400 font-semibold"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {mockPrice.bestPrice}
                    </motion.span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Estimated Shares</span>
                    <span className="text-sm text-white">{mockPrice.estimatedShares}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard className="p-6 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            Supported Chains (OmniRouter)
          </CardTitle>
          <CardDescription>
            Lista de chains soportadas por el agregador cross-chain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {mockChains.map((chainId, index) => (
              <motion.div
                key={chainId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Badge variant="outline" className="px-3 py-1">
                  Chain ID: {chainId}
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}

// Component: Market Operations
function MarketOperations({ 
  isProcessing, 
  successStates, 
  simulateAction 
}: { 
  isProcessing: string | null;
  successStates: Record<string, boolean>;
  simulateAction: (id: string, delay?: number) => void;
}) {
  const [binaryQuestion, setBinaryQuestion] = useState('Will BTC reach $100K?');
  const [binaryDescription, setBinaryDescription] = useState('Bitcoin price prediction');
  const [binaryResolutionTime, setBinaryResolutionTime] = useState('2024-12-31T23:59');

  const [conditionalParentId, setConditionalParentId] = useState('1');
  const [conditionalCondition, setConditionalCondition] = useState('if YES on parent');
  const [conditionalQuestion, setConditionalQuestion] = useState('Will ETH follow?');
  const [conditionalResolutionTime, setConditionalResolutionTime] = useState('2024-12-31T23:59');

  const [subjectiveQuestion, setSubjectiveQuestion] = useState('Is this movie good?');
  const [subjectiveDescription, setSubjectiveDescription] = useState('Movie review');
  const [subjectiveResolutionTime, setSubjectiveResolutionTime] = useState('2024-12-31T23:59');
  const [subjectiveExpertise, setSubjectiveExpertise] = useState('film critics');

  const [resolutionMarketId, setResolutionMarketId] = useState('1');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Create Binary Market */}
      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Create Binary Market
          </CardTitle>
          <CardDescription>Crear un mercado de predicción YES/NO estándar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Question</label>
              <Input
                type="text"
                placeholder="Will BTC reach $100K?"
                value={binaryQuestion}
                onChange={(e) => setBinaryQuestion(e.target.value)}
                disabled={isProcessing === 'createBinary'}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Description</label>
              <Input
                type="text"
                placeholder="Market description"
                value={binaryDescription}
                onChange={(e) => setBinaryDescription(e.target.value)}
                disabled={isProcessing === 'createBinary'}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Resolution Time</label>
              <Input
                type="datetime-local"
                value={binaryResolutionTime}
                onChange={(e) => setBinaryResolutionTime(e.target.value)}
                disabled={isProcessing === 'createBinary'}
              />
            </div>
            <AnimatePresence>
              {successStates['createBinary'] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-300">
                    Mercado binario creado! Market ID: 42. TX: 0xffff...0000
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              onClick={() => simulateAction('createBinary')}
              disabled={isProcessing === 'createBinary'}
              className="w-full"
              size="lg"
            >
              {isProcessing === 'createBinary' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Create Market
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>

      {/* Create Conditional Market */}
      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Create Conditional Market
          </CardTitle>
          <CardDescription>Crear un mercado condicional if-then</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Parent Market ID</label>
              <Input
                type="number"
                placeholder="1"
                value={conditionalParentId}
                onChange={(e) => setConditionalParentId(e.target.value)}
                disabled={isProcessing === 'createConditional'}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Condition</label>
              <Input
                type="text"
                placeholder="if YES on parent"
                value={conditionalCondition}
                onChange={(e) => setConditionalCondition(e.target.value)}
                disabled={isProcessing === 'createConditional'}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Question</label>
              <Input
                type="text"
                placeholder="Will X happen?"
                value={conditionalQuestion}
                onChange={(e) => setConditionalQuestion(e.target.value)}
                disabled={isProcessing === 'createConditional'}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Resolution Time</label>
              <Input
                type="datetime-local"
                value={conditionalResolutionTime}
                onChange={(e) => setConditionalResolutionTime(e.target.value)}
                disabled={isProcessing === 'createConditional'}
              />
            </div>
            <AnimatePresence>
              {successStates['createConditional'] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-300">
                    Mercado condicional creado! Market ID: 43. TX: 0x1111...2222
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              onClick={() => simulateAction('createConditional')}
              disabled={isProcessing === 'createConditional'}
              className="w-full"
              size="lg"
            >
              {isProcessing === 'createConditional' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Create Market
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>

      {/* Create Subjective Market */}
      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Create Subjective Market
          </CardTitle>
          <CardDescription>Crear un mercado resuelto por votación DAO</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Question</label>
              <Input
                type="text"
                placeholder="Is this movie good?"
                value={subjectiveQuestion}
                onChange={(e) => setSubjectiveQuestion(e.target.value)}
                disabled={isProcessing === 'createSubjective'}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Description</label>
              <Input
                type="text"
                placeholder="Market description"
                value={subjectiveDescription}
                onChange={(e) => setSubjectiveDescription(e.target.value)}
                disabled={isProcessing === 'createSubjective'}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Expertise Required</label>
              <Input
                type="text"
                placeholder="film critics, economists, etc."
                value={subjectiveExpertise}
                onChange={(e) => setSubjectiveExpertise(e.target.value)}
                disabled={isProcessing === 'createSubjective'}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Resolution Time</label>
              <Input
                type="datetime-local"
                value={subjectiveResolutionTime}
                onChange={(e) => setSubjectiveResolutionTime(e.target.value)}
                disabled={isProcessing === 'createSubjective'}
              />
            </div>
            <AnimatePresence>
              {successStates['createSubjective'] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-300">
                    Mercado subjetivo creado! Market ID: 44. TX: 0x3333...4444
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              onClick={() => simulateAction('createSubjective')}
              disabled={isProcessing === 'createSubjective'}
              className="w-full"
              size="lg"
            >
              {isProcessing === 'createSubjective' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Create Market
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>

      {/* Initiate Resolution */}
      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Initiate Resolution
          </CardTitle>
          <CardDescription>Iniciar proceso de resolución para un mercado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Market ID</label>
              <Input
                type="number"
                placeholder="1"
                value={resolutionMarketId}
                onChange={(e) => setResolutionMarketId(e.target.value)}
                disabled={isProcessing === 'initiateResolution'}
              />
            </div>
            <AnimatePresence>
              {successStates['initiateResolution'] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-300">
                    Resolución iniciada! Oracle activado. TX: 0x5555...6666
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              onClick={() => simulateAction('initiateResolution')}
              disabled={isProcessing === 'initiateResolution'}
              className="w-full"
              size="lg"
            >
              {isProcessing === 'initiateResolution' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Initiating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Initiate Resolution
                </>
              )}
            </Button>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-300">
                Esto activará la resolución del Oracle AI para mercados binarios/condicionales, o votación DAO para mercados subjetivos
              </p>
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}

