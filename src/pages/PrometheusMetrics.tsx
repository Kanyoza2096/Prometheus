import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Database, Server, RefreshCcw, Search, BarChart3, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

// Mock data generator for time-series metrics
const generateData = (points = 20) => {
  const data = [];
  let baseValue = 50;
  for (let i = 0; i < points; i++) {
    baseValue = baseValue + (Math.random() - 0.5) * 10;
    data.push({
      time: new Date(Date.now() - (points - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: Math.max(0, Math.min(100, baseValue)),
      cpu: Math.max(0, Math.min(100, baseValue * 0.8 + Math.random() * 20)),
      memory: Math.max(0, Math.min(100, baseValue * 0.6 + 30)),
    });
  }
  return data;
};

export default function PrometheusMetrics() {
  const [data, setData] = useState(generateData());
  const [activeTab, setActiveTab] = useState('system'); // system, app, database

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        newData.push({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: Math.max(0, Math.min(100, last.value + (Math.random() - 0.5) * 10)),
          cpu: Math.max(0, Math.min(100, last.cpu + (Math.random() - 0.5) * 15)),
          memory: Math.max(0, Math.min(100, last.memory + (Math.random() - 0.2) * 5)),
        });
        return newData;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto pb-24 md:pb-0"
    >
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-brand-primary" />
            Prometheus Metrics
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">GRAFANA-STYLE TELEMETRY EXPORTER</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="bg-brand-surface border border-brand-border rounded-lg p-1 flex">
            {['system', 'app', 'database'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors",
                  activeTab === tab 
                    ? "bg-brand-primary text-white" 
                    : "text-brand-text-muted hover:text-brand-text"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <button className="bg-brand-surface border border-brand-border text-brand-text-muted hover:text-brand-text px-3 py-2 rounded-lg transition-colors">
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'CPU Usage', value: '42.5%', icon: Activity, color: 'text-brand-primary' },
          { label: 'Memory (RAM)', value: '6.2 GB', icon: Server, color: 'text-brand-accent' },
          { label: 'DB Connections', value: '184', icon: Database, color: 'text-brand-success' },
          { label: 'Uptime', value: '99.99%', icon: Clock, color: 'text-brand-warning' },
        ].map((stat, i) => (
          <div key={i} className="bg-brand-surface rounded-xl p-4 border border-brand-border">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">{stat.label}</span>
              <stat.icon className={cn("w-4 h-4", stat.color)} />
            </div>
            <div className="text-2xl font-mono font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Chart 1 */}
        <div className="bg-brand-surface rounded-2xl border border-brand-border p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-brand-primary" />
            CPU & Memory Load
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickMargin={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#F8FAFC' }}
                  itemStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#4F46E5" fillOpacity={1} fill="url(#colorCpu)" name="CPU %" />
                <Area type="monotone" dataKey="memory" stroke="#06B6D4" fillOpacity={1} fill="url(#colorMem)" name="Memory %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="bg-brand-surface rounded-2xl border border-brand-border p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center">
            <Database className="w-4 h-4 mr-2 text-brand-success" />
            HTTP Request Rates (RPS)
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickMargin={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#F8FAFC' }}
                  itemStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
                />
                <Line type="stepAfter" dataKey="value" stroke="#10B981" strokeWidth={2} dot={false} name="Requests/sec" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PromQL Query Interface */}
      <div className="bg-brand-surface rounded-2xl border border-brand-border p-6 mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-brand-text">PromQL Explorer</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-brand-primary font-bold font-mono">{">"}</span>
            </div>
            <input 
              type="text" 
              className="w-full bg-brand-bg border border-brand-border rounded-lg pl-8 pr-4 py-3 font-mono text-sm text-brand-text focus:outline-none focus:border-brand-primary transition-colors"
              placeholder="rate(http_requests_total{status=~'5..'}[5m])"
              defaultValue="sum(rate(http_requests_total{job='kanyoza-api'}[5m])) by (method)"
            />
          </div>
          <button className="bg-brand-primary text-white px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-colors shadow-glow-primary">
            Execute Query
          </button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-brand-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-mono">
              <thead>
                <tr className="text-brand-text-muted border-b border-brand-border">
                  <th className="pb-2 font-normal">Metric</th>
                  <th className="pb-2 font-normal">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-brand-border/50 hover:bg-brand-bg/50 transition-colors">
                  <td className="py-2 text-brand-success">{`{method="GET"}`}</td>
                  <td className="py-2">142.5</td>
                </tr>
                <tr className="border-b border-brand-border/50 hover:bg-brand-bg/50 transition-colors">
                  <td className="py-2 text-brand-success">{`{method="POST"}`}</td>
                  <td className="py-2">24.1</td>
                </tr>
                <tr className="hover:bg-brand-bg/50 transition-colors">
                  <td className="py-2 text-brand-success">{`{method="OPTIONS"}`}</td>
                  <td className="py-2">8.3</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
