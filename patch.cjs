const fs = require('fs');

const file = 'src/test/engine/systems/processors/processProduction.test.ts';
let content = fs.readFileSync(file, 'utf8');

const tests = `

  it('triggers a new crisis when project has a resolved crisis', () => {
    const state = getInitialState();
    const project = createBaseProject('p1', 'production');
    project.activeCrisis = {
      description: 'Old crisis', options: [], resolved: true, severity: 'low'
    };
    state.studio.internal.projects = [project];

    vi.mocked(getTrendMultiplier).mockReturnValue(1.0);
    vi.mocked(advanceProject).mockReturnValue({
      project: { ...project },
      update: '',
      talentUpdates: []
    });
    vi.mocked(checkAndTriggerCrisis).mockReturnValue({
      description: 'New crisis!', options: [], resolved: false, severity: 'high'
    });
    vi.mocked(processDirectorDisputes).mockReturnValue({ newCrises: [], updates: [] });
    vi.mocked(calculateBoxOfficeRanks).mockReturnValue(new Map());

    const changes = getInitialWeeklyChanges();
    const result = processProduction(state, changes);

    expect(result.studio.internal.projects[0].activeCrisis).toBeDefined();
    expect(result.studio.internal.projects[0].activeCrisis?.description).toBe('New crisis!');
    expect(changes.events).toContain('CRISIS: "Project p1" - New crisis!');
  });

  it('does not trigger a new crisis when checkAndTriggerCrisis returns undefined', () => {
    const state = getInitialState();
    const project = createBaseProject('p1', 'production');
    state.studio.internal.projects = [project];

    vi.mocked(getTrendMultiplier).mockReturnValue(1.0);
    vi.mocked(advanceProject).mockReturnValue({
      project: { ...project },
      update: '',
      talentUpdates: []
    });
    vi.mocked(checkAndTriggerCrisis).mockReturnValue(undefined);
    vi.mocked(processDirectorDisputes).mockReturnValue({ newCrises: [], updates: [] });
    vi.mocked(calculateBoxOfficeRanks).mockReturnValue(new Map());

    const changes = getInitialWeeklyChanges();
    const result = processProduction(state, changes);

    expect(result.studio.internal.projects[0].activeCrisis).toBeUndefined();
    expect(changes.events.length).toBe(0);
  });

  it('processes industry awards without throwing errors', () => {
    const state = getInitialState();
    const project = createBaseProject('p1', 'production');
    state.studio.internal.projects = [project];
    state.industry.awards = [
      { id: 'a1', projectId: 'p1', year: 2024, category: 'Best Picture', recipientName: 'p1', awardName: 'Oscar' } as any
    ];

    vi.mocked(getTrendMultiplier).mockReturnValue(1.0);
    vi.mocked(advanceProject).mockReturnValue({
      project: { ...project },
      update: '',
      talentUpdates: []
    });
    vi.mocked(checkAndTriggerCrisis).mockReturnValue(undefined);
    vi.mocked(processDirectorDisputes).mockReturnValue({ newCrises: [], updates: [] });
    vi.mocked(calculateBoxOfficeRanks).mockReturnValue(new Map());

    const changes = getInitialWeeklyChanges();
    const result = processProduction(state, changes);

    expect(result.studio.internal.projects[0].id).toBe('p1');
  });
`;

content = content.replace(/}\);\n}\);\n?$/, tests + '});\n');
fs.writeFileSync(file, content);
