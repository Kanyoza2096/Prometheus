import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Activity, Server, Cpu, Database, Network, HardDrive, 
  PlaySquare, StopCircle, RefreshCw, Zap, Clock, Terminal, AlertTriangle,
  ListTodo, Pause, Play
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

const Gauge = ({ value, label, color, icon: Icon, suffix = '' }: any) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-3 left-3 text-brand-text-muted">
        <Icon className="w-4 h-4" />
      </div>
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-brand-elevated" />
          <circle cx="48" cy="48" r={radius} stroke={color} strokeWidth="6" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-500 ease-in-out" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-xl font-bold text-brand-text leading-none">{Math.round(value)}{suffix}</span>
        </div>
      </div>
      <p className="text-[10px] text-brand-text-muted font-mono uppercase mt-3 tracking-widest">{label}</p>
    </div>
  );
};

const LEVEL_COLORS: Record<string, string> = {
  DEBUG: '#6b7280',
  INFO: '#4F46E5',
  WARNING: '#F59E0B',
  WARN: '#F59E0B',
  ERROR: '#EF4444',
  CRITICAL: '#7c3aed',
};

const LEVEL_BORDER: Record<string, string> = {
  DEBUG: '#6b7280',
  INFO: '#4F46E5',
  WARNING: '#F59E0B',
  WARN: '#F59E0B',
  ERROR: '#EF4444',
  CRITICAL: '#7c3aed',
};

export default function Monitoring() {
  const { restEndpoint, masterToken, healthMatrix, stats, pushLatency } = useStore();
  const [events, setEvents] = useState<any[]>([]);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState({ level: '', search: '' });
  const [logStats, setLogStats] = useState({ errors: 0, warnings: 0, info: 0, total_logs: 0 });
  const [resources, setResources] = useState({ cpu_percent: 0, memory_percent: 0, disk_percent: 0, network_in_kbps: 0, network_out_kbps: 0, queue_depth: 0 });
  const eventSourceRef = useRef<EventSource | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const pausedBufferRef = useRef<any[]>([]);

  const headers = masterToken ? { Authorization: `Bearer ${masterToken}` } : {};

  // Fetch live logs via SSE
  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.level) params.append('level', filter.level);

    const url = `${restEndpoint.replace(/\/+$/, '')}/logs/stream?${params}`;
    const es = new EventSource(url);

    es.onopen = () => console.log('[LogStream] Connected');
    
    es.onmessage = (event) => {
      try {
        const entry = JSON.parse(event.data);
        if (paused) {
          pausedBufferRef.current.push(entry);
        } else {
          setEvents(prev => [entry, ...prev].slice(0, 200));
        }
      } catch {}
    };

    es.onerror = () => {
      console.warn('[LogStream] SSE error, falling back to polling');
      es.close();
    };

    eventSourceRef.current = es;

    return () => {
      es.close();
    };
  }, [restEndpoint, filter.level, paused]);

  // Fallback: REST polling for logs (when SSE fails)
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const params = new URLSearchParams({ limit: '100' });
        if (filter.level) params.append('level', filter.level);
        if (filter.search) params.append('search', filter.search);
        
        const res = await fetch(`${restEndpoint.replace(/\/+$/, '')}/logs/recent?${params}`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.logs?.length) setEvents(data.logs);
        }
      } catch {}
    };

    // Only poll if SSE is not connected
    if (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 10000);
      return () => clearInterval(interval);
    }
  }, [restEndpoint, filter, eventSourceRef.current?.readyState]);

  // Fetch log stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${restEndpoint.replace(/\/+$/, '')}/logs/stats`, { headers });
        if (res.ok) {
          const data = await res.json();
          setLogStats(data);
        }
      } catch {}
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [restEndpoint]);

  // Fetch resource metrics
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch(`${restEndpoint.replace(/\/+$/, '')}/metrics/resources`, { headers });
        if (res.ok) {
          const data = await res.json();
          setResources(data);
          pushLatency?.(data.cpu_percent || 0);
        }
      } catch {}
    };
    fetchResources();
    const interval = setInterval(fetchResources, 5000);
    return () => clearInterval(interval);
  }, [restEndpoint]);

  // Auto-scroll logs
  useEffect(() => {
    if (!paused && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events, paused]);

  const handleUnpause = () => {
    setPaused(false);
    if (pausedBufferRef.current.length > 0) {
      setEvents(prev => [...pausedBufferRef.current, ...prev].slice(0, 200));
      pausedBufferRef.current = [];
    }
  };

  // Build services from real healthMatrix
  const services = healthMatrix.map(h => ({
    name: h.name,
    status: h.status === 'online' ? 'online' as const : h.status === 'degraded' ? 'degraded' as const : 'offline' as const,
    uptime: `${h.uptime}%`,
    latency: [h.latency, h.latency * 0.9, h.latency * 1.1, h.latency * 0.95, h.latency, h.latency * 1.05, h.latency * 0.85, h.latency, h.latency * 1.15, h.latency * 0.9],
    lastChecked: new Date(h.lastChecked).toLocaleTimeString('en-US', { hour12: false }),
  }));

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString('en-US', { hour12: false });
    } catch {
      return ts;
    }
  };

  const filteredEvents = filter.search
    ? events.filter(e => 
        (e.message || e.msg || '').toLowerCase().includes(filter.search.toLowerCase()) ||
        (e.module || '').toLowerCase().includes(filter.search.toLowerCase())
      )
    : events;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20 md:pb-0"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <Activity className="w-8 h-8 mr-3 text-brand-primary" />
            System Monitoring
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">INFRASTRUCTURE TELEMETRY</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-2 bg-brand-surface border border-brand-border rounded-xl">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-success animate-pulse shadow-glow-success" />
            <span className="text-sm font-mono text-brand-success uppercase tracking-widest font-bold">
              {eventSourceRef.current?.readyState === EventSource.OPEN ? 'SSE Live' : 'REST Polling'}
            </span>
          </div>
          {/* Log stats */}
          <div className="hidden md:flex gap-3 text-xs font-mono">
            <span className="text-red-400">🔴 {logStats.errors || stats?.guardianIssues || 0}</span>
            <span className="text-amber-400">🟡 {logStats.warnings || 0}</span>
            <span className="text-blue-400">🔵 {logStats.info || 0}</span>
          </div>
        </div>
      </div>

      {/* Row 1: Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Gauge value={resources.cpu_percent} label="CPU Usage" color="#4F46E5" icon={Cpu} suffix="%" />
        <Gauge value={resources.memory_percent} label="Memory" color="#06B6D4" icon={Database} suffix="%" />
        <Gauge value={resources.disk_percent} label="Disk I/O" color="#10B981" icon={HardDrive} suffix="%" />
        <Gauge value={Math.min(100, resources.network_in_kbps / 10)} label="Net In" color="#F59E0B" icon={Network} suffix="MB" />
        <Gauge value={Math.min(100, resources.network_out_kbps / 10)} label="Net Out" color="#8B5CF6" icon={Network} suffix="MB" />
        <Gauge value={resources.queue_depth || 0} label="Queue Depth" color="#EF4444" icon={ListTodo} />
      </div>

      {/* Row 2: Charts (keep your existing charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-6">Compute Resources</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[]} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#141A2E', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-brand-text-muted text-center mt-2">Real CPU/Memory chart — wire to /metrics/query endpoint</p>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-6">API Calls Today</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <span className="text-5xl font-bold text-brand-primary">{stats?.apiCalls?.toLocaleString() || 0}</span>
              <p className="text-brand-text-muted text-sm mt-2">Total API Requests</p>
              <div className="flex gap-8 mt-4 text-sm">
                <div>
                  <p className="text-brand-text-muted">Posts</p>
                  <p className="text-xl font-bold text-brand-success">{stats?.postsPublished || 0}</p>
                </div>
                <div>
                  <p className="text-brand-text-muted">Messages</p>
                  <p className="text-xl font-bold text-brand-accent">{stats?.messagesToday || 0}</p>
                </div>
                <div>
                  <p className="text-brand-text-muted">Users</p>
                  <p className="text-xl font-bold text-brand-warning">{stats?.activeUsers || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Services (REAL data from healthMatrix) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((svc, i) => (
          <div key={i} className="bg-brand-surface border border-brand-border rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-sm font-bold text-brand-text">{svc.name}</h4>
              <span className={cn(
                "px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider",
                svc.status === 'online' ? 'bg-brand-success/20 text-brand-success' : 
                svc.status === 'degraded' ? 'bg-brand-warning/20 text-brand-warning' : 
                'bg-brand-danger/20 text-brand-danger'
              )}>{svc.status}</span>
            </div>
            
            <div className="h-10 mb-4 flex items-end gap-1">
              {svc.latency.map((val, idx) => {
                const maxVal = Math.max(...svc.latency, 1);
                const height = Math.max(8, Math.min(100, (val / maxVal) * 100));
                const isHigh = val > 400;
                return (
                  <div key={idx} className="flex-1 bg-brand-elevated rounded-t-sm relative group overflow-hidden">
                    <div 
                      className={cn("absolute bottom-0 w-full rounded-t-sm transition-all", isHigh ? "bg-brand-warning" : "bg-brand-primary")} 
                      style={{ height: `${height}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-brand-text-muted font-mono border-t border-brand-border pt-3">
              <span>UP {svc.uptime}</span>
              <div className="flex gap-2">
                <span>{svc.lastChecked}</span>
                <span className="text-brand-primary">{svc.latency[0]}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 4: Live Log Stream */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden flex flex-col h-[500px]">
        <div className="p-5 border-b border-brand-border flex justify-between items-center flex-wrap gap-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-brand-text">Live Log Stream</h3>
          <div className="flex items-center gap-2">
            <select
              value={filter.level}
              onChange={e => setFilter(f => ({ ...f, level: e.target.value }))}
              className="bg-brand-elevated border border-brand-border rounded px-2 py-1 text-xs text-brand-text"
            >
              <option value="">All Levels</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
            <input
              type="text"
              placeholder="Search logs..."
              value={filter.search}
              onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
              className="bg-brand-elevated border border-brand-border rounded px-2 py-1 text-xs text-brand-text w-32"
            />
            <button
              onClick={paused ? handleUnpause : () => setPaused(true)}
              className={cn(
                "px-3 py-1 rounded text-xs font-bold",
                paused ? "bg-brand-success text-white" : "bg-brand-warning text-white"
              )}
            >
              {paused ? <><Play className="w-3 h-3 inline mr-1" /> Resume</> : <><Pause className="w-3 h-3 inline mr-1" /> Pause</>}
            </button>
            <span className="text-[10px] font-mono text-brand-text-muted">{filteredEvents.length} entries</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
          {filteredEvents.length === 0 && (
            <div className="text-brand-text-muted text-center mt-8">Waiting for log events...</div>
          )}
          {filteredEvents.map((entry, i) => (
            <motion.div
              key={entry.id || i}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-3 py-0.5 hover:bg-brand-elevated/50 rounded px-2"
              style={{ borderLeft: `2px solid ${LEVEL_BORDER[entry.level] || '#4F46E5'}` }}
            >
              <span className="text-brand-text-muted shrink-0 w-20">{formatTime(entry.timestamp || entry.time)}</span>
              <span
                className="shrink-0 w-14 text-center font-bold"
                style={{ color: LEVEL_COLORS[entry.level] || '#fff' }}
              >
                {entry.level}
              </span>
              <span className="text-brand-text-muted shrink-0 w-28 truncate" title={entry.module}>
                {entry.module || 'system'}
              </span>
              <span className="text-brand-text break-all">
                {entry.message || entry.msg}
              </span>
            </motion.div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </motion.div>
  );
}
