import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Interview, ApiResponse, PageResponse } from '../../types';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import {
  Calendar,
  Clock,
  Video,
  User,
  Star,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';

export const CompanyInterviews: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Feedback Modal
  const [feedbackInterview, setFeedbackInterview] = useState<Interview | null>(null);
  const [rating, setRating] = useState<number>(4);
  const [feedbackText, setFeedbackText] = useState('');
  const [outcome, setOutcome] = useState<'PASSED' | 'FAILED' | 'NEEDS_FOLLOW_UP'>('PASSED');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Reschedule Modal
  const [rescheduleInterview, setRescheduleInterview] = useState<Interview | null>(null);
  const [newDateTime, setNewDateTime] = useState('');
  const [newMeetingLink, setNewMeetingLink] = useState('');
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, [page]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<ApiResponse<PageResponse<Interview>>>(
        `/api/interviews/company?page=${page}&size=10`
      );
      if (res.data.success) {
        setInterviews(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
        setTotalElements(res.data.data.totalElements);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load company interviews.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackInterview) return;

    try {
      setSubmittingFeedback(true);
      setError(null);

      const res = await apiClient.post(`/api/interviews/${feedbackInterview.id}/feedback`, {
        feedback: feedbackText,
        rating,
        outcome,
      });

      if (res.data.success) {
        setSuccess(`Feedback submitted for ${feedbackInterview.studentName}. Candidate outcome: ${outcome}`);
        setFeedbackInterview(null);
        setFeedbackText('');
        fetchInterviews();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit interview evaluation.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleInterview) return;

    try {
      setSubmittingReschedule(true);
      setError(null);

      const res = await apiClient.patch(`/api/interviews/${rescheduleInterview.id}/reschedule`, {
        newScheduledAt: new Date(newDateTime).toISOString(),
        meetingLink: newMeetingLink || rescheduleInterview.meetingLink,
      });

      if (res.data.success) {
        setSuccess(`Interview with ${rescheduleInterview.studentName} rescheduled successfully.`);
        setRescheduleInterview(null);
        fetchInterviews();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reschedule interview.');
    } finally {
      setSubmittingReschedule(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Technical Interview Schedule</h1>
          <p className="text-gray-500 text-sm mt-1">
            Conduct virtual assessments, reschedule sessions, and submit candidate scorecards.
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

      {/* Interviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">No interviews scheduled yet</h3>
          <p className="text-gray-500 text-sm mt-1">
            Schedule interview rounds directly from the Candidate Pipeline table.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((item) => {
            const scheduledDate = new Date(item.scheduledAt);
            const isCompleted = item.status === 'COMPLETED';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-base text-gray-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-600" />
                      {item.studentName}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">({item.studentEmail})</span>
                    <Badge status={item.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                    <span className="font-medium text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                      {item.internshipTitle}
                    </span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {scheduledDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {scheduledDate.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {item.feedback && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-700">
                      <div className="flex items-center gap-2 font-semibold text-gray-900 mb-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        Rating: {item.rating}/5 ⭐
                      </div>
                      <p>{item.feedback}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
                  {item.meetingLink && item.status !== 'CANCELLED' && (
                    <a
                      href={item.meetingLink.startsWith('http') ? item.meetingLink : `https://${item.meetingLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Meeting Link
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {!isCompleted && (
                    <>
                      <button
                        onClick={() => {
                          setRescheduleInterview(item);
                          setNewDateTime(new Date(item.scheduledAt).toISOString().slice(0, 16));
                          setNewMeetingLink(item.meetingLink || '');
                        }}
                        className="px-3.5 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        Reschedule
                      </button>

                      <button
                        onClick={() => {
                          setFeedbackInterview(item);
                          setRating(4);
                          setFeedbackText('');
                        }}
                        className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
                      >
                        Submit Scorecard
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="py-3 px-6 bg-white rounded-2xl border border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing page {page + 1} of {totalPages} ({totalElements} total interviews)
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

      {/* Reschedule Modal */}
      <Modal
        isOpen={!!rescheduleInterview}
        onClose={() => setRescheduleInterview(null)}
        title={`Reschedule Interview: ${rescheduleInterview?.studentName}`}
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Interview Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={newDateTime}
              onChange={(e) => setNewDateTime(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Updated Meeting Link (Optional)
            </label>
            <input
              type="text"
              value={newMeetingLink}
              onChange={(e) => setNewMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setRescheduleInterview(null)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReschedule}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm"
            >
              {submittingReschedule ? 'Rescheduling...' : 'Confirm Reschedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Scorecard / Feedback Modal */}
      <Modal
        isOpen={!!feedbackInterview}
        onClose={() => setFeedbackInterview(null)}
        title={`Interview Evaluation: ${feedbackInterview?.studentName}`}
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Technical & Cultural Rating (1 to 5 Stars) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-bold text-gray-700 ml-2">{rating} / 5</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Round Recommendation / Outcome <span className="text-red-500">*</span>
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="PASSED">Passed Round (Advance in Pipeline)</option>
              <option value="NEEDS_FOLLOW_UP">Needs Follow-Up / Additional Round</option>
              <option value="FAILED">Failed Round (Do Not Advance)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detailed Feedback Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              required
              placeholder="Candidate demonstrated strong algorithmic knowledge in data structures. Good communication skills..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setFeedbackInterview(null)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingFeedback}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm"
            >
              {submittingFeedback ? 'Submitting Scorecard...' : 'Submit Scorecard & Complete Round'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default CompanyInterviews;
