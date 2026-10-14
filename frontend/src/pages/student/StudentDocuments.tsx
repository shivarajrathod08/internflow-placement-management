import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/client';
import { Document, DocumentType, ApiResponse, Application, PageResponse } from '../../types';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { FileText, Upload, Download, CheckCircle2, AlertCircle, Clock, ShieldCheck, Plus, X } from 'lucide-react';

export const StudentDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Upload Form State
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('OFFER_LETTER');
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
    fetchApplications();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<ApiResponse<Document[]>>('/documents/student/me');
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await apiClient.get<ApiResponse<PageResponse<Application>>>('/applications/student/me?size=50');
      if (res.data.success) {
        setApplications(res.data.data.content);
      }
    } catch (err) {
      console.error('Failed to load applications for doc upload dropdown', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError('File exceeds the 10MB limit.');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose a file to upload.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', selectedDocType);
      if (selectedAppId) {
        formData.append('applicationId', selectedAppId);
      }

      const res = await apiClient.post<ApiResponse<Document>>('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setSuccessMsg('Document uploaded successfully and queued for admin verification!');
        setUploadModalOpen(false);
        setSelectedFile(null);
        setSelectedAppId('');
        fetchDocuments();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await apiClient.get(`/documents/${doc.id}/download`, {
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
      setError('Unable to download file. You might lack permissions or the file is missing.');
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
          <h1 className="text-2xl font-bold text-gray-900">Internship Document Center</h1>
          <p className="text-gray-500 text-sm mt-1">
            Upload and track verification of Offer Letters, Joining Reports, and Completion Certificates.
          </p>
        </div>
        <button
          onClick={() => {
            setError(null);
            setSuccessMsg(null);
            setUploadModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)}>
            <X className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 animate-pulse h-28" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No documents uploaded yet</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
            Once you receive an offer or join an internship, upload your official paperwork here to obtain college credit and verification.
          </p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Your First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => {
            const isVerified = doc.verificationStatus === 'VERIFIED';
            const isRejected = doc.verificationStatus === 'REJECTED';
            const isPending = doc.verificationStatus === 'PENDING';

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{doc.fileName}</h4>
                        <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded">
                          {doc.documentType.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <Badge status={doc.verificationStatus} />
                  </div>

                  {doc.internshipTitle && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium text-gray-700">Associated Internship: </span>
                      {doc.internshipTitle}
                    </p>
                  )}

                  {isRejected && doc.rejectionReason && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                      <strong>Admin Rejection Note: </strong>
                      {doc.rejectionReason}
                    </div>
                  )}

                  {isVerified && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Verified by College Placement Office
                    </div>
                  )}

                  {isPending && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium">
                      <Clock className="w-4 h-4 text-amber-600" />
                      Awaiting Administrator Review
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {formatFileSize(doc.fileSize)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-medium py-1 px-2.5 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Document Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Internship Verification Document"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Category <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              required
            >
              <option value="OFFER_LETTER">Offer Letter (PDF)</option>
              <option value="JOINING_REPORT">Joining Report (PDF)</option>
              <option value="COMPLETION_CERTIFICATE">Completion Certificate (PDF)</option>
              <option value="EVALUATION_REPORT">Evaluation Report (PDF)</option>
              <option value="RESUME">Updated Resume (PDF)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Associated Internship / Application (Optional)
            </label>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="">-- Standalone / Not Linked --</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.internshipTitle} @ {app.companyName} ({app.currentStatus})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Linking this document to an active application helps the admin automatically advance your stage (e.g. from SELECTED to JOINED).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Attachment <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-500 cursor-pointer bg-gray-50 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              {selectedFile ? (
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-700">Click to browse or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX or PNG up to 10MB</p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all shadow-sm"
            >
              {uploading ? 'Uploading & Verifying...' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default StudentDocuments;
