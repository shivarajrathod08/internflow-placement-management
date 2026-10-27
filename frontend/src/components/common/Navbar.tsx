import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, Check, Menu, Briefcase, User as UserIcon, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Badge } from './Badge';

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';
  const isRegisterStudentPage = location.pathname === '/register/student';
  const isRegisterCompanyPage = location.pathname === '/register/company';

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '/');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#FFFCF7]/95 backdrop-blur-md border-b border-[#E5DED2] transition-colors">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile toggle + Brand logo */}
        <div className="flex items-center gap-6">
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="p-2 -ml-2 rounded-xl text-[#64748B] hover:text-[#192844] hover:bg-[#F0EADF] lg:hidden transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] rounded-xl"
            aria-label="InternFlow Homepage"
          >
            <div className="w-9 h-9 rounded-xl bg-[#192844] text-[#FFFCF7] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-[#192844] flex items-center gap-0.5">
                Intern<span className="text-[#4F46E5]">Flow</span>
              </span>
            </div>
          </Link>

          {/* Public navigation links (Campus Ledger reference style) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#475569]">
            <a
              href="/#students"
              onClick={(e) => handleSectionNav(e, 'students')}
              className="hover:text-[#192844] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 rounded-md transition-colors"
            >
              Students
            </a>
            <a
              href="/#employers"
              onClick={(e) => handleSectionNav(e, 'employers')}
              className="hover:text-[#192844] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 rounded-md transition-colors"
            >
              Employers
            </a>
            <a
              href="/#placement-cells"
              onClick={(e) => handleSectionNav(e, 'placement-cells')}
              className="hover:text-[#192844] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 rounded-md transition-colors"
            >
              Placement Cells
            </a>
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {user ? (
            <>
              {/* Direct Dashboard Link */}
              <Link
                to={getDashboardRoute()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#FFFCF7] bg-[#192844] hover:bg-[#24375d] transition-colors shadow-xs"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>

              {/* Notification Bell (Only shown for authenticated users) */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-xl text-[#64748B] hover:text-[#192844] hover:bg-[#F0EADF] relative transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#B91C1C] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popover */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#FFFCF7] border border-[#E5DED2] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5DED2] bg-[#F7F4EE]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#192844]">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#B91C1C]">
                            {unreadCount} New
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-semibold text-[#4F46E5] hover:text-[#4338CA]"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-[#E5DED2]">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 hover:bg-[#F0EADF]/60 transition-colors flex items-start gap-3 ${
                              !n.read ? 'bg-[#EEF2FF]' : ''
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-[#192844] leading-tight">{n.title}</p>
                              <p className="text-xs text-[#475569] mt-0.5 line-clamp-2">{n.message}</p>
                              <span className="text-[10px] text-[#786E5E] mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {!n.read && (
                              <button
                                onClick={() => markAsRead(n.id)}
                                className="p-1 rounded-md text-[#64748B] hover:text-[#4F46E5]"
                                title="Mark as read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-xs text-[#786E5E]">No notifications yet.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-xl hover:bg-[#F0EADF] transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#192844] text-[#FFFCF7] font-bold text-xs flex items-center justify-center shadow-xs border border-[#E5DED2]">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <span className="text-xs font-bold text-[#192844] block leading-tight">
                      {user.name || user.email}
                    </span>
                    <span className="text-[10px] font-bold text-[#786E5E] uppercase tracking-wide">
                      {user.role}
                    </span>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#FFFCF7] border border-[#E5DED2] shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-[#E5DED2] mb-1">
                      <p className="text-xs font-bold text-[#192844] truncate">{user.name || user.email}</p>
                      <p className="text-[11px] text-[#64748B] truncate">{user.email}</p>
                    </div>

                    <Link
                      to={
                        user.role === 'STUDENT'
                          ? '/student/profile'
                          : user.role === 'COMPANY' || user.role === 'RECRUITER'
                          ? '/company/profile'
                          : '/admin/profile'
                      }
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#192844] hover:bg-[#F0EADF] transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-[#786E5E]" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to={getDashboardRoute()}
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#192844] hover:bg-[#F0EADF] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#786E5E]" />
                      <span>Dashboard</span>
                    </Link>

                    <div className="border-t border-[#E5DED2] my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#B91C1C] hover:bg-[#FEE2E2] transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5 sm:gap-3">
              {isLoginPage ? (
                <>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#475569] hover:text-[#192844] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Home</span>
                  </Link>
                  <Link
                    to="/register/student"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#192844] hover:bg-[#24375d] text-[#FFFCF7] shadow-xs transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              ) : isRegisterStudentPage ? (
                <>
                  <Link
                    to="/"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#475569] hover:text-[#192844] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Home</span>
                  </Link>
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-xs font-bold text-[#192844] hover:text-[#4F46E5] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register/company"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#192844] hover:bg-[#24375d] text-[#FFFCF7] shadow-xs transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              ) : isRegisterCompanyPage ? (
                <>
                  <Link
                    to="/"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#475569] hover:text-[#192844] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Home</span>
                  </Link>
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-xs font-bold text-[#192844] hover:text-[#4F46E5] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register/student"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#192844] hover:bg-[#24375d] text-[#FFFCF7] shadow-xs transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-xs font-bold text-[#192844] hover:text-[#4F46E5] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register/student"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#192844] hover:bg-[#24375d] text-[#FFFCF7] shadow-xs transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
