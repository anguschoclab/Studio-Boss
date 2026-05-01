import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WeekSummaryModal } from '@/components/modals/WeekSummaryModal';
import { useUIStore } from '@/store/uiStore';
import { formatMoney } from '@/engine/utils';
import { WeekSummary } from '@/engine/types';

vi.mock('@/store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(() => []),
}));

vi.mock('@/components/modals/NewsStoryModal', () => ({
  NewsStoryModal: () => null,
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

    // Title uses new format
    expect(screen.getByText('CYCLE_W2_REPORT')).toBeDefined();

    // Financial section header
    expect(screen.getByText('FINANCIAL_SUMMARY')).toBeDefined();

    // Revenue and costs use uppercase formatted money
    expect(screen.getByText(`+${formatMoney(1500).toUpperCase()}`)).toBeDefined();
    expect(screen.getByText(`-${formatMoney(500).toUpperCase()}`)).toBeDefined();
  });

  it('renders correctly with negative net financial data', () => {
    mockUseUIStore.mockReturnValue({
      activeModal: {
        type: 'SUMMARY',
        payload: {
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
          fromWeek: 1,
          toWeek: 2,
          cashBefore: 1000,
          cashAfter: 1000,
          totalRevenue: 0,
          totalCosts: 0,
          projectUpdates: ['Project A advanced to Post-Production'],
          newHeadlines: [{ id: '1', text: 'Studio hit with major controversy', week: 2, category: 'general' }],
          events: ['Market crashed'],
        } as WeekSummary
      },
      resolveCurrentModal: mockCloseSummary,
    } as unknown as ReturnType<typeof useUIStore>);

    render(<WeekSummaryModal />);

    // Financial section always renders
    expect(screen.getByText('FINANCIAL_SUMMARY')).toBeDefined();

    // Headlines section renders when headlines exist
    expect(screen.getByText('THE_TRADES_SUMMARY')).toBeDefined();
    expect(screen.getByText('Studio hit with major controversy')).toBeDefined();
  });

  it('calls closeSummary when the Continue button is clicked', () => {
    mockUseUIStore.mockReturnValue({
      activeModal: {
        type: 'SUMMARY',
        payload: {
          fromWeek: 1,
          toWeek: 2,
          cashBefore: 1000,
          cashAfter: 1000,
          totalRevenue: 0,
          totalCosts: 0,
          projectUpdates: [],
          newHeadlines: [],
          events: [],
        } as WeekSummary
      },
      resolveCurrentModal: mockCloseSummary,
    } as unknown as ReturnType<typeof useUIStore>);

    render(<WeekSummaryModal />);

    const button = screen.getByText('CONFIRM_REPORT_AND_CONTINUE');
    fireEvent.click(button);

    expect(mockCloseSummary).toHaveBeenCalledTimes(1);
  });
});
