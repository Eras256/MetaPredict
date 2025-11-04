import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02]",
        "border border-white/10",
        "shadow-[0_8px_32px_0_rgba(139,92,246,0.1)]",
        hover && "transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_8px_32px_0_rgba(139,92,246,0.2)]",
        className
      )}
    >
      {/* Inner glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

