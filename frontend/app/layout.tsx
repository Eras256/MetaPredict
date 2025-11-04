import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { NeuralBackground } from '@/components/effects/NeuralBackground';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono' 
});

export const metadata: Metadata = {
  title: 'TruthChain | AI-Powered Prediction Markets',
  description: 'Decentralized prediction markets with multi-AI oracle and insurance protection on opBNB',
  keywords: ['prediction markets', 'AI oracle', 'opBNB', 'DeFi', 'insurance'],
  openGraph: {
    title: 'TruthChain',
    description: 'AI-Powered Prediction Markets with Insurance',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TruthChain',
    description: 'AI-Powered Prediction Markets',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <Providers>
          <NeuralBackground />
          <Navbar />
          <main className="relative z-10">
            {children}
          </main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
