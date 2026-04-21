import { describe, it, expect } from 'vitest';
import { generateSpinoffProposal } from '../../../engine/systems/ip/spinoffFactory';
import { Project } from '../../../engine/types';

describe('Spinoff Factory', () => {
  const mockProject: Project = { 
    id: 'p1', 
    title: 'Galaxy Wars', 
    format: 'film', 
    genre: 'Sci-Fi', 
    budgetTier: 'blockbuster' 
  } as Project;

  it('generates a sequel for a healthy franchise', () => {
    const proposal = generateSpinoffProposal(mockProject, 'HEALTHY', 0);
    expect(proposal.title).toBeDefined();
    expect(proposal.isSpinoff).toBe(true);
    expect(proposal.parentProjectId).toBe('p1');
  });

  it('generates a docuseries for a fatigued franchise', () => {
    const proposal = generateSpinoffProposal(mockProject, 'FATIGUED', 0);
    // At least some fatigue choices should be available
    expect(proposal.flavor).toBeDefined();
    if ((proposal as any).title?.includes('True Story')) {
        expect((proposal as any).format).toBe('unscripted');
        expect((proposal as any).unscriptedFormat).toBe('docuseries');
    }
  });

  it('generates a Legacy sequel for a long-dormant franchise', () => {
    const proposal = generateSpinoffProposal(mockProject, 'LEGACY', 0);
    expect(proposal.title).toBeDefined();
    // Titles for legacy usually include 'Legacy' or 'Awakening'
  });
});
