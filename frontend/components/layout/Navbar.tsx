'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Brain, 
  TrendingUp, 
  PlusCircle, 
  Wallet,
  Shield,
  Users,
  ExternalLink,
  PlayCircle,
} from 'lucide-react';
import { ConnectButton, useActiveAccount } from 'thirdweb/react';
import { client, chain } from '@/lib/config/thirdweb';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/effects/GlassCard';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Markets', href: '/markets', icon: TrendingUp },
  { name: 'Create', href: '/create', icon: PlusCircle },
  { name: 'Portfolio', href: '/portfolio', icon: Wallet },
  { name: 'Reputation', href: '/reputation', icon: Users },
  { name: 'Insurance', href: '/insurance', icon: Shield },
  { name: 'DAO', href: '/dao', icon: Brain },
  { name: 'Demo', href: '/demo', icon: PlayCircle },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const account = useActiveAccount();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <>
      <nav className={cn("sticky top-0 z-50 transition-all duration-300", scrolled ? "backdrop-blur-xl" : "")}>
        <GlassCard className={cn(
          "m-4 transition-all duration-300",
          scrolled ? "border-purple-500/30" : "border-purple-500/10"
        )}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    MetaPredict.ai
                  </span>
                  <span className="text-[10px] text-gray-400 -mt-1">opBNB Testnet</span>
                </div>
              </Link>
              
              <div className="hidden md:flex items-center space-x-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "gap-2 transition-all duration-200",
                          isActive 
                            ? "bg-purple-500/20 text-purple-300" 
                            : "text-gray-300 hover:bg-purple-500/10 hover:text-purple-300"
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
              </div>
              
              <div className="hidden md:flex items-center space-x-4">
                {account && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm text-gray-300">Connected</span>
                  </div>
                )}
                <a 
                  href="https://testnet.opbnbscan.com/address/0x8BD96cfd4E9B9ad672698D6C18cece8248Fd34F8#code" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hidden lg:flex"
                >
                  <Button
                    variant="ghost"
                    className="text-gray-300 hover:bg-purple-500/10 hover:text-purple-300 gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Contracts
                  </Button>
                </a>
                <ConnectButton
                  client={client}
                  chain={chain}
                  theme="dark"
                  connectButton={{
                    label: "Connect Wallet",
                    className: "!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !text-white !font-semibold !px-6 !py-2.5 !rounded-lg !transition-all !duration-200 !shadow-lg hover:!shadow-xl"
                  }}
                />
              </div>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-purple-500/10 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </GlassCard>
      </nav>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-x-0 top-24 z-40 mx-4"
          >
            <GlassCard className="p-4 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3",
                        isActive 
                          ? "bg-purple-500/20 text-purple-300" 
                          : "text-gray-300 hover:bg-purple-500/10"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
              <a 
                href="https://testnet.opbnbscan.com/address/0x8BD96cfd4E9B9ad672698D6C18cece8248Fd34F8#code" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-gray-300 hover:bg-purple-500/10"
                >
                  <ExternalLink className="w-5 h-5" />
                  View Contracts
                </Button>
              </a>
              <div className="pt-2 border-t border-white/10">
                <ConnectButton
                  client={client}
                  chain={chain}
                  theme="dark"
                  connectButton={{
                    label: "Connect Wallet",
                    className: "!w-full !bg-gradient-to-r !from-purple-600 !to-pink-600"
                  }}
                />
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
