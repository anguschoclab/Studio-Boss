const fs = require('fs');
const file = 'src/components/modals/ProjectDetailModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const originalRoleGroups = `  const roleGroups = useMemo(() => {
    const groups = new Map<string, { attached: import('@/engine/types').TalentProfile[], available: import('@/engine/types').TalentProfile[] }>();
    const rolesToTrack = ['director', 'actor', 'writer', 'producer'];
    for (const r of rolesToTrack) {
      groups.set(r, { attached: [], available: [] });
    }
    if (!project) return groups;
    const projectContracts = contracts.filter(c => c.projectId === project.id);
    const projectTalentIds = new Set(projectContracts.map(c => c.talentId));
    for (const t of talentPool) {
      for (const r of t.roles) {
        const group = groups.get(r);
        if (group) {
          if (projectTalentIds.has(t.id)) {
            group.attached.push(t);
          } else {
            group.available.push(t);
          }
        }
      }
    }
    return groups;
  }, [project, contracts, talentPool]);`;

const optimizedRoleGroups = `  const roleGroups = useMemo(() => {
    const groups = new Map<string, { attached: import('@/engine/types').TalentProfile[], available: import('@/engine/types').TalentProfile[] }>();
    const rolesToTrack = ['director', 'actor', 'writer', 'producer'];

    if (!project) {
      for (const r of rolesToTrack) {
        groups.set(r, { attached: [], available: [] });
      }
      return groups;
    }

    const projectContracts = contracts.filter(c => c.projectId === project.id);
    const projectTalentIds = new Set(projectContracts.map(c => c.talentId));

    for (const r of rolesToTrack) {
      const allInRole = talentByRole.get(r) || [];
      const attached: import('@/engine/types').TalentProfile[] = [];
      const available: import('@/engine/types').TalentProfile[] = [];

      for (let i = 0; i < allInRole.length; i++) {
        const t = allInRole[i];
        if (projectTalentIds.has(t.id)) {
          attached.push(t);
        } else {
          available.push(t);
        }
      }

      groups.set(r, { attached, available });
    }
    return groups;
  }, [project, contracts, talentByRole]);`;

if (content.includes(originalRoleGroups)) {
    content = content.replace(originalRoleGroups, optimizedRoleGroups);
    fs.writeFileSync(file, content);
    console.log("Patched successfully");
} else {
    console.log("Could not find original roleGroups logic");
}
