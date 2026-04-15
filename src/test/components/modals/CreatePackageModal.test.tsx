import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreatePackageModal } from '@/components/modals/CreatePackageModal';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';

// Mock the stores
vi.mock('@/store/gameStore');
vi.mock('@/store/uiStore');

describe('CreatePackageModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the modal with agency selection', () => {
    const mockResolveCurrentModal = vi.fn();
    (useUIStore as any).mockReturnValue({
      resolveCurrentModal: mockResolveCurrentModal,
    });

    const mockAgencies = [
      { id: 'agency-1', name: 'CAA', leverage: 80, archetype: 'major' },
      { id: 'agency-2', name: 'WME', leverage: 75, archetype: 'major' },
    ];

    const mockTalents = {
      'talent-1': {
        id: 'talent-1',
        name: 'Actor One',
        roles: ['actor'],
        tier: 1,
        contractId: 'contract-1',
      },
      'talent-2': {
        id: 'talent-2',
        name: 'Actor Two',
        roles: ['actor'],
        tier: 2,
        contractId: 'contract-2',
      },
    };

    render(<CreatePackageModal agencies={mockAgencies as any} talents={mockTalents as any} />);

    expect(screen.getByText('Create Talent Package')).toBeInTheDocument();
    expect(screen.getByText('Assemble a talent package to offer to agencies')).toBeInTheDocument();
    expect(screen.getByText('Select Agency')).toBeInTheDocument();
  });

  it('should disable create button when no agency or talent selected', () => {
    const mockResolveCurrentModal = vi.fn();
    (useUIStore as any).mockReturnValue({
      resolveCurrentModal: mockResolveCurrentModal,
    });

    render(<CreatePackageModal agencies={[]} talents={{}} />);

    const createButton = screen.getByText('Create Package');
    expect(createButton).toBeDisabled();
  });

  it('should enable create button when agency and talent selected', () => {
    const mockResolveCurrentModal = vi.fn();
    (useUIStore as any).mockReturnValue({
      resolveCurrentModal: mockResolveCurrentModal,
    });

    const mockAgencies = [{ id: 'agency-1', name: 'CAA', leverage: 80, archetype: 'major' }];
    const mockTalents = {
      'talent-1': {
        id: 'talent-1',
        name: 'Actor One',
        roles: ['actor'],
        tier: 1,
        contractId: 'contract-1',
      },
    };

    render(<CreatePackageModal agencies={mockAgencies as any} talents={mockTalents as any} />);

    // Select agency
    fireEvent.click(screen.getByPlaceholderText('Choose an agency'));
    fireEvent.click(screen.getByText('CAA (Leverage: 80%)'));

    // Select talent
    const talentCheckbox = screen.getByRole('checkbox');
    fireEvent.click(talentCheckbox);

    const createButton = screen.getByText('Create Package');
    expect(createButton).not.toBeDisabled();
  });

  it('should close modal when cancel button clicked', () => {
    const mockResolveCurrentModal = vi.fn();
    (useUIStore as any).mockReturnValue({
      resolveCurrentModal: mockResolveCurrentModal,
    });

    render(<CreatePackageModal agencies={[]} talents={{}} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockResolveCurrentModal).toHaveBeenCalled();
  });

  it('should close modal when create button clicked', () => {
    const mockResolveCurrentModal = vi.fn();
    (useUIStore as any).mockReturnValue({
      resolveCurrentModal: mockResolveCurrentModal,
    });

    const mockAgencies = [{ id: 'agency-1', name: 'CAA', leverage: 80, archetype: 'major' }];
    const mockTalents = {
      'talent-1': {
        id: 'talent-1',
        name: 'Actor One',
        roles: ['actor'],
        tier: 1,
        contractId: 'contract-1',
      },
    };

    render(<CreatePackageModal agencies={mockAgencies as any} talents={mockTalents as any} />);

    // Select agency
    fireEvent.click(screen.getByPlaceholderText('Choose an agency'));
    fireEvent.click(screen.getByText('CAA (Leverage: 80%)'));

    // Select talent
    const talentCheckbox = screen.getByRole('checkbox');
    fireEvent.click(talentCheckbox);

    const createButton = screen.getByText('Create Package');
    fireEvent.click(createButton);

    expect(mockResolveCurrentModal).toHaveBeenCalled();
  });

  it('should limit talent selection to 5', () => {
    const mockResolveCurrentModal = vi.fn();
    (useUIStore as any).mockReturnValue({
      resolveCurrentModal: mockResolveCurrentModal,
    });

    const mockAgencies = [{ id: 'agency-1', name: 'CAA', leverage: 80, archetype: 'major' }];
    const mockTalents = {
      'talent-1': { id: 'talent-1', name: 'Actor One', roles: ['actor'], tier: 1, contractId: 'contract-1' },
      'talent-2': { id: 'talent-2', name: 'Actor Two', roles: ['actor'], tier: 1, contractId: 'contract-2' },
      'talent-3': { id: 'talent-3', name: 'Actor Three', roles: ['actor'], tier: 1, contractId: 'contract-3' },
      'talent-4': { id: 'talent-4', name: 'Actor Four', roles: ['actor'], tier: 1, contractId: 'contract-4' },
      'talent-5': { id: 'talent-5', name: 'Actor Five', roles: ['actor'], tier: 1, contractId: 'contract-5' },
      'talent-6': { id: 'talent-6', name: 'Actor Six', roles: ['actor'], tier: 1, contractId: 'contract-6' },
    };

    render(<CreatePackageModal agencies={mockAgencies as any} talents={mockTalents as any} />);

    // Select agency
    fireEvent.click(screen.getByPlaceholderText('Choose an agency'));
    fireEvent.click(screen.getByText('CAA (Leverage: 80%)'));

    // Select 6 talents
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => fireEvent.click(checkbox));

    // Should only allow 5 to be selected
    expect(screen.getByText(/Selected: 5\/5/)).toBeInTheDocument();
  });
});
