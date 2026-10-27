import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminProfile } from '../pages/admin/AdminProfile';
import { Navbar } from '../components/common/Navbar';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import apiClient from '../api/client';
import App from '../App';

describe('AdminProfile & Profile Routing Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders authenticated administrator profile with account information', () => {
    localStorage.setItem(
      'internflow_user',
      JSON.stringify({
        id: 1,
        email: 'admin@internflow.edu',
        role: 'ADMIN',
        name: 'Dr. Sarah Jenkins',
        createdAt: '2026-01-15T09:00:00Z',
      })
    );
    localStorage.setItem('internflow_token', 'mock_admin_token');

    render(
      <MemoryRouter initialEntries={['/admin/profile']}>
        <AuthProvider>
          <AdminProfile />
        </AuthProvider>
      </MemoryRouter>
    );

    // Verify authenticated user details
    const names = screen.getAllByText('Dr. Sarah Jenkins');
    expect(names.length).toBeGreaterThanOrEqual(1);
    expect(names[0]).toBeInTheDocument();

    const emails = screen.getAllByText('admin@internflow.edu');
    expect(emails.length).toBeGreaterThanOrEqual(1);
    expect(emails[0]).toBeInTheDocument();

    expect(screen.getByText('IF-ADM-001')).toBeInTheDocument();
    expect(screen.getByText('ADMIN Standing')).toBeInTheDocument();
    expect(screen.getByText('Active Account')).toBeInTheDocument();
    expect(screen.getByText('Super Administrator (Campus-Wide)')).toBeInTheDocument();
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Update Security Credentials')).toBeInTheDocument();
  });

  it('validates password fields and submits password change successfully', async () => {
    localStorage.setItem(
      'internflow_user',
      JSON.stringify({
        id: 1,
        email: 'admin@internflow.edu',
        role: 'ADMIN',
        name: 'Campus Administrator',
      })
    );
    localStorage.setItem('internflow_token', 'mock_admin_token');

    const putSpy = vi.spyOn(apiClient, 'put').mockResolvedValue({
      data: { success: true, message: 'Password changed successfully' },
    } as any);

    render(
      <MemoryRouter initialEntries={['/admin/profile']}>
        <AuthProvider>
          <AdminProfile />
        </AuthProvider>
      </MemoryRouter>
    );

    const currentPwdInput = screen.getByPlaceholderText('Enter current password');
    const newPwdInput = screen.getByPlaceholderText('Min 8 characters');
    const confirmPwdInput = screen.getByPlaceholderText('Re-enter new password');
    const submitBtn = screen.getByRole('button', { name: /Update Password/i });

    // Try mismatched passwords
    fireEvent.change(currentPwdInput, { target: { value: 'OldPass@123' } });
    fireEvent.change(newPwdInput, { target: { value: 'NewSecurePass@2026' } });
    fireEvent.change(confirmPwdInput, { target: { value: 'DifferentPass@2026' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText('New password and confirmation do not match.')).toBeInTheDocument();

    // Now submit matching passwords
    fireEvent.change(confirmPwdInput, { target: { value: 'NewSecurePass@2026' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalledWith('/auth/change-password', {
        currentPassword: 'OldPass@123',
        newPassword: 'NewSecurePass@2026',
      });
      expect(
        screen.getByText('Your security password has been updated successfully.')
      ).toBeInTheDocument();
    });
  });

  it('renders My Profile link pointing to /admin/profile for administrator in Navbar', () => {
    localStorage.setItem(
      'internflow_user',
      JSON.stringify({
        id: 1,
        email: 'admin@internflow.edu',
        role: 'ADMIN',
        name: 'Campus Admin',
      })
    );
    localStorage.setItem('internflow_token', 'mock_admin_token');

    render(
      <MemoryRouter>
        <AuthProvider>
          <NotificationProvider>
            <Navbar />
          </NotificationProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Open user menu
    const userButton = screen.getByText('Campus Admin').closest('button');
    expect(userButton).not.toBeNull();
    fireEvent.click(userButton!);

    // Check My Profile link href
    const profileLink = screen.getByText('My Profile').closest('a');
    expect(profileLink).not.toBeNull();
    expect(profileLink?.getAttribute('href')).toBe('/admin/profile');
  });

  it('renders My Profile link pointing to /company/profile for recruiter in Navbar', () => {
    localStorage.setItem(
      'internflow_user',
      JSON.stringify({
        id: 2,
        email: 'recruiter@google.com',
        role: 'RECRUITER',
        name: 'Tech Recruiter',
      })
    );
    localStorage.setItem('internflow_token', 'mock_token');

    render(
      <MemoryRouter>
        <AuthProvider>
          <NotificationProvider>
            <Navbar />
          </NotificationProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Open user menu
    const userButton = screen.getByText('Tech Recruiter').closest('button');
    fireEvent.click(userButton!);

    // Check My Profile link href
    const profileLink = screen.getByText('My Profile').closest('a');
    expect(profileLink?.getAttribute('href')).toBe('/company/profile');
  });

  it('navigates to 404 page for genuinely unknown routes', async () => {
    window.history.pushState({}, '404 Test', '/some-completely-invalid-nonexistent-url');
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/404/)).toBeInTheDocument();
      expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
    });
  });
});
