import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  GraduationCap,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  HelpCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Demo login shortcuts are strictly development-only and hidden by default in production
  const isDemoMode =
    import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_LOGIN === 'true';

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password || loading) return;

    setError(null);
    setLoading(true);

    try {
      const auth = await login(email, password);

      // Role-aware destination redirect
      let defaultDashboard = '/student/dashboard';
      if (auth.role === 'COMPANY' || auth.role === 'RECRUITER') {
        defaultDashboard = '/company/dashboard';
      } else if (
        auth.role === 'ADMIN' ||
        auth.role === 'TPO' ||
        auth.role === 'FACULTY_COORDINATOR'
      ) {
        defaultDashboard = '/admin/dashboard';
      }

      const redirectUrl = location.state?.from?.pathname || defaultDashboard;
      navigate(redirectUrl, { replace: true });
    } catch (err: any) {
      // Clean, sanitized error message without exposing backend stack traces
      const serverMessage = err.response?.data?.message;
      if (err.response?.status === 401 || err.response?.status === 400) {
        setError(serverMessage || 'Invalid email or password. Please verify your credentials.');
      } else if (err.response?.status === 403) {
        setError('Your account is currently inactive or pending administrator approval.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Unable to reach authentication server. Please check your network connection.');
      } else {
        setError('An authentication error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 animate-in fade-in duration-200">
      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Campus Ledger Editorial Brand Introduction */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#786E5E] block">
              Academic Placement Network
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-normal text-[#192844] leading-[1.12] tracking-tight">
              Your next opportunity starts here.
            </h1>
            <p className="text-sm text-[#475569] leading-relaxed pt-1">
              Sign in to access your verified university placement ledger. Connect directly with approved enterprise employers, track stage-gated application workflows, and formalize internship offers.
            </p>
          </div>

          {/* Genuine Implemented Feature Highlights */}
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#F0EADF] text-[#192844] flex items-center justify-center shrink-0 border border-[#E5DED2]">
                <GraduationCap className="w-4 h-4 text-[#192844]" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#192844]">Explainable 5-Factor Matching</h2>
                <p className="text-[11px] text-[#475569] mt-0.5 leading-normal">
                  Deterministic alignment matching student skill taxonomy, CGPA thresholds, and branch criteria.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#F0EADF] text-[#192844] flex items-center justify-center shrink-0 border border-[#E5DED2]">
                <Building2 className="w-4 h-4 text-[#192844]" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#192844]">Multi-Stage Technical Pipeline</h2>
                <p className="text-[11px] text-[#475569] mt-0.5 leading-normal">
                  Structured interview scheduling, evaluation scorecards, and live candidate tracking.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#F0EADF] text-[#192844] flex items-center justify-center shrink-0 border border-[#E5DED2]">
                <ShieldCheck className="w-4 h-4 text-[#192844]" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#192844]">Audited Offers & Day 1 Joining</h2>
                <p className="text-[11px] text-[#475569] mt-0.5 leading-normal">
                  Official offer letters, secure candidate response states, and verified joining confirmation.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E5DED2]/80">
            <p className="text-[11px] text-[#786E5E]">
              Institutional Single Sign-On & JWT security backed by Spring Boot 3.3 and relational PostgreSQL storage.
            </p>
          </div>
        </div>

        {/* Right Column: The Login Card */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div className="w-full max-w-[440px] space-y-4">
            {/* Demo Fast-Login Pills (Development Only) */}
            {isDemoMode && (
              <div className="p-4 rounded-2xl bg-[#F0EADF] border border-[#E5DED2] text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#786E5E]">
                    Dev Mode · Quick Pre-seeded Credentials
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#E5DCCB] text-[#192844] rounded border border-[#D8CEBC]">
                    Local
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    aria-label="Student demo account: Alex Rivera"
                    onClick={() => fillDemoCredentials('student@college.edu')}
                    className="flex flex-col items-center p-2 rounded-xl bg-[#FFFCF7] hover:bg-[#FFFEFB] border border-[#E5DED2] text-center transition-all active:scale-95"
                  >
                    <span className="text-xs font-bold text-[#192844]">Student</span>
                    <span className="text-[10px] text-[#64748B]">Alex R.</span>
                  </button>

                  <button
                    type="button"
                    aria-label="Employer demo account: Google"
                    onClick={() => fillDemoCredentials('recruiter@google.com')}
                    className="flex flex-col items-center p-2 rounded-xl bg-[#FFFCF7] hover:bg-[#FFFEFB] border border-[#E5DED2] text-center transition-all active:scale-95"
                  >
                    <span className="text-xs font-bold text-[#192844]">Employer</span>
                    <span className="text-[10px] text-[#64748B]">Google</span>
                  </button>

                  <button
                    type="button"
                    aria-label="Admin demo account: TPO Lead"
                    onClick={() => fillDemoCredentials('admin@internflow.edu')}
                    className="flex flex-col items-center p-2 rounded-xl bg-[#FFFCF7] hover:bg-[#FFFEFB] border border-[#E5DED2] text-center transition-all active:scale-95"
                  >
                    <span className="text-xs font-bold text-[#192844]">Admin</span>
                    <span className="text-[10px] text-[#64748B]">TPO Lead</span>
                  </button>
                </div>
              </div>
            )}

            {/* Login Card */}
            <div className="bg-[#FFFCF7] rounded-3xl border border-[#E5DED2] p-7 sm:p-9 shadow-xs space-y-6">
              <div>
                <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#192844]">
                  Sign in to your account
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Enter your registered institutional or employer credentials below.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] rounded-xl text-xs flex items-start justify-between gap-2 animate-in fade-in duration-150">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">{error}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="text-[#B91C1C] hover:text-[#991B1B] p-0.5 rounded"
                    aria-label="Dismiss error"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-[#192844] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#786E5E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="name@organization.edu"
                      className="w-full pl-10 pr-4 h-11 sm:h-12 text-xs sm:text-sm rounded-xl border border-[#E5DED2] bg-[#FFFEFB] text-[#192844] font-medium placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-xs font-bold text-[#192844]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowRecoveryModal(true)}
                      className="text-[11px] font-semibold text-[#4F46E5] hover:text-[#3730A3] transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#786E5E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 h-11 sm:h-12 text-xs sm:text-sm rounded-xl border border-[#E5DED2] bg-[#FFFEFB] text-[#192844] font-medium placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#786E5E] hover:text-[#192844] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full h-11 sm:h-12 mt-2 rounded-xl bg-[#192844] hover:bg-[#24375d] text-[#FFFCF7] text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Registration Footer */}
              <div className="pt-5 border-t border-[#E5DED2] text-center">
                <p className="text-xs text-[#64748B]">
                  New to InternFlow?{' '}
                  <Link
                    to="/register/student"
                    className="font-bold text-[#4F46E5] hover:text-[#3730A3] transition-colors"
                  >
                    Register as Student
                  </Link>{' '}
                  or{' '}
                  <Link
                    to="/register/company"
                    className="font-bold text-[#4F46E5] hover:text-[#3730A3] transition-colors"
                  >
                    Employer
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Account Recovery Modal */}
      {showRecoveryModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-[#FFFCF7] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E5DED2] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E5DED2] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F0EADF] text-[#192844] flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-[#192844]">Account Recovery Policy</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRecoveryModal(false)}
                className="text-[#64748B] hover:text-[#192844] hover:bg-[#F0EADF] p-1.5 rounded-xl transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#475569] leading-relaxed">
              <p>
                To maintain regulatory compliance and secure verified student records, self-service password reset is disabled for institutional accounts.
              </p>
              <div className="p-3 bg-[#F0EADF] rounded-xl border border-[#E5DED2] space-y-1">
                <p className="font-bold text-[#192844]">Next steps to recover access:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-[#475569]">
                  <li>Students: Contact your department Training & Placement (TPO) coordinator.</li>
                  <li>Employers: Reach out to your assigned campus recruitment liaison.</li>
                  <li>Campus Staff: Contact your system administrator at <span className="font-mono text-[#192844]">admin@internflow.edu</span>.</li>
                </ul>
              </div>
              <p className="text-[11px] text-[#786E5E]">
                Once verified, placement administration will issue a secure temporary credential.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRecoveryModal(false)}
                className="px-4 py-2 rounded-xl bg-[#192844] text-[#FFFCF7] text-xs font-bold hover:bg-[#24375d] transition-colors shadow-xs"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
