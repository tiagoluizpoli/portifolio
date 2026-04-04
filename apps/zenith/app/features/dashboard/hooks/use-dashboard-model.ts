/**
 * useDashboardModel — Central data hook for the Dashboard orchestrator.
 *
 * FR-006: Extracts all data arrays, computed state, and business logic out of
 * `routes/index.tsx` so the route file can operate strictly as an orchestrator
 * (< 100 LoC). This hook is the single source of truth for all data-derived
 * props passed into the dashboard UI components.
 */

import { Activity, TrendingUp, Users, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Region } from '../components/geo-distribution';
import type { KpiCard } from '../components/kpi-cards';
import type { AxisLabel, SparklineBar } from '../components/temporal-density';
import { useMockAnalytics } from '@/services/mock-data-engine';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DashboardModel {
  // State
  isEmpty: boolean;
  activeRange: string;
  setActiveRange: (range: string) => void;

  // KPI data
  kpiCards: KpiCard[];

  // Temporal Density Chart data
  sparklineData: SparklineBar[];
  axisLabels: AxisLabel[];
  accessHistory: ReturnType<typeof useMockAnalytics>['accessHistory'];

  // Geographic Distribution data
  regions: Region[];
}

// ---------------------------------------------------------------------------
// Static data (stable references — defined outside hook to avoid re-allocation)
// ---------------------------------------------------------------------------

const REGIONS: Region[] = [
  {
    name: 'United States',
    code: 'US',
    requests: '12,405',
    latency: '18ms',
    status: 'low',
    distribution: 85,
    flag: '🇺🇸',
  },
  {
    name: 'Brazil',
    code: 'BR',
    requests: '8,921',
    latency: '24ms',
    status: 'low',
    distribution: 65,
    flag: '🇧🇷',
  },
  {
    name: 'Germany',
    code: 'DE',
    requests: '4,562',
    latency: '42ms',
    status: 'med',
    distribution: 45,
    flag: '🇩🇪',
  },
  {
    name: 'Japan',
    code: 'JP',
    requests: '2,100',
    latency: '112ms',
    status: 'high',
    distribution: 25,
    flag: '🇯🇵',
  },
];

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDashboardModel(isEmpty = false): DashboardModel {
  const { kpis, accessHistory } = useMockAnalytics('zenith-v1', isEmpty);
  const [activeRange, setActiveRange] = useState('24h');

  // Pre-calculate sparkline data for stable React keys (Guard §II)
  const sparklineData = useMemo<SparklineBar[]>(() => {
    return Array.from({ length: 48 }).map((_, i) => {
      const height = 20 + Math.sin(i * 0.3) * 30 + Math.random() * 40;
      const timeAgo = (48 - i) * 30; // 30-min intervals
      const hours = Math.floor(timeAgo / 60);
      const mins = timeAgo % 60;
      return {
        id: `bar-${i}`,
        height,
        label: hours > 0 ? `${hours}h ${mins}m ago` : `${mins}m ago`,
      };
    });
  }, []);

  // Pre-calculate axis labels for stable React keys (Guard §II)
  const axisLabels = useMemo<AxisLabel[]>(() => {
    const rangeValue = parseInt(activeRange, 10);
    const step = rangeValue / 4;
    return Array.from({ length: 5 }).map((_, i) => {
      const value = rangeValue - i * step;
      return {
        id: `axis-${i}`,
        value,
        displayValue:
          value === 0
            ? 'Now'
            : activeRange.includes('h')
              ? `${value}h ago`
              : `${value}m ago`,
      };
    });
  }, [activeRange]);

  // KPI cards definition (depends on live kpis data)
  const kpiCards = useMemo<KpiCard[]>(
    () => [
      {
        label: 'Total Portfolio Access',
        value: kpis.totalAccess.toLocaleString(),
        icon: Users,
        trend: 'stable',
        trendType: 'neutral',
      },
      {
        label: 'Access this Month',
        value: kpis.accessMonthly.toLocaleString(),
        icon: TrendingUp,
        trend: '+14%',
        trendType: 'up',
      },
      {
        label: 'New Contact Inquiries',
        value: kpis.newContacts,
        icon: Zap,
        trend: 'priority',
        trendType: 'up',
        highlight: true,
      },
      {
        label: 'Viewers Active',
        value: kpis.activeUsers,
        icon: Activity,
        trend: 'live',
        trendType: 'neutral',
        highlight: true,
      },
    ],
    [kpis],
  );

  return {
    isEmpty,
    activeRange,
    setActiveRange,
    kpiCards,
    sparklineData,
    axisLabels,
    accessHistory,
    regions: REGIONS,
  };
}
