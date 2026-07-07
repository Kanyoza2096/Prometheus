import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Users, Eye, Heart, MessageSquare, Clock, DollarSign } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const engagementData = [
  { name: 'Mon', engagement: 4000, reach: 2400 },
  { name: 'Tue', engagement: 3000, reach: 1398 },
  { name: 'Wed', engagement: 2000, reach: 9800 },
  { name: 'Thu', engagement: 2780, reach: 3908 },
  { name: 'Fri', engagement: 1890, reach: 4800 },
  { name: 'Sat', engagement: 2390, reach: 3800 },
  { name: 'Sun', engagement: 3490, reach: 4300 },
];

const growthData = [
  { name: 'Jan', followers: 4000 },
  { name: 'Feb', followers: 3000 },
  { name: 'Mar', followers: 5000 },
  { name: 'Apr', followers: 2780 },
  { name: 'May', followers: 1890 },
  { name: 'Jun', followers: 2390 },
  { name: 'Jul', followers: 3490 },
];

const postsPerformance = [
  { name: 'Post 1', likes: 400, comments: 240, shares: 100 },
  { name: 'Post 2', likes: 300, comments: 139, shares: 80 },
  { name: 'Post 3', likes: 200, comments: 980, shares: 50 },
  { name: 'Post 4', likes: 278, comments: 390, shares: 120 },
  { name: 'Post 5', likes: 189, comments: 480, shares: 90 },
];

const aiMetrics = [
  { name: 'Accuracy', value: 94.5, color: '#10B981' },
  { name: 'Cost', value: '$245.50', color: '#4F46E5' },
  { name: 'Tokens', value: '1.2M', color: '#F59E0B' },
  { name: 'Requests', value: '12,450', color: '#8B5CF6' },
  { name: 'Errors', value: 23, color: '#EF4444' },
  { name: 'Performance', value: '234ms', color: '#06B6D4' },
];

const timeframes = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Analytics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('Weekly');

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
        className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-brand-primary" />
            Analytics
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">PERFORMANCE METRICS & INSIGHTS</p>
        </div>
        <div className="flex gap-2">
          {timeframes.map((tf, idx) => (
            <motion.button
              key={tf}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTimeframe(tf)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-bold transition-colors',
                selectedTimeframe === tf
                  ? 'bg-brand-primary text-white shadow-glow-primary'
                  : 'bg-brand-surface border border-brand-border text-brand-text hover:bg-brand-elevated'
              )}
            >
              {tf}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* AI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {aiMetrics.map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + idx * 0.06 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-brand-surface border border-brand-border rounded-2xl p-4 hover:border-brand-primary/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: metric.color + '20' }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: metric.color }}
                />
              </motion.div>
              <TrendingUp className="w-4 h-4 text-brand-success" />
            </div>
            <p className="text-xs text-brand-text-muted font-mono mb-1">{metric.name}</p>
            <p className="text-lg font-bold text-brand-text">{metric.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-4">Engagement & Reach</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData}>
                <defs>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="engagement" stroke="#4F46E5" fillOpacity={1} fill="url(#colorEngagement)" />
                <Area type="monotone" dataKey="reach" stroke="#10B981" fillOpacity={1} fill="url(#colorReach)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-4">Follower Growth</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Line type="monotone" dataKey="followers" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-6 lg:col-span-2"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-4">Posts Performance</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={postsPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="likes" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="comments" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="shares" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Best & Worst Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-4 flex items-center">
            <Heart className="w-4 h-4 mr-2 text-brand-success" />
            Best Performing Posts
          </h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i, idx) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.75 + idx * 0.08 }}
                whileHover={{ x: 4, scale: 1.01 }}
                className="flex items-center gap-4 p-3 bg-brand-elevated rounded-xl border border-brand-border hover:border-brand-primary/30 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-success/20 flex items-center justify-center">
                  <span className="text-brand-success font-bold">{i}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-brand-text">Post Title {i}</p>
                  <p className="text-xs text-brand-text-muted font-mono">1,234 likes • 456 comments</p>
                </div>
                <TrendingUp className="w-5 h-5 text-brand-success" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.75 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-4 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-brand-warning" />
            Best Time to Post
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {['9 AM', '12 PM', '3 PM', '6 PM', '9 PM'].map((time, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + idx * 0.06 }}
                whileHover={{ scale: 1.05 }}
                className="p-3 bg-brand-elevated rounded-xl border border-brand-border text-center hover:border-brand-primary/30 transition-all cursor-pointer"
              >
                <p className="text-sm font-bold text-brand-text">{time}</p>
                <p className="text-[10px] text-brand-text-muted font-mono">Highest engagement</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}