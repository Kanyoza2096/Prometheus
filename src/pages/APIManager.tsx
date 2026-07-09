import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Key, Plus, Copy, Trash2, Edit2, Eye, EyeOff } from 'lucide-react';

const apiKeys = [
  { id: 1, name: 'Production API', key: 'sk-prod-xxxx-xxxx-xxxx-xxxx', createdAt: '2024-01-01', lastUsed: '2024-01-15', status: 'active' },
  { id: 2, name: 'Development API', key: 'sk-dev-xxxx-xxxx-xxxx-xxxx', createdAt: '2024-01-05', lastUsed: '2024-01-14', status: 'active' },
  { id: 3, name: 'Testing API', key: 'sk-test-xxxx-xxxx-xxxx-xxxx', createdAt: '2024-01-10', lastUsed: 'Never', status: 'inactive' },
];

const endpoints = [
  { method: 'GET', path: '/api/v1/users', description: 'Get all users', requests: 12450, avgLatency: '234ms' },
  { method: 'POST', path: '/api/v1/messages', description: 'Send message', requests: 8920, avgLatency: '456ms' },
  { method: 'GET', path: '/api/v1/analytics', description: 'Get analytics', requests: 5600, avgLatency: '123ms' },
  { method: 'POST', path: '/api/v1/webhook', description: 'Webhook receiver', requests: 3400, avgLatency: '89ms' },
];

const methodColors = {
  GET: 'bg-brand-success/20 text-brand-success',
  POST: 'bg-brand-primary/20 text-brand-primary',
  PUT: 'bg-brand-warning/20 text-brand-warning',
  DELETE: 'bg-brand-danger/20 text-brand-danger',
};

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function APIManager() {
  const [showKeys, setShowKeys] = useState<Record<number, boolean>>({});

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
            <Key className="w-8 h-8 mr-3 text-brand-primary" />
            API Manager
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">API KEYS & ENDPOINT MANAGEMENT</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center space-x-2"
         onClick={() => alert('Feature coming soon')}>
          <Plus className="w-4 h-4" />
          <span>Generate Key</span>
        </motion.button>
      </motion.div>

      {/* API Keys */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-brand-surface border border-brand-border rounded-2xl p-6"
      >
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-4">API Keys</h2>
        <div className="space-y-3">
          {apiKeys.map((apiKey, idx) => (
            <motion.div
              key={apiKey.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.08 }}
              whileHover={{ scale: 1.01, x: 4 }}
              className="p-4 bg-brand-elevated rounded-xl border border-brand-border hover:border-brand-primary/30 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-brand-text">{apiKey.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-brand-text-muted font-mono mt-1">
                    <span>Created: {apiKey.createdAt}</span>
                    <span>Last used: {apiKey.lastUsed}</span>
                  </div>
                </div>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                  apiKey.status === 'active'
                    ? 'bg-brand-success/20 text-brand-success'
                    : 'bg-brand-text-muted/20 text-brand-text-muted'
                )}>
                  {apiKey.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <code className="flex-1 px-3 py-2 bg-brand-surface rounded-lg text-xs font-mono text-brand-text border border-brand-border">
                  {showKeys[apiKey.id] ? apiKey.key : '•'.repeat(apiKey.key.length)}
                </code>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowKeys((prev) => ({ ...prev, [apiKey.id]: !prev[apiKey.id] }))}
                  className="px-3 py-2 bg-brand-elevated rounded-lg text-brand-text hover:bg-brand-border/30 transition-colors"
                >
                  {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="px-3 py-2 bg-brand-elevated rounded-lg text-brand-text hover:bg-brand-border/30 transition-colors"
                 onClick={() => alert('Feature coming soon')}>
                  <Copy className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="px-3 py-2 bg-brand-elevated rounded-lg text-brand-text hover:bg-brand-border/30 transition-colors"
                 onClick={() => alert('Feature coming soon')}>
                  <Edit2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="px-3 py-2 bg-brand-danger/10 rounded-lg text-brand-danger hover:bg-brand-danger/20 transition-colors"
                 onClick={() => alert('Feature coming soon')}>
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* API Endpoints */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-brand-surface border border-brand-border rounded-2xl p-6"
      >
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-4">API Endpoints</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-text-muted">Method</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-text-muted">Path</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-text-muted">Description</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-text-muted">Requests</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-text-muted">Avg Latency</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((endpoint, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.08 }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  className="border-b border-brand-border last:border-b-0"
                >
                  <td className="py-4 px-4">
                    <span className={cn(
                      'px-2 py-1 rounded-lg text-xs font-bold uppercase',
                      methodColors[endpoint.method as keyof typeof methodColors]
                    )}>
                      {endpoint.method}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <code className="text-sm font-mono text-brand-primary">{endpoint.path}</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-brand-text">{endpoint.description}</td>
                  <td className="py-4 px-4 text-sm text-brand-text font-mono">{endpoint.requests.toLocaleString()}</td>
                  <td className="py-4 px-4 text-sm text-brand-text font-mono">{endpoint.avgLatency}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}