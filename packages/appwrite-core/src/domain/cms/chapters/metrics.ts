/**
 * Metrics Domain Model (Constitution §XVII)
 * Defines the structure for impact metrics and their telemetry sources.
 */

export interface MetricSource {
  id: string;
  name: string;
  type: string;
  iconCode: string;
  functionId?: string;
  status: string;
}

export interface ImpactMetric {
  id: string;
  aboutId: string;
  internalCode: string;
  locale: string;
  label: string;
  value?: string;
  prefix?: string;
  suffix?: string;
  sourceId: string;
  iconCode?: string;
  isPlaceholder: boolean;
}
