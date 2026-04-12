import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GreenlightQueue } from '@/components/development/GreenlightQueue';

describe('GreenlightQueue', () => {
  it('renders empty state when no projects', () => {
    render(<GreenlightQueue projects={[]} />);
    
    expect(screen.getByText('No Projects Awaiting Greenlight')).toBeInTheDocument();
  });

  it('renders projects needing greenlight', () => {
    const projects = [
      {
        id: '1',
        title: 'Blockbuster Movie',
        genre: 'Action',
        budget: 100000000,
        developmentWeeks: 12,
        awards: [],
        flavor: 'High octane action thriller',
      },
    ];

    render(<GreenlightQueue projects={projects as any} />);
    
    expect(screen.getByText('Blockbuster Movie')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('displays project budget formatted correctly', () => {
    const projects = [
      {
        id: '1',
        title: 'Test Project',
        genre: 'Drama',
        budget: 50000000,
        developmentWeeks: 8,
        awards: [],
      },
    ];

    render(<GreenlightQueue projects={projects as any} />);
    
    expect(screen.getByText('Budget: $50.0M')).toBeInTheDocument();
  });

  it('calls onApprove when approve button clicked', () => {
    const handleApprove = vi.fn();
    const projects = [
      {
        id: 'proj-1',
        title: 'Test Project',
        genre: 'Comedy',
        budget: 20000000,
        developmentWeeks: 6,
        awards: [],
      },
    ];

    render(<GreenlightQueue projects={projects as any} onApprove={handleApprove} />);
    
    fireEvent.click(screen.getByText('Greenlight'));
    expect(handleApprove).toHaveBeenCalledWith('proj-1');
  });

  it('calls onReject when reject button clicked', () => {
    const handleReject = vi.fn();
    const projects = [
      {
        id: 'proj-1',
        title: 'Test Project',
        genre: 'Horror',
        budget: 15000000,
        developmentWeeks: 4,
        awards: [],
      },
    ];

    render(<GreenlightQueue projects={projects as any} onReject={handleReject} />);
    
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(handleReject).toHaveBeenCalledWith('proj-1');
  });

  it('calls onReview when review button clicked', () => {
    const handleReview = vi.fn();
    const projects = [
      {
        id: 'proj-1',
        title: 'Test Project',
        genre: 'Sci-Fi',
        budget: 80000000,
        developmentWeeks: 10,
        awards: [],
      },
    ];

    render(<GreenlightQueue projects={projects as any} onReview={handleReview} />);
    
    fireEvent.click(screen.getByText('Review'));
    expect(handleReview).toHaveBeenCalledWith('proj-1');
  });
});
