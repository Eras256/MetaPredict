'use client';

import { Search, Filter, TrendingUp, DollarSign, Clock, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GlassCard } from '@/components/effects/GlassCard';

interface MarketFiltersProps {
  search: string;
  category: string;
  sortBy: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  stats?: {
    activeMarkets?: number;
    volume24h?: string;
    resolvingSoon?: number;
    insuredMarkets?: string;
  };
}

export function MarketFilters({
  search,
  category,
  sortBy,
  onSearchChange,
  onCategoryChange,
  onSortByChange,
  stats,
}: MarketFiltersProps) {
  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <GlassCard className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-400 truncate">Active Markets</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats?.activeMarkets || 0}</p>
            </div>
          </div>
        </GlassCard>
        
        <GlassCard className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-400 truncate">24h Volume</p>
              <p className="text-xl sm:text-2xl font-bold text-white truncate">{stats?.volume24h || '$0'}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-400 truncate">Resolving Soon</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats?.resolvingSoon || 0}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-400 truncate">Insured Markets</p>
              <p className="text-xl sm:text-2xl font-bold text-white truncate">{stats?.insuredMarkets || '0%'}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard className="p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <Input
              placeholder="Search markets..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-sm sm:text-base"
            />
          </div>

          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full sm:w-auto sm:min-w-[140px] md:w-48 bg-white/5 border-white/10 text-white text-sm sm:text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="politics">Politics</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="tech">Technology</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-full sm:w-auto sm:min-w-[140px] md:w-48 bg-white/5 border-white/10 text-white text-sm sm:text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="volume">Volume</SelectItem>
              <SelectItem value="liquidity">Liquidity</SelectItem>
              <SelectItem value="ending">Ending Soon</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>
    </>
  );
}

