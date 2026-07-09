import React, { useMemo, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import {
  Activity, Cpu, Database, Webhook, Zap, Server, MessageSquare,
  ShieldCheck, Globe, Box, Building2, BookOpen,
  Users, Briefcase, Workflow, ListTodo, AlertCircle,
  FileText, ShieldAlert, LayoutDashboard, TrendingUp,
  Network, DollarSign, BarChart3, BrainCircuit, RefreshCw,
  PlayCircle, GitBranch,
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '../lib/utils';
import SystemTopology from '../components/SystemTopology';

// ---------------------------------------------------------------------------
// Animated number counter
// ---------------------------------------------------------------------------

const AnimatedNumber = ({
  value,
  prefix = '',
  suffix = '',
  duration = 1000,
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
}) => {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number>(0);
  const startValRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    startRef.current = performance.now();
    startValRef.current = display;
    const target = value;

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(startValRef.current + (target - startValRef.current) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const fmt = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString();

  return <span>{prefix}{fmt}{suffix}</span>;
};

// ---------------------------------------------------------------------------
// Pulse dot — animated status indicator
// ---------------------------------------------------------------------------

const PulseDot = ({ color = 'bg-brand-success', size = 'w-2 h-2' }: { color?: string; size?: string }) => (
  <span className="relative flex items-center justify-center">
    <span className={cn('absolute rounded-full animate-ping opacity-40', color, size)} />
    <span className={cn('relative rounded-full', color, size)} />
  </span>
);

// ---------------------------------------------------------------------------
// Health radial gauge
// ---------------------------------------------------------------------------

const HealthRadial = ({ percent, label, color }: { percent: number; label: string; color: string }) => {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percent, 100) / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 absolute inset-0">
          <circle cx="32" cy="32" r={r} strokeWidth="4" fill="transparent" className="text-brand-elevated" stroke="currentColor" />
          <circle
            cx="32" cy="32" r={r} strokeWidth="4" fill="transparent"
            stroke={color} strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="text-xs font-bold font-mono text-brand-text">{Math.round(percent)}%</span>
      </div>
      <span className="text-[9px] font-mono text-brand-text-muted uppercase tracking-wider text-center">{label}</span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Custom recharts tooltip
// ---------------------------------------------------------------------------

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-brand-elevated border border-brand-border p-3 shadow-lg rounded-lg">
        <p className="text-brand-text-muted text-xs font-mono mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-bold font-mono" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ---------------------------------------------------------------------------
// Platform distribution from real posts
// ---------------------------------------------------------------------------

const PLATFORM_COLORS: Record<string, string> = {
  facebook: '#4267B2',
  twitter:  '#1DA1F2',
  linkedin: '#0A66C2',
};

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } };

export default function Dashboard() {
  const { stats, messages, healthMatrix, recentPosts, guardianAlerts, latencyHistory, connectSocket } = useStore();

  // ── Post distribution by platform ───────────────────────────────────────

  const platformDist = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of recentPosts) {
      counts[p.platform] = (counts[p.platform] ?? 0) + 1;
    }
    return Object.entries(counts).map(([platform, value]) => ({ name: platform, value }));
  }, [recentPosts]);

  // ── Sparkline data from latency history ──────────────────────────────────

  const latencySparkline = useMemo(
    () => latencyHistory.slice(-20).map((v, i) => ({ i, ms: v })),
    [latencyHistory],
  );

  // ── Top 10 metrics ────────────────────────────────────────────────────────

  const topMetrics = useMemo(() => [
    { label: 'Platform Health', value: healthMatrix.every(h => h.status === 'online' || h.status === 'ok') ? 'Optimal' : 'Degraded', icon: ShieldCheck, color: 'text-brand-success' },
    { label: 'AI Status',       value: 'Active',                           icon: Activity,     color: 'text-brand-primary' },
    { label: 'Memory Usage',    value: '—',                                icon: Database,     color: 'text-brand-warning' },
    { label: 'CPU Load',        value: '—',                                icon: Cpu,          color: 'text-brand-accent' },
    { label: 'API Calls',       value: stats.apiCalls.toLocaleString(),    icon: Zap,          color: 'text-brand-success' },
    { label: 'Gemini Usage',    value: '—',                                icon: Webhook,      color: 'text-brand-primary' },
    { label: 'Supabase',        value: healthMatrix.find(h => h.name.toLowerCase().includes('supa'))?.status === 'online' ? 'Connected' : '—', icon: Server, color: 'text-brand-success' },
    { label: 'Plugins',         value: '8/8 Active',                       icon: Box,          color: 'text-brand-accent' },
    { label: 'FB Pages',        value: '—',                                icon: Globe,        color: 'text-brand-primary' },
    { label: 'WA Accounts',     value: '—',                                icon: MessageSquare, color: 'text-brand-success' },
  ], [stats, healthMatrix]);

  const sysMetrics = useMemo(() => [
    { label: 'School Systems', value: '—',                                    icon: Building2,      color: 'text-brand-primary' },
    { label: 'Church Systems', value: '—',                                    icon: BookOpen,       color: 'text-brand-accent' },
    { label: 'CRM Systems',    value: '—',                                    icon: Users,          color: 'text-brand-warning' },
    { label: 'ERP Systems',    value: '—',                                    icon: Briefcase,      color: 'text-brand-primary' },
    { label: 'Active Tasks',   value: '—',                                    icon: ListTodo,       color: 'text-brand-success' },
    { label: 'Bg Workers',     value: '—',                                    icon: Workflow,       color: 'text-brand-accent' },
    { label: 'Queue Size',     value: '—',                                    icon: LayoutDashboard, color: 'text-brand-warning' },
    { label: 'System Errors',  value: stats.guardianIssues.toString(),        icon: AlertCircle,    color: 'text-brand-danger' },
  ], [stats.guardianIssues]);

  // ── Health radials ────────────────────────────────────────────────────────

  const healthPercent = healthMatrix.length === 0 ? 0
    : (healthMatrix.filter(h => h.status === 'online' || h.status === 'ok').length / healthMatrix.length) * 100;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-20 md:pb-0"
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.div variants={item} className="mb-6 flex flex-col md:flex-row md:items-end justify-between border-b border-brand-border pb-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-brand-text flex items-center gap-3">
            <PulseDot />
            Command Dashboard
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">
            Enterprise AI Automation Platform — Mission Control
          </p>
        </div>
        <div className="flex items-center gap-3 mt-3 md:mt-0">
          <div className="flex items-center gap-2 text-[10px] font-mono text-brand-success bg-brand-success/10 border border-brand-success/20 px-3 py-1.5 rounded-lg">
            <PulseDot color="bg-brand-success" size="w-1.5 h-1.5" />
            SYSTEM NOMINAL
          </div>
          <div className="text-[10px] font-mono text-brand-text-muted bg-brand-surface border border-brand-border px-2 py-1.5 rounded-lg">
            {new Date().toLocaleTimeString([], { hour12: false })}
          </div>
        </div>
      </motion.div>

      {/* ── Top 10 metrics ─────────────────────────────────────────────── */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-5 xl:grid-cols-10 gap-2">
        {topMetrics.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            variants={item}
            className="bg-brand-surface border border-brand-border rounded-xl p-3 flex flex-col items-center text-center hover:border-brand-primary/30 transition-colors group"
          >
            <Icon className={cn('w-4 h-4 mb-2 group-hover:scale-110 transition-transform', color)} />
            <span className="text-[9px] text-brand-text-muted font-mono uppercase tracking-wider mb-1">{label}</span>
            <span className="text-xs font-bold text-brand-text">{value}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Revenue card + health radials + stats ──────────────────────── */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-brand-text-muted tracking-widest">
              <DollarSign className="w-3.5 h-3.5 text-brand-success" />
              Monthly Revenue
            </div>
            <TrendingUp className="w-4 h-4 text-brand-success" />
          </div>
          <div className="text-3xl font-bold font-mono text-brand-text mt-2">
            {stats.revenueMonthly > 0
              ? <span>$<AnimatedNumber value={stats.revenueMonthly} duration={1200} /></span>
              : <span className="text-brand-text-muted text-xl">—</span>
            }
          </div>
          <div className="text-[10px] font-mono text-brand-text-muted mt-1">
            {stats.revenueMonthly > 0 ? 'Monthly recurring revenue' : 'No revenue data yet'}
          </div>

          {/* Latency sparkline */}
          <div className="mt-4">
            <div className="text-[9px] font-mono text-brand-text-muted mb-1">API LATENCY</div>
            {latencySparkline.length > 0 ? (
              <ResponsiveContainer width="100%" height={48}>
                <AreaChart data={latencySparkline}>
                  <defs>
                    <linearGradient id="gRevLat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="ms" stroke="#4F46E5" fill="url(#gRevLat)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-12 flex items-center text-[10px] text-brand-text-muted font-mono">No data</div>
            )}
          </div>
        </div>

        {/* Health radials */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
          <div className="text-[10px] font-mono uppercase text-brand-text-muted tracking-widest mb-4 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-brand-primary" />
            System Health
          </div>
          <div className="flex items-center justify-around">
            <HealthRadial percent={healthPercent}           label="Services"  color="#10B981" />
            <HealthRadial percent={Math.min(stats.apiCalls / 10, 100)} label="API Load"  color="#4F46E5" />
            <HealthRadial
              percent={stats.guardianIssues > 0 ? Math.max(0, 100 - stats.guardianIssues * 10) : 100}
              label="Security"
              color={stats.guardianIssues > 0 ? '#EF4444' : '#10B981'}
            />
          </div>
        </div>

        {/* Key counters */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Messages Today', value: stats.messagesToday, color: 'text-brand-primary',  icon: MessageSquare },
            { label: 'Posts Published', value: stats.postsPublished, color: 'text-brand-success', icon: Globe },
            { label: 'Active Users',    value: stats.activeUsers,    color: 'text-brand-accent',  icon: Users },
            { label: 'Guardian Issues', value: stats.guardianIssues, color: 'text-brand-danger',  icon: ShieldAlert },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-brand-surface border border-brand-border rounded-xl p-4 flex flex-col">
              <Icon className={cn('w-4 h-4 mb-2', color)} />
              <div className={cn('text-2xl font-bold font-mono', color)}>
                <AnimatedNumber value={value} duration={900} />
              </div>
              <div className="text-[10px] font-mono text-brand-text-muted mt-1 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── 8-category system metrics ──────────────────────────────────── */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {sysMetrics.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-brand-surface border border-brand-border rounded-xl p-3 flex flex-col items-center text-center hover:border-brand-primary/20 transition-colors">
            <Icon className={cn('w-4 h-4 mb-2', color)} />
            <span className="text-[9px] text-brand-text-muted font-mono uppercase tracking-wider mb-1">{label}</span>
            <span className="text-sm font-bold font-mono text-brand-text">{value}</span>
          </div>
        ))}
      </motion.div>

      {/* ── System topology ─────────────────────────────────────────────── */}
      <motion.div variants={item}>
        <SystemTopology />
      </motion.div>

      {/* ── Charts + recent data ─────────────────────────────────────────── */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Platform distribution pie */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
          <div className="text-[10px] font-mono uppercase text-brand-text-muted tracking-widest mb-4 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-brand-primary" />
            Platform Distribution
          </div>
          {platformDist.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-brand-text-muted text-xs font-mono">
              No post data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={platformDist}
                  cx="50%" cy="50%"
                  innerRadius={40} outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {platformDist.map((entry, i) => (
                    <Cell key={i} fill={PLATFORM_COLORS[entry.name] ?? '#4F46E5'} />
                  ))}
                </Pie>
                <RechartsTooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {platformDist.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {platformDist.map(d => (
                <div key={d.name} className="flex items-center gap-1 text-[10px] font-mono text-brand-text-muted">
                  <span className="w-2 h-2 rounded-full" style={{ background: PLATFORM_COLORS[d.name] ?? '#4F46E5' }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent publications */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 flex flex-col">
          <div className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest mb-3 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-brand-primary" />
            Recent Publications
          </div>
          <div className="space-y-2 flex-1 overflow-y-auto">
            {recentPosts.length === 0 ? (
              <div className="text-[10px] font-mono text-brand-text-muted py-6 text-center">No posts yet</div>
            ) : (
              recentPosts.slice(0, 6).map(post => (
                <div key={post.id} className="flex justify-between items-center bg-brand-elevated border border-brand-border p-2 rounded-lg hover:border-brand-primary/30 transition-colors">
                  <div className="text-xs font-bold text-brand-text truncate pr-4">{post.title}</div>
                  <div
                    className="text-[9px] font-mono uppercase px-2 py-0.5 rounded border text-brand-text-muted border-brand-border shrink-0"
                    style={{ color: PLATFORM_COLORS[post.platform] }}
                  >
                    {post.platform}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active alerts + connected tenants */}
        <div className="flex flex-col gap-2">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 flex flex-col flex-1">
            <div className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest mb-3 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-brand-danger" />
              Active Alerts
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto">
              {guardianAlerts.length === 0 ? (
                <div className="text-[10px] font-mono text-brand-success py-2 tracking-widest flex items-center gap-2">
                  <PulseDot color="bg-brand-success" size="w-1.5 h-1.5" />
                  NO ACTIVE ALERTS
                </div>
              ) : (
                guardianAlerts.slice(0, 4).map(alert => (
                  <div key={alert.id} className="text-[10px] font-mono border-l-2 border-brand-danger pl-2 py-1 flex flex-col">
                    <span className="text-brand-danger font-bold uppercase tracking-widest">{alert.severity}</span>
                    <span className="text-brand-text-muted truncate mt-0.5">{alert.title}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-2xl flex overflow-hidden">
            <div className="flex-1 p-3 flex flex-col justify-center items-center hover:bg-brand-elevated transition-colors border-r border-brand-border">
              <div className="text-[9px] uppercase font-bold text-brand-text-muted tracking-widest mb-1">Tenants</div>
              <div className="text-2xl font-mono font-bold text-brand-text">—</div>
            </div>
            <div className="flex-1 p-3 flex flex-col justify-center items-center bg-brand-danger/5 hover:bg-brand-danger/10 transition-colors">
              <div className="text-[9px] uppercase font-bold text-brand-danger tracking-widest mb-1">Warnings</div>
              <div className="text-2xl font-mono font-bold text-brand-danger">
                <AnimatedNumber value={stats.guardianIssues} duration={600} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Quick Actions bar ─────────────────────────────────────────────── */}
      <motion.div variants={item} className="bg-brand-surface border border-brand-border rounded-2xl p-4">
        <div className="text-[10px] font-mono uppercase text-brand-text-muted tracking-widest mb-3">Quick Actions</div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Force Post Now',      icon: PlayCircle,   color: 'text-brand-success', href: '/scheduler' },
            { label: 'AI Engine',           icon: BrainCircuit, color: 'text-brand-primary', href: '/ai-brain' },
            { label: 'View Workflows',      icon: GitBranch,    color: 'text-brand-accent',  href: '/workflows' },
            { label: 'Guardian Scan',       icon: ShieldCheck,  color: 'text-brand-warning', href: '/guardian' },
            { label: 'Prometheus Metrics',  icon: Network,      color: 'text-brand-primary', href: '/prometheus' },
            { label: 'Refresh Platform',    icon: RefreshCw,    color: 'text-brand-text-muted', href: '#', onClick: connectSocket },
          ].map(({ label, icon: Icon, color, href, onClick }) => (
            <a
              key={label}
              href={href}
              onClick={onClick}
              className="flex items-center gap-2 bg-brand-elevated border border-brand-border hover:border-brand-primary/40 text-brand-text text-xs font-medium px-4 py-2 rounded-lg transition-all hover:bg-brand-primary/10 group"
            >
              <Icon className={cn('w-4 h-4 group-hover:scale-110 transition-transform', color)} />
              {label}
            </a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
