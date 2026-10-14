import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', size = 'md' }) => {
  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/40',
    info: 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800/40',
    primary: 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/40',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} transition-colors`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let variant: BadgeProps['variant'] = 'neutral';

  switch (status) {
    case 'APPROVED':
    case 'PUBLISHED':
    case 'SELECTED':
    case 'VERIFIED':
    case 'COMPLETED':
      variant = 'success';
      break;
    case 'PENDING':
    case 'PENDING_APPROVAL':
    case 'UNDER_REVIEW':
    case 'VERIFICATION_PENDING':
    case 'COMPLETION_SUBMITTED':
      variant = 'warning';
      break;
    case 'SHORTLISTED':
    case 'INTERVIEW_SCHEDULED':
    case 'IN_PROGRESS':
    case 'JOINED':
      variant = 'primary';
      break;
    case 'REJECTED':
    case 'SUSPENDED':
    case 'CLOSED':
    case 'WITHDRAWN':
      variant = 'danger';
      break;
    case 'DRAFT':
    case 'ARCHIVED':
    default:
      variant = 'neutral';
      break;
  }

  const formatText = (s: string) => {
    return s.replace(/_/g, ' ');
  };

  return <Badge variant={variant}>{formatText(status)}</Badge>;
};
