'use client';

import Link from 'next/link';
import { Github, Twitter, MessageCircle, FileText, Mail, ExternalLink, Brain, Code, Shield, Zap, Activity } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';

const footerLinks = {
  product: [
    { name: 'Markets', href: '/markets' },
    { name: 'Create Market', href: '/create' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Insurance Pool', href: '/insurance' },
    { name: 'Reputation', href: '/reputation' },
    { name: 'DAO Governance', href: '/dao' },
  ],
  contracts: [
    { 
      name: 'Prediction Market Core', 
      href: 'https://testnet.opbnbscan.com/address/0x5eaa77CC135b82c254F1144c48f4d179964fA0b1#code',
      external: true 
    },
    { 
      name: 'AI Oracle', 
      href: 'https://testnet.opbnbscan.com/address/0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c#code',
      external: true 
    },
    { 
      name: 'Insurance Pool', 
      href: 'https://testnet.opbnbscan.com/address/0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA#code',
      external: true 
    },
    { 
      name: 'Chainlink Data Streams', 
      href: 'https://testnet.opbnbscan.com/address/0x1758d4da0bAd4DB90Dfd56Be259C19cabDcF03fd#code',
      external: true 
    },
    { 
      name: 'View All Contracts', 
      href: 'https://testnet.opbnbscan.com/',
      external: true 
    },
  ],
  resources: [
    { name: 'GitHub Repository', href: 'https://github.com/vaiosx01/MetaPredict', external: true },
    { name: 'opBNBScan Explorer', href: 'https://testnet.opbnbscan.com/', external: true },
    { name: 'Chainlink Docs', href: 'https://docs.chain.link/', external: true },
    { name: 'opBNB Docs', href: 'https://docs.opbnb.io/', external: true },
  ],
  community: [
    { name: 'GitHub', href: 'https://github.com/vaiosx01/MetaPredict', external: true },
    { name: 'Twitter', href: 'https://twitter.com/metapredict', external: true },
    { name: 'Telegram', href: 'https://t.me/metapredict', external: true },
    { name: 'Discord', href: 'https://discord.gg/metapredict', external: true },
  ],
  legal: [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Disclaimer', href: '/disclaimer' },
  ],
};

const socials = [
  { icon: Github, href: 'https://github.com/vaiosx01/MetaPredict', label: 'GitHub' },
  { icon: Twitter, href: 'https://twitter.com/metapredict', label: 'Twitter' },
  { icon: MessageCircle, href: 'https://t.me/metapredict', label: 'Telegram' },
  { icon: Mail, href: 'mailto:hello@metapredict.ai', label: 'Email' },
];

const techStack = [
  { name: 'opBNB', icon: Zap, color: 'text-yellow-400' },
  { name: 'Chainlink', icon: Activity, color: 'text-blue-400' },
  { name: 'Google Gemini', icon: Brain, color: 'text-purple-400' },
  { name: 'Next.js', icon: Code, color: 'text-white' },
];

export function Footer() {
  return (
    <footer className="relative mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlassCard className="p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-8">
            <div className="col-span-2">
              <Link href="/" className="flex items-center space-x-3 mb-4 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    MetaPredict.ai
                  </span>
                  <span className="text-xs text-gray-400">AI-Powered Prediction Markets</span>
                </div>
              </Link>
              <p className="text-sm text-gray-400 mb-4 max-w-xs">
                The first all-in-one prediction market platform with 5-AI consensus oracle, Chainlink Data Streams, and insurance protection. Built on opBNB Testnet.
              </p>
              <div className="flex items-center gap-2 mb-4">
                {socials.map((social) => (
                  <a 
                    key={social.label} 
                    href={social.href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 flex items-center justify-center transition-colors group" 
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </a>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <div key={tech.name} className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/5 border border-purple-500/10">
                    <tech.icon className={`w-3 h-3 ${tech.color}`} />
                    <span className="text-xs text-gray-400">{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
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
              <h3 className="font-semibold text-white mb-4">Contracts</h3>
              <ul className="space-y-2">
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
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2">
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
              <h3 className="font-semibold text-white mb-4">Community</h3>
              <ul className="space-y-2">
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
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
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

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-400">© 2025 MetaPredict.ai. All rights reserved.</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Network: opBNB Testnet (5611)</span>
                <span>•</span>
                <span>10/10 Contracts Verified</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                opBNB
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Brain className="w-4 h-4 text-purple-400" />
                5-AI Consensus
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-blue-400" />
                Insurance Protected
              </span>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-yellow-200/80 text-center">
              <strong>Disclaimer:</strong> MetaPredict.ai is a decentralized prediction market protocol running on opBNB Testnet. 
              This is experimental software. Participation may not be legal in your jurisdiction. Users are responsible for compliance with local laws. 
              This is not financial advice. Never bet more than you can afford to lose.
            </p>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-xs text-green-200/80 text-center">
              <strong>✅ All Contracts Verified:</strong> All 10 smart contracts are verified and auditable on{' '}
              <a 
                href="https://testnet.opbnbscan.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-green-300"
              >
                opBNBScan
              </a>
              . Deployed on November 18, 2025.
            </p>
          </div>
        </GlassCard>
      </div>
    </footer>
  );
}
