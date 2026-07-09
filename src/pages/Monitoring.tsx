import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity, Server, Cpu, Database, Network, HardDrive,
  RefreshCw, Zap, Terminal, AlertTriangle, CheckCircle2,
  XCircle, Pause, Play, Radio, RotateCcw, Search, Filter,
  Wifi, WifiOff,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LogEntry {
  timestamp: number;
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  module: string;
  message: string;
  correlation_id?: string;
}

interface ResourceData {
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  network_in_kbps: number;
  network_out_kbps: number;
  workers_active: number;
  queue_depth: number;
}

type LogLevel = 'ALL' | 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

// ---------------------------------------------------------------------------
// Gauge component
// ---------------------------------------------------------------------------

const Gauge = ({
  value,
  label,
  color,
  icon: Icon,
  suffix = '%',
}: {
  value: number;
  label: string;
  color: string;
  icon: React.ElementType;
  suffix?: string;
}) => {
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.min(value, 100) / 100) * circ;
  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-3 left-3 text-brand-text-muted">
        <Icon className="w-4 h-4" />
      </div>
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-brand-elevated" />
          <circle
            cx="48" cy="48" r={radius}
            stroke={color} strokeWidth="6" fill="transparent"
            strokeDasharray={circ} strokeDashoffset={offset}
            className="transition-all duration-700 ease-in-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-lg font-bold text-brand-text leading-none">
            {Number.isFinite(value) ? Math.round(value) : 0}{suffix}
          </span>
        </div>
      </div>
      <p className="text-[10px] text-brand-text-muted font-mono uppercase mt-3 tracking-widest text-center">{label}</p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Level badge
// ---------------------------------------------------------------------------

const LevelBadge = ({ level }: { level: string }) => {
  const cls: Record<string, string> = {
    DEBUG:    'bg-brand-elevated text-brand-text-muted',
    INFO:     'bg-brand-primary/20 text-brand-primary',
    WARNING:  'bg-brand-warning/20 text-brand-warning',
    ERROR:    'bg-brand-danger/20 text-brand-danger',
    CRITICAL: 'bg-brand-danger text-white',
  };
  return (
    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-sm font-mono', cls[level] ?? cls.INFO)}>
      {level}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Connection indicator
// ---------------------------------------------------------------------------

const ConnectionMode = ({ mode }: { mode: 'sse' | 'polling' | 'disconnected' }) => {
  const cfg = {
    sse:          { label: 'SSE Live',     color: 'text-brand-success', dot: 'bg-brand-success', Icon: Wifi },
    polling:      { label: 'REST Polling', color: 'text-brand-warning', dot: 'bg-brand-warning', Icon: RefreshCw },
    disconnected: { label: 'Disconnected', color: 'text-brand-danger',  dot: 'bg-brand-danger',  Icon: WifiOff },
  }[mode];
  return (
    <div className={cn('flex items-center gap-1.5 text-[10px] font-mono font-bold', cfg.color)}>
      <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', cfg.dot)} />
      {cfg.label}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Service status card
// ---------------------------------------------------------------------------

const ServiceCard = ({ svc }: { svc: { name: string; status: string; latency: number } }) => {
  const ok = svc.status === 'online' || svc.status === 'ok';
  const degraded = svc.status === 'degraded';
  return (
    <div className={cn(
      'bg-brand-surface border rounded-xl p-3 flex items-center justify-between gap-3',
      ok ? 'border-brand-success/20' : degraded ? 'border-brand-warning/20' : 'border-brand-danger/20',
    )}>
      <div className="flex items-center gap-2 min-w-0">
        {ok ? <CheckCircle2 className="w-3.5 h-3.5 text-brand-success shrink-0" /> :
          degraded ? <AlertTriangle className="w-3.5 h-3.5 text-brand-warning shrink-0" /> :
            <XCircle className="w-3.5 h-3.5 text-brand-danger shrink-0" />}
        <span className="text-xs font-medium text-brand-text truncate">{svc.name}</span>
      </div>
      <span className="text-[10px] font-mono text-brand-text-muted shrink-0">{svc.latency}ms</span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const LEVELS: LogLevel[] = ['ALL', 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'];
const MAX_LOG_DISPLAY = 300;

export default function Monitoring() {
  const { restEndpoint, masterToken, healthMatrix, latencyHistory, stats } = useStore();

  // Resources
  const [resources, setResources] = useState<ResourceData | null>(null);
  const [resourceHistory, setResourceHistory] = useState<Array<{ t: string; cpu: number; mem: number }>>([]);

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connMode, setConnMode] = useState<'sse' | 'polling' | 'disconnected'>('disconnected');
  const [paused, setPaused] = useState(false);
  const [levelFilter, setLevelFilter] = useState<LogLevel>('ALL');
  const [search, setSearch] = useState('');
  const logEndRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const authHeader = `Bearer ${masterToken}`;
  const apiBase    = restEndpoint.replace(/\/+$/, '');

  // ── Resources polling (5 s) ──────────────────────────────────────────────

  useEffect(() => {
    if (!masterToken) return;

    const fetchResources = async () => {
      try {
        const r = await fetch(`${apiBase}/metrics/resources`, {
          headers: { Authorization: authHeader },
        });
        if (!r.ok) return;
        const data: ResourceData = await r.json();
        setResources(data);
        setResourceHistory(prev => {
          const next = [
            ...prev,
            {
              t:   new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              cpu: Math.round(data.cpu_percent),
              mem: Math.round(data.memory_percent),
            },
          ].slice(-60);
          return next;
        });
      } catch {
        // silently ignore — network may be unavailable
      }
    };

    fetchResources();
    const id = setInterval(fetchResources, 5000);
    return () => clearInterval(id);
  }, [apiBase, masterToken]);

  // ── REST log polling fallback ─────────────────────────────────────────────

  const pollLogs = useCallback(async () => {
    if (pausedRef.current || !masterToken) return;
    try {
      const r = await fetch(`${apiBase}/logs/recent?limit=50`, {
        headers: { Authorization: authHeader },
      });
      if (!r.ok) return;
      const data = await r.json();
      if (data.logs && Array.isArray(data.logs)) {
        setLogs(prev => {
          const ids = new Set(prev.map(e => `${e.timestamp}${e.module}${e.message}`));
          const newEntries = (data.logs as LogEntry[]).filter(
            e => !ids.has(`${e.timestamp}${e.module}${e.message}`)
          );
          return [...newEntries, ...prev].slice(0, MAX_LOG_DISPLAY);
        });
      }
    } catch {
      // ignore
    }
  }, [apiBase, masterToken]);

  // ── SSE log stream ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!masterToken) {
      setConnMode('disconnected');
      return;
    }

    const trySSE = () => {
      // Attach token via query param for EventSource (can't set headers)
      const url = `${apiBase}/logs/stream?token=${encodeURIComponent(masterToken)}`;
      const es = new EventSource(url);
      esRef.current = es;

      es.onopen = () => {
        setConnMode('sse');
        // Clear polling fallback
        if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
      };

      es.onmessage = (ev) => {
        if (pausedRef.current) return;
        try {
          const entry: LogEntry = JSON.parse(ev.data);
          setLogs(prev => [entry, ...prev].slice(0, MAX_LOG_DISPLAY));
        } catch {
          // ignore malformed
        }
      };

      es.onerror = () => {
        es.close();
        esRef.current = null;
        setConnMode('polling');
        // Fall back to REST polling
        if (!pollingRef.current) {
          pollingLogs();
          pollingRef.current = setInterval(pollLogs, 3000);
        }
      };
    };

    const pollingLogs = () => { pollLogs(); };

    // Try SSE first — if the server doesn't support it, onerror fires immediately
    trySSE();

    return () => {
      esRef.current?.close();
      esRef.current = null;
      if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
    };
  }, [apiBase, masterToken, pollLogs]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!paused) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs.length, paused]);

  // ── Filtered logs ─────────────────────────────────────────────────────────

  const filteredLogs = logs.filter(e => {
    if (levelFilter !== 'ALL' && e.level !== levelFilter) return false;
    if (search && !e.message.toLowerCase().includes(search.toLowerCase()) &&
        !e.module.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // ── Services from Zustand health matrix ──────────────────────────────────

  const services = healthMatrix.map(h => ({
    name:    h.name,
    status:  h.status,
    latency: h.latency,
  }));

  // ── Latency chart from store ──────────────────────────────────────────────

  const latencyChartData = latencyHistory.slice(-30).map((v, i) => ({ i, ms: v }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20 md:pb-0"
    >
      {/* Header */}
      <div className="mb-6 border-b border-brand-border pb-4 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-brand-text">System Monitoring</h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">Real-time infrastructure telemetry</p>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionMode mode={connMode} />
          <div className="text-[10px] font-mono text-brand-text-muted bg-brand-surface border border-brand-border px-2 py-1 rounded">
            {stats.apiCalls.toLocaleString()} API CALLS
          </div>
        </div>
      </div>

      {/* Resource gauges */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        <Gauge value={resources?.cpu_percent ?? 0}      label="CPU"       color="#4F46E5" icon={Cpu}      />
        <Gauge value={resources?.memory_percent ?? 0}   label="Memory"    color="#06B6D4" icon={Database} />
        <Gauge value={resources?.disk_percent ?? 0}     label="Disk"      color="#F59E0B" icon={HardDrive} />
        <Gauge value={resources?.network_in_kbps ?? 0}  label="Net In"    color="#10B981" icon={Network}  suffix=" KB/s" />
        <Gauge value={resources?.network_out_kbps ?? 0} label="Net Out"   color="#8B5CF6" icon={Network}  suffix=" KB/s" />
        <Gauge value={resources?.queue_depth ?? 0}      label="Queue"     color="#EF4444" icon={Zap}      suffix="" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CPU/Memory history */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-muted flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-brand-primary" />
              CPU & Memory (60 s)
            </h3>
          </div>
          {resourceHistory.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-brand-text-muted text-xs font-mono">
              Waiting for data…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={resourceHistory}>
                <defs>
                  <linearGradient id="gCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#64748B' }} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748B' }} tickFormatter={v => `${v}%`} />
                <Tooltip
                  contentStyle={{ background: '#141A2E', border: '1px solid #1E293B', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#4F46E5" fill="url(#gCpu)" name="CPU %" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="mem" stroke="#06B6D4" fill="url(#gMem)" name="Mem %" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Latency history from store */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-muted flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-brand-warning" />
              API Latency (30 samples)
            </h3>
          </div>
          {latencyChartData.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-brand-text-muted text-xs font-mono">
              No latency data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={latencyChartData}>
                <defs>
                  <linearGradient id="gLat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="i" tick={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748B' }} tickFormatter={v => `${v}ms`} />
                <Tooltip
                  contentStyle={{ background: '#141A2E', border: '1px solid #1E293B', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number) => [`${v} ms`, 'Latency']}
                />
                <Area type="monotone" dataKey="ms" stroke="#F59E0B" fill="url(#gLat)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Services grid */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-muted mb-4 flex items-center gap-2">
          <Server className="w-3.5 h-3.5 text-brand-accent" />
          Service Health ({services.filter(s => s.status === 'online' || s.status === 'ok').length}/{services.length} healthy)
        </h3>
        {services.length === 0 ? (
          <div className="text-brand-text-muted text-xs font-mono text-center py-6">
            No service data — connect to backend to see health matrix
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {services.map(svc => <ServiceCard key={svc.name} svc={svc} />)}
          </div>
        )}
      </div>

      {/* Live log stream */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden flex flex-col">
        {/* Log toolbar */}
        <div className="p-4 border-b border-brand-border flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-brand-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-text">Live Logs</span>
            <span className="text-[10px] font-mono text-brand-text-muted bg-brand-elevated px-2 py-0.5 rounded">
              {filteredLogs.length} entries
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-text-muted" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search logs…"
                className="bg-brand-elevated border border-brand-border text-xs text-brand-text pl-7 pr-3 py-1.5 rounded-lg outline-none focus:border-brand-primary/50 w-40 font-mono"
              />
            </div>

            {/* Level filter */}
            <div className="flex items-center gap-1">
              <Filter className="w-3 h-3 text-brand-text-muted" />
              {LEVELS.map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={cn(
                    'text-[9px] font-mono font-bold px-2 py-1 rounded transition-colors',
                    levelFilter === lvl
                      ? 'bg-brand-primary text-white'
                      : 'bg-brand-elevated text-brand-text-muted hover:text-brand-text',
                  )}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Pause / resume */}
            <button
              onClick={() => setPaused(p => !p)}
              className={cn(
                'flex items-center gap-1.5 text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg transition-colors',
                paused
                  ? 'bg-brand-success/20 text-brand-success border border-brand-success/30'
                  : 'bg-brand-elevated text-brand-text-muted hover:text-brand-text border border-brand-border',
              )}
            >
              {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              {paused ? 'RESUME' : 'PAUSE'}
            </button>

            {/* Clear */}
            <button
              onClick={() => setLogs([])}
              className="flex items-center gap-1.5 text-[10px] font-mono text-brand-text-muted hover:text-brand-danger px-2 py-1.5 rounded-lg border border-brand-border hover:border-brand-danger/30 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              CLEAR
            </button>
          </div>
        </div>

        {/* Log entries */}
        <div className="h-[400px] overflow-y-auto font-mono text-xs p-4 space-y-1.5 bg-[#0A0E17] scrollbar-hide">
          <AnimatePresence initial={false}>
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-brand-text-muted gap-2">
                <Radio className="w-8 h-8 opacity-30" />
                <span className="text-[11px] tracking-widest uppercase">
                  {connMode === 'disconnected' ? 'Connect to backend to stream logs' : 'No log entries match current filters'}
                </span>
              </div>
            ) : (
              filteredLogs.map((entry, i) => (
                <motion.div
                  key={`${entry.timestamp}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'flex items-start gap-2 border-l-2 pl-2 py-0.5 group',
                    entry.level === 'ERROR' || entry.level === 'CRITICAL'
                      ? 'border-brand-danger bg-brand-danger/5'
                      : entry.level === 'WARNING'
                        ? 'border-brand-warning'
                        : 'border-brand-primary/30',
                  )}
                >
                  <span className="text-brand-text-muted shrink-0 w-20 truncate">
                    {new Date(entry.timestamp * 1000).toLocaleTimeString([], { hour12: false })}
                  </span>
                  <LevelBadge level={entry.level} />
                  <span className="text-brand-accent shrink-0 max-w-[140px] truncate hidden sm:block">
                    {entry.module}
                  </span>
                  <span className={cn(
                    'flex-1 break-all',
                    entry.level === 'ERROR' || entry.level === 'CRITICAL' ? 'text-brand-danger font-bold' :
                    entry.level === 'WARNING' ? 'text-brand-warning' : 'text-brand-text',
                  )}>
                    {entry.message}
                  </span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
          <div ref={logEndRef} />
        </div>

        {/* Log footer */}
        <div className="px-4 py-2 border-t border-brand-border bg-brand-surface flex items-center justify-between">
          <ConnectionMode mode={connMode} />
          <span className="text-[10px] font-mono text-brand-text-muted">
            {paused ? '⏸ PAUSED' : '▶ STREAMING'} · {filteredLogs.length} / {MAX_LOG_DISPLAY} displayed
          </span>
        </div>
      </div>
    </motion.div>
  );
}
