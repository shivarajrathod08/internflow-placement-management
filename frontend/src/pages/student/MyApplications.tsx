import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  XCircle,
  Building2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import api from '../../api/client';
import { Application, PageResponse, ApiResponse } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { ApplicationStepper } from '../../components/common/ApplicationStepper';
import { Modal } from '../../components/common/Modal';

export const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [expandedAppId, setExpandedAppId] = useState<number | null>(null);
  const [withdrawTargetId, setWithdrawTargetId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const res = await api.get<ApiResponse<PageResponse<Application>>>('/applications/student/me?size=50');
      if (res.data.success) {
        setApplications(res.data.data.content || []);
      }
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async () => {
    if (!withdrawTargetId) return;
    try {
      await api.post(`/applications/${withdrawTargetId}/withdraw`);
      setWithdrawTargetId(null);
      fetchApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to withdraw application.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold">Loading applications history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">My Applications</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor your application lifecycle through validated transitions from screening to completion.
        </p>
      </div>

      {applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => {
            const isExpanded = expandedAppId === app.id;
            const canWithdraw = app.currentStatus === 'APPLIED' || app.currentStatus === 'UNDER_REVIEW';

            return (
              <div
                key={app.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-500">{app.companyName}</span>
                      <StatusBadge status={app.currentStatus} />
                    </div>
                    <Link
                      to={`/student/internships/${app.internshipId}`}
                      className="text-base font-extrabold text-slate-900 dark:text-white hover:text-brand-600 transition-colors"
                    >
                      {app.internshipTitle}
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                    {canWithdraw && (
                      <button
                        onClick={() => setWithdrawTargetId(app.id)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>

                {/* State Machine Stepper */}
                <div className="pt-2">
                  <ApplicationStepper currentStatus={app.currentStatus} />
                </div>

                {/* Toggle Status History */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <span>{isExpanded ? 'Hide' : 'View'} Status History & Audit Notes</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Expanded History Timeline */}
                {isExpanded && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 space-y-3 animate-in fade-in duration-150">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Audit Trail & Status History
                    </h4>
                    {app.history && app.history.length > 0 ? (
                      <div className="space-y-2.5 relative pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                        {app.history.map((h) => (
                          <div key={h.id} className="relative text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {h.toStatus.replace(/_/g, ' ')}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(h.createdAt).toLocaleString()}
                              </span>
                            </div>
                            {h.notes && <p className="text-slate-500 mt-0.5">{h.notes}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Initial application received.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-400 text-xs">
          You haven't submitted any internship applications yet.
          <div className="mt-3">
            <Link
              to="/student/internships"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-sm inline-block"
            >
              Browse Open Positions
            </Link>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Withdrawal */}
      <Modal
        isOpen={!!withdrawTargetId}
        onClose={() => setWithdrawTargetId(null)}
        title="Withdraw Application?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to withdraw this application? This action marks the application as WITHDRAWN and cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setWithdrawTargetId(null)}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleWithdraw}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
            >
              Confirm Withdrawal
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
