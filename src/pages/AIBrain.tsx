import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrainCircuit, Cpu, Database, Settings2, Sparkles, ChevronDown, Check,
  Zap, Clock, DollarSign, Activity, TerminalSquare, Search,
  Box, Puzzle, Layers, Share2, Server, BookOpen, AlertTriangle, CheckCircle2,
  FileText, ArrowBigRight, LayoutGrid, X
} from 'lucide-react';
import { cn } from '../lib/utils';

const modelOptions = [
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', context: '1M Tokens', type: 'Reasoning/Heavy' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', context: '1M Tokens', type: 'Fast/Multimodal' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', context: '128k Tokens', type: 'Versatile' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', context: '200k Tokens', type: 'Coding/Logic' }
];

const engines = [
  { name: 'Reasoning Engine', status: 'active' },
  { name: 'Planning Engine', status: 'active' },
  { name: 'Content Engine', status: 'active' },
  { name: 'Decision Engine', status: 'active' },
  { name: 'Learning Engine', status: 'standby' },
  { name: 'Tool Calling', status: 'active' },
  { name: 'Plugin Registry', status: 'active' },
  { name: 'Model Router', status: 'active' },
];

const promptTemplates = [
  { name: 'Executive Summary', category: 'Analysis', lastUsed: '2m ago' },
  { name: 'Data Extraction', category: 'ETL', lastUsed: '15m ago' },
  { name: 'Code Review', category: 'Development', lastUsed: '1h ago' },
  { name: 'Social Post Gen', category: 'Content', lastUsed: '3h ago' },
  { name: 'Tone Analyzer', category: 'NLP', lastUsed: '5h ago' },
  { name: 'Financial Predictor', category: 'Analysis', lastUsed: '8h ago' },
];

const knowledgeSources = [
  { name: 'Enterprise Wiki', type: 'Confluence', count: '1,240', status: 'Synced' },
  { name: 'Customer DB', type: 'PostgreSQL', count: '842,000', status: 'Live' },
  { name: 'Support Tickets', type: 'Zendesk', count: '15,000', status: 'Indexing' },
  { name: 'API Specs', type: 'Swagger', count: '45', status: 'Synced' },
  { name: 'Internal Chat', type: 'Slack', count: '4.2M', status: 'Live' },
];

const ragDocuments = [
  { name: 'Q3_Financial_Report.pdf', size: '4.2 MB', chunks: 1420, status: 'indexed', date: '2023-10-15T08:30:00' },
  { name: 'Employee_Handbook_2024.docx', size: '1.8 MB', chunks: 850, status: 'indexed', date: '2023-10-14T14:20:00' },
  { name: 'Architecture_Diagrams.png', size: '8.5 MB', chunks: 45, status: 'error', date: '2023-10-14T09:15:00' },
  { name: 'Client_Meeting_Transcripts.txt', size: '12.4 MB', chunks: 8400, status: 'pending', date: '2023-10-13T16:45:00' },
  { name: 'Product_Roadmap_Q4.csv', size: '0.9 MB', chunks: 210, status: 'indexed', date: '2023-10-12T11:10:00' },
];

function ModelSelectModal({ isOpen, onClose, current, onSelect }: { isOpen: boolean, onClose: () => void, current: string, onSelect: (id: string) => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-brand-surface border border-brand-border shadow-glow-primary w-full max-w-2xl flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b border-brand-border bg-brand-elevated">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-text">Select AI Model Core</h3>
          <button onClick={onClose} className="text-brand-text-muted hover:text-brand-text transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {modelOptions.map(m => (
            <button
              key={m.id}
              onClick={() => { onSelect(m.id); onClose(); }}
              className={cn(
                "p-4 border text-left flex flex-col transition-all duration-200 focus:outline-none",
                current === m.id 
                  ? "border-brand-primary bg-brand-primary/5 shadow-glow-primary" 
                  : "border-brand-border bg-brand-elevated hover:border-brand-primary/30"
              )}
            >
              <div className="flex justify-between items-start mb-3 w-full">
                <span className="text-sm font-bold text-brand-text tracking-wide">{m.name}</span>
                {current === m.id && <Check className="w-4 h-4 text-brand-primary" />}
              </div>
              <div className="text-[10px] font-mono text-brand-text-muted uppercase tracking-widest mb-4">
                Provider: <span className="text-brand-text">{m.provider}</span>
              </div>
              <div className="flex space-x-2 mt-auto w-full">
                <span className="px-2 py-0.5 text-[9px] font-mono bg-brand-surface border border-brand-border text-brand-text-muted uppercase tracking-widest">
                  {m.context}
                </span>
                <span className="px-2 py-0.5 text-[9px] font-mono bg-brand-surface border border-brand-border text-brand-text-muted uppercase tracking-widest">
                  {m.type}
                </span>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function AIBrain() {
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [currentModelId, setCurrentModelId] = useState('gemini-1.5-pro');

  const activeModelData = modelOptions.find(m => m.id === currentModelId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-20 md:pb-0"
    >
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between border-b border-brand-border pb-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-brand-text flex items-center">
            <BrainCircuit className="w-6 h-6 mr-3 text-brand-primary" />
            AI Intelligence Core
          </h1>
          <p className="text-brand-text-muted text-xs font-mono mt-1 uppercase tracking-widest">Cognitive Engine Status & Pipeline Telemetry</p>
        </div>
      </div>

      {/* Section 1 — Current AI Model panel */}
      <motion.div 
        className="bg-brand-surface border border-brand-border p-6 relative overflow-hidden group"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-[0.08] transition-opacity pointer-events-none">
          <BrainCircuit className="w-64 h-64 text-brand-primary transform translate-x-1/4 -translate-y-1/4" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <div className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest mb-2 flex items-center">
              <Cpu className="w-3 h-3 mr-2 text-brand-primary" />
              Active Neural Model
            </div>
            <div className="text-3xl lg:text-4xl font-mono font-bold text-brand-text flex items-center tracking-tight">
              {activeModelData?.name || currentModelId}
              <span className="ml-4 px-2 py-0.5 text-[10px] font-mono uppercase bg-brand-success/10 border border-brand-success/30 text-brand-success tracking-widest flex items-center h-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-success mr-2 animate-pulse" />
                Active
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-5">
              <div className="text-[10px] font-mono text-brand-text-muted uppercase tracking-widest border border-brand-border bg-brand-elevated px-3 py-1">
                <span className="text-brand-text font-bold mr-2">Context:</span>{activeModelData?.context || 'N/A'}
              </div>
              <div className="text-[10px] font-mono text-brand-text-muted uppercase tracking-widest border border-brand-border bg-brand-elevated px-3 py-1">
                <span className="text-brand-text font-bold mr-2">Temp:</span>0.2 (Precise)
              </div>
              <div className="text-[10px] font-mono text-brand-success uppercase tracking-widest border border-brand-success/20 bg-brand-success/5 px-3 py-1">
                <span className="font-bold mr-2">Avg Latency:</span>340ms
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsModelModalOpen(true)}
            className="mt-6 md:mt-0 px-6 py-3 border border-brand-primary bg-brand-primary/10 text-brand-primary font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-brand-primary hover:text-white transition-all shadow-glow-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 flex items-center"
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Change Model
          </button>
        </div>
      </motion.div>

      {/* Section 2 — Live metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Token Usage (Today)', value: '2.4M', sub: 'Tokens processed', icon: Zap, color: 'text-brand-warning' },
          { label: 'Platform Latency', value: '340ms', sub: 'Across all models', icon: Clock, color: 'text-brand-success' },
          { label: 'Est. Compute Cost', value: '$4.82', sub: 'Today overhead', icon: DollarSign, color: 'text-brand-primary' },
          { label: 'Requests/Hour', value: '847', sub: 'Current throughput', icon: Activity, color: 'text-brand-accent' }
        ].map((m, i) => (
          <motion.div 
            key={i} 
            className="bg-brand-surface border border-brand-border p-5 flex items-center justify-between hover:border-brand-border/80 transition-colors group"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}
          >
            <div>
              <div className="text-[9px] uppercase font-bold text-brand-text-muted tracking-widest mb-2">{m.label}</div>
              <div className="text-2xl font-mono font-bold text-brand-text mb-1 tracking-tight">{m.value}</div>
              <div className="text-[9px] font-mono text-brand-text-muted uppercase tracking-widest opacity-80">{m.sub}</div>
            </div>
            <div className={cn("p-3 bg-brand-elevated border border-brand-border rounded group-hover:scale-110 transition-transform", m.color)}>
              <m.icon className="w-5 h-5" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Section 3 — Engine registry grid */}
      <motion.div 
        className="bg-brand-surface border border-brand-border flex flex-col"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      >
        <div className="border-b border-brand-border p-3 bg-brand-elevated">
          <h2 className="text-xs uppercase font-bold text-brand-text tracking-widest flex items-center">
            <Cpu className="w-4 h-4 mr-2 text-brand-accent" />
            Engine Registry & Subsystems
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-brand-border p-px">
          {engines.map((eng, i) => (
            <div key={i} className="bg-brand-surface p-4 hover:bg-brand-elevated transition-colors flex flex-col justify-between h-24">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-brand-text uppercase tracking-wider">{eng.name}</span>
                <span className={cn("text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border", 
                  eng.status === 'active' 
                    ? "text-brand-success border-brand-success/30 bg-brand-success/10" 
                    : "text-brand-text-muted border-brand-border bg-brand-elevated"
                )}>
                  {eng.status}
                </span>
              </div>
              <div className="flex items-center text-[9px] font-mono text-brand-text-muted uppercase tracking-widest">
                <Activity className="w-3 h-3 mr-1.5" /> Last active: just now
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section 4 — Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          className="bg-brand-surface border border-brand-border flex flex-col"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        >
          <div className="border-b border-brand-border p-3 bg-brand-elevated flex justify-between items-center">
            <h2 className="text-xs uppercase font-bold text-brand-text tracking-widest flex items-center">
              <TerminalSquare className="w-4 h-4 mr-2 text-brand-primary" />
              Prompt Templates
            </h2>
            <span className="text-[10px] font-mono text-brand-text-muted uppercase tracking-widest">{promptTemplates.length} Active</span>
          </div>
          <div className="p-4 space-y-2 h-[340px] overflow-y-auto">
            {promptTemplates.map((pt, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-brand-elevated border border-brand-border hover:border-brand-primary/40 transition-colors cursor-pointer group">
                <div>
                  <div className="text-xs font-bold text-brand-text tracking-wide group-hover:text-brand-primary transition-colors">{pt.name}</div>
                  <div className="text-[9px] font-mono text-brand-text-muted uppercase tracking-widest mt-1">Used {pt.lastUsed}</div>
                </div>
                <div className="px-2 py-1 bg-brand-surface border border-brand-border text-[9px] font-mono text-brand-text-muted uppercase tracking-widest group-hover:text-brand-primary group-hover:border-brand-primary/30 transition-colors">
                  {pt.category}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="bg-brand-surface border border-brand-border flex flex-col"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        >
          <div className="border-b border-brand-border p-3 bg-brand-elevated flex justify-between items-center">
            <h2 className="text-xs uppercase font-bold text-brand-text tracking-widest flex items-center">
              <Database className="w-4 h-4 mr-2 text-brand-warning" />
              Knowledge Sources
            </h2>
            <span className="text-[10px] font-mono text-brand-text-muted uppercase tracking-widest">{knowledgeSources.length} Connected</span>
          </div>
          <div className="p-4 space-y-2 h-[340px] overflow-y-auto">
            {knowledgeSources.map((ks, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-brand-elevated border border-brand-border hover:border-brand-warning/40 transition-colors cursor-pointer group">
                <div>
                  <div className="text-xs font-bold text-brand-text tracking-wide group-hover:text-brand-warning transition-colors">{ks.name}</div>
                  <div className="text-[9px] font-mono text-brand-text-muted uppercase tracking-widest mt-1">{ks.type} • {ks.count} items</div>
                </div>
                <div className={cn("px-2 py-1 border text-[9px] font-mono uppercase tracking-widest", 
                  ks.status === 'Live' || ks.status === 'Synced' 
                    ? "bg-brand-success/10 border-brand-success/30 text-brand-success" 
                    : "bg-brand-warning/10 border-brand-warning/30 text-brand-warning"
                )}>
                  {ks.status}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Section 5 — RAG Documents table */}
      <motion.div 
        className="bg-brand-surface border border-brand-border flex flex-col"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
      >
        <div className="border-b border-brand-border p-3 bg-brand-elevated flex justify-between items-center">
          <h2 className="text-xs uppercase font-bold text-brand-text tracking-widest flex items-center">
            <Layers className="w-4 h-4 mr-2 text-brand-success" />
            RAG Ingestion Pipeline
          </h2>
          <button className="text-[10px] font-mono text-brand-primary uppercase tracking-widest hover:underline hover:text-brand-primary/80 focus:outline-none" onClick={() => alert('Feature coming soon')}>
            View All Documents
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-elevated/50 border-b border-brand-border">
                <th className="p-3 text-[9px] font-mono uppercase tracking-widest text-brand-text-muted font-bold whitespace-nowrap">Filename</th>
                <th className="p-3 text-[9px] font-mono uppercase tracking-widest text-brand-text-muted font-bold whitespace-nowrap">Size</th>
                <th className="p-3 text-[9px] font-mono uppercase tracking-widest text-brand-text-muted font-bold whitespace-nowrap">Chunks</th>
                <th className="p-3 text-[9px] font-mono uppercase tracking-widest text-brand-text-muted font-bold whitespace-nowrap">Status</th>
                <th className="p-3 text-[9px] font-mono uppercase tracking-widest text-brand-text-muted font-bold whitespace-nowrap">Ingested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {ragDocuments.map((doc, i) => (
                <tr key={i} className="hover:bg-brand-elevated/80 transition-colors">
                  <td className="p-3 text-xs font-bold text-brand-text flex items-center min-w-[200px]">
                    <FileText className="w-3.5 h-3.5 mr-2 text-brand-text-muted" />
                    {doc.name}
                  </td>
                  <td className="p-3 text-[10px] font-mono text-brand-text-muted whitespace-nowrap">{doc.size}</td>
                  <td className="p-3 text-[10px] font-mono text-brand-text-muted whitespace-nowrap">{doc.chunks.toLocaleString()}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={cn("px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest border",
                      doc.status === 'indexed' ? "bg-brand-success/10 border-brand-success/30 text-brand-success" :
                      doc.status === 'pending' ? "bg-brand-warning/10 border-brand-warning/30 text-brand-warning" :
                      "bg-brand-danger/10 border-brand-danger/30 text-brand-danger"
                    )}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="p-3 text-[10px] font-mono text-brand-text-muted whitespace-nowrap">{new Date(doc.date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <ModelSelectModal 
        isOpen={isModelModalOpen} 
        onClose={() => setIsModelModalOpen(false)} 
        current={currentModelId} 
        onSelect={setCurrentModelId} 
      />
    </motion.div>
  );
}
