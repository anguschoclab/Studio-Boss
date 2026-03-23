import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PipelineBoard } from '@/components/pipeline/PipelineBoard';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Project } from '@/engine/types';

vi.mock('@/store/gameStore');
vi.mock('@/store/uiStore');

// Mock ProjectCard to simplify testing
vi.mock('@/components/pipeline/ProjectCard', () => ({
  ProjectCard: ({ project }: { project: Project }) => (
    <div data-testid={`project-card-${project.id}`}>{project.title}</div>
  )
}));

describe('PipelineBoard', () => {
  const mockOpenCreateProject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUIStore).mockReturnValue({
      openCreateProject: mockOpenCreateProject,
    });
  });

  it('renders title and New Project button', () => {
    vi.mocked(useGameStore).mockReturnValue([]);
    render(<PipelineBoard />);

    expect(screen.getByText('Project Slate')).toBeInTheDocument();
    expect(screen.getByText('New Project')).toBeInTheDocument();
  });

  it('calls openCreateProject when New Project button is clicked', () => {
    vi.mocked(useGameStore).mockReturnValue([]);
    render(<PipelineBoard />);

    const button = screen.getByText('New Project');
    fireEvent.click(button);

    expect(mockOpenCreateProject).toHaveBeenCalledTimes(1);
  });

  it('renders all pipeline columns', () => {
    vi.mocked(useGameStore).mockReturnValue([]);
    render(<PipelineBoard />);

    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Pitching')).toBeInTheDocument();
    expect(screen.getByText('Production & Marketing')).toBeInTheDocument();
    expect(screen.getByText('Released & Catalog')).toBeInTheDocument();
  });

  it('distributes projects into correct columns', () => {
    const mockProjects: Project[] = [
      { id: '1', title: 'Project 1', status: 'development', budgetTier: 'low', format: 'film', genre: 'Action', targetAudience: 'general', flavor: 'Standard', budget: 10, weeklyCost: 1, weeksInPhase: 0, developmentWeeks: 4, productionWeeks: 4, revenue: 0, weeklyRevenue: 0, releaseWeek: null, buzz: 0 } as Project,
      { id: '2', title: 'Project 2', status: 'pitching', budgetTier: 'low', format: 'film', genre: 'Comedy', targetAudience: 'general', flavor: 'Standard', budget: 10, weeklyCost: 1, weeksInPhase: 0, developmentWeeks: 4, productionWeeks: 4, revenue: 0, weeklyRevenue: 0, releaseWeek: null, buzz: 0 } as Project,
      { id: '3', title: 'Project 3', status: 'production', budgetTier: 'low', format: 'film', genre: 'Drama', targetAudience: 'general', flavor: 'Standard', budget: 10, weeklyCost: 1, weeksInPhase: 0, developmentWeeks: 4, productionWeeks: 4, revenue: 0, weeklyRevenue: 0, releaseWeek: null, buzz: 0 } as Project,
      { id: '4', title: 'Project 4', status: 'released', budgetTier: 'low', format: 'film', genre: 'Horror', targetAudience: 'general', flavor: 'Standard', budget: 10, weeklyCost: 1, weeksInPhase: 0, developmentWeeks: 4, productionWeeks: 4, revenue: 0, weeklyRevenue: 0, releaseWeek: null, buzz: 0 } as Project,
    ];

    vi.mocked(useGameStore).mockReturnValue(mockProjects);
    render(<PipelineBoard />);

    expect(screen.getByTestId('project-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('project-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('project-card-3')).toBeInTheDocument();
    expect(screen.getByTestId('project-card-4')).toBeInTheDocument();

    // Verify "No projects" messages
    const noProjectsMessages = screen.queryAllByText('No projects');
    expect(noProjectsMessages.length).toBe(0); // All columns have a project
  });

  it('shows "No projects" message for empty columns', () => {
    // Only one project in Development
    const mockProjects: Project[] = [
      { id: '1', title: 'Project 1', status: 'development', budgetTier: 'low', format: 'film', genre: 'Action', targetAudience: 'general', flavor: 'Standard', budget: 10, weeklyCost: 1, weeksInPhase: 0, developmentWeeks: 4, productionWeeks: 4, revenue: 0, weeklyRevenue: 0, releaseWeek: null, buzz: 0 } as Project,
    ];

    vi.mocked(useGameStore).mockReturnValue(mockProjects);
    render(<PipelineBoard />);

    expect(screen.getByTestId('project-card-1')).toBeInTheDocument();

    // 3 columns should be empty
    const noProjectsMessages = screen.getAllByText('No projects');
    expect(noProjectsMessages.length).toBe(3);
  });
});
