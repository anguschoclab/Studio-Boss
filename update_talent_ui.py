import re

with open('src/components/talent/TalentPanel.tsx', 'r') as f:
    content = f.read()

# Add HoverCard imports
content = content.replace("import { Badge } from '@/components/ui/badge';", "import { Badge } from '@/components/ui/badge';\nimport { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';\nimport { AGENCY_ARCHETYPES } from '@/engine/data/archetypes';")

# Wrap the agency badge
hover_card_ui = """
                  {talent.agencyId && (() => {
                    const agency = agencyMap.get(talent.agencyId);
                    if (!agency) return null;
                    const archetype = agency.archetype ? AGENCY_ARCHETYPES[agency.archetype] : null;
                    return (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <span className="text-[9px] font-bold tracking-widest text-muted-foreground/80 uppercase bg-background/50 backdrop-blur-sm px-1.5 py-0.5 rounded border border-border/40 shadow-sm group-hover:border-primary/20 transition-colors cursor-help">
                            {agency.name}
                          </span>
                        </HoverCardTrigger>
                        {archetype && (
                          <HoverCardContent className="w-80 z-50">
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold">{archetype.name} Agency</h4>
                              <p className="text-sm text-muted-foreground">
                                {archetype.description}
                              </p>
                              {agency.traits && agency.traits.length > 0 && (
                                <div className="mt-2 text-xs">
                                  <strong>Traits:</strong>
                                  <ul className="list-disc pl-4 mt-1">
                                    {agency.traits.map((t, i) => <li key={i}>{t}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </HoverCardContent>
                        )}
                      </HoverCard>
                    );
                  })()}
"""

content = re.sub(
    r"                  \{talent\.agencyId && \(\n                    <span className=\"text-\[9px\] font-bold tracking-widest text-muted-foreground/80 uppercase bg-background/50 backdrop-blur-sm px-1\.5 py-0\.5 rounded border border-border/40 shadow-sm group-hover:border-primary/20 transition-colors\">\n                      \{agencyMap\.get\(talent\.agencyId\)\?\.name\}\n                    </span>\n                  \)\}",
    hover_card_ui.strip(),
    content
)

# Add Razzie Winner badge
razzie_badge = """
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-[15px] text-foreground leading-tight group-hover:text-primary transition-colors drop-shadow-sm">{talent.name}</h4>
                  {talent.hasRazzie && (
                    <Badge variant="destructive" className="text-[8px] px-1 py-0 h-4 bg-pink-500/20 text-pink-500 border-pink-500/30">RAZZIE WINNER</Badge>
                  )}
                </div>
"""

content = re.sub(
    r"              <div className=\"flex flex-col gap-1\">\n                <h4 className=\"font-display font-bold text-\[15px\] text-foreground leading-tight group-hover:text-primary transition-colors drop-shadow-sm\">\{talent\.name\}</h4>",
    razzie_badge.strip(),
    content
)

with open('src/components/talent/TalentPanel.tsx', 'w') as f:
    f.write(content)
