import fs from 'fs';
let content = fs.readFileSync('src/test/components/modals/CreateProjectModal.test.tsx', 'utf8');

content = content.replaceAll(
  "(useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({\n      showCreateProject: true,\n      closeCreateProject: mockCloseCreateProject,\n    });",
  "(useUIStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => selector ? selector({\n      showCreateProject: true,\n      closeCreateProject: mockCloseCreateProject,\n    }) : { showCreateProject: true, closeCreateProject: mockCloseCreateProject });"
);

content = content.replaceAll(
  "(useGameStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({\n      createProject: mockCreateProject,\n      gameState: mockGameState,\n    });",
  "(useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => selector ? selector({\n      createProject: mockCreateProject,\n      gameState: mockGameState,\n    }) : { createProject: mockCreateProject, gameState: mockGameState });"
);

content = content.replaceAll(
  "(useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({\n      showCreateProject: false,\n      closeCreateProject: mockCloseCreateProject,\n    });",
  "(useUIStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => selector ? selector({\n      showCreateProject: false,\n      closeCreateProject: mockCloseCreateProject,\n    }) : { showCreateProject: false, closeCreateProject: mockCloseCreateProject });"
);


fs.writeFileSync('src/test/components/modals/CreateProjectModal.test.tsx', content);
