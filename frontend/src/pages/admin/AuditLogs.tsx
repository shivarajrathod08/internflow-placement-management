import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { AuditLogItem, ApiResponse, PageResponse } from '../../types';
import {
  ShieldAlert,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  ArrowRight,
  Globe,
  Filter,
} from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<ApiResponse<PageResponse<AuditLogItem>>>(
        `/api/admin/audit-logs?page=${page}&size=15&sort=createdAt,desc`
      );

      if (res.data.success) {
        let content = res.data.data.content;
        if (searchQuery.trim()) {
          content = content.filter(
            (l) =>
              l.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
              l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (l.entityName && l.entityName.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }
        setLogs(content);
        setTotalPages(res.data.data.totalPages);
        setTotalElements(res.data.data.totalElements);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('REJECT') || action.includes('DELETE') || action.includes('SUSPEND')) {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    if (action.includes('APPROVE') || action.includes('VERIF') || action.includes('CREATE')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (action.includes('UPDATE') || action.includes('STATUS')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security & Compliance Audit Trail</h1>
          <p className="text-gray-500 text-sm mt-1">
            Immutable chronicle of authentication, KYC verification, application state machine advances, and administrative decisions.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 text-slate-100 px-3 py-1.5 rounded-xl text-xs font-semibold">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          Tamper-Resistant Logging Active
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search email, action type (e.g. KYC_VERIFY, STATUS_TRANSITION), or entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">No audit logs recorded</h3>
          <p className="text-gray-500 text-sm mt-1">Platform actions will be logged here in real time.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Actor</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                  <th className="py-3 px-4 font-semibold">Target Entity</th>
                  <th className="py-3 px-4 font-semibold">State Mutation</th>
                  <th className="py-3 px-4 font-semibold">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-sans font-medium text-gray-900">{log.userEmail}</div>
                      <span className="text-[10px] uppercase font-bold text-gray-400">{log.role}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md border text-[11px] font-bold ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-gray-700">
                      {log.entityName} {log.entityId ? `#${log.entityId}` : ''}
                    </td>
                    <td className="py-3.5 px-4">
                      {log.previousState || log.newState ? (
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                            {log.previousState || 'NONE'}
                          </span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                            {log.newState || 'NONE'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic font-sans">{log.details || '—'}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-gray-400">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="py-3 px-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 font-sans">
              <span>
                Showing page {page + 1} of {totalPages} ({totalElements} audit entries)
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
    </div>
  );
};
export default AuditLogs;
