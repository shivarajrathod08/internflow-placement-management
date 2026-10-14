import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title?: string;
  label?: string;
  value: string | number;
  icon?: React.ReactNode | LucideIcon;
  subtitle?: string;
  trend?: string;
  trendPositive?: boolean;
  color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'indigo';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  label,
  value,
  icon,
  subtitle,
  trend,
  trendPositive = true,
  color = 'blue',
}) => {
  const displayLabel = title || label || '';
  const displaySubtitle = subtitle || trend;

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
  };

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon as LucideIcon;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{displayLabel}</span>
        {icon && <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>{renderIcon()}</div>}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</span>
        {displaySubtitle && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-md ${
              trendPositive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {displaySubtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
