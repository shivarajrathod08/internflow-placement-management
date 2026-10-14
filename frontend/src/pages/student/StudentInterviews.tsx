import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Interview, ApiResponse } from '../../types';
import Badge from '../../components/Badge';
import { Calendar, Clock, Video, MapPin, Phone, Building2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

export const StudentInterviews: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<ApiResponse<Interview[]>>('/api/interviews/student/me');
      if (res.data.success) {
        setInterviews(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load interviews.');
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const upcomingInterviews = interviews.filter((i) => new Date(i.scheduledAt) >= now && i.status !== 'CANCELLED' && i.status !== 'COMPLETED');
  const pastInterviews = interviews.filter((i) => new Date(i.scheduledAt) < now || i.status === 'COMPLETED' || i.status === 'CANCELLED');

  const displayedInterviews = activeTab === 'upcoming' ? upcomingInterviews : pastInterviews;

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'ONLINE':
        return <Video className="w-4 h-4 text-blue-500" />;
      case 'PHONE':
        return <Phone className="w-4 h-4 text-emerald-500" />;
      case 'IN_PERSON':
      default:
        return <MapPin className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Interviews</h1>
          <p className="text-gray-500 text-sm mt-1">
            Keep track of your technical rounds, behavioral assessments, and discussions.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'upcoming' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming ({upcomingInterviews.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'past' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Past & Completed ({pastInterviews.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 animate-pulse h-36" />
          ))}
        </div>
      ) : displayedInterviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No {activeTab} interviews</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
            {activeTab === 'upcoming'
              ? 'When companies review your profile and schedule technical rounds, they will show up here.'
              : 'You have no historical or completed interviews.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedInterviews.map((interview) => {
            const scheduledDate = new Date(interview.scheduledAt);
            const isToday = scheduledDate.toDateString() === now.toDateString();

            return (
              <div
                key={interview.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-lg text-gray-900">{interview.internshipTitle}</span>
                    <Badge status={interview.status} />
                    {isToday && (
                      <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-semibold animate-pulse">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5 font-medium text-gray-800">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {interview.companyName}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {scheduledDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {scheduledDate.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="flex items-center gap-1.5 capitalize bg-gray-50 px-2 py-0.5 rounded border border-gray-200 text-xs font-medium">
                      {getModeIcon(interview.mode)}
                      {interview.mode.replace('_', ' ').toLowerCase()}
                    </div>
                  </div>

                  {interview.feedback && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700 mt-2">
                      <div className="flex items-center gap-2 font-medium text-gray-900 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        Recruiter Feedback {interview.rating ? `(${interview.rating}/5 ⭐)` : ''}:
                      </div>
                      <p className="text-gray-600">{interview.feedback}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {interview.meetingLink && interview.status !== 'CANCELLED' && (
                    <a
                      href={interview.meetingLink.startsWith('http') ? interview.meetingLink : `https://${interview.meetingLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all hover:scale-105"
                    >
                      <Video className="w-4 h-4" />
                      Join Meeting
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default StudentInterviews;
