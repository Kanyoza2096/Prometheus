/**
 * Typed REST API client for the Kanyoza Flask backend (/api/v1/*)
 *
 * Functions accept an ApiConfig object so they stay decoupled from React/Zustand.
 * Callers read { restEndpoint, masterToken } from the store and pass them in.
 *
 * All functions throw on non-2xx responses — callers / TanStack Query will
 * catch and surface the error via isError / error states.
 */

export interface ApiConfig {
  restEndpoint: string;
  masterToken: string;
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function request<T>(
  config: ApiConfig,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const base = config.restEndpoint.replace(/\/+$/, '');
  const url = `${base}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.masterToken}`,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`[${res.status}] ${body}`);
  }
  return res.json() as Promise<T>;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface StatsPayload {
  messages_today: number;
  posts_published: number;
  active_users: number;
  api_calls_today: number;
  guardian_issues: number;
  services: Record<string, boolean>;
}
export const fetchStats = (cfg: ApiConfig) =>
  request<StatsPayload>(cfg, '/dashboard/live');

// ── Health ────────────────────────────────────────────────────────────────────

export interface ServiceHealthEntry {
  status: 'ok' | 'error' | 'degraded';
  latency_ms?: number;
  page_name?: string;
  reason?: string;
}
export interface HealthDeepPayload {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  services: Record<string, ServiceHealthEntry>;
}
export const fetchHealth = (cfg: ApiConfig) =>
  request<HealthDeepPayload>(cfg, '/health/deep');

// ── Backend Status / Config ───────────────────────────────────────────────────

export interface StatusConfig {
  config: {
    ai_provider: string;
    content_posting_hours_utc: number[];
    news_posting_hours_utc: number[];
    environment: string;
    facebook_configured: boolean;
    gemini_key_configured: boolean;
    gemini_model: string;
    guardian_enabled: boolean;
    rate_limit_per_user: number;
    supabase_enabled: boolean;
  };
  version: string;
}
export const fetchStatus = (cfg: ApiConfig) =>
  request<StatusConfig>(cfg, '/status');

// ── AI Persona ────────────────────────────────────────────────────────────────

export interface PersonaPayload {
  tone: number;
  aggression: number;
  humor: number;
  model: string;
  system_prompt: string;
}
export const fetchPersona = (cfg: ApiConfig) =>
  request<PersonaPayload>(cfg, '/ai/persona');

export const applyPersona = (cfg: ApiConfig, payload: PersonaPayload) =>
  request<{ ok: boolean }>(cfg, '/ai/persona', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// ── Workflow ──────────────────────────────────────────────────────────────────

export type WorkflowJobStatus = 'running' | 'paused' | 'idle' | 'error';

export interface WorkflowStatusPayload {
  status: WorkflowJobStatus;
  progress: number;
  current_step: string;
}
export const fetchWorkflowStatus = (cfg: ApiConfig) =>
  request<WorkflowStatusPayload>(cfg, '/workflow/status');

export const pauseWorkflow = (cfg: ApiConfig) =>
  request<{ ok: boolean }>(cfg, '/workflow/pause', { method: 'POST' });

export const resumeWorkflow = (cfg: ApiConfig) =>
  request<{ ok: boolean }>(cfg, '/workflow/resume', { method: 'POST' });

export const triggerPost = (cfg: ApiConfig) =>
  request<{ ok: boolean; job_id?: string }>(cfg, '/workflow/trigger', {
    method: 'POST',
  });

// ── Guardian ──────────────────────────────────────────────────────────────────

export interface ScanResult {
  scan_id: string;
  status: 'running' | 'complete' | 'error';
  findings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  duration_ms: number;
}
export const triggerScan = (cfg: ApiConfig) =>
  request<ScanResult>(cfg, '/guardian/scan', { method: 'POST' });

// ── Metrics (Prometheus) ──────────────────────────────────────────────────────

export interface MetricPoint {
  t: number; // unix timestamp ms
  v: number;
}
export interface MetricsPayload {
  cpu: MetricPoint[];
  memory: MetricPoint[];
  rps: MetricPoint[];
  error_rate: MetricPoint[];
}
export const fetchMetrics = (cfg: ApiConfig) =>
  request<MetricsPayload>(cfg, '/metrics');

// ── Resources ─────────────────────────────────────────────────────────────────
// NOTE: /metrics/resources may not exist on backend. Provide fallback behavior.

export interface ResourcePayload {
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  network_in_kbps: number;
  network_out_kbps: number;
  workers_active: number;
  queue_depth: number;
}

export const fetchResources = async (cfg: ApiConfig): Promise<ResourcePayload | null> => {
  try {
    return await request<ResourcePayload>(cfg, '/metrics/resources');
  } catch {
    // Endpoint doesn't exist or errored — return null so caller can use fallback
    return null;
  }
};

// ── API Key management ────────────────────────────────────────────────────────

export interface GeneratedKey {
  key: string;
  created_at: string;
  label: string;
}
export const generateApiKey = (cfg: ApiConfig) =>
  request<GeneratedKey>(cfg, '/keys/generate', { method: 'POST' });

// ── PromQL execution ──────────────────────────────────────────────────────────

export interface PromQLResult {
  status: 'success' | 'error';
  data: { result: Array<{ metric: Record<string, string>; value: [number, string] }> };
  error?: string;
}
export const executePromQL = (cfg: ApiConfig, query: string) =>
  request<PromQLResult>(cfg, `/metrics/query?q=${encodeURIComponent(query)}`);
