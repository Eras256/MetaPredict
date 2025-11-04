'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/effects/GlassCard';

export default function CreateMarketPage() {
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [resolutionTime, setResolutionTime] = useState('');
  const [metadata, setMetadata] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement market creation via contract
    console.log({ question, description, resolutionTime, metadata });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Create Market
          </h1>
          <p className="text-gray-400 text-lg">
            Create a new prediction market on any future event
          </p>
        </motion.div>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-300 mb-2">
                Question *
              </label>
              <Input
                id="question"
                type="text"
                placeholder="e.g., Will Bitcoin reach $100K by end of 2025?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                className="w-full"
              />
              <p className="mt-1 text-sm text-gray-500">Minimum 10 characters</p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder="Provide detailed context about the market..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="resolutionTime" className="block text-sm font-medium text-gray-300 mb-2">
                Resolution Time *
              </label>
              <Input
                id="resolutionTime"
                type="datetime-local"
                value={resolutionTime}
                onChange={(e) => setResolutionTime(e.target.value)}
                required
                className="w-full"
              />
              <p className="mt-1 text-sm text-gray-500">Must be at least 1 hour in the future</p>
            </div>

            <div>
              <label htmlFor="metadata" className="block text-sm font-medium text-gray-300 mb-2">
                Metadata (IPFS Hash)
              </label>
              <Input
                id="metadata"
                type="text"
                placeholder="Optional: IPFS hash for additional context"
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" size="lg" className="flex-1">
                <Plus className="mr-2 h-5 w-5" />
                Create Market
              </Button>
              <Button type="button" variant="outline" size="lg">
                Cancel
              </Button>
            </div>
          </form>
        </GlassCard>

        {/* Info */}
        <GlassCard className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Market Creation Guidelines</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• Questions must be clear and unambiguous</li>
            <li>• Resolution time must be between 1 hour and 365 days</li>
            <li>• Market creation fee: 0.1 BNB</li>
            <li>• All markets are permissionless and transparent</li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}

