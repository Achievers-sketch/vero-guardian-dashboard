'use client';

import { CheckCircle2, Clock, AlertCircle, ShieldCheck } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'completed' | 'pending' | 'in-progress';
  reward: string;
  priority: 'high' | 'medium' | 'low';
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Verify multi-sig transaction security',
    status: 'in-progress',
    reward: '50 VERO',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Audit gas optimization changes',
    status: 'pending',
    reward: '35 VERO',
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Validate rate limiting implementation',
    status: 'completed',
    reward: '40 VERO',
    priority: 'high',
  },
];

export default function TaskCard() {
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-amber-400 animate-pulse" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    const styles = {
      high: 'bg-red-900/30 text-red-400 border-red-800',
      medium: 'bg-amber-900/30 text-amber-400 border-amber-800',
      low: 'bg-slate-800 text-slate-300 border-slate-700',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full border ${styles[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-emerald-400" />
        <h2 className="text-xl font-semibold text-white">Guardian Tasks</h2>
      </div>

      <div className="space-y-3">
        {mockTasks.map((task) => (
          <div
            key={task.id}
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 w-full">
                {getStatusIcon(task.status)}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-white leading-tight">{task.title}</h3>
                    {getPriorityBadge(task.priority)}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Status: <span className={`capitalize ${
                      task.status === 'completed' ? 'text-emerald-400' :
                      task.status === 'in-progress' ? 'text-amber-400' :
                      'text-slate-400'
                    }`}>{task.status}</span>
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t border-slate-700 sm:border-0 mt-2 sm:mt-0">
                <span className="text-lg font-semibold text-indigo-400">{task.reward}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
