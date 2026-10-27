import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Briefcase,
  LineChart,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  ShieldCheck,
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { ApiResponse, AuthResponse } from '../../types';
import { RegistrationLayout } from '../../components/auth/RegistrationLayout';

export const RegisterCompany: React.FC = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    website: '',
    industry: '',
    location: '',
    description: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!formData.companyName.trim()) {
      setError('Please provide your official company name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Recruiter work email is required.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }
    if (formData.website.trim() && !formData.website.startsWith('http://') && !formData.website.startsWith('https://')) {
      // Auto-prefix https:// if omitted
      formData.website = `https://${formData.website.trim()}`;
    }

    setLoading(true);

    try {
      await api.post<ApiResponse<AuthResponse>>('/auth/register/company', formData);
      await login(formData.email, formData.password);
      navigate('/company/dashboard');
    } catch (err: any) {
      const serverMsg = err.response?.data?.message;
      if (err.response?.status === 409) {
        setError(serverMsg || 'An account with this email address already exists. Please sign in instead.');
      } else if (err.response?.status === 400) {
        setError(serverMsg || 'Please review your registration details and ensure all required fields are correct.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Unable to reach the server. Please verify your connection and try again.');
      } else {
        setError(serverMsg || 'Failed to register employer account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const employerBenefits = [
    {
      icon: Building2,
      title: 'Access Campus Talent',
    },
    {
      icon: Briefcase,
      title: 'Structured Internship Postings',
    },
    {
      icon: LineChart,
      title: 'Manage Recruitment Progress',
    },
  ];

  return (
    <RegistrationLayout
      eyebrow="EMPLOYER REGISTRATION"
      title={
        <>
          Find the right talent.
          <br />
          Build your team.
        </>
      }
      description="Connect with verified campus talent and manage recruiting through InternFlow."
      benefits={employerBenefits}
      imageSrc="/images/employer-collaboration.jpg"
      fallbackImageSrc="/images/campus-hero.jpg"
      imageAlt="Recruiter interviewing and collaborating with candidates"
    >
      <div className="bg-[#FFFFFF] sm:bg-[#FFFCF7] rounded-3xl border border-[#E5DED2] p-7 sm:p-9 lg:p-10 shadow-sm space-y-6">
        <div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#192844] tracking-tight">
            Register Employer Account
          </h2>
          <p className="text-sm text-[#475569] mt-1.5">
            Connect with verified campus talent through InternFlow.
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
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Row 1: Company Name (Full Width) */}
          <div>
            <label htmlFor="companyName" className="block text-xs font-bold text-[#192844] mb-1.5">
              Official Company Name <span className="text-[#B91C1C]">*</span>
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="Acme Corporation"
              className="w-full px-3.5 h-11 sm:h-12 text-sm rounded-xl border border-[#E5DED2] bg-[#FFFEFB] text-[#111827] font-medium placeholder:text-[#8A8F98] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
            />
          </div>

          {/* Row 2: Recruiter Email & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#192844] mb-1.5">
                Recruiter Work Email <span className="text-[#B91C1C]">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="recruiter@company.com"
                className="w-full px-3.5 h-11 sm:h-12 text-sm rounded-xl border border-[#E5DED2] bg-[#FFFEFB] text-[#111827] font-medium placeholder:text-[#8A8F98] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#192844] mb-1.5">
                Password <span className="text-[#B91C1C]">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full pl-3.5 pr-11 h-11 sm:h-12 text-sm rounded-xl border border-[#E5DED2] bg-[#FFFEFB] text-[#111827] font-medium placeholder:text-[#8A8F98] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
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
          </div>

          {/* Row 3: Company Website & Industry / Domain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="website" className="block text-xs font-bold text-[#192844] mb-1.5">
                Company Website
              </label>
              <input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://company.com"
                className="w-full px-3.5 h-11 sm:h-12 text-sm rounded-xl border border-[#E5DED2] bg-[#FFFEFB] text-[#111827] font-medium placeholder:text-[#8A8F98] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-xs font-bold text-[#192844] mb-1.5">
                Industry / Domain
              </label>
              <input
                id="industry"
                name="industry"
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g. Cloud Software / FinTech"
                className="w-full px-3.5 h-11 sm:h-12 text-sm rounded-xl border border-[#E5DED2] bg-[#FFFEFB] text-[#111827] font-medium placeholder:text-[#8A8F98] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Row 4: Headquarters Location (Full Width) */}
          <div>
            <label htmlFor="location" className="block text-xs font-bold text-[#192844] mb-1.5">
              Headquarters Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Bengaluru, India or San Francisco, CA"
              className="w-full px-3.5 h-11 sm:h-12 text-sm rounded-xl border border-[#E5DED2] bg-[#FFFEFB] text-[#111827] font-medium placeholder:text-[#8A8F98] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
            />
          </div>

          {/* Row 5: Company Description (Full Width Textarea) */}
          <div>
            <label htmlFor="description" className="block text-xs font-bold text-[#192844] mb-1.5">
              Company Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell candidates about your company mission and internship program..."
              className="w-full p-3.5 text-sm rounded-xl border border-[#E5DED2] bg-[#FFFEFB] text-[#111827] font-medium placeholder:text-[#8A8F98] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all resize-y"
            />
          </div>

          {/* KYC & Verification Notice */}
          <div className="flex items-center justify-center gap-2 pt-1 text-xs text-[#64748B] text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
            <span>Institutional KYC Notice: New employer accounts require campus administrator approval before postings go live.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-2 rounded-xl bg-[#192844] hover:bg-[#24375d] text-[#FFFFFF] text-sm font-semibold shadow-xs transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting KYC Registration...</span>
              </div>
            ) : (
              <>
                <span>Register Company</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Sign In Footer */}
        <div className="pt-4 border-t border-[#E5DED2] text-center">
          <p className="text-sm text-[#475569]">
            Already registered?{' '}
            <Link
              to="/login"
              className="font-bold text-[#4F46E5] hover:text-[#3730A3] transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </RegistrationLayout>
  );
};
