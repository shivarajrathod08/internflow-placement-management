import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  DollarSign,
  Calendar,
  FileText,
  MapPin,
  AlertCircle,
  Plus,
  X,
  ExternalLink,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { offersApi } from '../../api/services';
import { Offer, OfferStatus, CreateOfferRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const OffersPage: React.FC = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Issue Offer modal for recruiter/company
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueForm, setIssueForm] = useState<CreateOfferRequest>({
    applicationId: 0,
    stipendOrSalary: 50000,
    designation: 'Software Development Engineer Intern',
    location: 'Bangalore, India',
    offerLetterUrl: '',
    joiningDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectOfferId, setRejectOfferId] = useState<number | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');

  const isStudent = user?.role === 'STUDENT';
  const isCompany = user?.role === 'COMPANY' || user?.role === 'RECRUITER';
  const isStaffOrAdmin =
    user?.role === 'ADMIN' || user?.role === 'TPO' || user?.role === 'FACULTY_COORDINATOR';

  useEffect(() => {
    loadOffers();
  }, [user]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      let res;
      if (isStudent) {
        res = await offersApi.getMyOffers();
      } else if (isCompany && user?.profileId) {
        res = await offersApi.getCompanyOffers(user.profileId);
      } else {
        res = await offersApi.getAllOffers();
      }

      if (res && res.success) {
        setOffers(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load offers.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (offerId: number, status: OfferStatus, remarks?: string) => {
    try {
      setError(null);
      const res = await offersApi.updateStatus(offerId, status, remarks);
      if (res.success) {
        setSuccessMsg(`Offer status successfully updated to ${status}`);
        setRejectModalOpen(false);
        setRejectionRemarks('');
        loadOffers();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update offer status.');
    }
  };

  const handleIssueOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const res = await offersApi.create(issueForm);
      if (res.success) {
        setSuccessMsg(`Offer extended to student successfully!`);
        setIssueModalOpen(false);
        loadOffers();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to issue offer.');
    }
  };

  const filteredOffers = offers.filter((o) => {
    if (filterStatus === 'ALL') return true;
    return o.status === filterStatus;
  });

  const getStatusBadge = (status: OfferStatus) => {
    switch (status) {
      case 'OFFERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> OFFERED
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" /> ACCEPTED
          </span>
        );
      case 'JOINED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <UserCheck className="w-3 h-3" /> JOINED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" /> DECLINED
          </span>
        );
      case 'REVOKED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            REVOKED
          </span>
        );
    }
  };

  // Staff KPI aggregations
  const totalOffersCount = offers.length;
  const acceptedOffersCount = offers.filter((o) => o.status === 'ACCEPTED' || o.status === 'JOINED').length;
  const joinedOffersCount = offers.filter((o) => o.status === 'JOINED').length;
  const acceptanceRate = totalOffersCount > 0 ? Math.round((acceptedOffersCount / totalOffersCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
              Placement & Internship Lifecycle
            </span>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
              Offers & Onboarding
            </span>
          </div>
          <h1 className="text-3xl font-extrabold">Offers & Joining Management</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            {isStudent
              ? 'Review official job offers, view stipends, access offer letters, and confirm your joining commitment.'
              : isCompany
              ? 'Extend formal offers to selected candidates, track student acceptance, and coordinate onboarding dates.'
              : 'Institutional repository of all candidate offers, student responses, and confirmed placements.'}
          </p>
        </div>

        {isCompany && (
          <button
            onClick={() => setIssueModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            Issue Formal Offer
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Staff KPI Statistics Cards */}
      {isStaffOrAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Total Offers Extended</span>
              <Award className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-gray-900 mt-2">{totalOffersCount}</div>
            <span className="text-[11px] text-gray-400">Across all registered drives</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Accepted Offers</span>
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-950 mt-2">{acceptedOffersCount}</div>
            <span className="text-[11px] text-emerald-600 font-medium">Offers confirmed by students</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Joined Students</span>
              <UserCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-950 mt-2">{joinedOffersCount}</div>
            <span className="text-[11px] text-indigo-600 font-medium">Active at company sites</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Offer Acceptance Rate</span>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-950 mt-2">{acceptanceRate}%</div>
            <span className="text-[11px] text-purple-600 font-medium">Student conversion ratio</span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          {['ALL', 'OFFERED', 'ACCEPTED', 'JOINED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Showing {filteredOffers.length} of {offers.length} offer records
        </div>
      </div>

      {/* Offers Cards / Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4">
          <Award className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-900 text-lg">No offers found</h3>
          <p className="text-gray-500 text-xs max-w-md mx-auto">
            {isStudent
              ? 'When companies select your application and extend an offer, it will appear here for review and acceptance.'
              : 'No candidate offers match the selected status filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-700">{offer.companyName}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mt-1">
                      {offer.designation || offer.internshipTitle}
                    </h3>
                  </div>
                  {getStatusBadge(offer.status)}
                </div>

                {/* Candidate details (for recruiters / TPO) */}
                {!isStudent && (
                  <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
                    <div className="font-bold text-slate-800">
                      Candidate: {offer.studentName}{' '}
                      {offer.studentRollNumber && (
                        <span className="text-gray-500 font-normal">({offer.studentRollNumber})</span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {offer.studentBranch || 'Branch N/A'} • {offer.studentEmail}
                    </div>
                  </div>
                )}

                {/* Offer Details Grid */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/60 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Compensation / CTC</span>
                    <span className="font-bold text-indigo-950">
                      ₹{offer.stipendOrSalary?.toLocaleString() ?? '50,000'} /mo
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Location</span>
                    <span className="font-bold text-gray-800 truncate block">
                      {offer.location || 'Bangalore'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Joining Date</span>
                    <span className="font-bold text-gray-800 truncate block">
                      {offer.joiningDate || 'Immediate'}
                    </span>
                  </div>
                </div>

                {offer.offerLetterUrl && (
                  <a
                    href={offer.offerLetterUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Download Official Offer Letter (.pdf)
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {offer.studentRemarks && (
                  <div className="text-[11px] p-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-800">
                    <span className="font-semibold">Candidate Note: </span>
                    {offer.studentRemarks}
                  </div>
                )}
              </div>

              {/* Action Buttons for Students */}
              {isStudent && offer.status === 'OFFERED' && (
                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setRejectOfferId(offer.id);
                      setRejectModalOpen(true);
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(offer.id, 'ACCEPTED')}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all"
                  >
                    Accept Offer
                  </button>
                </div>
              )}

              {isStudent && offer.status === 'ACCEPTED' && (
                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Offer Accepted
                  </span>
                  <button
                    onClick={() => handleUpdateStatus(offer.id, 'JOINED')}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all"
                  >
                    Confirm Day 1 Joining
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Decline Offer Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-base">Decline Employment Offer</h3>
            <p className="text-xs text-gray-500">
              Are you sure you wish to decline this offer? Please provide feedback or reason for the company and placement cell records.
            </p>
            <textarea
              rows={3}
              value={rejectionRemarks}
              onChange={(e) => setRejectionRemarks(e.target.value)}
              placeholder="e.g. Accepted higher package offer / Pursuing higher studies..."
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => rejectOfferId && handleUpdateStatus(rejectOfferId, 'REJECTED', rejectionRemarks)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Formal Offer Modal (for Company) */}
      {issueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Issue Formal Candidate Offer
              </h3>
              <button
                onClick={() => setIssueModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Application ID *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Application ID from pipeline"
                  value={issueForm.applicationId || ''}
                  onChange={(e) =>
                    setIssueForm({ ...issueForm, applicationId: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Designation *</label>
                <input
                  type="text"
                  required
                  value={issueForm.designation}
                  onChange={(e) => setIssueForm({ ...issueForm, designation: e.target.value })}
                  placeholder="e.g. Associate Software Engineer / Frontend Intern"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Compensation / Monthly Stipend (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={issueForm.stipendOrSalary}
                    onChange={(e) =>
                      setIssueForm({
                        ...issueForm,
                        stipendOrSalary: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={issueForm.location}
                    onChange={(e) => setIssueForm({ ...issueForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={issueForm.joiningDate}
                    onChange={(e) => setIssueForm({ ...issueForm, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Offer Letter Document URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://.../offer-letter.pdf"
                    value={issueForm.offerLetterUrl || ''}
                    onChange={(e) => setIssueForm({ ...issueForm, offerLetterUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIssueModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md"
                >
                  Dispatch Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default OffersPage;
