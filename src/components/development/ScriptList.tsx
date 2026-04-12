import React from 'react';
import { cn } from '@/lib/utils';
import { Scroll, FileText, PenTool, CheckCircle, Clock } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tokens } from '@/lib/tokens';

// Script type definition
interface Script {
  id: string;
  title: string;
  writerName: string;
  status: 'concept' | 'treatment' | 'draft' | 'polish' | 'final';
  quality: number; // 0-100
  weekStarted: number;
  weekCompleted?: number;
  genre: string;
  logline?: string;
  revisionCount: number;
}

const statusConfig = {
  concept: { label: 'Concept', icon: Scroll, color: 'bg-slate-500', progress: 20 },
  treatment: { label: 'Treatment', icon: FileText, color: 'bg-blue-500', progress: 40 },
  draft: { label: 'First Draft', icon: PenTool, color: 'bg-amber-500', progress: 60 },
  polish: { label: 'Polish', icon: Clock, color: 'bg-purple-500', progress: 80 },
  final: { label: 'Final', icon: CheckCircle, color: 'bg-emerald-500', progress: 100 },
};

interface ScriptListProps {
  scripts: Script[];
}

export const ScriptList: React.FC<ScriptListProps> = ({ scripts }) => {
  const scriptsByStatus = scripts.reduce((acc, script) => {
    if (!acc[script.status]) acc[script.status] = [];
    acc[script.status].push(script);
    return acc;
  }, {} as Record<string, Script[]>);

  if (scripts.length === 0) {
    return (
      <div className={cn('text-center py-12', tokens.border.default, 'border-dashed rounded-xl')}>
        <Scroll className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p className={tokens.text.label}>No Active Scripts</p>
        <p className={cn(tokens.text.caption, 'mt-2')}>
          Create a new IP concept to begin development
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(statusConfig).map(([status, config]) => {
        const statusScripts = scriptsByStatus[status] || [];
        if (statusScripts.length === 0) return null;

        const Icon = config.icon;

        return (
          <div key={status} className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <h4 className={cn('font-semibold text-sm', tokens.text.caption)}>
                {config.label} ({statusScripts.length})
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {statusScripts.map((script) => (
                <Card
                  key={script.id}
                  className={cn(
                    'p-4 cursor-pointer hover:shadow-md transition-all',
                    tokens.border.default
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-sm truncate">{script.title}</h5>
                      <p className={cn('text-xs mt-0.5', tokens.text.caption)}>
                        by {script.writerName}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {script.genre}
                    </Badge>
                  </div>

                  {script.logline && (
                    <p className={cn('text-xs mt-2 line-clamp-2', tokens.text.caption)}>
                      {script.logline}
                    </p>
                  )}

                  <div className="mt-3 space-y-2">
                    {/* Progress bar */}
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', config.color)}
                        style={{ width: `${config.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className={tokens.text.caption}>
                        Quality: {script.quality}/100
                      </span>
                      <span className={tokens.text.caption}>
                        {script.revisionCount} revision{script.revisionCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScriptList;
