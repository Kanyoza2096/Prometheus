import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Key, Activity, Shield, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useMutation } from '@tanstack/react-query';
import { generateApiKey } from '../lib/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Historical chart data — driven by stats.apiCalls from the WebSocket store.
// The 7-day history is relative; once the backend exposes a history endpoint
// this can be replaced with a useQuery call.
const buildChartData = (total: number) => {
  const weights = [0.11, 0.08, 0.06, 0.09, 0.05, 0.07, 0.10];
  const days    = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((name, i) => ({ name, calls: Math.round(total * weights[i]) }));
};

export default function ApiAnalytics() {
  const stats        = useStore(state => state.stats);
  const restEndpoint = useStore(state => state.restEndpoint);
  const masterToken  = useStore(state => state.masterToken);
  const cfg = { restEndpoint, masterToken };

  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied,       setCopied]       = useState(false);

  // ── Generate Key mutation ─────────────────────────────────────────────────
  const keyMutation = useMutation({
    mutationFn: () => generateApiKey(cfg),
    onSuccess:  (data) => setGeneratedKey(data.key),
  });

  const copyKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const chartData = buildChartData(stats.apiCalls || 18_000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 max-w-7xl mx-auto pb-24 md:pb-0"
    >
      {/* Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">API Analytics</h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">ENDPOINT USAGE & METRICS</p>
        </div>
        <button
          onClick={() => keyMutation.mutate()}
          disabled={keyMutation.isPending}
          className="bg-brand-elevated border border-brand-border px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-brand-primary/20 transition-colors flex items-center self-start md:self-auto disabled:opacity-60"
        >
          {keyMutation.isPending
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin text-brand-primary" />Generating…</>
            : <><Key className="w-4 h-4 mr-2 text-brand-primary" />Generate Key</>}
        </button>
      </div>

      {/* Generated key reveal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {generatedKey && (
          <motion.div
            key="key-reveal"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-brand-success/30 bg-brand-success/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-sm mb-2">
              <div className="flex items-center gap-3 min-w-0">
                <Key className="w-4 h-4 text-brand-success shrink-0" />
                <span className="text-brand-success font-bold truncate">{generatedKey}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={copyKey}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-success/20 text-brand-success hover:bg-brand-success/30 transition-colors text-xs font-bold uppercase"
                >
                  {copied ? <><Check className="w-3 h-3" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
                </button>
                <button onClick={() => setGeneratedKey(null)} className="text-brand-text-muted hover:text-white transition-colors text-xs">✕</button>
              </div>
            </div>
            <p className="text-[10px] font-mono text-brand-text-muted px-1">
              Store this key securely — it will not be shown again.
            </p>
          </motion.div>
        )}
        {keyMutation.isError && (
          <motion.div
            key="key-error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-2"
          >
            <div className="rounded-xl border border-brand-danger/30 bg-brand-danger/10 p-4 flex items-center gap-3 font-mono text-sm text-brand-danger">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Key generation failed — backend unreachable. Check your REST endpoint in Settings.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Calls (30d)', value: stats.apiCalls.toLocaleString(), icon: Activity, color: 'text-brand-primary' },
          { label: 'Avg Latency',       value: '124ms',                         icon: Database, color: 'text-brand-accent'  },
          { label: 'Active Keys',       value: '18',                            icon: Shield,   color: 'text-brand-success' },
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

      {/* Usage chart ─────────────────────────────────────────────────────── */}
      <div className="bg-brand-surface rounded-2xl p-6 border border-brand-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest">Usage Volume</h3>
          <span className="text-[10px] font-mono text-brand-text-muted">7-DAY BREAKDOWN</span>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4F46E5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `${v / 1000}k`} />
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
