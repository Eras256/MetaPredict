import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { NeuralBackground } from '@/components/effects/NeuralBackground';
import { AnimatedGradient } from '@/components/effects/AnimatedGradient';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono' 
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'MetaPredict.fun | AI-Powered Prediction Markets',
  description: 'The first all-in-one prediction market platform with 5-AI consensus oracle (Gemini, Llama, Mistral), cross-chain aggregation, and insurance protection on opBNB',
  keywords: ['prediction markets', 'AI oracle', 'multi-AI consensus', '5 AI models', 'opBNB', 'DeFi', 'Web3', 'blockchain'],
  openGraph: {
    title: 'MetaPredict.fun',
    description: 'AI-Powered Prediction Markets with 5-AI Consensus & Insurance',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MetaPredict.fun',
    description: 'AI-Powered Prediction Markets with 5-AI Consensus',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>
          <div className="relative min-h-screen flex flex-col">
            <AnimatedGradient />
            <NeuralBackground />
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
