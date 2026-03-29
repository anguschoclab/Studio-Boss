const fs = require('fs');
const file = 'src/components/modals/ProjectDetailModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `  const talentMap = useMemo(() => new Map(talentPool.map(t => [t.id, t])), [talentPool]);

  const talentByRole = useMemo(() => {
    const map = new Map<string, import('@/engine/types').TalentProfile[]>();
    const rolesToTrack = ['director', 'actor', 'writer', 'producer'];
    for (const r of rolesToTrack) {
      map.set(r, []);
    }
    for (const t of talentPool) {
      for (const r of t.roles) {
        const arr = map.get(r);
        if (arr) {
          arr.push(t);
        }
      }
    }
    return map;
  }, [talentPool]);`;

content = content.replace(`  const talentMap = useMemo(() => new Map(talentPool.map(t => [t.id, t])), [talentPool]);`, replacement);

fs.writeFileSync(file, content);
