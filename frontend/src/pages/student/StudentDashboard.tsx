import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Building2,
  MapPin,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  StudentProfile,
  StudentAnalytics,
  Internship,
  Interview,
  ApiResponse,
  PageResponse,
} from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { MatchBadge } from '../../components/common/MatchBadge';
import { StatusBadge } from '../../components/common/Badge';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [recommended, setRecommended] = useState<Internship[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [profRes, analyticsRes, internRes, interviewRes] = await Promise.all([
          api.get<ApiResponse<StudentProfile>>('/students/me'),
          api.get<ApiResponse<StudentAnalytics>>('/analytics/student'),
          api.get<ApiResponse<PageResponse<Internship>>>('/internships/public?size=3'),
          api.get<ApiResponse<Interview[]>>('/interviews/student/me'),
        ]);

        if (profRes.data.success) setProfile(profRes.data.data);
        if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
        if (internRes.data.success) setRecommended(internRes.data.data.content || []);
        if (interviewRes.data.success) setInterviews(interviewRes.data.data || []);
      } catch (err) {
        console.error('Failed to load student dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold">Loading student dashboard...</p>
      </div>
    );
  }

  const completion = profile?.profileCompletionPercentage || 40;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-700 text-white shadow-xl shadow-brand-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold tracking-widest text-brand-200 uppercase mb-1 block">
            PLACEMENT & INTERNSHIP HUB
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hello, {profile?.firstName || user?.name || 'Student'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-brand-100/90 mt-1 max-w-xl">
            Track applications through strict state machine workflows, bridge skill gaps with AI recommendations, and schedule interviews.
          </p>
        </div>

        {/* Profile Completion Widget */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 w-full md:w-64">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-brand-100">Profile Strength</span>
            <span className="text-xs font-black">{completion}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
          {completion < 100 && (
            <Link
              to="/student/profile"
              className="text-[11px] font-bold text-white hover:underline mt-2.5 inline-flex items-center gap-1"
            >
              <span>Add skills & resume</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Applications"
          value={analytics?.totalApplications || 0}
          icon={<FileText className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Shortlisted"
          value={analytics?.shortlistedCount || 0}
          icon={<TrendingUp className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          label="Interviews Scheduled"
          value={analytics?.interviewScheduledCount || 0}
          icon={<Calendar className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          label="Offers / Selected"
          value={analytics?.selectedCount || 0}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Two Column Layout: Recommended Internships & Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommended Internships (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Recommended Internships
              </h2>
            </div>
            <Link
              to="/student/internships"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Browse All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recommended.length > 0 ? (
              recommended.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-200 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">{item.companyName}</span>
                      <StatusBadge status={item.workMode} />
                    </div>
                    <Link
                      to={`/student/internships/${item.id}`}
                      className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors block"
                    >
                      {item.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {item.location || 'Remote'}
                      </span>
                      <span>•</span>
                      <span>${item.stipendPerMonth}/mo</span>
                      <span>•</span>
                      <span>Min CGPA: {item.minCgpa}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.requiredSkills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0">
                    <MatchBadge score={88} internshipId={item.id} />
                    <Link
                      to={`/student/internships/${item.id}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all"
                    >
                      View & Apply
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-400 text-xs">
                No published internships found. Check back soon.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Scheduled Interviews & Document Status */}
        <div className="space-y-6">
          {/* Upcoming Interviews */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>Upcoming Interviews</span>
              </h3>
              <Link to="/student/interviews" className="text-xs font-bold text-brand-600 hover:underline">
                View
              </Link>
            </div>

            {interviews.length > 0 ? (
              <div className="space-y-3">
                {interviews.slice(0, 3).map((inv) => (
                  <div key={inv.id} className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 text-xs">
                    <p className="font-bold text-slate-900">{inv.internshipTitle}</p>
                    <p className="text-slate-500">{inv.companyName}</p>
                    <div className="mt-2 flex items-center justify-between text-purple-700 font-semibold">
                      <span>{new Date(inv.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      {inv.meetingLink && (
                        <a
                          href={inv.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-brand-600 hover:underline"
                        >
                          Join Link
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No upcoming interviews scheduled yet.</p>
            )}
          </div>

          {/* KYC & Document Status Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Document Compliance</h3>
            <p className="text-xs text-slate-500">
              Official offer letters, joining reports, and completion certificates require administrator verification.
            </p>
            <Link
              to="/student/documents"
              className="w-full mt-2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Manage Documents</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
