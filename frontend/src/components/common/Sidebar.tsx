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
        className={`fixed top-0 lg:top-16 bottom-0 left-0 z-40 w-64 bg-[#F0EADF] border-r border-[#E5DED2] flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile header inside drawer */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#E5DED2] lg:hidden bg-[#F0EADF]">
          <span className="font-bold text-[#192844] tracking-tight">Navigation</span>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#192844] hover:bg-[#E5DCCB]/60 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <div className="px-3.5 mb-3 flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#786E5E]">
              {user.role} PORTAL
            </span>
            <span className="h-px flex-1 ml-3 bg-[#E5DED2]" />
          </div>

          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-[#FFFCF7] text-[#192844] font-bold shadow-sm border border-[#E5DED2] pl-3 border-l-4 border-l-[#192844]'
                      : 'text-[#64748B] hover:text-[#192844] hover:bg-[#EAE3D6]/70 border border-transparent font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#192844]' : 'text-[#64748B] group-hover:text-[#192844]'
                      }`}
                    />
                    <span className="truncate">{link.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom banner for intelligent matching - Restyled for Campus Ledger warm ivory theme */}
        <div className="p-3.5 m-3 rounded-2xl bg-[#E5DCCB] border border-[#D8CEBC] text-[#192844] shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-[#192844] shrink-0" />
            <span className="text-xs font-bold text-[#192844]">Smart Match Engine</span>
          </div>
          <p className="text-[11px] text-[#475569] leading-relaxed">
            Deterministic 5-factor scoring connects students to fitting opportunities.
          </p>
        </div>
      </aside>
    </>
  );
};
