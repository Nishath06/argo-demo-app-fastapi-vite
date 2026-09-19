export function formatDate(dateString) {
  if (!dateString) return 'No date';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dotClass: 'bg-amber-400',
  },
  in_progress: {
    label: 'In Progress',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dotClass: 'bg-blue-400',
  },
  completed: {
    label: 'Completed',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dotClass: 'bg-emerald-400',
  },
};

export const PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  },
  medium: {
    label: 'Medium',
    badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  high: {
    label: 'High',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
};
