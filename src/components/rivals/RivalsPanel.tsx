import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';
import { MADashboard } from '../industry/MADashboard';
import { cn } from '@/lib/utils';
import { RivalCard } from './RivalCard';

export const RivalsPanel = () => {
  const [activeSubTab, setActiveSubTab] = React.useState<'intel' | 'market'>('intel');
  const gameState = useGameStore(s => s.gameState);
  const rivals = React.useMemo(() => 
    Object.values(gameState?.entities?.rivals || {}),
    [gameState?.entities?.rivals]
  );
  const playerCash = gameState?.finance?.cash || 0;
  
  const { corporateSabotage, poachExec, attemptTakeover } = useGameStore();

  return (
    <div className="h-full flex flex-col overflow-hidden space-y-8">
      {/* Sub-Tabs */}
      <div className="flex gap-4 p-0 self-start">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setActiveSubTab('intel')}
          className={cn(
            "text-[10px] uppercase tracking-[0.3em] font-black h-10 px-8 rounded-none transition-all duration-500",
            activeSubTab === 'intel' ? "bg-white/5 text-primary border-b-2 border-primary" : "text-muted-foreground/40 hover:text-white"
          )}
        >
          STUDIO INTELLIGENCE
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setActiveSubTab('market')}
          className={cn(
            "text-[10px] uppercase tracking-[0.3em] font-black h-10 px-8 rounded-none transition-all duration-500",
            activeSubTab === 'market' ? "bg-white/5 text-primary border-b-2 border-primary" : "text-muted-foreground/40 hover:text-white"
          )}
        >
          MARKET DYNAMICS
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
        {activeSubTab === 'intel' ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between pb-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-destructive" />
                <h3 className="font-display text-base font-black uppercase tracking-tighter italic text-foreground/90">
                  Competitive Surveillance Matrix
                </h3>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {rivals.map(rival => (
                <RivalCard
                  key={rival.id}
                  rival={rival}
                  playerCash={playerCash}
                  corporateSabotage={corporateSabotage}
                  poachExec={poachExec}
                  attemptTakeover={attemptTakeover}
                />
              ))}
            </div>
          </div>
        ) : (
          <MADashboard />
        )}
      </div>
    </div>
  );
};
