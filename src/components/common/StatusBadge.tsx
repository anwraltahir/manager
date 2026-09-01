import React from 'react';
import { ProjectStatus } from '../../types';
import { useTranslation } from '../../utils/translations';
import { useApp } from '../../context/AppContext';

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const { language } = useApp();
  const t = useTranslation(language);

  const getStatusStyles = () => {
    switch (status) {
      case 'draft':
        return 'bg-slate-100 text-slate-600';
      case 'quotation_ready':
        return 'bg-sky-100 text-sky-700';
      case 'waiting_approval':
        return 'bg-orange-100 text-orange-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';
      case 'cancelled':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'draft':
        return t.status_draft;
      case 'quotation_ready':
        return t.status_quotation_ready;
      case 'waiting_approval':
        return t.status_waiting_approval;
      case 'in_progress':
        return t.status_in_progress;
      case 'completed':
        return t.status_completed;
      case 'cancelled':
        return t.status_cancelled;
      default:
        return status;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 font-bold',
    md: 'text-xs font-bold px-3 py-1',
    lg: 'text-sm font-bold px-3.5 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full ${getStatusStyles()} ${sizeClasses[size]} whitespace-nowrap`}
    >
      {getStatusLabel()}
    </span>
  );
};
