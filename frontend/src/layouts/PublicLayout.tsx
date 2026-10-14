import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Briefcase, Heart } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm text-slate-800 dark:text-white">InternFlow Enterprise</span>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            Built with production-grade engineering, strict domain modeling, and intelligent matching.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link to="/login" className="hover:text-slate-900">Sign In</Link>
            <Link to="/register/student" className="hover:text-slate-900">Students</Link>
            <Link to="/register/company" className="hover:text-slate-900">Employers</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
