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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
              Training & Placement Office
            </span>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
              Institutional Recruitment Operations
            </span>
          </div>
          <h1 className="text-3xl font-extrabold">Placement Drives & Cohorts</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Orchestrate centralized placement drives, define cohort eligibility rules, and track candidate qualification in real-time.
          </p>
        </div>

        {isStaffOrAdmin && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30"
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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          {['ALL', 'ONGOING', 'UPCOMING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Showing {filteredDrives.length} of {drives.length} drive cohorts
        </div>
      </div>

      {/* Drives List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filteredDrives.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-900 text-lg">No placement drives found</h3>
          <p className="text-gray-500 text-xs max-w-md mx-auto">
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
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      Batch {drive.batchYear} • AY {drive.academicYear}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-1">{drive.name}</h3>
                  </div>
                  {getStatusBadge(drive.status)}
                </div>

                {drive.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">{drive.description}</p>
                )}

                {/* Eligibility Criteria Summary */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                  <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Mandatory Qualification Thresholds
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Min CGPA</span>
                      <span className="font-bold text-gray-800">{drive.minCgpa ?? 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Max Backlogs</span>
                      <span className="font-bold text-gray-800">{drive.maxBacklogs ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Timeline</span>
                      <span className="font-bold text-gray-800 truncate block">
                        {drive.startDate}
                      </span>
                    </div>
                  </div>
                  {drive.eligibleBranches && (
                    <div className="text-[11px] text-gray-600 pt-1 border-t border-slate-200">
                      <span className="font-semibold text-gray-500">Branches: </span>
                      {drive.eligibleBranches}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons & Status Controls */}
              <div className="pt-4 mt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => handleViewEligibleCandidates(drive)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  Eligible Candidates
                </button>

                {isStaffOrAdmin && (
                  <div className="flex items-center gap-1.5">
                    {drive.status === 'UPCOMING' && (
                      <button
                        onClick={() => handleUpdateStatus(drive.id, 'ONGOING')}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Start Drive
                      </button>
                    )}
                    {drive.status === 'ONGOING' && (
                      <button
                        onClick={() => handleUpdateStatus(drive.id, 'COMPLETED')}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                Launch Institutional Placement Drive
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDrive} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Drive Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Campus Placement Drive 2026"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    required
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Batch Year</label>
                  <input
                    type="number"
                    required
                    value={formData.batchYear}
                    onChange={(e) =>
                      setFormData({ ...formData, batchYear: parseInt(e.target.value) || 2026 })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.minCgpa ?? 7.0}
                    onChange={(e) =>
                      setFormData({ ...formData, minCgpa: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Max Active Backlogs</label>
                  <input
                    type="number"
                    value={formData.maxBacklogs ?? 0}
                    onChange={(e) =>
                      setFormData({ ...formData, maxBacklogs: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Eligible Branches (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.eligibleBranches || ''}
                  onChange={(e) => setFormData({ ...formData, eligibleBranches: e.target.value })}
                  placeholder="Computer Science, Information Technology, Electronics"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description / Guidelines</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key instructions for companies and participating students..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  Eligible Candidates Pool
                </h3>
                <p className="text-xs text-gray-500">
                  Drive: <span className="font-semibold text-gray-800">{selectedDrive?.name}</span>{' '}
                  (Min CGPA: {selectedDrive?.minCgpa}, Max Backlogs: {selectedDrive?.maxBacklogs})
                </p>
              </div>
              <button
                onClick={() => setCandidatesModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {loadingCandidates ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  Evaluating criteria against student profiles...
                </div>
              ) : eligibleStudents.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  No students in the system currently satisfy the criteria for this drive.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {eligibleStudents.map((st) => (
                    <div key={st.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-gray-900">
                            {st.firstName} {st.lastName}
                          </span>
                          {st.isVerified && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
                              <CheckCircle className="w-2.5 h-2.5" /> Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500">
                          Roll: <span className="font-medium text-gray-700">{st.rollNumber || 'N/A'}</span> •{' '}
                          {st.branch || 'Branch N/A'} • Class of {st.graduationYear || 'N/A'}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-indigo-600">CGPA: {st.cgpa ?? 'N/A'}</div>
                        <div className="text-[10px] text-gray-400">
                          Active Backlogs: {st.activeBacklogs ?? 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
              <span>{eligibleStudents.length} candidate(s) meet all criteria</span>
              <button
                onClick={() => setCandidatesModalOpen(false)}
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs"
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
