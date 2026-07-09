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

// ── AI Config ─────────────────────────────────────────────────────────────────

export interface AIConfigPayload {
  model?: string;
  temperature?: number;
  safety_level?: string;
  tone_assertiveness?: number;
  tone_humor?: number;
  tone_formality?: number;
  persona_mood?: string;
  system_prompt_override?: string;
  [k: string]: unknown;
}

export const fetchAIConfig = (cfg: ApiConfig) =>
  request<AIConfigPayload>(cfg, '/ai/config');

/** Update AI model, temperature, or personality at runtime. */
export const updateAIConfig = (cfg: ApiConfig, payload: {
  model?: string;
  temperature?: number;
  safety_level?: string;
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

// ── Workspaces (Tenants) ──────────────────────────────────────────────────────

export interface Workspace {
  id: string | number;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'business' | string;
  status?: string;
  owner_email?: string;
  member_count?: number;
  created_at?: string;
  [k: string]: unknown;
}

export const fetchWorkspaces = (cfg: ApiConfig) =>
  request<{ workspaces: Workspace[] }>(cfg, '/workspaces');

export const fetchWorkspace = (cfg: ApiConfig, id: string | number) =>
  request<{ workspace: Workspace }>(cfg, `/workspaces/${id}`);

export const createWorkspace = (cfg: ApiConfig, payload: { name: string; slug: string; plan: string; owner_email?: string }) =>
  request<{ ok: boolean; workspace?: Workspace }>(cfg, '/workspaces', { method: 'POST', body: JSON.stringify(payload) });

export const updateWorkspace = (cfg: ApiConfig, id: string | number, payload: Partial<Workspace>) =>
  request<{ ok: boolean; workspace?: Workspace }>(cfg, `/workspaces/${id}`, { method: 'PUT', body: JSON.stringify(payload) });

export const deleteWorkspace = (cfg: ApiConfig, id: string | number) =>
  request<{ ok: boolean }>(cfg, `/workspaces/${id}`, { method: 'DELETE' });

// ── Brands ────────────────────────────────────────────────────────────────────

export interface Brand {
  id: string | number;
  name: string;
  slug?: string;
  logo_url?: string;
  tone?: string;
  hashtags?: string;
  language?: string;
  audience?: string;
  status?: string;
  [k: string]: unknown;
}

export const fetchBrands = (cfg: ApiConfig, workspaceId: string | number) =>
  request<{ brands: Brand[] }>(cfg, `/workspaces/${workspaceId}/brands`);

export const createBrand = (cfg: ApiConfig, workspaceId: string | number, payload: Partial<Brand>) =>
  request<{ ok: boolean; brand?: Brand }>(cfg, `/workspaces/${workspaceId}/brands`, { method: 'POST', body: JSON.stringify(payload) });

export const updateBrand = (cfg: ApiConfig, id: string | number, payload: Partial<Brand>) =>
  request<{ ok: boolean; brand?: Brand }>(cfg, `/brands/${id}`, { method: 'PUT', body: JSON.stringify(payload) });

export const deleteBrand = (cfg: ApiConfig, id: string | number) =>
  request<{ ok: boolean }>(cfg, `/brands/${id}`, { method: 'DELETE' });

// ── Social Accounts ───────────────────────────────────────────────────────────

export interface SocialAccount {
  id: string | number;
  platform: string;
  account_name?: string;
  status?: string;
  health?: string;
  last_checked?: string;
  [k: string]: unknown;
}

export const fetchSocialAccounts = (cfg: ApiConfig, workspaceId: string | number) =>
  request<{ accounts: SocialAccount[] }>(cfg, `/workspaces/${workspaceId}/social-accounts`);

export const createSocialAccount = (cfg: ApiConfig, workspaceId: string | number, payload: Record<string, unknown>) =>
  request<{ ok: boolean; account?: SocialAccount }>(cfg, `/workspaces/${workspaceId}/social-accounts`, { method: 'POST', body: JSON.stringify(payload) });

export const updateSocialAccount = (cfg: ApiConfig, id: string | number, payload: Record<string, unknown>) =>
  request<{ ok: boolean; account?: SocialAccount }>(cfg, `/social-accounts/${id}`, { method: 'PUT', body: JSON.stringify(payload) });

export const deleteSocialAccount = (cfg: ApiConfig, id: string | number) =>
  request<{ ok: boolean }>(cfg, `/social-accounts/${id}`, { method: 'DELETE' });

export const healthCheckSocialAccount = (cfg: ApiConfig, id: string | number) =>
  request<{ ok: boolean; healthy?: boolean; message?: string }>(cfg, `/social-accounts/${id}/health-check`, { method: 'POST' });

// ── AI Profiles ───────────────────────────────────────────────────────────────

export interface AIProfile {
  id: string | number;
  name: string;
  tone?: string;
  expertise?: string;
  complexity?: string;
  emoji_level?: string;
  writing_style?: string;
  system_prompt_override?: string;
  [k: string]: unknown;
}

export const fetchAIProfiles = (cfg: ApiConfig, workspaceId: string | number) =>
  request<{ profiles: AIProfile[] }>(cfg, `/workspaces/${workspaceId}/ai-profiles`);

export const createAIProfile = (cfg: ApiConfig, workspaceId: string | number, payload: Partial<AIProfile>) =>
  request<{ ok: boolean; profile?: AIProfile }>(cfg, `/workspaces/${workspaceId}/ai-profiles`, { method: 'POST', body: JSON.stringify(payload) });

export const updateAIProfile = (cfg: ApiConfig, id: string | number, payload: Partial<AIProfile>) =>
  request<{ ok: boolean; profile?: AIProfile }>(cfg, `/ai-profiles/${id}`, { method: 'PUT', body: JSON.stringify(payload) });

export const deleteAIProfile = (cfg: ApiConfig, id: string | number) =>
  request<{ ok: boolean }>(cfg, `/ai-profiles/${id}`, { method: 'DELETE' });

// ── Knowledge Base ────────────────────────────────────────────────────────────

export interface KnowledgeDoc {
  id: string | number;
  title?: string;
  content?: string;
  doc_type?: string;
  tags?: string;
  created_at?: string;
  [k: string]: unknown;
}

export const fetchKnowledgeDocs = (cfg: ApiConfig, brandId: string | number) =>
  request<{ documents: KnowledgeDoc[] }>(cfg, `/brands/${brandId}/knowledge`);

export const createKnowledgeDoc = (cfg: ApiConfig, brandId: string | number, payload: { content: string; doc_type: string; tags?: string; title?: string }) =>
  request<{ ok: boolean; document?: KnowledgeDoc }>(cfg, `/brands/${brandId}/knowledge`, { method: 'POST', body: JSON.stringify(payload) });

export const searchKnowledge = (cfg: ApiConfig, brandId: string | number, query: string, topK = 5) =>
  request<{ results: KnowledgeDoc[] }>(cfg, `/brands/${brandId}/knowledge/search`, { method: 'POST', body: JSON.stringify({ query, top_k: topK }) });

export const deleteKnowledgeDoc = (cfg: ApiConfig, id: string | number) =>
  request<{ ok: boolean }>(cfg, `/knowledge/${id}`, { method: 'DELETE' });

// ── Guardian / Security ───────────────────────────────────────────────────────

export interface GuardianIssue {
  id: string | number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title?: string;
  repo?: string;
  status?: string;
  [k: string]: unknown;
}

export const fetchGuardianStatus = (cfg: ApiConfig) =>
  request<{ last_scan?: string; total_findings?: number; critical?: number; high?: number; medium?: number; low?: number }>(cfg, '/guardian/status');

export const fetchGuardianIssues = (cfg: ApiConfig, severity?: string) => {
  const params = new URLSearchParams();
  if (severity) params.append('severity', severity);
  return request<{ issues: GuardianIssue[] }>(cfg, `/guardian/issues?${params}`);
};

export interface AuditLogEntry {
  id: string | number;
  action?: string;
  user?: string;
  resource?: string;
  status?: string;
  created_at?: string;
  [k: string]: unknown;
}

export const fetchAuditLogs = (cfg: ApiConfig, limit = 50) =>
  request<{ logs: AuditLogEntry[] }>(cfg, `/audit-logs?limit=${limit}`);

// ── API Keys ──────────────────────────────────────────────────────────────────

export interface ApiKeyEntry {
  id: string | number;
  label: string;
  prefix?: string;
  created_at?: string;
  last_used?: string;
  status?: string;
  [k: string]: unknown;
}

export const fetchApiKeys = (cfg: ApiConfig) =>
  request<{ keys: ApiKeyEntry[] }>(cfg, '/keys');

export const generateApiKeyLabeled = (cfg: ApiConfig, label: string) =>
  request<GeneratedKey>(cfg, '/keys/generate', { method: 'POST', body: JSON.stringify({ label }) });

export const revokeApiKey = (cfg: ApiConfig, id: string | number) =>
  request<{ ok: boolean }>(cfg, `/keys/${id}`, { method: 'DELETE' });

// ── Feature toggles ───────────────────────────────────────────────────────────

export interface FeaturesPayload {
  features: Record<string, boolean>;
}

export const fetchFeatures = (cfg: ApiConfig) =>
  request<FeaturesPayload>(cfg, '/features');

export const toggleFeature = (cfg: ApiConfig, feature: string, enabled: boolean) =>
  request<{ ok: boolean }>(cfg, '/features/toggle', { method: 'POST', body: JSON.stringify({ feature, enabled }) });

// ── Messenger ─────────────────────────────────────────────────────────────────

export interface ConversationSummary {
  sender_id: string;
  name?: string;
  avatar?: string;
  last_message?: string;
  time?: string;
  unread?: number;
  sentiment?: string;
  [k: string]: unknown;
}

export interface MessageEntry {
  id: string | number;
  sender_id: string;
  text: string;
  is_me?: boolean;
  time?: string;
  [k: string]: unknown;
}

export const fetchConversations = (cfg: ApiConfig, limit = 50) =>
  request<{ conversations: ConversationSummary[] }>(cfg, `/messages?limit=${limit}`);

export const fetchConversation = (cfg: ApiConfig, senderId: string) =>
  request<{ messages: MessageEntry[] }>(cfg, `/messages/${senderId}`);

export const sendMessageReply = (cfg: ApiConfig, recipientId: string, text: string) =>
  request<{ ok: boolean }>(cfg, '/messages/reply', { method: 'POST', body: JSON.stringify({ recipient_id: recipientId, text }) });

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  total_posts?: number;
  total_messages?: number;
  active_users?: number;
  api_calls?: number;
  token_usage?: number;
  engagement_rate?: number;
  [k: string]: unknown;
}

export interface AnalyticsPerformance {
  posts?: Array<{ date: string; count: number; reach?: number; [k: string]: unknown }>;
  messages?: Array<{ date: string; count: number; [k: string]: unknown }>;
  [k: string]: unknown;
}

export interface PostsPerformance {
  posts?: Array<{ id: string | number; title?: string; reach?: number; likes?: number; comments?: number; shares?: number; [k: string]: unknown }>;
  [k: string]: unknown;
}

export interface TokenUsage {
  total_tokens?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  by_day?: Array<{ date: string; tokens: number; [k: string]: unknown }>;
  [k: string]: unknown;
}

export interface EngagementHeatmap {
  heatmap?: Array<{ day: string; hours: number[] }>;
  raw?: number[][];
  [k: string]: unknown;
}

export const fetchAnalytics             = (cfg: ApiConfig) => request<AnalyticsSummary>(cfg, '/analytics');
export const fetchAnalyticsPerformance  = (cfg: ApiConfig) => request<AnalyticsPerformance>(cfg, '/analytics/performance');
export const fetchAnalyticsPostsPerf    = (cfg: ApiConfig) => request<PostsPerformance>(cfg, '/analytics/posts-performance');
export const fetchAnalyticsTokenUsage   = (cfg: ApiConfig) => request<TokenUsage>(cfg, '/analytics/token-usage');
export const fetchAnalyticsHeatmap      = (cfg: ApiConfig) => request<EngagementHeatmap>(cfg, '/analytics/engagement-heatmap');
export const fetchMetricsPublic         = (cfg: ApiConfig) => request<MetricsPayload>(cfg, '/metrics/public');

// ── Rate Limits ───────────────────────────────────────────────────────────────

export interface RateLimitEntry {
  id: string | number;
  identifier?: string;
  endpoint?: string;
  limit?: number;
  remaining?: number;
  reset_at?: string;
  blocked?: boolean;
  [k: string]: unknown;
}

export const fetchRateLimits  = (cfg: ApiConfig) => request<{ limits: RateLimitEntry[] }>(cfg, '/rate-limits');
export const unblockRateLimit = (cfg: ApiConfig, identifier: string) =>
  request<{ ok: boolean }>(cfg, '/rate-limits/unblock', { method: 'POST', body: JSON.stringify({ identifier }) });

// ── Tenants ───────────────────────────────────────────────────────────────────

export interface TenantEntry {
  id: string | number;
  name?: string;
  slug?: string;
  plan?: string;
  active?: boolean;
  [k: string]: unknown;
}

export const fetchTenants  = (cfg: ApiConfig) => request<{ tenants: TenantEntry[] }>(cfg, '/tenants');
export const switchTenant  = (cfg: ApiConfig, tenantId: string | number) =>
  request<{ ok: boolean; tenant?: TenantEntry }>(cfg, '/tenants/switch', { method: 'POST', body: JSON.stringify({ tenant_id: tenantId }) });

// ── Brand detail ──────────────────────────────────────────────────────────────

export const fetchBrand = (cfg: ApiConfig, id: string | number) => request<{ brand: Brand }>(cfg, `/brands/${id}`);

// ── Global Knowledge ──────────────────────────────────────────────────────────

export const fetchAllKnowledge    = (cfg: ApiConfig) => request<{ documents: KnowledgeDoc[] }>(cfg, '/knowledge');
export const createGlobalKnowledge = (cfg: ApiConfig, payload: Partial<KnowledgeDoc>) =>
  request<{ ok: boolean; document?: KnowledgeDoc }>(cfg, '/knowledge', { method: 'POST', body: JSON.stringify(payload) });

// ── Persona (direct /persona routes) ─────────────────────────────────────────

export const fetchPersonaDirect  = (cfg: ApiConfig) => request<PersonaPayload>(cfg, '/persona');
export const updatePersonaDirect = (cfg: ApiConfig, payload: Partial<PersonaPayload>) =>
  request<{ ok: boolean }>(cfg, '/persona', { method: 'PUT', body: JSON.stringify(payload) });

// ── System Health ─────────────────────────────────────────────────────────────

export interface SystemHealthEntry {
  service?: string;
  status?: string;
  latency_ms?: number;
  message?: string;
  [k: string]: unknown;
}

export const fetchSystemHealth = (cfg: ApiConfig) =>
  request<{ status?: string; services?: SystemHealthEntry[]; uptime?: number; [k: string]: unknown }>(cfg, '/system/health');

// ── Scan ──────────────────────────────────────────────────────────────────────

export interface ScanHistoryEntry {
  id: string | number;
  started_at?: string;
  completed_at?: string;
  findings?: number;
  status?: string;
  [k: string]: unknown;
}

export const fetchScanHistory = (cfg: ApiConfig) =>
  request<{ scans?: ScanHistoryEntry[]; last_scan?: ScanHistoryEntry }>(cfg, '/scan');

// ── Notifications ─────────────────────────────────────────────────────────────

export interface NotificationEntry {
  id: string | number;
  title?: string;
  message?: string;
  type?: string;
  read?: boolean;
  created_at?: string;
  [k: string]: unknown;
}

export const fetchNotifications   = (cfg: ApiConfig) => request<{ notifications: NotificationEntry[] }>(cfg, '/notifications');
export const markNotificationRead = (cfg: ApiConfig, id: string | number) =>
  request<{ ok: boolean }>(cfg, `/notifications/${id}/read`, { method: 'POST' });

// ── Workflow state & run ──────────────────────────────────────────────────────

export interface WorkflowDefinition {
  id: string | number;
  name?: string;
  status?: string;
  last_run?: string;
  schedule?: string;
  enabled?: boolean;
  [k: string]: unknown;
}

export const fetchWorkflowState = (cfg: ApiConfig) =>
  request<{ workflow?: WorkflowDefinition; workflows?: WorkflowDefinition[]; [k: string]: unknown }>(cfg, '/workflow');

export const runWorkflow = (cfg: ApiConfig, workflowId?: string | number) =>
  request<{ ok: boolean; job_id?: string }>(cfg, '/workflow/run', {
    method: 'POST',
    body: JSON.stringify(workflowId ? { workflow_id: workflowId } : {}),
  });
