import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BrainCircuit,
  Cpu,
  Database,
  BookOpen,
  GitBranch,
  TrendingUp,
  Zap,
  Shield,
  Terminal,
  Layers,
  Clock,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const tokenData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  tokens: Math.floor(Math.random() * 10000) + 2000,
  cost: Math.floor(Math.random() * 100) + 10,
}));

const latencyData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  latency: Math.floor(Math.random() * 500) + 100,
}));

const models = [
  { name: 'gemini-2.5-flash', active: true, status: 'online' },
  { name: 'gemini-1.5-pro', active: true, status: 'online' },
  { name: 'gemini-2.0-flash-exp', active: false, status: 'standby' },
];

const engines = [
  { name: 'Reasoning Engine', status: 'active', color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
  { name: 'Planning Engine', status: 'active', color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
  { name: 'Content Engine', status: 'active', color: 'text-brand-success', bg: 'bg-brand-success/10' },
  { name: 'Decision Engine', status: 'active', color: 'text-brand-warning', bg: 'bg-brand-warning/10' },
  { name: 'Learning Engine', status: 'active', color: 'text-brand-danger', bg: 'bg-brand-danger/10' },
];

const knowledgeSources = [
  { name: 'Internal Docs', items: 1240, size: '2.4 GB' },
  { name: 'Website Content', items: 850, size: '1.2 GB' },
  { name: 'User Data', items: 5600, size: '5.8 GB' },
  { name: 'External APIs', items: 300, size: '0.5 GB' },
];

const plugins = [
  { name: 'Web Search', version: '2.1.0', active: true },
  { name: 'Code Interpreter', version: '1.5.3', active: true },
  { name: 'Image Generation', version: '3.0.0', active: false },
  { name: 'PDF Analysis', version: '1.2.0', active: true },
];

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AIBrain() {
  const statCards = [
    {
      icon: Terminal,
      iconColor: 'text-brand-primary',
      iconBg: 'bg-brand-primary/10',
      label: 'Active Models',
      value: '2',
      status: '● ONLINE',
      statusColor: 'text-brand-success'
    },
    {
      icon: Clock,
      iconColor: 'text-brand-accent',
      iconBg: 'bg-brand-accent/10',
      label: 'Avg Latency',
      value: '234ms',
    },
    {
      icon: DollarSign,
      iconColor: 'text-brand-success',
      iconBg: 'bg-brand-success/10',
      label: "Today's Cost",
      value: '$24.50',
    },
    {
      icon: TrendingUp,
      iconColor: 'text-brand-warning',
      iconBg: 'bg-brand-warning/10',
      label: 'Total Tokens',
      value: '1.2M',
    }
  ];

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
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
          <BrainCircuit className="w-8 h-8 mr-3 text-brand-primary" />
          AI Brain
        </h1>
        <p className="text-brand-text-muted text-sm font-mono mt-1">AI CORE SYSTEM STATUS & ANALYTICS</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + idx * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-brand-surface border border-brand-border rounded-2xl p-6 hover:border-brand-primary/30 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              {card.status && (
                <span className={`text-[10px] font-mono ${card.statusColor}`}>{card.status}</span>
              )}
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-text-muted mb-2">{card.label}</h3>
            <p className="text-3xl font-bold text-brand-text">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-6 text-brand-text">
            <Cpu className="w-4 h-4 mr-2 text-brand-primary" />
            Model Registry
          </h2>
          <div className="space-y-4">
            {models.map((model, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className="p-4 rounded-xl bg-brand-elevated border border-brand-border hover:border-brand-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      model.active ? 'bg-brand-success animate-pulse' : 'bg-brand-text-muted'
                    )} />
                    <div>
                      <h3 className="text-sm font-bold text-brand-text">{model.name}</h3>
                      <p className="text-xs font-mono text-brand-text-muted">Status: {model.status}</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-brand-primary hover:text-brand-primary/80 transition-colors">
                    View Logs
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-6 text-brand-text">
            <Layers className="w-4 h-4 mr-2 text-brand-accent" />
            AI Engines
          </h2>
          <div className="space-y-3">
            {engines.map((engine, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className="p-3 rounded-xl bg-brand-elevated border border-brand-border flex items-center justify-between hover:border-brand-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', engine.bg)}>
                    <Sparkles className={cn('w-4 h-4', engine.color)} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-brand-text">{engine.name}</h3>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-brand-success">{engine.status}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-6 text-brand-text">
            <Database className="w-4 h-4 mr-2 text-brand-primary" />
            Token Usage (24h)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tokenData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Line type="monotone" dataKey="tokens" stroke="#4F46E5" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="cost" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-6 text-brand-text">
            <Clock className="w-4 h-4 mr-2 text-brand-accent" />
            Latency (24h)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Line type="monotone" dataKey="latency" stroke="#8B5CF6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-6 text-brand-text">
            <BookOpen className="w-4 h-4 mr-2 text-brand-primary" />
            Knowledge Sources
          </h2>
          <div className="space-y-3">
            {knowledgeSources.map((source, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.75 + idx * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="p-3 rounded-xl bg-brand-elevated border border-brand-border hover:border-brand-primary/30 transition-all cursor-pointer"
              >
                <h3 className="text-sm font-bold text-brand-text mb-1">{source.name}</h3>
                <div className="flex justify-between text-xs font-mono text-brand-text-muted">
                  <span>{source.items} items</span>
                  <span>{source.size}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-6 text-brand-text">
            <GitBranch className="w-4 h-4 mr-2 text-brand-accent" />
            Plugin Registry
          </h2>
          <div className="space-y-3">
            {plugins.map((plugin, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + idx * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="p-3 rounded-xl bg-brand-elevated border border-brand-border hover:border-brand-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-brand-text">{plugin.name}</h3>
                    <p className="text-xs font-mono text-brand-text-muted">v{plugin.version}</p>
                  </div>
                  <div className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                    plugin.active ? 'bg-brand-success/20 text-brand-success' : 'bg-brand-text-muted/20 text-brand-text-muted'
                  )}>
                    {plugin.active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-6 text-brand-text">
            <Shield className="w-4 h-4 mr-2 text-brand-success" />
            System Health
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Memory Usage', value: '74%', color: 'bg-brand-primary' },
              { label: 'CPU Load', value: '45%', color: 'bg-brand-accent' },
              { label: 'GPU Memory', value: '82%', color: 'bg-brand-warning' }
            ].map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.85 + idx * 0.05 }}>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-brand-text-muted">{item.label}</span>
                  <span className="text-brand-text">{item.value}</span>
                </div>
                <div className="h-2 bg-brand-bg rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: item.value }}
                    transition={{ delay: 0.95 + idx * 0.1, duration: 0.5 }}
                    className={`h-full ${item.color}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}