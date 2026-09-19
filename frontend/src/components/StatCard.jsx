import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'indigo' }) {
  const colorMap = {
    indigo: 'from-indigo-500/10 to-indigo-500/5 text-indigo-400 border-indigo-500/20',
    amber: 'from-amber-500/10 to-amber-500/5 text-amber-400 border-amber-500/20',
    blue: 'from-blue-500/10 to-blue-500/5 text-blue-400 border-blue-500/20',
    emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
  };

  const currentTheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm hover:border-slate-700/80 transition-all shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1.5">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl border bg-gradient-to-br ${currentTheme}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
