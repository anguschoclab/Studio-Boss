import React, { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Newspaper, ExternalLink, X } from 'lucide-react';
import { Headline, NewsEvent } from '@/engine/types';
import { TalentNameLink } from '@/components/shared/TalentNameLink';
import { cn } from '@/lib/utils';

interface NewsStoryModalProps {
  headline: Headline | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Generate procedural article content from a headline
 */
function generateArticleContent(headline: Headline): string[] {
  const paragraphs: string[] = [];
  const text = headline.text;
  
  // Generate contextual paragraphs based on category
  if (headline.category === 'market') {
    paragraphs.push(
      `Industry analysts are closely watching developments as ${text.toLowerCase()}`,
      `Sources close to the situation suggest this trend could reshape the entertainment landscape for the coming quarter. Multiple executives speaking on condition of anonymity confirmed the significance of these numbers.`,
      `"This is exactly the kind of market shift we've been anticipating," said one senior analyst at a major investment bank. "The implications for studio valuations and content spending cannot be understated."`,
      `Wall Street responded cautiously, with entertainment sector stocks showing mixed signals in early trading. Several institutional investors are reportedly reassessing their positions in light of these developments.`
    );
  } else if (headline.category === 'talent') {
    paragraphs.push(
      `In a development that has sent ripples through the industry, ${text.toLowerCase()}`,
      `Insiders describe the situation as a defining moment for the talent involved, with representation at major agencies scrambling to position their clients favorably.`,
      `The move is expected to have cascading effects on upcoming productions and could significantly impact the current awards season trajectory.`,
      `Industry observers note this follows a broader pattern of talent leveraging their market position in an increasingly competitive landscape.`
    );
  } else if (headline.category === 'rival') {
    paragraphs.push(
      `The competitive landscape shifted dramatically as ${text.toLowerCase()}`,
      `This aggressive move has caught rivals off guard, forcing several studios to reconsider their upcoming slate strategy. Board members at competing studios are reportedly convening emergency sessions.`,
      `"We're seeing a chess match play out in real time," noted one entertainment lawyer. "The strategic implications of this decision will be felt across the industry for years to come."`,
      `Market share projections for the coming fiscal year are being revised across the board in response.`
    );
  } else if (headline.category === 'awards') {
    paragraphs.push(
      `Awards season has taken an unexpected turn as ${text.toLowerCase()}`,
      `Campaign strategists for competing films and series are recalibrating their approaches, with several high-profile For Your Consideration events being hastily reorganized.`,
      `Voting members contacted for comment expressed surprise at the development, with many acknowledging it could fundamentally alter the race.`,
      `Historical precedent suggests this type of late-breaking development tends to favor the boldest campaigns.`
    );
  } else {
    paragraphs.push(
      `In breaking entertainment news, ${text.toLowerCase()}`,
      `The development comes at a crucial time for the industry, with multiple stakeholders weighing the potential impact on their operations.`,
      `Further details are expected to emerge in the coming days as the situation continues to develop.`
    );
  }
  
  return paragraphs;
}

const CATEGORY_STYLES: Record<string, { color: string; label: string }> = {
  market: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'MARKET ANALYSIS' },
  talent: { color: 'bg-violet-500/10 text-violet-400 border-violet-500/20', label: 'TALENT REPORT' },
  rival: { color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', label: 'RIVAL INTEL' },
  awards: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'AWARDS DESK' },
  general: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'BREAKING NEWS' },
  rumor: { color: 'bg-pink-500/10 text-pink-400 border-pink-500/20', label: 'INDUSTRY RUMOR' },
};

export const NewsStoryModal: React.FC<NewsStoryModalProps> = ({ headline, open, onClose }) => {
  if (!headline) return null;
  
  const style = CATEGORY_STYLES[headline.category] || CATEGORY_STYLES.general;
  const paragraphs = generateArticleContent(headline);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl p-0 overflow-hidden">
        {/* Article Header */}
        <div className="p-6 pb-4 space-y-3 border-b border-border/40 bg-gradient-to-br from-card to-background">
          <div className="flex items-center gap-2">
            <Badge className={cn("text-[8px] font-black uppercase tracking-[0.2em] border", style.color)}>
              {style.label}
            </Badge>
            <span className="text-[9px] font-mono text-muted-foreground">Week {headline.week}</span>
          </div>
          <h2 className="font-display font-black text-xl leading-tight tracking-tight text-foreground">
            {headline.text}
          </h2>
          <p className="text-[10px] text-muted-foreground italic">The Trades • Exclusive Industry Report</p>
        </div>
        
        {/* Article Body */}
        <ScrollArea className="max-h-[400px]">
          <div className="p-6 space-y-4">
            {paragraphs.map((p, i) => (
              <p key={i} className={cn(
                "text-sm leading-relaxed text-muted-foreground",
                i === 0 && "text-foreground font-medium"
              )}>
                {p}
              </p>
            ))}
            
            <div className="pt-4 border-t border-border/40">
              <p className="text-[9px] text-muted-foreground/50 italic uppercase tracking-widest">
                This story is developing. Check back for updates.
              </p>
            </div>
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-border/40 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-[10px] font-bold uppercase">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
