import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { AuthProvider } from '../context/AuthContext';

describe('Sidebar Component - Campus Ledger Theme', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders student navigation with Campus Ledger warm beige and ivory styles', () => {
    localStorage.setItem(
      'internflow_user',
      JSON.stringify({
        id: 1,
        email: 'student@internflow.edu',
        role: 'STUDENT',
        name: 'Alex Student',
      })
    );
    localStorage.setItem('internflow_token', 'mock_token');

    render(
      <MemoryRouter initialEntries={['/student/dashboard']}>
        <AuthProvider>
          <Sidebar mobileOpen={false} onCloseMobile={vi.fn()} />
        </AuthProvider>
      </MemoryRouter>
    );

    // Verify role portal header
    expect(screen.getByText('STUDENT PORTAL')).toBeInTheDocument();

    // Verify student navigation links
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Explore Internships')).toBeInTheDocument();
    expect(screen.getByText('My Applications')).toBeInTheDocument();
    expect(screen.getByText('Offers & Joining')).toBeInTheDocument();
    expect(screen.getByText('Documents & KYC')).toBeInTheDocument();
    expect(screen.getByText('Profile & Skills')).toBeInTheDocument();

    // Verify Smart Match Engine panel styling
    expect(screen.getByText('Smart Match Engine')).toBeInTheDocument();
    expect(
      screen.getByText('Deterministic 5-factor scoring connects students to fitting opportunities.')
    ).toBeInTheDocument();

    // Verify aside element has Campus Ledger background and border classes
    const aside = screen.getByRole('complementary');
    expect(aside.className).toContain('bg-[#F0EADF]');
    expect(aside.className).toContain('border-[#E5DED2]');

    // Verify active link has warm cream background, deep navy text, and left indicator border
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).not.toBeNull();
    expect(dashboardLink?.className).toContain('bg-[#FFFCF7]');
    expect(dashboardLink?.className).toContain('text-[#192844]');
    expect(dashboardLink?.className).toContain('border-l-[#192844]');

    // Verify inactive link has muted text color #64748B
    const exploreLink = screen.getByText('Explore Internships').closest('a');
    expect(exploreLink).not.toBeNull();
    expect(exploreLink?.className).toContain('text-[#64748B]');
  });

  it('renders company navigation when user has COMPANY role', () => {
    localStorage.setItem(
      'internflow_user',
      JSON.stringify({
        id: 2,
        email: 'recruiter@techcorp.com',
        role: 'COMPANY',
        name: 'TechCorp Recruiter',
      })
    );
    localStorage.setItem('internflow_token', 'mock_token');

    render(
      <MemoryRouter initialEntries={['/company/dashboard']}>
        <AuthProvider>
          <Sidebar mobileOpen={false} onCloseMobile={vi.fn()} />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('COMPANY PORTAL')).toBeInTheDocument();
    expect(screen.getByText('Post Internship')).toBeInTheDocument();
    expect(screen.getByText('Applicant Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Extended Offers')).toBeInTheDocument();
    expect(screen.getByText('Company Profile')).toBeInTheDocument();
  });

  it('handles mobile drawer open and close click properly', () => {
    localStorage.setItem(
      'internflow_user',
      JSON.stringify({
        id: 3,
        email: 'admin@internflow.edu',
        role: 'ADMIN',
        name: 'Placement Admin',
      })
    );
    localStorage.setItem('internflow_token', 'mock_token');

    const handleCloseMobile = vi.fn();

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AuthProvider>
          <Sidebar mobileOpen={true} onCloseMobile={handleCloseMobile} />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('ADMIN PORTAL')).toBeInTheDocument();

    // Verify close button invokes onCloseMobile
    const closeBtn = screen.getByLabelText('Close menu');
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(handleCloseMobile).toHaveBeenCalledTimes(1);
  });
});
