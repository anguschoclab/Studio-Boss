import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PackageDetailModal } from '@/components/modals/PackageDetailModal';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

// Mock the Dialog components to render content directly in tests
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
}));

// Mock the stores
vi.mock('@/store/gameStore');
vi.mock('@/store/uiStore');

describe('PackageDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render null when no package data exists', () => {
    const mockResolveCurrentModal = vi.fn();
    (useUIStore as any).mockReturnValue({
      resolveCurrentModal: mockResolveCurrentModal,
      activeModal: null,
    });

    (useGameStore as any).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          market: {
            opportunities: [],
          },
          entities: {
            talents: {},
          },
        },
      };
      return selector ? selector(state) : state;
    });

    const { container } = render(<PackageDetailModal />);
    expect(container.firstChild).toBeNull();
  });

  it('should render modal with package details', () => {
    const mockResolveCurrentModal = vi.fn();
    (useUIStore as any).mockReturnValue({
      resolveCurrentModal: mockResolveCurrentModal,
      activeModal: { payload: { packageId: 'pkg-1' } },
    });

    const mockPackage = {
      id: 'pkg-1',
      title: 'Test Talent Package',
      type: 'package',
      origin: 'agency_package',
      costToAcquire: 2500000,
      qualityBonus: 10,
      weeksUntilExpiry: 12,
      flavor: 'A great package for your studio',
      attachedTalentIds: ['talent-1', 'talent-2'],
      bids: {},
      bidHistory: [],
    };

    const mockTalents = {
      'talent-1': {
        id: 'talent-1',
        name: 'Actor One',
        tier: 1,
      },
      'talent-2': {
        id: 'talent-2',
        name: 'Actor Two',
        tier: 2,
      },
    };

    (useGameStore as any).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          market: {
            opportunities: [mockPackage],
          },
          entities: {
            talents: mockTalents,
          },
        },
      };
      return selector ? selector(state) : state;
    });

    render(<PackageDetailModal packageId="pkg-1" />);

    expect(screen.getByText('Test Talent Package')).toBeInTheDocument();
    expect(screen.getByText('Talent package details and bidding information')).toBeInTheDocument();
    expect(screen.getAllByText(/\$2\.5M/)[0]).toBeInTheDocument();
    expect(screen.getByText('+10')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('A great package for your studio')).toBeInTheDocument();
  });

  it('should display attached talent', () => {
    const mockResolveCurrentModal = vi.fn();
    (useUIStore as any).mockReturnValue({
      resolveCurrentModal: mockResolveCurrentModal,
      activeModal: { payload: { packageId: 'pkg-1' } },
    });

    const mockPackage = {
      id: 'pkg-1',
      title: 'Test Package',
      type: 'package',
      origin: 'agency_package',
      costToAcquire: 1000000,
      qualityBonus: 5,
      weeksUntilExpiry: 8,
      flavor: 'Test description',
      attachedTalentIds: ['talent-1'],
      bids: {},
      bidHistory: [],
    };

    const mockTalents = {
      'talent-1': {
        id: 'talent-1',
        name: 'Test Actor',
        tier: 1,
      },
    };

    (useGameStore as any).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          market: {
            opportunities: [mockPackage],
          },
          entities: {
            talents: mockTalents,
          },
        },
      };
      return selector ? selector(state) : state;
    });

    render(<PackageDetailModal packageId="pkg-1" />);

    expect(screen.getByText('Test Actor')).toBeInTheDocument();
    expect(screen.getByText(/Tier 1/)).toBeInTheDocument();
  });

  it('should display bid history when available', () => {
    const mockResolveCurrentModal = vi.fn();
    (useUIStore as any).mockReturnValue({
      resolveCurrentModal: mockResolveCurrentModal,
      activeModal: { payload: { packageId: 'pkg-1' } },
    });

    const mockPackage = {
      id: 'pkg-1',
      title: 'Test Package',
      type: 'package',
      origin: 'agency_package',
      costToAcquire: 1000000,
      qualityBonus: 5,
      weeksUntilExpiry: 8,
      flavor: 'Test description',
      attachedTalentIds: [],
      bids: {},
      bidHistory: [
        { rivalId: 'PLAYER', amount: 1500000, week: 10 },
        { rivalId: 'rival-1', amount: 1200000, week: 10 },
      ],
    };

    (useGameStore as any).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          market: {
            opportunities: [mockPackage],
          },
          entities: {
            talents: {},
          },
        },
      };
      return selector ? selector(state) : state;
    });

    render(<PackageDetailModal packageId="pkg-1" />);

    expect(screen.getByText('Bid History')).toBeInTheDocument();
    expect(screen.getByText('Your Studio (Week 10)')).toBeInTheDocument();
    expect(screen.getByText('rival-1 (Week 10)')).toBeInTheDocument();
  });

  it('should close modal when cancel button clicked', () => {
    const mockResolveCurrentModal = vi.fn();
    (useUIStore as any).mockReturnValue({
      resolveCurrentModal: mockResolveCurrentModal,
      activeModal: { payload: { packageId: 'pkg-1' } },
    });

    const mockPackage = {
      id: 'pkg-1',
      title: 'Test Package',
      type: 'package',
      origin: 'agency_package',
      costToAcquire: 1000000,
      qualityBonus: 5,
      weeksUntilExpiry: 8,
      flavor: 'Test description',
      attachedTalentIds: [],
      bids: {},
      bidHistory: [],
    };

    (useGameStore as any).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          market: {
            opportunities: [mockPackage],
          },
          entities: {
            talents: {},
          },
        },
      };
      return selector ? selector(state) : state;
    });

    render(<PackageDetailModal packageId="pkg-1" />);

    const cancelButton = screen.getByText('Close');
    fireEvent.click(cancelButton);

    expect(mockResolveCurrentModal).toHaveBeenCalled();
  });

  it('should disable bid button when bid amount is 0', () => {
    const mockResolveCurrentModal = vi.fn();
    (useUIStore as any).mockReturnValue({
      resolveCurrentModal: mockResolveCurrentModal,
      activeModal: { payload: { packageId: 'pkg-1' } },
    });

    const mockPackage = {
      id: 'pkg-1',
      title: 'Test Package',
      type: 'package',
      origin: 'agency_package',
      costToAcquire: 1000000,
      qualityBonus: 5,
      weeksUntilExpiry: 8,
      flavor: 'Test description',
      attachedTalentIds: [],
      bids: {},
      bidHistory: [],
    };

    (useGameStore as any).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          market: {
            opportunities: [mockPackage],
          },
          entities: {
            talents: {},
          },
        },
      };
      return selector ? selector(state) : state;
    });

    render(<PackageDetailModal packageId="pkg-1" />);

    const bidButton = screen.getByText('Place Bid ($0)');
    expect(bidButton).toBeDisabled();
  });

  it('should enable bid button when bid amount is set', () => {
    const mockResolveCurrentModal = vi.fn();
    (useUIStore as any).mockReturnValue({
      resolveCurrentModal: mockResolveCurrentModal,
      activeModal: { payload: { packageId: 'pkg-1' } },
    });

    const mockPackage = {
      id: 'pkg-1',
      title: 'Test Package',
      type: 'package',
      origin: 'agency_package',
      costToAcquire: 1000000,
      qualityBonus: 5,
      weeksUntilExpiry: 8,
      flavor: 'Test description',
      attachedTalentIds: [],
      bids: {},
      bidHistory: [],
    };

    (useGameStore as any).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          market: {
            opportunities: [mockPackage],
          },
          entities: {
            talents: {},
          },
        },
      };
      return selector ? selector(state) : state;
    });

    render(<PackageDetailModal packageId="pkg-1" />);

    const bidInput = screen.getByPlaceholderText('Enter bid amount');
    fireEvent.change(bidInput, { target: { value: '1500000' } });

    const bidButton = screen.getByText('Place Bid ($1.5M)');
    expect(bidButton).not.toBeDisabled();
  });

  it('should set bid amount to min +10% when button clicked', () => {
    const mockResolveCurrentModal = vi.fn();
    (useUIStore as any).mockReturnValue({
      resolveCurrentModal: mockResolveCurrentModal,
      activeModal: { payload: { packageId: 'pkg-1' } },
    });

    const mockPackage = {
      id: 'pkg-1',
      title: 'Test Package',
      type: 'package',
      origin: 'agency_package',
      costToAcquire: 1000000,
      qualityBonus: 5,
      weeksUntilExpiry: 8,
      flavor: 'Test description',
      attachedTalentIds: [],
      bids: {},
      bidHistory: [],
    };

    (useGameStore as any).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          market: {
            opportunities: [mockPackage],
          },
          entities: {
            talents: {},
          },
        },
      };
      return selector ? selector(state) : state;
    });

    render(<PackageDetailModal packageId="pkg-1" />);

    const minPlusButton = screen.getByText('Min +10%');
    fireEvent.click(minPlusButton);

    const bidInput = screen.getByPlaceholderText('Enter bid amount') as HTMLInputElement;
    expect(bidInput.value).toBe('1100000');
  });
});
