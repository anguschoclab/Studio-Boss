import { describe, bench } from 'vitest';
import { Project, ProjectStatus } from '../../engine/types';

// Mock data setup
const statuses: ProjectStatus[] = ['development', 'pitching', 'production', 'released', 'post_release', 'archived'];

const generateProjects = (count: number): Project[] => {
  const projects: Project[] = [];
  for (let i = 0; i < count; i++) {
    projects.push({
      id: `proj-${i}`,
      title: `Project ${i}`,
      status: statuses[i % statuses.length],
      // Add other required fields with dummy data if necessary for type checking
    } as Project);
  }
  return projects;
};

const projects10000 = generateProjects(10000);

const COLUMNS: { status: ProjectStatus[]; title: string; color: string }[] = [
  { status: ['development'], title: 'Development', color: 'bg-secondary' },
  { status: ['pitching'], title: 'Pitching', color: 'bg-warning' },
  { status: ['production'], title: 'Production', color: 'bg-primary' },
  { status: ['released', 'post_release', 'archived'], title: 'Released & Catalog', color: 'bg-success' },
];

describe('PipelineBoard Grouping Performance', () => {
  bench('Baseline (O(C * P))', () => {
    COLUMNS.map(col => {
      const colProjects = projects10000.filter(p => col.status.includes(p.status));
      return colProjects;
    });
  });

  bench('Optimized (reduce)', () => {
    const grouped = projects10000.reduce((acc, project) => {
      if (!acc[project.status]) acc[project.status] = [];
      acc[project.status].push(project);
      return acc;
    }, {} as Record<ProjectStatus, Project[]>);

    COLUMNS.map(col => {
      return col.status.flatMap(status => grouped[status] || []);
    });
  });
});
