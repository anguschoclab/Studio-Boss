import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScriptList } from '@/components/development/ScriptList';

describe('ScriptList', () => {
  it('renders empty state when no scripts', () => {
    render(<ScriptList scripts={[]} />);
    
    expect(screen.getByText('No Active Scripts')).toBeInTheDocument();
    expect(screen.getByText('Create a new IP concept to begin development')).toBeInTheDocument();
  });

  it('renders scripts grouped by status', () => {
    const scripts = [
      {
        id: '1',
        title: 'Space Adventure',
        writerName: 'John Doe',
        status: 'draft',
        quality: 75,
        weekStarted: 1,
        genre: 'Sci-Fi',
        revisionCount: 2,
      },
      {
        id: '2',
        title: 'Love Story',
        writerName: 'Jane Smith',
        status: 'concept',
        quality: 60,
        weekStarted: 2,
        genre: 'Romance',
        revisionCount: 0,
      },
    ];

    render(<ScriptList scripts={scripts as any} />);
    
    expect(screen.getByText('Space Adventure')).toBeInTheDocument();
    expect(screen.getByText('Love Story')).toBeInTheDocument();
    expect(screen.getByText('by John Doe')).toBeInTheDocument();
  });

  it('displays script metadata', () => {
    const scripts = [
      {
        id: '1',
        title: 'Test Script',
        writerName: 'Writer Name',
        status: 'final',
        quality: 90,
        weekStarted: 1,
        weekCompleted: 10,
        genre: 'Drama',
        logline: 'A compelling story about...',
        revisionCount: 5,
      },
    ];

    render(<ScriptList scripts={scripts as any} />);
    
    expect(screen.getByText('Quality: 90/100')).toBeInTheDocument();
    expect(screen.getByText('5 revisions')).toBeInTheDocument();
    expect(screen.getByText('Drama')).toBeInTheDocument();
  });

  it('shows progress bar for each script', () => {
    const scripts = [
      {
        id: '1',
        title: 'Draft Script',
        writerName: 'Writer',
        status: 'draft',
        quality: 50,
        weekStarted: 1,
        genre: 'Action',
        revisionCount: 1,
      },
    ];

    const { container } = render(<ScriptList scripts={scripts as any} />);
    
    // Progress bar should exist
    expect(container.querySelector('.h-full.rounded-full')).toBeInTheDocument();
  });
});
