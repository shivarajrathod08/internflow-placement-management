import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RegisterStudent } from '../pages/auth/RegisterStudent';
import { AuthProvider } from '../context/AuthContext';
import api from '../api/client';

describe('RegisterStudent Component Campus Ledger Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders the two-column layout with student registration highlights and form controls', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterStudent />
        </AuthProvider>
      </MemoryRouter>
    );

    // Left column: Eyebrow, serif headline, and 3 benefits
    expect(screen.getByText(/STUDENT REGISTRATION/i)).toBeInTheDocument();
    expect(screen.getByText(/Create your/i)).toBeInTheDocument();
    expect(screen.getByText(/student profile\./i)).toBeInTheDocument();
    expect(screen.getByText(/Verified Opportunities/i)).toBeInTheDocument();
    expect(screen.getByText(/Transparent Eligibility/i)).toBeInTheDocument();
    expect(screen.getByText(/Application Tracking/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Students collaborating on university campus/i)).toBeInTheDocument();

    // Right column: Form card heading and fields
    expect(screen.getByRole('heading', { name: /^Create Student Profile$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/University Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Graduation Year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Degree Program/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CGPA \(out of 10\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/College \/ University/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Branch \/ Major/i)).toBeInTheDocument();

    // Submit button and sign-in link
    expect(screen.getByRole('button', { name: /Create account and continue/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign in/i })).toBeInTheDocument();
  });

  it('toggles password visibility with accessible button', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterStudent />
        </AuthProvider>
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(/^Password/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const toggleBtn = screen.getByRole('button', { name: /Show password/i });
    fireEvent.click(toggleBtn);

    expect(passwordInput.type).toBe('text');
    expect(screen.getByRole('button', { name: /Hide password/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Hide password/i }));
    expect(passwordInput.type).toBe('password');
  });

  it('validates CGPA boundaries and displays friendly error', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterStudent />
        </AuthProvider>
      </MemoryRouter>
    );

    const firstName = screen.getByLabelText(/First Name/i);
    const lastName = screen.getByLabelText(/Last Name/i);
    const email = screen.getByLabelText(/University Email/i);
    const password = screen.getByLabelText(/^Password/i);
    const college = screen.getByLabelText(/College \/ University/i);
    const branch = screen.getByLabelText(/Branch \/ Major/i);
    const cgpa = screen.getByLabelText(/CGPA \(out of 10\)/i);

    fireEvent.change(firstName, { target: { value: 'Alex' } });
    fireEvent.change(lastName, { target: { value: 'Rivera' } });
    fireEvent.change(email, { target: { value: 'alex@stanford.edu' } });
    fireEvent.change(password, { target: { value: 'Secret123!' } });
    fireEvent.change(college, { target: { value: 'Stanford University' } });
    fireEvent.change(branch, { target: { value: 'Computer Science' } });
    fireEvent.change(cgpa, { target: { value: '11.5' } });

    fireEvent.click(screen.getByRole('button', { name: /Create account and continue/i }));

    expect(await screen.findByText(/CGPA must be a valid score between 0\.00 and 10\.00\./i)).toBeInTheDocument();
  });

  it('submits form successfully, logs in, and redirects to student dashboard', async () => {
    const postSpy = vi.spyOn(api, 'post').mockImplementation(async (url: string) => {
      if (url === '/auth/register/student') {
        return {
          data: {
            success: true,
            data: {
              token: 'mock-student-token',
              user: {
                id: 's1',
                email: 'alex@stanford.edu',
                role: 'STUDENT',
                firstName: 'Alex',
                lastName: 'Rivera',
              },
            },
          },
        } as any;
      }
      if (url === '/auth/login') {
        return {
          data: {
            success: true,
            data: {
              token: 'mock-student-token',
              user: {
                id: 's1',
                email: 'alex@stanford.edu',
                role: 'STUDENT',
                firstName: 'Alex',
                lastName: 'Rivera',
              },
            },
          },
        } as any;
      }
      throw new Error(`Unhandled url: ${url}`);
    });

    render(
      <MemoryRouter initialEntries={['/register/student']}>
        <AuthProvider>
          <Routes>
            <Route path="/register/student" element={<RegisterStudent />} />
            <Route path="/student/dashboard" element={<div>Student Dashboard View</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Alex' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Rivera' } });
    fireEvent.change(screen.getByLabelText(/University Email/i), { target: { value: 'alex@stanford.edu' } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'Secret123!' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '+91 98765 43210' } });
    fireEvent.change(screen.getByLabelText(/Graduation Year/i), { target: { value: '2027' } });
    fireEvent.change(screen.getByLabelText(/Degree Program/i), { target: { value: 'B.Tech / B.E.' } });
    fireEvent.change(screen.getByLabelText(/CGPA \(out of 10\)/i), { target: { value: '9.2' } });
    fireEvent.change(screen.getByLabelText(/College \/ University/i), { target: { value: 'Stanford University' } });
    fireEvent.change(screen.getByLabelText(/Branch \/ Major/i), { target: { value: 'Computer Science' } });

    fireEvent.click(screen.getByRole('button', { name: /Create account and continue/i }));

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(
        '/auth/register/student',
        expect.objectContaining({
          email: 'alex@stanford.edu',
          firstName: 'Alex',
          lastName: 'Rivera',
          phone: '+91 98765 43210',
          graduationYear: 2027,
          cgpa: 9.2,
          degree: 'B.Tech / B.E.',
          branch: 'Computer Science',
          college: 'Stanford University',
        })
      );
    });

    expect(await screen.findByText(/Student Dashboard View/i)).toBeInTheDocument();
  });

  it('renders dismissable error banner when backend returns error', async () => {
    vi.spyOn(api, 'post').mockRejectedValue({
      response: {
        status: 409,
        data: {
          message: 'An account with this email address already exists. Please sign in instead.',
        },
      },
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterStudent />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Alex' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Rivera' } });
    fireEvent.change(screen.getByLabelText(/University Email/i), { target: { value: 'alex@stanford.edu' } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'Secret123!' } });
    fireEvent.change(screen.getByLabelText(/College \/ University/i), { target: { value: 'Stanford University' } });
    fireEvent.change(screen.getByLabelText(/Branch \/ Major/i), { target: { value: 'Computer Science' } });

    fireEvent.click(screen.getByRole('button', { name: /Create account and continue/i }));

    const errorMsg = await screen.findByText(/An account with this email address already exists/i);
    expect(errorMsg).toBeInTheDocument();

    const dismissBtn = screen.getByRole('button', { name: /Dismiss error/i });
    fireEvent.click(dismissBtn);

    expect(screen.queryByText(/An account with this email address already exists/i)).not.toBeInTheDocument();
  });
});
