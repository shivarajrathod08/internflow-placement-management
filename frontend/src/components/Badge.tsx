import React from 'react';
import { Badge as CommonBadge, StatusBadge } from './common/Badge';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary' | 'purple';
  size?: 'sm' | 'md';
  status?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, status, variant, size }) => {
  if (status) {
    return <StatusBadge status={status} />;
  }
  return <CommonBadge variant={variant} size={size}>{children}</CommonBadge>;
};

export default Badge;
export { StatusBadge };
