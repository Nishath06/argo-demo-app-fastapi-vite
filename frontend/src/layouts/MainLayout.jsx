import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TaskModal from '../components/TaskModal';
import { taskService } from '../services/taskService';

export default function MainLayout({ onTaskCreated }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateTask = async (taskData) => {
    await taskService.createTask(taskData);
    if (onTaskCreated) {
      onTaskCreated();
    }
    // Dispatch custom event for dashboard refresh
    window.dispatchEvent(new CustomEvent('task-created'));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar onOpenCreateModal={() => setIsModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 TaskFlow Starter. Production-ready for Kubernetes & EKS.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              FastAPI + React 19 Stack
            </span>
          </div>
        </div>
      </footer>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}
