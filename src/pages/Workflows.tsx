import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GitBranch, Play, CheckCircle2, CircleDashed, Server, Zap, Database, Globe, RefreshCcw, Brain, Image, Pause, Check, Clock, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { fetchStatus } from '../lib/api';

type StepStatus = 'completed' | 'running' | 'pending' | 'error';
interface Step { id: string; label: string; status: StepStatus; icon: React.ElementType; time: string; }

const BASE_STEPS: Step[] = [
  { id: 'topic',     label: 'Select Topic',       status: 'completed', icon: Database, time: '12ms'         },
  { id: 'generate',  label: 'Generate Content',   status: 'completed', icon: Brain,    time: '1.4s'         },
  { id: 'render',    label: 'Render Card',        status: 'running',   icon: Image,    time: 'In progress…' },
  { id: 'publish',   label: 'Publish to Facebook', status: 'pending',  icon: Globe,    time: '--'           },
  { id: 'analytics', label: 'Record Analytics',   status: 'pending',   icon: Zap,      time: '--'           },
  { id: 'event',     label: 'Emit Domain Event',  status: 'pending',   icon: Server,   time: '--'           },
];

function nextHour(hours: number[]): string {
  if (!hours || hours.length === 0) return '--';
  const nowUtc = new Date();
  const currentH = nowUtc.getUTCHours();
  const next = hours.find(h => h > currentH) ?? hours[0];
  const diff = next > currentH ? next - currentH : (24 - currentH + next);
  if (diff < 1) return 'Now';
  return `in ${diff}h (${String(next).padStart(2, '0')}:00 UTC)`;
}

export default function Workflows() {
  const restEndpoint = useStore(state => state.restEndpoint);
  const masterToken  = useStore(state => state.masterToken);
  const stats        = useStore(state => state.stats);
  const backendConfig = useStore(state => state.backendConfig);
  const cfg = { restEndpoint, masterToken };

  const [jobStatus, setJobStatus] = useState<'Running' | 'Paused'>('Running');
  const [steps,     setSteps]     = useState<Step[]>(BASE_STEPS);
  const [toast,     setToast]     = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // Fetch real backend config for posting schedule
  const { data: statusData, isFetching, refetch } = useQuery({
    queryKey: ['backend-status', restEndpoint],
    queryFn:  () => fetchStatus(cfg),
    retry: 1,
    staleTime: 60_000,
  });

  const config = statusData?.config || backendConfig?.config;
  const contentHours: number[] = config?.content_posting_hours_utc || [];
  const newsHours: number[]    = config?.news_posting_hours_utc    || [];

  // When a new post arrives, advance the pipeline steps
  useEffect(() => {
    if (stats.postsPublished > 0) {
      setSteps(prev => prev.map(s => ({
        ...s,
        status: s.id === 'topic' || s.id === 'generate' || s.id === 'publish' || s.id === 'analytics' || s.id === 'event'
          ? 'completed'
          : s.id === 'render' ? 'running' : s.status,
      })));
    }
  }, [stats.postsPublished]);

  const toggleJobStatus = () => {
    const next = jobStatus === 'Running' ? 'Paused' : 'Running';
    setJobStatus(next);
    showToast(next === 'Paused' ? 'Workflow paused — posts will queue until resumed.' : 'Workflow resumed — next post will fire on schedule.');
  };

  const handleRefreshState = () => {
    refetch();
    showToast('Workflow telemetry refreshed from core engine.');
  };

  const handleStepClick = (stepId: string) => {
    setSteps(prev => prev.map(s => {
      if (s.id !== stepId) return s;
      const next: StepStatus = s.status === 'pending' ? 'running' : s.status === 'running' ? 'completed' : 'pending';
      return { ...s, status: next };
    }));
    showToast(`Updated step state for ${stepId.toUpperCase()}`);
  };

  // Derive progress % from step completion
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto relative"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 bg-brand-primary text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-2 font-mono text-xs font-bold"
          >
            <Check className="w-4 h-4" /><span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <GitBranch className="w-8 h-8 mr-3 text-brand-primary" />
            Workflow Engine
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">AUTOMATION PIPELINE VISUALIZER</p>
        </div>
        <button
          onClick={handleRefreshState}
          disabled={isFetching}
          className="bg-brand-surface border border-brand-border text-brand-text px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-elevated transition-colors flex items-center shadow-sm disabled:opacity-60"
        >
          <RefreshCcw className={cn('w-4 h-4 mr-2 text-brand-primary', isFetching && 'animate-spin')} />
          {isFetching ? 'Syncing…' : 'Refresh State'}
        </button>
      </div>

      {/* Live Schedule Banner from real backend config */}
      {config && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-brand-surface border border-brand-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-brand-text-muted uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5 text-brand-primary" />
              Content Posts
            </div>
            <p className="font-bold text-brand-text">Next: {nextHour(contentHours)}</p>
            <p className="text-brand-text-muted mt-1">{contentHours.length} scheduled hours/day</p>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-brand-text-muted uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5 text-brand-accent" />
              News Posts
            </div>
            <p className="font-bold text-brand-text">Next: {nextHour(newsHours)}</p>
            <p className="text-brand-text-muted mt-1">{newsHours.length} scheduled hours/day</p>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-brand-text-muted uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5 text-brand-success" />
              Rate Limit
            </div>
            <p className="font-bold text-brand-text">{config.rate_limit_per_user} req/user</p>
            <p className="text-brand-text-muted mt-1">{config.environment} environment</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMzMzMiLz48L3N2Zz4=')] opacity-[0.03]" />

            <div className="flex justify-between items-center mb-10 relative z-10 border-b border-brand-border pb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-lg font-bold text-brand-text uppercase tracking-widest">PostPublishWorkflow</h2>
                  <span className={cn(
                    'px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border',
                    jobStatus === 'Running'
                      ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                      : 'bg-brand-warning/10 text-brand-warning border-brand-warning/20'
                  )}>
                    {jobStatus}
                  </span>
                  {config && (
                    <span className="text-[10px] font-mono text-brand-success flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-success inline-block" />LIVE
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-brand-text-muted">
                  Trigger: Schedule · {contentHours.length > 0 ? `${contentHours.length}×/day` : 'Configuring…'}
                </p>
              </div>
              <button
                onClick={toggleJobStatus}
                title={jobStatus === 'Running' ? 'Pause Execution' : 'Resume Execution'}
                className={cn(
                  'w-10 h-10 rounded-full border flex items-center justify-center transition-colors shadow-md',
                  jobStatus === 'Running'
                    ? 'bg-brand-danger/10 text-brand-danger border-brand-danger/20 hover:bg-brand-danger hover:text-white'
                    : 'bg-brand-success/10 text-brand-success border-brand-success/20 hover:bg-brand-success hover:text-white'
                )}
              >
                {jobStatus === 'Running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative z-10 pl-4 md:pl-12">
              <div className="absolute left-8 md:left-16 top-6 bottom-6 w-[2px] bg-brand-border" />
              <div className="space-y-12">
                {steps.map(step => (
                  <div key={step.id} className="relative flex items-start group">
                    <div className="absolute -left-4 md:-left-4 mt-1 bg-brand-surface">
                      {step.status === 'completed' && (
                        <div className="w-8 h-8 rounded-full bg-brand-success/10 border border-brand-success flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                          <CheckCircle2 className="w-4 h-4 text-brand-success" />
                        </div>
                      )}
                      {step.status === 'running' && (
                        <div className="w-8 h-8 rounded-full bg-brand-primary/10 border border-brand-primary flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                          <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
                        </div>
                      )}
                      {(step.status === 'pending' || step.status === 'error') && (
                        <div className="w-8 h-8 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center">
                          <CircleDashed className="w-4 h-4 text-brand-text-muted" />
                        </div>
                      )}
                    </div>

                    <div
                      onClick={() => handleStepClick(step.id)}
                      className={cn(
                        'ml-10 md:ml-12 p-5 rounded-xl border w-full transition-all cursor-pointer',
                        step.status === 'running'
                          ? 'bg-brand-elevated border-brand-primary shadow-[0_0_20px_rgba(79,70,229,0.1)]'
                          : 'bg-brand-bg border-brand-border opacity-70 group-hover:opacity-100 hover:border-brand-primary/40'
                      )}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center space-x-3">
                          <step.icon className={cn(
                            'w-5 h-5',
                            step.status === 'completed' ? 'text-brand-success' :
                            step.status === 'running'   ? 'text-brand-primary' :
                                                         'text-brand-text-muted'
                          )} />
                          <h3 className={cn(
                            'text-sm font-bold uppercase tracking-wider',
                            step.status === 'pending' ? 'text-brand-text-muted' : 'text-brand-text'
                          )}>
                            {step.label}
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono text-brand-text-muted">{step.time}</span>
                      </div>

                      {step.status === 'running' && (
                        <div className="mt-4">
                          <div className="flex justify-between text-[10px] font-mono text-brand-text-muted mb-2">
                            <span>Processing content pipeline…</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-brand-surface rounded-full h-1.5 overflow-hidden border border-brand-border">
                            <div
                              className="bg-brand-primary h-1.5 rounded-full relative transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            >
                              <div className="absolute inset-0 bg-white/20 animate-pulse" />
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
              {[1, 2, 3].map(worker => (
                <div key={worker} className="flex items-center justify-between p-3 rounded-lg bg-brand-bg border border-brand-border">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      worker === 1 && jobStatus === 'Running'
                        ? 'bg-brand-primary animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.6)]'
                        : 'bg-brand-success'
                    )} />
                    <span className="text-xs font-mono font-bold">Worker_{worker}</span>
                  </div>
                  <span className="text-[10px] font-mono text-brand-text-muted uppercase">
                    {worker === 1 && jobStatus === 'Running' ? 'Busy (Post)' : 'Idle'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-4 text-brand-text">
              Posts Today
            </h2>
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-bold text-brand-text font-mono">{stats.postsPublished}</span>
              <span className="text-xs text-brand-text-muted font-mono mb-1">published</span>
            </div>
            <p className="text-[10px] text-brand-text-muted font-mono uppercase tracking-wider">Live from backend</p>
          </div>

          {/* Content Schedule */}
          {contentHours.length > 0 && (
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
              <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-4 text-brand-text">
                <Clock className="w-4 h-4 mr-2 text-brand-accent" />
                Content Hours (UTC)
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {contentHours.map(h => {
                  const nowH = new Date().getUTCHours();
                  const isPast = h < nowH;
                  const isCurrent = h === nowH;
                  return (
                    <span
                      key={h}
                      className={cn(
                        'text-[10px] font-mono font-bold px-2 py-0.5 rounded border',
                        isCurrent
                          ? 'bg-brand-primary/20 text-brand-primary border-brand-primary/30'
                          : isPast
                          ? 'bg-brand-success/10 text-brand-success border-brand-success/20'
                          : 'bg-brand-bg text-brand-text-muted border-brand-border'
                      )}
                    >
                      {String(h).padStart(2, '0')}:00
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
