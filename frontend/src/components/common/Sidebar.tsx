import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  FileText,
  Calendar,
  FolderLock,
  User,
  PlusCircle,
  Users,
  Building2,
  CheckSquare,
  ShieldCheck,
  Database,
  History,
  X,
  Sparkles,
  Award,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { user } = useAuth();

  if (!user) return null;

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/internships', label: 'Explore Internships', icon: Search },
    { to: '/student/applications', label: 'My Applications', icon: FileText },
    { to: '/student/offers', label: 'Offers & Joining', icon: Award },
    { to: '/student/interviews', label: 'Interviews', icon: Calendar },
    { to: '/student/documents', label: 'Documents & KYC', icon: FolderLock },
    { to: '/student/profile', label: 'Profile & Skills', icon: User },
  ];

  const companyLinks = [
    { to: '/company/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/company/post-internship', label: 'Post Internship', icon: PlusCircle },
    { to: '/company/applicants', label: 'Applicant Pipeline', icon: Users },
    { to: '/company/offers', label: 'Extended Offers', icon: Award },
    { to: '/company/interviews', label: 'Interviews', icon: Calendar },
    { to: '/company/profile', label: 'Company Profile', icon: Building2 },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Platform Metrics', icon: LayoutDashboard },
    { to: '/admin/drives', label: 'Placement Drives', icon: Calendar },
    { to: '/admin/offers', label: 'Offers & Placements', icon: Award },
    { to: '/admin/students', label: 'Student Standing KYC', icon: GraduationCap },
    { to: '/admin/companies', label: 'Company Approvals', icon: Building2 },
    { to: '/admin/internships', label: 'Internship Approvals', icon: CheckSquare },
    { to: '/admin/documents', label: 'Document Verifications', icon: ShieldCheck },
    { to: '/admin/skills', label: 'Skills Database', icon: Database },
    { to: '/admin/audit-logs', label: 'Audit Trail', icon: History },
  ];

  const links =
    user.role === 'STUDENT'
      ? studentLinks
      : user.role === 'COMPANY' || user.role === 'RECRUITER'
      ? companyLinks
      : adminLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile header inside drawer */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 lg:hidden">
          <span className="font-bold text-slate-900 dark:text-white">Navigation</span>
          <button onClick={onCloseMobile} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="px-3 mb-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              {user.role} PORTAL
            </span>
          </div>

          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-bold dark:bg-brand-950/50 dark:text-brand-400 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom banner for intelligent matching */}
        <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-lg shadow-brand-500/10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-brand-200" />
            <span className="text-xs font-bold">Smart Match Engine</span>
          </div>
          <p className="text-[11px] text-brand-100 leading-snug">
            Deterministic 5-factor scoring connects students to fitting opportunities.
          </p>
        </div>
      </aside>
    </>
  );
};
