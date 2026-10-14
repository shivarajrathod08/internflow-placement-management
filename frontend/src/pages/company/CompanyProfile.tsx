import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { CompanyProfile as CompanyProfileType, ApiResponse } from '../../types';
import Badge from '../../components/Badge';
import { Building2, Globe, MapPin, Briefcase, FileText, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export const CompanyProfile: React.FC = () => {
  const [profile, setProfile] = useState<CompanyProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    industry: '',
    location: '',
    description: '',
    logoUrl: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<ApiResponse<CompanyProfileType>>('/company/profile');
      if (res.data.success) {
        const data = res.data.data;
        setProfile(data);
        setFormData({
          companyName: data.companyName || '',
          website: data.website || '',
          industry: data.industry || '',
          location: data.location || '',
          description: data.description || '',
          logoUrl: data.logoUrl || '',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load company profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const res = await apiClient.put<ApiResponse<CompanyProfileType>>('/company/profile', formData);
      if (res.data.success) {
        setProfile(res.data.data);
        setSuccess('Company profile updated successfully!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update company profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />
        <div className="h-96 bg-white rounded-2xl border border-gray-100 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Profile & Verification</h1>
          <p className="text-gray-500 text-sm mt-1">
            Maintain your organization credentials, brand presence, and verification status.
          </p>
        </div>
        {profile && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">KYC Status:</span>
            <Badge status={profile.verificationStatus} />
          </div>
        )}
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KYC Warning / Notification */}
      {profile?.verificationStatus === 'PENDING' && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-sm">
          <h4 className="font-bold flex items-center gap-2 text-amber-800">
            <AlertCircle className="w-4 h-4" /> Account Pending Verification
          </h4>
          <p className="mt-1 text-amber-700">
            College placement admins review all new recruiter registrations to ensure valid corporate credentials. Once approved, your internship postings will immediately become visible to eligible students.
          </p>
        </div>
      )}

      {profile?.verificationStatus === 'REJECTED' && (
        <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-red-900 text-sm">
          <h4 className="font-bold flex items-center gap-2 text-red-800">
            <AlertCircle className="w-4 h-4" /> Verification Declined
          </h4>
          <p className="mt-1 text-red-700">
            <strong>Reason provided: </strong>
            {profile.rejectionReason || 'Incomplete or unverified corporate domain credentials.'}
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company / Organization Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Acme Corporation"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Official Website
            </label>
            <div className="relative">
              <Globe className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="https://acme.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Industry Sector
            </label>
            <div className="relative">
              <Briefcase className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Software & Cloud Services, Fintech, AI"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Headquarters / Location
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="San Francisco, CA or Bangalore, India"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Logo URL
            </label>
            <input
              type="url"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Overview & Culture
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Describe your company's mission, culture, team size, and what makes interning here exciting..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Updates...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default CompanyProfile;
