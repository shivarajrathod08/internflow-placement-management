import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Document, VerificationStatus, ApiResponse, PageResponse } from '../../types';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import {
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
} from 'lucide-react';

export const DocumentVerifications: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Reject Modal
  const [rejectDoc, setRejectDoc] = useState<Document | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    fetchPendingDocs();
  }, [page]);

  const fetchPendingDocs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<ApiResponse<PageResponse<Document>>>(
        `/api/documents/admin/pending?page=${page}&size=10`
      );
      if (res.data.success) {
        setDocuments(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
        setTotalElements(res.data.data.totalElements);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load document verification queue.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (doc: Document, status: VerificationStatus, reason?: string) => {
    try {
      setSubmittingAction(true);
      setError(null);
      const res = await apiClient.post(`/api/documents/admin/${doc.id}/verify`, {
        status,
        rejectionReason: reason,
      });

      if (res.data.success) {
        setSuccess(`Document ${doc.fileName} (${doc.documentType}) marked as ${status}.`);
        setRejectDoc(null);
        setRejectionReason('');
        fetchPendingDocs();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify document.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await apiClient.get(`/api/documents/${doc.id}/download`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: doc.mimeType || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Unable to download file.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Document Verification Queue</h1>
          <p className="text-gray-500 text-sm mt-1">
            Review and officially authenticate offer letters, joining reports, and completion certificates.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">No documents awaiting verification</h3>
          <p className="text-gray-500 text-sm mt-1">
            All student submitted certificates, joining slips, and offer letters have been evaluated.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-base text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    {doc.studentName}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {doc.documentType.replace('_', ' ')}
                  </span>
                  <Badge status={doc.verificationStatus} />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                  <span className="font-medium text-gray-900 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    {doc.fileName}
                  </span>
                  <span>{formatFileSize(doc.fileSize)}</span>
                  <span>Uploaded {new Date(doc.uploadedAt).toLocaleString()}</span>
                  {doc.internshipTitle && (
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                      Role: {doc.internshipTitle}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleDownload(doc)}
                  className="px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download / View
                </button>

                <button
                  onClick={() => handleVerify(doc, 'VERIFIED')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Verify & Approve
                </button>

                <button
                  onClick={() => {
                    setRejectDoc(doc);
                    setRejectionReason('Document illegible or missing official corporate seal/signature.');
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="py-3 px-6 bg-white rounded-2xl border border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing page {page + 1} of {totalPages} ({totalElements} total documents)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="p-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectDoc}
        onClose={() => setRejectDoc(null)}
        title={`Reject Document: ${rejectDoc?.fileName}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rejection Reason for Student <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="State what needs correction (e.g. invalid signature, wrong company letterhead, blurry scan)..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setRejectDoc(null)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submittingAction || !rejectionReason.trim()}
              onClick={() => rejectDoc && handleVerify(rejectDoc, 'REJECTED', rejectionReason)}
              className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-sm"
            >
              {submittingAction ? 'Processing...' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default DocumentVerifications;
