import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Circle, Clock, Edit2, Trash2, ArrowUpRight } from 'lucide-react';
import { formatDate, STATUS_CONFIG, PRIORITY_CONFIG } from '../utils/formatters';

export default function TaskCard({ task, onToggleStatus, onEdit, onDelete }) {
  const isCompleted = task.status === 'completed';
  const statusInfo = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  const handleToggle = () => {
    // Toggle between completed and pending
    const newStatus = isCompleted ? 'pending' : 'completed';
    onToggleStatus(task.id, newStatus);
  };

  return (
    <div
      className={`group relative bg-slate-900/60 border rounded-2xl p-5 backdrop-blur-sm transition-all duration-200 hover:shadow-lg hover:shadow-slate-950/50 ${
        isCompleted
          ? 'border-slate-800/50 bg-slate-900/30 opacity-80'
          : 'border-slate-800/90 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Checkbox and Title */}
        <div className="flex items-start space-x-3.5 flex-1 min-w-0">
          <button
            onClick={handleToggle}
            className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
            title={isCompleted ? 'Mark as pending' : 'Mark as complete'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
            ) : (
              <Circle className="w-5 h-5 hover:scale-110 transition-transform" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h4
              className={`text-base font-semibold leading-snug break-words transition-colors ${
                isCompleted ? 'line-through text-slate-400' : 'text-slate-100 group-hover:text-indigo-200'
              }`}
            >
              {task.title}
            </h4>

            {task.description && (
              <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <Link
            to={`/tasks/${task.id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
            title="View Details"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Edit task"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer tags and metadata */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          {/* Status Badge */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium border ${statusInfo.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusInfo.dotClass}`} />
            {statusInfo.label}
          </span>

          {/* Priority Badge */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium border ${priorityInfo.badgeClass}`}
          >
            {priorityInfo.label}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center space-x-1 text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(task.due_date || task.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
