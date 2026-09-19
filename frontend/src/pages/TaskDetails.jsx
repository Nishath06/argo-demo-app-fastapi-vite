import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { taskService } from '../services/taskService';
import TaskModal from '../components/TaskModal';
import ConfirmModal from '../components/ConfirmModal';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
  Loader2,
  CheckSquare,
} from 'lucide-react';
import { formatDate, formatDateTime, STATUS_CONFIG, PRIORITY_CONFIG } from '../utils/formatters';

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadTask() {
      setLoading(true);
      setError(null);
      try {
        const data = await taskService.getTask(id);
        setTask(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Task not found or inaccessible.');
      } finally {
        setLoading(false);
      }
    }
    loadTask();
  }, [id]);

  const handleUpdate = async (updatedData) => {
    const updated = await taskService.updateTask(id, updatedData);
    setTask(updated);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await taskService.deleteTask(id);
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to delete task.');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm">Loading task details...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-rose-400 text-sm mb-4">{error || 'Task not found'}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Back button */}
      <Link
        to="/dashboard"
        className="inline-flex items-center space-x-2 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all tasks</span>
      </Link>

      {/* Main card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${statusInfo.badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${statusInfo.dotClass}`} />
              {statusInfo.label}
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${priorityInfo.badgeClass}`}>
              Priority: {priorityInfo.label}
            </span>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Task Title & Description */}
        <div className="mt-6 space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {task.title}
          </h2>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {task.description || (
              <span className="italic text-slate-500">No description provided for this task.</span>
            )}
          </div>
        </div>

        {/* Meta details */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="block text-slate-500 uppercase tracking-wider font-semibold">Due Date</span>
            <span className="mt-1 flex items-center gap-1.5 text-slate-300 font-medium">
              <Calendar className="w-4 h-4 text-indigo-400" />
              {formatDate(task.due_date)}
            </span>
          </div>

          <div>
            <span className="block text-slate-500 uppercase tracking-wider font-semibold">Created At</span>
            <span className="mt-1 flex items-center gap-1.5 text-slate-300 font-medium">
              <Clock className="w-4 h-4 text-indigo-400" />
              {formatDateTime(task.created_at)}
            </span>
          </div>

          <div>
            <span className="block text-slate-500 uppercase tracking-wider font-semibold">Last Updated</span>
            <span className="mt-1 flex items-center gap-1.5 text-slate-300 font-medium">
              <Clock className="w-4 h-4 text-indigo-400" />
              {formatDateTime(task.updated_at)}
            </span>
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdate}
        initialData={task}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"?`}
      />
    </div>
  );
}
