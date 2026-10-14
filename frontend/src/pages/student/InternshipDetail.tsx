import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Send,
  Lock,
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Internship, MatchResult, ApiResponse, Application, EligibilityEvaluationResult } from '../../types';
import { internshipsApi } from '../../api/services';
import { MatchBadge } from '../../components/common/MatchBadge';
import { StatusBadge } from '../../components/common/Badge';

export const InternshipDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [internship, setInternship] = useState<Internship | null>(null);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityEvaluationResult | null>(null);
  const [coverNote, setCoverNote] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [internRes, matchRes, myAppsRes, eligRes] = await Promise.allSettled([
          api.get<ApiResponse<Internship>>(`/internships/public/${id}`),
          api.get<ApiResponse<MatchResult>>(`/students/me/matches/${id}`),
          api.get<ApiResponse<{ content: Application[] }>>('/applications/student/me?size=100'),
          internshipsApi.getEligibility(Number(id)),
        ]);

        if (internRes.status === 'fulfilled' && internRes.value.data.success) {
          setInternship(internRes.value.data.data);
        }
        if (matchRes.status === 'fulfilled' && matchRes.value.data.success) {
          setMatch(matchRes.value.data.data);
        }
        if (myAppsRes.status === 'fulfilled' && myAppsRes.value.data.success) {
          const applied = myAppsRes.value.data.data.content?.some(
            (app) => app.internshipId === Number(id)
          );
          setHasApplied(applied);
        }
        if (eligRes.status === 'fulfilled' && eligRes.value.success) {
          setEligibility(eligRes.value.data);
        }
      } catch (err: any) {
        console.error('Failed to load internship details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await api.post(`/applications/internships/${id}/apply`, {
        coverNote,
      });
      if (res.data.success) {
        setSuccessMsg('Application submitted successfully!');
        setHasApplied(true);
        setTimeout(() => navigate('/student/applications'), 2000);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold">Loading opportunity details...</p>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-800">Internship posting not found</h2>
        <Link to="/student/internships" className="text-xs font-bold text-brand-600 mt-2 inline-block">
          Return to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <Link
        to="/student/internships"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all internships</span>
      </Link>

      {/* Main Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-slate-500">{internship.companyName}</span>
              <StatusBadge status={internship.workMode} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {internship.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <MatchBadge score={match?.matchScore || 85} internshipId={internship.id} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Stipend</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
              ${internship.stipendPerMonth} / month
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Duration</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
              {internship.durationMonths} Months
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Location</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
              {internship.location || 'Remote'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Openings</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
              {internship.openings} Positions
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Description & Application Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">About the Position</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {internship.description}
            </p>
          </div>

          {/* Skills Required */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Technical Skill Stack</h2>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-2">Required Core Competencies:</p>
              <div className="flex flex-wrap gap-2">
                {internship.requiredSkills.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-xl bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200/60">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {internship.preferredSkills.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2">Bonus / Preferred Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {internship.preferredSkills.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Academic Eligibility */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Academic Eligibility Criteria
              </h2>
              {eligibility && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    eligibility.status === 'ELIGIBLE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : eligibility.status === 'CONDITIONAL'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {eligibility.status === 'ELIGIBLE' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  {eligibility.status} FOR OPPORTUNITY
                </span>
              )}
            </div>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      eligibility?.cgpaSatisfied !== false ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  />
                  <span>Minimum CGPA Requirement:</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {internship.minCgpa}
                </span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      eligibility?.branchMatched !== false ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  />
                  <span>Allowed Branches:</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {internship.allowedBranches || 'All Branches'}
                </span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      eligibility?.backlogsSatisfied !== false ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  />
                  <span>Max Allowed Active Backlogs:</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {internship.maxBacklogs ?? 0}
                </span>
              </li>
              {internship.graduationYear && (
                <li className="flex items-center justify-between py-1">
                  <span className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        eligibility?.graduationYearMatched !== false
                          ? 'text-emerald-600'
                          : 'text-rose-500'
                      }`}
                    />
                    <span>Target Batch:</span>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Class of {internship.graduationYear}
                  </span>
                </li>
              )}
            </ul>

            {eligibility && eligibility.reasons.length > 0 && (
              <div
                className={`p-3 rounded-xl text-xs space-y-1 ${
                  eligibility.eligible
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                    : 'bg-rose-50 text-rose-800 border border-rose-100'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Deterministic Eligibility Engine Audit:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {eligibility.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Apply Widget */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Submit Application</h3>

            {hasApplied ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Application Active
                </p>
                <p>You have already applied to this position. Track its live progress in your dashboard.</p>
                <Link
                  to="/student/applications"
                  className="inline-block mt-2 font-bold text-brand-600 hover:underline"
                >
                  View My Applications →
                </Link>
              </div>
            ) : match && !match.eligible ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Ineligible to Apply
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {match.eligibilityNotes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    {successMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Cover Note (Optional)</label>
                  <textarea
                    rows={4}
                    placeholder="Highlight your technical strengths, relevant coursework, and why you are interested in this position..."
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Confirm & Submit Application</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
