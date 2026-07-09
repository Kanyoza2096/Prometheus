import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { 
  Activity, Cpu, Database, Webhook, Zap, Server, MessageSquare, 
  ShieldCheck, Globe, Box, Building2, BookOpen, 
  Users, Briefcase, Workflow, ListTodo, AlertCircle,
  FileText, ShieldAlert, LayoutDashboard, TrendingUp,
  Network, DollarSign, BarChart3, Sparkles, Clock,
  BrainCircuit, ChevronRight
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { cn } from '../lib/utils';
import SystemTopology from '../components/SystemTopology';

// ─── Animated Counter ───
const AnimatedNumber = ({ value, duration = 800 }: { value: number; duration?: number }) => {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{display.toLocaleString()}</span>;
};

// ─── Pulse Dot ───
const PulseDot = ({ color }: { color: string }) => (
  <span className="relative flex h-2 h-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }} />
  </span>
);

// ─── Radial Health Gauge ───
const HealthRadial = ({ value, size = 60, strokeWidth = 5, color }: { value: number; size?: number; strokeWidth?: number; color: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-brand-elevated" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold" style={{ color }}>{Math.round(value)}%</span>
      </div>
    </div>
  );
};

// ─── Chart Tooltip ───
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

const conversationData = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  conversations: Math.floor(Math.random() * 5000) + 1000,
}));

const postsData = Array.from({ length: 7 }, (_, i) => ({
  name: `Day ${i + 1}`,
  daily: Math.floor(Math.random() * 50) + 10,
  monthly: Math.floor(Math.random() * 500) + 200,
}));

const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Dashboard() {
  const { stats, messages, healthMatrix, recentPosts, guardianAlerts, socketConnected, latencyHistory } = useStore();

  const onlineServices = healthMatrix.filter(h => h.status === 'online').length;
  const totalServices = healthMatrix.length || 7;
  const systemHealth = totalServices > 0 ? Math.round((onlineServices / totalServices) * 100) : 100;

  const platformData = useMemo(() => {
    const platforms: Record<string, number> = {};
    recentPosts.forEach(p => { platforms[p.platform] = (platforms[p.platform] || 0) + 1; });
    return Object.entries(platforms).map(([name, value]) => ({ name, value }));
  }, [recentPosts]);

  const topMetrics = useMemo(() => [
    { label: 'Platform Health', value: `${systemHealth}%`, icon: ShieldCheck, color: 'text-brand-success' },
    { label: 'AI Status', value: 'Active', icon: Activity, color: 'text-brand-primary' },
    { label: 'Memory Usage', value: '64%', icon: Database, color: 'text-brand-warning' },
    { label: 'CPU Load', value: '42%', icon: Cpu, color: 'text-brand-accent' },
    { label: 'API Calls', value: stats.apiCalls.toLocaleString(), icon: Zap, color: 'text-brand-success' },
    { label: 'Gemini Usage', value: '1.2M', icon: Webhook, color: 'text-brand-primary' },
    { label: 'Supabase', value: 'Connected', icon: Server, color: 'text-brand-success' },
    { label: 'Plugins', value: '8/8 Active', icon: Box, color: 'text-brand-accent' },
    { label: 'FB Pages', value: '12', icon: Globe, color: 'text-brand-primary' },
    { label: 'WA Accounts', value: '4', icon: MessageSquare, color: 'text-brand-success' },
  ], [stats.apiCalls, systemHealth]);

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
      {/* ── HEADER ── */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between border-b border-brand-border pb-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-brand-text flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-primary" />
            Command Dashboard
          </h1>
          <p className="text-brand-text-muted text-xs font-mono mt-1 uppercase tracking-widest">Real-time platform telemetry and system health monitoring</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <HealthRadial value={systemHealth} size={44} strokeWidth={4} color={systemHealth > 90 ? '#10B981' : '#F59E0B'} />
            <span className="text-[10px] font-mono text-brand-text-muted uppercase">System Health</span>
          </div>
          <div className="flex items-center space-x-2 bg-brand-surface border border-brand-border px-3 py-1.5">
            <PulseDot color="#10B981" />
            <span className="text-[10px] font-mono text-brand-success uppercase tracking-widest">
              {socketConnected ? 'Live Connection' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* ── TOP ROW: Stat Cards ── */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-10 gap-3"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      >
        {topMetrics.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ scale: 1.02, borderColor: '#4F46E5' }}
            className="bg-brand-surface border border-brand-border p-3 flex flex-col justify-between hover:border-brand-primary/50 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[9px] uppercase font-bold text-brand-text-muted tracking-widest leading-tight w-2/3">{m.label}</span>
              <m.icon className={cn("w-4 h-4", m.color)} />
            </div>
            <span className={cn("text-sm lg:text-base xl:text-sm font-mono font-bold tracking-tight truncate", m.color)}>{m.value}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* ── SECOND ROW: System Categories ── */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      >
        {sysMetrics.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.03 }}
            whileHover={{ scale: 1.02 }}
            className="bg-brand-surface border border-brand-border p-3 flex items-center space-x-3 hover:bg-brand-elevated transition-colors cursor-pointer"
          >
            <div className={cn("p-2 rounded bg-brand-elevated border border-brand-border", m.color)}>
              <m.icon className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <div className="text-[9px] uppercase font-bold text-brand-text-muted tracking-widest truncate">{m.label}</div>
              <div className="text-lg font-mono font-bold text-brand-text leading-tight">{m.value}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── THIRD ROW: Activity Stream + Health Matrix ── */}
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
              messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex space-x-3 items-start text-xs border-b border-brand-border/50 pb-3 last:border-0 hover:bg-brand-elevated/50 p-2 -mx-2 transition-colors"
                >
                  <div className="text-brand-text-muted whitespace-nowrap min-w-[80px]">{new Date(msg.time).toLocaleTimeString([], { hour12: false })}</div>
                  <div className="font-bold text-brand-primary min-w-[120px] uppercase truncate">{msg.user}</div>
                  <div className="text-brand-text break-words w-full">{msg.message}</div>
                </motion.div>
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
            {healthMatrix.map((svc, i) => (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.03 }}
                className="flex items-center justify-between p-2 bg-brand-elevated border border-brand-border hover:border-brand-primary/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    svc.status === 'online' ? 'bg-brand-success' : svc.status === 'degraded' ? 'bg-brand-warning animate-pulse' : 'bg-brand-danger'
                  )} />
                  <div className="text-[11px] font-bold text-brand-text uppercase tracking-wider">{svc.name}</div>
                </div>
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
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── SYSTEM TOPOLOGY ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
      >
        <SystemTopology />
      </motion.div>

      {/* ── FOURTH ROW: Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        {/* Platform Distribution Pie */}
        <motion.div 
          className="bg-brand-surface border border-brand-border flex flex-col"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
        >
          <div className="border-b border-brand-border p-3 bg-brand-elevated">
            <h2 className="text-xs uppercase font-bold text-brand-text tracking-widest flex items-center">
              <Globe className="w-4 h-4 mr-2 text-brand-accent" />
              Platform Distribution
            </h2>
          </div>
          <div className="h-64 p-4 flex items-center justify-center">
            {platformData.length === 0 ? (
              <p className="text-xs text-brand-text-muted uppercase tracking-widest">No data</p>
            ) : (
              <div className="flex items-center gap-4 w-full">
                <div className="w-32 h-32 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={platformData} cx="50%" cy="50%" innerRadius={28} outerRadius={55} paddingAngle={3} dataKey="value">
                        {platformData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 flex-1">
                  {platformData.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between text-[10px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-brand-text capitalize">{p.name}</span>
                      </div>
                      <span className="text-brand-text-muted font-bold">{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── FIFTH ROW: Bottom Metrics ── */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      >
        {/* Revenue Card */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-brand-surface border border-brand-border p-4 flex flex-col justify-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-brand-success/5 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest mb-4 flex items-center">
              <DollarSign className="w-3 h-3 mr-1 text-brand-success" />
              Monthly Revenue
            </div>
            <div className="text-4xl font-mono font-bold text-brand-text tracking-tight">
              <AnimatedNumber value={stats.revenueMonthly} />
            </div>
            <div className="text-[10px] font-mono text-brand-success flex items-center mt-3 tracking-widest">
              <TrendingUp className="w-3 h-3 mr-1" />
              +14.5% VS LAST MONTH
            </div>
          </div>
        </motion.div>

        {/* Recent Publications */}
        <div className="xl:col-span-2 bg-brand-surface border border-brand-border p-4 flex flex-col h-40">
          <div className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest mb-3 flex items-center">
            <FileText className="w-3 h-3 mr-1 text-brand-primary" />
            Recent Publications
          </div>
          <div className="space-y-2 flex-1 overflow-y-auto pr-2">
            {recentPosts.slice(0, 3).map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                whileHover={{ borderColor: '#4F46E5' }}
                className="flex justify-between items-center bg-brand-elevated border border-brand-border p-2 hover:border-brand-primary/30 transition-colors cursor-pointer"
              >
                <div className="text-xs font-bold text-brand-text truncate pr-4">{post.title}</div>
                <div className="text-[9px] font-mono text-brand-text-muted uppercase px-2 py-0.5 bg-brand-surface border border-brand-border">{post.platform}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-brand-surface border border-brand-border p-4 flex flex-col h-40">
          <div className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest mb-3 flex items-center">
            <ShieldAlert className="w-3 h-3 mr-1 text-brand-danger" />
            Active Alerts
          </div>
          <div className="space-y-2 flex-1 overflow-y-auto">
            {guardianAlerts.slice(0, 3).map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="text-[10px] font-mono border-l-2 border-brand-danger pl-2 py-1 flex flex-col hover:bg-brand-danger/5 transition-colors cursor-pointer"
              >
                <span className="text-brand-danger font-bold uppercase tracking-widest">{alert.severity}</span>
                <span className="text-brand-text-muted truncate mt-0.5">{alert.title}</span>
              </motion.div>
            ))}
            {guardianAlerts.length === 0 && <div className="text-[10px] font-mono text-brand-success py-2 tracking-widest">NO ACTIVE ALERTS</div>}
          </div>
        </div>

        {/* Connected Tenants + Warnings */}
        <div className="bg-brand-surface border border-brand-border flex flex-col h-40">
          <motion.div
            whileHover={{ backgroundColor: 'rgba(79,70,229,0.05)' }}
            className="flex-1 p-3 border-b border-brand-border flex flex-col justify-center items-center transition-colors cursor-pointer"
          >
            <div className="text-[9px] uppercase font-bold text-brand-text-muted tracking-widest mb-1">Connected Tenants</div>
            <div className="text-2xl font-mono font-bold text-brand-text">1,402</div>
          </motion.div>
          <motion.div
            whileHover={{ backgroundColor: 'rgba(239,68,68,0.08)' }}
            className="flex-1 p-3 flex flex-col justify-center items-center bg-brand-danger/5 transition-colors cursor-pointer"
          >
            <div className="text-[9px] uppercase font-bold text-brand-danger tracking-widest mb-1">Active Warnings</div>
            <div className="text-2xl font-mono font-bold text-brand-danger">{stats.guardianIssues}</div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── QUICK ACTIONS ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="grid grid-cols-3 md:grid-cols-6 gap-3"
      >
        {[
          { label: 'New Post', icon: FileText, color: 'bg-brand-primary hover:bg-brand-primary/90' },
          { label: 'AI Chat', icon: BrainCircuit, color: 'bg-brand-accent hover:bg-brand-accent/90' },
          { label: 'Security', icon: ShieldAlert, color: 'bg-brand-danger hover:bg-brand-danger/90' },
          { label: 'Analytics', icon: BarChart3, color: 'bg-brand-success hover:bg-brand-success/90' },
          { label: 'Monitoring', icon: Activity, color: 'bg-brand-warning hover:bg-brand-warning/90' },
          { label: 'Settings', icon: ChevronRight, color: 'bg-brand-elevated border border-brand-border hover:bg-brand-elevated/80' },
        ].map((action, i) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.04 }}
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-white',
              action.color
            )}
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
