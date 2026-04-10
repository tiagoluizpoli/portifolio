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
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
  sourceId: string;
}
