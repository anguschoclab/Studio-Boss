import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { PitchProjectModal } from '@/components/modals/PitchProjectModal';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';

// Mock the stores
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

vi.mock('@/store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

// Mock the fit score calculation
vi.mock('@/engine/systems/buyers', () => ({
  calculateFitScore: vi.fn().mockReturnValue(75),
}));

describe('PitchProjectModal', () => {
  const mockProject = {
    id: 'proj-1',
    title: 'Mock Project',
    format: 'tv',
    genre: 'Drama',
    budgetTier: 'mid',
    budget: 1000000,
    weeklyCost: 100000,
    targetAudience: 'adults',
    flavor: 'gritty',
    status: 'pitching',
    buzz: 50,
    weeksInPhase: 0,
    developmentWeeks: 10,
    productionWeeks: 20,
    revenue: 0,
    weeklyRevenue: 0,
    releaseWeek: null,
  };

  const mockBuyers = [
    {
      id: 'buyer-1',
      name: 'Mock Network',
      archetype: 'network',
    },
    {
      id: 'buyer-2',
      name: 'Mock Streamer',
      archetype: 'streamer',
      currentMandate: {
        type: 'drama',
        activeUntilWeek: 10,
      },
    },
  ];

  const mockGameState = {
    studio: {
      internal: {
        projects: [mockProject]
      }
    },
    market: {
      buyers: mockBuyers
    }
  };

  const mockClosePitchProject = vi.fn();
  const mockPitchProject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useUIStore as unknown as Mock).mockReturnValue({
      showPitchProject: true,
      closePitchProject: mockClosePitchProject,
      pitchingProjectId: 'proj-1',
    });

    (useGameStore as unknown as Mock).mockImplementation((selector: (s: unknown) => unknown) => {
      if (selector.toString().includes('gameState')) {
        return mockGameState;
      }
      if (selector.toString().includes('pitchProject')) {
        return mockPitchProject;
      }
      return null;
    });
  });

  it('renders correctly when open', () => {
    render(<PitchProjectModal />);

    expect(screen.getByText('Pitch Project: Mock Project')).toBeInTheDocument();
    expect(screen.getByText('1. Select Buyer')).toBeInTheDocument();
    expect(screen.getByText('Mock Network')).toBeInTheDocument();
    expect(screen.getByText('Mock Streamer')).toBeInTheDocument();
    expect(screen.getAllByText('Est. Fit: 75/100').length).toBe(2);
  });

  it('does not render if gameState or pitchingProjectId is null', () => {
    (useUIStore as unknown as Mock).mockReturnValue({
      showPitchProject: true,
      closePitchProject: mockClosePitchProject,
      pitchingProjectId: null,
    });

    const { container } = render(<PitchProjectModal />);
    expect(container.firstChild).toBeNull();
  });

  it('does not render if project is not found', () => {
    (useUIStore as unknown as Mock).mockReturnValue({
      showPitchProject: true,
      closePitchProject: mockClosePitchProject,
      pitchingProjectId: 'non-existent-proj',
    });

    const { container } = render(<PitchProjectModal />);
    expect(container.firstChild).toBeNull();
  });

  it('selects a buyer when clicked', () => {
    render(<PitchProjectModal />);

    const buyerButton = screen.getByText('Mock Network').closest('button');
    expect(buyerButton).not.toHaveClass('bg-primary/10');

    fireEvent.click(buyerButton!);

    expect(buyerButton).toHaveClass('bg-primary/10');
  });

  it('selects a deal structure when clicked', () => {
    render(<PitchProjectModal />);

    const deficitButton = screen.getByText('Deficit Financing').closest('button');
    expect(deficitButton).not.toHaveClass('bg-primary/10');

    fireEvent.click(deficitButton!);

    expect(deficitButton).toHaveClass('bg-primary/10');
  });

  it('handles a successful pitch', async () => {
    mockPitchProject.mockReturnValue(true);
    render(<PitchProjectModal />);

    // Select buyer
    fireEvent.click(screen.getByText('Mock Network').closest('button')!);

    // Click pitch
    fireEvent.click(screen.getByText('Pitch Project', { selector: 'button' }));

    expect(mockPitchProject).toHaveBeenCalledWith('proj-1', 'buyer-1', 'upfront');
    await waitFor(() => {
      expect(screen.getByText('Pitch Successful! Project picked up.')).toBeInTheDocument();
    });

    // Verify close is called after timeout
    await waitFor(() => {
      expect(mockClosePitchProject).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('handles a failed pitch', async () => {
    mockPitchProject.mockReturnValue(Promise.resolve(false));
    render(<PitchProjectModal />);

    // Select buyer
    fireEvent.click(screen.getByText('Mock Streamer').closest('button')!);

    // Select deal
    fireEvent.click(screen.getByText('Deficit Financing').closest('button')!);

    // Click pitch
    fireEvent.click(screen.getByText('Pitch Project', { selector: 'button' }));

    expect(mockPitchProject).toHaveBeenCalledWith('proj-1', 'buyer-2', 'deficit');
    await waitFor(() => {
      expect(screen.getByText('Pitch Failed. They passed on the project.')).toBeInTheDocument();
    });
  });

  it('calls handleClose when dialog is closed', () => {
    render(<PitchProjectModal />);

    // Select a buyer to ensure state is reset on close
    fireEvent.click(screen.getByText('Mock Network').closest('button')!);

    // Find the close button (the one inside DialogContent from Radix)
    const closeButton = screen.getByText('Close').closest('button');
    fireEvent.click(closeButton!);

    expect(mockClosePitchProject).toHaveBeenCalled();
  });
});
