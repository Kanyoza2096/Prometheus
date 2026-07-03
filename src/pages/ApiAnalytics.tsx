import React from 'react';
import { motion } from 'motion/react';
import { Database, Key, Activity, Shield } from 'lucide-react';
import { useStore } from '../store/useStore';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
  { name: 'Mon', calls: 4000 },
  { name: 'Tue', calls: 3000 },
  { name: 'Wed', calls: 2000 },
  { name: 'Thu', calls: 2780 },
  { name: 'Fri', calls: 1890 },
  { name: 'Sat', calls: 2390 },
  { name: 'Sun', calls: 3490 },
];

export default function ApiAnalytics() {
  const { stats } = useStore();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 max-w-7xl mx-auto pb-24 md:pb-0"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">API Analytics</h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">ENDPOINT USAGE & METRICS</p>
        </div>
        <button className="bg-brand-elevated border border-brand-border px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-brand-primary/20 transition-colors flex items-center self-start md:self-auto">
          <Key className="w-4 h-4 mr-2 text-brand-primary" /> Generate Key
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Calls (30d)', value: stats.apiCalls.toLocaleString(), icon: Activity, color: 'text-brand-primary' },
          { label: 'Avg Latency', value: '124ms', icon: Database, color: 'text-brand-accent' },
          { label: 'Active Keys', value: '18', icon: Shield, color: 'text-brand-success' },
        ].map(stat => (
          <div key={stat.label} className="bg-brand-surface rounded-2xl p-6 border border-brand-border">
            <div className="flex items-center space-x-4 mb-4">
              <div className={`p-3 rounded-xl bg-brand-elevated ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-bold text-brand-text-muted uppercase tracking-widest">{stat.label}</h3>
            </div>
            <div className="text-3xl font-extrabold font-mono">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-brand-surface rounded-2xl p-6 border border-brand-border">
        <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Usage Volume</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#141A2E', borderColor: '#1E293B', borderRadius: '8px' }}
                itemStyle={{ color: '#F1F5F9', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="calls" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorCalls)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
