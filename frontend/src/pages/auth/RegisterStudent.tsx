import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Calendar,
  Eye,
  EyeOff,
  AlertCircle,
  X,
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { ApiResponse, AuthResponse } from '../../types';
import { RegistrationLayout } from '../../components/auth/RegistrationLayout';

export const RegisterStudent: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    college: '',
    degree: 'B.Tech / B.E.',
    branch: '',
    graduationYear: 2026,
    cgpa: 8.0,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleCgpaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setFormData((prev) => ({
      ...prev,
      cgpa: isNaN(val) ? ('' as any) : val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (formData.cgpa === ('' as any) || Number(formData.cgpa) < 0 || Number(formData.cgpa) > 10) {
      setError('CGPA must be a valid score between 0.00 and 10.00.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please provide both your first and last name.');
      return;
    }
    if (!formData.college.trim() || !formData.branch.trim()) {
      setError('Please enter your college name and branch of study.');
      return;
    }

    setLoading(true);

    try {
      await api.post<ApiResponse<AuthResponse>>('/auth/register/student', formData);
      await login(formData.email, formData.password);
      navigate('/student/dashboard');
    } catch (err: any) {
      const serverMsg = err.response?.data?.message;
      if (err.response?.status === 409) {
        setError(serverMsg || 'An account with this email address already exists. Please sign in instead.');
      } else if (err.response?.status === 400) {
        setError(serverMsg || 'Please review your profile details and ensure all required fields are correct.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Unable to reach the server. Please verify your connection and try again.');
      } else {
        setError(serverMsg || 'Failed to create student account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const studentBenefits = [
    {
      icon: ShieldCheck,
      title: 'Verified Opportunities',
    },
    {
      icon: BarChart3,
      title: 'Transparent Eligibility',
    },
    {
      icon: Calendar,
      title: 'Application Tracking',
    },
  ];

  return (
    <RegistrationLayout
      eyebrow="STUDENT REGISTRATION"
      title={
        <>
          Create your
          <br />
          student profile.
        </>
      }
      description="Build your profile to discover eligible internships and track your applications."
      benefits={studentBenefits}
      imageSrc="/images/campus-students-ledger.jpg"
      fallbackImageSrc="/images/campus-students.jpg"
      imageAlt="Students collaborating on university campus"
    >
      <div className="bg-[#FFFFFF] sm:bg-[#FFFCF7] rounded-3xl border border-[#E5DED2] p-7 sm:p-9 lg:p-10 shadow-sm space-y-6">
        <div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#192844] tracking-tight">
            Create Student Profile
          </h2>
          <p className="text-sm text-[#475569] mt-1.5">
            Fill in your details to get started with InternFlow
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
          {/* Row 1: First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-xs font-bold text-[#192844] mb-1.5">
                First Name <span className="text-[#B91C1C]">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Your first name"
                className="w-full px-3.5 h-11 sm:h-12 text-sm rounded-xl border border-[#E5DED2] bg-[#FFFEFB] text-[#111827] font-medium placeholder:text-[#8A8F98] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-xs font-bold text-[#192844] mb-1.5">
                Last Name <span className="text-[#B91C1C]">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Your last name"
                className="w-full px-3.5 h-11 sm:h-12 text-sm rounded-xl border border-[#E5DED2] bg-[#FFFEFB] text-[#111827] font-medium placeholder:text-[#8A8F98] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Row 2: University Email & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#192844] mb-1.5">
                University Email <span className="text-[#B91C1C]">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@university.edu"
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
                  placeholder="Create a password"
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

          {/* Row 3: Phone Number & Graduation Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-[#192844] mb-1.5">
                Phone Number <span className="text-[#B91C1C]">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 h-11 sm:h-12 text-sm rounded-xl border border-[#E5DED2] bg-[#FFFEFB] text-[#111827] font-medium placeholder:text-[#8A8F98] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="graduationYear" className="block text-xs font-bold text-[#192844] mb-1.5">
                Graduation Year <span className="text-[#B91C1C]">*</span>
              </label>
              <select
                id="graduationYear"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value, 10) || 2026 })}
                className="w-full px-3.5 h-11 sm:h-12 text-sm rounded-xl border border-[#E5DED2] bg-[#FFFEFB] text-[#111827] font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
                <option value={2028}>2028</option>
                <option value={2029}>2029</option>
                <option value={2030}>2030</option>
              </select>
            </div>
          </div>

          {/* Row 4: CGPA & College / University */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="cgpa" className="block text-xs font-bold text-[#192844]">
                  CGPA (out of 10) <span className="text-[#B91C1C]">*</span>
                </label>
                <span className="text-[10px] font-semibold text-[#64748B]">Scale: 0.00 – 10.00</span>
              </div>
              <input
                id="cgpa"
                name="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                value={formData.cgpa}
                onChange={handleCgpaChange}
                placeholder="e.g. 8.0"
                className="w-full px-3.5 h-11 sm:h-12 text-sm rounded-xl border border-[#E5DED2] bg-[#FFFEFB] text-[#111827] font-medium placeholder:text-[#8A8F98] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="college" className="block text-xs font-bold text-[#192844] mb-1.5">
                College / University <span className="text-[#B91C1C]">*</span>
              </label>
              <input
                id="college"
                name="college"
                type="text"
                required
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                placeholder="e.g. CMRIT"
                className="w-full px-3.5 h-11 sm:h-12 text-sm rounded-xl border border-[#E5DED2] bg-[#FFFEFB] text-[#111827] font-medium placeholder:text-[#8A8F98] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Row 5: Degree Program & Branch / Major */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="degree" className="block text-xs font-bold text-[#192844] mb-1.5">
                Degree Program <span className="text-[#B91C1C]">*</span>
              </label>
              <select
                id="degree"
                name="degree"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full px-3.5 h-11 sm:h-12 text-sm rounded-xl border border-[#E5DED2] bg-[#FFFEFB] text-[#111827] font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
              >
                <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                <option value="B.S.">B.S. (Bachelor of Science)</option>
                <option value="B.C.A.">B.C.A.</option>
                <option value="M.Tech / M.E.">M.Tech / M.E.</option>
                <option value="M.S.">M.S. (Master of Science)</option>
                <option value="MCA">M.C.A.</option>
                <option value="Dual Degree">Dual Degree (B.Tech + M.Tech)</option>
              </select>
            </div>

            <div>
              <label htmlFor="branch" className="block text-xs font-bold text-[#192844] mb-1.5">
                Branch / Major <span className="text-[#B91C1C]">*</span>
              </label>
              <input
                id="branch"
                name="branch"
                type="text"
                required
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                placeholder="e.g. Computer Science"
                className="w-full px-3.5 h-11 sm:h-12 text-sm rounded-xl border border-[#E5DED2] bg-[#FFFEFB] text-[#111827] font-medium placeholder:text-[#8A8F98] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Privacy & Opportunity Matching Notice */}
          <div className="flex items-center justify-center gap-2 pt-1 text-xs text-[#64748B]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
            <span>Your profile data will be used to show relevant placement opportunities.</span>
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
                <span>Creating Student Account...</span>
              </div>
            ) : (
              <>
                <span>Create account and continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Sign In Footer */}
        <div className="pt-4 border-t border-[#E5DED2] text-center">
          <p className="text-sm text-[#475569]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-[#4F46E5] hover:text-[#3730A3] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </RegistrationLayout>
  );
};
