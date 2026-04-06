import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModalManager } from '@/components/modals/ModalManager';
import { useUIStore } from '@/store/uiStore';

// Mock the UI store
vi.mock('@/store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

// Mock the modal components so we can just check if they are rendered
vi.mock('@/components/modals/WeekSummaryModal', () => ({
  WeekSummaryModal: () => <div data-testid="week-summary-modal">WeekSummaryModal</div>,
}));

vi.mock('@/components/modals/CrisisModal', () => ({
  CrisisModal: () => <div data-testid="crisis-modal">CrisisModal</div>,
}));

vi.mock('@/components/modals/AwardsCeremonyModal', () => ({
  AwardsCeremonyModal: () => <div data-testid="awards-ceremony-modal">AwardsCeremonyModal</div>,
}));

vi.mock('@/components/modals/FestivalMarketModal', () => ({
  FestivalMarketModal: () => <div data-testid="festival-market-modal">FestivalMarketModal</div>,
}));

describe('ModalManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when activeModal is null', () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      activeModal: null,
    });

    const { container } = render(<ModalManager />);
    expect(container.firstChild).toBeNull();
  });

  it('renders WeekSummaryModal when activeModal type is SUMMARY', async () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      activeModal: { id: 'test-1', type: 'SUMMARY', payload: null },
    });

    render(<ModalManager />);
    expect(await screen.findByTestId('week-summary-modal')).toBeInTheDocument();
  });

  it('renders CrisisModal when activeModal type is CRISIS', async () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      activeModal: { id: 'test-2', type: 'CRISIS', payload: null },
    });

    render(<ModalManager />);
    expect(await screen.findByTestId('crisis-modal')).toBeInTheDocument();
  });

  it('renders AwardsCeremonyModal when activeModal type is AWARDS', async () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      activeModal: { id: 'test-3', type: 'AWARDS', payload: null },
    });

    render(<ModalManager />);
    expect(await screen.findByTestId('awards-ceremony-modal')).toBeInTheDocument();
  });

  it('renders FestivalMarketModal when activeModal type is FESTIVAL_MARKET', async () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      activeModal: { id: 'test-4', type: 'FESTIVAL_MARKET', payload: null },
    });

    render(<ModalManager />);
    expect(await screen.findByTestId('festival-market-modal')).toBeInTheDocument();
  });

  it('renders nothing for an unknown modal type', () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      activeModal: { id: 'test-5', type: 'UNKNOWN_TYPE', payload: null },
    });

    const { container } = render(<ModalManager />);
    expect(container.firstChild).toBeNull();
  });
});
