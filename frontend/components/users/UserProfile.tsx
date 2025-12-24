'use client';

import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Mail, Wallet, Calendar, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatAddress } from '@/lib/utils/blockchain';

interface UserProfile {
  id: string;
  email?: string;
  walletAddress: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserProfileProps {
  userId?: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  const account = useActiveAccount();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetUserId = userId || account?.address;

  useEffect(() => {
    if (!targetUserId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/users/${targetUserId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setProfile(null);
            setLoading(false);
            return;
          }
          throw new Error('Failed to fetch user profile');
        }
        
        const data = await response.json();
        setProfile(data.user);
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err.message || 'Failed to load profile');
        toast.error('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetUserId]);

  if (!targetUserId) {
    return (
      <GlassCard className="p-6">
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No user ID provided</p>
        </div>
      </GlassCard>
    );
  }

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
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </GlassCard>
    );
  }

  if (!profile) {
    return (
      <GlassCard className="p-6">
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-2">User profile not found</p>
          <p className="text-gray-500 text-xs">This user hasn't created a profile yet</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            User Profile
          </h3>
          <p className="text-sm text-gray-400">User information and account details</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Wallet Address</span>
          </div>
          <div className="text-sm font-mono text-white">
            {formatAddress(profile.walletAddress)}
          </div>
        </div>

        {profile.email && (
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Email</span>
            </div>
            <div className="text-sm text-white">
              {profile.email}
            </div>
          </div>
        )}

        {profile.createdAt && (
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-400">Member Since</span>
            </div>
            <div className="text-sm text-white">
              {new Date(profile.createdAt).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

