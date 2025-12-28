'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, ExternalLink, Brain, Code, Shield, Zap, Activity, Globe } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';

// Helper function to generate opBNBScan link
const getContractLink = (address: string) => 
  `https://testnet.opbnbscan.com/address/${address}#code`;

const socials = [
  { icon: Globe, href: 'https://x.com/metapredictbnb', label: 'X' },
  { icon: MessageCircle, href: 'https://t.me/metapredictbnb', label: 'Telegram' },
];

const techStack = [
  { name: 'opBNB', icon: Zap, color: 'text-yellow-400' },
  { name: 'Chainlink', icon: Activity, color: 'text-blue-400' },
  { name: 'Gemini', icon: Brain, color: 'text-purple-400' },
  { name: 'Next.js', icon: Code, color: 'text-white' },
];

export function Footer() {
  // Calculate footerLinks inside component to avoid hydration mismatch
  const footerLinks = useMemo(() => ({
    product: [
      { name: 'Markets', href: '/markets' },
      { name: 'Create Market', href: '/create' },
      { name: 'Insurance Pool', href: '/insurance' },
      { name: 'Reputation', href: '/reputation' },
      { name: 'DAO Governance', href: '/dao' },
    ],
    contracts: [
      { 
        name: 'Prediction Market Core', 
        href: getContractLink(CONTRACT_ADDRESSES.CORE_CONTRACT),
        external: true 
      },
      { 
        name: 'AI Oracle', 
        href: getContractLink(CONTRACT_ADDRESSES.AI_ORACLE),
        external: true 
      },
      { 
        name: 'Insurance Pool', 
        href: getContractLink(CONTRACT_ADDRESSES.INSURANCE_POOL),
        external: true 
      },
      { 
        name: 'Chainlink Data Streams', 
        href: getContractLink(CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION),
        external: true 
      },
      { 
        name: 'View All Contracts', 
        href: 'https://testnet.opbnbscan.com/',
        external: true 
      },
    ],
    resources: [
      { name: 'opBNBScan Explorer', href: 'https://testnet.opbnbscan.com/', external: true },
      { name: 'Chainlink Docs', href: 'https://docs.chain.link/', external: true },
      { name: 'opBNB Docs', href: 'https://docs.bnbchain.org/bnb-opbnb/overview/', external: true },
    ],
    community: [
      { name: 'X', href: 'https://x.com/metapredictbnb', external: true },
      { name: 'Telegram', href: 'https://t.me/metapredictbnb', external: true },
    ],
    legal: [
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Disclaimer', href: '/disclaimer' },
    ],
  }), []);

  return (
    <footer className="relative mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlassCard className="p-4 sm:p-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 mb-6 md:mb-8">
            <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-2">
              <Link href="/" className="flex items-center space-x-3 mb-4 group">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Image 
                    src="/logos/METAPREDICT.png" 
                    alt="MetaPredict Logo" 
                    width={40} 
                    height={40} 
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    MetaPredict.fun
                  </span>
                  <span className="text-xs text-gray-400">AI-Powered Prediction Markets</span>
                </div>
              </Link>
              <p className="text-sm text-gray-400 mb-4 max-w-xs">
                The first all-in-one prediction market platform with 5-AI consensus oracle. Powered by <strong>Gemini (Google)</strong>, <strong>Meta (Facebook)</strong> and <strong>Mistral AI</strong>. Chainlink Data Streams, and insurance protection. Built on opBNB Testnet.
              </p>
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                {socials.map((social) => (
                  <a 
                    key={social.label} 
                    href={social.href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 flex items-center justify-center transition-colors group" 
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </a>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {techStack.map((tech) => (
                  <div key={tech.name} className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/5 border border-purple-500/10">
                    <tech.icon className={`w-3 h-3 ${tech.color}`} />
                    <span className="text-xs text-gray-400">{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Product</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Contracts</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {footerLinks.contracts.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      target={link.external ? "_blank" : undefined} 
                      rel={link.external ? "noopener noreferrer" : undefined} 
                      className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-1"
                    >
                      {link.name}
                      {link.external && <ExternalLink className="w-3 h-3" />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Resources</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      target={link.external ? "_blank" : undefined} 
                      rel={link.external ? "noopener noreferrer" : undefined} 
                      className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-1"
                    >
                      {link.name}
                      {link.external && <ExternalLink className="w-3 h-3" />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Community</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {footerLinks.community.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      target={link.external ? "_blank" : undefined} 
                      rel={link.external ? "noopener noreferrer" : undefined} 
                      className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-1"
                    >
                      {link.name}
                      {link.external && <ExternalLink className="w-3 h-3" />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Legal</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 md:pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col gap-2 text-center md:text-left">
              <p className="text-xs sm:text-sm text-gray-400">Develop by Vaiosx Made by MetaPredict Team</p>
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 sm:gap-4 text-xs text-gray-500">
                <span>Network: opBNB Testnet (5611)</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                opBNB
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                5-AI Consensus
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                Insurance Protected
              </span>
            </div>
          </div>

          <div className="mt-4 md:mt-6 p-3 sm:p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs sm:text-sm text-yellow-200/80 text-center leading-relaxed">
              <strong>Disclaimer:</strong> MetaPredict.fun is a decentralized prediction market protocol running on opBNB Testnet. 
              This is experimental software. Participation may not be legal in your jurisdiction. Users are responsible for compliance with local laws. 
              This is not financial advice. Never bet more than you can afford to lose.
            </p>
          </div>

        </GlassCard>
      </div>
    </footer>
  );
}
