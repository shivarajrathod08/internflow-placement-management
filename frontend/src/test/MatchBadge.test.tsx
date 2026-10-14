import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatchBadge } from '../components/common/MatchBadge';

describe('MatchBadge Component', () => {
  it('renders high match score with green badge text', () => {
    render(<MatchBadge score={92} internshipId={1} showModalOnClick={false} />);

    expect(screen.getByText(/92% Match/)).toBeInTheDocument();
  });

  it('renders moderate match score correctly', () => {
    render(<MatchBadge score={68} internshipId={2} showModalOnClick={false} />);

    expect(screen.getByText(/68% Match/)).toBeInTheDocument();
  });

  it('renders nothing when score is undefined', () => {
    const { container } = render(<MatchBadge score={undefined} />);
    expect(container.firstChild).toBeNull();
  });
});
