'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Loader2, RefreshCw, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface OracleStatus {
  status: string;
  timestamp: number;
}

export function OracleStatusPanel() {
  const [status, setStatus] = useState<OracleStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/oracle/status');
      
      if (!response.ok) {
        throw new Error('Failed to fetch oracle status');
      }
      
      const data = await response.json();
      setStatus(data);
    } catch (err: any) {
      console.error('Error fetching oracle status:', err);
      setError(err.message || 'Failed to load status');
      toast.error('Failed to load oracle status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-6">
        <div className="text-center py-8">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <Button onClick={fetchStatus} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">AI Oracle Status</h3>
          <p className="text-sm text-gray-400">Multi-AI consensus oracle service</p>
        </div>
        <Button onClick={fetchStatus} variant="ghost" size="sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-white">Status</span>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            {status?.status || 'Active'}
          </Badge>
        </div>
        {status?.timestamp && (
          <div className="text-xs text-gray-400 mt-2">
            Last updated: {new Date(status.timestamp).toLocaleString()}
          </div>
        )}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <p className="text-xs text-blue-300">
          <strong>Multi-AI Consensus:</strong> The oracle uses 5 AI models from 3 providers (Gemini, Llama, Mistral) 
          with 80%+ consensus required for market resolution. Automatic fallback ensures 95%+ accuracy.
        </p>
      </div>
    </GlassCard>
  );
}

