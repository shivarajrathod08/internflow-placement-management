import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StudentProfilePage from '../pages/student/StudentProfile';
import api from '../api/client';
import * as docViewer from '../utils/documentViewer';

vi.mock('../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockStudentProfile = {
  id: 1,
  userId: 5,
  firstName: 'Alex',
  lastName: 'Rivera',
  email: 'student@college.edu',
  phone: '+1 (555) 234-5678',
  college: 'Stanford University',
  degree: 'B.S.',
  branch: 'Computer Science',
  graduationYear: 2026,
  cgpa: 8.85,
  bio: 'Aspiring distributed systems engineer',
  resumeUrl: '/api/documents/1/download',
  skills: [],
  projects: [],
  experiences: [],
  certifications: [],
};

describe('StudentProfile Resume View & Download Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockResolvedValue({
      data: {
        success: true,
        data: mockStudentProfile,
      },
    });

    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/resume-preview');
    window.URL.revokeObjectURL = vi.fn();
  });

  const renderComponent = async () => {
    const rendered = render(
      <BrowserRouter>
        <StudentProfilePage />
      </BrowserRouter>
    );

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByText('Profile & Credentials')).toBeDefined();
    });

    // Navigate to Resume tab
    const resumeTabBtn = screen.getByRole('button', { name: /resume/i });
    fireEvent.click(resumeTabBtn);

    return rendered;
  };

  it('renders attached resume card with View/Preview and Download buttons', async () => {
    await renderComponent();

    expect(screen.getByText('Official Resume Document')).toBeDefined();
    expect(screen.getByText('Current Resume Attached')).toBeDefined();
    expect(screen.getByRole('button', { name: /view resume preview/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /download resume/i })).toBeDefined();
  });

  it('opens authenticated preview modal when View / Preview is clicked', async () => {
    const fetchBlobSpy = vi.spyOn(docViewer, 'fetchDocumentBlob').mockResolvedValueOnce({
      blob: new Blob(['pdf-data'], { type: 'application/pdf' }),
      filename: 'Alex_Rivera_Resume.pdf',
      mimeType: 'application/pdf',
      objectUrl: 'blob:http://localhost/test-preview-url',
    });

    await renderComponent();

    const viewButton = screen.getByRole('button', { name: /view resume preview/i });
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(fetchBlobSpy).toHaveBeenCalledWith('/api/documents/1/download', 'inline', 'Alex_Rivera_Resume.pdf');
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
  });

  it('calls downloadDocument with student resume url when Download is clicked', async () => {
    const downloadSpy = vi.spyOn(docViewer, 'downloadDocument').mockResolvedValueOnce('Alex_Rivera_Resume.pdf');

    await renderComponent();

    const downloadButton = screen.getByRole('button', { name: /download resume/i });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(downloadSpy).toHaveBeenCalledWith('/api/documents/1/download', 'Alex_Rivera_Resume.pdf');
    });
  });

  it('displays error notice banner when resume access returns 403 or 404', async () => {
    vi.spyOn(docViewer, 'fetchDocumentBlob').mockRejectedValueOnce({
      response: {
        status: 403,
        data: { message: 'Access denied. You do not have authorized permission.' },
      },
    });

    await renderComponent();

    const viewButton = screen.getByRole('button', { name: /view resume preview/i });
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(screen.getByText('Resume Access Notice')).toBeDefined();
      expect(screen.getByText(/do not have authorized permission/i)).toBeDefined();
    });

    // Dismiss error notice
    const dismissBtn = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissBtn);

    expect(screen.queryByText('Resume Access Notice')).toBeNull();
  });
});
