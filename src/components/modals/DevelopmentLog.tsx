import React from 'react';
import { Project, ScriptEvent } from '@/engine/types';
import { 
  FileEdit, 
  Split, 
  Merge, 
  Search, 
  Zap, 
  Type, 
  ArrowRight,
  TrendingUp,
  Brain,
  History as LucideHistory
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DevelopmentLogProps {
  project: Project;
}

const EVENT_CONFIG = {
  ROLE_SPLIT: { icon: Split, color: 'text-violet-400', label: 'Composite Split' },
  ROLE_MERGE: { icon: Merge, color: 'text-emerald-400', label: 'Role Consolidation' },
  DIALOGUE_POLISH: { icon: FileEdit, color: 'text-amber-400', label: 'Script Polish' },
} as const;

export const DevelopmentLog: React.FC<DevelopmentLogProps> = ({ project }) => {
  const events = project.scriptEvents || [];
  const heat = project.scriptHeat || 50;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Script Heat Meter */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-violet-500/10 via-black/20 to-transparent">
         <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
               <Zap className="w-4 h-4 text-primary" /> Executive Package Heat
            </h3>
            <span className={cn(
              "text-xl font-black italic",
              heat >= 75 ? "text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.3)]" : "text-foreground"
            )}>{Math.round(heat)}%</span>
         </div>
         <div className="h-2 rounded-full bg-black/40 overflow-hidden relative shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-primary transition-all duration-1000 ease-out" 
              style={{ width: `${heat}%` }} 
            />
            {/* Markers */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20" />
            <div className="absolute top-0 bottom-0 left-3/4 w-px bg-white/20" />
         </div>
         <div className="flex justify-between mt-3 text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
            <span>Room Draft</span>
            <span>Contender</span>
            <span>Masterpiece</span>
         </div>
      </div>

      {/* Role Manifest */}
      <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-3">
         <div className="flex items-center gap-2 mb-2">
            <Type className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Character Matrix</span>
         </div>
         <div className="flex flex-wrap gap-2">
            {(project.activeRoles || []).map(role => (
               <div key={role} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-foreground/80 flex items-center gap-2 group hover:border-primary/40 transition-all">
                  <Search className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  {role.replace('_', ' ')}
               </div>
            ))}
         </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
         <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <LucideHistory className="w-4 h-4" /> Drafting Timeline
         </h4>
         
         {events.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-12 opacity-20 border-2 border-dashed border-white/10 rounded-2xl">
              <FileEdit className="w-10 h-10 mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">Initial drafting phase</p>
           </div>
         ) : (
           <div className="space-y-4">
             {events.map((event, idx) => {
               const config = EVENT_CONFIG[event.type as keyof typeof EVENT_CONFIG] || EVENT_CONFIG.DIALOGUE_POLISH;
               const EventIcon = config.icon;
               return (
                 <div key={idx} className="glass-panel p-4 rounded-xl border border-white/5 animate-in slide-in-from-right-4 duration-500">
                    <div className="flex gap-4">
                       <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-black/40 border border-white/5", config.color)}>
                          <EventIcon className="w-5 h-5" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                             <span className={cn("text-[9px] font-black uppercase tracking-widest", config.color)}>
                                {config.label}
                             </span>
                             <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">Week {event.week}</span>
                          </div>
                          <p className="text-[11px] font-black text-foreground leading-tight">{event.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                             <TrendingUp className="w-3 h-3 text-emerald-400" />
                             <span className="text-[9px] font-black text-emerald-400 uppercase">+{event.heatGain} Heat</span>
                          </div>
                       </div>
                    </div>
                 </div>
               );
             })}
           </div>
         )}
      </div>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
         <Brain className="w-5 h-5 text-primary" />
         <p className="text-[9px] font-bold text-muted-foreground leading-snug">
            Drafting decisions are algorithmic. Script Evolution triggers as "Town Heat" accumulates, reflecting the creative dynamism of your writing room.
         </p>
      </div>
    </div>
  );
};
