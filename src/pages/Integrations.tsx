import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link, CheckCircle, XCircle, Settings, Plus, ArrowRight } from 'lucide-react';

const integrations = [
  {
    name: 'Facebook',
    category: 'Social Media',
    status: 'connected',
    lastSync: '2 minutes ago',
    color: '#1877F2',
  },
  {
    name: 'WhatsApp',
    category: 'Social Media',
    status: 'connected',
    lastSync: '5 minutes ago',
    color: '#25D366',
  },
  {
    name: 'Telegram',
    category: 'Social Media',
    status: 'disconnected',
    lastSync: 'Never',
    color: '#0088CC',
  },
  {
    name: 'Instagram',
    category: 'Social Media',
    status: 'connected',
    lastSync: '10 minutes ago',
    color: '#E4405F',
  },
  {
    name: 'LinkedIn',
    category: 'Social Media',
    status: 'connected',
    lastSync: '15 minutes ago',
    color: '#0A66C2',
  },
  {
    name: 'Twitter (X)',
    category: 'Social Media',
    status: 'disconnected',
    lastSync: 'Never',
    color: '#000000',
  },
  {
    name: 'Discord',
    category: 'Social Media',
    status: 'connected',
    lastSync: '20 minutes ago',
    color: '#5865F2',
  },
  {
    name: 'Slack',
    category: 'Communication',
    status: 'connected',
    lastSync: '30 minutes ago',
    color: '#4A154B',
  },
  {
    name: 'Email',
    category: 'Communication',
    status: 'connected',
    lastSync: '1 hour ago',
    color: '#EA4335',
  },
  {
    name: 'Supabase',
    category: 'Database',
    status: 'connected',
    lastSync: '5 minutes ago',
    color: '#3ECF8E',
  },
  {
    name: 'PostgreSQL',
    category: 'Database',
    status: 'disconnected',
    lastSync: 'Never',
    color: '#336791',
  },
  {
    name: 'Redis',
    category: 'Database',
    status: 'connected',
    lastSync: '2 minutes ago',
    color: '#DC382D',
  },
  {
    name: 'Google Drive',
    category: 'Storage',
    status: 'disconnected',
    lastSync: 'Never',
    color: '#4285F4',
  },
  {
    name: 'Google Calendar',
    category: 'Productivity',
    status: 'connected',
    lastSync: '10 minutes ago',
    color: '#4285F4',
  },
  {
    name: 'Google Docs',
    category: 'Productivity',
    status: 'disconnected',
    lastSync: 'Never',
    color: '#4285F4',
  },
  {
    name: 'GitHub',
    category: 'Development',
    status: 'connected',
    lastSync: '15 minutes ago',
    color: '#181717',
  },
  {
    name: 'Webhooks',
    category: 'API',
    status: 'connected',
    lastSync: 'Active',
    color: '#6366F1',
  },
  {
    name: 'REST APIs',
    category: 'API',
    status: 'connected',
    lastSync: 'Active',
    color: '#10B981',
  },
];

const categories = ['All', 'Social Media', 'Communication', 'Database', 'Storage', 'Productivity', 'Development', 'API'];

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Integrations() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredIntegrations = integrations.filter(int => 
    selectedCategory === 'All' || int.category === selectedCategory
  );

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
          <Link className="w-8 h-8 mr-3 text-brand-primary" />
          Integrations
        </h1>
        <p className="text-brand-text-muted text-sm font-mono mt-1">CONNECTED SERVICES & API MANAGEMENT</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {categories.map((category, idx) => (
          <motion.button
            key={category}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 + idx * 0.03 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap',
              selectedCategory === category
                ? 'bg-brand-primary text-white shadow-glow-primary'
                : 'bg-brand-surface border border-brand-border text-brand-text hover:bg-brand-elevated'
            )}
          >
            {category}
          </motion.button>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredIntegrations.map((integration, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.35 + idx * 0.04 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-brand-surface border border-brand-border rounded-2xl p-6 hover:border-brand-primary/30 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: integration.color + '20' }}
              >
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: integration.color }}
                />
              </motion.div>
              {integration.status === 'connected' ? (
                <CheckCircle className="w-5 h-5 text-brand-success" />
              ) : (
                <XCircle className="w-5 h-5 text-brand-text-muted" />
              )}
            </div>
            <h3 className="text-sm font-bold text-brand-text mb-1">{integration.name}</h3>
            <p className="text-xs text-brand-text-muted font-mono mb-4">{integration.category}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-brand-text-muted font-mono">
                {integration.status === 'connected' ? `Last sync: ${integration.lastSync}` : 'Not connected'}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full mt-4 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-2',
                integration.status === 'connected'
                  ? 'bg-brand-elevated text-brand-text hover:bg-brand-border/30'
                  : 'bg-brand-primary text-white hover:bg-brand-primary/90 shadow-glow-primary'
              )}
            >
              <span>{integration.status === 'connected' ? 'Configure' : 'Connect'}</span>
              {integration.status === 'connected' ? (
                <Settings className="w-3 h-3" />
              ) : (
                <Plus className="w-3 h-3" />
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}