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
  Home,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import { useActiveAccount } from 'thirdweb/react';
import { client, chains } from '@/lib/config/thirdweb';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/effects/GlassCard';
import { ConnectButtonWrapper } from '@/components/ui/ConnectButtonWrapper';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Portfolio', href: '/portfolio', icon: Wallet },
];

// Markets submenu
const marketsSubmenu = [
  { name: 'Explore Markets', href: '/markets', icon: TrendingUp },
  { name: 'Create Market', href: '/create', icon: PlusCircle },
];

// Items que pueden ir en un submenu en mobile
const secondaryNavigation = [
  { name: 'Reputation', href: '/reputation', icon: Users },
  { name: 'Insurance', href: '/insurance', icon: Shield },
  { name: 'DAO', href: '/dao', icon: Brain },
  { name: 'Demo', href: '/demo', icon: PlayCircle },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);
  const [marketsSubmenuOpen, setMarketsSubmenuOpen] = useState(false);
  const [marketsSubmenuHover, setMarketsSubmenuHover] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const account = useActiveAccount();
  
  const isMarketsActive = pathname === '/markets' || pathname === '/create';
  
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
          "m-2 sm:m-3 md:m-4 transition-all duration-300",
          scrolled ? "border-purple-500/30" : "border-purple-500/10"
        )}>
          <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Brain className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    MetaPredict.fun
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-gray-400 -mt-0.5 sm:-mt-1 hidden sm:block">opBNB Testnet</span>
                </div>
              </Link>
              
              <div className="hidden lg:flex items-center space-x-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "gap-1.5 sm:gap-2 transition-all duration-200 text-sm",
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
                
                {/* Markets with submenu */}
                <div 
                  className="relative"
                  onMouseEnter={() => setMarketsSubmenuHover(true)}
                  onMouseLeave={() => setMarketsSubmenuHover(false)}
                >
                  <Link href="/markets">
                    <Button
                      variant="ghost"
                      className={cn(
                        "gap-1.5 sm:gap-2 transition-all duration-200 text-sm",
                        isMarketsActive 
                          ? "bg-purple-500/20 text-purple-300" 
                          : "text-gray-300 hover:bg-purple-500/10 hover:text-purple-300"
                      )}
                    >
                      <TrendingUp className="w-4 h-4" />
                      Markets
                      <ChevronDown className={cn(
                        "w-3 h-3 transition-transform duration-200",
                        marketsSubmenuHover && "rotate-180"
                      )} />
                    </Button>
                  </Link>
                  
                  <AnimatePresence>
                    {marketsSubmenuHover && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-44 sm:w-48 z-50"
                        onMouseEnter={() => setMarketsSubmenuHover(true)}
                        onMouseLeave={() => setMarketsSubmenuHover(false)}
                      >
                        <GlassCard className="p-2 space-y-1">
                          {marketsSubmenu.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                              <Link key={item.name} href={item.href}>
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    "w-full justify-start gap-1.5 sm:gap-2 text-xs sm:text-sm",
                                    isActive 
                                      ? "bg-purple-500/20 text-purple-300" 
                                      : "text-gray-300 hover:bg-purple-500/10 hover:text-purple-300"
                                  )}
                                >
                                  <item.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                                  {item.name}
                                </Button>
                              </Link>
                            );
                          })}
                        </GlassCard>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {secondaryNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "gap-1.5 sm:gap-2 transition-all duration-200 text-sm",
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
              
              {/* Tablet menu - muestra menos items */}
              <div className="hidden md:flex lg:hidden items-center space-x-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "gap-1 transition-all duration-200 px-1.5 sm:px-2",
                          isActive 
                            ? "bg-purple-500/20 text-purple-300" 
                            : "text-gray-300 hover:bg-purple-500/10 hover:text-purple-300"
                        )}
                      >
                        <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="text-xs">{item.name}</span>
                      </Button>
                    </Link>
                  );
                })}
                
                {/* Markets con submenú en tablet */}
                <div className="relative">
                  <Link href="/markets">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "gap-1 transition-all duration-200 px-1.5 sm:px-2",
                        isMarketsActive 
                          ? "bg-purple-500/20 text-purple-300" 
                          : "text-gray-300 hover:bg-purple-500/10 hover:text-purple-300"
                      )}
                    >
                      <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="text-xs">Markets</span>
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
                {account && (
                  <div className="hidden lg:flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs sm:text-sm text-gray-300">Connected</span>
                  </div>
                )}
                <ConnectButtonWrapper
                  client={client}
                  chains={chains}
                  theme="dark"
                  connectButton={{
                    label: "Connect",
                    className: "!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !text-white !font-semibold !px-3 sm:!px-4 lg:!px-6 !py-1.5 sm:!py-2 !lg:!py-2.5 !rounded-lg !transition-all !duration-200 !shadow-lg hover:!shadow-xl !text-xs sm:!text-sm lg:!text-base"
                  }}
                />
              </div>
              
              <div className="md:hidden flex items-center gap-1.5 sm:gap-2">
                <ConnectButtonWrapper
                  client={client}
                  chains={chains}
                  theme="dark"
                  connectButton={{
                    label: "Connect",
                    className: "!bg-gradient-to-r !from-purple-600 !to-pink-600 !text-white !font-semibold !px-2 sm:!px-3 !py-1 sm:!py-1.5 !rounded-lg !text-xs"
                  }}
                />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-purple-500/10 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
              </div>
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
            className="md:hidden fixed inset-x-0 top-20 sm:top-24 z-40 mx-2 sm:mx-4"
          >
            <GlassCard className="p-3 sm:p-4 space-y-1.5 sm:space-y-2 max-h-[calc(100vh-100px)] sm:max-h-[calc(100vh-120px)] overflow-y-auto">
              {/* Main Navigation */}
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
                return (
                  <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-2 sm:gap-3 text-sm sm:text-base",
                        isActive 
                          ? "bg-purple-500/20 text-purple-300" 
                          : "text-gray-300 hover:bg-purple-500/10"
                      )}
                    >
                      <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
              
              {/* Markets con submenú en mobile */}
              <div>
                <button
                  onClick={() => setMarketsSubmenuOpen(!marketsSubmenuOpen)}
                  className={cn(
                    "w-full flex items-center justify-between p-2 sm:p-2.5 rounded-lg transition-colors text-sm sm:text-base",
                    isMarketsActive
                      ? "bg-purple-500/20 text-purple-300"
                      : "text-gray-300 hover:bg-purple-500/10"
                  )}
                >
                  <span className="flex items-center gap-2 sm:gap-3">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Markets</span>
                  </span>
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    marketsSubmenuOpen && "rotate-180"
                  )} />
                </button>
                
                <AnimatePresence>
                  {marketsSubmenuOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-3 sm:pl-4 pt-1.5 sm:pt-2 space-y-1">
                        {marketsSubmenu.map((item) => {
                          const isActive = pathname === item.href;
                          return (
                            <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start gap-2 sm:gap-3 text-xs sm:text-sm",
                                  isActive 
                                    ? "bg-purple-500/20 text-purple-300" 
                                    : "text-gray-400 hover:bg-purple-500/10 hover:text-gray-300"
                                )}
                              >
                                <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                {item.name}
                              </Button>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Secondary Navigation with Submenu */}
              <div className="pt-1.5 sm:pt-2 border-t border-white/10">
                <button
                  onClick={() => setMobileSubmenuOpen(!mobileSubmenuOpen)}
                  className="w-full flex items-center justify-between p-2 sm:p-2.5 rounded-lg hover:bg-purple-500/10 transition-colors text-gray-300 text-sm sm:text-base"
                >
                  <span className="flex items-center gap-2 sm:gap-3">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>More</span>
                  </span>
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    mobileSubmenuOpen && "rotate-180"
                  )} />
                </button>
                
                <AnimatePresence>
                  {mobileSubmenuOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-3 sm:pl-4 pt-1.5 sm:pt-2 space-y-1">
                        {secondaryNavigation.map((item) => {
                          const isActive = pathname === item.href;
                          return (
                            <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                                className={cn(
                                  "w-full justify-start gap-2 sm:gap-3 text-xs sm:text-sm",
                                  isActive 
                                    ? "bg-purple-500/20 text-purple-300" 
                                    : "text-gray-400 hover:bg-purple-500/10 hover:text-gray-300"
                                )}
                >
                                <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                {item.name}
                </Button>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
