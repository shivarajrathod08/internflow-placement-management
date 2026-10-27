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
  CheckCircle2,
} from 'lucide-react';
import { offersApi } from '../../api/services';
import { Offer, OfferStatus, CreateOfferRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';

// Indian currency formatter: ₹1,20,000/month
export const formatCurrencyINR = (amount?: number | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹50,000/month';
  }
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted}/month`;
};

// Date formatter: e.g. 2026-12-20T23:34:34.647276 -> 20 Dec 2026
export const formatDate = (dateStr?: string | null, fallback = 'Immediate'): string => {
  if (!dateStr) return fallback;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

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
        const readableStatus = status === 'JOINED' ? 'Day 1 Joining Confirmed' : status;
        setSuccessMsg(`Offer status successfully updated: ${readableStatus}`);
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
        setSuccessMsg(`Formal offer extended to candidate successfully!`);
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
    if (filterStatus === 'DECLINED') {
      return o.status === 'DECLINED' || o.status === 'REJECTED';
    }
    return o.status === filterStatus;
  });

  const getStatusBadge = (status: OfferStatus) => {
    switch (status) {
      case 'OFFERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
            <Clock className="w-3.5 h-3.5" /> OFFERED
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
            <CheckCircle className="w-3.5 h-3.5" /> ACCEPTED
          </span>
        );
      case 'JOINED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E0E7FF] text-[#4338CA] border border-[#C7D2FE]">
            <UserCheck className="w-3.5 h-3.5" /> JOINED
          </span>
        );
      case 'DECLINED':
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]">
            <XCircle className="w-3.5 h-3.5" /> DECLINED
          </span>
        );
      case 'REVOKED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
            <AlertCircle className="w-3.5 h-3.5" /> REVOKED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  // Staff KPI aggregations
  const totalOffersCount = offers.length;
  const acceptedOffersCount = offers.filter(
    (o) => o.status === 'ACCEPTED' || o.status === 'JOINED'
  ).length;
  const joinedOffersCount = offers.filter((o) => o.status === 'JOINED').length;
  const acceptanceRate =
    totalOffersCount > 0 ? Math.round((acceptedOffersCount / totalOffersCount) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Campus Ledger Warm Editorial Header */}
      <div className="relative rounded-2xl bg-[#FFFCF7] border border-[#E5DED2] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#786E5E]">
              Placement & Internship Lifecycle
            </span>
            <span className="bg-[#E5DCCB] text-[#192844] border border-[#D8CEBC] text-[11px] px-2.5 py-0.5 rounded-full font-bold">
              Offers & Onboarding
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#192844] tracking-tight">
            Offers & Joining Management
          </h1>
          <p className="text-[#475569] text-sm mt-1 max-w-xl">
            {isStudent
              ? 'Review official job offers, view stipends, access offer letters, and confirm your joining commitment.'
              : isCompany
              ? 'Extend formal offers to selected candidates, track student acceptance, and coordinate onboarding dates.'
              : 'Institutional repository of all candidate offers, student responses, and confirmed placements.'}
          </p>
        </div>

        {isCompany && (
          <button
            onClick={() => {
              setError(null);
              setIssueModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#4F46E5] hover:bg-[#4338CA] transition-all shadow-md active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Issue Formal Offer
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] rounded-xl text-sm flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#15803D]" />
            <span className="font-medium">{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-[#15803D] hover:text-[#166534] p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] rounded-xl text-sm flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#B91C1C]" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-[#B91C1C] hover:text-[#991B1B] p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Staff KPI Statistics Cards */}
      {isStaffOrAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FFFCF7] p-5 rounded-2xl border border-[#E5DED2] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#786E5E] uppercase tracking-wider">
                Total Offers Extended
              </span>
              <Award className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <div className="text-2xl font-black text-[#192844] mt-2">{totalOffersCount}</div>
            <span className="text-[11px] text-[#64748B]">Across all registered drives</span>
          </div>

          <div className="bg-[#FFFCF7] p-5 rounded-2xl border border-[#E5DED2] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#786E5E] uppercase tracking-wider">
                Accepted Offers
              </span>
              <CheckCircle className="w-5 h-5 text-[#15803D]" />
            </div>
            <div className="text-2xl font-black text-[#15803D] mt-2">{acceptedOffersCount}</div>
            <span className="text-[11px] text-[#15803D] font-medium">Offers confirmed by students</span>
          </div>

          <div className="bg-[#FFFCF7] p-5 rounded-2xl border border-[#E5DED2] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#786E5E] uppercase tracking-wider">
                Joined Students
              </span>
              <UserCheck className="w-5 h-5 text-[#4338CA]" />
            </div>
            <div className="text-2xl font-black text-[#192844] mt-2">{joinedOffersCount}</div>
            <span className="text-[11px] text-[#4338CA] font-medium">Active at company sites</span>
          </div>

          <div className="bg-[#FFFCF7] p-5 rounded-2xl border border-[#E5DED2] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#786E5E] uppercase tracking-wider">
                Acceptance Rate
              </span>
              <TrendingUp className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div className="text-2xl font-black text-[#192844] mt-2">{acceptanceRate}%</div>
            <span className="text-[11px] text-[#7C3AED] font-medium">Student conversion ratio</span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5DED2] pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'OFFERED', 'ACCEPTED', 'JOINED', 'DECLINED'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setError(null);
                setFilterStatus(st);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === st
                  ? 'bg-[#192844] text-[#FFFCF7] shadow-sm'
                  : 'bg-[#FFFCF7] text-[#475569] hover:bg-[#EAE3D6]/60 border border-[#E5DED2]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <div className="text-xs text-[#786E5E] font-medium">
          Showing {filteredOffers.length} of {offers.length} offer records
        </div>
      </div>

      {/* Offers Cards / Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 bg-[#FFFCF7] rounded-2xl border border-[#E5DED2] animate-pulse"
            />
          ))}
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="bg-[#FFFCF7] rounded-2xl border border-[#E5DED2] p-12 text-center space-y-4">
          <Award className="w-12 h-12 text-[#A89F91] mx-auto" />
          <h3 className="font-bold text-[#192844] text-lg">No offers found</h3>
          <p className="text-[#64748B] text-xs max-w-md mx-auto">
            {isStudent
              ? 'When companies select your application and extend an offer, it will appear here for review and acceptance.'
              : 'No candidate offers match the selected status filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOffers.map((offer) => {
            const isOfferDeclined = offer.status === 'DECLINED' || offer.status === 'REJECTED';
            const isOfferAccepted = offer.status === 'ACCEPTED';
            const isOfferOffered = offer.status === 'OFFERED';
            const isOfferJoined = offer.status === 'JOINED';

            return (
              <div
                key={offer.id}
                className="bg-[#FFFCF7] rounded-2xl border border-[#E5DED2] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#786E5E]" />
                        <span className="text-xs font-bold text-[#786E5E] uppercase tracking-wider">
                          {offer.companyName}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#192844] mt-1">
                        {offer.designation || offer.internshipTitle}
                      </h3>
                    </div>
                    {getStatusBadge(offer.status)}
                  </div>

                  {/* Candidate details (for recruiters / TPO) */}
                  {!isStudent && (
                    <div className="p-3 bg-[#F7F4EE] rounded-xl text-xs space-y-1 border border-[#E5DED2]">
                      <div className="font-bold text-[#192844]">
                        Candidate: {offer.studentName}{' '}
                        {offer.studentRollNumber && (
                          <span className="text-[#64748B] font-normal">
                            ({offer.studentRollNumber})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {offer.studentBranch || 'Branch N/A'} • {offer.studentEmail}
                      </div>
                    </div>
                  )}

                  {/* Offer Details Grid */}
                  <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-[#F7F4EE] rounded-xl border border-[#E5DED2] text-xs">
                    <div>
                      <span className="text-[#786E5E] block text-[10px] font-bold uppercase tracking-wider">
                        Compensation
                      </span>
                      <span className="font-extrabold text-[#192844]">
                        {formatCurrencyINR(offer.stipendOrSalary)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#786E5E] block text-[10px] font-bold uppercase tracking-wider">
                        Location
                      </span>
                      <span className="font-bold text-[#192844] truncate block">
                        {offer.location || 'Bangalore, India'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#786E5E] block text-[10px] font-bold uppercase tracking-wider">
                        Joining Date
                      </span>
                      <span className="font-bold text-[#192844] truncate block">
                        {formatDate(offer.joiningDate)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#786E5E] pt-1">
                    <span>
                      Offered on: <strong className="text-[#192844]">{formatDate(offer.offeredAt)}</strong>
                    </span>
                    {offer.offerLetterUrl && (
                      <a
                        href={offer.offerLetterUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-bold text-[#4F46E5] hover:text-[#3730A3]"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Offer Letter (.pdf)
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {offer.studentRemarks && (
                    <div className="text-[11px] p-2.5 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-[#B91C1C]">
                      <span className="font-bold">Candidate Feedback: </span>
                      {offer.studentRemarks}
                    </div>
                  )}
                </div>

                {/* State-aware Actions for Students */}
                {isStudent && (
                  <div className="pt-4 mt-4 border-t border-[#E5DED2] flex items-center justify-between">
                    {isOfferOffered && (
                      <>
                        <span className="text-xs text-[#786E5E] font-medium">
                          Response awaiting your decision
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setError(null);
                              setRejectOfferId(offer.id);
                              setRejectModalOpen(true);
                            }}
                            className="px-3.5 py-2 text-xs font-bold text-[#B91C1C] bg-[#FEE2E2] hover:bg-[#FECACA] border border-[#FCA5A5] rounded-xl transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(offer.id, 'ACCEPTED')}
                            className="px-4 py-2 text-xs font-bold text-white bg-[#15803D] hover:bg-[#166534] rounded-xl shadow-md transition-all active:scale-95"
                          >
                            Accept Offer
                          </button>
                        </div>
                      </>
                    )}

                    {isOfferAccepted && (
                      <>
                        <span className="text-xs text-[#15803D] font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-[#15803D]" />
                          Offer Accepted
                        </span>
                        <button
                          onClick={() => handleUpdateStatus(offer.id, 'JOINED')}
                          className="px-4 py-2 text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl shadow-md transition-all active:scale-95"
                        >
                          Confirm Day 1 Joining
                        </button>
                      </>
                    )}

                    {isOfferJoined && (
                      <div className="w-full flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#E0E7FF] text-[#4338CA] border border-[#C7D2FE]">
                          <UserCheck className="w-4 h-4" /> Day 1 Joining Confirmed
                        </span>
                        <span className="text-xs text-[#64748B] font-medium">
                          Joining: {formatDate(offer.joiningDate)}
                        </span>
                      </div>
                    )}

                    {isOfferDeclined && (
                      <div className="w-full flex items-center justify-between text-xs text-[#B91C1C]">
                        <span className="font-semibold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Offer was declined
                        </span>
                        <span className="text-[11px] text-[#64748B]">No further response required</span>
                      </div>
                    )}

                    {offer.status === 'REVOKED' && (
                      <div className="w-full flex items-center justify-between text-xs text-[#64748B]">
                        <span className="font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Offer revoked by employer
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* State-aware Actions for Recruiters / Company */}
                {isCompany && (
                  <div className="pt-4 mt-4 border-t border-[#E5DED2] flex items-center justify-between">
                    <span className="text-xs text-[#786E5E]">
                      Status: <strong className="text-[#192844]">{offer.status}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      {isOfferAccepted && (
                        <button
                          onClick={() => handleUpdateStatus(offer.id, 'JOINED')}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#4338CA] hover:bg-[#3730A3] rounded-xl shadow-sm transition-all active:scale-95"
                        >
                          Mark as Joined
                        </button>
                      )}
                      {(isOfferOffered || isOfferAccepted) && (
                        <button
                          onClick={() => handleUpdateStatus(offer.id, 'REVOKED')}
                          className="px-3 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#B91C1C] hover:bg-[#FEE2E2]/60 rounded-xl transition-colors"
                        >
                          Revoke Offer
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Decline Offer Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FFFCF7] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E5DED2] space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E5DED2] pb-3">
              <h3 className="font-bold text-[#192844] text-base">Decline Employment Offer</h3>
              <button
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectionRemarks('');
                }}
                className="text-[#64748B] hover:text-[#192844] hover:bg-[#EAE3D6]/70 p-1.5 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#475569]">
              Are you sure you wish to decline this offer? Please provide feedback or reason for the company and placement cell records.
            </p>
            <textarea
              rows={3}
              value={rejectionRemarks}
              onChange={(e) => setRejectionRemarks(e.target.value)}
              placeholder="e.g. Accepted higher package offer / Pursuing higher studies..."
              className="w-full px-3.5 py-2.5 text-xs font-medium text-black bg-white border border-[#CBD5E1] rounded-xl placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#B91C1C] focus:border-[#B91C1C] focus:outline-none transition-colors"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectionRemarks('');
                }}
                className="px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#EAE3D6] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  rejectOfferId && handleUpdateStatus(rejectOfferId, 'DECLINED', rejectionRemarks)
                }
                className="px-4 py-2 text-xs font-bold text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-xl shadow-md transition-all active:scale-95"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Formal Offer Modal (for Company) */}
      {issueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FFFCF7] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E5DED2] space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E5DED2] pb-3">
              <h3 className="font-bold text-[#192844] text-lg flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E0E7FF] border border-[#C7D2FE] flex items-center justify-center text-[#4338CA]">
                  <Award className="w-5 h-5" />
                </div>
                Issue Formal Candidate Offer
              </h3>
              <button
                onClick={() => setIssueModalOpen(false)}
                className="text-[#64748B] hover:text-[#192844] hover:bg-[#EAE3D6]/70 p-1.5 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#192844] mb-1.5">
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
                  className="w-full px-3.5 py-2.5 text-xs font-medium text-black bg-white border border-[#CBD5E1] rounded-xl placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#192844] mb-1.5">
                  Designation *
                </label>
                <input
                  type="text"
                  required
                  value={issueForm.designation}
                  onChange={(e) => setIssueForm({ ...issueForm, designation: e.target.value })}
                  placeholder="e.g. Associate Software Engineer / Frontend Intern"
                  className="w-full px-3.5 py-2.5 text-xs font-medium text-black bg-white border border-[#CBD5E1] rounded-xl placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#192844] mb-1.5">
                    Monthly Compensation (₹) *
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
                    className="w-full px-3.5 py-2.5 text-xs font-medium text-black bg-white border border-[#CBD5E1] rounded-xl placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#192844] mb-1.5">Location</label>
                  <input
                    type="text"
                    value={issueForm.location}
                    onChange={(e) => setIssueForm({ ...issueForm, location: e.target.value })}
                    placeholder="e.g. Bangalore, India"
                    className="w-full px-3.5 py-2.5 text-xs font-medium text-black bg-white border border-[#CBD5E1] rounded-xl placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#192844] mb-1.5">
                    Joining Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={issueForm.joiningDate}
                    onChange={(e) => setIssueForm({ ...issueForm, joiningDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-medium text-black bg-white border border-[#CBD5E1] rounded-xl placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#192844] mb-1.5">
                    Offer Letter Document URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://.../offer-letter.pdf"
                    value={issueForm.offerLetterUrl || ''}
                    onChange={(e) => setIssueForm({ ...issueForm, offerLetterUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-medium text-black bg-white border border-[#CBD5E1] rounded-xl placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIssueModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#EAE3D6] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl shadow-md transition-all active:scale-95"
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
