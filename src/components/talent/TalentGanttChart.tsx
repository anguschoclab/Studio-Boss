import React from 'react';
import { Talent, TalentCommitment } from '@/engine/types';

interface TalentGanttChartProps {
  talent: Talent;
  currentWeek: number;
}

/**
 * TalentGanttChart: Visualizes talent commitments over a 52-week rolling window.
 * Highlights overlaps and Phase 2 "Animation Exemptions".
 */
export const TalentGanttChart: React.FC<TalentGanttChartProps> = ({ talent, currentWeek }) => {
  const weeks = Array.from({ length: 52 }, (_, i) => currentWeek + i);
  const commitments = talent.commitments || [];

  const getCommitmentAtWeek = (week: number): TalentCommitment | undefined => {
    return commitments.find(c => week >= c.startWeek && week <= c.endWeek);
  };

  return (
    <div className="talent-gantt-container p-4 bg-slate-900/50 rounded-xl border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Availability Schedule (Next 52 Weeks)</h3>
        {talent.onMedicalLeave && (
          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded animate-pulse">
            ON MEDICAL LEAVE (Weeks remaining: {(talent.medicalLeaveEndsWeek || 0) - currentWeek})
          </span>
        )}
      </div>

      {/* Standardized horizontal scrolling utility for wide data visualizations */}
      <div className="relative overflow-x-auto max-w-full pb-4 custom-scrollbar">
        <div className="grid grid-cols-52 gap-px min-w-[800px] h-12 bg-slate-800 rounded overflow-hidden shadow-inner">
          {weeks.map((week) => {
            const commitment = getCommitmentAtWeek(week);
            const isOnLeave = talent.onMedicalLeave && week < (talent.medicalLeaveEndsWeek || 0);
            
            let bgColor = 'bg-slate-700/30';
            let icon = null;
            let tooltip = `Week ${week}: Available`;

            if (isOnLeave) {
              bgColor = 'bg-red-500/40';
              tooltip = `Week ${week}: Medical Leave`;
            } else if (commitment) {
              tooltip = `Week ${week}: ${commitment.projectTitle} (${commitment.role})`;
              if (commitment.format === 'animation') {
                bgColor = 'bg-blue-500/60 transition-colors hover:bg-blue-400/80';
                icon = <span className="text-[10px] scale-75 opacity-70">🎨</span>;
              } else if (commitment.format === 'series') {
                bgColor = 'bg-purple-500/60 transition-colors hover:bg-purple-400/80';
                icon = <span className="text-[10px] scale-75 opacity-70">📺</span>;
              } else {
                bgColor = 'bg-amber-500/60 transition-colors hover:bg-amber-400/80';
                icon = <span className="text-[10px] scale-75 opacity-70">🎬</span>;
              }
            }

            return (
              <div
                key={week}
                title={tooltip}
                className={`relative flex items-center justify-center h-full ${bgColor} border-r border-slate-800/10 cursor-help group transition-all`}
              >
                {icon}
                {week === currentWeek && (
                  <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-white shadow-[0_0_8px_white] z-10" />
                )}
                {/* Micro-hover effect */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-6 mt-4 text-[10px] font-medium text-slate-500 uppercase tracking-tight">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-amber-500/60 rounded-sm" />
          <span>Feature Film</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-purple-500/60 rounded-sm" />
          <span>TV Series</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-blue-500/60 rounded-sm" />
          <span>Animation (Exempt)</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="w-2.5 h-2.5 bg-red-500/40 rounded-sm" />
          <span>Medical Leave</span>
        </div>
      </div>
    </div>
  );
};
