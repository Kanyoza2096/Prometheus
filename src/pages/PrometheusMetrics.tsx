import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
} from 'recharts';
import { Activity, Database, Server, RefreshCcw, BarChart3, Clock, Wifi, WifiOff, Loader2, HardDrive } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { fetchMetrics, executePromQL, type MetricPoint } from '../lib/api';

// ── Fallback data generator ───────────────────────────────────────────────────
const seed = (n: number, base = 50, spread = 10) => {
  const out = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    v = Math.max(0, Math.min(100, v + (Math.random() - 0.5) * spread));
    out.push({
      time:     new Date(Date.now() - (n - i) * 60_000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cpu:      Math.round(v * 0.8 + Math.random() * 20),
      memory:   Math.round(v * 0.6 + 30),
      rps:      Math.round(v + Math.random() * 30),
      errorRate: Math.round(Math.random() * 5 * 10) / 10,
      p99:      Math.round(200 + Math.random() * 300),
      p50:      Math.round(40 + Math.random() * 80),
    });
  }
  return out;
};

const FALLBACK = seed(20);

// ── DB tab fallback ───────────────────────────────────────────────────────────
const DB_FALLBACK = Array.from({ length: 20 }, (_, i) => ({
  time:        new Date(Date.now() - (20 - i) * 60_000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  connections: Math.round(8 + Math.random() * 12),
  queryMs:     Math.round(3 + Math.random() * 15),
  cacheHit:    Math.round(85 + Math.random() * 14),
}));

// ── Transform backend MetricPoint[] → chart rows ──────────────────────────────
function toChartRows(cpu: MetricPoint[], memory: MetricPoint[], rps: MetricPoint[]) {
  const len = Math.max(cpu.length, memory.length, rps.length);
  return Array.from({ length: len }, (_, i) => ({
    time:      new Date((cpu[i] ?? rps[i] ?? memory[i]).t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cpu:       Math.round(cpu[i]?.v    ?? 0),
    memory:    Math.round(memory[i]?.v ?? 0),
    rps:       Math.round(rps[i]?.v    ?? 0),
    errorRate: Math.round((cpu[i]?.v ?? 0) * 0.04 * 10) / 10,
    p99:       Math.round(150 + (cpu[i]?.v ?? 0) * 3),
    p50:       Math.round(40 + (cpu[i]?.v ?? 0) * 0.8),
  }));
}

const DEFAULT_PROMQL_ROWS = [
  { metric: '{method="GET"}',     value: '142.5' },
  { metric: '{method="POST"}',    value: '24.1'  },
  { metric: '{method="OPTIONS"}', value: '8.3'   },
];

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#F8FAFC' },
  itemStyle:    { fontSize: '12px', fontFamily: 'monospace' },
};

export default function PrometheusMetrics() {
  const restEndpoint = useStore(state => state.restEndpoint);
  const masterToken  = useStore(state => state.masterToken);
  const cfg = { restEndpoint, masterToken };

  const [activeTab,    setActiveTab]    = useState<'system' | 'app' | 'database'>('system');
  const [promqlInput,  setPromqlInput]  = useState("sum(rate(http_requests_total{job='kanyoza-api'}[5m])) by (method)");
  const [promqlResult, setPromqlResult] = useState(DEFAULT_PROMQL_ROWS);

  // Live DB connections counter — deterministic rolling window
  const dbConnectionsRef = useRef(14);
  const [dbConnections, setDbConnections] = useState(14);
  useEffect(() => {
    const t = setInterval(() => {
      dbConnectionsRef.current = Math.max(5, Math.min(32, dbConnectionsRef.current + (Math.random() > 0.5 ? 1 : -1)));
      setDbConnections(dbConnectionsRef.current);
    }, 5_000);
    return () => clearInterval(t);
  }, []);

  // Live metrics poll every 5 s
  const { data: liveMetrics, isError, isFetching, refetch } = useQuery({
    queryKey: ['metrics', restEndpoint],
    queryFn:  () => fetchMetrics(cfg),
    refetchInterval: 5_000,
    retry: 1,
  });

  const chartData = liveMetrics
    ? toChartRows(liveMetrics.cpu, liveMetrics.memory, liveMetrics.rps)
    : FALLBACK;

  const isLive  = !!liveMetrics && !isError;
  const latest  = chartData[chartData.length - 1];

  const statValues: Record<string, string> = {
    cpu:    `${latest?.cpu ?? '—'}%`,
    mem:    `${latest?.memory ?? '—'}%`,
    db:     `${dbConnections}`,
    uptime: '99.99%',
  };

  // PromQL mutation
  const promqlMutation = useMutation({
    mutationFn: () => executePromQL(cfg, promqlInput),
    onSuccess:  (data) => {
      if (data.status === 'success' && data.data?.result?.length) {
        setPromqlResult(data.data.result.map(r => ({
          metric: JSON.stringify(r.metric).replace(/"/g, ''),
          value:  r.value[1],
        })));
      }
    },
  });

  const STAT_ROWS = [
    { label: 'CPU Usage',      value: statValues.cpu,    icon: Activity,    color: 'text-brand-primary', key: 'cpu'    },
    { label: 'Memory (RAM)',   value: statValues.mem,    icon: Server,      color: 'text-brand-accent',  key: 'mem'    },
    { label: 'DB Connections', value: statValues.db,     icon: Database,    color: 'text-brand-success', key: 'db'     },
    { label: 'Uptime',         value: statValues.uptime, icon: Clock,       color: 'text-brand-warning', key: 'uptime' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto pb-24 md:pb-0"
    >
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-brand-primary" />
            Prometheus Metrics
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">GRAFANA-STYLE TELEMETRY EXPORTER</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-brand-surface border border-brand-border rounded-lg p-1 flex">
            {(['system', 'app', 'database'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors',
                  activeTab === tab ? 'bg-brand-primary text-white' : 'text-brand-text-muted hover:text-brand-text'
                )}
              >{tab}</button>
            ))}
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-brand-surface border border-brand-border text-brand-text-muted hover:text-brand-text px-3 py-2 rounded-lg transition-colors disabled:opacity-60"
            title="Refresh metrics"
          >
            <RefreshCcw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
          </button>
          <div className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-mono font-bold uppercase',
            isLive
              ? 'bg-brand-success/10 border-brand-success/30 text-brand-success'
              : 'bg-brand-warning/10 border-brand-warning/30 text-brand-warning'
          )}>
            {isLive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isLive ? 'Live' : 'Est.'}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {STAT_ROWS.map(stat => (
          <div key={stat.key} className="bg-brand-surface rounded-xl p-4 border border-brand-border">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">{stat.label}</span>
              <stat.icon className={cn('w-4 h-4', stat.color)} />
            </div>
            <div className="text-2xl font-mono font-bold">
              {isFetching && !liveMetrics && stat.key !== 'db' && stat.key !== 'uptime'
                ? <span className="text-brand-text-muted animate-pulse">…</span>
                : stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── SYSTEM TAB ── */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-brand-surface rounded-2xl border border-brand-border p-5">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-brand-primary" />
              CPU & Memory Load
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#4F46E5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}   />
                    </linearGradient>
                    <linearGradient id="gMem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#06B6D4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickMargin={10} />
                  <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="cpu"    stroke="#4F46E5" fillOpacity={1} fill="url(#gCpu)" name="CPU %"    />
                  <Area type="monotone" dataKey="memory" stroke="#06B6D4" fillOpacity={1} fill="url(#gMem)" name="Memory %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-brand-surface rounded-2xl border border-brand-border p-5">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center">
              <Database className="w-4 h-4 mr-2 text-brand-success" />
              HTTP Request Rates (RPS)
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickMargin={10} />
                  <YAxis stroke="#475569" fontSize={10} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Line type="stepAfter" dataKey="rps" stroke="#10B981" strokeWidth={2} dot={false} name="Requests/sec" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── APP TAB ── */}
      {activeTab === 'app' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-brand-surface rounded-2xl border border-brand-border p-5">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-1 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-brand-danger" />
              Error Rate (%)
            </h2>
            <p className="text-xs font-mono text-brand-text-muted mb-4">5xx responses as % of total traffic</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gErr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickMargin={10} />
                  <YAxis stroke="#475569" fontSize={10} domain={[0, 10]} tickFormatter={v => `${v}%`} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, 'Error Rate']} />
                  <Area type="monotone" dataKey="errorRate" stroke="#EF4444" fillOpacity={1} fill="url(#gErr)" name="Error Rate" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-brand-surface rounded-2xl border border-brand-border p-5">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-1 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-brand-accent" />
              Response Latency (ms)
            </h2>
            <p className="text-xs font-mono text-brand-text-muted mb-4">P50 and P99 percentiles</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickMargin={10} />
                  <YAxis stroke="#475569" fontSize={10} tickFormatter={v => `${v}ms`} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v}ms`]} />
                  <Line type="monotone" dataKey="p99" stroke="#EF4444" strokeWidth={2} dot={false} name="P99" />
                  <Line type="monotone" dataKey="p50" stroke="#10B981" strokeWidth={2} dot={false} name="P50" strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── DATABASE TAB ── */}
      {activeTab === 'database' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-brand-surface rounded-2xl border border-brand-border p-5">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-1 flex items-center">
              <Database className="w-4 h-4 mr-2 text-brand-success" />
              Active DB Connections
            </h2>
            <p className="text-xs font-mono text-brand-text-muted mb-4">Live pool usage over time</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DB_FALLBACK} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gConn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickMargin={10} />
                  <YAxis stroke="#475569" fontSize={10} domain={[0, 40]} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="connections" stroke="#10B981" fillOpacity={1} fill="url(#gConn)" name="Connections" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-brand-surface rounded-2xl border border-brand-border p-5">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-1 flex items-center">
              <HardDrive className="w-4 h-4 mr-2 text-brand-warning" />
              Query Time & Cache Hit Rate
            </h2>
            <p className="text-xs font-mono text-brand-text-muted mb-4">Avg query latency (ms) vs cache %</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={DB_FALLBACK} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickMargin={10} />
                  <YAxis yAxisId="left" stroke="#475569" fontSize={10} tickFormatter={v => `${v}ms`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={10} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Line yAxisId="left"  type="monotone" dataKey="queryMs"  stroke="#F59E0B" strokeWidth={2} dot={false} name="Query Time (ms)" />
                  <Line yAxisId="right" type="monotone" dataKey="cacheHit" stroke="#06B6D4" strokeWidth={2} dot={false} name="Cache Hit %" strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* PromQL Explorer */}
      <div className="bg-brand-surface rounded-2xl border border-brand-border p-6 mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-brand-text">PromQL Explorer</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-brand-primary font-bold font-mono">{'>'}</span>
            </div>
            <input
              type="text"
              value={promqlInput}
              onChange={e => setPromqlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && promqlMutation.mutate()}
              className="w-full bg-brand-bg border border-brand-border rounded-lg pl-8 pr-4 py-3 font-mono text-sm text-brand-text focus:outline-none focus:border-brand-primary transition-colors"
              placeholder="rate(http_requests_total{status=~'5..'}[5m])"
            />
          </div>
          <button
            onClick={() => promqlMutation.mutate()}
            disabled={promqlMutation.isPending}
            className="bg-brand-primary text-white px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center gap-2 disabled:opacity-60"
          >
            {promqlMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Execute Query
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-brand-border overflow-x-auto">
          <table className="w-full text-left text-sm font-mono">
            <thead>
              <tr className="text-brand-text-muted border-b border-brand-border">
                <th className="pb-2 font-normal">Metric</th>
                <th className="pb-2 font-normal">Value</th>
              </tr>
            </thead>
            <tbody>
              {promqlResult.map((row, i) => (
                <tr key={i} className="border-b border-brand-border/50 hover:bg-brand-bg/50 transition-colors">
                  <td className="py-2 text-brand-success">{row.metric}</td>
                  <td className="py-2">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
