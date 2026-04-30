import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Newspaper, Terminal, ArrowRight } from 'lucide-react';
import { Headline } from '@/engine/types';
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
  const text = headline.text.toUpperCase();
  
  // Generate contextual paragraphs based on category
  if (headline.category === 'market') {
    paragraphs.push(
      `INDUSTRY ANALYSTS ARE CLOSELY WATCHING DEVELOPMENTS AS ${text}`,
      `SOURCES CLOSE TO THE SITUATION SUGGEST THIS TREND COULD RESHAPE THE ENTERTAINMENT LANDSCAPE FOR THE COMING QUARTER. MULTIPLE EXECUTIVES SPEAKING ON CONDITION OF ANONYMITY CONFIRMED THE SIGNIFICANCE OF THESE NUMBERS.`,
      `"THIS IS EXACTLY THE KIND OF MARKET SHIFT WE'VE BEEN ANTICIPATING," SAID ONE SENIOR ANALYST AT A MAJOR INVESTMENT BANK. "THE IMPLICATIONS FOR STUDIO VALUATIONS AND CONTENT SPENDING CANNOT BE UNDERSTATED."`,
      `WALL STREET RESPONDED CAUTIOUSLY, WITH ENTERTAINMENT SECTOR STOCKS SHOWING MIXED SIGNALS IN EARLY TRADING. SEVERAL INSTITUTIONAL INVESTORS ARE REPORTEDLY REASSESSING THEIR POSITIONS IN LIGHT OF THESE DEVELOPMENTS.`
    );
  } else if (headline.category === 'talent') {
    paragraphs.push(
      `IN A DEVELOPMENT THAT HAS SENT RIPPLES THROUGH THE INDUSTRY, ${text}`,
      `INSIDERS DESCRIBE THE SITUATION AS A DEFINING MOMENT FOR THE TALENT INVOLVED, WITH REPRESENTATION AT MAJOR AGENCIES SCRAMBLING TO POSITION THEIR CLIENTS FAVORABLY.`,
      `THE MOVE IS EXPECTED TO HAVE CASCADING EFFECTS ON UPCOMING PRODUCTIONS AND COULD SIGNIFICANTLY IMPACT THE CURRENT AWARDS SEASON TRAJECTORY.`,
      `INDUSTRY OBSERVERS NOTE THIS FOLLOWS A BROADER PATTERN OF TALENT LEVERAGING THEIR MARKET POSITION IN AN INCREASINGLY COMPETITIVE LANDSCAPE.`
    );
  } else if (headline.category === 'rival') {
    paragraphs.push(
      `THE COMPETITIVE LANDSCAPE SHIFTED DRAMATICALLY AS ${text}`,
      `THIS AGGRESSIVE MOVE HAS CAUGHT RIVALS OFF GUARD, FORCING SEVERAL STUDIOS TO RECONSIDER THEIR UPCOMING SLATE STRATEGY. BOARD MEMBERS AT COMPETING STUDIOS ARE REPORTEDLY CONVENING EMERGENCY SESSIONS.`,
      `"WE'RE SEEING A CHESS MATCH PLAY OUT IN REAL TIME," NOTED ONE ENTERTAINMENT LAWYER. "THE STRATEGIC IMPLICATIONS OF THIS DECISION WILL BE FELT ACROSS THE INDUSTRY FOR YEARS TO COME."`,
      `MARKET SHARE PROJECTIONS FOR THE COMING FISCAL YEAR ARE BEING REVISED ACROSS THE BOARD IN RESPONSE.`
    );
  } else if (headline.category === 'awards') {
    paragraphs.push(
      `AWARDS SEASON HAS TAKEN AN UNEXPECTED TURN AS ${text}`,
      `CAMPAIGN STRATEGISTS FOR COMPETING FILMS AND SERIES ARE RECALIBRATING THEIR APPROACHES, WITH SEVERAL HIGH-PROFILE FOR YOUR CONSIDERATION EVENTS BEING HASTILY REORGANIZED.`,
      `VOTING MEMBERS CONTACTED FOR COMMENT EXPRESSED SURPRISE AT THE DEVELOPMENT, WITH MANY ACKNOWLEDGING IT COULD FUNDAMENTALLY ALTER THE RACE.`,
      `HISTORICAL PRECEDENT SUGGESTS THIS TYPE OF LATE-BREAKING DEVELOPMENT TENDS TO FAVOR THE BOLDEST CAMPAIGNS.`
    );
  } else {
    paragraphs.push(
      `IN BREAKING ENTERTAINMENT NEWS, ${text}`,
      `THE DEVELOPMENT COMES AT A CRUCIAL TIME FOR THE INDUSTRY, WITH MULTIPLE STAKEHOLDERS WEIGHING THE POTENTIAL IMPACT ON THEIR OPERATIONS.`,
      `FURTHER DETAILS ARE EXPECTED TO EMERGE IN THE COMING DAYS AS THE SITUATION CONTINUES TO DEVELOP.`
    );
  }
  
  return paragraphs;
}

const CATEGORY_STYLES: Record<string, { color: string; label: string }> = {
  market: { color: 'text-blue-500 border-blue-500/20 bg-blue-500/5', label: 'MARKET_ANALYSIS' },
  talent: { color: 'text-violet-500 border-violet-500/20 bg-violet-500/5', label: 'TALENT_REPORT' },
  rival: { color: 'text-rose-500 border-rose-500/20 bg-rose-500/5', label: 'RIVAL_INTEL' },
  awards: { color: 'text-amber-500 border-amber-500/20 bg-amber-500/5', label: 'AWARDS_DESK' },
  general: { color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5', label: 'BREAKING_NEWS' },
  rumor: { color: 'text-primary border-primary/20 bg-primary/5', label: 'INDUSTRY_RUMOR' },
};

export const NewsStoryModal: React.FC<NewsStoryModalProps> = ({ headline, open, onClose }) => {
  if (!headline) return null;
  
  const style = CATEGORY_STYLES[headline.category] || CATEGORY_STYLES.general;
  const paragraphs = generateArticleContent(headline);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-black/95 backdrop-blur-3xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.9)] p-0 rounded-none overflow-hidden">
        {/* Article Header */}
        <div className="p-10 pb-8 space-y-6 border-b border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn("px-4 py-1 text-[9px] font-black uppercase tracking-[0.4em] border rounded-none italic shadow-2xl", style.color)}>
                {style.label}
              </div>
              <div className="h-4 w-px bg-white/10" />
              <span className="text-[10px] font-black font-mono text-muted-foreground/40 italic tracking-widest uppercase">CYCLE_W{headline.week}_UPLINK</span>
            </div>
            <Newspaper className="h-5 w-5 text-primary/20" />
          </div>
          
          <h2 className="font-display font-black text-3xl leading-[1.1] tracking-tighter text-foreground uppercase italic drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            {headline.text.toUpperCase()}
          </h2>
          
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-primary rotate-45 shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
             <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary italic">THE_TRADES // EXCLUSIVE_INTEL_STREAM</p>
          </div>
        </div>
        
        {/* Article Body */}
        <ScrollArea className="max-h-[500px]">
          <div className="p-10 space-y-8">
            {paragraphs.map((p, i) => (
              <p key={i} className={cn(
                "text-[13px] leading-relaxed text-muted-foreground/60 font-medium italic tracking-tight uppercase",
                i === 0 && "text-foreground font-black border-l-2 border-primary pl-6 py-2"
              )}>
                {p}
              </p>
            ))}
            
            <div className="pt-8 border-t border-white/5 flex items-center gap-4">
              <Terminal className="h-4 w-4 text-primary/20" />
              <p className="text-[10px] text-muted-foreground/20 italic uppercase tracking-[0.3em] font-black">
                STATUS: DATA_UPLINK_ONGOING... REMAIN_STATIONARY_FOR_UPDATES...
              </p>
            </div>
          </div>
        </ScrollArea>
        
        <div className="p-8 border-t border-white/5 flex justify-end bg-black/40">
          <button 
            onClick={onClose} 
            className="h-12 px-8 bg-white/5 border border-white/10 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-700 font-black uppercase tracking-[0.4em] italic text-[10px] rounded-none group flex items-center gap-4"
          >
            DISMISS_INTEL
            <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-700" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
