import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';

// Mock the Zustand stores
vi.mock('@/store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

// Mock the titles generator to ensure deterministic titles in test
vi.mock('@/engine/generators/titles', () => ({
  generateProjectTitle: vi.fn(() => 'Generated Test Title'),
}));

// We need a basic ResizeObserver mock for some Radix UI components (used by Dialog, Select, etc)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Also mock PointerEvent as some Radix components use it
if (typeof window !== 'undefined') {
  window.PointerEvent = class PointerEvent extends Event {
    button: number;
    ctrlKey: boolean;
    constructor(type: string, props: PointerEventInit = {}) {
      super(type, props);
      this.button = props.button ?? 0;
      this.ctrlKey = props.ctrlKey ?? false;
    }
  } as unknown as typeof Event;
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
}

describe('CreateProjectModal', () => {
  const mockCloseCreateProject = vi.fn();
  const mockCreateProject = vi.fn();
  const mockGameState = {
    industry: {
      talentPool: [
        { id: 't1', name: 'John Actor', roles: ['lead'], fee: 1000000 },
        { id: 't2', name: 'Jane Director', roles: ['director'], fee: 2000000 },
      ]
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => selector ? selector({
      showCreateProject: true,
      closeCreateProject: mockCloseCreateProject,
    }) : { showCreateProject: true, closeCreateProject: mockCloseCreateProject });

    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => selector ? selector({
      createProject: mockCreateProject,
      gameState: mockGameState,
    }) : { createProject: mockCreateProject, gameState: mockGameState });
  });

  it('does not render when showCreateProject is false', () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => selector ? selector({
      showCreateProject: false,
      closeCreateProject: mockCloseCreateProject,
    }) : { showCreateProject: false, closeCreateProject: mockCloseCreateProject });

    render(<CreateProjectModal />);
    expect(screen.queryByText('Greenlight New Project')).not.toBeInTheDocument();
  });

  it('renders correctly when showCreateProject is true', () => {
    render(<CreateProjectModal />);
    expect(screen.getByText('Greenlight New Project')).toBeInTheDocument();
    expect(screen.getByText('Format')).toBeInTheDocument();
  });

  it('generates a title when opening with an empty title', () => {
    render(<CreateProjectModal />);
    // Initial render should have triggered the useEffect to generate a title
    const titleInput = screen.getByDisplayValue('Generated Test Title');
    expect(titleInput).toBeInTheDocument();
  });

  it('allows clicking Generate Random Title button', () => {
    render(<CreateProjectModal />);

    // Clear the input first
    const input = screen.getByDisplayValue('Generated Test Title');
    fireEvent.change(input, { target: { value: '' } });

    // Find the button by title
    const generateBtn = screen.getByTitle('Generate Random Title');
    fireEvent.click(generateBtn);

    // It should have generated the title again
    expect(screen.getByDisplayValue('Generated Test Title')).toBeInTheDocument();
  });

  it('conditionally renders TV fields when TV format is selected', () => {
    render(<CreateProjectModal />);

    // Should not show TV fields initially
    expect(screen.queryByText('TV Format')).not.toBeInTheDocument();

    // Click TV Series
    const tvBtn = screen.getByText('TV Series');
    fireEvent.click(tvBtn);

    // Should now show TV fields
    expect(screen.getByText('TV Format')).toBeInTheDocument();
    expect(screen.getByText("Episodes")).toBeInTheDocument();
    expect(screen.getByText('Release Model')).toBeInTheDocument();
  });

  it('conditionally renders Unscripted fields when Unscripted format is selected', () => {
    render(<CreateProjectModal />);

    expect(screen.queryByText('Unscripted Format')).not.toBeInTheDocument();

    // Click Unscripted
    const unscriptedBtn = screen.getByText('Unscripted');
    fireEvent.click(unscriptedBtn);

    expect(screen.getByText('Unscripted Format')).toBeInTheDocument();
    expect(screen.getByText("Episodes")).toBeInTheDocument();
    expect(screen.getByText('Release Model')).toBeInTheDocument();
  });

  it('disables Greenlight button if title is empty', () => {
    render(<CreateProjectModal />);

    const input = screen.getByDisplayValue('Generated Test Title');
    fireEvent.change(input, { target: { value: '' } });

    const greenlightBtn = screen.getByText('Greenlight Project');
    expect(greenlightBtn).toBeDisabled();
  });

  it('submits the form correctly for a film', () => {
    render(<CreateProjectModal />);

    // Type a specific title
    const input = screen.getByDisplayValue('Generated Test Title');
    fireEvent.change(input, { target: { value: 'My Awesome Movie' } });

    const greenlightBtn = screen.getByText('Greenlight Project');
    fireEvent.click(greenlightBtn);

    expect(mockCreateProject).toHaveBeenCalledWith(expect.objectContaining({
      title: 'My Awesome Movie',
      format: 'film',
    }));
    expect(mockCloseCreateProject).toHaveBeenCalled();
  });

  it('allows selecting talent', () => {
    render(<CreateProjectModal />);

    const talentCheckbox = document.getElementById('t1');
    if (talentCheckbox) fireEvent.click(talentCheckbox);

    // Type a title to enable submit
    const input = screen.getByDisplayValue('Generated Test Title');
    fireEvent.change(input, { target: { value: 'Talent Movie' } });

    const greenlightBtn = screen.getByText('Greenlight Project');
    fireEvent.click(greenlightBtn);

    expect(mockCreateProject).toHaveBeenCalledWith(expect.objectContaining({
      attachedTalentIds: ['t1'],
    }));
  });
});

