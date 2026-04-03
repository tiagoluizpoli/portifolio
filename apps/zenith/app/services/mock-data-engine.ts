import { useMemo } from 'react';

/**
 * MockDataEngine (Constitution §XV)
 * Provides seed-based, consistent mock metrics for the administrative dashboard.
 */
export interface AnalyticsData {
  kpis: {
    totalAccess: number;
    accessMonthly: number;
    newContacts: number;
    activeUsers: number;
  };
  accessHistory: { label: string; value: number }[];
  geoDistribution: { country: string; code: string; value: number }[];
}

export const useMockAnalytics = (
  seed = 'zenith-v1',
  isEmpty = false,
): AnalyticsData => {
  return useMemo(() => {
    if (isEmpty) {
      return {
        kpis: {
          totalAccess: 0,
          accessMonthly: 0,
          newContacts: 0,
          activeUsers: 0,
        },
        accessHistory: [
          { label: '1h', value: 0 },
          { label: '6h', value: 0 },
          { label: '12h', value: 0 },
          { label: '24h', value: 0 },
        ],
        geoDistribution: [],
      };
    }

    // Basic seed-based random generator for consistency
    const pseudoRandom = (offset: number) => {
      let hash = 0;
      const combinedSeed = seed + offset.toString();
      for (let i = 0; i < combinedSeed.length; i++) {
        hash = (hash << 5) - hash + combinedSeed.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash % 100) / 100;
    };

    return {
      kpis: {
        totalAccess: Math.floor(pseudoRandom(1) * 50000) + 12000,
        accessMonthly: Math.floor(pseudoRandom(2) * 5000) + 1200,
        newContacts: Math.floor(pseudoRandom(3) * 12),
        activeUsers: Math.floor(pseudoRandom(4) * 40) + 5,
      },
      accessHistory: [
        { label: '1h', value: Math.floor(pseudoRandom(5) * 100) },
        { label: '6h', value: Math.floor(pseudoRandom(6) * 600) },
        { label: '12h', value: Math.floor(pseudoRandom(7) * 1200) },
        { label: '24h', value: Math.floor(pseudoRandom(8) * 2400) },
      ],
      geoDistribution: [
        { country: 'United States', code: 'US', value: 42 },
        { country: 'Brazil', code: 'BR', value: 28 },
        { country: 'Germany', code: 'DE', value: 15 },
        { country: 'Japan', code: 'JP', value: 10 },
        { country: 'Others', code: 'UN', value: 5 },
      ],
    };
  }, [seed]);
};
