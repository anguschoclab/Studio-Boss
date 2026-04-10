import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AwardsCeremonyModal } from '@/components/modals/AwardsCeremonyModal';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';

// Mock the stores
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

vi.mock('@/store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Lucide icons
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return {
    ...actual,
    Trophy: () => <div data-testid="trophy-icon" />,
    Star: () => <div data-testid="star-icon" />,
    Sparkles: () => <div data-testid="sparkles-icon" />,
    ChevronRight: () => <div data-testid="chevron-right-icon" />,
  };
});

describe('AwardsCeremonyModal', () => {
  const mockResolveCurrentModal = vi.fn();

  const mockGameState = {
    entities: {
      projects: {
        'proj-1': { title: 'The Great Movie' },
        'proj-2': { title: 'Another Great Movie' },
      }
    }
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();

    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => {
      const state = {
        gameState: mockGameState,
      };
      return selector ? selector(state) : state;
    });

    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      activeModal: {
        type: 'AWARDS',
        payload: {
          awards: [
            { category: 'Best Picture', projectId: 'proj-1', id: 'award-1' },
            { category: 'Best Director', projectId: 'proj-2', id: 'award-2' },
          ],
          body: 'Annual Industry Awards',
          year: 2026,
        }
      },
      resolveCurrentModal: mockResolveCurrentModal,
    });
  });

  it('renders nothing if gameState is missing', () => {
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => null);

    const { container } = render(<AwardsCeremonyModal />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing if activeModal is not AWARDS', () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      activeModal: { type: 'CRISIS', payload: {} },
      resolveCurrentModal: mockResolveCurrentModal,
    });

    const { container } = render(<AwardsCeremonyModal />);
    expect(container.firstChild).toBeNull();
  });

  it('calls resolveCurrentModal immediately if awards array is empty', () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      activeModal: {
        type: 'AWARDS',
        payload: { awards: [] }
      },
      resolveCurrentModal: mockResolveCurrentModal,
    });

    const { container } = render(<AwardsCeremonyModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });

  it('renders initial nominees phase with all awards', () => {
    render(<AwardsCeremonyModal />);

    expect(screen.getByText('Annual Industry Awards')).toBeInTheDocument();
    expect(screen.getByText(/Class of 2026/)).toBeInTheDocument();

    expect(screen.getByText('Best Picture')).toBeInTheDocument();
    expect(screen.getByText('The Great Movie')).toBeInTheDocument();

    expect(screen.getByText('Best Director')).toBeInTheDocument();
    expect(screen.getByText('Another Great Movie')).toBeInTheDocument();

    expect(screen.getByText('Enter the Ballroom')).toBeInTheDocument();
  });

  it('handles phase transitions and multiple awards', () => {
    render(<AwardsCeremonyModal />);

    // Click to enter ballroom
    fireEvent.click(screen.getByText('Enter the Ballroom'));

    // Reveal phase for first award
    expect(screen.getByText('The Category is')).toBeInTheDocument();
    expect(screen.getByText('Best Picture')).toBeInTheDocument();
    expect(screen.getByText('The Great Movie')).toBeInTheDocument();

    const nextBtn = screen.getByText('Next Category');
    expect(nextBtn).toBeInTheDocument();

    // Go to next award
    fireEvent.click(nextBtn);

    // Reveal phase for second award
    expect(screen.getByText('The Category is')).toBeInTheDocument();
    expect(screen.getByText('Best Director')).toBeInTheDocument();
    expect(screen.getByText('Another Great Movie')).toBeInTheDocument();

    // Last award should show Discard the Envelope
    const discardBtn = screen.getByText('Discard the Envelope');
    expect(discardBtn).toBeInTheDocument();

    // Complete ceremony
    fireEvent.click(discardBtn);

    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });

  it('falls back gracefully if project title is missing', () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      activeModal: {
        type: 'AWARDS',
        payload: {
          awards: [
            { category: 'Best Editing', projectId: 'non-existent', id: 'award-3' },
          ]
        }
      },
      resolveCurrentModal: mockResolveCurrentModal,
    });

    render(<AwardsCeremonyModal />);

    expect(screen.getByText('Best Editing')).toBeInTheDocument();
    expect(screen.getByText('Unknown Project')).toBeInTheDocument();
  });
});
