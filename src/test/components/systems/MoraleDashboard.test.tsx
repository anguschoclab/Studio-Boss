import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MoraleDashboard } from '@/components/talent/MoraleDashboard';

describe('MoraleDashboard', () => {
  it('renders summary cards', () => {
    const moraleData = {
      byTalent: [],
      averageMorale: 75,
      atRiskCount: 0,
    };

    render(<MoraleDashboard moraleData={moraleData} />);
    
    expect(screen.getByText('Average Morale')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('At Risk')).toBeInTheDocument();
    expect(screen.getByText('Tracked Talent')).toBeInTheDocument();
  });

  it('displays at-risk talent section when there are at-risk members', () => {
    const moraleData = {
      byTalent: [
        {
          talentId: '1',
          talentName: 'John Actor',
          morale: 25,
          trend: 'down' as const,
          factors: ['Contract dispute', 'Overworked'],
          atRisk: true,
        },
      ],
      averageMorale: 60,
      atRiskCount: 1,
    };

    render(<MoraleDashboard moraleData={moraleData} />);
    
    expect(screen.getByText('At-Risk Talent')).toBeInTheDocument();
    expect(screen.getByText('John Actor')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('Contract dispute')).toBeInTheDocument();
  });

  it('renders talent morale overview section', () => {
    const moraleData = {
      byTalent: [
        {
          talentId: '1',
          talentName: 'Happy Actor',
          morale: 85,
          trend: 'stable' as const,
          factors: [],
          atRisk: false,
        },
      ],
      averageMorale: 85,
      atRiskCount: 0,
    };

    render(<MoraleDashboard moraleData={moraleData} />);
    
    expect(screen.getByText('Talent Morale Overview')).toBeInTheDocument();
    expect(screen.getByText('Happy Actor')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('shows correct trend indicators', () => {
    const moraleData = {
      byTalent: [
        {
          talentId: '1',
          talentName: 'Test Actor',
          morale: 50,
          trend: 'up' as const,
          factors: [],
          atRisk: true,
        },
      ],
      averageMorale: 50,
      atRiskCount: 1,
    };

    render(<MoraleDashboard moraleData={moraleData} />);
    
    expect(screen.getByText('↗ Improving')).toBeInTheDocument();
  });
});
