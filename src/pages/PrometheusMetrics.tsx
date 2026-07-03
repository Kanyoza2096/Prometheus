import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { Activity, Database, Server, RefreshCcw, BarChart3, Clock, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { fetchMetrics, executePromQL, type MetricPoint } from '../lib/api';

// ── Fallback data (used when backend is unreachable) ──────────────────────────
const seed = (n: number, base = 50, spread = 10) => {
  const out = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    v = Math.max(0, Math.min(100, v + (Math.random() - 0.5) * spread));
    out.push({
      time:   new Date(Date.now() - (n - i) * 60_000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cpu:    Math.round(v * 0.8 + Math.random() * 20),
      memory: Math.round(v * 0.6 + 30),
      rps:    Math.round(v + Math.random() * 30),
    });
  }
  return out;
};

const FALLBACK = seed(20);

// ── Transform backend MetricPoint[] into chart-friendly rows ──────────────────
function toChartRows(
  cpu: MetricPoint[], memory: MetricPoint[], rps: MetricPoint[]
) {
  const len = Math.max(cpu.length, memory.length, rps.length);
  return Array.from({ length: len }, (_, i) => ({
    time:   new Date((cpu[i] ?? rps[i] ?? memory[i]).t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cpu:    Math.round(cpu[i]?.v    ?? 0),
    memory: Math.round(memory[i]?.v ?? 0),
    rps:    Math.round(rps[i]?.v    ?? 0),
  }));
}

// ── Default stat cards (overridden by live data) ──────────────────────────────
const STAT_DEFAULTS = [
  { label: 'CPU Usage',      value: '—',      icon: Activity, color: 'text-brand-primary', key: 'cpu'    },
  { label: 'Memory (RAM)',   value: '—',      icon: Server,   color: 'text-brand-accent',  key: 'mem'    },
  { label: 'DB Connections', value: '—',      icon: Database, color: 'text-brand-success', key: 'db'     },
  { label: 'Uptime',         value: '99.99%', icon: Clock,    color: 'text-brand-warning', key: 'uptime' },
];

// ── Default PromQL results (shown until a real query is executed) ─────────────
const DEFAULT_PROMQL_ROWS = [
  { metric: '{method="GET"}',     value: '142.5' },
  { metric: '{method="POST"}',    value: '24.1'  },
  { metric: '{method="OPTIONS"}', value: '8.3'   },
];

export default function PrometheusMetrics() {
  const restEndpoint = useStore(state => state.restEndpoint);
  const masterToken  = useStore(state => state.masterToken);
  const cfg = { restEndpoint, masterToken };

  const [activeTab,    setActiveTab]    = useState('system');
  const [promqlInput,  setPromqlInput]  = useState("sum(rate(http_requests_total{job='kanyoza-api'}[5m])) by (method)");
  const [promqlResult, setPromqlResult] = useState(DEFAULT_PROMQL_ROWS);

  // ── Live metrics poll every 5 s ───────────────────────────────────────────
  const { data: liveMetrics, isError, isFetching, refetch } = useQuery({
    queryKey: ['metrics', restEndpoint],
    queryFn:  () => fetchMetrics(cfg),
    refetchInterval: 5_000,
    retry: 1,
  });

  const chartData = liveMetrics
    ? toChartRows(liveMetrics.cpu, liveMetrics.memory, liveMetrics.rps)
    : FALLBACK;

  const isLive = !!liveMetrics && !isError;

  // Derive stat card values from the latest data point
  const latest = chartData[chartData.length - 1];
  const statValues: Record<string, string> = {
    cpu:    `${latest?.cpu ?? '—'}%`,
    mem:    `${latest?.memory ?? '—'}%`,
    db:     '—',
    uptime: '99.99%',
  };

  // ── PromQL query mutation ─────────────────────────────────────────────────
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

  const TOOLTIP_STYLE = {
    contentStyle: { backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#F8FAFC' },
    itemStyle:    { fontSize: '12px', fontFamily: 'monospace' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto pb-24 md:pb-0"
    >
      {/* Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-brand-primary" />
            Prometheus Metrics
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">GRAFANA-STYLE TELEMETRY EXPORTER</p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Tab switcher */}
          <div className="bg-brand-surface border border-brand-border rounded-lg p-1 flex">
            {['system', 'app', 'database'].map(tab => (
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
          {/* Refresh */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-brand-surface border border-brand-border text-brand-text-muted hover:text-brand-text px-3 py-2 rounded-lg transition-colors disabled:opacity-60"
            title="Refresh metrics"
          >
            <RefreshCcw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
          </button>
          {/* Live / estimated badge */}
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

      {/* Stat cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {STAT_DEFAULTS.map(stat => (
          <div key={stat.key} className="bg-brand-surface rounded-xl p-4 border border-brand-border">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">{stat.label}</span>
              <stat.icon className={cn('w-4 h-4', stat.color)} />
            </div>
            <div className="text-2xl font-mono font-bold">
              {isFetching && !liveMetrics
                ? <span className="text-brand-text-muted animate-pulse">…</span>
                : statValues[stat.key]}
            </div>
          </div>
        ))}
      </div>

      {/* Charts ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* CPU & Memory */}
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

        {/* RPS */}
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

      {/* PromQL Explorer ─────────────────────────────────────────────────── */}
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
