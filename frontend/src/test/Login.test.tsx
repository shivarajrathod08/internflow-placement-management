import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Login } from '../pages/auth/Login';
import { AuthProvider } from '../context/AuthContext';
import api from '../api/client';

describe('Login Component Campus Ledger Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders the two-column brand intro and login form', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    // Left column branding & copy
    expect(screen.getByText(/Academic Placement Network/i)).toBeInTheDocument();
    expect(screen.getByText(/Your next opportunity starts here\./i)).toBeInTheDocument();
    expect(screen.getByText(/Explainable 5-Factor Matching/i)).toBeInTheDocument();
    expect(screen.getByText(/Multi-Stage Technical Pipeline/i)).toBeInTheDocument();
    expect(screen.getByText(/Audited Offers & Day 1 Joining/i)).toBeInTheDocument();

    // Right column login card
    expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Sign In$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Register as Student/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Employer/i })).toBeInTheDocument();
  });

  it('toggles password visibility securely with keyboard-operable control', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    const pwdInput = screen.getByLabelText(/^Password/i) as HTMLInputElement;
    expect(pwdInput.type).toBe('password');

    const toggleBtn = screen.getByRole('button', { name: /Show password/i });
    expect(toggleBtn).toBeInTheDocument();

    // Click to show password
    fireEvent.click(toggleBtn);
    expect(pwdInput.type).toBe('text');
    expect(screen.getByRole('button', { name: /Hide password/i })).toBeInTheDocument();

    // Click again to hide password
    fireEvent.click(screen.getByRole('button', { name: /Hide password/i }));
    expect(pwdInput.type).toBe('password');
  });

  it('disables the submit button until required credentials are typed', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /^Sign In$/i });
    expect(submitBtn).toBeDisabled();

    const emailInput = screen.getByLabelText(/Email Address/i);
    const pwdInput = screen.getByLabelText(/^Password/i);

    fireEvent.change(emailInput, { target: { value: 'student@college.edu' } });
    expect(submitBtn).toBeDisabled();

    fireEvent.change(pwdInput, { target: { value: 'Password@123' } });
    expect(submitBtn).not.toBeDisabled();
  });

  it('submits valid credentials and redirects student to student dashboard', async () => {
    const postSpy = vi.spyOn(api, 'post').mockResolvedValue({
      data: {
        success: true,
        data: {
          token: 'jwt_mock_student_token',
          userId: 5,
          email: 'alex@internflow.edu',
          role: 'STUDENT',
          name: 'Alex Rivera',
        },
      },
    } as any);

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/student/dashboard" element={<div>Student Home Dashboard</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email Address/i);
    const pwdInput = screen.getByLabelText(/^Password/i);
    const submitBtn = screen.getByRole('button', { name: /^Sign In$/i });

    fireEvent.change(emailInput, { target: { value: 'alex@internflow.edu' } });
    fireEvent.change(pwdInput, { target: { value: 'Secret123!' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/auth/login', {
        email: 'alex@internflow.edu',
        password: 'Secret123!',
      });
      expect(screen.getByText('Student Home Dashboard')).toBeInTheDocument();
    });
  });

  it('submits valid credentials and redirects recruiter to company dashboard', async () => {
    vi.spyOn(api, 'post').mockResolvedValue({
      data: {
        success: true,
        data: {
          token: 'jwt_mock_recruiter_token',
          userId: 2,
          email: 'recruiter@google.com',
          role: 'RECRUITER',
          name: 'Sarah Chen',
        },
      },
    } as any);

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/company/dashboard" element={<div>Recruiter Pipeline Dashboard</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email Address/i);
    const pwdInput = screen.getByLabelText(/^Password/i);
    const submitBtn = screen.getByRole('button', { name: /^Sign In$/i });

    fireEvent.change(emailInput, { target: { value: 'recruiter@google.com' } });
    fireEvent.change(pwdInput, { target: { value: 'Password@123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Recruiter Pipeline Dashboard')).toBeInTheDocument();
    });
  });

  it('displays a sanitized, dismissable error banner when backend returns 401', async () => {
    vi.spyOn(api, 'post').mockRejectedValue({
      response: {
        status: 401,
        data: { message: 'Invalid email or password.' },
      },
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email Address/i);
    const pwdInput = screen.getByLabelText(/^Password/i);
    const submitBtn = screen.getByRole('button', { name: /^Sign In$/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@college.edu' } });
    fireEvent.change(pwdInput, { target: { value: 'BadPass' } });
    fireEvent.click(submitBtn);

    const errorMsg = await screen.findByText('Invalid email or password.');
    expect(errorMsg).toBeInTheDocument();

    // Dismiss error
    const dismissBtn = screen.getByRole('button', { name: /Dismiss error/i });
    fireEvent.click(dismissBtn);
    expect(screen.queryByText('Invalid email or password.')).not.toBeInTheDocument();
  });

  it('opens and closes the institutional account recovery policy modal', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    const forgotBtn = screen.getByRole('button', { name: /Forgot password\?/i });
    fireEvent.click(forgotBtn);

    expect(screen.getByText('Account Recovery Policy')).toBeInTheDocument();
    expect(
      screen.getByText(
        /To maintain regulatory compliance and secure verified student records, self-service password reset is disabled for institutional accounts\./i
      )
    ).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Understood/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Account Recovery Policy')).not.toBeInTheDocument();
  });

  it('pre-fills credentials when dev demo shortcut is clicked without bypassing login', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    const studentPill = screen.getByRole('button', { name: /Student demo account/i });
    fireEvent.click(studentPill);

    const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement;
    const pwdInput = screen.getByLabelText(/^Password/i) as HTMLInputElement;

    expect(emailInput.value).toBe('student@college.edu');
    expect(pwdInput.value).toBe('Password@123');
  });
});
