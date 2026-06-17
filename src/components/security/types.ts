export type VulnerabilitySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'unknown';

export interface VulnerabilityFinding {
  id: string;
  severity: VulnerabilitySeverity;
  title: string;
  message?: string;
  location?: string;
  packageName?: string;
  recommendation?: string;
  source?: string;
  url?: string;
}

export interface VulnerabilityParseResult {
  findings: VulnerabilityFinding[];
  error: string | null;
}

export interface VulnerabilitySummary {
  totalCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  unknownCount: number;
}

