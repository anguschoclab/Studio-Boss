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
      label: 'Theatrical',
      icon: Film,
      color: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    },
    streaming: {
      label: 'Streaming',
      icon: Monitor,
      color: 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30',
    },
    syndicated: {
      label: 'Syndicated',
      icon: Tv,
      color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
    },
  };

  const { label, icon: Icon, color } = config[status];

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-wider uppercase ${color} ${className}`}>
      <Icon size={12} />
      <span>{label}</span>
    </div>
  );
};
