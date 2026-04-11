/**
 * Metrics Domain Model (Constitution §XVII)
 * Defines the structure for impact metrics and their telemetry sources.
 */

export interface MetricSource {
  id: string;
  title: string;
  type: string;
}

export interface ImpactMetric {
  id: string;
  aboutId: string;
  internalCode: string; // [NEW] Round 4 Parity Handle
  locale: string; // [NEW] Round 4
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
  sourceId: string;
  sourceKey?: string; // [NEW] Key for System Source telemetry
  iconCode?: string; // [NEW] Round 4 Iconography Support
}
