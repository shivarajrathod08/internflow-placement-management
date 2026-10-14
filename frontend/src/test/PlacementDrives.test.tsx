import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PlacementDrivesPage } from '../pages/drives/PlacementDrivesPage';
import { AuthProvider } from '../context/AuthContext';
import * as services from '../api/services';

describe('PlacementDrivesPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.setItem(
      'internflow_user',
      JSON.stringify({
        id: 1,
        email: 'tpo@internflow.edu',
        role: 'TPO',
        name: 'Head Placement Officer',
      })
    );
    localStorage.setItem('internflow_token', 'mock_jwt_token');
  });

  it('renders placement drives banner and empty state when no drives are returned', async () => {
    vi.spyOn(services.placementDrivesApi, 'getAll').mockResolvedValue({
      success: true,
      data: [],
      timestamp: new Date().toISOString(),
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <PlacementDrivesPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Placement Drives & Cohorts')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('No placement drives found')).toBeInTheDocument();
    });
  });

  it('renders ongoing and upcoming placement drive cards with qualifications', async () => {
    vi.spyOn(services.placementDrivesApi, 'getAll').mockResolvedValue({
      success: true,
      data: [
        {
          id: 101,
          name: 'Annual Tech Campus Drive 2026',
          academicYear: '2025-2026',
          batchYear: 2026,
          startDate: '2026-09-01',
          status: 'ONGOING',
          description: 'Flagship hiring drive for enterprise software companies.',
          eligibleBranches: 'Computer Science, IT',
          minCgpa: 7.5,
          maxBacklogs: 0,
          createdAt: new Date().toISOString(),
        },
      ],
      timestamp: new Date().toISOString(),
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <PlacementDrivesPage />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Annual Tech Campus Drive 2026/)).toBeInTheDocument();
      expect(screen.getAllByText(/ONGOING/).length).toBeGreaterThan(0);
      expect(screen.getByText(/Eligible Candidates/)).toBeInTheDocument();
    });
  });
});
