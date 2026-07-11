import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Activity, Server, Cpu, Database, Network, HardDrive, 
  PlaySquare, StopCircle, RefreshCw, Zap, Clock, Terminal, AlertTriangle,
  ListTodo, Pause, Play, Search, X, MessageCircle, Send,
  Globe, Shield
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

// ═══════════════════════════════════════════════════════════════════════════
// DATA FLOW VISUALIZER
// ═══════════════════════════════════════════════════════════════════════════

interface FlowNode {
  id: string;
  label: string;
  icon: React.ElementType;
  x: number;
  y: number;
  status: 'online' | 'degraded' | 'offline' | 'active';
  pulseCount: number;
}

interface FlowEdge {
  from: string;
  to: string;
  packets: { id: string; progress: number; opacity: number }[];
}

const NODE_LAYOUT: Omit<FlowNode, 'status' | 'pulseCount'>[] = [
  { id: 'gemini',     label: 'Gemini AI',        icon: Cpu,            x: 50,  y: 5 },
  { id: 'pipeline',   label: 'Content Pipeline',  icon: Zap,            x: 50,  y: 22 },
  { id: 'render',     label: 'Render Queue',      icon: Activity,       x: 85,  y: 22 },
  { id: 'command',    label: 'Command Executor',   icon: MessageCircle, x: 15,  y: 40 },
  { id: 'scheduler',  label: 'Post Scheduler',     icon: Send,          x: 50,  y: 40 },
  { id: 'browser',    label: 'Browser Manager',    icon: Globe,         x: 85,  y: 40 },
  { id: 'connectors', label: 'Connectors',         icon: Server,        x: 50,  y: 58 },
  { id: 'supabase',   label: 'Supabase',           icon: Database,      x: 30,  y: 76 },
  { id: 'redis',      label: 'Upstash Redis',      icon: Database,      x: 70,  y: 76 },
  { id: 'socketio',   label: 'Socket.IO',          icon: Activity,      x: 50,  y: 92 },
];

const EDGES: [string, string][] = [
  ['gemini', 'pipeline'],
  ['pipeline', 'render'],
  ['pipeline', 'scheduler'],
  ['gemini', 'command'],
  ['command', 'connectors'],
  ['scheduler', 'connectors'],
  ['render', 'browser'],
  ['browser', 'connectors'],
  ['connectors', 'supabase'],
  ['connectors', 'redis'],
  ['supabase', 'socketio'],
  ['redis', 'socketio'],
];

const STATUS_COLORS: Record<string, string> = {
  online: '#22c55e',
  degraded: '#f59e0b',
  offline: '#ef4444',
  active: '#3b82f6',
};

function DataFlowVisualizer() {
  const { socket, healthMatrix, stats } = useStore();
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [eventsPerSec, setEventsPerSec] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const packetIdRef = useRef(0);

  useEffect(() => {
    setNodes(NODE_LAYOUT.map(n => ({ ...n, status: 'offline', pulseCount: 0 })));
    setEdges(EDGES.map(([from, to]) => ({ from, to, packets: [] })));
  }, []);

  useEffect(() => {
    setNodes(prev => prev.map(node => {
      const health = healthMatrix.find(h => 
        h.id === node.id || 
        h.name?.toLowerCase().includes(node.id) ||
        (node.id === 'supabase' && h.id === 'supabase') ||
        (node.id === 'redis' && h.id === 'redis')
      );
      const status = health 
        ? (health.status === 'online' ? 'online' : health.status === 'degraded' ? 'degraded' : 'offline')
        : node.status;
      return { ...node, status };
    }));
  }, [healthMatrix]);

  useEffect(() => {
    if (!socket) return;

    const spawnPacket = () => {
      const edgeIndex = Math.floor(Math.random() * EDGES.length);
      const [from, to] = EDGES[edgeIndex];
      setEdges(prev => prev.map(edge => {
        if (edge.from === from && edge.to === to) {
          const newPacket = { id: `pkt_${packetIdRef.current++}`, progress: 0, opacity: 0.8 };
          return { ...edge, packets: [...edge.packets.slice(-3), newPacket] };
        }
        return edge;
      }));
    };

    const handlers = ['new_message', 'post_published', 'api_payload', 'scan_complete', 'stats'];
    handlers.forEach(event => {
      socket.on(event, () => {
        spawnPacket();
        setTotalEvents(prev => prev + 1);
      });
    });

    const interval = setInterval(() => {
      setEdges(prev => prev.map(edge => ({
        ...edge,
        packets: edge.packets
          .map(p => ({ ...p, progress: p.progress + 0.03, opacity: p.opacity - 0.01 }))
          .filter(p => p.progress < 1 && p.opacity > 0),
      })));
    }, 50);

    const epsInterval = setInterval(() => {
      setEventsPerSec(prev => {
        const diff = totalEvents - ((window as any).__lastTotal || 0);
        (window as any).__lastTotal = totalEvents;
        return diff;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(epsInterval);
    };
  }, [socket, totalEvents]);

  const getNodeStatus = (node: FlowNode) => {
    if (node.id === 'connectors' && stats.apiCalls > 0) return 'active';
    if (node.id === 'scheduler' && stats.postsPublished > 0) return 'active';
    if (node.id === 'socketio' && eventsPerSec > 0) return 'active';
    return node.status;
  };

  return (
    <div className="relative w-full h-[400px] bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {edges.map(edge => {
          const fromNode = nodes.find(n => n.id === edge.from);
          const toNode = nodes.find(n => n.id === edge.to);
          if (!fromNode || !toNode) return null;
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line x1={`${fromNode.x}%`} y1={`${fromNode.y}%`} x2={`${toNode.x}%`} y2={`${toNode.y}%`} stroke="#374151" strokeWidth="1" />
              {edge.packets.map(pkt => (
                <motion.circle
                  key={pkt.id} r="3" fill="#6366f1" opacity={pkt.opacity}
                  animate={{ cx: [`${fromNode.x}%`, `${toNode.x}%`], cy: [`${fromNode.y}%`, `${toNode.y}%`] }}
                  transition={{ duration: 0.6, ease: 'linear' }}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {nodes.map(node => {
        const Icon = node.icon;
        const status = getNodeStatus(node);
        const color = STATUS_COLORS[status];
        return (
          <motion.div
            key={node.id}
            className="absolute flex flex-col items-center gap-0.5"
            style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
            animate={{ scale: status === 'active' ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 2, repeat: status === 'active' ? Infinity : 0 }}
          >
            {status === 'active' && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: `2px solid ${color}` }}
                animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            <motion.div
              className="p-2 rounded-lg cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
              whileHover={{ scale: 1.15 }}
              title={`${node.label}: ${status}`}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </motion.div>
            <span className="text-[8px] font-mono font-bold uppercase text-brand-text-muted text-center leading-tight max-w-[55px]">
              {node.label}
            </span>
            <motion.div
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: color }}
              animate={{ opacity: status === 'active' ? [1, 0.4, 1] : 1 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        );
      })}

      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center bg-brand-elevated/90 backdrop-blur-sm border border-brand-border rounded-lg px-3 py-1.5">
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-brand-primary" />
            <span className="text-brand-text-muted">Events/s:</span>
            <span className="text-brand-primary font-bold">{eventsPerSec}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-brand-success" />
            <span className="text-brand-text-muted">Total:</span>
            <span className="text-brand-success font-bold">{totalEvents.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-brand-warning" />
            <span className="text-brand-text-muted">Queue:</span>
            <span className="text-brand-warning font-bold">{Math.max(0, stats.apiCalls - stats.postsPublished)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] font-mono text-brand-text-muted uppercase">Live Topology</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GAUGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

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
  DEBUG: 'border-gray-500/30',
  INFO: 'border-brand-primary/30',
  WARNING: 'border-brand-warning/30',
  WARN: 'border-brand-warning/30',
  ERROR: 'border-brand-danger/30',
  CRITICAL: 'border-purple-500/30',
};

// ═══════════════════════════════════════════════════════════════════════════
// MONITORING PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function Monitoring() {
  const { 
    healthMatrix, restEndpoint, masterToken, 
    stats, latencyHistory, pushLatency 
  } = useStore();

  const [events, setEvents] = useState<any[]>([]);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState({ level: '', search: '' });
  const [logStats, setLogStats] = useState({ errors: 0, warnings: 0, info: 0, total_logs: 0 });
  const [resources, setResources] = useState({ 
    cpu_percent: 0, memory_percent: 0, disk_percent: 0, 
    network_in_kbps: 0, network_out_kbps: 0, queue_depth: 0, workers_active: 0 
  });
  const [connectionMode, setConnectionMode] = useState<'sse' | 'polling'>('sse');
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const pausedBufferRef = useRef<any[]>([]);

  const headers = masterToken ? { Authorization: `Bearer ${masterToken}` } : {};

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch(`${restEndpoint.replace(/\/+$/, '')}/metrics/resources`, { headers });
        if (res.ok) {
          const data = await res.json();
          setResources(data);
          if (data.cpu_percent) pushLatency?.(data.cpu_percent);
        }
      } catch {}
    };
    fetchResources();
    const id = setInterval(fetchResources, 5000);
    return () => clearInterval(id);
  }, [restEndpoint]);

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
    const id = setInterval(fetchStats, 30000);
    return () => clearInterval(id);
  }, [restEndpoint]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.level) params.append('level', filter.level);

    const url = `${restEndpoint.replace(/\/+$/, '')}/logs/stream?${params}`;
    const es = new EventSource(url);

    es.onopen = () => setConnectionMode('sse');

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
      setConnectionMode('polling');
      es.close();
    };

    eventSourceRef.current = es;

    const pollInterval = setInterval(async () => {
      if (es.readyState === EventSource.OPEN) return;
      try {
        const p = new URLSearchParams({ limit: '100' });
        if (filter.level) p.append('level', filter.level);
        if (filter.search) p.append('search', filter.search);
        const res = await fetch(`${restEndpoint.replace(/\/+$/, '')}/logs/recent?${p}`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.logs?.length) setEvents(data.logs);
        }
      } catch {}
    }, 10000);

    return () => {
      es.close();
      clearInterval(pollInterval);
    };
  }, [restEndpoint, filter.level, paused]);

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

  const services = healthMatrix.map(h => ({
    name: h.name,
    status: h.status,
    uptime: `${h.uptime}%`,
    latency: [h.latency, h.latency * 0.9, h.latency * 1.1, h.latency * 0.95, h.latency, h.latency * 1.05, h.latency * 0.85, h.latency, h.latency * 1.15, h.latency * 0.9],
    lastChecked: new Date(h.lastChecked).toLocaleTimeString('en-US', { hour12: false }),
  }));

  const formatTime = (ts: string) => {
    try { return new Date(ts).toLocaleTimeString('en-US', { hour12: false }); }
    catch { return ts || ''; }
  };

  const filteredEvents = filter.search
    ? events.filter(e => 
        (e.message || e.msg || '').toLowerCase().includes(filter.search.toLowerCase()) ||
        (e.module || '').toLowerCase().includes(filter.search.toLowerCase())
      )
    : events;

  const gauges = {
    cpu: resources.cpu_percent || 0,
    mem: resources.memory_percent || 0,
    disk: resources.disk_percent || 0,
    netIn: Math.min(100, (resources.network_in_kbps || 0) / 10),
    netOut: Math.min(100, (resources.network_out_kbps || 0) / 10),
    queue: resources.queue_depth || 0,
  };

  const chartData = latencyHistory.length > 0 
    ? latencyHistory.map((v, i) => ({ time: i, latency: v }))
    : [];

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
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-3 text-xs font-mono">
            <span className="text-red-400">🔴 {logStats.errors || stats?.guardianIssues || 0}</span>
            <span className="text-amber-400">🟡 {logStats.warnings || 0}</span>
            <span className="text-blue-400">🔵 {logStats.info || 0}</span>
            <span className="text-gray-400">📋 {logStats.total_logs || 0}</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-brand-surface border border-brand-border rounded-xl">
            <div className={cn(
              "w-2.5 h-2.5 rounded-full",
              connectionMode === 'sse' ? 'bg-brand-success animate-pulse shadow-glow-success' : 'bg-brand-warning'
            )} />
            <span className={cn(
              "text-sm font-mono uppercase tracking-widest font-bold",
              connectionMode === 'sse' ? 'text-brand-success' : 'text-brand-warning'
            )}>
              {connectionMode === 'sse' ? 'SSE Live' : 'REST Polling'}
            </span>
          </div>
        </div>
      </div>

      {/* Row 1: Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Gauge value={gauges.cpu} label="CPU Usage" color="#4F46E5" icon={Cpu} suffix="%" />
        <Gauge value={gauges.mem} label="Memory" color="#06B6D4" icon={Database} suffix="%" />
        <Gauge value={gauges.disk} label="Disk I/O" color="#10B981" icon={HardDrive} suffix="%" />
        <Gauge value={gauges.netIn} label="Net In" color="#F59E0B" icon={Network} suffix="MB" />
        <Gauge value={gauges.netOut} label="Net Out" color="#8B5CF6" icon={Network} suffix="MB" />
        <Gauge value={gauges.queue} label="Queue Depth" color="#EF4444" icon={ListTodo} />
      </div>

      {/* Row 1.5: System Data Flow Topology Map */}
      <DataFlowVisualizer />

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-6">API Latency (Last 60 Pings)</h3>
          <div className="h-64">
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-brand-text-muted text-sm uppercase tracking-widest">
                Waiting for latency data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0B1121', border: '1px solid #1E293B', borderRadius: '12px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="latency" stroke="#4F46E5" strokeWidth={2} fill="url(#latencyGrad)" dot={false} isAnimationActive={true} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-6">Platform Stats</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <span className="text-5xl font-bold text-brand-primary">{stats?.apiCalls?.toLocaleString() || 0}</span>
              <p className="text-brand-text-muted text-sm mt-2">Total API Requests Today</p>
              <div className="flex gap-8 mt-4 text-sm">
                <div><p className="text-brand-text-muted">Posts</p><p className="text-xl font-bold text-brand-success">{stats?.postsPublished || 0}</p></div>
                <div><p className="text-brand-text-muted">Messages</p><p className="text-xl font-bold text-brand-accent">{stats?.messagesToday || 0}</p></div>
                <div><p className="text-brand-text-muted">Users</p><p className="text-xl font-bold text-brand-warning">{stats?.activeUsers || 0}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((svc, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-brand-surface border border-brand-border rounded-2xl p-5 flex flex-col justify-between hover:border-brand-primary/30 transition-all"
          >
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
          </motion.div>
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
              <option value="DEBUG">DEBUG</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-text-muted" />
              <input
                type="text"
                placeholder="Search..."
                value={filter.search}
                onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
                className="bg-brand-elevated border border-brand-border rounded pl-7 pr-2 py-1 text-xs text-brand-text w-36"
              />
              {filter.search && (
                <button onClick={() => setFilter(f => ({ ...f, search: '' }))} className="absolute right-1.5 top-1/2 -translate-y-1/2">
                  <X className="w-3 h-3 text-brand-text-muted hover:text-brand-text" />
                </button>
              )}
            </div>
            <button
              onClick={paused ? handleUnpause : () => setPaused(true)}
              className={cn(
                "px-3 py-1 rounded text-xs font-bold flex items-center gap-1",
                paused ? "bg-brand-success text-white" : "bg-brand-warning text-white"
              )}
            >
              {paused ? <><Play className="w-3 h-3" /> Resume</> : <><Pause className="w-3 h-3" /> Pause</>}
            </button>
            <span className="text-[10px] font-mono text-brand-text-muted">{filteredEvents.length} entries</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
          {filteredEvents.length === 0 && (
            <div className="text-brand-text-muted text-center mt-8 uppercase tracking-widest">
              {connectionMode === 'sse' ? 'Waiting for log events...' : 'No logs received — check backend log endpoints'}
            </div>
          )}
          {filteredEvents.map((entry, i) => (
            <motion.div
              key={entry.id || entry.epoch_ms || i}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex gap-3 py-0.5 hover:bg-brand-elevated/50 rounded px-2 border-l-2",
                LEVEL_BORDER[entry.level] || 'border-brand-primary/30'
              )}
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
