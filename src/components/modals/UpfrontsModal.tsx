import React from 'react';
import { useUIStore } from '@/store/uiStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tv, CheckCircle2, XCircle, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UpfrontResult } from '@/engine/systems/television/upfrontsEngine';

export const UpfrontsModal: React.FC = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();

  if (!activeModal || activeModal.type !== 'UPFRONTS') return null;

  const { results = [], week = 0 } = (activeModal.payload || {}) as {
    results: UpfrontResult[];
    week: number;
  };

  const pickups = results.filter(r => r.decision === 'pickup');
  const limited = results.filter(r => r.decision === 'limited_order');
  const passes = results.filter(r => r.decision === 'pass');

  const decisionIcon = (decision: UpfrontResult['decision']) => {
    if (decision === 'pickup') return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (decision === 'limited_order') return <Minus className="h-4 w-4 text-amber-500" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  const decisionLabel = (decision: UpfrontResult['decision']) => {
    if (decision === 'pickup') return { label: 'Full Order', variant: 'default' as const, cls: 'bg-emerald-500 text-white' };
    if (decision === 'limited_order') return { label: 'Limited Order', variant: 'outline' as const, cls: 'border-amber-500 text-amber-500' };
    return { label: 'Pass', variant: 'destructive' as const, cls: 'bg-destructive/20 text-destructive border-destructive/30' };
  };

  return (
    <Dialog open onOpenChange={() => resolveCurrentModal()}>
      <DialogContent className="max-w-lg border border-primary/30 bg-background">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Tv className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black uppercase tracking-tight">
                Upfronts — Week {week}
              </DialogTitle>
              <p className="text-xs text-muted-foreground">Network buyer decisions on your TV slate</p>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-2xl font-black text-emerald-400">{pickups.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Full Orders</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
            <p className="text-2xl font-black text-amber-400">{limited.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Limited</p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
            <p className="text-2xl font-black text-destructive">{passes.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Passed</p>
          </div>
        </div>

        <ScrollArea className="max-h-72 pr-2">
          <div className="space-y-2">
            {results.map(result => {
              const { label, cls } = decisionLabel(result.decision);
              return (
                <div
                  key={result.projectId}
                  className="flex items-center justify-between p-3 rounded-lg bg-card/40 border border-border/40"
                >
                  <div className="flex items-center gap-3">
                    {decisionIcon(result.decision)}
                    <div>
                      <p className="text-sm font-bold">{result.projectTitle}</p>
                      {result.episodesOrdered && (
                        <p className="text-[10px] text-muted-foreground">{result.episodesOrdered} episodes ordered</p>
                      )}
                    </div>
                  </div>
                  <Badge className={cn('text-[9px] font-bold', cls)}>{label}</Badge>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <Button
          className="w-full mt-4"
          onClick={() => resolveCurrentModal()}
        >
          Acknowledge
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default UpfrontsModal;
