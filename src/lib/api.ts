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
  services: Record<string, { ok?: boolean; status?: string; configured?: boolean; page_name?: string; latency_ms?: number }>;
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
  /** 0–100 integer sliders that the frontend uses */
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
    method: 'PUT',   // backend route is PUT /api/v1/ai/persona (was POST — mismatch bug fixed)
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

export interface ResourcePayload {
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  network_in_kbps: number;
  network_out_kbps: number;
  workers_active: number;
  queue_depth: number;
}
export const fetchResources = (cfg: ApiConfig) =>
  request<ResourcePayload>(cfg, '/metrics/resources');

// ── API Key management ────────────────────────────────────────────────────────

export interface GeneratedKey {
  key: string;
  created_at: string;
  label: string;
}
export const generateApiKey = (cfg: ApiConfig) =>
  request<GeneratedKey>(cfg, '/keys/generate', { method: 'POST' });

// ── Schedule management ───────────────────────────────────────────────────────

export interface ScheduleConfig {
  content_hours_utc: number[];
  news_hours_utc: number[];
  post_interval_hours: number | null;
  news_interval_hours: number | null;
  enabled: boolean;
}
export const fetchSchedule = (cfg: ApiConfig) =>
  request<{ ok: boolean; schedule: ScheduleConfig }>(cfg, '/schedule');

export const updateSchedule = (cfg: ApiConfig, payload: Partial<ScheduleConfig>) =>
  request<{ ok: boolean; schedule: ScheduleConfig }>(cfg, '/schedule', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const fetchBotStatus = (cfg: ApiConfig) =>
  request<{ ok: boolean; [k: string]: any }>(cfg, '/bot/status');

/** Trigger an immediate content post via the scheduler queue. */
export const triggerPostNow = (cfg: ApiConfig) =>
  request<{ ok: boolean; queued?: boolean; message?: string }>(
    cfg, '/bot/post', { method: 'POST' }
  );

/** Update AI model, temperature, or personality at runtime. */
export const updateAIConfig = (cfg: ApiConfig, payload: {
  model?: string;
  tone_assertiveness?: number;
  tone_humor?: number;
  tone_formality?: number;
  persona_mood?: string;
  system_prompt_override?: string;
}) =>
  request<{ ok: boolean; updated?: boolean; config?: Record<string, unknown> }>(
    cfg, '/ai/config', { method: 'PUT', body: JSON.stringify(payload) }
  );

// ── PromQL execution ──────────────────────────────────────────────────────────

export interface PromQLResult {
  status: 'success' | 'error';
  data: { result: Array<{ metric: Record<string, string>; value: [number, string] }> };
  error?: string;
}
export const executePromQL = (cfg: ApiConfig, query: string) =>
  request<PromQLResult>(cfg, `/metrics/query?q=${encodeURIComponent(query)}`);
// ── Redis ─────────────────────────────────────────────────────────────────────

export interface RedisHealthEntry {
  redis: 'healthy' | 'degraded' | 'disabled' | 'unhealthy';
  latency_ms?: number;
  url?: string;
  fallback_active?: boolean;
  error?: string;
}
export const fetchRedisHealth = (cfg: ApiConfig) =>
  request<RedisHealthEntry>(cfg, '/health/deep').then(d => {
    const services = (d as any).services;
    return services?.redis || { redis: 'disabled' };
  });

// ── Log Stream (SSE) ──────────────────────────────────────────────────────────

export interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  module: string;
  message: string;
  correlation_id?: string;
  epoch_ms: number;
  lineno?: number;
  func_name?: string;
}

/**
 * Connect to the live log stream via Server-Sent Events.
 * Returns an EventSource that the caller must close when done.
 */
export function connectLogStream(
  cfg: ApiConfig,
  onMessage: (entry: LogEntry) => void,
  onError?: (err: Event) => void,
  filter?: { level?: string; module?: string }
): EventSource {
  const base = cfg.restEndpoint.replace(/\/+$/, '');
  const params = new URLSearchParams();
  if (filter?.level) params.append('level', filter.level);
  if (filter?.module) params.append('module', filter.module);
  
  const url = `${base}/logs/stream?${params}`;
  const es = new EventSource(url);

  es.onmessage = (event) => {
    try {
      const entry = JSON.parse(event.data) as LogEntry;
      onMessage(entry);
    } catch {}
  };

  es.onerror = (err) => {
    onError?.(err);
  };

  return es;
}

// ── Logs (REST fallback) ──────────────────────────────────────────────────────

export interface LogsPayload {
  ok: boolean;
  logs: LogEntry[];
  count: number;
  filters: { level?: string; module?: string; search?: string };
}

export const fetchRecentLogs = (
  cfg: ApiConfig,
  options?: { limit?: number; level?: string; module?: string; search?: string }
) => {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.level) params.append('level', options.level);
  if (options?.module) params.append('module', options.module);
  if (options?.search) params.append('search', options.search);
  return request<LogsPayload>(cfg, `/logs/recent?${params}`);
};

export interface LogStatsPayload {
  ok: boolean;
  total_logs: number;
  errors: number;
  warnings: number;
  info: number;
  debug: number;
  uptime_seconds: number;
  first_log?: string;
  last_log?: string;
}

export const fetchLogStats = (cfg: ApiConfig) =>
  request<LogStatsPayload>(cfg, '/logs/stats');

export const clearLogs = (cfg: ApiConfig) =>
  request<{ ok: boolean; message: string }>(cfg, '/logs/clear', { method: 'DELETE' });

// ── System Connectors ─────────────────────────────────────────────────────────

export interface ConnectorInfo {
  supported_connectors: string[];
  count: number;
}

export const fetchSystemConnectors = (cfg: ApiConfig) =>
  request<ConnectorInfo>(cfg, '/system/connectors');

// ── Integrations ──────────────────────────────────────────────────────────────

export interface IntegrationEntry {
  id: string;
  name: string;
  category: string;
  connected: boolean;
  status: 'active' | 'disconnected';
  description: string;
}

export interface IntegrationsPayload {
  ok: boolean;
  integrations: IntegrationEntry[];
  count: number;
  connected: number;
}

export const fetchIntegrations = (cfg: ApiConfig) =>
  request<IntegrationsPayload>(cfg, '/integrations');

// ── Posts ─────────────────────────────────────────────────────────────────────

export interface PostRecord {
  id: string | number;
  caption?: string;
  topic?: string;
  category?: string;
  platform?: string;
  state?: 'published' | 'draft' | 'scheduled';
  status?: string;
  engagement?: number;
  thumbnail?: string;
  created_at?: string;
  scheduled_for?: string;
  [k: string]: unknown;
}

export interface PostsPayload {
  posts: PostRecord[];
  total?: number;
  page?: number;
  per_page?: number;
}

export const fetchPosts = (
  cfg: ApiConfig,
  opts: { page?: number; per_page?: number; state?: string } = {}
) => {
  const params = new URLSearchParams();
  params.append('page', String(opts.page ?? 1));
  params.append('per_page', String(opts.per_page ?? 20));
  if (opts.state) params.append('state', opts.state);
  return request<PostsPayload>(cfg, `/posts?${params}`);
};

export const createPost = (cfg: ApiConfig, payload: {
  caption: string;
  topic?: string;
  category?: string;
  state: 'publish' | 'draft';
  platforms?: string[];
  scheduled_for?: string;
}) =>
  request<{ ok: boolean; post?: PostRecord }>(cfg, '/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const deletePost = (cfg: ApiConfig, id: string | number) =>
  request<{ ok: boolean }>(cfg, `/posts/${id}`, { method: 'DELETE' });

export const forcePostNow = (cfg: ApiConfig) =>
  request<{ ok: boolean; queued?: boolean; message?: string }>(cfg, '/bot/post', { method: 'POST' });

// ── AI Chat / Persona reset ───────────────────────────────────────────────────

export const chatWithAI = (cfg: ApiConfig, message: string) =>
  request<{ ok: boolean; response?: string; reply?: string }>(cfg, '/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });

export const resetPersona = (cfg: ApiConfig) =>
  request<{ ok: boolean; persona?: PersonaPayload }>(cfg, '/persona/reset', { method: 'POST' });
