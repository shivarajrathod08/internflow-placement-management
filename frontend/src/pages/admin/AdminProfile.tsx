import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import {
  ShieldCheck,
  Mail,
  UserCheck,
  Calendar,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Building2,
  Lock,
  Layers,
  History,
  Sparkles,
} from 'lucide-react';

export const AdminProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-500">
        Loading authenticated profile...
      </div>
    );
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword) {
      setErrorMsg('Current password is required.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiClient.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        setSuccessMsg('Your security password has been updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (refreshUser) {
          await refreshUser();
        }
      } else {
        setErrorMsg(res.data.message || 'Failed to update password.');
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          'Failed to update password. Please verify your current credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'AD';
  };

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Active Academic Session';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#192844] bg-[#FFFCF7] border border-[#E5DED2] hover:bg-[#EAE3D6]/70 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-[#192844] uppercase tracking-wider">
            {user.role} Standing
          </span>
        </div>
      </div>

      {/* Main Account Banner */}
      <div className="relative rounded-2xl bg-[#FFFCF7] border border-[#E5DED2] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#192844] text-[#FFFCF7] font-extrabold text-2xl flex items-center justify-center shadow-md border-2 border-[#E5DED2]">
              {getInitials(user.name, user.email)}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#192844] tracking-tight">
                  {user.name || 'Campus Administrator'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-[#E5DCCB] text-[#192844] border border-[#D8CEBC]">
                  {user.role}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Active Account
                </span>
              </div>
              <p className="text-sm text-[#64748B] mt-1 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[#8C7E6D]" />
                <span>{user.email}</span>
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto text-left sm:text-right pt-4 sm:pt-0 border-t sm:border-t-0 border-[#E5DED2]">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#786E5E] block">
              ACCOUNT ID
            </span>
            <span className="text-sm font-bold text-[#192844] font-mono">
              IF-ADM-00{user.id}
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Profile Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl bg-[#FFFCF7] border border-[#E5DED2] p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#192844] mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#192844]" />
              <span>Administrative Credentials & Information</span>
            </h2>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F0EADF]/60 border border-[#E5DED2]">
                <dt className="text-[10px] font-extrabold uppercase tracking-wider text-[#786E5E]">
                  Full Name
                </dt>
                <dd className="mt-1 font-bold text-sm text-[#192844]">
                  {user.name || 'Campus Administrator'}
                </dd>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F0EADF]/60 border border-[#E5DED2]">
                <dt className="text-[10px] font-extrabold uppercase tracking-wider text-[#786E5E]">
                  Email Address
                </dt>
                <dd className="mt-1 font-bold text-sm text-[#192844] truncate">
                  {user.email}
                </dd>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F0EADF]/60 border border-[#E5DED2]">
                <dt className="text-[10px] font-extrabold uppercase tracking-wider text-[#786E5E]">
                  Platform Authority
                </dt>
                <dd className="mt-1 font-bold text-sm text-[#192844]">
                  {user.role === 'ADMIN'
                    ? 'Super Administrator (Campus-Wide)'
                    : user.role === 'TPO'
                    ? 'Training & Placement Officer'
                    : 'Faculty Placement Coordinator'}
                </dd>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F0EADF]/60 border border-[#E5DED2]">
                <dt className="text-[10px] font-extrabold uppercase tracking-wider text-[#786E5E]">
                  Member Since
                </dt>
                <dd className="mt-1 font-bold text-sm text-[#192844] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#8C7E6D]" />
                  <span>{formattedDate}</span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Security & Password Change */}
          <div className="rounded-2xl bg-[#FFFCF7] border border-[#E5DED2] p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#192844] mb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#192844]" />
              <span>Update Security Credentials</span>
            </h2>
            <p className="text-xs text-[#64748B] mb-5">
              Ensure your administrative account remains protected by updating your credentials periodically.
            </p>

            {successMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#192844] mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DED2] focus:outline-none focus:ring-2 focus:ring-[#192844] bg-white text-black font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#192844] mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DED2] focus:outline-none focus:ring-2 focus:ring-[#192844] bg-white text-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#192844] mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DED2] focus:outline-none focus:ring-2 focus:ring-[#192844] bg-white text-black font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#192844] hover:bg-[#121e33] transition-colors shadow-sm disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isSubmitting ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Sidebar: Role Responsibilities & Quick Links */}
        <div className="space-y-6">
          {/* Permissions Overview */}
          <div className="rounded-2xl bg-[#FFFCF7] border border-[#E5DED2] p-5 shadow-sm">
            <h3 className="text-xs font-bold text-[#192844] uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Role Permissions</span>
            </h3>

            <ul className="space-y-2.5 text-xs text-[#475569]">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#192844] mt-1.5 shrink-0" />
                <span>Placement drives lifecycle and eligibility criteria setup</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#192844] mt-1.5 shrink-0" />
                <span>Corporate partner vetting and recruiter authorization</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#192844] mt-1.5 shrink-0" />
                <span>Student academic credentials & backlog standing KYC</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#192844] mt-1.5 shrink-0" />
                <span>Opportunity approval and offer integrity audit</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#192844] mt-1.5 shrink-0" />
                <span>Deterministic Smart Match Engine inspection</span>
              </li>
            </ul>
          </div>

          {/* Direct Module Shortcuts */}
          <div className="rounded-2xl bg-[#E5DCCB] border border-[#D8CEBC] p-5 shadow-sm text-[#192844]">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#192844]" />
              <span>Administrative Portals</span>
            </h3>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => navigate('/admin/drives')}
                className="w-full text-left p-2.5 rounded-xl bg-[#FFFCF7] border border-[#E5DED2] font-semibold text-[#192844] hover:bg-[#F0EADF] transition-colors flex items-center justify-between"
              >
                <span>Placement Drives</span>
                <span className="text-[#8C7E6D]">→</span>
              </button>

              <button
                onClick={() => navigate('/admin/companies')}
                className="w-full text-left p-2.5 rounded-xl bg-[#FFFCF7] border border-[#E5DED2] font-semibold text-[#192844] hover:bg-[#F0EADF] transition-colors flex items-center justify-between"
              >
                <span>Company Approvals</span>
                <span className="text-[#8C7E6D]">→</span>
              </button>

              <button
                onClick={() => navigate('/admin/students')}
                className="w-full text-left p-2.5 rounded-xl bg-[#FFFCF7] border border-[#E5DED2] font-semibold text-[#192844] hover:bg-[#F0EADF] transition-colors flex items-center justify-between"
              >
                <span>Student Standing KYC</span>
                <span className="text-[#8C7E6D]">→</span>
              </button>

              <button
                onClick={() => navigate('/admin/audit-logs')}
                className="w-full text-left p-2.5 rounded-xl bg-[#FFFCF7] border border-[#E5DED2] font-semibold text-[#192844] hover:bg-[#F0EADF] transition-colors flex items-center justify-between"
              >
                <span>Platform Audit Trail</span>
                <span className="text-[#8C7E6D]">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
