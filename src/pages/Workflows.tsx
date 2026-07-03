import React from 'react';
import { motion } from 'motion/react';
import { GitBranch, Play, CheckCircle2, CircleDashed, Server, Zap, Database, Globe, RefreshCcw, Brain, Image } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Workflows() {
  const steps = [
    { id: 'topic', label: 'Select Topic', status: 'completed', icon: Database, time: '12ms' },
    { id: 'generate', label: 'Generate Content', status: 'completed', icon: Brain, time: '1.4s' },
    { id: 'render', label: 'Render Card', status: 'running', icon: Image, time: 'In progress...' },
    { id: 'publish', label: 'Publish to Social', status: 'pending', icon: Globe, time: '--' },
    { id: 'analytics', label: 'Record Analytics', status: 'pending', icon: Zap, time: '--' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <GitBranch className="w-8 h-8 mr-3 text-brand-primary" />
            Workflow Engine
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">AUTOMATION PIPELINE VISUALIZER</p>
        </div>
        <button className="bg-brand-surface border border-brand-border text-brand-text px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-brand-elevated transition-colors flex items-center">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh State
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-8 relative overflow-hidden">
            {/* Background decorative grid */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMzMzMiLz48L3N2Zz4=')] opacity-[0.03]"></div>
            
            <div className="flex justify-between items-center mb-10 relative z-10 border-b border-brand-border pb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-lg font-bold text-brand-text uppercase tracking-widest">PostPublishWorkflow</h2>
                  <span className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    Running
                  </span>
                </div>
                <p className="text-xs font-mono text-brand-text-muted">Job ID: job_9283749283 | Trigger: Schedule (0 12 * * *)</p>
              </div>
              <button className="w-10 h-10 rounded-full bg-brand-danger/10 text-brand-danger border border-brand-danger/20 flex items-center justify-center hover:bg-brand-danger hover:text-white transition-colors">
                <Server className="w-4 h-4" />
              </button>
            </div>

            <div className="relative z-10 pl-4 md:pl-12">
              {/* Vertical connecting line */}
              <div className="absolute left-8 md:left-16 top-6 bottom-6 w-[2px] bg-brand-border"></div>
              
              <div className="space-y-12">
                {steps.map((step, idx) => (
                  <div key={step.id} className="relative flex items-start group">
                    {/* Status Indicator */}
                    <div className="absolute -left-4 md:-left-4 mt-1 bg-brand-surface">
                      {step.status === 'completed' && (
                        <div className="w-8 h-8 rounded-full bg-brand-success/10 border border-brand-success flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                          <CheckCircle2 className="w-4 h-4 text-brand-success" />
                        </div>
                      )}
                      {step.status === 'running' && (
                        <div className="w-8 h-8 rounded-full bg-brand-primary/10 border border-brand-primary flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                          <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
                        </div>
                      )}
                      {step.status === 'pending' && (
                        <div className="w-8 h-8 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center">
                          <CircleDashed className="w-4 h-4 text-brand-text-muted" />
                        </div>
                      )}
                    </div>

                    {/* Step Content */}
                    <div className={cn(
                      "ml-10 md:ml-12 p-5 rounded-xl border w-full transition-all",
                      step.status === 'running' 
                        ? "bg-brand-elevated border-brand-primary shadow-[0_0_20px_rgba(79,70,229,0.1)]" 
                        : "bg-brand-bg border-brand-border opacity-70 group-hover:opacity-100"
                    )}>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center space-x-3">
                          <step.icon className={cn(
                            "w-5 h-5",
                            step.status === 'completed' ? "text-brand-success" : step.status === 'running' ? "text-brand-primary" : "text-brand-text-muted"
                          )} />
                          <h3 className={cn(
                            "text-sm font-bold uppercase tracking-wider",
                            step.status === 'pending' ? "text-brand-text-muted" : "text-brand-text"
                          )}>
                            {step.label}
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono text-brand-text-muted">{step.time}</span>
                      </div>
                      
                      {step.status === 'running' && (
                        <div className="mt-4">
                          <div className="flex justify-between text-[10px] font-mono text-brand-text-muted mb-2">
                            <span>Generating layout matrix...</span>
                            <span>45%</span>
                          </div>
                          <div className="w-full bg-brand-surface rounded-full h-1.5 overflow-hidden border border-brand-border">
                            <div className="bg-brand-primary h-1.5 rounded-full w-[45%] relative">
                              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-6 text-brand-text border-b border-brand-border pb-4">
              <Play className="w-4 h-4 mr-2 text-brand-success" />
              Active Workers
            </h2>
            <div className="space-y-4">
              {[1, 2, 3].map((worker) => (
                <div key={worker} className="flex items-center justify-between p-3 rounded-lg bg-brand-bg border border-brand-border">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      worker === 1 ? "bg-brand-primary animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.6)]" : "bg-brand-success"
                    )}></div>
                    <span className="text-xs font-mono font-bold">Worker_{worker}</span>
                  </div>
                  <span className="text-[10px] font-mono text-brand-text-muted uppercase">
                    {worker === 1 ? 'Busy (Post)' : 'Idle'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-4 text-brand-text">
              Queue Status
            </h2>
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-bold text-brand-text font-mono">1</span>
              <span className="text-xs text-brand-text-muted font-mono mb-1">/ 200 Slots</span>
            </div>
            <p className="text-[10px] text-brand-text-muted font-mono uppercase tracking-wider">Thread-pool capacity</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
// Note: Icon Brain and Image need to be imported
