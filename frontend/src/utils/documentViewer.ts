import api from '../api/client';

export interface DocumentBlobResult {
  blob: Blob;
  filename: string;
  mimeType: string;
  objectUrl: string;
}

/**
 * Normalizes any document URL or ID into the appropriate Axios endpoint path.
 */
export function normalizeDocumentEndpoint(urlOrId: string | number): string {
  if (typeof urlOrId === 'number') {
    return `/documents/${urlOrId}/download`;
  }

  const str = String(urlOrId).trim();

  // If it's a pure numeric string
  if (/^\d+$/.test(str)) {
    return `/documents/${str}/download`;
  }

  // If it's a full URL containing /api/documents/...
  try {
    if (str.startsWith('http://') || str.startsWith('https://')) {
      const parsed = new URL(str);
      let path = parsed.pathname;
      if (path.startsWith('/api/')) {
        path = path.substring(4);
      }
      return path;
    }
  } catch {
    // ignore URL parsing error
  }

  // If it starts with /api/
  if (str.startsWith('/api/')) {
    return str.substring(4);
  }

  // If it's already /documents/...
  if (str.startsWith('/documents/')) {
    return str;
  }

  // If it starts with /uploads/ or uploads/
  if (str.includes('/documents/')) {
    const idx = str.indexOf('/documents/');
    return str.substring(idx);
  }

  return str.startsWith('/') ? str : `/${str}`;
}

/**
 * Parses user-friendly error message from an API error response.
 */
export function getDocumentErrorMessage(error: any): string {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;

  if (status === 401) {
    return 'Your login session has expired. Please log in again to access this document.';
  }
  if (status === 403) {
    return 'Access denied. You do not have authorized permission to view or download this document.';
  }
  if (status === 404) {
    return 'Document not found on storage. The file may have been moved or not yet uploaded.';
  }
  if (status === 400) {
    return message || 'Invalid document request.';
  }
  if (status >= 500) {
    return 'Server error occurred while retrieving document. Please try again later.';
  }
  if (message) {
    return message;
  }
  return error?.message || 'Unable to retrieve document. Please check your connection and try again.';
}

/**
 * Extracts filename from Content-Disposition header if present.
 */
export function extractFilenameFromHeader(contentDisposition?: string, fallback: string = 'document.pdf'): string {
  if (!contentDisposition) return fallback;

  // Match filename="example.pdf" or filename=example.pdf
  const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  if (match && match[1]) {
    return decodeURIComponent(match[1].trim().replace(/^"(.*)"$/, '$1'));
  }
  return fallback;
}

/**
 * Securely fetches document binary data via the authenticated Axios client (with Bearer token).
 */
export async function fetchDocumentBlob(
  urlOrId: string | number,
  disposition: 'inline' | 'attachment' = 'inline',
  defaultFilename?: string
): Promise<DocumentBlobResult> {
  const endpoint = normalizeDocumentEndpoint(urlOrId);
  const separator = endpoint.includes('?') ? '&' : '?';
  const urlWithDisposition = `${endpoint}${separator}disposition=${disposition}`;

  const response = await api.get(urlWithDisposition, {
    responseType: 'blob',
  });

  const rawDisposition = response.headers?.['content-disposition'];
  const contentDisposition = typeof rawDisposition === 'string' ? rawDisposition : undefined;
  const rawContentType = response.headers?.['content-type'];
  const contentType = typeof rawContentType === 'string' ? rawContentType : 'application/pdf';
  const filename = extractFilenameFromHeader(contentDisposition, defaultFilename || 'Resume_Document.pdf');

  const blob = new Blob([response.data], { type: contentType });
  const objectUrl = window.URL.createObjectURL(blob);

  return {
    blob,
    filename,
    mimeType: contentType,
    objectUrl,
  };
}

/**
 * Downloads a document securely using an authenticated request.
 */
export async function downloadDocument(
  urlOrId: string | number,
  suggestedFilename?: string
): Promise<string> {
  const { objectUrl, filename } = await fetchDocumentBlob(urlOrId, 'attachment', suggestedFilename);
  const downloadName = suggestedFilename || filename;

  try {
    const link = document.createElement('a');
    link.href = objectUrl;
    link.setAttribute('download', downloadName);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return downloadName;
  } finally {
    // Revoke object URL after a short delay so browser download starts
    setTimeout(() => {
      window.URL.revokeObjectURL(objectUrl);
    }, 1000);
  }
}

/**
 * Opens a document in a new tab securely via an authenticated Blob Object URL.
 */
export async function viewDocumentInNewTab(
  urlOrId: string | number,
  suggestedFilename?: string
): Promise<string> {
  const { objectUrl } = await fetchDocumentBlob(urlOrId, 'inline', suggestedFilename);

  const newWindow = window.open(objectUrl, '_blank');
  if (!newWindow) {
    // Popup was blocked, trigger fallback or throw helpful error
    throw new Error('Popup blocked by browser. Please allow popups for this site or use the Preview modal / Download button.');
  }

  // Revoke object URL after 60 seconds to prevent memory leaks while tab opens
  setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl);
  }, 60000);

  return objectUrl;
}
