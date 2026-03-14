const fs = require('fs');

let code = fs.readFileSync('src/store/uiStore.ts', 'utf-8');

code = code.replace(
  "  showCreateProject: boolean;",
  "  showCreateProject: boolean;\n  showPitchProject: boolean;\n  pitchingProjectId: string | null;"
);

code = code.replace(
  "  openCreateProject: () => void;\n  closeCreateProject: () => void;",
  "  openCreateProject: () => void;\n  closeCreateProject: () => void;\n  openPitchProject: (projectId: string) => void;\n  closePitchProject: () => void;"
);

code = code.replace(
  "  showCreateProject: false,",
  "  showCreateProject: false,\n  showPitchProject: false,\n  pitchingProjectId: null,"
);

code = code.replace(
  "  closeCreateProject: () => set({ showCreateProject: false }),",
  "  closeCreateProject: () => set({ showCreateProject: false }),\n  openPitchProject: (projectId) => set({ showPitchProject: true, pitchingProjectId: projectId }),\n  closePitchProject: () => set({ showPitchProject: false, pitchingProjectId: null }),"
);

fs.writeFileSync('src/store/uiStore.ts', code);
