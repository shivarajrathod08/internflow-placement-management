import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { analyticsApi } from '../../api/services';
import { AdminAnalytics, ApiResponse } from '../../types';
import StatCard from '../../components/StatCard';
import {
  Users,
  Building2,
  Briefcase,
  FileCheck,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  Download,
  Calendar,
  Award,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const CHART_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<ApiResponse<AdminAnalytics>>('/api/analytics/admin');
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load college placement analytics.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setDownloadingCsv(true);
      const blob = await analyticsApi.exportPlacementsCsv();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `internflow_placement_records_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Failed to download placement records CSV.');
    } finally {
      setDownloadingCsv(false);
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

  // Prepare chart data
  const statusChartData = analytics?.applicationsByStatus
    ? Object.entries(analytics.applicationsByStatus).map(([status, count]) => ({
        name: status.replace(/_/g, ' '),
        count,
      }))
    : [];

  const workModeChartData = analytics?.internshipsByWorkMode
    ? Object.entries(analytics.internshipsByWorkMode).map(([mode, count]) => ({
        name: mode.replace(/_/g, ' '),
        value: count,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
              College Placement Administration
            </span>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
              Live PostgreSQL Relational Aggregation
            </span>
          </div>
          <h1 className="text-3xl font-extrabold">Executive Placement Dashboard</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Monitor institutional placement metrics, manage KYC verifications, audit state transitions, and oversee internship approvals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={downloadingCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-indigo-950 bg-white hover:bg-slate-100 transition-all shadow-md disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            {downloadingCsv ? 'Exporting...' : 'Export Placements CSV'}
          </button>
          <Link
            to="/admin/drives"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md"
          >
            <Calendar className="w-4 h-4" />
            Drives
          </Link>
          <Link
            to="/admin/offers"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all"
          >
            <Award className="w-4 h-4" />
            Offers
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Students"
          value={analytics?.totalStudents ?? 0}
          icon={Users}
          subtitle="Registered in system"
          color="indigo"
        />
        <StatCard
          title="Partner Companies"
          value={analytics?.totalCompanies ?? 0}
          icon={Building2}
          subtitle={`${analytics?.verifiedCompanies ?? 0} verified • ${analytics?.pendingCompanies ?? 0} pending`}
          color="blue"
        />
        <StatCard
          title="Internship Postings"
          value={analytics?.totalInternships ?? 0}
          icon={Briefcase}
          subtitle={`${analytics?.publishedInternships ?? 0} published • ${analytics?.pendingInternships ?? 0} pending`}
          color="amber"
        />
        <StatCard
          title="Total Applications"
          value={analytics?.totalApplications ?? 0}
          icon={FileCheck}
          subtitle={`${analytics?.selectedCount ?? 0} selected • ${analytics?.completedCount ?? 0} completed`}
          color="emerald"
        />
      </div>

      {/* Institutional Funnel Conversion Rates */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 text-lg mb-1 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Institutional Pipeline Performance & Conversion
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          Calculated accurately from real database application state machine records
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
              Shortlist Conversion Rate
            </span>
            <div className="text-3xl font-black text-indigo-950 mt-1">
              {analytics?.shortlistRate ?? 0}%
            </div>
            <p className="text-xs text-indigo-600 mt-1">
              {analytics?.shortlistedCount ?? 0} of {analytics?.totalApplications ?? 0} applicants shortlisted
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Placement Selection Rate
            </span>
            <div className="text-3xl font-black text-emerald-950 mt-1">
              {analytics?.selectionRate ?? 0}%
            </div>
            <p className="text-xs text-emerald-600 mt-1">
              {analytics?.selectedCount ?? 0} student selections made by recruiters
            </p>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-700">
              Internship Completion Rate
            </span>
            <div className="text-3xl font-black text-purple-950 mt-1">
              {analytics?.completionRate ?? 0}%
            </div>
            <p className="text-xs text-purple-600 mt-1">
              {analytics?.completedCount ?? 0} students completed & verified
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Application Funnel Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Recruitment Funnel & State Machine Distribution
            </h3>
            <span className="text-[11px] text-gray-400 font-medium">Interactive Chart</span>
          </div>

          {statusChartData.length > 0 ? (
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-12 text-center">No application records logged yet.</p>
          )}
        </div>

        {/* Work Mode Breakdown Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            Posting Work Modes
          </h3>

          {workModeChartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={workModeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {workModeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '0.75rem',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-12 text-center">No postings recorded yet.</p>
          )}
        </div>
      </div>

      {/* Skills Demand Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Top Demanded Skills Across Industry Postings
          </h3>
          <Link to="/admin/skills" className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">
            Manage Skills Taxonomy →
          </Link>
        </div>

        {analytics?.topDemandedSkills && Object.keys(analytics.topDemandedSkills).length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {Object.entries(analytics.topDemandedSkills).map(([skill, count]) => (
              <span
                key={skill}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs font-semibold"
              >
                <span>{skill}</span>
                <span className="bg-indigo-200 text-indigo-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {count} jobs
                </span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No skill requirements aggregated yet.</p>
        )}
      </div>
    </div>
  );
};
export default AdminDashboard;
