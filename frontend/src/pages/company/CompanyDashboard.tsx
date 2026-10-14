import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { CompanyAnalytics, CompanyProfile, Internship, Application, ApiResponse, PageResponse } from '../../types';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Plus,
  ArrowRight,
  Clock,
  ChevronRight,
  FileCheck2,
} from 'lucide-react';

export const CompanyDashboard: React.FC = () => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [analytics, setAnalytics] = useState<CompanyAnalytics | null>(null);
  const [postings, setPostings] = useState<Internship[]>([]);
  const [recentApplicants, setRecentApplicants] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, analyticsRes, postingsRes, applicantsRes] = await Promise.all([
        apiClient.get<ApiResponse<CompanyProfile>>('/api/company/profile'),
        apiClient.get<ApiResponse<CompanyAnalytics>>('/api/analytics/company'),
        apiClient.get<ApiResponse<PageResponse<Internship>>>('/api/internships/company?size=5'),
        apiClient.get<ApiResponse<PageResponse<Application>>>('/api/applications/company?size=5'),
      ]);

      if (profileRes.data.success) setProfile(profileRes.data.data);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
      if (postingsRes.data.success) setPostings(postingsRes.data.data.content);
      if (applicantsRes.data.success) setRecentApplicants(applicantsRes.data.data.content);
    } catch (err) {
      console.error('Error fetching company dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const isVerified = profile?.verificationStatus === 'APPROVED';
  const isPending = profile?.verificationStatus === 'PENDING';
  const isRejected = profile?.verificationStatus === 'REJECTED';

  return (
    <div className="space-y-6">
      {/* KYC Status Alert */}
      {!isVerified && (
        <div
          className={`p-5 rounded-2xl border flex items-start gap-4 ${
            isPending
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <AlertTriangle className={`w-6 h-6 flex-shrink-0 ${isPending ? 'text-amber-600' : 'text-red-600'}`} />
          <div className="flex-1">
            <h3 className="font-bold text-base">
              {isPending ? 'Company KYC Verification Pending' : 'Company Account Needs Attention'}
            </h3>
            <p className="text-sm mt-0.5 opacity-90">
              {isPending
                ? 'Your company profile is under review by college administrators. You can create internship drafts, which will be published once your account is verified.'
                : `Account verification was declined: ${profile?.rejectionReason || 'Please update your company profile and contact admin.'}`}
            </p>
          </div>
          <Link
            to="/company/profile"
            className="px-4 py-2 bg-white text-gray-800 text-xs font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm flex-shrink-0"
          >
            Review Profile
          </Link>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
              Recruiter Hub
            </span>
            {isVerified && (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                <FileCheck2 className="w-3 h-3" /> Verified Partner
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold">{profile?.companyName || 'Welcome back'}</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Manage your candidate pipelines, schedule technical rounds, and review explainable AI talent matches.
          </p>
        </div>

        <Link
          to="/company/post-internship"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-indigo-950 bg-white hover:bg-indigo-50 transition-all shadow-lg hover:scale-105"
        >
          <Plus className="w-4 h-4 text-indigo-600" />
          Post New Internship
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Postings"
          value={analytics?.publishedPostings ?? 0}
          icon={Briefcase}
          subtitle={`${analytics?.pendingPostings ?? 0} pending review`}
          color="indigo"
        />
        <StatCard
          title="Total Applicants"
          value={analytics?.totalApplicants ?? 0}
          icon={Users}
          subtitle={`${analytics?.shortlistedApplicants ?? 0} shortlisted`}
          color="blue"
        />
        <StatCard
          title="Interviewed"
          value={analytics?.interviewedApplicants ?? 0}
          icon={Calendar}
          subtitle={`${analytics?.shortlistConversionRate ?? 0}% shortlist rate`}
          color="amber"
        />
        <StatCard
          title="Offers Accepted"
          value={analytics?.selectedApplicants ?? 0}
          icon={CheckCircle2}
          subtitle={`${analytics?.hireConversionRate ?? 0}% selection rate`}
          color="emerald"
        />
      </div>

      {/* Quick Links & Recent Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applicants */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Recent Candidate Submissions</h3>
              <p className="text-xs text-gray-500">Candidates who recently applied to your active postings</p>
            </div>
            <Link
              to="/company/applicants"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View Pipeline <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentApplicants.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No applications received yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentApplicants.map((app) => (
                <div key={app.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900 truncate">{app.studentName}</span>
                      <Badge status={app.currentStatus} />
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {app.internshipTitle} • {app.studentCollege || 'Student'} • CGPA: {app.studentCgpa?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {app.matchScoreAtApplication !== undefined && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        {app.matchScoreAtApplication}% match
                      </span>
                    )}
                    <Link
                      to="/company/applicants"
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Postings Overview */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">My Internship Roles</h3>
              <Link to="/company/post-internship" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                + New
              </Link>
            </div>

            {postings.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No internships created yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {postings.map((p) => (
                  <div key={p.id} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{p.title}</h4>
                      <Badge status={p.status} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                      <span>{p.applicantCount ?? 0} applicants</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Deadline: {new Date(p.applicationDeadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link
              to="/company/applicants"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-xl hover:bg-indigo-100 transition-colors"
            >
              Candidate Pipeline Manager
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CompanyDashboard;
