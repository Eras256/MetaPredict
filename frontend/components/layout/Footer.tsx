'use client';

import Link from 'next/link';
import { Github, Twitter, MessageCircle, FileText, Mail, ExternalLink, Brain } from 'lucide-react';
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
  resources: [
    { name: 'Documentation', href: 'https://docs.metapredict.ai', external: true },
    { name: 'GitHub', href: 'https://github.com/metapredict', external: true },
    { name: 'Whitepaper', href: '/whitepaper.pdf', external: true },
    { name: 'Audit Report', href: '/audit.pdf', external: true },
    { name: 'API Docs', href: 'https://api.metapredict.ai/docs', external: true },
  ],
  community: [
    { name: 'Twitter', href: 'https://twitter.com/metapredict', external: true },
    { name: 'Telegram', href: 'https://t.me/metapredict', external: true },
    { name: 'Discord', href: 'https://discord.gg/metapredict', external: true },
    { name: 'Blog', href: '/blog' },
  ],
  legal: [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Disclaimer', href: '/disclaimer' },
  ],
};

const socials = [
  { icon: Twitter, href: 'https://twitter.com/metapredict', label: 'Twitter' },
  { icon: Github, href: 'https://github.com/metapredict', label: 'GitHub' },
  { icon: MessageCircle, href: 'https://t.me/metapredict', label: 'Telegram' },
  { icon: Mail, href: 'mailto:hello@metapredict.ai', label: 'Email' },
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
                <span className="text-xl font-bold text-gradient">MetaPredict.ai</span>
              </Link>
              <p className="text-sm text-gray-400 mb-4 max-w-xs">The first all-in-one prediction market platform with multi-AI oracle, cross-chain aggregation, and insurance protection. Built on opBNB.</p>
              <div className="flex items-center gap-2">
                {socials.map((social) => (
                  <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 flex items-center justify-center transition-colors group" aria-label={social.label}>
                    <social.icon className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </a>
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
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} target={link.external ? "_blank" : undefined} rel={link.external ? "noopener noreferrer" : undefined} className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-1">
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
                    <a href={link.href} target={link.external ? "_blank" : undefined} rel={link.external ? "noopener noreferrer" : undefined} className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-1">
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
            <p className="text-sm text-gray-400">© 2025 MetaPredict.ai. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Built on opBNB</span>
              <span>•</span>
              <span>Powered by AI</span>
              <span>•</span>
              <span>Secured by Insurance</span>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-yellow-200/80 text-center">
              <strong>Disclaimer:</strong> MetaPredict.ai is a decentralized prediction market protocol. Participation may not be legal in your jurisdiction. Users are responsible for compliance with local laws. This is not financial advice. Never bet more than you can afford to lose.
            </p>
          </div>
        </GlassCard>
      </div>
    </footer>
  );
}
