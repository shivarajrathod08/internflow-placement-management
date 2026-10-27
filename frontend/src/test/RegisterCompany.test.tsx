import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RegisterCompany } from '../pages/auth/RegisterCompany';
import { AuthProvider } from '../context/AuthContext';
import api from '../api/client';

describe('RegisterCompany Component Campus Ledger Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders the two-column layout with employer registration benefits and form controls', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterCompany />
        </AuthProvider>
      </MemoryRouter>
    );

    // Left column: Eyebrow, serif headline, and 3 benefits
    expect(screen.getByText(/EMPLOYER REGISTRATION/i)).toBeInTheDocument();
    expect(screen.getByText(/Find the right talent\./i)).toBeInTheDocument();
    expect(screen.getByText(/Build your team\./i)).toBeInTheDocument();
    expect(screen.getByText(/Access Campus Talent/i)).toBeInTheDocument();
    expect(screen.getByText(/Structured Internship Postings/i)).toBeInTheDocument();
    expect(screen.getByText(/Manage Recruitment Progress/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Recruiter interviewing and collaborating with candidates/i)).toBeInTheDocument();

    // Right column: Form card heading, KYC notice, and fields
    expect(screen.getByRole('heading', { name: /^Register Employer Account$/i })).toBeInTheDocument();
    expect(screen.getByText(/Institutional KYC Notice/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Official Company Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Recruiter Work Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company Website/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Industry \/ Domain/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Headquarters Location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company Description/i)).toBeInTheDocument();

    // Submit button and sign-in link
    expect(screen.getByRole('button', { name: /Register Company/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('toggles password visibility with accessible button', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterCompany />
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

  it('validates required company name and password length', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterCompany />
        </AuthProvider>
      </MemoryRouter>
    );

    // Click submit with empty form
    fireEvent.click(screen.getByRole('button', { name: /Register Company/i }));
    expect(await screen.findByText(/Please provide your official company name\./i)).toBeInTheDocument();

    // Fill company name, but keep password too short
    fireEvent.change(screen.getByLabelText(/Official Company Name/i), { target: { value: 'Stripe' } });
    fireEvent.change(screen.getByLabelText(/Recruiter Work Email/i), { target: { value: 'recruiter@stripe.com' } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: /Register Company/i }));
    expect(await screen.findByText(/Password must be at least 6 characters in length\./i)).toBeInTheDocument();
  });

  it('submits form successfully, logs in, and redirects to company dashboard', async () => {
    const postSpy = vi.spyOn(api, 'post').mockImplementation(async (url: string) => {
      if (url === '/auth/register/company') {
        return {
          data: {
            success: true,
            data: {
              token: 'mock-company-token',
              user: {
                id: 'c1',
                email: 'recruiter@stripe.com',
                role: 'COMPANY',
                companyName: 'Stripe',
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
              token: 'mock-company-token',
              user: {
                id: 'c1',
                email: 'recruiter@stripe.com',
                role: 'COMPANY',
                companyName: 'Stripe',
              },
            },
          },
        } as any;
      }
      throw new Error(`Unhandled url: ${url}`);
    });

    render(
      <MemoryRouter initialEntries={['/register/company']}>
        <AuthProvider>
          <Routes>
            <Route path="/register/company" element={<RegisterCompany />} />
            <Route path="/company/dashboard" element={<div>Company Dashboard View</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Official Company Name/i), { target: { value: 'Stripe' } });
    fireEvent.change(screen.getByLabelText(/Recruiter Work Email/i), { target: { value: 'recruiter@stripe.com' } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'Password@123' } });
    fireEvent.change(screen.getByLabelText(/Company Website/i), { target: { value: 'stripe.com' } });
    fireEvent.change(screen.getByLabelText(/Industry \/ Domain/i), { target: { value: 'FinTech & Payments' } });
    fireEvent.change(screen.getByLabelText(/Headquarters Location/i), { target: { value: 'San Francisco, CA' } });
    fireEvent.change(screen.getByLabelText(/Company Description/i), {
      target: { value: 'Global financial infrastructure provider.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Register Company/i }));

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(
        '/auth/register/company',
        expect.objectContaining({
          companyName: 'Stripe',
          email: 'recruiter@stripe.com',
          website: 'https://stripe.com',
          industry: 'FinTech & Payments',
          location: 'San Francisco, CA',
          description: 'Global financial infrastructure provider.',
        })
      );
    });

    expect(await screen.findByText(/Company Dashboard View/i)).toBeInTheDocument();
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
          <RegisterCompany />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Official Company Name/i), { target: { value: 'Google' } });
    fireEvent.change(screen.getByLabelText(/Recruiter Work Email/i), { target: { value: 'recruiter@google.com' } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'Password@123' } });

    fireEvent.click(screen.getByRole('button', { name: /Register Company/i }));

    const errorMsg = await screen.findByText(/An account with this email address already exists/i);
    expect(errorMsg).toBeInTheDocument();

    const dismissBtn = screen.getByRole('button', { name: /Dismiss error/i });
    fireEvent.click(dismissBtn);

    expect(screen.queryByText(/An account with this email address already exists/i)).not.toBeInTheDocument();
  });
});
