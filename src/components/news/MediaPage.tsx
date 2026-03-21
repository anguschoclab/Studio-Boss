import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Newspaper, Trophy, TrendingUp, MonitorPlay, Activity } from 'lucide-react';
import { Headline } from '@/engine/types';

interface OutletWidgetProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  headlines: Headline[];
  colorClass: string;
}

const OutletWidget = ({ title, description, icon, headlines, colorClass }: OutletWidgetProps) => (
  <Card className="h-full flex flex-col border-border/40 bg-card/30 backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-card/40 hover:border-border/60">
    <CardHeader className="pb-3 border-b border-border/50">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-md ${colorClass} bg-opacity-20 flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <CardTitle className={`font-display tracking-tight text-lg ${colorClass}`}>{title}</CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-4 flex-1 overflow-y-auto max-h-[400px]">
      {headlines.length > 0 ? (
        <div className="space-y-4">
          {headlines.map((h, i) => (
            <div key={h.id || i} className="space-y-2 pb-3.5 border-b border-border/30 last:border-0 last:pb-0 hover:bg-muted/10 p-2 -mx-2 rounded-lg transition-colors">
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Wk {h.week}
                </span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 capitalize opacity-70">
                  {h.category}
                </Badge>
              </div>
              <p className="text-[13px] sm:text-sm font-medium leading-relaxed">{h.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-32 flex items-center justify-center text-muted-foreground text-sm italic">
          No breaking stories yet...
        </div>
      )}
    </CardContent>
  </Card>
);

export const MediaPage = () => {
  const headlines = useGameStore((s) => s.gameState?.headlines || []);

  // Filter headlines by category to simulate different trade outlets using a single pass for performance
  const groupedHeadlines = useMemo(() => headlines.reduce(
    (acc, h) => {
      const c = h.category;
      if (c === 'talent') {
        acc.deadline.push(h);
        acc.insider.push(h);
      } else if (c === 'rival') {
        acc.deadline.push(h);
        acc.market.push(h);
      } else if (c === 'awards') {
        acc.variety.push(h);
      } else if (c === 'market') {
        acc.variety.push(h);
        acc.boxOffice.push(h);
        acc.market.push(h);
      } else if (c === 'general') {
        acc.boxOffice.push(h);
        acc.insider.push(h);
      }
      return acc;
    },
    {
      deadline: [] as Headline[],
      variety: [] as Headline[],
      boxOffice: [] as Headline[],
      market: [] as Headline[],
      insider: [] as Headline[],
    }
  ), [headlines]);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h2 className="text-3xl font-display font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">The Trades</h2>
        <p className="text-muted-foreground mt-2 text-sm max-w-2xl">
          Industry rumors, box office scoreboards, and awards buzz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr pb-6">
        <OutletWidget
          title="The Daily Lead"
          description="Fast, deal-driven, rumor-forward casting and rival scoops."
          icon={<Activity className="w-5 h-5 text-destructive" />}
          headlines={groupedHeadlines.deadline}
          colorClass="text-destructive"
        />

        <OutletWidget
          title="Showbiz Weekly"
          description="Institutional awards-literate coverage and prestige framing."
          icon={<Trophy className="w-5 h-5 text-primary" />}
          headlines={groupedHeadlines.variety}
          colorClass="text-primary"
        />

        <OutletWidget
          title="Box Office Bulletin"
          description="Specialized reporting for weekend box office and TV ratings."
          icon={<TrendingUp className="w-5 h-5 text-green-500" />}
          headlines={groupedHeadlines.boxOffice}
          colorClass="text-green-500"
        />

        <OutletWidget
          title="Global Screen Report"
          description="Sales, festivals, and worldwide commercial temperature."
          icon={<MonitorPlay className="w-5 h-5 text-blue-400" />}
          headlines={groupedHeadlines.market}
          colorClass="text-blue-400"
        />

        <OutletWidget
          title="Hollywood Insider"
          description="Talent profiles, behind-the-scenes friction, and ecosystem power lists."
          icon={<Newspaper className="w-5 h-5 text-orange-400" />}
          headlines={groupedHeadlines.insider}
          colorClass="text-orange-400"
        />
      </div>
    </div>
  );
};
