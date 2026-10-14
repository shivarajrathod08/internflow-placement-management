import React, { useEffect, useState } from 'react';
import {
  User,
  BookOpen,
  Code2,
  FolderGit2,
  Briefcase,
  Award,
  FileUp,
  Plus,
  Trash2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import api from '../../api/client';
import { StudentProfile, StudentSkill, ProjectDTO, ExperienceDTO, CertificationDTO, ApiResponse } from '../../types';

export const StudentProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'skills' | 'projects' | 'experience' | 'certs' | 'resume'>('personal');
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [personalForm, setPersonalForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    college: '',
    degree: '',
    branch: '',
    graduationYear: 2026,
    cgpa: 8.5,
    bio: '',
  });

  const [newSkill, setNewSkill] = useState({
    skillName: '',
    proficiencyLevel: 'INTERMEDIATE',
    yearsExperience: 1.0,
  });

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    techStack: '',
    githubUrl: '',
    liveUrl: '',
  });

  const [newExperience, setNewExperience] = useState({
    organizationName: '',
    role: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  });

  const [newCert, setNewCert] = useState({
    name: '',
    issuingOrg: '',
    issueDate: '',
    credentialUrl: '',
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await api.get<ApiResponse<StudentProfile>>('/students/me');
      if (res.data.success) {
        setProfile(res.data.data);
        setPersonalForm({
          firstName: res.data.data.firstName || '',
          lastName: res.data.data.lastName || '',
          phone: res.data.data.phone || '',
          college: res.data.data.college || '',
          degree: res.data.data.degree || '',
          branch: res.data.data.branch || '',
          graduationYear: res.data.data.graduationYear || 2026,
          cgpa: res.data.data.cgpa || 8.0,
          bio: res.data.data.bio || '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdatePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/students/me', personalForm);
      setSuccessMsg('Personal and academic profile updated successfully!');
      fetchProfile();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert('Failed to update profile.');
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.skillName.trim()) return;
    try {
      await api.post('/students/me/skills', newSkill);
      setNewSkill({ skillName: '', proficiencyLevel: 'INTERMEDIATE', yearsExperience: 1.0 });
      fetchProfile();
    } catch (err) {
      alert('Failed to add skill.');
    }
  };

  const handleRemoveSkill = async (id: number) => {
    try {
      await api.delete(`/students/me/skills/${id}`);
      fetchProfile();
    } catch (err) {
      alert('Failed to remove skill.');
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;
    try {
      await api.post('/students/me/projects', newProject);
      setNewProject({ title: '', description: '', techStack: '', githubUrl: '', liveUrl: '' });
      fetchProfile();
    } catch (err) {
      alert('Failed to add project.');
    }
  };

  const handleRemoveProject = async (id?: number) => {
    if (!id) return;
    try {
      await api.delete(`/students/me/projects/${id}`);
      fetchProfile();
    } catch (err) {
      alert('Failed to delete project.');
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExperience.organizationName.trim()) return;
    try {
      await api.post('/students/me/experiences', newExperience);
      setNewExperience({ organizationName: '', role: '', startDate: '', endDate: '', current: false, description: '' });
      fetchProfile();
    } catch (err) {
      alert('Failed to add experience.');
    }
  };

  const handleRemoveExperience = async (id?: number) => {
    if (!id) return;
    try {
      await api.delete(`/students/me/experiences/${id}`);
      fetchProfile();
    } catch (err) {
      alert('Failed to delete experience.');
    }
  };

  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.name.trim()) return;
    try {
      await api.post('/students/me/certifications', newCert);
      setNewCert({ name: '', issuingOrg: '', issueDate: '', credentialUrl: '' });
      fetchProfile();
    } catch (err) {
      alert('Failed to add certification.');
    }
  };

  const handleRemoveCert = async (id?: number) => {
    if (!id) return;
    try {
      await api.delete(`/students/me/certifications/${id}`);
      fetchProfile();
    } catch (err) {
      alert('Failed to delete certification.');
    }
  };

  const handleUploadResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) return;

    const data = new FormData();
    data.append('file', resumeFile);
    data.append('documentType', 'RESUME');

    try {
      await api.post('/documents/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMsg('Resume uploaded successfully!');
      fetchProfile();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload resume.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold">Loading student profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Profile & Credentials</h1>
        <p className="text-xs text-slate-500 mt-1">
          Keep your academic records and verified skills updated for maximum match scores.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-px">
        {[
          { id: 'personal', label: 'Personal & Academics', icon: User },
          { id: 'skills', label: 'Technical Skills', icon: Code2 },
          { id: 'projects', label: 'Projects', icon: FolderGit2 },
          { id: 'experience', label: 'Experience', icon: Briefcase },
          { id: 'certs', label: 'Certifications', icon: Award },
          { id: 'resume', label: 'Resume Document', icon: FileUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Personal & Academics */}
      {activeTab === 'personal' && (
        <form onSubmit={handleUpdatePersonal} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">First Name</label>
              <input
                type="text"
                required
                value={personalForm.firstName}
                onChange={(e) => setPersonalForm({ ...personalForm, firstName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Last Name</label>
              <input
                type="text"
                required
                value={personalForm.lastName}
                onChange={(e) => setPersonalForm({ ...personalForm, lastName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={personalForm.phone}
                onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">College / University</label>
              <input
                type="text"
                value={personalForm.college}
                onChange={(e) => setPersonalForm({ ...personalForm, college: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Degree</label>
              <input
                type="text"
                value={personalForm.degree}
                onChange={(e) => setPersonalForm({ ...personalForm, degree: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Branch / Specialization</label>
              <input
                type="text"
                value={personalForm.branch}
                onChange={(e) => setPersonalForm({ ...personalForm, branch: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Graduation Year</label>
              <input
                type="number"
                value={personalForm.graduationYear}
                onChange={(e) => setPersonalForm({ ...personalForm, graduationYear: parseInt(e.target.value) || 2026 })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Current CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={personalForm.cgpa}
                onChange={(e) => setPersonalForm({ ...personalForm, cgpa: parseFloat(e.target.value) || 8.0 })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Bio & Professional Summary</label>
            <textarea
              rows={3}
              value={personalForm.bio}
              onChange={(e) => setPersonalForm({ ...personalForm, bio: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
            >
              Save Academic Details
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Technical Skills */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <form onSubmit={handleAddSkill} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Skill Name (Auto-normalized)</label>
              <input
                type="text"
                required
                placeholder="e.g. React, Spring Boot, PyTorch, Docker"
                value={newSkill.skillName}
                onChange={(e) => setNewSkill({ ...newSkill, skillName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="w-full sm:w-44">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Proficiency</label>
              <select
                value={newSkill.proficiencyLevel}
                onChange={(e) => setNewSkill({ ...newSkill, proficiencyLevel: e.target.value })}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              >
                <option value="BEGINNER">Beginner (0.6x)</option>
                <option value="INTERMEDIATE">Intermediate (0.8x)</option>
                <option value="ADVANCED">Advanced (1.0x)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
          </form>

          {/* List of Skills */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4">Current Skills ({profile?.skills.length || 0})</h3>
            <div className="flex flex-wrap gap-2">
              {profile?.skills && profile.skills.length > 0 ? (
                profile.skills.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <span>{s.skillName}</span>
                    <span className="text-[10px] text-brand-600 font-bold px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/50">
                      {s.proficiencyLevel}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s.skillId)}
                      className="text-slate-400 hover:text-rose-600 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No skills added yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <form onSubmit={handleAddProject} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Add Technical Project</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Key-Value Store"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tech Stack</label>
                <input
                  type="text"
                  placeholder="Java, Spring Boot, RocksDB, Docker"
                  value={newProject.techStack}
                  onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Description</label>
              <textarea
                rows={2}
                placeholder="Architectural overview, key features, and scale..."
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">GitHub URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/user/project"
                  value={newProject.githubUrl}
                  onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Live Demo URL</label>
                <input
                  type="url"
                  placeholder="https://myproject.demo.com"
                  value={newProject.liveUrl}
                  onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </button>
          </form>

          {/* Project Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile?.projects && profile.projects.length > 0 ? (
              profile.projects.map((p) => (
                <div key={p.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-sm text-slate-900">{p.title}</h4>
                      <button
                        onClick={() => handleRemoveProject(p.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                    {p.techStack && (
                      <p className="text-[11px] font-semibold text-brand-600 mt-2">
                        Stack: {p.techStack}
                      </p>
                    )}
                  </div>
                  {p.githubUrl && (
                    <a
                      href={p.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-slate-700 hover:text-brand-600 mt-3 inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Code</span>
                    </a>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4">No projects added yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Experience */}
      {activeTab === 'experience' && (
        <div className="space-y-6">
          <form onSubmit={handleAddExperience} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Add Work / Internship Experience</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Company / Organization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon Web Services"
                  value={newExperience.organizationName}
                  onChange={(e) => setNewExperience({ ...newExperience, organizationName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Role / Position</label>
                <input
                  type="text"
                  required
                  placeholder="Software Development Intern"
                  value={newExperience.role}
                  onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Key Responsibilities & Achievements</label>
              <textarea
                rows={2}
                value={newExperience.description}
                onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Experience</span>
            </button>
          </form>

          <div className="space-y-3">
            {profile?.experiences && profile.experiences.length > 0 ? (
              profile.experiences.map((exp) => (
                <div key={exp.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{exp.role}</h4>
                    <p className="text-xs font-semibold text-brand-600">{exp.organizationName}</p>
                    <p className="text-xs text-slate-500 mt-1">{exp.description}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4">No experience entries recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Certifications */}
      {activeTab === 'certs' && (
        <div className="space-y-6">
          <form onSubmit={handleAddCert} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Add Professional Certification</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Certification Name</label>
                <input
                  type="text"
                  required
                  placeholder="AWS Solutions Architect Associate"
                  value={newCert.name}
                  onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Issuing Organization</label>
                <input
                  type="text"
                  required
                  placeholder="Amazon Web Services"
                  value={newCert.issuingOrg}
                  onChange={(e) => setNewCert({ ...newCert, issuingOrg: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Credential Verification URL</label>
              <input
                type="url"
                placeholder="https://credly.com/badges/..."
                value={newCert.credentialUrl}
                onChange={(e) => setNewCert({ ...newCert, credentialUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Certification</span>
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile?.certifications && profile.certifications.length > 0 ? (
              profile.certifications.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{c.name}</h4>
                    <p className="text-[11px] text-slate-500">{c.issuingOrg}</p>
                    {c.credentialUrl && (
                      <a
                        href={c.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-brand-600 hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Verify Credential</span>
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveCert(c.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4">No certifications added yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Resume */}
      {activeTab === 'resume' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Official Resume Document</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload your latest PDF resume. Recruiters access this directly when shortlisting candidates.
            </p>
          </div>

          {profile?.resumeUrl && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileUp className="w-5 h-5 text-brand-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Current Resume Attached</p>
                  <p className="text-[10px] text-slate-500">Verified by platform</p>
                </div>
              </div>
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                View / Download
              </a>
            </div>
          )}

          <form onSubmit={handleUploadResume} className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-brand-300 transition-colors">
              <FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Choose PDF resume file (Max 10MB)</p>
              <input
                type="file"
                accept=".pdf"
                required
                onChange={(e) => setResumeFile(e.target.files ? e.target.files[0] : null)}
                className="mt-3 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
            </div>

            <button
              type="submit"
              disabled={!resumeFile}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              Upload New Resume
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export { StudentProfilePage as StudentProfile };
export default StudentProfilePage;
