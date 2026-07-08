import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { 
  Activity, Cpu, Database, Webhook, Zap, Server, MessageSquare, 
  ShieldCheck, Globe, Box, Building2, BookOpen, 
  Users, Briefcase, Workflow, ListTodo, AlertCircle,
  FileText, ShieldAlert, LayoutDashboard, TrendingUp,
  Network, DollarSign, BarChart3
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { cn } from '../lib/utils';
import SystemTopology from '../components/SystemTopology';

const conversationData = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  conversations: Math.floor(Math.random() * 5000) + 1000,
}));

const postsData = Array.from({ length: 7 }, (_, i) => ({
  name: `Day ${i + 1}`,
  daily: Math.floor(Math.random() * 50) + 10,
  monthly: Math.floor(Math.random() * 500) + 200,
}));

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-elevated border border-brand-border p-3 shadow-lg">
        <p className="text-brand-text-muted text-xs font-mono mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-bold font-mono" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { stats, messages, healthMatrix, recentPosts, guardianAlerts } = useStore();

  const topMetrics = useMemo(() => [
    { label: 'Platform Health', value: 'Optimal', icon: ShieldCheck, color: 'text-brand-success' },
    { label: 'AI Status', value: 'Active', icon: Activity, color: 'text-brand-primary' },
    { label: 'Memory Usage', value: '64%', icon: Database, color: 'text-brand-warning' },
    { label: 'CPU Load', value: '42%', icon: Cpu, color: 'text-brand-accent' },
    { label: 'API Calls', value: stats.apiCalls.toLocaleString(), icon: Zap, color: 'text-brand-success' },
    { label: 'Gemini Usage', value: '1.2M', icon: Webhook, color: 'text-brand-primary' },
    { label: 'Supabase', value: 'Connected', icon: Server, color: 'text-brand-success' },
    { label: 'Plugins', value: '8/8 Active', icon: Box, color: 'text-brand-accent' },
    { label: 'FB Pages', value: '12', icon: Globe, color: 'text-brand-primary' },
    { label: 'WA Accounts', value: '4', icon: MessageSquare, color: 'text-brand-success' },
  ], [stats.apiCalls]);

  const sysMetrics = useMemo(() => [
    { label: 'School Systems', value: '24', icon: Building2, color: 'text-brand-primary' },
    { label: 'Church Systems', value: '18', icon: BookOpen, color: 'text-brand-accent' },
    { label: 'CRM Systems', value: '32', icon: Users, color: 'text-brand-warning' },
    { label: 'ERP Systems', value: '8', icon: Briefcase, color: 'text-brand-primary' },
    { label: 'Active Tasks', value: '1,204', icon: ListTodo, color: 'text-brand-success' },
    { label: 'Bg Workers', value: '42', icon: Workflow, color: 'text-brand-accent' },
    { label: 'Queue Size', value: '12', icon: LayoutDashboard, color: 'text-brand-warning' },
    { label: 'System Errors', value: stats.guardianIssues.toString(), icon: AlertCircle, color: 'text-brand-danger' },
  ], [stats.guardianIssues]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-20 md:pb-0"
    >
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between border-b border-brand-border pb-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-brand-text">Command Dashboard</h1>
          <p className="text-brand-text-muted text-xs font-mono mt-1 uppercase tracking-widest">Real-time platform telemetry and system health monitoring</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-brand-surface border border-brand-border px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
          <span className="text-[10px] font-mono text-brand-success uppercase tracking-widest">Live Connection Maintained</span>
        </div>
      </div>

      {/* Top row — stat cards */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-10 gap-3"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ staggerChildren: 0.05 }}
      >
        {topMetrics.map((m, i) => (
          <motion.div key={i} className="bg-brand-surface border border-brand-border p-3 flex flex-col justify-between hover:border-brand-primary/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[9px] uppercase font-bold text-brand-text-muted tracking-widest leading-tight w-2/3">{m.label}</span>
              <m.icon className={cn("w-4 h-4", m.color)} />
            </div>
            <span className={cn("text-sm lg:text-base xl:text-sm font-mono font-bold tracking-tight truncate", m.color)}>{m.value}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Second row — system categories grid */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      >
        {sysMetrics.map((m, i) => (
          <div key={i} className="bg-brand-surface border border-brand-border p-3 flex items-center space-x-3 hover:bg-brand-elevated transition-colors">
            <div className={cn("p-2 rounded bg-brand-elevated border border-brand-border", m.color)}>
              <m.icon className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <div className="text-[9px] uppercase font-bold text-brand-text-muted tracking-widest truncate">{m.label}</div>
              <div className="text-lg font-mono font-bold text-brand-text leading-tight">{m.value}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Third row — live activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div 
          className="xl:col-span-2 bg-brand-surface border border-brand-border flex flex-col"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          <div className="border-b border-brand-border p-3 bg-brand-elevated">
            <h2 className="text-xs uppercase font-bold text-brand-text tracking-widest flex items-center">
              <Network className="w-4 h-4 mr-2 text-brand-primary" />
              Live Activity Stream
            </h2>
          </div>
          <div className="p-4 h-80 overflow-y-auto space-y-3 font-mono">
            {messages.length === 0 ? (
              <div className="text-xs text-brand-text-muted text-center py-10 uppercase tracking-widest">NO ACTIVITY</div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="flex space-x-3 items-start text-xs border-b border-brand-border/50 pb-3 last:border-0 hover:bg-brand-elevated/50 p-2 -mx-2 transition-colors">
                  <div className="text-brand-text-muted whitespace-nowrap min-w-[80px]">{new Date(msg.time).toLocaleTimeString([], { hour12: false })}</div>
                  <div className="font-bold text-brand-primary min-w-[120px] uppercase truncate">{msg.user}</div>
                  <div className="text-brand-text break-words w-full">{msg.message}</div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div 
          className="bg-brand-surface border border-brand-border flex flex-col"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        >
          <div className="border-b border-brand-border p-3 bg-brand-elevated flex justify-between items-center">
            <h2 className="text-xs uppercase font-bold text-brand-text tracking-widest flex items-center">
              <Activity className="w-4 h-4 mr-2 text-brand-success" />
              Service Health Matrix
            </h2>
          </div>
          <div className="p-4 h-80 overflow-y-auto space-y-2">
            {healthMatrix.map(svc => (
              <div key={svc.id} className="flex items-center justify-between p-2 bg-brand-elevated border border-brand-border hover:border-brand-primary/30 transition-colors">
                <div className="text-[11px] font-bold text-brand-text uppercase tracking-wider">{svc.name}</div>
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] font-mono text-brand-text-muted">{svc.latency}ms</span>
                  <div className={cn(
                    "px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest w-[70px] text-center",
                    svc.status === 'online' ? "text-brand-success bg-brand-success/10 border border-brand-success/20" :
                    svc.status === 'degraded' ? "text-brand-warning bg-brand-warning/10 border border-brand-warning/20" :
                    "text-brand-danger bg-brand-danger/10 border border-brand-danger/20"
                  )}>
                    {svc.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Network topology — live microservice map */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
      >
        <SystemTopology />
      </motion.div>

      {/* Fourth row — charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          className="bg-brand-surface border border-brand-border flex flex-col"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        >
          <div className="border-b border-brand-border p-3 bg-brand-elevated">
            <h2 className="text-xs uppercase font-bold text-brand-text tracking-widest flex items-center">
              <Network className="w-4 h-4 mr-2 text-brand-primary" />
              AI Conversations (30 Days)
            </h2>
          </div>
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={conversationData}>
                <defs>
                  <linearGradient id="colorConversations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<ChartTooltip />} cursor={{ stroke: '#1E293B', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="conversations" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorConversations)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          className="bg-brand-surface border border-brand-border flex flex-col"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        >
          <div className="border-b border-brand-border p-3 bg-brand-elevated">
            <h2 className="text-xs uppercase font-bold text-brand-text tracking-widest flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-brand-accent" />
              Content Publishing Metrics
            </h2>
          </div>
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={postsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: '#1C2541' }} />
                <Bar dataKey="monthly" fill="#1E293B" radius={[2, 2, 0, 0]} />
                <Bar dataKey="daily" fill="#06B6D4" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Fifth row — bottom metrics */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      >
        <div className="bg-brand-surface border border-brand-border p-4 flex flex-col justify-center">
          <div className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest mb-4 flex items-center">
            <DollarSign className="w-3 h-3 mr-1 text-brand-success" />
            Monthly Revenue
          </div>
          <div>
            <div className="text-4xl font-mono font-bold text-brand-text tracking-tight shadow-glow-success inline-block">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats.revenueMonthly)}
            </div>
            <div className="text-[10px] font-mono text-brand-success flex items-center mt-3 tracking-widest">
              <TrendingUp className="w-3 h-3 mr-1" />
              +14.5% VS LAST MONTH
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 bg-brand-surface border border-brand-border p-4 flex flex-col h-40">
          <div className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest mb-3 flex items-center">
            <FileText className="w-3 h-3 mr-1 text-brand-primary" />
            Recent Publications
          </div>
          <div className="space-y-2 flex-1 overflow-y-auto pr-2">
            {recentPosts.slice(0, 3).map(post => (
              <div key={post.id} className="flex justify-between items-center bg-brand-elevated border border-brand-border p-2 hover:border-brand-primary/30 transition-colors">
                <div className="text-xs font-bold text-brand-text truncate pr-4">{post.title}</div>
                <div className="text-[9px] font-mono text-brand-text-muted uppercase px-2 py-0.5 bg-brand-surface border border-brand-border">{post.platform}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border p-4 flex flex-col h-40">
          <div className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest mb-3 flex items-center">
            <ShieldAlert className="w-3 h-3 mr-1 text-brand-danger" />
            Active Alerts
          </div>
          <div className="space-y-2 flex-1 overflow-y-auto">
            {guardianAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="text-[10px] font-mono border-l-2 border-brand-danger pl-2 py-1 flex flex-col">
                <span className="text-brand-danger font-bold uppercase tracking-widest">{alert.severity}</span>
                <span className="text-brand-text-muted truncate mt-0.5">{alert.title}</span>
              </div>
            ))}
            {guardianAlerts.length === 0 && <div className="text-[10px] font-mono text-brand-success py-2 tracking-widest">NO ACTIVE ALERTS</div>}
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border flex flex-col h-40">
          <div className="flex-1 p-3 border-b border-brand-border flex flex-col justify-center items-center hover:bg-brand-elevated transition-colors">
            <div className="text-[9px] uppercase font-bold text-brand-text-muted tracking-widest mb-1">Connected Tenants</div>
            <div className="text-2xl font-mono font-bold text-brand-text">1,402</div>
          </div>
          <div className="flex-1 p-3 flex flex-col justify-center items-center bg-brand-danger/5 hover:bg-brand-danger/10 transition-colors border-t border-brand-danger/10">
            <div className="text-[9px] uppercase font-bold text-brand-danger tracking-widest mb-1">Active Warnings</div>
            <div className="text-2xl font-mono font-bold text-brand-danger">{stats.guardianIssues}</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
