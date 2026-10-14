import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import {
  Application,
  ApplicationStatus,
  InterviewMode,
  ApiResponse,
  PageResponse,
  Internship,
} from '../../types';
import Badge from '../../components/Badge';
import MatchBadge from '../../components/MatchBadge';
import MatchModal from '../../components/MatchModal';
import Modal from '../../components/Modal';
import ApplicationStepper from '../../components/ApplicationStepper';
import {
  Search,
  Filter,
  Calendar,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  History,
  AlertCircle,
  CheckCircle2,
  Video,
} from 'lucide-react';

export const ApplicantsPipeline: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [postings, setPostings] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters & Pagination
  const [selectedInternshipId, setSelectedInternshipId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Match Modal
  const [matchModalData, setMatchModalData] = useState<{ studentId: number; internshipId: number; title: string } | null>(null);

  // Application History & Detail Modal
  const [selectedAppForHistory, setSelectedAppForHistory] = useState<Application | null>(null);

  // Schedule Interview Modal
  const [scheduleModalApp, setScheduleModalApp] = useState<Application | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [interviewMode, setInterviewMode] = useState<InterviewMode>('ONLINE');
  const [scheduling, setScheduling] = useState(false);

  // Status Change State
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchPostings();
  }, []);

  useEffect(() => {
    fetchApplicants();
  }, [page, selectedInternshipId, statusFilter]);

  const fetchPostings = async () => {
    try {
      const res = await apiClient.get<ApiResponse<PageResponse<Internship>>>('/internships/company?size=100');
      if (res.data.success) {
        setPostings(res.data.data.content);
      }
    } catch (err) {
      console.error('Failed to load company postings', err);
    }
  };

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = '/applications/company';
      if (selectedInternshipId !== 'all') {
        url = `/applications/company/internships/${selectedInternshipId}`;
      }

      const res = await apiClient.get<ApiResponse<PageResponse<Application>>>(
        `${url}?page=${page}&size=10`
      );

      if (res.data.success) {
        let content = res.data.data.content;
        if (statusFilter !== 'all') {
          content = content.filter((a) => a.currentStatus === statusFilter);
        }
        if (searchQuery.trim()) {
          content = content.filter(
            (a) =>
              a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              a.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
              a.internshipTitle.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setApplications(content);
        setTotalPages(res.data.data.totalPages);
        setTotalElements(res.data.data.totalElements);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load applicants.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: number, targetStatus: ApplicationStatus) => {
    try {
      setUpdatingId(appId);
      setError(null);
      setSuccess(null);

      const res = await apiClient.patch<ApiResponse<Application>>(`/applications/${appId}/status`, {
        targetStatus,
        notes: `Updated status to ${targetStatus} via Recruiter Pipeline.`,
      });

      if (res.data.success) {
        setSuccess(`Application status updated to ${targetStatus}`);
        fetchApplicants();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update candidate status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleModalApp) return;

    try {
      setScheduling(true);
      setError(null);

      const res = await apiClient.post('/interviews/schedule', {
        applicationId: scheduleModalApp.id,
        scheduledAt: new Date(scheduledAt).toISOString(),
        meetingLink,
        mode: interviewMode,
      });

      if (res.data.success) {
        setSuccess('Interview scheduled successfully! Candidate status moved to INTERVIEW_SCHEDULED.');
        setScheduleModalApp(null);
        setScheduledAt('');
        setMeetingLink('');
        fetchApplicants();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to schedule interview round.');
    } finally {
      setScheduling(false);
    }
  };

  // State machine helper for available next statuses
  const getNextStatuses = (current: ApplicationStatus): ApplicationStatus[] => {
    switch (current) {
      case 'APPLIED':
        return ['UNDER_REVIEW', 'SHORTLISTED', 'REJECTED'];
      case 'UNDER_REVIEW':
        return ['SHORTLISTED', 'REJECTED'];
      case 'SHORTLISTED':
        return ['INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED'];
      case 'INTERVIEW_SCHEDULED':
        return ['INTERVIEW_COMPLETED', 'REJECTED'];
      case 'INTERVIEW_COMPLETED':
        return ['SELECTED', 'INTERVIEW_SCHEDULED', 'REJECTED'];
      case 'SELECTED':
        return ['JOINED', 'REJECTED'];
      case 'JOINED':
        return ['IN_PROGRESS'];
      case 'IN_PROGRESS':
        return ['COMPLETION_SUBMITTED'];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidate Pipeline & Tracking</h1>
          <p className="text-gray-500 text-sm mt-1">
            Review applicant scores, examine talent fit breakdowns, and advance candidate stages.
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

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search candidate name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchApplicants()}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedInternshipId}
            onChange={(e) => {
              setSelectedInternshipId(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Internship Roles</option>
            {postings.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
            <option value="INTERVIEW_COMPLETED">Interview Completed</option>
            <option value="SELECTED">Selected</option>
            <option value="JOINED">Joined</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">No applicants match your criteria</h3>
          <p className="text-gray-500 text-sm mt-1">Try broadening your role or status filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Candidate</th>
                  <th className="py-3.5 px-4 font-semibold">Role Applied</th>
                  <th className="py-3.5 px-4 font-semibold">Match Score</th>
                  <th className="py-3.5 px-4 font-semibold">Current Status</th>
                  <th className="py-3.5 px-4 font-semibold">Advance Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => {
                  const nextStatuses = getNextStatuses(app.currentStatus);

                  return (
                    <tr key={app.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Candidate Column */}
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-bold text-gray-900">{app.studentName}</div>
                          <div className="text-xs text-gray-500">{app.studentEmail}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {app.studentCollege || 'University'} • CGPA: {app.studentCgpa?.toFixed(2) || 'N/A'}
                          </div>
                        </div>
                      </td>

                      {/* Role Column */}
                      <td className="py-4 px-4 font-medium text-gray-900">
                        <div className="max-w-[200px] truncate">{app.internshipTitle}</div>
                        <div className="text-xs text-gray-400">
                          Applied {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Match Score Column */}
                      <td className="py-4 px-4">
                        <MatchBadge
                          score={app.matchScoreAtApplication ?? 0}
                          onClick={() =>
                            setMatchModalData({
                              studentId: app.studentId,
                              internshipId: app.internshipId,
                              title: `${app.studentName} vs ${app.internshipTitle}`,
                            })
                          }
                        />
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-4">
                        <Badge status={app.currentStatus} />
                      </td>

                      {/* State Machine Transition Dropdown */}
                      <td className="py-4 px-4">
                        {nextStatuses.length > 0 ? (
                          <select
                            disabled={updatingId === app.id}
                            onChange={(e) => {
                              const val = e.target.value as ApplicationStatus;
                              if (val) {
                                if (val === 'INTERVIEW_SCHEDULED') {
                                  setScheduleModalApp(app);
                                  const d = new Date();
                                  d.setDate(d.getDate() + 2);
                                  d.setHours(14, 0, 0, 0);
                                  setScheduledAt(d.toISOString().slice(0, 16));
                                } else {
                                  handleStatusChange(app.id, val);
                                }
                              }
                            }}
                            defaultValue=""
                            className="text-xs font-semibold py-1.5 px-2.5 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-lg focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                          >
                            <option value="" disabled>
                              Transition to...
                            </option>
                            {nextStatuses.map((st) => (
                              <option key={st} value={st}>
                                → {st.replace('_', ' ')}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Terminal State</span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-6 text-right space-x-2">
                        {/* Interview Scheduler Shortcut */}
                        {(app.currentStatus === 'SHORTLISTED' || app.currentStatus === 'INTERVIEW_COMPLETED') && (
                          <button
                            onClick={() => {
                              setScheduleModalApp(app);
                              const d = new Date();
                              d.setDate(d.getDate() + 2);
                              d.setHours(14, 0, 0, 0);
                              setScheduledAt(d.toISOString().slice(0, 16));
                            }}
                            title="Schedule Interview Round"
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex items-center"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        )}

                        {/* Resume Shortcut */}
                        {app.studentResumeUrl && (
                          <a
                            href={app.studentResumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open Resume"
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                        )}

                        {/* History & Timeline */}
                        <button
                          onClick={() => setSelectedAppForHistory(app)}
                          title="View Application Lifecycle & Notes"
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="py-3 px-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing page {page + 1} of {totalPages} ({totalElements} candidates)
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

      {/* Match Breakdown Modal */}
      {matchModalData && (
        <MatchModal
          isOpen={true}
          onClose={() => setMatchModalData(null)}
          studentId={matchModalData.studentId}
          internshipId={matchModalData.internshipId}
          title={matchModalData.title}
        />
      )}

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={!!scheduleModalApp}
        onClose={() => setScheduleModalApp(null)}
        title={`Schedule Technical Interview: ${scheduleModalApp?.studentName}`}
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interview Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interview Format / Mode <span className="text-red-500">*</span>
            </label>
            <select
              value={interviewMode}
              onChange={(e) => setInterviewMode(e.target.value as InterviewMode)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="ONLINE">Online Video Call (Google Meet, Zoom, Teams)</option>
              <option value="IN_PERSON">In-Person Campus / Office Round</option>
              <option value="PHONE">Phone Screening Round</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting URL or Office Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Video className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                required
                placeholder="https://meet.google.com/xyz-abcd-efg"
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          <div className="p-3 bg-indigo-50 rounded-xl text-xs text-indigo-700">
            Scheduling this interview automatically triggers an in-app notification and email update to{' '}
            <strong>{scheduleModalApp?.studentEmail}</strong>.
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setScheduleModalApp(null)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={scheduling}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm"
            >
              {scheduling ? 'Scheduling...' : 'Confirm & Schedule Round'}
            </button>
          </div>
        </form>
      </Modal>

      {/* History & Timeline Modal */}
      <Modal
        isOpen={!!selectedAppForHistory}
        onClose={() => setSelectedAppForHistory(null)}
        title={`Application Lifecycle: ${selectedAppForHistory?.studentName}`}
      >
        {selectedAppForHistory && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <ApplicationStepper currentStatus={selectedAppForHistory.currentStatus} />
            </div>

            {selectedAppForHistory.coverNote && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Candidate Cover Note</h4>
                <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                  {selectedAppForHistory.coverNote}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Audit History & State Transitions</h4>
              <div className="space-y-3">
                {selectedAppForHistory.history?.map((h) => (
                  <div key={h.id} className="p-3 bg-white border border-gray-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-gray-900">
                      <span>{h.fromStatus ? `${h.fromStatus} → ${h.toStatus}` : `Initial: ${h.toStatus}`}</span>
                      <span className="text-gray-400 font-normal">{new Date(h.createdAt).toLocaleString()}</span>
                    </div>
                    {h.notes && <p className="text-gray-600">{h.notes}</p>}
                    <p className="text-gray-400">By: {h.changedByEmail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default ApplicantsPipeline;
