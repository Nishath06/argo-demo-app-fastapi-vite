import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, loading = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-3 text-rose-400 mb-3">
          <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">{title || 'Confirm Action'}</h3>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          {message || 'Are you sure you want to proceed? This action cannot be undone.'}
        </p>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-5 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-rose-600/20 cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
