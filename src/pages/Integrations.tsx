import React, { useState, useEffect } from 'react';
import { fetchIntegrations } from '../lib/api';
import { useStore } from '../store/useStore';
import { motion } from 'motion/react';
import { 
  Link, CheckCircle, XCircle, AlertCircle, Settings, Plus, RefreshCw, 
  FileText, Activity, Facebook, MessageCircle, Send, Instagram, Linkedin, 
  Twitter, MessageSquare, Hash, Mail, Database, Cloud, Calendar, Github, 
  Webhook, Code 
} from 'lucide-react';
import { cn } from '../lib/utils';

type Status = 'connected' | 'degraded' | 'offline';

interface Integration {
  name: string;
  category: string;
  status: Status;
  latency: number;
  lastSync: string;
  icon: React.ElementType;
  color: string;
}

const integrations: Integration[] = [
  { name: 'Facebook', category: 'Social Media', status: 'connected', latency: 45, lastSync: '2m ago', icon: Facebook, color: '#1877F2' },
  { name: 'WhatsApp', category: 'Social Media', status: 'connected', latency: 78, lastSync: '5m ago', icon: MessageCircle, color: '#25D366' },
  { name: 'Telegram', category: 'Social Media', status: 'connected', latency: 120, lastSync: '10m ago', icon: Send, color: '#229ED9' },
  { name: 'Instagram', category: 'Social Media', status: 'degraded', latency: 450, lastSync: '15m ago', icon: Instagram, color: '#E4405F' },
  { name: 'LinkedIn', category: 'Social Media', status: 'connected', latency: 89, lastSync: '12m ago', icon: Linkedin, color: '#0A66C2' },
  { name: 'Twitter', category: 'Social Media', status: 'offline', latency: 0, lastSync: '1h ago', icon: Twitter, color: '#1DA1F2' },
  { name: 'Discord', category: 'Social Media', status: 'connected', latency: 34, lastSync: '1m ago', icon: MessageSquare, color: '#5865F2' },
  { name: 'Slack', category: 'Messaging', status: 'connected', latency: 56, lastSync: '3m ago', icon: Hash, color: '#4A154B' },
  { name: 'Email (SMTP)', category: 'Messaging', status: 'connected', latency: 23, lastSync: 'Just now', icon: Mail, color: '#EA4335' },
  { name: 'Supabase', category: 'Databases', status: 'connected', latency: 15, lastSync: 'Active', icon: Database, color: '#3ECF8E' },
  { name: 'PostgreSQL', category: 'Databases', status: 'connected', latency: 12, lastSync: 'Active', icon: Database, color: '#336791' },
  { name: 'Redis', category: 'Databases', status: 'connected', latency: 8, lastSync: 'Active', icon: Database, color: '#DC382D' },
  { name: 'Google Drive', category: 'Cloud', status: 'connected', latency: 145, lastSync: '20m ago', icon: Cloud, color: '#4285F4' },
  { name: 'Google Calendar', category: 'Cloud', status: 'connected', latency: 167, lastSync: '30m ago', icon: Calendar, color: '#4285F4' },
  { name: 'Google Docs', category: 'Cloud', status: 'connected', latency: 189, lastSync: '45m ago', icon: FileText, color: '#4285F4' },
  { name: 'GitHub', category: 'DevOps', status: 'connected', latency: 234, lastSync: '1h ago', icon: Github, color: '#181717' },
  { name: 'Webhooks', category: 'Webhooks', status: 'connected', latency: 45, lastSync: 'Active', icon: Webhook, color: '#6366F1' },
  { name: 'REST APIs', category: 'DevOps', status: 'connected', latency: 67, lastSync: 'Active', icon: Code, color: '#10B981' },
];

const categories = ['All', 'Social Media', 'Databases', 'Messaging', 'Cloud', 'DevOps', 'Webhooks'];


export default function Integrations() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [data, setData] = useState<Integration[]>(integrations);
  const [loading, setLoading] = useState(true);
  const { restEndpoint, masterToken } = useStore();

  useEffect(() => {
    let mounted = true;
    fetchIntegrations({ restEndpoint, masterToken })
      .then(res => {
        if (mounted && res && res.ok && res.integrations) {
          // Map backend integration to local with icons (this is a simplified mapping logic for demo)
          const liveData = res.integrations.map((live: any) => {
            const existing = integrations.find(i => i.name.toLowerCase() === live.name.toLowerCase());
            return {
              name: live.name,
              category: existing ? existing.category : 'Other',
              status: live.status === 'active' ? 'connected' : 'offline',
              latency: live.latency || 0,
              lastSync: live.lastSync || 'Just now',
              icon: existing ? existing.icon : Webhook,
              color: existing ? existing.color : '#6366F1'
            } as Integration;
          });
          setData(liveData.length > 0 ? liveData : integrations);
        } else {
           if (mounted) setData(integrations);
        }
      })
      .catch(() => {
        if (mounted) setData(integrations);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [restEndpoint, masterToken]);

  const filteredIntegrations = data.filter(int => 
    selectedCategory === 'All' || int.category === selectedCategory
  );
  
  const connectedCount = data.filter(i => i.status === 'connected').length;
  const degradedCount = data.filter(i => i.status === 'degraded').length;
  const offlineCount = data.filter(i => i.status === 'offline').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20 md:pb-0"
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <Link className="w-8 h-8 mr-3 text-brand-primary" />
            Integration Center
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">
            MANAGE CONNECTED SERVICES & PIPELINES
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="flex items-center text-xs font-mono bg-brand-surface border border-brand-border px-3 py-1.5 rounded-full text-brand-text">
              <CheckCircle className="w-3.5 h-3.5 text-brand-success mr-1.5" />
              <span>{connectedCount} Connected</span>
            </div>
            {degradedCount > 0 && (
              <div className="flex items-center text-xs font-mono bg-brand-surface border border-brand-border px-3 py-1.5 rounded-full text-brand-text">
                <AlertCircle className="w-3.5 h-3.5 text-brand-warning mr-1.5" />
                <span>{degradedCount} Degraded</span>
              </div>
            )}
            {offlineCount > 0 && (
              <div className="flex items-center text-xs font-mono bg-brand-surface border border-brand-border px-3 py-1.5 rounded-full text-brand-text">
                <XCircle className="w-3.5 h-3.5 text-brand-danger mr-1.5" />
                <span>{offlineCount} Offline</span>
              </div>
            )}
          </div>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-brand-primary text-white shadow-glow-primary px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap self-start hover:bg-brand-primary/90 transition-colors"
         onClick={() => alert('Feature coming soon')}>
          <Plus className="w-4 h-4" />
          Connect New Integration
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
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
            key={integration.name}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.35 + (idx % 8) * 0.04 }}
            className="bg-brand-surface border border-brand-border rounded-2xl p-5 hover:border-brand-primary/30 transition-all flex flex-col group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: integration.color + '15' }}
                >
                  <integration.icon 
                    className="w-6 h-6 z-10" 
                    style={{ color: integration.color }} 
                  />
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{ backgroundColor: integration.color }}
                  />
                </motion.div>
                <div>
                  <h3 className="text-sm font-bold text-brand-text leading-tight">{integration.name}</h3>
                  <span className="text-[10px] uppercase tracking-wider font-mono text-brand-text-muted">
                    {integration.category}
                  </span>
                </div>
              </div>
              <div title={integration.status} className="mt-1">
                {integration.status === 'connected' && (
                  <CheckCircle className="w-5 h-5 text-brand-success" />
                )}
                {integration.status === 'degraded' && (
                  <AlertCircle className="w-5 h-5 text-brand-warning" />
                )}
                {integration.status === 'offline' && (
                  <XCircle className="w-5 h-5 text-brand-danger" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-5 flex-1">
              <div className="bg-brand-bg rounded-lg p-2 border border-brand-border">
                <span className="block text-[10px] text-brand-text-muted font-mono mb-1">LATENCY</span>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-brand-text-muted" />
                  <span className={cn(
                    "text-xs font-bold font-mono",
                    integration.status === 'offline' ? 'text-brand-text-muted' :
                    integration.latency < 100 ? 'text-brand-success' :
                    integration.latency < 500 ? 'text-brand-warning' :
                    'text-brand-danger'
                  )}>
                    {integration.status === 'offline' ? '--' : `${integration.latency}ms`}
                  </span>
                </div>
              </div>
              <div className="bg-brand-bg rounded-lg p-2 border border-brand-border">
                <span className="block text-[10px] text-brand-text-muted font-mono mb-1">LAST SYNC</span>
                <span className="text-xs font-bold text-brand-text font-mono truncate block">
                  {integration.lastSync}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5",
                  integration.status === 'offline' || integration.status === 'degraded'
                    ? "bg-brand-elevated text-brand-text border border-brand-border hover:bg-brand-border/50"
                    : "bg-brand-elevated text-brand-text hover:bg-brand-border/30 border border-transparent"
                )}
               onClick={() => alert('Feature coming soon')}>
                <Settings className="w-3.5 h-3.5" />
                <span>Configure</span>
              </motion.button>
              
              {(integration.status === 'degraded' || integration.status === 'offline') && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 border border-brand-primary/20"
                 onClick={() => alert('Feature coming soon')}>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reconnect</span>
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="View Logs"
                className="py-2 px-3 rounded-lg bg-brand-bg border border-brand-border text-brand-text-muted hover:text-brand-text hover:border-brand-text-muted transition-colors flex items-center justify-center"
               onClick={() => alert('Feature coming soon')}>
                <FileText className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
