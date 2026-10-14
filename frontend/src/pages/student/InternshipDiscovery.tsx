import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Building2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import api from '../../api/client';
import { Internship, PageResponse, ApiResponse } from '../../types';
import { MatchBadge } from '../../components/common/MatchBadge';
import { StatusBadge } from '../../components/common/Badge';

export const InternshipDiscovery: React.FC = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [pageInfo, setPageInfo] = useState({
    pageNumber: 0,
    pageSize: 6,
    totalPages: 1,
    totalElements: 0,
  });

  const [filters, setFilters] = useState({
    query: '',
    location: '',
    workMode: '',
    minStipend: '',
    skill: '',
  });

  const [loading, setLoading] = useState(true);

  const fetchInternships = async (page = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', pageInfo.pageSize.toString());
      if (filters.query) params.append('query', filters.query);
      if (filters.location) params.append('location', filters.location);
      if (filters.workMode) params.append('workMode', filters.workMode);
      if (filters.minStipend) params.append('minStipend', filters.minStipend);
      if (filters.skill) params.append('skill', filters.skill);

      const res = await api.get<ApiResponse<PageResponse<Internship>>>(`/internships/public?${params.toString()}`);
      if (res.data.success) {
        setInternships(res.data.data.content || []);
        setPageInfo({
          pageNumber: res.data.data.pageNumber,
          pageSize: res.data.data.pageSize,
          totalPages: res.data.data.totalPages,
          totalElements: res.data.data.totalElements,
        });
      }
    } catch (err) {
      console.error('Failed to load internships', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships(0);
  }, [filters.workMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInternships(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Discover Internships</h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore campus-approved positions with transparent match scores and eligibility criteria.
        </p>
      </div>

      {/* Search & Filters Bar */}
      <form onSubmit={handleSearch} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by role, company name, or technology..."
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            Filter Postings
          </button>
        </div>

        {/* Secondary Filter Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <select
            value={filters.workMode}
            onChange={(e) => setFilters({ ...filters, workMode: e.target.value })}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
          >
            <option value="">All Work Modes</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ON_SITE">On-site</option>
          </select>

          <input
            type="text"
            placeholder="Location (e.g. Sunnyvale)"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          />

          <input
            type="number"
            placeholder="Min Stipend ($/mo)"
            value={filters.minStipend}
            onChange={(e) => setFilters({ ...filters, minStipend: e.target.value })}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          />

          <input
            type="text"
            placeholder="Skill (e.g. Java, React)"
            value={filters.skill}
            onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          />
        </div>
      </form>

      {/* Internships Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold">Filtering published internships...</p>
        </div>
      ) : internships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {internships.map((internship) => (
            <div
              key={internship.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">{internship.companyName}</span>
                      <StatusBadge status={internship.workMode} />
                    </div>
                    <Link
                      to={`/student/internships/${internship.id}`}
                      className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors mt-0.5 block"
                    >
                      {internship.title}
                    </Link>
                  </div>

                  <MatchBadge score={88} internshipId={internship.id} />
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {internship.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-semibold">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    ${internship.stipendPerMonth}/mo
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {internship.location || 'Remote'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {internship.durationMonths} Months
                  </span>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {internship.requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[11px] font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                  {internship.preferredSkills.slice(0, 2).map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                    >
                      +{s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Deadline: {new Date(internship.applicationDeadline).toLocaleDateString()}
                </span>

                <Link
                  to={`/student/internships/${internship.id}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all"
                >
                  View Details & Apply
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-400 text-xs">
          No internships matched your search criteria. Try broadening your filters.
        </div>
      )}

      {/* Pagination */}
      {pageInfo.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-xs text-slate-500">
            Page {pageInfo.pageNumber + 1} of {pageInfo.totalPages} ({pageInfo.totalElements} total)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchInternships(pageInfo.pageNumber - 1)}
              disabled={pageInfo.pageNumber === 0}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchInternships(pageInfo.pageNumber + 1)}
              disabled={pageInfo.pageNumber >= pageInfo.totalPages - 1}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
