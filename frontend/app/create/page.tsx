'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, FileText, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/effects/GlassCard';
import { suggestMarketCreation, analyzeMarket } from '@/lib/services/ai/gemini';
import { toast } from 'sonner';

export default function CreateMarketPage() {
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [resolutionTime, setResolutionTime] = useState('');
  const [metadata, setMetadata] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ question: string; description: string; category: string }>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [validating, setValidating] = useState(false);

  const handleGetSuggestions = async () => {
    if (!question.trim()) {
      toast.error('Ingresa un tema primero para generar sugerencias');
      return;
    }

    setLoadingSuggestions(true);
    try {
      const result = await suggestMarketCreation(question);
      if (result.success && result.data) {
        setSuggestions(result.data.suggestions);
        toast.success(`Generadas ${result.data.suggestions.length} sugerencias con ${result.modelUsed}`);
      } else {
        toast.error(result.error || 'Error al generar sugerencias');
      }
    } catch (error: any) {
      toast.error('Error al generar sugerencias');
      console.error(error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleValidateQuestion = async () => {
    if (!question.trim()) {
      toast.error('Ingresa una pregunta primero');
      return;
    }

    setValidating(true);
    try {
      const result = await analyzeMarket(question, description);
      if (result.success && result.data) {
        if (result.data.answer === 'INVALID') {
          toast.warning(`Pregunta inválida: ${result.data.reasoning}`);
        } else {
          toast.success(`Pregunta válida (Confianza: ${result.data.confidence}%)`);
        }
      } else {
        toast.error(result.error || 'Error al validar pregunta');
      }
    } catch (error: any) {
      toast.error('Error al validar pregunta');
      console.error(error);
    } finally {
      setValidating(false);
    }
  };

  const handleUseSuggestion = (suggestion: { question: string; description: string }) => {
    setQuestion(suggestion.question);
    setDescription(suggestion.description);
    setSuggestions([]);
    toast.success('Sugerencia aplicada');
  };

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
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="question" className="block text-sm font-medium text-gray-300">
                  Question *
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleValidateQuestion}
                    disabled={validating || !question.trim()}
                  >
                    {validating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validando...
                      </>
                    ) : (
                      'Validar con AI'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetSuggestions}
                    disabled={loadingSuggestions || !question.trim()}
                  >
                    {loadingSuggestions ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Sugerencias AI
                      </>
                    )}
                  </Button>
                </div>
              </div>
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

            {suggestions.length > 0 && (
              <GlassCard className="p-4 border-purple-500/20">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  Sugerencias de AI
                </h4>
                <div className="space-y-2">
                  {suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors cursor-pointer"
                      onClick={() => handleUseSuggestion(suggestion)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white mb-1">{suggestion.question}</p>
                          <p className="text-xs text-gray-400 line-clamp-2">{suggestion.description}</p>
                          <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded bg-purple-500/20 text-purple-300">
                            {suggestion.category}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseSuggestion(suggestion);
                          }}
                        >
                          Usar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

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

