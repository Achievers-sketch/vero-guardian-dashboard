'use client';

import { useMemo, useState, type ReactElement } from 'react';
import { Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { scaleBand } from 'd3-scale';
import { interpolateYlOrRd } from 'd3-scale-chromatic';

/** Soroban resource categories that make up a contract call's "gas" cost. */
export const GAS_METRICS = ['cpuInsns', 'memBytes', 'ledgerReads', 'ledgerWrites', 'events'] as const;
export type GasMetric = (typeof GAS_METRICS)[number];

/** i18n key suffixes for each metric's short column label. */
export const METRIC_LABEL_KEYS: Record<GasMetric, string> = {
  cpuInsns: 'gasHeatmap.metrics.cpuInsns',
  memBytes: 'gasHeatmap.metrics.memBytes',
  ledgerReads: 'gasHeatmap.metrics.ledgerReads',
  ledgerWrites: 'gasHeatmap.metrics.ledgerWrites',
  events: 'gasHeatmap.metrics.events',
};

export interface FunctionGasUsage {
  functionName: string;
  costs: Record<GasMetric, number>;
}

export interface HeatmapCell {
  functionName: string;
  metric: GasMetric;
  value: number;
  /** Value normalised against the column (metric) maximum, in the range [0, 1]. */
  intensity: number;
  /** True when this cell is the most expensive for its metric. */
  isHotspot: boolean;
}

export interface GasHotspot {
  metric: GasMetric;
  functionName: string;
  value: number;
}

/**
 * Representative per-function Soroban resource costs for the Vero contract.
 * Injectable via props so real testnet simulation data can replace it.
 */
export const DEFAULT_GAS_USAGE: FunctionGasUsage[] = [
  { functionName: 'cast_vote', costs: { cpuInsns: 12_500_000, memBytes: 524_288, ledgerReads: 8, ledgerWrites: 3, events: 2 } },
  { functionName: 'register_task', costs: { cpuInsns: 9_800_000, memBytes: 393_216, ledgerReads: 5, ledgerWrites: 6, events: 1 } },
  { functionName: 'tally_votes', costs: { cpuInsns: 41_200_000, memBytes: 1_310_720, ledgerReads: 24, ledgerWrites: 4, events: 5 } },
  { functionName: 'get_reputation', costs: { cpuInsns: 3_100_000, memBytes: 131_072, ledgerReads: 4, ledgerWrites: 0, events: 0 } },
  { functionName: 'set_role', costs: { cpuInsns: 7_400_000, memBytes: 262_144, ledgerReads: 3, ledgerWrites: 2, events: 1 } },
];

/** Compact human-readable formatting for a resource value (e.g. 41200000 → "41.2M"). */
export function formatGas(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

/** The most expensive function per metric — the gas hotspots. */
export function findHotspots(
  usages: FunctionGasUsage[],
  metrics: readonly GasMetric[] = GAS_METRICS
): GasHotspot[] {
  return metrics
    .map((metric) => {
      let top: GasHotspot | null = null;
      for (const usage of usages) {
        const value = usage.costs[metric] ?? 0;
        if (!top || value > top.value) {
          top = { metric, functionName: usage.functionName, value };
        }
      }
      return top;
    })
    .filter((hotspot): hotspot is GasHotspot => hotspot !== null && hotspot.value > 0);
}

/**
 * Build a rows-by-function grid of heatmap cells, normalising each metric column
 * independently so the hottest function for every resource stands out.
 */
export function buildHeatmap(
  usages: FunctionGasUsage[],
  metrics: readonly GasMetric[] = GAS_METRICS
): HeatmapCell[][] {
  const maxByMetric = new Map<GasMetric, number>();
  for (const metric of metrics) {
    const max = usages.reduce((acc, usage) => Math.max(acc, usage.costs[metric] ?? 0), 0);
    maxByMetric.set(metric, max);
  }

  return usages.map((usage) =>
    metrics.map((metric) => {
      const value = usage.costs[metric] ?? 0;
      const max = maxByMetric.get(metric) ?? 0;
      return {
        functionName: usage.functionName,
        metric,
        value,
        intensity: max > 0 ? value / max : 0,
        isHotspot: max > 0 && value === max,
      };
    })
  );
}

const MARGIN = { top: 32, right: 16, bottom: 12, left: 132 } as const;
const CELL_WIDTH = 104;
const CELL_HEIGHT = 48;

interface GasHeatmapProps {
  data?: FunctionGasUsage[];
  metrics?: readonly GasMetric[];
}

export default function GasHeatmap({
  data = DEFAULT_GAS_USAGE,
  metrics = GAS_METRICS,
}: GasHeatmapProps = {}): ReactElement {
  const { t } = useTranslation();
  // Local state holds the dataset so it can later be updated from live data.
  const [usages] = useState<FunctionGasUsage[]>(data);
  const [focused, setFocused] = useState<HeatmapCell | null>(null);

  const grid = useMemo(() => buildHeatmap(usages, metrics), [usages, metrics]);
  const hotspots = useMemo(() => findHotspots(usages, metrics), [usages, metrics]);

  const functionNames = usages.map((usage) => usage.functionName);
  const width = MARGIN.left + metrics.length * CELL_WIDTH + MARGIN.right;
  const height = MARGIN.top + functionNames.length * CELL_HEIGHT + MARGIN.bottom;

  const xScale = scaleBand<GasMetric>()
    .domain(metrics as GasMetric[])
    .range([MARGIN.left, width - MARGIN.right])
    .padding(0.06);
  const yScale = scaleBand<string>()
    .domain(functionNames)
    .range([MARGIN.top, height - MARGIN.bottom])
    .padding(0.12);

  if (usages.length === 0) {
    return (
      <section
        aria-label={t('gasHeatmap.ariaLabel')}
        className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5 text-orange-500" aria-hidden="true" />
          {t('gasHeatmap.heading')}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
          {t('gasHeatmap.empty')}
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label={t('gasHeatmap.ariaLabel')}
      className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" aria-hidden="true" />
            {t('gasHeatmap.heading')}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('gasHeatmap.subheading')}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span>{t('gasHeatmap.legendLow')}</span>
          <span
            className="h-2.5 w-24 rounded-full"
            style={{ background: `linear-gradient(to right, ${interpolateYlOrRd(0.05)}, ${interpolateYlOrRd(0.5)}, ${interpolateYlOrRd(1)})` }}
            aria-hidden="true"
          />
          <span>{t('gasHeatmap.legendHigh')}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          role="img"
          aria-label={t('gasHeatmap.ariaLabel')}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ minWidth: width }}
        >
          {/* Metric column headers */}
          {metrics.map((metric) => (
            <text
              key={`col-${metric}`}
              x={(xScale(metric) ?? 0) + xScale.bandwidth() / 2}
              y={MARGIN.top - 12}
              textAnchor="middle"
              className="fill-slate-600 dark:fill-slate-300 text-xs font-semibold"
            >
              {t(METRIC_LABEL_KEYS[metric])}
            </text>
          ))}

          {/* Function row labels */}
          {functionNames.map((name) => (
            <text
              key={`row-${name}`}
              x={MARGIN.left - 12}
              y={(yScale(name) ?? 0) + yScale.bandwidth() / 2}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-slate-700 dark:fill-slate-200 text-xs font-mono"
            >
              {name}
            </text>
          ))}

          {/* Cells */}
          {grid.map((row) =>
            row.map((cell) => {
              const x = xScale(cell.metric) ?? 0;
              const y = yScale(cell.functionName) ?? 0;
              const fill = interpolateYlOrRd(0.05 + cell.intensity * 0.95);
              const titleText = `${cell.functionName} · ${t(METRIC_LABEL_KEYS[cell.metric])}: ${formatGas(cell.value)}`;
              return (
                <g
                  key={`${cell.functionName}-${cell.metric}`}
                  onMouseEnter={() => setFocused(cell)}
                  onMouseLeave={() => setFocused(null)}
                >
                  <rect
                    data-testid="gas-cell"
                    data-hotspot={cell.isHotspot}
                    data-function={cell.functionName}
                    data-metric={cell.metric}
                    x={x}
                    y={y}
                    width={xScale.bandwidth()}
                    height={yScale.bandwidth()}
                    rx={6}
                    fill={fill}
                    stroke={cell.isHotspot ? '#7c2d12' : 'transparent'}
                    strokeWidth={cell.isHotspot ? 2 : 0}
                  >
                    <title>{titleText}</title>
                  </rect>
                  <text
                    x={x + xScale.bandwidth() / 2}
                    y={y + yScale.bandwidth() / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-medium pointer-events-none"
                    fill={cell.intensity > 0.55 ? '#ffffff' : '#1e293b'}
                  >
                    {formatGas(cell.value)}
                  </text>
                </g>
              );
            })
          )}
        </svg>
      </div>

      {focused && (
        <p className="mt-3 text-xs text-slate-600 dark:text-slate-300" aria-live="polite">
          {focused.functionName} · {t(METRIC_LABEL_KEYS[focused.metric])}: {formatGas(focused.value)}
        </p>
      )}

      {/* Hotspots summary */}
      <div className="mt-5 border-t border-slate-200 dark:border-slate-700 pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5" aria-hidden="true" />
          {t('gasHeatmap.hotspotsHeading')}
        </h4>
        <ul className="flex flex-wrap gap-2">
          {hotspots.map((hotspot) => (
            <li
              key={`hotspot-${hotspot.metric}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 text-xs"
            >
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {t(METRIC_LABEL_KEYS[hotspot.metric])}
              </span>
              <span className="font-mono text-slate-600 dark:text-slate-300">{hotspot.functionName}</span>
              <span className="text-orange-700 dark:text-orange-400">{formatGas(hotspot.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
