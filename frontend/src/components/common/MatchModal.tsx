import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle, Sparkles, Award, GraduationCap, Briefcase, Lightbulb } from 'lucide-react';
import api from '../../api/client';
import { MatchResult, SkillGap, ApiResponse } from '../../types';

interface MatchModalProps {
  internshipId: number;
  onClose: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({ internshipId, onClose }) => {
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [gap, setGap] = useState<SkillGap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchRes, gapRes] = await Promise.all([
          api.get<ApiResponse<MatchResult>>(`/students/me/matches/${internshipId}`),
          api.get<ApiResponse<SkillGap>>(`/students/me/skill-gap/${internshipId}`),
        ]);
        if (matchRes.data.success) setMatch(matchRes.data.data);
        if (gapRes.data.success) setGap(gapRes.data.data);
      } catch (err) {
        console.error('Failed to load match details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [internshipId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Smart Match & Skill-Gap Analysis</h2>
              <p className="text-xs text-slate-500">Deterministic, explainable candidate suitability scoring</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Computing skill alignment & academic criteria...</p>
            </div>
          ) : match ? (
            <>
              {/* Overall Score Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-gradient-to-br from-brand-50 via-sky-50 to-indigo-50/30 border border-brand-100/80 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{match.matchScore}%</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-600 text-white shadow-sm">
                      Match Rating
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-md">{match.explanation}</p>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 border border-slate-200/60 shadow-sm">
                  {match.eligible ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  )}
                  <span className="text-xs font-bold text-slate-700">
                    {match.eligible ? 'Academic Criteria Met' : 'Eligibility Action Needed'}
                  </span>
                </div>
              </div>

              {/* 5-Factor Weighted Score Breakdown */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Scoring Components</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Award className="w-3.5 h-3.5 text-brand-600" />
                      <span>Required Skills</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{match.requiredSkillsScore} / 50 pts</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Preferred Skills</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{match.preferredSkillsScore} / 20 pts</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Projects & Exp</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{match.experienceScore} / 15 pts</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Academics & CGPA</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{match.academicScore} / 10 pts</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                      <span>Completeness</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{match.completenessScore} / 5 pts</span>
                  </div>
                </div>
              </div>

              {/* Skills Analysis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Matched Skills */}
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30">
                  <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Matched Skills ({match.matchedRequiredSkills.length + match.matchedPreferredSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {match.matchedRequiredSkills.map((s) => (
                      <span key={s} className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {s} (Required)
                      </span>
                    ))}
                    {match.matchedPreferredSkills.map((s) => (
                      <span key={s} className="px-2 py-0.5 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        {s} (Preferred)
                      </span>
                    ))}
                    {match.matchedRequiredSkills.length === 0 && match.matchedPreferredSkills.length === 0 && (
                      <p className="text-xs text-slate-400 italic">No matching skills identified</p>
                    )}
                  </div>
                </div>

                {/* Missing Skills (Skill Gap) */}
                <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/30">
                  <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5 mb-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    Skill Gaps ({match.missingRequiredSkills.length + match.missingPreferredSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {match.missingRequiredSkills.map((s) => (
                      <span key={s} className="px-2 py-0.5 text-xs font-semibold rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                        {s} (Missing Required)
                      </span>
                    ))}
                    {match.missingPreferredSkills.map((s) => (
                      <span key={s} className="px-2 py-0.5 text-xs font-medium rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        {s} (Preferred)
                      </span>
                    ))}
                    {match.missingRequiredSkills.length === 0 && match.missingPreferredSkills.length === 0 && (
                      <p className="text-xs text-emerald-600 font-medium">All technical skills satisfied! 🎯</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {gap && gap.recommendations && gap.recommendations.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Recommended Growth Path
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                    {gap.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">Unable to compute match analysis.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
