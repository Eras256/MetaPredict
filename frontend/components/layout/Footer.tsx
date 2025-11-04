'use client';

import Link from 'next/link';
import { 
  Github, 
  Twitter, 
  MessageCircle, 
  Mail,
  ExternalLink
} from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';

const footerLinks = {
  product: [
    { name: 'Markets', href: '/markets' },
    { name: 'Create Market', href: '/create' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Insurance Pool', href: '/insurance' },
  ],
  resources: [
    { name: 'Documentation', href: 'https://docs.truthchain.io', external: true },
    { name: 'GitHub', href: 'https://github.com/truthchain', external: true },
    { name: 'Whitepaper', href: '/whitepaper.pdf', external: true },
    { name: 'Audit Report', href: '/audit.pdf', external: true },
  ],
  community: [
    { name: 'Twitter', href: 'https://twitter.com/truthchain', external: true },
    { name: 'Telegram', href: 'https://t.me/truthchain', external: true },
    { name: 'Discord', href: 'https://discord.gg/truthchain', external: true },
    { name: 'Blog', href: '/blog' },
  ],
  legal: [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
};

const socials = [
  { icon: Twitter, href: 'https://twitter.com/truthchain', label: 'Twitter' },
  { icon: Github, href: 'https://github.com/truthchain', label: 'GitHub' },
  { icon: MessageCircle, href: 'https://t.me/truthchain', label: 'Telegram' },
  { icon: Mail, href: 'mailto:hello@truthchain.io', label: 'Email' },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 mt-20">
      <GlassCard className="border-0 rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  TruthChain
                </span>
              </div>
              
              <p className="text-gray-400 text-sm mb-4">
                The first prediction market with multi-AI oracle consensus and insurance protection. Built on opBNB.
              </p>
              
              <div className="flex items-center space-x-3">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 flex items-center justify-center transition-colors group"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
            
            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-400 hover:text-purple-400 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-1"
                    >
                      {link.name}
                      {link.external && <ExternalLink className="h-3 w-3" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Community */}
            <div>
              <h3 className="text-white font-semibold mb-4">Community</h3>
              <ul className="space-y-2">
                {footerLinks.community.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-1"
                    >
                      {link.name}
                      {link.external && <ExternalLink className="h-3 w-3" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Bottom */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 TruthChain. All rights reserved.
            </p>
            
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              {footerLinks.legal.map((link) => (
                <Link key={link.name} href={link.href} className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Disclaimer */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-xs text-gray-500 text-center max-w-4xl mx-auto">
              Disclaimer: TruthChain is a decentralized prediction market protocol. Participation may not be legal in your jurisdiction. Users are responsible for compliance with local laws. This is not financial advice. Never bet more than you can afford to lose. Prediction markets are for informational and entertainment purposes only.
            </p>
          </div>
        </div>
      </GlassCard>
    </footer>
  );
}

