'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  FileText,
  Trophy,
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
  { name: 'Vote Now', href: '/docs', icon: Trophy, isVoteButton: true },
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
            <div className="flex items-center justify-between h-14 sm:h-16 min-w-0">
              <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 group flex-shrink-0 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-xl overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <Image 
                    src="/logos/MINS.png" 
                    alt="MetaPredict Logo" 
                    width={40} 
                    height={40} 
                    className="w-full h-full object-contain p-0.5"
                    priority
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent truncate">
                    MetaPredict
                  </span>
                  <span className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-400 -mt-0.5 sm:-mt-1 hidden sm:block truncate">opBNB Testnet</span>
                </div>
              </Link>
              
              <div className="hidden lg:flex items-center space-x-0.5 xl:space-x-1 flex-shrink-0">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
                  const isVoteButton = (item as any).isVoteButton;
                  
                  if (isVoteButton) {
                    return (
                      <Link key={item.name} href={item.href} className="flex-shrink-0">
                        <motion.div
                          animate={{
                            background: [
                              'linear-gradient(135deg, #fbbf24, #f59e0b)',
                              'linear-gradient(135deg, #ef4444, #dc2626)',
                              'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                              'linear-gradient(135deg, #10b981, #059669)',
                              'linear-gradient(135deg, #3b82f6, #2563eb)',
                              'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            ],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          className="rounded-lg p-[2px]"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "gap-1.5 transition-all duration-200 text-xs xl:text-sm px-2 xl:px-3 font-bold relative overflow-hidden",
                              "bg-gray-900 text-white hover:bg-gray-800"
                            )}
                          >
                            <motion.span
                              animate={{
                                color: ['#fbbf24', '#ef4444', '#8b5cf6', '#10b981', '#3b82f6', '#fbbf24'],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                              className="flex items-center gap-1.5"
                            >
                              <item.icon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                              {item.name}
                            </motion.span>
                          </Button>
                        </motion.div>
                      </Link>
                    );
                  }
                  
                  return (
                    <Link key={item.name} href={item.href} className="flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "gap-1.5 transition-all duration-200 text-xs xl:text-sm px-2 xl:px-3",
                          isActive 
                            ? "bg-purple-500/20 text-purple-300" 
                            : "text-gray-300 hover:bg-purple-500/10 hover:text-purple-300"
                        )}
                      >
                        <item.icon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
                
                {/* Markets with submenu */}
                <div 
                  className="relative flex-shrink-0"
                  onMouseEnter={() => setMarketsSubmenuHover(true)}
                  onMouseLeave={() => setMarketsSubmenuHover(false)}
                >
                  <Link href="/markets">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "gap-1.5 transition-all duration-200 text-xs xl:text-sm px-2 xl:px-3",
                        isMarketsActive 
                          ? "bg-purple-500/20 text-purple-300" 
                          : "text-gray-300 hover:bg-purple-500/10 hover:text-purple-300"
                      )}
                    >
                      <TrendingUp className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
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
                    <Link key={item.name} href={item.href} className="flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "gap-1.5 transition-all duration-200 text-xs xl:text-sm px-2 xl:px-3",
                          isActive 
                            ? "bg-purple-500/20 text-purple-300" 
                            : "text-gray-300 hover:bg-purple-500/10 hover:text-purple-300"
                        )}
                      >
                        <item.icon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
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
                  const isVoteButton = (item as any).isVoteButton;
                  
                  if (isVoteButton) {
                    return (
                      <Link key={item.name} href={item.href}>
                        <motion.div
                          animate={{
                            background: [
                              'linear-gradient(135deg, #fbbf24, #f59e0b)',
                              'linear-gradient(135deg, #ef4444, #dc2626)',
                              'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                              'linear-gradient(135deg, #10b981, #059669)',
                              'linear-gradient(135deg, #3b82f6, #2563eb)',
                              'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            ],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          className="rounded-lg p-[2px]"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "gap-1 transition-all duration-200 px-1.5 sm:px-2 font-bold",
                              "bg-gray-900 text-white hover:bg-gray-800"
                            )}
                          >
                            <motion.span
                              animate={{
                                color: ['#fbbf24', '#ef4444', '#8b5cf6', '#10b981', '#3b82f6', '#fbbf24'],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                              className="flex items-center gap-1"
                            >
                              <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              <span className="text-xs">{item.name}</span>
                            </motion.span>
                          </Button>
                        </motion.div>
                      </Link>
                    );
                  }
                  
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
              
              <div className="hidden md:flex items-center space-x-1.5 lg:space-x-2 xl:space-x-4 flex-shrink-0">
                {account && (
                  <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-gray-300">Connected</span>
                  </div>
                )}
                <ConnectButtonWrapper
                  client={client}
                  chains={chains}
                  theme="dark"
                  connectButton={{
                    label: "Connect",
                    className: "!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !text-white !font-semibold !px-2 md:!px-3 lg:!px-4 xl:!px-6 !py-1 md:!py-1.5 lg:!py-2 !rounded-lg !transition-all !duration-200 !shadow-lg hover:!shadow-xl !text-xs md:!text-sm !whitespace-nowrap"
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
                const isVoteButton = (item as any).isVoteButton;
                
                if (isVoteButton) {
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                      <motion.div
                        animate={{
                          background: [
                            'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            'linear-gradient(135deg, #ef4444, #dc2626)',
                            'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            'linear-gradient(135deg, #10b981, #059669)',
                            'linear-gradient(135deg, #3b82f6, #2563eb)',
                            'linear-gradient(135deg, #fbbf24, #f59e0b)',
                          ],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="rounded-lg p-[2px] w-full"
                      >
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-2 sm:gap-3 text-sm sm:text-base font-bold",
                            "bg-gray-900 text-white hover:bg-gray-800"
                          )}
                        >
                          <motion.span
                            animate={{
                              color: ['#fbbf24', '#ef4444', '#8b5cf6', '#10b981', '#3b82f6', '#fbbf24'],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                            className="flex items-center gap-2 sm:gap-3"
                          >
                            <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            {item.name}
                          </motion.span>
                        </Button>
                      </motion.div>
                    </Link>
                  );
                }
                
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
