import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3, TrendingUp, Users, MessageSquare, Activity,
  Bot, ThumbsUp, RefreshCw, AlertTriangle, Zap, Coins,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { Spinner } from '../components/Spinner';
import {
  fetchAnalytics, fetchAnalyticsPerformance, fetchAnalyticsPostsPerf,
  fetchAnalyticsTokenUsage, fetchAnalyticsHeatmap, fetchMetrics,
} from '../lib/api';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string; fill?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-brand-surface border border-brand-border p-3 rounded-xl shadow-xl font-mono text-xs">
      <p className="text-brand-text-muted mb-1.5 font-bold">{label}</p>
      {payload.map(item => (
        <div key={item.name} className="flex items-center gap-2 mb-1 last:mb-0">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
          <span className="text-brand-text-muted">{item.name}:</span>
          <span className="text-brand-text font-bold ml-auto">{typeof item.value === 'number' ? item.value.toLocaleString() : item.value}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, trend, loading }: {
  label: string; value: string | number; icon: React.ElementType;
  color: string; trend?: string; loading?: boolean;
}) {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color.replace('text-', 'bg-') + '/20')}>
          <Icon className={cn('w-5 h-5', color)} />
        </div>
        {trend && <span className="text-[10px] font-mono font-bold text-brand-success">{trend}</span>}
      </div>
      <div className="text-2xl font-bold text-brand-text mb-1">
        {loading ? <div className="h-7 w-20 bg-brand-elevated animate-pulse rounded" /> : value}
      </div>
      <div className="text-xs font-mono text-brand-text-muted uppercase tracking-wider">{label}</div>
    </div>
  );
}

export default function Analytics() {
  const { restEndpoint, masterToken } = useStore();
  const cfg = { restEndpoint, masterToken };

  const summaryQ  = useQuery({ queryKey: ['analytics',          restEndpoint], queryFn: () => fetchAnalytics(cfg),            retry: 1, staleTime: 60_000 });
  const perfQ     = useQuery({ queryKey: ['analytics-perf',     restEndpoint], queryFn: () => fetchAnalyticsPerformance(cfg), retry: 1, staleTime: 60_000 });
  const postsQ    = useQuery({ queryKey: ['analytics-posts',    restEndpoint], queryFn: () => fetchAnalyticsPostsPerf(cfg),   retry: 1, staleTime: 60_000 });
  const tokenQ    = useQuery({ queryKey: ['analytics-tokens',   restEndpoint], queryFn: () => fetchAnalyticsTokenUsage(cfg),  retry: 1, staleTime: 60_000 });
  const heatmapQ  = useQuery({ queryKey: ['analytics-heatmap',  restEndpoint], queryFn: () => fetchAnalyticsHeatmap(cfg),    retry: 1, staleTime: 60_000 });
  const metricsQ  = useQuery({ queryKey: ['metrics',            restEndpoint], queryFn: () => fetchMetrics(cfg),             retry: 1, staleTime: 60_000 });

  const [refetching, setRefetching] = useState(false);
  const refetchAll = async () => {
    setRefetching(true);
    await Promise.all([summaryQ.refetch(), perfQ.refetch(), postsQ.refetch(), tokenQ.refetch(), heatmapQ.refetch(), metricsQ.refetch()]);
    setRefetching(false);
  };

  const s = summaryQ.data;
  const perfPosts    = perfQ.data?.posts    ?? [];
  const perfMessages = perfQ.data?.messages ?? [];
  const topPosts     = postsQ.data?.posts   ?? [];
  const tokenByDay   = tokenQ.data?.by_day  ?? [];
  // Backend /metrics returns a single point-in-time snapshot object
  // (utils.metrics.get_snapshot()), not time-series arrays — render whatever
  // numeric counters are present instead of assuming a fixed cpu/memory/rps shape.
  const metricsData: Array<{ name: string; value: number; unit: string }> = metricsQ.data
    ? Object.entries(metricsQ.data.metrics ?? {})
        .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
        .map(([name, value]) => ({ name, value, unit: '' }))
    : [];

  // Build heatmap grid: normalise whatever shape the API returns
  const heatGrid: number[][] = (() => {
    const raw = heatmapQ.data;
    if (!raw) return DAYS.map(() => Array(24).fill(0));
    if (raw.heatmap) return DAYS.map((d, i) => raw.heatmap![i]?.hours ?? Array(24).fill(0));
    if (raw.raw) return raw.raw as number[][];
    return DAYS.map(() => Array(24).fill(0));
  })();
  const heatMax = Math.max(1, ...heatGrid.flat());

  const summaryLoading = summaryQ.isLoading;
  const anyError = summaryQ.isError || perfQ.isError || postsQ.isError || tokenQ.isError || heatmapQ.isError;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-brand-primary" />
            Analytics
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">PERFORMANCE INTELLIGENCE</p>
        </div>
        <button
          aria-label="Refresh analytics data"
          onClick={refetchAll}
          className="p-2.5 bg-brand-elevated border border-brand-border rounded-xl text-brand-text-muted hover:text-brand-text transition-colors self-start"
        >
          <RefreshCw className={cn('w-4 h-4', refetching && 'animate-spin')} />
        </button>
      </div>

      {anyError && (
        <div className="p-4 bg-brand-warning/10 border border-brand-warning/30 rounded-xl text-brand-warning text-sm font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Some analytics endpoints returned errors — displaying available data only.
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Posts"     value={(s?.total_posts    ?? 0).toLocaleString()} icon={MessageSquare} color="text-brand-primary" loading={summaryLoading} />
        <StatCard label="Messages"        value={(s?.total_messages ?? 0).toLocaleString()} icon={Bot}           color="text-brand-accent"  loading={summaryLoading} />
        <StatCard label="Active Users"    value={(s?.active_users   ?? 0).toLocaleString()} icon={Users}         color="text-brand-success" loading={summaryLoading} />
        <StatCard label="API Calls"       value={(s?.api_calls      ?? 0).toLocaleString()} icon={Activity}      color="text-brand-warning" loading={summaryLoading} />
        <StatCard label="Tokens Used"     value={(s?.token_usage    ?? 0).toLocaleString()} icon={Coins}         color="text-brand-danger"  loading={summaryLoading} />
        <StatCard label="Engagement Rate" value={`${(s?.engagement_rate ?? 0).toFixed(1)}%`} icon={ThumbsUp}    color="text-brand-primary" loading={summaryLoading} />
      </div>

      {/* Post + Message Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-primary" /> Post Volume Over Time
          </h2>
          {perfQ.isLoading ? (
            <div className="h-48 flex items-center justify-center"><Spinner size={24} /></div>
          ) : perfPosts.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-brand-text-muted font-mono text-xs uppercase">No post performance data.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={perfPosts}>
                <defs>
                  <linearGradient id="grad-posts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-brand-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-brand-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-brand-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-brand-text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-brand-text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Posts" stroke="var(--color-brand-primary)" fill="url(#grad-posts)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-5 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-accent" /> Message Volume Over Time
          </h2>
          {perfQ.isLoading ? (
            <div className="h-48 flex items-center justify-center"><Spinner size={24} /></div>
          ) : perfMessages.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-brand-text-muted font-mono text-xs uppercase">No message performance data.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={perfMessages}>
                <defs>
                  <linearGradient id="grad-msgs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-brand-accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-brand-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-brand-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-brand-text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-brand-text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Messages" stroke="var(--color-brand-accent)" fill="url(#grad-msgs)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Token Usage + Top Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-2 flex items-center gap-2">
            <Coins className="w-4 h-4 text-brand-danger" /> Token Usage
          </h2>
          {tokenQ.data && (
            <div className="flex gap-6 mb-4">
              {[
                { label: 'Total', value: tokenQ.data.total_tokens },
                { label: 'Prompt', value: tokenQ.data.prompt_tokens },
                { label: 'Completion', value: tokenQ.data.completion_tokens },
              ].filter(x => x.value !== undefined).map(x => (
                <div key={x.label}>
                  <div className="text-lg font-bold text-brand-text">{(x.value as number).toLocaleString()}</div>
                  <div className="text-[10px] font-mono text-brand-text-muted uppercase">{x.label}</div>
                </div>
              ))}
            </div>
          )}
          {tokenQ.isLoading ? (
            <div className="h-40 flex items-center justify-center"><Spinner size={24} /></div>
          ) : tokenByDay.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-brand-text-muted font-mono text-xs uppercase">No token usage data.</div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={tokenByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-brand-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--color-brand-text-muted)' }} />
                <YAxis tick={{ fontSize: 9, fill: 'var(--color-brand-text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tokens" name="Tokens" fill="var(--color-brand-danger)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-warning" /> Top Post Performance
          </h2>
          {postsQ.isLoading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-brand-elevated animate-pulse rounded-xl" />)}</div>
          ) : topPosts.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-brand-text-muted font-mono text-xs uppercase">No post performance data.</div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {topPosts.slice(0, 8).map((p: { id: string | number; title?: string; reach?: number; likes?: number; comments?: number }, i: number) => (
                <div key={p.id ?? i} className="flex items-center gap-3 p-3 bg-brand-elevated rounded-xl border border-brand-border">
                  <span className="text-[10px] font-mono text-brand-text-muted w-4 shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-brand-text truncate">{p.title ?? `Post ${p.id}`}</div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono shrink-0">
                    {p.reach    !== undefined && <span className="text-brand-primary">{p.reach.toLocaleString()} reach</span>}
                    {p.likes    !== undefined && <span className="text-brand-success">{p.likes} ♥</span>}
                    {p.comments !== undefined && <span className="text-brand-accent">{p.comments} 💬</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Engagement Heatmap */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-5 flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-success" /> Engagement Heatmap — Hour × Day
        </h2>
        {heatmapQ.isLoading ? (
          <div className="h-32 flex items-center justify-center"><Spinner size={24} /></div>
        ) : (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="flex items-center gap-1 mb-1 ml-8">
                {HOURS.map(h => (
                  <div key={h} className="w-6 text-[8px] font-mono text-brand-text-muted text-center">{h}</div>
                ))}
              </div>
              {DAYS.map((day, di) => (
                <div key={day} className="flex items-center gap-1 mb-1">
                  <div className="w-7 text-[9px] font-mono text-brand-text-muted shrink-0">{day}</div>
                  {HOURS.map(hi => {
                    const val = heatGrid[di]?.[hi] ?? 0;
                    const opacity = val / heatMax;
                    return (
                      <div
                        key={hi}
                        title={`${day} ${hi}:00 — ${val}`}
                        className="w-6 h-6 rounded-sm transition-opacity"
                        style={{ backgroundColor: `rgba(99, 102, 241, ${0.08 + opacity * 0.92})` }}
                      />
                    );
                  })}
                </div>
              ))}
              <div className="flex items-center gap-2 mt-3 ml-8">
                <span className="text-[9px] font-mono text-brand-text-muted">Low</span>
                {[0.1, 0.3, 0.5, 0.7, 0.9].map(o => (
                  <div key={o} className="w-5 h-5 rounded-sm" style={{ backgroundColor: `rgba(99, 102, 241, ${o})` }} />
                ))}
                <span className="text-[9px] font-mono text-brand-text-muted">High</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* System Metrics */}
      {metricsData.length > 0 && (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-5 flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-accent" /> System Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {metricsData.map((m, i) => (
              <div key={i} className="bg-brand-elevated rounded-xl p-3 border border-brand-border">
                <div className="text-xs font-bold text-brand-text">{m.value.toFixed(1)}<span className="text-[9px] text-brand-text-muted ml-0.5">{m.unit}</span></div>
                <div className="text-[9px] font-mono text-brand-text-muted truncate mt-0.5">{m.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
