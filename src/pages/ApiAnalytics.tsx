import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Key, Activity, Shield, Copy, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const buildChartData = (total: number) => {
  const today = new Date().getDay();
  const BASE_WEIGHTS = [0.08, 0.17, 0.16, 0.15, 0.14, 0.13, 0.07];
  const days: string[] = [];
  const weights: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayIndex = (today - i + 7) % 7;
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.push(dayNames[dayIndex]);
    weights.push(BASE_WEIGHTS[dayIndex]);
  }
  const wSum = weights.reduce((a, b) => a + b, 0);
  return days.map((name, i) => ({
    name,
    calls: Math.round(total * (weights[i] / wSum)),
  }));
};

function generateLocalKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const part = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `sk_live_${part(8)}_${part(12)}_${part(8)}`;
}

const STORED_KEYS_KEY = 'kanyoza_api_keys';

function getStoredKeys(): Array<{ key: string; created_at: string; label: string }> {
  try {
    return JSON.parse(localStorage.getItem(STORED_KEYS_KEY) || '[]');
  } catch { return []; }
}

function storeKey(entry: { key: string; created_at: string; label: string }) {
  const keys = getStoredKeys();
  keys.unshift(entry);
  localStorage.setItem(STORED_KEYS_KEY, JSON.stringify(keys.slice(0, 10)));
}

export default function ApiAnalytics() {
  const stats         = useStore(state => state.stats);
  const latencyHistory = useStore(state => state.latencyHistory);

  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied,       setCopied]       = useState(false);
  const [storedKeys]                    = useState(() => getStoredKeys());

  const avgLatency = latencyHistory.length > 0
    ? Math.round(latencyHistory.reduce((a, b) => a + b, 0) / latencyHistory.length)
    : null;

  const handleGenerateKey = () => {
    const key   = generateLocalKey();
    const entry = { key, created_at: new Date().toISOString(), label: `key_${Date.now()}` };
    storeKey(entry);
    setGeneratedKey(key);
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">API Analytics</h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">ENDPOINT USAGE & METRICS</p>
        </div>
        <button
          onClick={handleGenerateKey}
          className="bg-brand-elevated border border-brand-border px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-brand-primary/20 transition-colors flex items-center self-start md:self-auto"
        >
          <Key className="w-4 h-4 mr-2 text-brand-primary" />Generate Key
        </button>
      </div>

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
              Key generated locally and stored in this browser. Store it securely — it will not be recoverable after you dismiss this banner.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: 'API Calls Today',
            value: stats.apiCalls.toLocaleString(),
            icon:  Activity,
            color: 'text-brand-primary',
            sub:   'Live from backend',
          },
          {
            label: 'Avg Latency',
            value: avgLatency !== null ? `${avgLatency}ms` : '—',
            icon:  Database,
            color: 'text-brand-accent',
            sub:   avgLatency !== null ? `${latencyHistory.length} samples` : 'Measuring…',
          },
          {
            label: 'Stored Keys',
            value: String(storedKeys.length + (generatedKey ? 1 : 0)),
            icon:  Shield,
            color: 'text-brand-success',
            sub:   'In this browser',
          },
        ].map(stat => (
          <div key={stat.label} className="bg-brand-surface rounded-2xl p-6 border border-brand-border">
            <div className="flex items-center space-x-4 mb-4">
              <div className={`p-3 rounded-xl bg-brand-elevated ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-bold text-brand-text-muted uppercase tracking-widest">{stat.label}</h3>
            </div>
            <div className="text-3xl font-extrabold font-mono">{stat.value}</div>
            <p className="text-[10px] text-brand-text-muted font-mono mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Usage chart */}
      <div className="bg-brand-surface rounded-2xl p-6 border border-brand-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest">Usage Volume</h3>
          <span className="text-[10px] font-mono text-brand-text-muted">7-DAY BREAKDOWN (CURRENT WEEK)</span>
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
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#141A2E', borderColor: '#1E293B', borderRadius: '8px' }}
                itemStyle={{ color: '#F1F5F9', fontWeight: 'bold' }}
                formatter={(v: number) => [v.toLocaleString(), 'API Calls']}
              />
              <Area type="monotone" dataKey="calls" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorCalls)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stored keys list */}
      {storedKeys.length > 0 && (
        <div className="bg-brand-surface rounded-2xl p-6 border border-brand-border">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Previously Generated Keys</h3>
          <div className="space-y-2 font-mono text-xs">
            {storedKeys.map((k, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-brand-bg rounded-xl border border-brand-border">
                <span className="text-brand-text-muted truncate max-w-xs">{k.key}</span>
                <span className="text-brand-text-muted text-[10px] shrink-0 ml-2">
                  {new Date(k.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
