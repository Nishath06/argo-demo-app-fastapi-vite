import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { taskService } from '../services/taskService';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import ConfirmModal from '../components/ConfirmModal';
import TaskFilter from '../components/TaskFilter';
import StatCard from '../components/StatCard';
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  Loader2,
  Inbox,
  RefreshCw,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch tasks
  const fetchTasks = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await taskService.getTasks(params);
      setTasks(response.tasks || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Unable to load tasks. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Listen to global 'task-created' event from Navbar
  useEffect(() => {
    const handleGlobalTaskCreated = () => fetchTasks(true);
    window.addEventListener('task-created', handleGlobalTaskCreated);
    return () => window.removeEventListener('task-created', handleGlobalTaskCreated);
  }, [fetchTasks]);

  // Task Actions
  const handleToggleStatus = async (taskId, newStatus) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      await taskService.updateTask(taskId, { status: newStatus });
    } catch (err) {
      console.error('Failed to toggle status:', err);
      fetchTasks(true);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    if (editingTask) {
      await taskService.updateTask(editingTask.id, taskData);
    } else {
      await taskService.createTask(taskData);
    }
    fetchTasks(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await taskService.deleteTask(taskToDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      setTaskToDelete(null);
    } catch (err) {
      console.error('Failed to delete task:', err);
      alert('Could not delete task. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Metrics calculation
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-900">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Task Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Organize, monitor, and track your tasks in real time
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchTasks(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Refresh tasks"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tasks" value={totalTasks} icon={ListTodo} color="indigo" />
        <StatCard title="Pending" value={pendingTasks} icon={Clock} color="amber" />
        <StatCard title="In Progress" value={inProgressTasks} icon={AlertCircle} color="blue" />
        <StatCard title="Completed" value={completedTasks} icon={CheckCircle2} color="emerald" />
      </div>

      {/* Search & Filter Controls */}
      <TaskFilter
        search={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        totalCount={totalTasks}
      />

      {/* Content Area */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchTasks()}
            className="underline text-xs font-semibold hover:text-rose-300 ml-4 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
          <p className="text-sm">Loading your tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-500 mb-4">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No tasks found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {statusFilter || searchQuery
              ? 'No tasks matched your current filter criteria. Try clearing filters or search terms.'
              : 'You have no tasks created yet. Click "Create Task" to get started!'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-5 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create your first task</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleStatus={handleToggleStatus}
              onEdit={handleOpenEditModal}
              onDelete={(t) => setTaskToDelete(t)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTask}
        initialData={editingTask}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This cannot be undone.`}
      />
    </div>
  );
}
