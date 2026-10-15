import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Users,
  CheckCircle,
  Clock,
  Briefcase,
  AlertCircle,
  FileCheck,
  ChevronRight,
  Filter,
  GraduationCap,
  Sparkles,
  X,
} from 'lucide-react';
import { placementDrivesApi } from '../../api/services';
import {
  PlacementDrive,
  PlacementDriveStatus,
  CreatePlacementDriveRequest,
  StudentProfile,
} from '../../types';
import { useAuth } from '../../context/AuthContext';

export const PlacementDrivesPage: React.FC = () => {
  const { user } = useAuth();
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Create Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreatePlacementDriveRequest>({
    name: '',
    academicYear: '2025-2026',
    batchYear: 2026,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: '',
    eligibleBranches: 'Computer Science, Information Technology, Electronics',
    minCgpa: 7.0,
    maxBacklogs: 0,
  });

  // Eligible candidates modal
  const [candidatesModalOpen, setCandidatesModalOpen] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);
  const [eligibleStudents, setEligibleStudents] = useState<StudentProfile[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const isStaffOrAdmin =
    user?.role === 'ADMIN' || user?.role === 'TPO' || user?.role === 'FACULTY_COORDINATOR';

  useEffect(() => {
    loadDrives();
  }, []);

  const loadDrives = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await placementDrivesApi.getAll();
      if (res.success) {
        setDrives(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load placement drives.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const res = await placementDrivesApi.create(formData);
      if (res.success) {
        setSuccessMsg(`Placement drive "${res.data.name}" created successfully!`);
        setCreateModalOpen(false);
        setFormData({
          name: '',
          academicYear: '2025-2026',
          batchYear: 2026,
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          description: '',
          eligibleBranches: 'Computer Science, Information Technology, Electronics',
          minCgpa: 7.0,
          maxBacklogs: 0,
        });
        loadDrives();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create placement drive.');
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: PlacementDriveStatus) => {
    try {
      setError(null);
      const res = await placementDrivesApi.updateStatus(id, newStatus);
      if (res.success) {
        setSuccessMsg(`Drive status updated to ${newStatus}`);
        loadDrives();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update drive status.');
    }
  };

  const handleViewEligibleCandidates = async (drive: PlacementDrive) => {
    setSelectedDrive(drive);
    setCandidatesModalOpen(true);
    setLoadingCandidates(true);
    try {
      const res = await placementDrivesApi.getEligibleCandidates(drive.id);
      if (res.success) {
        setEligibleStudents(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch eligible candidates.');
    } finally {
      setLoadingCandidates(false);
    }
  };

  const filteredDrives = drives.filter((d) => {
    if (filterStatus === 'ALL') return true;
    return d.status === filterStatus;
  });

  const getStatusBadge = (status: PlacementDriveStatus) => {
    switch (status) {
      case 'ONGOING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ONGOING
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" />
            UPCOMING
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <CheckCircle className="w-3 h-3" />
            COMPLETED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            CANCELLED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - Clean Professional Light Theme with subtle indigo accents */}
      <div className="bg-gradient-to-br from-white via-indigo-50/40 to-slate-50/80 rounded-3xl p-8 text-slate-900 border border-indigo-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-600">
              Training & Placement Office
            </span>
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Institutional Recruitment Operations
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Placement Drives & Cohorts</h1>
          <p className="text-slate-600 text-sm mt-1 max-w-xl">
            Orchestrate centralized placement drives, define cohort eligibility rules, and track candidate qualification in real-time.
          </p>
        </div>

        {isStaffOrAdmin && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="relative z-10 inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Launch Placement Drive
          </button>
        )}
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

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2">
          {['ALL', 'ONGOING', 'UPCOMING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredDrives.length} of {drives.length} drive cohorts
        </div>
      </div>

      {/* Drives List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
          ))}
        </div>
      ) : filteredDrives.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">No placement drives found</h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            {isStaffOrAdmin
              ? 'Click "Launch Placement Drive" to set up your institutional recruitment drive with batch criteria and branch restrictions.'
              : 'Placement drives scheduled for your batch will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDrives.map((drive) => (
            <div
              key={drive.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50/80 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                      Batch {drive.batchYear} • AY {drive.academicYear}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1.5">{drive.name}</h3>
                  </div>
                  {getStatusBadge(drive.status)}
                </div>

                {drive.description && (
                  <p className="text-xs text-slate-600 line-clamp-2">{drive.description}</p>
                )}

                {/* Eligibility Criteria Summary */}
                <div className="p-3.5 bg-slate-50/80 rounded-xl space-y-2 border border-slate-200/60">
                  <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Mandatory Qualification Thresholds
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">Min CGPA</span>
                      <span className="font-bold text-slate-900">{drive.minCgpa ?? 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">Max Backlogs</span>
                      <span className="font-bold text-slate-900">{drive.maxBacklogs ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">Timeline</span>
                      <span className="font-bold text-slate-900 truncate block">
                        {drive.startDate}
                      </span>
                    </div>
                  </div>
                  {drive.eligibleBranches && (
                    <div className="text-[11px] text-slate-700 pt-1.5 border-t border-slate-200/60">
                      <span className="font-semibold text-slate-500">Branches: </span>
                      {drive.eligibleBranches}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons & Status Controls */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => handleViewEligibleCandidates(drive)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-100 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  Eligible Candidates
                </button>

                {isStaffOrAdmin && (
                  <div className="flex items-center gap-1.5">
                    {drive.status === 'UPCOMING' && (
                      <button
                        onClick={() => handleUpdateStatus(drive.id, 'ONGOING')}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                      >
                        Start Drive
                      </button>
                    )}
                    {drive.status === 'ONGOING' && (
                      <button
                        onClick={() => handleUpdateStatus(drive.id, 'COMPLETED')}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 shadow-sm"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Launch Drive Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Briefcase className="w-4 h-4" />
                </div>
                Launch Institutional Placement Drive
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDrive} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">Drive Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Campus Placement Drive 2026"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium text-black bg-white border border-gray-300 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">Academic Year</label>
                  <input
                    type="text"
                    required
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-medium text-black bg-white border border-gray-300 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">Batch Year</label>
                  <input
                    type="number"
                    required
                    value={formData.batchYear}
                    onChange={(e) =>
                      setFormData({ ...formData, batchYear: parseInt(e.target.value) || 2026 })
                    }
                    className="w-full px-3.5 py-2.5 text-xs font-medium text-black bg-white border border-gray-300 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-medium text-black bg-white border border-gray-300 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-medium text-black bg-white border border-gray-300 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.minCgpa ?? 7.0}
                    onChange={(e) =>
                      setFormData({ ...formData, minCgpa: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 text-xs font-medium text-black bg-white border border-gray-300 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">Max Active Backlogs</label>
                  <input
                    type="number"
                    value={formData.maxBacklogs ?? 0}
                    onChange={(e) =>
                      setFormData({ ...formData, maxBacklogs: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 text-xs font-medium text-black bg-white border border-gray-300 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Eligible Branches (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.eligibleBranches || ''}
                  onChange={(e) => setFormData({ ...formData, eligibleBranches: e.target.value })}
                  placeholder="Computer Science, Information Technology, Electronics"
                  className="w-full px-3.5 py-2.5 text-xs font-medium text-black bg-white border border-gray-300 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">Description / Guidelines</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key instructions for companies and participating students..."
                  className="w-full px-3.5 py-2.5 text-xs font-medium text-black bg-white border border-gray-300 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  Launch Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Eligible Candidates Modal */}
      {candidatesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  Eligible Candidates Pool
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Drive: <span className="font-semibold text-slate-800">{selectedDrive?.name}</span>{' '}
                  (Min CGPA: {selectedDrive?.minCgpa}, Max Backlogs: {selectedDrive?.maxBacklogs})
                </p>
              </div>
              <button
                onClick={() => setCandidatesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {loadingCandidates ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Evaluating criteria against student profiles...
                </div>
              ) : eligibleStudents.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No students in the system currently satisfy the criteria for this drive.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {eligibleStudents.map((st) => (
                    <div key={st.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">
                            {st.firstName} {st.lastName}
                          </span>
                          {st.isVerified && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
                              <CheckCircle className="w-2.5 h-2.5" /> Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Roll: <span className="font-medium text-slate-800">{st.rollNumber || 'N/A'}</span> •{' '}
                          {st.branch || 'Branch N/A'} • Class of {st.graduationYear || 'N/A'}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-indigo-600">CGPA: {st.cgpa ?? 'N/A'}</div>
                        <div className="text-[10px] text-slate-400">
                          Active Backlogs: {st.activeBacklogs ?? 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-slate-500">
              <span>{eligibleStudents.length} candidate(s) meet all criteria</span>
              <button
                onClick={() => setCandidatesModalOpen(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PlacementDrivesPage;
