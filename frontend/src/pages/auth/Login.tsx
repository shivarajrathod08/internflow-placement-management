import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Lock, Mail, ArrowRight, ShieldCheck, Building2, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const auth = await login(email, password);
      const redirectUrl =
        location.state?.from?.pathname ||
        (auth.role === 'STUDENT'
          ? '/student/dashboard'
          : auth.role === 'COMPANY'
          ? '/company/dashboard'
          : '/admin/dashboard');

      navigate(redirectUrl, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail: string, demoRole: string) => {
    setEmail(demoEmail);
    setPassword('Password@123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/20 mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Welcome back to Intern<span className="text-brand-600">Flow</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Enterprise Internship & Placement Platform</p>
        </div>

        {/* Demo Fast-Login Pills */}
        <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Quick Demo Login (Pre-seeded Accounts)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('admin@internflow.edu', 'Admin')}
              className="flex flex-col items-center p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100 text-purple-800 transition-all text-center"
            >
              <ShieldCheck className="w-4 h-4 mb-1 text-purple-600" />
              <span className="text-xs font-bold">Admin</span>
              <span className="text-[10px] text-purple-600 opacity-80">Director</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('recruiter@google.com', 'Company')}
              className="flex flex-col items-center p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-800 transition-all text-center"
            >
              <Building2 className="w-4 h-4 mb-1 text-blue-600" />
              <span className="text-xs font-bold">Employer</span>
              <span className="text-[10px] text-blue-600 opacity-80">Google LLC</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('student@college.edu', 'Student')}
              className="flex flex-col items-center p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-800 transition-all text-center"
            >
              <GraduationCap className="w-4 h-4 mb-1 text-emerald-600" />
              <span className="text-xs font-bold">Student</span>
              <span className="text-[10px] text-emerald-600 opacity-80">Alex R.</span>
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@organization.edu"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-black font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-black font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register/student" className="font-bold text-brand-600 hover:underline">
                Register as Student
              </Link>{' '}
              or{' '}
              <Link to="/register/company" className="font-bold text-brand-600 hover:underline">
                Employer
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
