'use client';

import { useTranslation } from 'react-i18next';
import { useTaskFilters, type TaskFiltersState } from '@/hooks/useTaskFilters';

const STATUS_OPTIONS: { key: TaskFiltersState['status']; labelKey: string }[] = [
  { key: 'all', labelKey: 'tasks.filter.all' },
  { key: 'pending', labelKey: 'tasks.status.pending' },
  { key: 'in-progress', labelKey: 'tasks.status.inProgress' },
  { key: 'completed', labelKey: 'tasks.status.completed' },
];

const PRIORITY_OPTIONS: { key: TaskFiltersState['priority']; labelKey: string }[] = [
  { key: 'all', labelKey: 'tasks.filter.all' },
  { key: 'high', labelKey: 'tasks.priority.high' },
  { key: 'medium', labelKey: 'tasks.priority.medium' },
  { key: 'low', labelKey: 'tasks.priority.low' },
];

export default function TaskFilters() {
  const { t } = useTranslation();
  const { filters, setFilter, resetFilters, activeCount } = useTaskFilters();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {t('tasks.filter.statusLabel')}
        </span>
        <div className="flex gap-1" role="group" aria-label={t('tasks.filter.statusAria')}>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setFilter('status', opt.key)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                filters.status === opt.key
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500'
              }`}
            >
              {opt.key === 'all' ? t(opt.labelKey) : t(opt.labelKey).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {t('tasks.filter.priorityLabel')}
        </span>
        <div className="flex gap-1" role="group" aria-label={t('tasks.filter.priorityAria')}>
          {PRIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setFilter('priority', opt.key)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                filters.priority === opt.key
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500'
              }`}
            >
              {opt.key === 'all' ? t(opt.labelKey) : t(opt.labelKey).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={resetFilters}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2"
        >
          {t('tasks.filter.clear')}
        </button>
      )}
    </div>
  );
}
