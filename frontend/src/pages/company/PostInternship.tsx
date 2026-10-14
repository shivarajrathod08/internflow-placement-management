import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { WorkMode, SkillItem, ApiResponse, Internship } from '../../types';
import { Briefcase, DollarSign, Calendar, Users, GraduationCap, X, Plus, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';

export const PostInternship: React.FC = () => {
  const navigate = useNavigate();
  const [canonicalSkills, setCanonicalSkills] = useState<SkillItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState<WorkMode>('REMOTE');
  const [durationMonths, setDurationMonths] = useState<number>(3);
  const [stipendPerMonth, setStipendPerMonth] = useState<number>(25000);
  const [minCgpa, setMinCgpa] = useState<number>(7.0);
  const [allowedBranches, setAllowedBranches] = useState('Computer Science, Information Technology, Electronics');
  const [graduationYear, setGraduationYear] = useState<number>(new Date().getFullYear());
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [openings, setOpenings] = useState<number>(2);

  // Skills
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['Java', 'Spring Boot']);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(['Docker', 'PostgreSQL']);
  const [reqSkillInput, setReqSkillInput] = useState('');
  const [prefSkillInput, setPrefSkillInput] = useState('');

  useEffect(() => {
    fetchSkills();
    // Default deadline to 30 days from now
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setApplicationDeadline(d.toISOString().slice(0, 16));
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await apiClient.get<ApiResponse<SkillItem[]>>('/skills/public');
      if (res.data.success) {
        setCanonicalSkills(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch canonical skills', err);
    }
  };

  const addRequiredSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !requiredSkills.includes(trimmed)) {
      setRequiredSkills([...requiredSkills, trimmed]);
      setReqSkillInput('');
    }
  };

  const removeRequiredSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  const addPreferredSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !preferredSkills.includes(trimmed)) {
      setPreferredSkills([...preferredSkills, trimmed]);
      setPrefSkillInput('');
    }
  };

  const removePreferredSkill = (skill: string) => {
    setPreferredSkills(preferredSkills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requiredSkills.length === 0) {
      setError('Please specify at least one required skill for matching algorithms.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        title,
        description,
        location,
        workMode,
        durationMonths,
        stipendPerMonth,
        minCgpa,
        allowedBranches,
        graduationYear,
        applicationDeadline: new Date(applicationDeadline).toISOString(),
        openings,
        requiredSkills,
        preferredSkills,
      };

      const res = await apiClient.post<ApiResponse<Internship>>('/internships/company', payload);
      if (res.data.success) {
        navigate('/company/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit internship role.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post New Internship</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Role will be vetted by College Placement Admins before opening to students.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-8">
        {/* Section 1: Role Basics */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            1. Role Overview
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Internship Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="e.g. Backend Engineering Intern (Cloud Platforms)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Mode <span className="text-red-500">*</span>
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ON_SITE">On-Site</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location / City
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="e.g. Bangalore, India or Remote"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (Months) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={durationMonths}
                onChange={(e) => setDurationMonths(parseInt(e.target.value) || 1)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Stipend (₹ INR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={stipendPerMonth}
                onChange={(e) => setStipendPerMonth(parseFloat(e.target.value) || 0)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Openings <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={openings}
                onChange={(e) => setOpenings(parseInt(e.target.value) || 1)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description & Responsibilities <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Explain the day-to-day responsibilities, mentorship opportunities, projects they will build, and qualifications..."
              />
            </div>
          </div>
        </div>

        {/* Section 2: Eligibility Criteria */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            2. Academic Eligibility
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum CGPA Requirement
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={minCgpa}
                onChange={(e) => setMinCgpa(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Graduation Year
              </label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(parseInt(e.target.value) || new Date().getFullYear())}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Eligible Branches (Comma-separated)
              </label>
              <input
                type="text"
                value={allowedBranches}
                onChange={(e) => setAllowedBranches(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="CSE, IT, ECE"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Smart Matching Skills */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              3. Smart Match Skill Requirements
            </h3>
            <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2.5 py-1 rounded-full">
              Canonical AI Normalization
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Skills are automatically mapped to canonical taxonomies to power the 5-factor explainable matching engine.
          </p>

          {/* Required Skills */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Required Skills (Strict Match Engine Weight: 40%) <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={reqSkillInput}
                onChange={(e) => setReqSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRequiredSkill(reqSkillInput);
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Type a skill and press Enter (e.g. Java, React, Python)..."
                list="canonical-skills-list"
              />
              <button
                type="button"
                onClick={() => addRequiredSkill(reqSkillInput)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[36px] p-2 bg-gray-50 rounded-xl border border-gray-200">
              {requiredSkills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-lg"
                >
                  {s}
                  <button type="button" onClick={() => removeRequiredSkill(s)} className="hover:text-indigo-950">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {requiredSkills.length === 0 && (
                <span className="text-xs text-gray-400 my-auto">No required skills added yet.</span>
              )}
            </div>
          </div>

          {/* Preferred Skills */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Preferred / Nice-to-Have Skills (Engine Weight: 20%)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={prefSkillInput}
                onChange={(e) => setPrefSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPreferredSkill(prefSkillInput);
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Type preferred skill and press Enter..."
                list="canonical-skills-list"
              />
              <button
                type="button"
                onClick={() => addPreferredSkill(prefSkillInput)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[36px] p-2 bg-gray-50 rounded-xl border border-gray-200">
              {preferredSkills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg"
                >
                  {s}
                  <button type="button" onClick={() => removePreferredSkill(s)} className="hover:text-emerald-950">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {preferredSkills.length === 0 && (
                <span className="text-xs text-gray-400 my-auto">No preferred skills added yet.</span>
              )}
            </div>
          </div>

          {/* Datalist for autocomplete */}
          <datalist id="canonical-skills-list">
            {canonicalSkills.map((sk) => (
              <option key={sk.id} value={sk.canonicalName} />
            ))}
          </datalist>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/company/dashboard')}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-7 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all shadow-md hover:scale-105"
          >
            {submitting ? 'Submitting Role...' : 'Submit for Admin Approval'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default PostInternship;
