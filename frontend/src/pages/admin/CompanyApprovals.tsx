import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { CompanyProfile, CompanyVerificationStatus, ApiResponse, PageResponse } from '../../types';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import {
  Building2,
  Globe,
  MapPin,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const CompanyApprovals: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Action Modal
  const [selectedCompany, setSelectedCompany] = useState<CompanyProfile | null>(null);
  const [actionStatus, setActionStatus] = useState<CompanyVerificationStatus>('APPROVED');
  const [actionNotes, setActionNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [page, statusFilter]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = statusFilter === 'PENDING' ? '/company/admin/pending' : '/company/admin/all';
      const res = await apiClient.get<ApiResponse<PageResponse<CompanyProfile>>>(
        `${endpoint}?page=${page}&size=10`
      );

      if (res.data.success) {
        let content = res.data.data.content;
        if (statusFilter !== 'ALL' && statusFilter !== 'PENDING') {
          content = content.filter((c) => c.verificationStatus === statusFilter);
        }
        if (searchQuery.trim()) {
          content = content.filter(
            (c) =>
              c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (c.industry && c.industry.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }
        setCompanies(content);
        setTotalPages(res.data.data.totalPages);
        setTotalElements(res.data.data.totalElements);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load company verification queue.');
    } finally {
      setLoading(false);
    }
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    try {
      setSubmittingAction(true);
      setError(null);

      const res = await apiClient.post(`/company/admin/${selectedCompany.id}/verify`, {
        status: actionStatus,
        notes: actionNotes,
      });

      if (res.data.success) {
        setSuccess(`Company ${selectedCompany.companyName} status updated to ${actionStatus}.`);
        setSelectedCompany(null);
        setActionNotes('');
        fetchCompanies();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update company verification status.');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company KYC Verification</h1>
          <p className="text-gray-500 text-sm mt-1">
            Review corporate recruiter credentials, audit corporate domains, and grant placement access.
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
            placeholder="Search company name, domain, industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCompanies()}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
          >
          </input>
        </div>

        <div className="flex items-center gap-2">
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(0);
              }}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">No companies found in this view</h3>
          <p className="text-gray-500 text-sm mt-1">All registrations in this category have been processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {companies.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-lg text-gray-900">{c.companyName}</span>
                  <Badge status={c.verificationStatus} />
                  <span className="text-xs text-gray-400">Registered: {new Date(c.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                  <span className="font-medium text-gray-800">{c.email}</span>
                  {c.website && (
                    <a
                      href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      {c.website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {c.industry && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                      {c.industry}
                    </span>
                  )}
                  {c.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {c.location}
                    </span>
                  )}
                </div>

                {c.description && <p className="text-xs text-gray-600 line-clamp-2">{c.description}</p>}

                {c.rejectionReason && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                    <strong>Admin Reason / Note: </strong>
                    {c.rejectionReason}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setSelectedCompany(c);
                    setActionStatus('APPROVED');
                    setActionNotes('Corporate credentials verified and approved for on-campus & virtual placement drives.');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
                >
                  Approve KYC
                </button>

                <button
                  onClick={() => {
                    setSelectedCompany(c);
                    setActionStatus('REJECTED');
                    setActionNotes('Official corporate domain could not be verified.');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors"
                >
                  Reject
                </button>

                {c.verificationStatus === 'APPROVED' && (
                  <button
                    onClick={() => {
                      setSelectedCompany(c);
                      setActionStatus('SUSPENDED');
                      setActionNotes('Temporarily suspended pending inquiry.');
                    }}
                    className="px-3 py-2 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors"
                  >
                    Suspend
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="py-3 px-6 bg-white rounded-2xl border border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing page {page + 1} of {totalPages} ({totalElements} companies)
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

      {/* Action Modal */}
      <Modal
        isOpen={!!selectedCompany}
        onClose={() => setSelectedCompany(null)}
        title={`Update Verification: ${selectedCompany?.companyName}`}
      >
        <form onSubmit={handleActionSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Decision <span className="text-red-500">*</span>
            </label>
            <select
              value={actionStatus}
              onChange={(e) => setActionStatus(e.target.value as CompanyVerificationStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
            >
              <option value="APPROVED">APPROVED (Enable full posting & recruiting privileges)</option>
              <option value="REJECTED">REJECTED (Decline corporate registration)</option>
              <option value="SUSPENDED">SUSPENDED (Temporarily halt candidate access)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Notes / Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="Provide context or instructions visible to the recruiter..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setSelectedCompany(null)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingAction}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm"
            >
              {submittingAction ? 'Processing...' : 'Confirm Decision'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default CompanyApprovals;
