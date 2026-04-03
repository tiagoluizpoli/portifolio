import { useMemo } from 'react';

/**
 * MockDataEngine (Constitution §XV)
 * Provides seed-based, consistent mock metrics for the administrative dashboard.
 */
export const useMockAnalytics = (seed = 'zenith-v1', isEmpty = false) => {
  return useMemo(() => {
    if (isEmpty) {
      return {
        kpis: {
          visitors: 0,
          avgSessionTime: '0s',
          engagementRate: '0%',
        },
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
        visitors: Math.floor(pseudoRandom(1) * 5000) + 1200,
        avgSessionTime: (pseudoRandom(2) * 5 + 2).toFixed(1) + 'm',
        engagementRate: Math.floor(pseudoRandom(3) * 40) + 60 + '%',
      },
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
