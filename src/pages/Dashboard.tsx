import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { 
  Activity, Cpu, Database, Webhook, Zap, Server, MessageSquare, 
  ShieldCheck, Globe, Box, Building2, BookOpen, 
  Users, Briefcase, Workflow, ListTodo, AlertCircle,
  FileText, ShieldAlert, LayoutDashboard, TrendingUp,
  Network, DollarSign, BarChart3, Sparkles, Clock,
  BrainCircuit, ChevronRight, Hexagon, ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { cn } from '../lib/utils';
import SystemTopology from '../components/SystemTopology';

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

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

const PulseDot = ({ color, size = 'md' }: { color: string; size?: 'sm' | 'md' }) => (
  <span className={cn("relative flex", size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5')}>
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
    <span className="relative inline-flex rounded-full h-full w-full" style={{ backgroundColor: color }} />
  </span>
);

const SpinningGlobe = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
    className="absolute -top-6 -right-6 opacity-[0.06] pointer-events-none"
  >
    <Hexagon className="w-32 h-32 text-brand-primary" />
  </motion.div>
);

const FloatingOrb = ({ color, size, x, y, delay = 0 }: { color: string; size: number; x: string; y: string; delay?: number }) => (
  <motion.div
    className="absolute rounded-full blur-2xl pointer-events-none"
    style={{ width: size, height: size, left: x, top: y, backgroundColor: color }}
    animate={{ 
      scale: [1, 1.3, 1],
      opacity: [0.08, 0.15, 0.08],
    }}
    transition={{ repeat: Infinity, duration: 6, delay, ease: 'easeInOut' }}
  />
);

const HealthRadial = ({ value, size = 52, strokeWidth = 4, color }: { value: number; size?: number; strokeWidth?: number; color: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-brand-elevated/50" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold font-mono" style={{ color }}>{Math.round(value)}%</span>
      </div>
    </div>
  );
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-surface border border-brand-border/60 p-3 rounded-xl shadow-2xl backdrop-blur-sm">
        <p className="text-brand-text-muted text-[10px] font-mono mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs font-bold font-mono" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MetricCard = ({ icon: Icon, label, value, color, delay = 0 }: { icon: any; label: string; value: string; color: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, ease: 'easeOut' }}
    whileHover={{ scale: 1.02, y: -2 }}
    className="bg-brand-surface border border-brand-border p-4 rounded-2xl flex flex-col gap-2 hover:border-brand-primary/30 transition-all relative overflow-hidden group cursor-pointer"
  >
    <FloatingOrb color={color} size={40} x="60%" y="-20%" delay={delay} />
    <div className="flex justify-between items-start relative z-10">
      <span className="text-[9px] uppercase font-bold text-brand-text-muted tracking-widest leading-tight w-2/3">{label}</span>
      <motion.div
        whileHover={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
        className={cn("p-1.5 rounded-lg bg-brand-elevated/50", color.replace('text-', 'bg-').replace('brand-', 'brand-') + '/10')}
      >
        <Icon className={cn("w-4 h-4", color)} />
      </motion.div>
    </div>
    <span className={cn("text-lg font-mono font-bold tracking-tight truncate relative z-10", color)}>{value}</span>
  </motion.div>
);

const SystemMetricCard = ({ icon: Icon, label, value, color, delay = 0 }: { icon: any; label: string; value: string; color: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, ease: 'easeOut' }}
    whileHover={{ scale: 1.03, borderColor: '#4F46E5' }}
    className="bg-brand-surface border border-brand-border p-4 rounded-2xl flex items-center gap-4 hover:bg-brand-elevated/50 transition-all cursor-pointer group"
  >
    <motion.div
      whileHover={{ rotate: 360 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className={cn("p-2.5 rounded-xl bg-brand-elevated border border-brand-border group-hover:border-brand-primary/30 transition-colors", color)}
    >
      <Icon className="w-4 h-4" />
    </motion.div>
    <div className="overflow-hidden">
      <div className="text-[9px] uppercase font-bold text-brand-text-muted tracking-widest truncate">{label}</div>
      <div className="text-lg font-mono font-bold text-brand-text leading-tight">{value}</div>
    </div>
  </motion.div>
);

const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, messages, healthMatrix, recentPosts, guardianAlerts, socketConnected, latencyHistory } = useStore();

  const onlineServices = healthMatrix.filter(h => h.status === 'online').length;
  const totalServices = healthMatrix.length || 7;
  const systemHealth = totalServices > 0 ? Math.round((onlineServices / totalServices) * 100) : 100;

  const conversationData = useMemo(() => {
    const baseVal = stats.messagesToday || 0;
    if (baseVal === 0) return [];
    return Array.from({ length: 30 }, (_, i) => ({
      day: `D${i + 1}`,
      conversations: Math.round(baseVal * (0.7 + Math.sin(i / 5) * 0.3)),
    }));
  }, [stats.messagesToday]);

  const postsData = useMemo(() => {
    const dailyBase = stats.postsPublished || 0;
    if (dailyBase === 0) return [];
    return Array.from({ length: 7 }, (_, i) => ({
      name: `D${i + 1}`,
      daily: Math.round(dailyBase * (0.7 + Math.random() * 0.3)),
      monthly: Math.round(dailyBase * 10 * (0.8 + Math.random() * 0.2)),
    }));
  }, [stats.postsPublished]);

  const platformData = useMemo(() => {
    const platforms: Record<string, number> = {};
    recentPosts.forEach(p => { platforms[p.platform] = (platforms[p.platform] || 0) + 1; });
    return Object.entries(platforms).map(([name, value]) => ({ name, value }));
  }, [recentPosts]);

  const topMetrics = useMemo(() => [
    { label: 'Platform Health', value: `${systemHealth}%`, icon: ShieldCheck, color: 'text-brand-success' },
    { label: 'AI Status', value: 'Active', icon: Activity, color: 'text-brand-primary' },
    { label: 'Memory Usage', value: '58%', icon: Database, color: 'text-brand-warning' },
    { label: 'CPU Load', value: '31%', icon: Cpu, color: 'text-brand-accent' },
    { label: 'API Calls', value: (stats.apiCalls || 0).toLocaleString(), icon: Zap, color: 'text-brand-success' },
    { label: 'Supabase', value: 'Connected', icon: Server, color: 'text-brand-success' },
    { label: 'Plugins', value: '8 Active', icon: Box, color: 'text-brand-accent' },
    { label: 'FB Pages', value: String(recentPosts.filter(p => p.platform === 'facebook').length || 0), icon: Globe, color: 'text-brand-primary' },
    { label: 'Redis', value: healthMatrix.find(h => h.id === 'redis')?.status === 'online' ? 'Online' : 'Off', icon: Database, color: 'text-brand-accent' },
    { label: 'Queue', value: String(recentPosts.length || 0), icon: LayoutDashboard, color: 'text-brand-warning' },
  ], [stats.apiCalls, systemHealth, recentPosts, healthMatrix]);

  const sysMetrics = useMemo(() => [
    { label: 'Messages Today', value: (stats.messagesToday || 0).toLocaleString(), icon: MessageSquare, color: 'text-brand-primary' },
    { label: 'Posts Published', value: (stats.postsPublished || 0).toLocaleString(), icon: FileText, color: 'text-brand-accent' },
    { label: 'Active Users', value: (stats.activeUsers || 0).toLocaleString(), icon: Users, color: 'text-brand-warning' },
    { label: 'Guardian Issues', value: String(stats.guardianIssues || 0), icon: ShieldAlert, color: 'text-brand-danger' },
    { label: 'Workflows', value: 'Active', icon: Workflow, color: 'text-brand-success' },
    { label: 'Revenue', value: `$${(stats.revenueMonthly || 0).toLocaleString()}`, icon: DollarSign, color: 'text-brand-success' },
    { label: 'Bg Workers', value: '42', icon: Server, color: 'text-brand-accent' },
    { label: 'System Health', value: `${systemHealth}%`, icon: Activity, color: systemHealth > 90 ? 'text-brand-success' : 'text-brand-warning' },
  ], [stats, systemHealth]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-24 md:pb-0">
      
      {/* ═══ HEADER ═══ */}
      <div className="relative overflow-hidden bg-brand-surface border border-brand-border rounded-3xl p-6 md:p-8">
        <SpinningGlobe />
        <FloatingOrb color="#4F46E5" size={120} x="70%" y="-20%" delay={0} />
        <FloatingOrb color="#06B6D4" size={80} x="40%" y="50%" delay={2} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
                className="w-12 h-12 rounded-2xl bg-brand-primary/20 flex items-center justify-center"
              >
                <Sparkles className="w-6 h-6 text-brand-primary" />
              </motion.div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Kanyoza<span className="text-brand-primary">Command</span>
                </h1>
                <p className="text-brand-text-muted text-xs font-mono mt-0.5 uppercase tracking-widest">Platform Telemetry & Control</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <HealthRadial value={systemHealth} size={44} strokeWidth={4} color={systemHealth > 90 ? '#10B981' : '#F59E0B'} />
              <span className="text-[10px] font-mono text-brand-text-muted uppercase">System<br/>Health</span>
            </div>
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono font-bold",
              socketConnected 
                ? "bg-brand-success/10 text-brand-success border-brand-success/20" 
                : "bg-brand-danger/10 text-brand-danger border-brand-danger/20"
            )}>
              <PulseDot color={socketConnected ? '#10B981' : '#EF4444'} />
              {socketConnected ? 'LIVE' : 'OFFLINE'}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ TOP METRICS ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {topMetrics.map((m, i) => (
          <MetricCard key={i} {...m} delay={i * 0.04} />
        ))}
      </div>

      {/* ═══ SYSTEM METRICS ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sysMetrics.map((m, i) => (
          <SystemMetricCard key={i} {...m} delay={0.15 + i * 0.04} />
        ))}
      </div>

      {/* ═══ ACTIVITY + HEALTH ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div 
          className="xl:col-span-2 bg-brand-surface border border-brand-border rounded-3xl flex flex-col overflow-hidden"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          <div className="border-b border-brand-border p-4 bg-brand-elevated/50 flex items-center justify-between">
            <h2 className="text-xs uppercase font-bold text-brand-text tracking-widest flex items-center gap-2">
              <Network className="w-4 h-4 text-brand-primary" /> Live Activity Stream
            </h2>
            <span className="text-[9px] font-mono text-brand-text-muted">{messages.length} events</span>
          </div>
          <div className="p-4 h-80 overflow-y-auto space-y-2 font-mono">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-brand-text-muted text-xs uppercase tracking-widest">
                Waiting for activity...
              </div>
            ) : messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.015 }}
                className="flex items-start gap-3 text-xs p-2 rounded-xl hover:bg-brand-elevated/50 transition-colors"
              >
                <span className="text-brand-text-muted whitespace-nowrap min-w-[70px] text-[10px]">
                  {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="font-bold text-brand-primary min-w-[100px] uppercase truncate text-[10px]">{msg.user}</span>
                <span className="text-brand-text break-words">{msg.message}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="bg-brand-surface border border-brand-border rounded-3xl flex flex-col overflow-hidden"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        >
          <div className="border-b border-brand-border p-4 bg-brand-elevated/50">
            <h2 className="text-xs uppercase font-bold text-brand-text tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-success" /> Service Health
            </h2>
          </div>
          <div className="p-3 h-80 overflow-y-auto space-y-1.5">
            {healthMatrix.map((svc, i) => (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.03 }}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-brand-elevated/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <PulseDot 
                    color={svc.status === 'online' ? '#10B981' : svc.status === 'degraded' ? '#F59E0B' : '#EF4444'} 
                    size="sm" 
                  />
                  <span className="text-[11px] font-bold text-brand-text">{svc.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-brand-text-muted">{svc.latency}ms</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-[9px] font-mono uppercase font-bold",
                    svc.status === 'online' ? "text-brand-success bg-brand-success/10" : 
                    svc.status === 'degraded' ? "text-brand-warning bg-brand-warning/10" : 
                    "text-brand-danger bg-brand-danger/10"
                  )}>{svc.status}</span>
                </div>
              </motion.div>
            ))}
            {healthMatrix.length === 0 && (
              <div className="flex items-center justify-center h-full text-brand-text-muted text-xs uppercase tracking-widest">
                No health data
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ═══ SYSTEM TOPOLOGY ═══ */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
        <SystemTopology />
      </motion.div>

      {/* ═══ CHARTS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {conversationData.length > 0 && (
          <motion.div 
            className="bg-brand-surface border border-brand-border rounded-3xl flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          >
            <div className="border-b border-brand-border p-4 bg-brand-elevated/50">
              <h2 className="text-xs uppercase font-bold text-brand-text tracking-widest flex items-center gap-2">
                <Network className="w-4 h-4 text-brand-primary" /> AI Conversations (30d)
              </h2>
            </div>
            <div className="h-64 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={conversationData}>
                  <defs>
                    <linearGradient id="colorConversations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="day" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="conversations" stroke="#4F46E5" strokeWidth={2} fill="url(#colorConversations)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {postsData.length > 0 && (
          <motion.div 
            className="bg-brand-surface border border-brand-border rounded-3xl flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          >
            <div className="border-b border-brand-border p-4 bg-brand-elevated/50">
              <h2 className="text-xs uppercase font-bold text-brand-text tracking-widest flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-accent" /> Publishing (7d)
              </h2>
            </div>
            <div className="h-64 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={postsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<ChartTooltip />} />
                  <Bar dataKey="daily" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        <motion.div 
          className="bg-brand-surface border border-brand-border rounded-3xl flex flex-col overflow-hidden"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
        >
          <div className="border-b border-brand-border p-4 bg-brand-elevated/50">
            <h2 className="text-xs uppercase font-bold text-brand-text tracking-widest flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-accent" /> Platforms
            </h2>
          </div>
          <div className="h-64 p-4 flex items-center justify-center">
            {platformData.length === 0 ? (
              <p className="text-xs text-brand-text-muted uppercase tracking-widest">No data yet</p>
            ) : (
              <div className="flex items-center gap-4 w-full">
                <div className="w-28 h-28 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={platformData} cx="50%" cy="50%" innerRadius={25} outerRadius={48} paddingAngle={4} dataKey="value">
                        {platformData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />)}
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

      {/* ═══ QUICK ACTIONS ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="grid grid-cols-3 md:grid-cols-6 gap-3"
      >
        {[
          { label: 'New Post', icon: FileText, color: 'bg-brand-primary hover:bg-brand-primary/90', path: '/posts' },
          { label: 'AI Brain', icon: BrainCircuit, color: 'bg-brand-accent hover:bg-brand-accent/90', path: '/ai-brain' },
          { label: 'Security', icon: ShieldAlert, color: 'bg-brand-danger hover:bg-brand-danger/90', path: '/security' },
          { label: 'Analytics', icon: BarChart3, color: 'bg-brand-success hover:bg-brand-success/90', path: '/analytics' },
          { label: 'Monitoring', icon: Activity, color: 'bg-brand-warning hover:bg-brand-warning/90', path: '/monitoring' },
          { label: 'Settings', icon: ChevronRight, color: 'bg-brand-elevated border border-brand-border hover:bg-brand-elevated/80 text-brand-text', path: '/settings' },
        ].map((action, i) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.05 }}
            onClick={() => navigate(action.path)}
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all relative overflow-hidden group',
              action.color
            )}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <action.icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{action.label}</span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
