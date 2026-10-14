import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '../components/StatCard';
import { Users } from 'lucide-react';

describe('StatCard Component', () => {
  it('renders title and numeric value correctly', () => {
    render(
      <StatCard
        title="Active Students"
        value={128}
        icon={Users}
        subtitle="Enrolled in placement drives"
        color="indigo"
      />
    );

    expect(screen.getByText('Active Students')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText('Enrolled in placement drives')).toBeInTheDocument();
  });

  it('renders trend badge when provided', () => {
    render(
      <StatCard
        title="Shortlist Rate"
        value="84%"
        trend="+12% from last season"
        trendPositive={true}
        color="emerald"
      />
    );

    expect(screen.getByText('Shortlist Rate')).toBeInTheDocument();
    expect(screen.getByText('84%')).toBeInTheDocument();
    expect(screen.getByText('+12% from last season')).toBeInTheDocument();
  });
});
