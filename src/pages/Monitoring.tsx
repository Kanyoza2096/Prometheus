import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Activity, Server, Cpu, Database, Network, HardDrive, 
  PlaySquare, StopCircle, RefreshCw, Zap, Clock, Terminal, AlertTriangle,
  ListTodo
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

// Generate initial timeseries data
const generateTimeSeries = (count = 60) => Array.from({ length: count }, (_, i) => ({
  time: i,
  cpu: 30 + Math.random() * 20,
  memory: 50 + Math.random() * 15,
  queue: Math.floor(100 + Math.random() * 50),
  workers: Math.floor(5 + Math.random() * 5)
}));

const services = [
  { name: 'Database (Supabase)', status: 'online', uptime: '99.9%', latency: [12, 14, 15, 13, 45, 12, 11, 14, 15, 13], lastChecked: '1s ago' },
  { name: 'Redis Cache', status: 'online', uptime: '100%', latency: [2, 3, 2, 4, 3, 2, 2, 5, 2, 3], lastChecked: '1s ago' },
  { name: 'Facebook API', status: 'degraded', uptime: '95.2%', latency: [120, 150, 450, 800, 1200, 950, 400, 150, 130, 145], lastChecked: '5s ago' },
  { name: 'Gemini AI', status: 'online', uptime: '99.5%', latency: [450, 480, 520, 490, 460, 470, 510, 480, 460, 475], lastChecked: '2s ago' },
];

const initialEvents = [
  { id: 1, level: 'INFO', msg: 'Worker node-01 scaled up successfully', time: '10:45:02' },
  { id: 2, level: 'WARN', msg: 'High memory usage detected on Redis cluster', time: '10:44:15' },
  { id: 3, level: 'ERROR', msg: 'Facebook API rate limit exceeded (Retry in 5m)', time: '10:42:30' },
  { id: 4, level: 'INFO', msg: 'Scheduled backup completed (45GB)', time: '10:40:00' },
  { id: 5, level: 'INFO', msg: 'New tenant TechHub Malawi provisioned', time: '10:35:12' },
];

const workers = [
  { id: 'node-01', status: 'busy', task: 'Process Webhook', cpu: 45, started: '2h ago' },
  { id: 'node-02', status: 'idle', task: '-', cpu: 2, started: '5h ago' },
  { id: 'node-03', status: 'busy', task: 'Generate Report', cpu: 89, started: '10m ago' },
  { id: 'node-04', status: 'error', task: 'Failed DB Conn', cpu: 0, started: '1m ago' },
];

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

export default function Monitoring() {
  const [timeData, setTimeData] = useState(generateTimeSeries());
  const [gauges, setGauges] = useState({ cpu: 34, mem: 67, disk: 23, netIn: 45, netOut: 30, queue: 80 });
  const [events, setEvents] = useState(initialEvents);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeData(prev => {
        const last = prev[prev.length - 1];
        const next = {
          time: last.time + 1,
          cpu: Math.max(10, Math.min(90, last.cpu + (Math.random() * 10 - 5))),
          memory: Math.max(20, Math.min(95, last.memory + (Math.random() * 6 - 3))),
          queue: Math.max(0, last.queue + (Math.random() * 40 - 20)),
          workers: Math.max(2, Math.min(10, last.workers + (Math.random() > 0.8 ? 1 : Math.random() < 0.2 ? -1 : 0)))
        };
        return [...prev.slice(1), next];
      });

      setGauges(prev => ({
        cpu: Math.max(10, Math.min(95, prev.cpu + (Math.random() * 10 - 5))),
        mem: Math.max(20, Math.min(95, prev.mem + (Math.random() * 4 - 2))),
        disk: Math.max(5, Math.min(80, prev.disk + (Math.random() * 8 - 4))),
        netIn: Math.max(10, Math.min(90, prev.netIn + (Math.random() * 20 - 10))),
        netOut: Math.max(10, Math.min(90, prev.netOut + (Math.random() * 20 - 10))),
        queue: Math.max(0, Math.min(100, prev.queue + (Math.random() * 30 - 15))),
      }));
      
      if (Math.random() > 0.8) {
        setEvents(prev => [
          { 
            id: Date.now(), 
            level: Math.random() > 0.9 ? 'ERROR' : Math.random() > 0.7 ? 'WARN' : 'INFO', 
            msg: `System event: Routine check completed on node-${Math.floor(Math.random()*5)+1}`, 
            time: new Date().toLocaleTimeString('en-US', {hour12:false}) 
          }, 
          ...prev
        ].slice(0, 20));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
        <div className="flex items-center gap-3 px-4 py-2 bg-brand-surface border border-brand-border rounded-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-success animate-pulse shadow-glow-success" />
          <span className="text-sm font-mono text-brand-success uppercase tracking-widest font-bold">Live Stream Active</span>
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

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-6">Compute Resources</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#141A2E', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="cpu" stroke="#4F46E5" strokeWidth={2} dot={false} isAnimationActive={false} name="CPU %" />
                <Line type="monotone" dataKey="memory" stroke="#06B6D4" strokeWidth={2} dot={false} isAnimationActive={false} name="Memory %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-6">Queue & Workers</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorQueue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#141A2E', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="queue" stroke="#EF4444" fillOpacity={1} fill="url(#colorQueue)" isAnimationActive={false} name="Tasks" />
                <Line type="step" dataKey="workers" stroke="#10B981" strokeWidth={2} dot={false} isAnimationActive={false} name="Active Workers" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((svc, i) => (
          <div key={i} className="bg-brand-surface border border-brand-border rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-sm font-bold text-brand-text">{svc.name}</h4>
              <span className={cn(
                "px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider",
                svc.status === 'online' ? 'bg-brand-success/20 text-brand-success' : 'bg-brand-warning/20 text-brand-warning'
              )}>{svc.status}</span>
            </div>
            
            <div className="h-10 mb-4 flex items-end gap-1">
              {svc.latency.map((val, idx) => {
                const height = Math.max(10, Math.min(100, (val / Math.max(...svc.latency)) * 100));
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
                <button className="text-brand-primary hover:text-white transition-colors">Ping</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 4: Tables & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-brand-border">
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-text">Active Workers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-brand-text-muted font-mono uppercase bg-brand-elevated">
                <tr>
                  <th className="px-5 py-3 font-normal">Node</th>
                  <th className="px-5 py-3 font-normal">Status</th>
                  <th className="px-5 py-3 font-normal">Task</th>
                  <th className="px-5 py-3 font-normal">CPU</th>
                  <th className="px-5 py-3 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {workers.map((w, i) => (
                  <tr key={i} className="hover:bg-brand-elevated/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-brand-text">{w.id}</td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        "flex items-center gap-1.5 text-[11px] font-bold uppercase",
                        w.status === 'busy' ? "text-brand-accent" : w.status === 'idle' ? "text-brand-success" : "text-brand-danger"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", 
                          w.status === 'busy' ? "bg-brand-accent animate-pulse" : w.status === 'idle' ? "bg-brand-success" : "bg-brand-danger"
                        )} />
                        {w.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-brand-text-muted truncate max-w-[120px]">{w.task}</td>
                    <td className="px-5 py-4 font-mono">{w.cpu}%</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-brand-text-muted">
                        <button className="hover:text-brand-text"><RefreshCw className="w-4 h-4" /></button>
                        <button className="hover:text-brand-danger"><StopCircle className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden flex flex-col h-[400px]">
          <div className="p-5 border-b border-brand-border flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-text">Event Log</h3>
            <span className="text-[10px] font-mono text-brand-text-muted px-2 py-1 bg-brand-elevated rounded">Auto-scroll</span>
          </div>
          <div className="p-5 overflow-y-auto space-y-3 flex-1 scrollbar-hide">
            {events.map((ev, i) => (
              <motion.div 
                key={ev.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 text-sm border-l-2 pl-3 py-1"
                style={{
                  borderColor: ev.level === 'ERROR' ? '#EF4444' : ev.level === 'WARN' ? '#F59E0B' : '#4F46E5'
                }}
              >
                <div className="text-[10px] font-mono text-brand-text-muted mt-0.5 whitespace-nowrap">{ev.time}</div>
                <div className="flex-1">
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-sm mr-2",
                    ev.level === 'ERROR' ? "bg-brand-danger/20 text-brand-danger" : 
                    ev.level === 'WARN' ? "bg-brand-warning/20 text-brand-warning" : 
                    "bg-brand-primary/20 text-brand-primary"
                  )}>
                    {ev.level}
                  </span>
                  <span className={cn("text-brand-text", ev.level === 'ERROR' && "font-bold text-brand-danger")}>{ev.msg}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
