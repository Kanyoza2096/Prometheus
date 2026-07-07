import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Database, Activity, Server, CheckCircle, XCircle, Zap, Globe } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const resourceData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i * 5}s`,
  cpu: Math.floor(Math.random() * 40) + 30,
  memory: Math.floor(Math.random() * 30) + 50,
}));

const services = [
  { name: 'API Server', status: 'online', uptime: '99.8%', latency: '234ms', requests: '12,450' },
  { name: 'Database', status: 'online', uptime: '99.9%', latency: '45ms', requests: '45,678' },
  { name: 'Redis Cache', status: 'online', uptime: '100%', latency: '12ms', requests: '89,012' },
  { name: 'Supabase', status: 'online', uptime: '99.7%', latency: '156ms', requests: '23,456' },
  { name: 'Facebook API', status: 'degraded', uptime: '95.2%', latency: '1.2s', requests: '5,678' },
  { name: 'Gemini AI', status: 'online', uptime: '99.5%', latency: '456ms', requests: '3,456' },
];

const recentEvents = [
  { id: 1, type: 'info', message: 'System backup completed', time: '2 min ago' },
  { id: 2, type: 'warning', message: 'High CPU usage detected', time: '15 min ago' },
  { id: 3, type: 'error', message: 'Facebook API timeout', time: '30 min ago' },
  { id: 4, type: 'success', message: 'Deployment successful', time: '1 hour ago' },
  { id: 5, type: 'info', message: 'New user registered', time: '1 hour ago' },
];

const eventColors = {
  info: 'bg-brand-primary/20 text-brand-primary',
  warning: 'bg-brand-warning/20 text-brand-warning',
  error: 'bg-brand-danger/20 text-brand-danger',
  success: 'bg-brand-success/20 text-brand-success',
};

export default function Monitoring() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20 md:pb-0"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
          <Cpu className="w-8 h-8 mr-3 text-brand-primary" />
          Monitoring
        </h1>
        <p className="text-brand-text-muted text-sm font-mono mt-1">REAL-TIME SYSTEM MONITORING</p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'CPU Usage', value: '45%', icon: Cpu, color: '#4F46E5' },
          { label: 'Memory', value: '68%', icon: Database, color: '#10B981' },
          { label: 'Active Workers', value: '8', icon: Server, color: '#F59E0B' },
          { label: 'Queue Length', value: '234', icon: Activity, color: '#8B5CF6' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + idx * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-brand-surface border border-brand-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <motion.div
                whileHover={{ rotate: 10 }}
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: stat.color + '20' }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </motion.div>
            </div>
            <p className="text-xs text-brand-text-muted font-mono mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-brand-text">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Usage Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-4">Resource Usage</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resourceData}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#4F46E5" fillOpacity={1} fill="url(#colorCpu)" name="CPU" />
                <Area type="monotone" dataKey="memory" stroke="#10B981" fillOpacity={1} fill="url(#colorMemory)" name="Memory" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Services Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-4">Services</h2>
          <div className="space-y-3">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                whileHover={{ x: 4 }}
                className="p-4 bg-brand-elevated rounded-xl border border-brand-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      service.status === 'online' && 'bg-brand-success animate-pulse',
                      service.status === 'degraded' && 'bg-brand-warning animate-pulse',
                      service.status === 'offline' && 'bg-brand-danger'
                    )} />
                    <h3 className="text-sm font-bold text-brand-text">{service.name}</h3>
                  </div>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                    service.status === 'online' && 'bg-brand-success/20 text-brand-success',
                    service.status === 'degraded' && 'bg-brand-warning/20 text-brand-warning',
                    service.status === 'offline' && 'bg-brand-danger/20 text-brand-danger'
                  )}>
                    {service.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-brand-text-muted font-mono">
                  <div>Uptime: {service.uptime}</div>
                  <div>Latency: {service.latency}</div>
                  <div>Requests: {service.requests}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-brand-surface border border-brand-border rounded-2xl p-6"
      >
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-4">Recent Events</h2>
        <div className="space-y-3">
          {recentEvents.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + idx * 0.05 }}
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 p-3 bg-brand-elevated rounded-xl border border-brand-border"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', eventColors[event.type as keyof typeof eventColors])}
              >
                {event.type === 'success' && <CheckCircle className="w-4 h-4" />}
                {event.type === 'error' && <XCircle className="w-4 h-4" />}
                {event.type === 'warning' && <Activity className="w-4 h-4" />}
                {event.type === 'info' && <Zap className="w-4 h-4" />}
              </motion.div>
              <div className="flex-1">
                <p className="text-sm font-bold text-brand-text">{event.message}</p>
                <p className="text-xs text-brand-text-muted font-mono mt-1">{event.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
