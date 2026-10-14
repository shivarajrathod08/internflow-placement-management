import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { MatchModal } from './MatchModal';

interface MatchBadgeProps {
  score?: number;
  internshipId?: number;
  showModalOnClick?: boolean;
}

export const MatchBadge: React.FC<MatchBadgeProps> = ({ score, internshipId, showModalOnClick = true }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (score === undefined || score === null) return null;

  const getTheme = (s: number) => {
    if (s >= 80) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
        ring: 'text-emerald-600',
      };
    }
    if (s >= 60) {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
        ring: 'text-amber-600',
      };
    }
    return {
      bg: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
      ring: 'text-slate-600',
    };
  };

  const theme = getTheme(score);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          if (showModalOnClick && internshipId) {
            e.stopPropagation();
            setIsOpen(true);
          }
        }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${theme.bg} shadow-sm hover:shadow transition-all ${
          showModalOnClick && internshipId ? 'cursor-pointer hover:scale-105' : 'cursor-default'
        }`}
        title="Click to view transparent match analysis & skill gap"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>{score}% Match</span>
      </button>

      {isOpen && internshipId && (
        <MatchModal internshipId={internshipId} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
};
