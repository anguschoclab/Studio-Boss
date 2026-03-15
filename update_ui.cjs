const fs = require('fs');

let uiContent = fs.readFileSync('src/components/talent/TalentPanel.tsx', 'utf8');

// Replace badge section to include family and access level
const updatedHeader = `<div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <h4 className="font-display font-semibold text-sm text-foreground leading-tight">{talent.name}</h4>
                {talent.accessLevel !== 'outsider' && talent.accessLevel !== 'soft-access' && (
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                    {talent.accessLevel}
                  </span>
                )}
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">
                {talent.type.toUpperCase()}
              </Badge>
            </div>`;

uiContent = uiContent.replace(/<div className="flex items-start justify-between gap-2">[\s\S]*?<\/div>/, updatedHeader);

fs.writeFileSync('src/components/talent/TalentPanel.tsx', uiContent);
