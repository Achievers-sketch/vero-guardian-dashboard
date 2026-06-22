'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEvents } from '@/hooks/useEvents';
import { useTaskChainEvents } from '@/hooks/useTaskChainEvents';
import { useChainState } from '@/hooks/useChainState';

export interface TaskCardTask {
  id: string;
  title?: string;
  titleKey?: string;
  status: 'completed' | 'pending' | 'in-progress';
  is_done?: boolean;
  reward: string;
  priority: 'high' | 'medium' | 'low';
}

interface TaskCardProps {
  tasks?: TaskCardTask[];
  pollIntervalMs?: number;
}

const mockTasks: TaskCardTask[] = [
  {
    id: '1',
    titleKey: 'tasks.verifyMultiSig',
    status: 'in-progress',
    reward: '50 VERO',
    priority: 'high',
  },
  {
    id: '2',
    titleKey: 'tasks.auditGas',
    status: 'pending',
    reward: '35 VERO',
    priority: 'medium',
  },
  {
    id: '3',
    titleKey: 'tasks.validateRateLimit',
    status: 'completed',
    is_done: true,
    reward: '40 VERO',
    priority: 'high',
  },
];

function statusSortWeight(task: TaskCardTask): number {
  const s = task.is_done ? 'completed' : task.status;
  if (s === 'completed') return 3;
  if (s === 'in-progress') return 1;
  return 2;
}

export default function TaskCard({
  tasks: initialTasks = mockTasks,
  pollIntervalMs,
}: TaskCardProps) {
  const { t } = useTranslation();
  const { emit } = useEvents();
  const { forceSync } = useChainState({ cacheKey: 'tasks' });
  const { lastEvent } = useTaskChainEvents({ intervalMs: pollIntervalMs });

  const [taskList, setTaskList] = useState<TaskCardTask[]>(initialTasks);
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(initialTasks.filter((t) => t.is_done || t.status === 'completed').map((t) => t.id)),
  );
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  const sortedTasks = useMemo(
    () => [...taskList].sort((a, b) => statusSortWeight(a) - statusSortWeight(b)),
    [taskList],
  );

  useEffect(() => {
    if (initialTasks !== mockTasks) {
      setTaskList(initialTasks);
    }
  }, [initialTasks]);

  useEffect(() => {
    if (!lastEvent) return;
    const { taskId } = lastEvent;
    setTaskList((prev) => {
      const existing = prev.find((t) => t.id === taskId);
      if (!existing || existing.is_done || existing.status === 'completed') return prev;
      return prev.map((t) =>
        t.id === taskId ? { ...t, status: 'completed', is_done: true } : t,
      );
    });
    setCompletedIds((prev) => new Set(prev).add(taskId));
    setAnimatingId(taskId);
    const timer = setTimeout(() => setAnimatingId(null), 600);
    return () => clearTimeout(timer);
  }, [lastEvent]);

  const handleVote = useCallback(
    (task: TaskCardTask) => {
      const title = task.title ?? t(task.titleKey ?? '');
      setTaskList((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: 'completed', is_done: true } : t,
        ),
      );
      setCompletedIds((prev) => new Set(prev).add(task.id));
      setAnimatingId(task.id);
      setTimeout(() => setAnimatingId(null), 600);

      emit({
        type: 'task_verified',
        actor: 'guardian',
        resource: title,
        resourceId: task.id,
        metadata: { taskId: task.id, reward: task.reward },
      });

      forceSync(['tasks', `task:${task.id}`]);
    },
    [emit, forceSync, t],
  );

  const getStatusIcon = (status: TaskCardTask['status'], isAnimating: boolean) => {
    if (isAnimating) {
      return <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-bounce" aria-hidden="true" />;
    }
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-pulse" aria-hidden="true" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-slate-500 dark:text-slate-400" aria-hidden="true" />;
    }
  };

  const getPriorityBadge = (priority: TaskCardTask['priority']) => {
    const styles = {
      high: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
      medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
      low: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${styles[priority]}`}>
        {t(`tasks.priority.${priority}`)}
      </span>
    );
  };

  const getStatusLabel = (status: TaskCardTask['status']) => {
    if (status === 'in-progress') {
      return t('tasks.status.inProgress');
    }
    return t(`tasks.status.${status}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('tasks.heading')}</h2>
      </div>

      <div className="space-y-3">
        {sortedTasks.map((task) => {
          const status = task.is_done ? 'completed' : task.status;
          const title = task.title ?? t(task.titleKey ?? '');
          const canVote = !task.is_done && status !== 'completed';
          const isAnimating = animatingId === task.id;

          return (
            <div
              key={task.id}
              className={`bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm transition-all duration-500 ${
                isAnimating
                  ? 'border-emerald-400 dark:border-emerald-500 scale-[1.02] animate-in zoom-in-95 fade-in'
                  : 'hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 w-full">
                  {getStatusIcon(status, isAnimating)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-900 dark:text-white">{title}</h3>
                      {getPriorityBadge(task.priority)}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {t('common.status')}:{' '}
                      <span
                        className={`capitalize font-medium ${
                          status === 'completed'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : status === 'in-progress'
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {getStatusLabel(status)}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <span className="block text-lg font-semibold text-indigo-600 dark:text-indigo-400">{task.reward}</span>
                  {canVote && (
                    <button
                      type="button"
                      onClick={() => handleVote(task)}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 active:scale-95"
                      aria-label={`Vote for ${title}`}
                    >
                      Vote
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
