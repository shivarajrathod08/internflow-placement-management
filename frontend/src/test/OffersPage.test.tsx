import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OffersPage, formatCurrencyINR, formatDate } from '../pages/offers/OffersPage';
import { AuthProvider } from '../context/AuthContext';
import { offersApi } from '../api/services';
import { Offer } from '../types';

describe('OffersPage Unit & Integration Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('correctly formats INR currency and raw timestamps', () => {
    expect(formatCurrencyINR(120000)).toBe('₹1,20,000/month');
    expect(formatCurrencyINR(50000)).toBe('₹50,000/month');
    expect(formatCurrencyINR(0)).toBe('₹0/month');
    expect(formatCurrencyINR(null)).toBe('₹50,000/month');

    // 2026-12-20T23:34:34.647276 -> "20 Dec 2026"
    expect(formatDate('2026-12-20T23:34:34.647276')).toBe('20 Dec 2026');
    expect(formatDate(null)).toBe('Immediate');
    expect(formatDate(undefined, 'TBD')).toBe('TBD');
  });

  it('renders student offers with correct state-aware actions and formats', async () => {
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

    const mockOffers: Offer[] = [
      {
        id: 101,
        applicationId: 1,
        studentId: 1,
        studentName: 'Alex Rivera',
        studentEmail: 'alex@internflow.edu',
        companyId: 2,
        companyName: 'Google',
        internshipId: 1,
        internshipTitle: 'Cloud Engineering Intern',
        designation: 'Cloud Engineering Intern',
        stipendOrSalary: 120000,
        location: 'Bangalore, India',
        offerLetterUrl: 'https://example.com/offer.pdf',
        joiningDate: '2026-12-20T23:34:34.647276',
        status: 'OFFERED',
        offeredAt: '2026-11-15T10:00:00',
      },
      {
        id: 102,
        applicationId: 2,
        studentId: 1,
        studentName: 'Alex Rivera',
        studentEmail: 'alex@internflow.edu',
        companyId: 3,
        companyName: 'Microsoft',
        internshipId: 2,
        internshipTitle: 'AI Research Intern',
        designation: 'AI Research Intern',
        stipendOrSalary: 150000,
        location: 'Hyderabad, India',
        joiningDate: '2027-01-10T09:00:00',
        status: 'ACCEPTED',
        offeredAt: '2026-11-10T10:00:00',
      },
      {
        id: 103,
        applicationId: 3,
        studentId: 1,
        studentName: 'Alex Rivera',
        studentEmail: 'alex@internflow.edu',
        companyId: 4,
        companyName: 'Amazon',
        internshipId: 3,
        internshipTitle: 'SDE Intern',
        designation: 'SDE Intern',
        stipendOrSalary: 110000,
        location: 'Bangalore, India',
        joiningDate: '2026-12-01T09:00:00',
        status: 'JOINED',
        offeredAt: '2026-10-10T10:00:00',
      },
    ];

    vi.spyOn(offersApi, 'getMyOffers').mockResolvedValue({
      success: true,
      message: 'OK',
      timestamp: '2026-10-21T00:00:00Z',
      data: mockOffers,
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <OffersPage />
        </AuthProvider>
      </MemoryRouter>
    );

    // Verify header and Campus Ledger elements
    await waitFor(() => {
      expect(screen.getByText('Offers & Joining Management')).toBeInTheDocument();
      expect(screen.getByText('Placement & Internship Lifecycle')).toBeInTheDocument();
    });

    // Check Google Offer (OFFERED)
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('Cloud Engineering Intern')).toBeInTheDocument();
    expect(screen.getByText('₹1,20,000/month')).toBeInTheDocument();
    expect(screen.getByText('20 Dec 2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /accept offer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^decline$/i })).toBeInTheDocument();

    // Check Microsoft Offer (ACCEPTED)
    expect(screen.getByText('Microsoft')).toBeInTheDocument();
    expect(screen.getByText('AI Research Intern')).toBeInTheDocument();
    expect(screen.getByText('₹1,50,000/month')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm day 1 joining/i })).toBeInTheDocument();

    // Check Amazon Offer (JOINED)
    expect(screen.getByText('Amazon')).toBeInTheDocument();
    expect(screen.getByText('Day 1 Joining Confirmed')).toBeInTheDocument();
  });

  it('triggers updateStatus when Confirm Day 1 Joining is clicked on an ACCEPTED offer', async () => {
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

    const mockAcceptedOffer: Offer = {
      id: 201,
      applicationId: 5,
      studentId: 1,
      studentName: 'Alex Rivera',
      studentEmail: 'alex@internflow.edu',
      companyId: 3,
      companyName: 'Microsoft',
      internshipId: 2,
      internshipTitle: 'AI Research Intern',
      designation: 'AI Research Intern',
      stipendOrSalary: 150000,
      location: 'Hyderabad, India',
      joiningDate: '2027-01-10T09:00:00',
      status: 'ACCEPTED',
      offeredAt: '2026-11-10T10:00:00',
    };

    vi.spyOn(offersApi, 'getMyOffers').mockResolvedValue({
      success: true,
      message: 'OK',
      timestamp: '2026-10-21T00:00:00Z',
      data: [mockAcceptedOffer],
    });

    const updateStatusSpy = vi.spyOn(offersApi, 'updateStatus').mockResolvedValue({
      success: true,
      message: 'Updated',
      timestamp: '2026-10-21T00:00:00Z',
      data: { ...mockAcceptedOffer, status: 'JOINED' },
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <OffersPage />
        </AuthProvider>
      </MemoryRouter>
    );

    const confirmBtn = await screen.findByRole('button', { name: /confirm day 1 joining/i });
    expect(confirmBtn).toBeInTheDocument();

    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(updateStatusSpy).toHaveBeenCalledWith(201, 'JOINED', undefined);
    });
  });
});
