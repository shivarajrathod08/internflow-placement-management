import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Briefcase, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PublicLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getDashboardRoute = () => {
    if (!user) return '/login';
    if (user.role === 'STUDENT') return '/student/dashboard';
    if (user.role === 'COMPANY' || user.role === 'RECRUITER') return '/company/dashboard';
    return '/admin/dashboard';
  };

  const handleSectionNav = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', `/#${sectionId}`);
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#192844] flex flex-col antialiased">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="mt-auto border-t border-[#E5DED2] bg-[#FFFCF7] py-8 sm:py-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#192844] text-[#FFFCF7] flex items-center justify-center shadow-xs">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="text-lg font-black tracking-tight text-[#192844]">
                  Intern<span className="text-[#4F46E5]">Flow</span>
                </span>
              </Link>
              <p className="text-xs text-[#475569] mt-2 max-w-sm">
                A calm, audit-grade internship and campus placement operating system for modern universities and enterprise recruiters.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-[#475569]">
              {user ? (
                <>
                  <Link to={getDashboardRoute()} className="hover:text-[#192844] transition-colors flex items-center gap-1">
                    My Dashboard <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link to="/offers" className="hover:text-[#192844] transition-colors">
                    Offers & Joining
                  </Link>
                  <Link to="/drives" className="hover:text-[#192844] transition-colors">
                    Placement Drives
                  </Link>
                </>
              ) : (
                <>
                  <a
                    href="/#students"
                    onClick={(e) => handleSectionNav(e, 'students')}
                    className="hover:text-[#192844] transition-colors"
                  >
                    Students
                  </a>
                  <a
                    href="/#employers"
                    onClick={(e) => handleSectionNav(e, 'employers')}
                    className="hover:text-[#192844] transition-colors"
                  >
                    Employers
                  </a>
                  <a
                    href="/#placement-cells"
                    onClick={(e) => handleSectionNav(e, 'placement-cells')}
                    className="hover:text-[#192844] transition-colors"
                  >
                    Placement Cells
                  </a>
                  <Link to="/login" className="hover:text-[#192844] transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register/student" className="text-[#4F46E5] hover:text-[#4338CA] font-bold">
                    Student Registration
                  </Link>
                  <Link to="/register/company" className="text-[#192844] hover:text-[#4F46E5] font-bold">
                    Employer Registration
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-[#E5DED2] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#786E5E]">
            <p>
              Built with Spring Boot 3.3, relational PostgreSQL persistence, and verified state-machine governance.
            </p>
            <p>© 2026 InternFlow. Institutional Placement Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
