import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../api/client';
import {
  normalizeDocumentEndpoint,
  extractFilenameFromHeader,
  getDocumentErrorMessage,
  fetchDocumentBlob,
  downloadDocument,
  viewDocumentInNewTab,
} from '../utils/documentViewer';

vi.mock('../api/client', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('documentViewer Utility Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('normalizeDocumentEndpoint', () => {
    it('normalizes numeric id to /documents/{id}/download', () => {
      expect(normalizeDocumentEndpoint(1)).toBe('/documents/1/download');
      expect(normalizeDocumentEndpoint('42')).toBe('/documents/42/download');
    });

    it('normalizes endpoint with /api/ prefix', () => {
      expect(normalizeDocumentEndpoint('/api/documents/5/download')).toBe('/documents/5/download');
    });

    it('normalizes full localhost URL', () => {
      expect(normalizeDocumentEndpoint('http://localhost:8080/api/documents/3/download')).toBe('/documents/3/download');
    });

    it('preserves already clean document paths', () => {
      expect(normalizeDocumentEndpoint('/documents/1/download')).toBe('/documents/1/download');
    });
  });

  describe('extractFilenameFromHeader', () => {
    it('extracts filename from standard Content-Disposition header', () => {
      expect(extractFilenameFromHeader('attachment; filename="Alex_Rivera_Resume.pdf"')).toBe('Alex_Rivera_Resume.pdf');
    });

    it('extracts unquoted filename', () => {
      expect(extractFilenameFromHeader('inline; filename=resume.pdf')).toBe('resume.pdf');
    });

    it('falls back to default if header is missing or empty', () => {
      expect(extractFilenameFromHeader(undefined, 'default.pdf')).toBe('default.pdf');
    });
  });

  describe('getDocumentErrorMessage', () => {
    it('maps 401 to session expired message', () => {
      const error = { response: { status: 401 } };
      expect(getDocumentErrorMessage(error)).toContain('session has expired');
    });

    it('maps 403 to permission denied message', () => {
      const error = { response: { status: 403 } };
      expect(getDocumentErrorMessage(error)).toContain('do not have authorized permission');
    });

    it('maps 404 to document not found message', () => {
      const error = { response: { status: 404 } };
      expect(getDocumentErrorMessage(error)).toContain('Document not found');
    });

    it('uses server error message if provided', () => {
      const error = { response: { status: 400, data: { message: 'Custom invalid file error' } } };
      expect(getDocumentErrorMessage(error)).toBe('Custom invalid file error');
    });
  });

  describe('fetchDocumentBlob & downloadDocument', () => {
    it('fetches document blob via authenticated api client', async () => {
      const mockBlob = new Blob(['sample pdf content'], { type: 'application/pdf' });
      (api.get as any).mockResolvedValueOnce({
        data: mockBlob,
        headers: {
          'content-type': 'application/pdf',
          'content-disposition': 'attachment; filename="Sample_Resume.pdf"',
        },
      });

      // Mock window.URL methods
      const createObjectURLMock = vi.fn().mockReturnValue('blob:http://localhost/sample-uuid');
      const revokeObjectURLMock = vi.fn();
      window.URL.createObjectURL = createObjectURLMock;
      window.URL.revokeObjectURL = revokeObjectURLMock;

      const result = await fetchDocumentBlob('/api/documents/1/download', 'inline');

      expect(api.get).toHaveBeenCalledWith('/documents/1/download?disposition=inline', {
        responseType: 'blob',
      });
      expect(result.filename).toBe('Sample_Resume.pdf');
      expect(result.objectUrl).toBe('blob:http://localhost/sample-uuid');
    });

    it('downloads document and triggers link click', async () => {
      const mockBlob = new Blob(['pdf data'], { type: 'application/pdf' });
      (api.get as any).mockResolvedValueOnce({
        data: mockBlob,
        headers: {
          'content-type': 'application/pdf',
          'content-disposition': 'attachment; filename="Alex_Resume.pdf"',
        },
      });

      window.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/dl-uuid');
      window.URL.revokeObjectURL = vi.fn();

      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');

      const filename = await downloadDocument('/documents/1/download', 'Custom_Resume.pdf');

      expect(filename).toBe('Custom_Resume.pdf');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });

    it('opens document in new tab', async () => {
      const mockBlob = new Blob(['pdf data'], { type: 'application/pdf' });
      (api.get as any).mockResolvedValueOnce({
        data: mockBlob,
        headers: {
          'content-type': 'application/pdf',
        },
      });

      window.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/view-uuid');
      window.URL.revokeObjectURL = vi.fn();
      const openSpy = vi.spyOn(window, 'open').mockReturnValue({} as any);

      const objectUrl = await viewDocumentInNewTab('/documents/1/download');

      expect(openSpy).toHaveBeenCalledWith('blob:http://localhost/view-uuid', '_blank');
      expect(objectUrl).toBe('blob:http://localhost/view-uuid');
    });
  });
});
