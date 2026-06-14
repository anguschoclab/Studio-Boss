import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { ProjectCard } from '@/components/pipeline/ProjectCard';
import { TalentCard } from '@/components/talent/TalentCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Bookmark, Layers, Users } from 'lucide-react';

export const BookmarksBoard = () => {
  const gameState = useGameStore((s) => s.gameState);
  const bookmarkIds = useMemo(
    () => gameState?.studio.bookmarks || [],
    [gameState?.studio.bookmarks]
  );

  const bookmarkedProjects = useMemo(() => {
    const projectIds = bookmarkIds
      .filter((b) => b.type === 'project')
      .map((b) => b.id);
    return projectIds
      .map((id) => gameState?.entities.projects[id])
      .filter((p): p is NonNullable<typeof p> => !!p);
  }, [bookmarkIds, gameState?.entities.projects]);

  const bookmarkedTalent = useMemo(() => {
    const talentIds = bookmarkIds
      .filter((b) => b.type === 'talent')
      .map((b) => b.id);
    return talentIds
      .map((id) => gameState?.entities.talents[id])
      .filter((t): t is NonNullable<typeof t> => !!t);
  }, [bookmarkIds, gameState?.entities.talents]);

  const hasBookmarks = bookmarkedProjects.length > 0 || bookmarkedTalent.length > 0;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 h-full flex flex-col">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/[0.02] p-10 rounded-none border border-white/5 backdrop-blur-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-none blur-[120px] pointer-events-none -mr-48 -mt-48 opacity-40" />
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-20 h-20 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center shadow-[0_0_40px_rgba(var(--primary),0.15)]">
            <Bookmark className="h-10 w-10 text-primary" strokeWidth={1} />
          </div>
          <div className="space-y-2">
            <h2 className="text-5xl font-display font-black tracking-tighter uppercase italic leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              WATCHLIST
            </h2>
            <p className="text-[10px] font-black uppercase text-muted-foreground/20 tracking-[0.4em] flex items-center gap-4 italic">
              BOOKMARKED ENTITIES
              <span className="w-1.5 h-1.5 bg-white/10" />
              <span className="text-foreground/40 font-display">
                {bookmarkedProjects.length} PROJECTS / {bookmarkedTalent.length} TALENT
              </span>
            </p>
          </div>
        </div>
      </div>

      {!hasBookmarks && (
        <EmptyState
          icon={Bookmark}
          title="WATCHLIST EMPTY"
          message="NO ENTITIES ARE CURRENTLY UNDER SURVEILLANCE. BOOKMARK PROJECTS AND TALENT FROM THEIR RESPECTIVE HUBS."
          className="flex-1"
        />
      )}

      {/* Bookmarked Projects */}
      {bookmarkedProjects.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center gap-6">
            <Layers className="h-6 w-6 text-primary" strokeWidth={2} />
            <h3 className="text-2xl font-display font-black tracking-tighter uppercase italic text-foreground/80">
              PROJECTS
            </h3>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic">
              {bookmarkedProjects.length} TRACKED
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {bookmarkedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* Bookmarked Talent */}
      {bookmarkedTalent.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center gap-6">
            <Users className="h-6 w-6 text-secondary" strokeWidth={2} />
            <h3 className="text-2xl font-display font-black tracking-tighter uppercase italic text-foreground/80">
              TALENT
            </h3>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic">
              {bookmarkedTalent.length} TRACKED
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {bookmarkedTalent.map((talent) => (
              <TalentCard key={talent.id} talent={talent} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
