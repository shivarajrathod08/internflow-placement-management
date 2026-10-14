import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Internship, ApiResponse, PageResponse } from '../../types';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import {
  Briefcase,
  Building2,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';

export const InternshipApprovals: React.FC = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter & Pagination
  const [filterMode, setFilterMode] = useState<'PENDING' | 'ALL'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Reject Modal
  const [rejectItem, setRejectItem] = useState<Internship | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  useEffect(() => {
    fetchInternships();
  }, [page, filterMode]);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = filterMode === 'PENDING' ? '/api/internships/admin/pending' : '/api/internships/admin/all';
      const res = await apiClient.get<ApiResponse<PageResponse<Internship>>>(
        `${endpoint}?page=${page}&size=10`
      );

      if (res.data.success) {
        let content = res.data.data.content;
        if (searchQuery.trim()) {
          content = content.filter(
            (i) =>
              i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              i.companyName.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setInternships(content);
        setTotalPages(res.data.data.totalPages);
        setTotalElements(res.data.data.totalElements);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load internship approvals queue.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (internship: Internship) => {
    try {
      setError(null);
      const res = await apiClient.post(`/api/internships/admin/${internship.id}/approve`, {
        approved: true,
      });
      if (res.data.success) {
        setSuccess(`Internship "${internship.title}" approved and published to students.`);
        fetchInternships();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve internship.');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectItem) return;

    try {
      setSubmittingReject(true);
      setError(null);

      const res = await apiClient.post(`/api/internships/admin/${rejectItem.id}/approve`, {
        approved: false,
        rejectionReason,
      });

      if (res.data.success) {
        setSuccess(`Internship "${rejectItem.title}" rejected.`);
        setRejectItem(null);
        setRejectionReason('');
        fetchInternships();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject internship.');
    } finally {
      setSubmittingReject(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Internship Posting Approvals</h1>
          <p className="text-gray-500 text-sm mt-1">
            Vet recruiter compensation, student eligibility thresholds, and skill requirements before publishing.
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

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search role title, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchInternships()}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFilterMode('PENDING');
              setPage(0);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              filterMode === 'PENDING'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Awaiting Approval
          </button>
          <button
            onClick={() => {
              setFilterMode('ALL');
              setPage(0);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              filterMode === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Postings
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : internships.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">No postings in this queue</h3>
          <p className="text-gray-500 text-sm mt-1">All submitted roles have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {internships.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-lg text-gray-900">{item.title}</span>
                  <Badge status={item.status} />
                  <span className="text-xs text-gray-400">Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                  <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    {item.companyName}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    ₹{item.stipendPerMonth.toLocaleString()} / month
                  </span>
                  <span>{item.durationMonths} Months</span>
                  <span className="capitalize bg-gray-100 px-2 py-0.5 rounded">
                    {item.workMode.replace('_', ' ').toLowerCase()}
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                    Min CGPA: {item.minCgpa}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    Deadline: {new Date(item.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>

                {/* Skills Preview */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs text-gray-400 font-medium mr-1">Skills:</span>
                  {item.requiredSkills?.map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-semibold rounded">
                      {s}
                    </span>
                  ))}
                  {item.preferredSkills?.map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] rounded">
                      {s}
                    </span>
                  ))}
                </div>

                {item.rejectionReason && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                    <strong>Admin Rejection Reason: </strong>
                    {item.rejectionReason}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.status === 'PENDING_APPROVAL' && (
                  <>
                    <button
                      onClick={() => handleApprove(item)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Publish
                    </button>

                    <button
                      onClick={() => {
                        setRejectItem(item);
                        setRejectionReason('Stipend or duration does not conform to university placement guidelines.');
                      }}
                      className="px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="py-3 px-6 bg-white rounded-2xl border border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing page {page + 1} of {totalPages} ({totalElements} postings)
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
        isOpen={!!rejectItem}
        onClose={() => setRejectItem(null)}
        title={`Reject Internship Posting: ${rejectItem?.title}`}
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Declining Posting <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="State clear reasons such as non-compliant compensation, inappropriate duration, or lack of role details..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setRejectItem(null)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReject}
              className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-sm"
            >
              {submittingReject ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default InternshipApprovals;
