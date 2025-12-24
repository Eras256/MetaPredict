'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, Loader2, RefreshCw, Zap, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface GelatoStatus {
  configured: boolean;
  apiKeyPresent: boolean;
  message: string;
  details?: {
    relayKeyPresent: boolean;
    automateKeyPresent: boolean;
    rpcUrlPresent: boolean;
    apiKeyLength: number;
    apiKeyPrefix: string;
  };
  warnings?: string[];
}

interface BotStatus {
  running: boolean;
  lastCheck: number;
  marketsProcessed: number;
  errors: number;
}

export function GelatoStatusPanel() {
  const [status, setStatus] = useState<GelatoStatus | null>(null);
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statusRes, botRes] = await Promise.all([
        fetch('/api/gelato/status'),
        fetch('/api/gelato/bot-status'),
      ]);
      
      if (!statusRes.ok) {
        throw new Error('Failed to fetch Gelato status');
      }
      
      const statusData = await statusRes.json();
      setStatus(statusData);
      
      if (botRes.ok) {
        const botData = await botRes.json();
        setBotStatus(botData);
      }
    } catch (err: any) {
      console.error('Error fetching Gelato status:', err);
      setError(err.message || 'Failed to load status');
      toast.error('Failed to load Gelato status');
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
          <Skeleton className="h-32 w-full" />
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
          <h3 className="text-lg font-semibold mb-1">Gelato Automation Status</h3>
          <p className="text-sm text-gray-400">Oracle automation and relay service</p>
        </div>
        <Button onClick={fetchStatus} variant="ghost" size="sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Configuration Status */}
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-white">Configuration</span>
            </div>
            {status?.configured ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Configured
              </Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <XCircle className="w-3 h-3 mr-1" />
                Not Configured
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-3">{status?.message}</p>
          
          {status?.details && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Relay Key:</span>
                <span className={`ml-2 ${status.details.relayKeyPresent ? 'text-green-400' : 'text-red-400'}`}>
                  {status.details.relayKeyPresent ? 'Present' : 'Missing'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Automate Key:</span>
                <span className={`ml-2 ${status.details.automateKeyPresent ? 'text-green-400' : 'text-red-400'}`}>
                  {status.details.automateKeyPresent ? 'Present' : 'Missing'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">RPC URL:</span>
                <span className={`ml-2 ${status.details.rpcUrlPresent ? 'text-green-400' : 'text-red-400'}`}>
                  {status.details.rpcUrlPresent ? 'Present' : 'Missing'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">API Key Length:</span>
                <span className="ml-2 text-white">{status.details.apiKeyLength}</span>
              </div>
            </div>
          )}
        </div>

        {/* Bot Status */}
        {botStatus && (
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-white">Oracle Bot</span>
              </div>
              {botStatus.running ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Running
                </Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  <XCircle className="w-3 h-3 mr-1" />
                  Stopped
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mt-3">
              <div>
                <span className="text-gray-400">Markets Processed:</span>
                <span className="ml-2 text-white font-medium">{botStatus.marketsProcessed}</span>
              </div>
              <div>
                <span className="text-gray-400">Errors:</span>
                <span className={`ml-2 font-medium ${botStatus.errors > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {botStatus.errors}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {status?.warnings && status.warnings.length > 0 && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="text-xs text-yellow-300 font-medium mb-2">Warnings:</div>
            <ul className="space-y-1 text-xs text-yellow-200/80">
              {status.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

