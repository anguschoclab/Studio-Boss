import React from 'react';
import { Film, Monitor, Tv } from 'lucide-react';

interface DistributionBadgeProps {
  status?: 'theatrical' | 'streaming' | 'syndicated';
  className?: string;
}

export const DistributionBadge: React.FC<DistributionBadgeProps> = ({ status, className = '' }) => {
  if (!status) return null;

  const config = {
    theatrical: {
      label: 'THEATRICAL',
      icon: Film,
      color: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    },
    streaming: {
      label: 'STREAMING',
      icon: Monitor,
      color: 'bg-primary/10 text-primary border-primary/20',
    },
    syndicated: {
      label: 'SYNDICATED',
      icon: Tv,
      color: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    },
  };

  const { label, icon: Icon, color } = config[status];

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-none border text-[9px] font-black tracking-[0.2em] uppercase italic ${color} ${className}`}>
      <Icon size={10} strokeWidth={3} />
      <span>{label}</span>
    </div>
  );
};
