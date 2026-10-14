import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  GraduationCap,
  AlertCircle,
  UserCheck,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { studentsApi } from '../../api/services';
import { StudentProfile } from '../../types';

export const StudentVerificationPage: React.FC = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentsApi.getAll();
      if (res.success) {
        setStudents(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (studentId: number, currentStatus: boolean | undefined) => {
    try {
      setError(null);
      const newStatus = !currentStatus;
      const res = await studentsApi.verifyStudent(studentId, newStatus);
      if (res.success) {
        setSuccessMsg(
          `Student ${res.data.firstName} ${res.data.lastName} academic standing ${
            newStatus ? 'VERIFIED' : 'UNVERIFIED'
          }.`
        );
        loadStudents();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update student verification status.');
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      `${s.firstName} ${s.lastName} ${s.email} ${s.rollNumber || ''} ${s.branch || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (verificationFilter === 'VERIFIED') return !!s.isVerified;
    if (verificationFilter === 'UNVERIFIED') return !s.isVerified;
    return true;
  });

  const verifiedCount = students.filter((s) => s.isVerified).length;
  const pendingCount = students.length - verifiedCount;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
              Academic Verification & Audit
            </span>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
              TPO / Coordinator Review
            </span>
          </div>
          <h1 className="text-3xl font-extrabold">Student Academic KYC & Standing</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Authenticate official college roll numbers, verify CGPA records, and confirm backlog counts to qualify students for placement drives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 border border-white/15 px-4 py-2.5 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Verified Pool</span>
            <span className="text-xl font-black text-white">{verifiedCount}</span>
          </div>
          <div className="bg-white/10 border border-white/15 px-4 py-2.5 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Pending Audit</span>
            <span className="text-xl font-black text-amber-300">{pendingCount}</span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, roll number, email, or branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'VERIFIED', 'UNVERIFIED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setVerificationFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                verificationFilter === filter
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-gray-100 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Student & Roll No.</th>
                <th className="px-6 py-4">Branch & Graduation</th>
                <th className="px-6 py-4">CGPA</th>
                <th className="px-6 py-4">Backlogs (Active / Total)</th>
                <th className="px-6 py-4">Standing Status</th>
                <th className="px-6 py-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    Loading student academic records...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No students match the criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 text-sm">
                        {st.firstName} {st.lastName}
                      </div>
                      <div className="text-gray-500 text-[11px] font-mono mt-0.5">
                        Roll: <span className="font-semibold text-gray-800">{st.rollNumber || 'NOT SET'}</span> • {st.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <div className="font-semibold">{st.branch || 'Branch N/A'}</div>
                      <div className="text-[11px] text-gray-400">Class of {st.graduationYear || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-indigo-600 text-sm">{st.cgpa ?? '0.00'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold ${
                          (st.activeBacklogs || 0) > 0 ? 'text-rose-600' : 'text-gray-700'
                        }`}
                      >
                        {st.activeBacklogs ?? 0} Active
                      </span>{' '}
                      / {st.totalBacklogs ?? 0} Total
                    </td>
                    <td className="px-6 py-4">
                      {st.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> VERIFIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" /> UNVERIFIED
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleVerification(st.id, st.isVerified)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                          st.isVerified
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
                        }`}
                      >
                        {st.isVerified ? 'Revoke Verification' : 'Verify Standing'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default StudentVerificationPage;
