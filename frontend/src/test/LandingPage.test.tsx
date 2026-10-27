import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from '../pages/public/LandingPage';
import { PublicLayout } from '../layouts/PublicLayout';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';

describe('LandingPage Campus Ledger Polish Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders hero section with serif headline and two-column layout for unauthenticated visitors', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LandingPage />
        </AuthProvider>
      </MemoryRouter>
    );

    // Eyebrow and Headline
    expect(
      screen.getByText(/A Placement Platform for Indian Campuses/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Every internship, from first match to final certificate\./i)
    ).toBeInTheDocument();

    // Supporting copy
    expect(
      screen.getByText(
        /InternFlow brings students, recruiters, and placement cells together in one clear workflow/i
      )
    ).toBeInTheDocument();

    // Calls to Action for unauthenticated user in Hero
    expect(screen.getByRole('link', { name: /^I'm a student/i })).toHaveAttribute(
      'href',
      '/register/student'
    );
    expect(screen.getByRole('link', { name: /^I'm hiring/i })).toHaveAttribute(
      'href',
      '/register/company'
    );
    expect(screen.getByRole('link', { name: /^Sign In$/i })).toHaveAttribute(
      'href',
      '/login'
    );

    // Campus photograph
    const campusImg = screen.getByAltText(/University students walking together on campus/i);
    expect(campusImg).toBeInTheDocument();
    expect(campusImg).toHaveAttribute('src', '/images/campus-students.jpg');

    // Trust statement
    expect(
      screen.getByText(/Used by 40\+ partner institutions in the 2026–27 academic cycle\./i)
    ).toBeInTheDocument();
  });

  it('renders state-aware dashboard actions when a student is authenticated', () => {
    localStorage.setItem(
      'internflow_user',
      JSON.stringify({
        id: 5,
        email: 'alex@internflow.edu',
        role: 'STUDENT',
        name: 'Alex Rivera',
      })
    );
    localStorage.setItem('internflow_token', 'mock_student_token');

    render(
      <MemoryRouter>
        <AuthProvider>
          <LandingPage />
        </AuthProvider>
      </MemoryRouter>
    );

    // Authenticated Hero CTA
    const dashboardLink = screen.getByRole('link', { name: /Open My Dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/student/dashboard');

    const profileLink = screen.getByRole('link', { name: /View Profile/i });
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute('href', '/student/profile');

    // Should not show student/employer registration CTA in hero
    expect(screen.queryByRole('link', { name: /^I'm a student/i })).not.toBeInTheDocument();
  });

  it('renders all three stakeholder cards with appropriate targets and clean copy', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthProvider>
          <LandingPage />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('For Students')).toBeInTheDocument();
    expect(screen.getByText('For Employers')).toBeInTheDocument();
    expect(screen.getByText('For Placement Cells')).toBeInTheDocument();

    const studentCard = container.querySelector('#students') as HTMLElement;
    expect(studentCard).not.toBeNull();
    expect(within(studentCard).getByRole('link', { name: /Register as Student/i })).toHaveAttribute(
      'href',
      '/register/student'
    );

    const employerCard = container.querySelector('#employers') as HTMLElement;
    expect(employerCard).not.toBeNull();
    expect(within(employerCard).getByRole('link', { name: /Register as Employer/i })).toHaveAttribute(
      'href',
      '/register/company'
    );

    const placementCard = container.querySelector('#placement-cells') as HTMLElement;
    expect(placementCard).not.toBeNull();
    expect(within(placementCard).getByRole('link', { name: /Sign In to Placement Portal/i })).toHaveAttribute(
      'href',
      '/login'
    );
  });

  it('renders the 4-step recruitment workflow section', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LandingPage />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/The Placement Lifecycle/i)).toBeInTheDocument();
    expect(screen.getByText('Discover Opportunities')).toBeInTheDocument();
    expect(screen.getByText('Check Eligibility')).toBeInTheDocument();
    expect(screen.getByText('Apply & Track Progress')).toBeInTheDocument();
    expect(screen.getByText('Interviews & Offers')).toBeInTheDocument();
  });

  it('renders architectural guarantees and warm bottom CTA without exposing demo credentials', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LandingPage />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Strict State Machine')).toBeInTheDocument();
    expect(screen.getByText('Deterministic Match Engine')).toBeInTheDocument();
    expect(screen.getByText('Verified Document Storage')).toBeInTheDocument();
    expect(screen.getByText('Live Relational Analytics')).toBeInTheDocument();

    expect(
      screen.getByText(/Ready to modernize your campus placement cycle\?/i)
    ).toBeInTheDocument();

    // Must not advertise demo credentials or passwords on public homepage
    expect(screen.queryByText(/demo credentials/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/password/i)).not.toBeInTheDocument();
  });

  it('renders PublicLayout with warm ivory theme and navigation', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <NotificationProvider>
            <PublicLayout />
          </NotificationProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Navbar & Footer branding
    const internNodes = screen.getAllByText('Intern');
    expect(internNodes.length).toBeGreaterThanOrEqual(2);

    const flowNodes = screen.getAllByText('Flow');
    expect(flowNodes.length).toBeGreaterThanOrEqual(2);

    // Footer
    expect(
      screen.getByText(/A calm, audit-grade internship and campus placement operating system/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Built with Spring Boot 3\.3, relational PostgreSQL persistence/i)
    ).toBeInTheDocument();
  });

  it('smoothly scrolls to Placement Cells section when Placement Cells nav link is clicked', () => {
    const scrollIntoViewMock = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
              </Route>
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    const nav = container.querySelector('header nav') as HTMLElement;
    expect(nav).not.toBeNull();

    const placementLink = within(nav).getByRole('link', { name: /^Placement Cells$/i });
    expect(placementLink).toBeInTheDocument();
    expect(placementLink).toHaveAttribute('href', '/#placement-cells');

    // Click Placement Cells
    fireEvent.click(placementLink);

    expect(scrollIntoViewMock).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth', block: 'start' })
    );
  });

  it('smoothly scrolls to Students and Employers sections when respective nav links are clicked', () => {
    const scrollIntoViewMock = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
              </Route>
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    const nav = container.querySelector('header nav') as HTMLElement;
    expect(nav).not.toBeNull();

    const studentsLink = within(nav).getByRole('link', { name: /^Students$/i });
    fireEvent.click(studentsLink);
    expect(scrollIntoViewMock).toHaveBeenCalled();

    scrollIntoViewMock.mockClear();

    const employersLink = within(nav).getByRole('link', { name: /^Employers$/i });
    fireEvent.click(employersLink);
    expect(scrollIntoViewMock).toHaveBeenCalled();
  });

  it('scrolls to top when clicking the InternFlow logo on homepage', () => {
    const scrollToMock = vi.fn();
    window.scrollTo = scrollToMock;

    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
              </Route>
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    const logoLink = screen.getByRole('link', { name: /InternFlow Homepage/i });
    fireEvent.click(logoLink);

    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
