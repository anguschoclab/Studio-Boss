import React from 'react';
import { Buyer } from '@/engine/types';
import { formatMoney } from '@/engine/utils';
import { History, Calendar, DollarSign, ArrowRight } from 'lucide-react';

interface MAHistoryFeedProps {
  buyer: Buyer;
}

export const MAHistoryFeed: React.FC<MAHistoryFeedProps> = ({ buyer }) => {
  const history = buyer.maHistory || [];

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center glass-panel border-dashed border-border/40 opacity-40">
        <History className="w-8 h-8 mb-2" />
        <p className="text-[10px] uppercase font-bold tracking-widest leading-normal">
          No corporate M&A activity<br />recorded for this entity
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-primary" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Corporate Timeline</h4>
      </div>
      
      <div className="relative pl-4 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-primary/40 before:to-transparent">
        {history.map((event, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[10px] top-1.5 w-[10px] h-[10px] rounded-full bg-background border-2 border-primary group-hover:scale-125 transition-transform" />
            
            <div className="glass-panel p-3 rounded-xl border border-white/5 hover:border-primary/30 transition-colors shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase text-foreground leading-tight truncate">
                    {event.event}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase">
                      <Calendar className="w-3 h-3" />
                      Week {event.week}
                    </div>
                    {event.value && (
                      <div className="flex items-center gap-1 text-[9px] font-black text-emerald-400 uppercase">
                        <DollarSign className="w-3 h-3" />
                        {formatMoney(event.value)} Valuation
                      </div>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/20 group-hover:text-primary transition-colors shrink-0" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
