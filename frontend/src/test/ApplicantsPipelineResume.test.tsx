import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ApplicantsPipeline from '../pages/company/ApplicantsPipeline';
import apiClient from '../api/client';
import * as docViewer from '../utils/documentViewer';

vi.mock('../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockApplications = [
  {
    id: 1,
    internshipId: 1,
    internshipTitle: 'Software Engineering Intern - Cloud Platforms',
    internshipLocation: 'Mountain View, CA',
    companyId: 1,
    companyName: 'Google LLC',
    studentId: 1,
    studentName: 'Alex Rivera',
    studentEmail: 'student@college.edu',
    studentCollege: 'Stanford University',
    studentBranch: 'Computer Science',
    studentCgpa: 8.85,
    studentResumeUrl: '/api/applications/1/resume',
    currentStatus: 'SHORTLISTED',
    matchScoreAtApplication: 92,
    appliedAt: '2026-09-01T10:00:00Z',
    history: [],
  },
  {
    id: 4,
    internshipId: 1,
    internshipTitle: 'Software Engineering Intern - Cloud Platforms',
    internshipLocation: 'Mountain View, CA',
    companyId: 1,
    companyName: 'Google LLC',
    studentId: 3,
    studentName: 'David Kim',
    studentEmail: 'david.kim@berkeley.edu',
    studentCollege: 'UC Berkeley',
    studentBranch: 'Electrical Engineering & CS',
    studentCgpa: 7.90,
    studentResumeUrl: null, // Candidate with NO resume
    currentStatus: 'APPLIED',
    matchScoreAtApplication: 65,
    appliedAt: '2026-09-05T14:30:00Z',
    history: [],
  },
];

describe('ApplicantsPipeline Recruiter Resume Access Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes('/internships/company')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              content: [
                {
                  id: 1,
                  title: 'Software Engineering Intern - Cloud Platforms',
                  location: 'Mountain View, CA',
                },
              ],
            },
          },
        });
      }
      if (url.includes('/applications/company')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              content: mockApplications,
              totalPages: 1,
              totalElements: 2,
            },
          },
        });
      }
      return Promise.resolve({ data: { success: true, data: {} } });
    });

    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/recruiter-resume-preview');
    window.URL.revokeObjectURL = vi.fn();
  });

  const renderComponent = async () => {
    const rendered = render(
      <BrowserRouter>
        <ApplicantsPipeline />
      </BrowserRouter>
    );

    // Wait for applications to load in the table
    await waitFor(() => {
      expect(screen.getByText('Alex Rivera')).toBeDefined();
      expect(screen.getByText('David Kim')).toBeDefined();
    });

    return rendered;
  };

  it('renders candidates and resume buttons in the pipeline table', async () => {
    await renderComponent();

    // Verify candidates are rendered
    expect(screen.getByText('Alex Rivera')).toBeDefined();
    expect(screen.getByText('David Kim')).toBeDefined();

    // Verify resume button aria-labels
    expect(screen.getByRole('button', { name: /view resume for alex rivera/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /view resume for david kim/i })).toBeDefined();
  });

  it('opens authenticated preview modal when recruiter clicks candidate resume with resumeUrl', async () => {
    const fetchBlobSpy = vi.spyOn(docViewer, 'fetchDocumentBlob').mockResolvedValueOnce({
      blob: new Blob(['pdf-content'], { type: 'application/pdf' }),
      filename: 'Alex_Rivera_Resume.pdf',
      mimeType: 'application/pdf',
      objectUrl: 'blob:http://localhost/test-preview-url',
    });

    await renderComponent();

    const alexResumeBtn = screen.getByRole('button', { name: /view resume for alex rivera/i });
    fireEvent.click(alexResumeBtn);

    await waitFor(() => {
      expect(fetchBlobSpy).toHaveBeenCalledWith('/api/applications/1/resume', 'inline', 'Alex_Rivera_Resume.pdf');
      expect(screen.getByRole('dialog')).toBeDefined();
      expect(screen.getByText(/Alex_Rivera_Resume.pdf/i)).toBeDefined();
    });

    // Close preview modal
    const closeBtn = screen.getByRole('button', { name: /close preview/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/test-preview-url');
    });

    // Candidate table is still fully visible
    expect(screen.getByText('Alex Rivera')).toBeDefined();
  });

  it('shows helpful error when recruiter clicks resume icon for candidate who has not uploaded resume', async () => {
    await renderComponent();

    const davidResumeBtn = screen.getByRole('button', { name: /view resume for david kim/i });
    fireEvent.click(davidResumeBtn);

    await waitFor(() => {
      expect(screen.getByText(/candidate david kim has not uploaded a resume document yet/i)).toBeDefined();
    });

    // Pipeline view remains completely active
    expect(screen.getByText('David Kim')).toBeDefined();
    expect(screen.getByText('Alex Rivera')).toBeDefined();
  });

  it('shows error banner when backend returns 403 or 404 for resume retrieval', async () => {
    vi.spyOn(docViewer, 'fetchDocumentBlob').mockRejectedValueOnce({
      response: {
        status: 403,
        data: { message: 'Access denied. You do not own the internship posting for this application.' },
      },
    });

    await renderComponent();

    const alexResumeBtn = screen.getByRole('button', { name: /view resume for alex rivera/i });
    fireEvent.click(alexResumeBtn);

    await waitFor(() => {
      expect(screen.getByText(/do not have authorized permission/i)).toBeDefined();
    });

    // Candidate table remains intact
    expect(screen.getByText('Alex Rivera')).toBeDefined();
  });
});
