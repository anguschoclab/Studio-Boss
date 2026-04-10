import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WeekSummaryModal } from '@/components/modals/WeekSummaryModal';
// import { generateRebootProposal } from '../systems/ip/ipRebootEngine';
import { useUIStore } from '@/store/uiStore';
import { formatMoney } from '@/engine/utils';
import { WeekSummary } from '@/engine/types';

// Mock the store
vi.mock('@/store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

describe('WeekSummaryModal', () => {
  const mockCloseSummary = vi.fn();
  const mockUseUIStore = vi.mocked(useUIStore);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when weekSummary is null', () => {
    mockUseUIStore.mockReturnValue({
      activeModal: null,
      resolveCurrentModal: mockCloseSummary,
    } as unknown as ReturnType<typeof useUIStore>);

    const { container } = render(<WeekSummaryModal />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when showWeekSummary is false (Dialog handles open state, but if weekSummary is null it returns null anyway)', () => {
    mockUseUIStore.mockReturnValue({
      activeModal: { type: 'OTHER' } as any,
      resolveCurrentModal: mockCloseSummary,
    } as unknown as ReturnType<typeof useUIStore>);

    const { container } = render(<WeekSummaryModal />);
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly with positive net financial data', () => {
    mockUseUIStore.mockReturnValue({
      activeModal: {
        type: 'SUMMARY',
        payload: {
          id: 'mock-wsum-1',
          fromWeek: 1,
          toWeek: 2,
          cashBefore: 1000,
          cashAfter: 2000,
          totalRevenue: 1500,
          totalCosts: 500,
          projectUpdates: [],
          newHeadlines: [],
          events: [],
        } as WeekSummary
      },
      resolveCurrentModal: mockCloseSummary,
    } as unknown as ReturnType<typeof useUIStore>);

    render(<WeekSummaryModal />);

    // Title
    expect(screen.getByText('Week 2 Report')).toBeDefined();

    // Financials
    expect(screen.getByText('+'+formatMoney(1500))).toBeDefined();
    expect(screen.getByText('-'+formatMoney(500))).toBeDefined();

    // Net Delta
    const netDelta = 2000 - 1000;
    expect(screen.getByText('+'+formatMoney(netDelta))).toBeDefined();

    // Cash Before/After
    expect(screen.getByText((content, element) => element?.textContent === `Cash: ${formatMoney(1000)} → ${formatMoney(2000)}`)).toBeDefined();
  });

  it('renders correctly with negative net financial data', () => {
    mockUseUIStore.mockReturnValue({
      activeModal: {
        type: 'SUMMARY',
        payload: {
          id: 'mock-wsum-2',
          fromWeek: 1,
          toWeek: 2,
          cashBefore: 2000,
          cashAfter: 1000,
          totalRevenue: 500,
          totalCosts: 1500,
          projectUpdates: [],
          newHeadlines: [],
          events: [],
        } as WeekSummary
      },
      resolveCurrentModal: mockCloseSummary,
    } as unknown as ReturnType<typeof useUIStore>);

    render(<WeekSummaryModal />);

    const netDelta = 1000 - 2000;
    expect(screen.getByText(formatMoney(netDelta))).toBeDefined();
  });

  it('renders project updates, events, and headlines if they exist', () => {
    mockUseUIStore.mockReturnValue({
      activeModal: {
        type: 'SUMMARY',
        payload: {
          id: 'mock-wsum-3',
          fromWeek: 1,
          toWeek: 2,
          cashBefore: 1000,
          cashAfter: 1000,
          totalRevenue: 0,
          totalCosts: 0,
          projectUpdates: ['Project A advanced to Post-Production'],
          newHeadlines: [{ id: '1', text: 'Studio hit with major controversy' }],
          events: ['Market crashed'],
        } as WeekSummary
      },
      resolveCurrentModal: mockCloseSummary,
    } as unknown as ReturnType<typeof useUIStore>);

    render(<WeekSummaryModal />);

    // Project Updates
    expect(screen.getByText('🎬 Project Updates')).toBeDefined();
    expect(screen.getByText('• Project A advanced to Post-Production')).toBeDefined();

    // Events
    expect(screen.getByText('⚡ Events')).toBeDefined();
    expect(screen.getByText('Market crashed')).toBeDefined();

    // Headlines
    expect(screen.getByText('📰 The Trades')).toBeDefined();
    expect(screen.getByText('Studio hit with major controversy')).toBeDefined();
  });

  it('calls closeSummary when the Continue button is clicked', () => {
    mockUseUIStore.mockReturnValue({
      activeModal: {
        type: 'SUMMARY',
        payload: {
          id: 'mock-wsum-1',
          fromWeek: 1,
          toWeek: 1,
          cashBefore: 1000,
          cashAfter: 1200,
          totalRevenue: 200,
          totalCosts: 0,
          projectUpdates: [],
          newHeadlines: [],
          events: [],
        } as WeekSummary
      },
      resolveCurrentModal: mockCloseSummary,
    } as unknown as ReturnType<typeof useUIStore>);

    render(<WeekSummaryModal />);

    const button = screen.getByRole('button', { name: 'Continue →' });
    fireEvent.click(button);

    expect(mockCloseSummary).toHaveBeenCalledTimes(1);
  });
});
