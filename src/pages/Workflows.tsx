import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GitBranch, Play, Pause, Settings, RefreshCcw, Plus, Trash2, 
  CheckCircle2, Clock, AlertCircle, Database, Server, Zap, Globe, 
  MessageSquare, Brain, Image, Calendar, Shield, Activity, Lock, Edit3
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

type WorkflowNode = { id: string; label: string; icon: React.ElementType; status: 'active' | 'pending' };
type WorkflowRunLog = { id: string; step: string; status: 'success' | 'running' | 'failed'; time: string };

type WorkflowConfig = {
  id: string;
  name: string;
  description: string;
  trigger: string;
  lastRun: string;
  totalRuns: number;
  successCount: number;
  failCount: number;
  nodes: WorkflowNode[];
  logs: WorkflowRunLog[];
  active: boolean;
  runsToday: number;
};

const WORKFLOWS: WorkflowConfig[] = [
  {
    id: 'wf1',
    name: 'Facebook Message Handler',
    description: 'Intercepts incoming DMs, analyzes sentiment, and dispatches automated replies.',
    trigger: 'Webhook (Facebook)',
    lastRun: '2 mins ago',
    totalRuns: 14502,
    successCount: 14450,
    failCount: 52,
    active: true,
    runsToday: 142,
    nodes: [
      { id: 'n1_1', label: 'Facebook Trigger', icon: MessageSquare, status: 'active' },
      { id: 'n1_2', label: 'AI Reply Generator', icon: Brain, status: 'active' },
      { id: 'n1_3', label: 'Sentiment Check', icon: Activity, status: 'active' },
      { id: 'n1_4', label: 'Supabase Log', icon: Database, status: 'active' },
      { id: 'n1_5', label: 'Send Response', icon: Globe, status: 'active' },
      { id: 'n1_6', label: 'Notify Admin', icon: Zap, status: 'pending' }
    ],
    logs: [
      { id: 'l1', step: 'Facebook Trigger', status: 'success', time: '10:42:01 AM' },
      { id: 'l2', step: 'AI Reply Generator', status: 'success', time: '10:42:02 AM' },
      { id: 'l3', step: 'Sentiment Check', status: 'success', time: '10:42:02 AM' },
      { id: 'l4', step: 'Supabase Log', status: 'success', time: '10:42:03 AM' },
      { id: 'l5', step: 'Send Response', status: 'running', time: '10:42:04 AM' }
    ]
  },
  {
    id: 'wf2',
    name: 'Content Publisher',
    description: 'Generates daily content and broadcasts to all connected social channels.',
    trigger: 'Schedule (Cron)',
    lastRun: '4 hours ago',
    totalRuns: 420,
    successCount: 418,
    failCount: 2,
    active: true,
    runsToday: 2,
    nodes: [
      { id: 'n2_1', label: 'Schedule Trigger', icon: Calendar, status: 'active' },
      { id: 'n2_2', label: 'AI Content Gen', icon: Brain, status: 'active' },
      { id: 'n2_3', label: 'Image Fetch', icon: Image, status: 'active' },
      { id: 'n2_4', label: 'Facebook Post', icon: Globe, status: 'pending' },
      { id: 'n2_5', label: 'Twitter Post', icon: Globe, status: 'pending' },
      { id: 'n2_6', label: 'Analytics Update', icon: Zap, status: 'pending' }
    ],
    logs: [
      { id: 'l1', step: 'Schedule Trigger', status: 'success', time: '06:00:00 AM' },
      { id: 'l2', step: 'AI Content Gen', status: 'success', time: '06:00:14 AM' },
      { id: 'l3', step: 'Image Fetch', status: 'success', time: '06:00:18 AM' },
      { id: 'l4', step: 'Facebook Post', status: 'success', time: '06:00:22 AM' },
      { id: 'l5', step: 'Analytics Update', status: 'success', time: '06:00:25 AM' }
    ]
  },
  {
    id: 'wf3',
    name: 'Security Monitor',
    description: 'Monitors infrastructure alerts and automatically blocks malicious IPs.',
    trigger: 'System Event',
    lastRun: '1 min ago',
    totalRuns: 89045,
    successCount: 89045,
    failCount: 0,
    active: true,
    runsToday: 103,
    nodes: [
      { id: 'n3_1', label: 'System Event', icon: Server, status: 'active' },
      { id: 'n3_2', label: 'Threat Detector', icon: Shield, status: 'active' },
      { id: 'n3_3', label: 'Risk Scorer', icon: Activity, status: 'active' },
      { id: 'n3_4', label: 'Alert if Critical', icon: AlertCircle, status: 'pending' },
      { id: 'n3_5', label: 'Auto Block', icon: Lock, status: 'pending' },
      { id: 'n3_6', label: 'Audit Log', icon: Database, status: 'active' }
    ],
    logs: [
      { id: 'l1', step: 'System Event', status: 'success', time: '10:43:10 AM' },
      { id: 'l2', step: 'Threat Detector', status: 'success', time: '10:43:11 AM' },
      { id: 'l3', step: 'Risk Scorer', status: 'success', time: '10:43:11 AM' },
      { id: 'l4', step: 'Alert if Critical', status: 'success', time: '10:43:11 AM' },
      { id: 'l5', step: 'Audit Log', status: 'success', time: '10:43:12 AM' }
    ]
  }
];

// Generate extra mock workflows for the table to hit 12
const EXTRA_WORKFLOWS: WorkflowConfig[] = Array.from({ length: 9 }).map((_, i) => ({
  id: `wf_ex_${i}`,
  name: `Automated Pipeline 0${i + 4}`,
  description: 'Background integration task for internal systems.',
  trigger: i % 2 === 0 ? 'Webhook' : 'Schedule',
  lastRun: `${Math.floor(Math.random() * 20) + 1} hours ago`,
  totalRuns: Math.floor(Math.random() * 5000),
  successCount: Math.floor(Math.random() * 4900),
  failCount: Math.floor(Math.random() * 100),
  active: i % 3 !== 0,
  runsToday: Math.floor(Math.random() * 50),
  nodes: [],
  logs: []
}));

const ALL_WORKFLOWS = [...WORKFLOWS, ...EXTRA_WORKFLOWS];

export default function Workflows() {
  const [activeTabId, setActiveTabId] = useState<string>(WORKFLOWS[0].id);
  const activeWf = WORKFLOWS.find(w => w.id === activeTabId) || WORKFLOWS[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-6 pb-20"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <GitBranch className="w-8 h-8 mr-3 text-brand-primary" />
            Workflow Engine
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">AUTOMATION PIPELINE VISUALIZER</p>
        </div>
        <button className="bg-brand-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center shrink-0">
          <Plus className="w-4 h-4 mr-2" /> New Workflow
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Workflows', value: '12', icon: Database, color: 'text-brand-primary' },
          { label: 'Active', value: '8', icon: Play, color: 'text-brand-success' },
          { label: 'Runs Today', value: '247', icon: Activity, color: 'text-brand-accent' },
          { label: 'Success Rate', value: '98.4%', icon: CheckCircle2, color: 'text-brand-success' },
        ].map((stat, i) => (
          <div key={i} className="bg-brand-surface border border-brand-border rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-brand-text-muted font-mono text-xs uppercase tracking-wider">{stat.label}</span>
              <stat.icon className={cn("w-4 h-4", stat.color)} />
            </div>
            <span className="text-2xl font-bold font-mono text-brand-text">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* MAIN PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT PANEL: VISUAL CANVAS */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {WORKFLOWS.map(wf => (
              <button
                key={wf.id}
                onClick={() => setActiveTabId(wf.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider whitespace-nowrap transition-colors border",
                  activeTabId === wf.id 
                    ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary" 
                    : "bg-brand-surface border-brand-border text-brand-text-muted hover:text-brand-text"
                )}
              >
                {wf.name}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-[400px] bg-brand-surface border border-brand-border rounded-2xl relative overflow-hidden flex items-center justify-center p-8">
            {/* Grid Background */}
            <div 
              className="absolute inset-0 opacity-[0.15]" 
              style={{ 
                backgroundImage: 'radial-gradient(var(--color-brand-border) 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />
            
            <div className="relative z-10 flex flex-wrap justify-center items-center gap-6 max-w-3xl">
              {activeWf.nodes.map((node, i) => (
                <React.Fragment key={node.id}>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 bg-brand-elevated border rounded-2xl w-36 shadow-lg relative",
                      node.status === 'active' ? "border-brand-primary/50 shadow-glow-primary" : "border-brand-border opacity-70"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl mb-3 flex items-center justify-center",
                      node.status === 'active' ? "bg-brand-primary/20 text-brand-primary" : "bg-brand-bg text-brand-text-muted"
                    )}>
                      <node.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-center leading-tight h-8 flex items-center">
                      {node.label}
                    </span>
                    
                    <div className={cn(
                      "absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full border-2 border-brand-elevated",
                      node.status === 'active' ? "bg-brand-success" : "bg-brand-warning"
                    )} />
                  </motion.div>
                  
                  {i < activeWf.nodes.length - 1 && (
                    <motion.div 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 24 }}
                      transition={{ delay: i * 0.1 + 0.1 }}
                      className="hidden sm:block h-0.5 bg-brand-border relative w-6"
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-brand-border" />
                    </motion.div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: PROPERTIES & LOGS */}
        <div className="space-y-6">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-4 pb-4 border-b border-brand-border flex items-center justify-between">
              <span>Properties</span>
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border",
                activeWf.active ? "bg-brand-success/10 text-brand-success border-brand-success/20" : "bg-brand-text-muted/10 text-brand-text-muted border-brand-text-muted/20"
              )}>
                {activeWf.active ? 'Active' : 'Disabled'}
              </span>
            </h2>
            
            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="block text-brand-text-muted mb-1">Name</span>
                <span className="text-brand-text font-bold">{activeWf.name}</span>
              </div>
              <div>
                <span className="block text-brand-text-muted mb-1">Description</span>
                <span className="text-brand-text">{activeWf.description}</span>
              </div>
              <div>
                <span className="block text-brand-text-muted mb-1">Trigger Type</span>
                <span className="inline-block px-2 py-1 bg-brand-bg border border-brand-border rounded text-brand-accent">
                  {activeWf.trigger}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-brand-border">
                <div>
                  <span className="block text-brand-text-muted mb-1">Last Run</span>
                  <span className="text-brand-text">{activeWf.lastRun}</span>
                </div>
                <div>
                  <span className="block text-brand-text-muted mb-1">Total Runs</span>
                  <span className="text-brand-text">{activeWf.totalRuns.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-brand-text-muted mb-1">Success</span>
                  <span className="text-brand-success">{activeWf.successCount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-brand-text-muted mb-1">Failed</span>
                  <span className="text-brand-danger">{activeWf.failCount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-4 pb-4 border-b border-brand-border">
              Recent Step Log
            </h2>
            <div className="space-y-3">
              {activeWf.logs.map(log => (
                <div key={log.id} className="flex items-start justify-between bg-brand-bg p-3 rounded-lg border border-brand-border">
                  <div className="flex items-center space-x-3">
                    {log.status === 'success' && <CheckCircle2 className="w-4 h-4 text-brand-success" />}
                    {log.status === 'running' && <RefreshCcw className="w-4 h-4 text-brand-primary animate-spin" />}
                    {log.status === 'failed' && <AlertCircle className="w-4 h-4 text-brand-danger" />}
                    <span className="text-xs font-bold text-brand-text">{log.step}</span>
                  </div>
                  <span className="text-[10px] font-mono text-brand-text-muted">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: WORKFLOW LIBRARY */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-brand-border flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text">Workflow Library</h2>
          <span className="px-2 py-1 bg-brand-bg rounded text-xs font-mono text-brand-text-muted">
            Showing {ALL_WORKFLOWS.length} results
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-sm">
            <thead className="bg-brand-bg text-brand-text-muted text-xs uppercase tracking-wider border-b border-brand-border">
              <tr>
                <th className="px-6 py-4 font-normal">Name</th>
                <th className="px-6 py-4 font-normal">Trigger</th>
                <th className="px-6 py-4 font-normal">Last Run</th>
                <th className="px-6 py-4 font-normal">Status</th>
                <th className="px-6 py-4 font-normal">Runs Today</th>
                <th className="px-6 py-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-brand-text">
              {ALL_WORKFLOWS.map(wf => (
                <tr key={wf.id} className="hover:bg-brand-elevated/50 transition-colors">
                  <td className="px-6 py-4 font-bold font-sans">{wf.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-brand-bg border border-brand-border rounded text-[10px] text-brand-accent">
                      {wf.trigger}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-brand-text-muted">{wf.lastRun}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] uppercase tracking-wider border inline-flex items-center",
                      wf.active ? "bg-brand-success/10 text-brand-success border-brand-success/20" : "bg-brand-text-muted/10 text-brand-text-muted border-brand-text-muted/20"
                    )}>
                      {wf.active ? <Play className="w-3 h-3 mr-1" /> : <Pause className="w-3 h-3 mr-1" />}
                      {wf.active ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{wf.runsToday}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="p-1.5 text-brand-text-muted hover:text-brand-text transition-colors" title="Edit">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-brand-text-muted hover:text-brand-primary transition-colors" title="Toggle">
                      {wf.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button className="p-1.5 text-brand-text-muted hover:text-brand-danger transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
