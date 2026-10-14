import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { SkillItem, ApiResponse } from '../../types';
import Modal from '../../components/Modal';
import {
  Sparkles,
  Plus,
  Search,
  Tag,
  FolderTree,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
} from 'lucide-react';

export const SkillManager: React.FC = () => {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search & Category
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Create Skill Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCanonicalName, setNewCanonicalName] = useState('');
  const [newCategory, setNewCategory] = useState('Frameworks & Libraries');
  const [newDescription, setNewDescription] = useState('');
  const [newAliasesInput, setNewAliasesInput] = useState('');
  const [creatingSkill, setCreatingSkill] = useState(false);

  // Add Alias Modal
  const [aliasSkill, setAliasSkill] = useState<SkillItem | null>(null);
  const [aliasInput, setAliasInput] = useState('');
  const [addingAlias, setAddingAlias] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<ApiResponse<SkillItem[]>>('/skills/public');
      if (res.data.success) {
        setSkills(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load canonical skills.');
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(skills.map((s) => s.category))).filter(Boolean);

  const filteredSkills = skills.filter((s) => {
    const matchesSearch =
      s.canonicalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.aliases?.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingSkill(true);
      setError(null);

      const aliases = newAliasesInput
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const res = await apiClient.post<ApiResponse<SkillItem>>('/skills/admin', {
        canonicalName: newCanonicalName,
        category: newCategory,
        description: newDescription,
        aliases,
      });

      if (res.data.success) {
        setSuccess(`Canonical skill "${newCanonicalName}" created successfully!`);
        setCreateModalOpen(false);
        setNewCanonicalName('');
        setNewDescription('');
        setNewAliasesInput('');
        fetchSkills();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create canonical skill.');
    } finally {
      setCreatingSkill(false);
    }
  };

  const handleAddAlias = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aliasSkill || !aliasInput.trim()) return;

    try {
      setAddingAlias(true);
      setError(null);

      const res = await apiClient.post(`/skills/admin/${aliasSkill.id}/aliases`, {
        alias: aliasInput.trim(),
      });

      if (res.data.success) {
        setSuccess(`Alias "${aliasInput.trim()}" mapped to ${aliasSkill.canonicalName}.`);
        setAliasSkill(null);
        setAliasInput('');
        fetchSkills();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add alias.');
    } finally {
      setAddingAlias(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Canonical Skill Taxonomy & Aliases</h1>
          <p className="text-gray-500 text-sm mt-1">
            Maintain normalized skill definitions and keyword aliases that power the 5-factor matching algorithm.
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Canonical Skill
        </button>
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

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search canonical skills or alias keywords (e.g. 'js', 'golang', 'k8s')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Categories ({skills.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">No skills match your query</h3>
          <p className="text-gray-500 text-sm mt-1">Try a different search keyword or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((sk) => (
            <div
              key={sk.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-gray-900 text-base">{sk.canonicalName}</h4>
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {sk.category}
                  </span>
                </div>

                {sk.description && <p className="text-xs text-gray-500 line-clamp-2">{sk.description}</p>}

                <div className="pt-2">
                  <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                    Normalized Aliases:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {sk.aliases && sk.aliases.length > 0 ? (
                      sk.aliases.map((alias) => (
                        <span
                          key={alias}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[11px] rounded-md border border-gray-200"
                        >
                          {alias}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">No aliases registered</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => {
                    setAliasSkill(sk);
                    setAliasInput('');
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Alias
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Skill Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Canonical Skill">
        <form onSubmit={handleCreateSkill} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Canonical Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newCanonicalName}
              onChange={(e) => setNewCanonicalName(e.target.value)}
              required
              placeholder="e.g. Kubernetes, Rust, GraphQL"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="Programming Languages">Programming Languages</option>
              <option value="Frameworks & Libraries">Frameworks & Libraries</option>
              <option value="Cloud & DevOps">Cloud & DevOps</option>
              <option value="Databases">Databases</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="Core CS & Fundamentals">Core CS & Fundamentals</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Brief description or purpose of this skill..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Aliases (Comma-separated)
            </label>
            <input
              type="text"
              value={newAliasesInput}
              onChange={(e) => setNewAliasesInput(e.target.value)}
              placeholder="e.g. k8s, kube, container orchestration"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingSkill}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm"
            >
              {creatingSkill ? 'Saving...' : 'Save Canonical Skill'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Alias Modal */}
      <Modal
        isOpen={!!aliasSkill}
        onClose={() => setAliasSkill(null)}
        title={`Add Alias for: ${aliasSkill?.canonicalName}`}
      >
        <form onSubmit={handleAddAlias} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alias Keyword <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={aliasInput}
              onChange={(e) => setAliasInput(e.target.value)}
              required
              placeholder="e.g. js, k8s, tf, node"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Whenever a candidate or recruiter enters this alias keyword, it resolves to{' '}
              <strong>{aliasSkill?.canonicalName}</strong>.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setAliasSkill(null)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingAlias || !aliasInput.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm"
            >
              {addingAlias ? 'Mapping...' : 'Add Alias Mapping'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default SkillManager;
