'use client';

import { useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export interface TaskFiltersState {
  status: string;
  priority: string;
}

const DEFAULT_FILTERS: TaskFiltersState = {
  status: 'all',
  priority: 'all',
};

function parseFilters(sp: URLSearchParams): TaskFiltersState {
  const status = sp.get('status') || DEFAULT_FILTERS.status;
  const priority = sp.get('priority') || DEFAULT_FILTERS.priority;
  return { status, priority };
}

export function useTaskFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const setFilter = useCallback(
    (key: keyof TaskFiltersState, value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === DEFAULT_FILTERS[key]) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const activeCount = useMemo(
    () => [filters.status !== 'all', filters.priority !== 'all'].filter(Boolean).length,
    [filters],
  );

  return { filters, setFilter, resetFilters, activeCount };
}
