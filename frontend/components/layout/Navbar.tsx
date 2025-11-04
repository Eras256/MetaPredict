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
} from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/effects/GlassCard';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Markets', href: '/markets', icon: TrendingUp },
  { name: 'Create', href: '/create', icon: PlusCircle },
  { name: 'Portfolio', href: '/portfolio', icon: Wallet },
  { name: 'Insurance', href: '/insurance', icon: Shield },
];

function ConnectWalletButton() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Durante SSR y el primer render del cliente, mostrar el botón de conectar
  // para evitar el mismatch de hidratación
  if (!mounted) {
    return (
      <Button
        disabled
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 opacity-50"
      >
        Connect Wallet
      </Button>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-300">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        <Button variant="outline" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => connect({ connector: connectors[0] })}
      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
    >
      Connect Wallet
    </Button>
  );
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">
        <GlassCard className={cn(
          "transition-all duration-300",
          scrolled ? "border-purple-500/30 backdrop-blur-xl" : "border-purple-500/10 backdrop-blur-sm"
        )}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  TruthChain
                </span>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-2">
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
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
              </div>
              
              {/* Connect Wallet */}
              <div className="hidden md:block">
                <ConnectWalletButton />
              </div>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-purple-500/10 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-white" />
                ) : (
                  <Menu className="h-6 w-6 text-white" />
                )}
              </button>
            </div>
          </div>
        </GlassCard>
      </nav>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden"
          >
            <GlassCard className="m-4 p-4">
              <div className="space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3",
                          isActive 
                            ? "bg-purple-500/20 text-purple-300" 
                            : "text-gray-300 hover:bg-purple-500/10"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
                
                <div className="pt-4">
                  <ConnectWalletButton />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
