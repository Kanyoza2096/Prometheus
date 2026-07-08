import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, TrendingUp, Users, MessageSquare, Activity, 
  DollarSign, Bot, Globe, ThumbsUp, Calendar, ArrowUpRight, ArrowDownRight, ChevronDown
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { cn } from '../lib/utils';

// MOCK DATA

const engagementData = Array.from({ length: 30 }, (_, i) => ({
  date: `Day ${i + 1}`,
  reach: Math.floor(Math.random() * 50000) + 20000,
  likes: Math.floor(Math.random() * 5000) + 1000,
  comments: Math.floor(Math.random() * 1000) + 200,
}));

const postPerformanceData = Array.from({ length: 14 }, (_, i) => ({
  date: `Day ${i + 1}`,
  published: Math.floor(Math.random() * 8) + 1,
  engagement: Math.floor(Math.random() * 15000) + 5000,
}));

const platformData = [
  { name: 'Facebook', value: 45, color: '#1877F2' },
  { name: 'Twitter', value: 28, color: '#1DA1F2' },
  { name: 'LinkedIn', value: 18, color: '#0A66C2' },
  { name: 'Instagram', value: 9, color: '#E4405F' },
];

const bestPosts = [
  { id: 1, title: 'Q3 Enterprise Product Launch Announcem...', platform: 'Facebook', engagement: '14.2k', trend: 'up' },
  { id: 2, title: 'How AI changes workflow automation for b...', platform: 'LinkedIn', engagement: '12.8k', trend: 'up' },
  { id: 3, title: '5 tips to scale your backend architectur...', platform: 'Twitter', engagement: '9.4k', trend: 'up' },
  { id: 4, title: 'Customer spotlight: Acme Corp scaling to...', platform: 'LinkedIn', engagement: '8.1k', trend: 'up' },
  { id: 5, title: 'Join our upcoming webinar on security pr...', platform: 'Facebook', engagement: '7.6k', trend: 'down' },
];

const worstPosts = [
  { id: 6, title: 'System maintenance scheduled for Friday.', platform: 'Twitter', engagement: '234', trend: 'down' },
  { id: 7, title: 'Update on terms of service changes in 20...', platform: 'Facebook', engagement: '312', trend: 'down' },
  { id: 8, title: 'Happy holidays from our engineering team', platform: 'Instagram', engagement: '458', trend: 'down' },
  { id: 9, title: 'Quick poll: Tabs or spaces? Let us know!', platform: 'Twitter', engagement: '512', trend: 'up' },
  { id: 10, title: 'We are hiring! Open positions in marketing', platform: 'LinkedIn', engagement: '645', trend: 'down' },
];

const tokenUsageData = Array.from({ length: 14 }, (_, i) => ({
  date: `D${i + 1}`,
  tokens: Math.floor(Math.random() * 500000) + 100000,
}));

const fullPosts = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString(),
  platform: ['Facebook', 'Twitter', 'LinkedIn', 'Instagram'][Math.floor(Math.random() * 4)],
  title: `Sample Social Media Post Content for Campaign ${i + 1}`,
  reach: Math.floor(Math.random() * 50000) + 1000,
  likes: Math.floor(Math.random() * 5000) + 100,
  comments: Math.floor(Math.random() * 1000) + 10,
  shares: Math.floor(Math.random() * 500) + 5,
  rate: (Math.random() * 10 + 1).toFixed(1) + '%',
  ai: Math.random() > 0.3,
}));

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = Array.from({ length: 24 }, (_, i) => i);
const heatmapData = days.map(day => ({
  day,
  hours: hours.map(hour => Math.random()) // 0 to 1 intensity
}));

const kpis = [
  { label: 'Total Reach', value: '2.4M', trend: '+12.5%', isUp: true, icon: Globe, color: 'text-brand-primary' },
  { label: 'Engagement Rate', value: '4.8%', trend: '+1.2%', isUp: true, icon: Activity, color: 'text-brand-accent' },
  { label: 'New Followers', value: '1,247', trend: '-2.4%', isUp: false, icon: Users, color: 'text-brand-warning' },
  { label: 'AI Conversations', value: '8,432', trend: '+45.1%', isUp: true, icon: Bot, color: 'text-brand-success' },
  { label: 'API Requests', value: '1.04M', trend: '+8.4%', isUp: true, icon: Activity, color: 'text-brand-primary' },
  { label: 'Revenue', value: 'MWK 45,250', trend: '+15.2%', isUp: true, icon: DollarSign, color: 'text-brand-success' },
];

const timeRanges = ['Last 7 Days', '30 Days', '90 Days', '1 Year', 'Custom'];

// HELPERS
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-surface border border-brand-border p-3 rounded-xl shadow-xl z-50">
        <p className="text-xs text-brand-text-muted mb-2 font-mono">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm font-bold mt-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-brand-text capitalize">{entry.name}:</span>
            <span style={{ color: entry.color }}>{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30 Days');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20 md:pb-0"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-2">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-brand-primary" />
            Analytics
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">
            PERFORMANCE METRICS & DEEP INSIGHTS
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-wrap items-center gap-2 bg-brand-surface p-1.5 rounded-xl border border-brand-border"
        >
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap",
                dateRange === range 
                  ? "bg-brand-primary text-white shadow-glow-primary" 
                  : "text-brand-text-muted hover:text-brand-text hover:bg-brand-elevated"
              )}
            >
              {range}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Row 1: KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + (idx * 0.05) }}
            className="bg-brand-surface border border-brand-border rounded-2xl p-4 flex flex-col justify-between group hover:border-brand-primary/30 transition-all relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-brand-bg rounded-lg">
                <kpi.icon className={cn("w-4 h-4", kpi.color)} />
              </div>
              <div className={cn(
                "flex items-center text-[10px] font-mono px-2 py-0.5 rounded-full",
                kpi.isUp ? "bg-brand-success/10 text-brand-success" : "bg-brand-danger/10 text-brand-danger"
              )}>
                {kpi.isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                {kpi.trend}
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-brand-text tracking-tight">{kpi.value}</p>
              <p className="text-xs text-brand-text-muted font-mono uppercase truncate mt-0.5">{kpi.label}</p>
            </div>
            
            {/* Abstract background decorative shape */}
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-brand-bg/50 group-hover:scale-150 transition-transform duration-500 z-0" />
          </motion.div>
        ))}
      </div>

      {/* Row 2: Large Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text">Engagement Over Time</h2>
              <p className="text-xs text-brand-text-muted font-mono mt-1">REACH, LIKES & COMMENTS</p>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} minTickGap={30} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="reach" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorReach)" />
                <Area type="monotone" dataKey="likes" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorLikes)" />
                <Area type="monotone" dataKey="comments" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorComments)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Posts Performance Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text">Posts Performance</h2>
              <p className="text-xs text-brand-text-muted font-mono mt-1">DAILY PUBLISHED VS ENGAGEMENT</p>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={postPerformanceData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} minTickGap={15} />
                <YAxis yAxisId="left" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar yAxisId="left" dataKey="published" fill="#06B6D4" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3, fill: '#F59E0B' }} activeDot={{ r: 5 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Row 3: Platform & Top/Worst Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-5 flex flex-col"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-1">Platform Distribution</h2>
          <p className="text-xs text-brand-text-muted font-mono mb-4">TRAFFIC SOURCES</p>
          <div className="flex-1 min-h-[220px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Share']}
                  contentStyle={{ backgroundColor: '#141A2E', borderColor: '#1E293B', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-brand-text">100%</span>
              <span className="text-[10px] text-brand-text-muted font-mono">TOTAL SHARE</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {platformData.map(platform => (
              <div key={platform.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: platform.color }} />
                <span className="text-xs text-brand-text">{platform.name}</span>
                <span className="text-xs font-mono font-bold ml-auto">{platform.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Best Performing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text">Best Performing</h2>
              <p className="text-xs text-brand-text-muted font-mono mt-1">TOP 5 RECENT POSTS</p>
            </div>
            <div className="p-1.5 bg-brand-success/10 rounded-lg text-brand-success">
              <ThumbsUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-3">
            {bestPosts.map((post) => (
              <div key={post.id} className="flex items-start gap-3 p-3 bg-brand-bg rounded-xl border border-brand-border">
                <div className="w-8 h-8 rounded bg-brand-elevated flex items-center justify-center flex-shrink-0 text-brand-text font-bold text-xs">
                  #{post.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-brand-text font-medium truncate">{post.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-mono text-brand-text-muted">{post.platform}</span>
                    <span className="w-1 h-1 rounded-full bg-brand-border" />
                    <span className="text-xs font-bold text-brand-success">{post.engagement}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Worst Performing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text">Needs Improvement</h2>
              <p className="text-xs text-brand-text-muted font-mono mt-1">BOTTOM 5 RECENT POSTS</p>
            </div>
            <div className="p-1.5 bg-brand-danger/10 rounded-lg text-brand-danger">
              <TrendingUp className="w-4 h-4 rotate-180" />
            </div>
          </div>
          <div className="space-y-3">
            {worstPosts.map((post) => (
              <div key={post.id} className="flex items-start gap-3 p-3 bg-brand-bg rounded-xl border border-brand-border">
                <div className="w-8 h-8 rounded bg-brand-elevated flex items-center justify-center flex-shrink-0 text-brand-text font-bold text-xs">
                  #{post.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-brand-text font-medium truncate">{post.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-mono text-brand-text-muted">{post.platform}</span>
                    <span className="w-1 h-1 rounded-full bg-brand-border" />
                    <span className="text-xs font-bold text-brand-danger">{post.engagement}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 4: Heatmap & AI Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-5 overflow-x-auto"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text">Best Posting Times</h2>
              <p className="text-xs text-brand-text-muted font-mono mt-1">ENGAGEMENT INTENSITY BY HOUR</p>
            </div>
            <Calendar className="w-5 h-5 text-brand-text-muted" />
          </div>
          <div className="min-w-[600px]">
            <div className="flex mb-2">
              <div className="w-10"></div>
              {hours.filter(h => h % 2 === 0).map(h => (
                <div key={h} className="flex-1 text-center text-[10px] font-mono text-brand-text-muted">
                  {h}:00
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {heatmapData.map((row) => (
                <div key={row.day} className="flex items-center h-8 gap-1">
                  <div className="w-10 text-[10px] font-mono font-bold text-brand-text-muted">{row.day}</div>
                  <div className="flex-1 flex gap-1 h-full">
                    {row.hours.map((intensity, idx) => (
                      <div 
                        key={idx}
                        className="flex-1 rounded-sm transition-all hover:ring-2 ring-brand-text ring-offset-1 ring-offset-brand-surface cursor-pointer"
                        style={{ 
                          backgroundColor: '#4F46E5', 
                          opacity: Math.max(0.1, intensity)
                        }}
                        title={`${row.day} ${idx}:00 - Intensity: ${Math.round(intensity * 100)}%`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* AI Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text">AI Performance & Cost</h2>
              <p className="text-xs text-brand-text-muted font-mono mt-1">TOKEN USAGE OVER 14 DAYS</p>
            </div>
            <Bot className="w-5 h-5 text-brand-primary" />
          </div>
          
          <div className="h-[140px] w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tokenUsageData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="tokens" stroke="#06B6D4" strokeWidth={2} fill="url(#colorTokens)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-auto">
            <div className="bg-brand-bg rounded-xl p-3 border border-brand-border">
              <span className="block text-[10px] uppercase font-mono text-brand-text-muted mb-1">GPT-4 Tokens</span>
              <span className="block text-lg font-bold text-brand-text">3.2M</span>
              <span className="block text-xs text-brand-danger font-mono mt-0.5">$96.00</span>
            </div>
            <div className="bg-brand-bg rounded-xl p-3 border border-brand-border">
              <span className="block text-[10px] uppercase font-mono text-brand-text-muted mb-1">GPT-3.5 Tokens</span>
              <span className="block text-lg font-bold text-brand-text">12.5M</span>
              <span className="block text-xs text-brand-warning font-mono mt-0.5">$25.00</span>
            </div>
            <div className="bg-brand-bg rounded-xl p-3 border border-brand-border">
              <span className="block text-[10px] uppercase font-mono text-brand-text-muted mb-1">Total Cost</span>
              <span className="block text-lg font-bold text-brand-text">$121.00</span>
              <span className="block text-xs text-brand-success font-mono mt-0.5">Budget: $500</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row 5: Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
        className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-brand-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text">Detailed Post Analytics</h2>
            <p className="text-xs text-brand-text-muted font-mono mt-1">ALL PUBLISHED CONTENT</p>
          </div>
          <button className="text-xs font-bold text-brand-primary hover:text-brand-primary/80 transition-colors flex items-center gap-1">
            Export CSV
            <ArrowDownRight className="w-3 h-3" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-brand-bg/50 text-[10px] uppercase tracking-wider font-mono text-brand-text-muted border-b border-brand-border">
                <th className="p-4 font-normal">Date</th>
                <th className="p-4 font-normal">Platform</th>
                <th className="p-4 font-normal">Post Title</th>
                <th className="p-4 font-normal text-right">Reach</th>
                <th className="p-4 font-normal text-right">Likes</th>
                <th className="p-4 font-normal text-right">Comments</th>
                <th className="p-4 font-normal text-right">Shares</th>
                <th className="p-4 font-normal text-right">Eng. Rate</th>
                <th className="p-4 font-normal text-center">AI generated</th>
              </tr>
            </thead>
            <tbody className="text-sm text-brand-text">
              {fullPosts.map((post, idx) => (
                <tr 
                  key={post.id} 
                  className={cn(
                    "border-b border-brand-border/50 hover:bg-brand-bg transition-colors",
                    idx === fullPosts.length - 1 ? 'border-b-0' : ''
                  )}
                >
                  <td className="p-4 font-mono text-brand-text-muted text-xs whitespace-nowrap">{post.date}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-brand-elevated text-xs font-bold text-brand-text">
                      {post.platform}
                    </span>
                  </td>
                  <td className="p-4 font-medium truncate max-w-[200px]" title={post.title}>
                    {post.title}
                  </td>
                  <td className="p-4 text-right font-mono">{post.reach.toLocaleString()}</td>
                  <td className="p-4 text-right font-mono text-brand-accent">{post.likes.toLocaleString()}</td>
                  <td className="p-4 text-right font-mono text-brand-success">{post.comments.toLocaleString()}</td>
                  <td className="p-4 text-right font-mono">{post.shares.toLocaleString()}</td>
                  <td className="p-4 text-right font-mono font-bold text-brand-text">{post.rate}</td>
                  <td className="p-4 text-center">
                    {post.ai ? (
                      <span className="inline-flex items-center justify-center p-1 rounded bg-brand-primary/20 text-brand-primary" title="AI Generated">
                        <Bot className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-brand-text-muted">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-brand-bg border-t border-brand-border flex items-center justify-between text-xs text-brand-text-muted">
          <span>Showing 15 of 248 posts</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded bg-brand-surface border border-brand-border hover:bg-brand-elevated transition-colors disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1.5 rounded bg-brand-surface border border-brand-border hover:bg-brand-elevated transition-colors">Next</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
