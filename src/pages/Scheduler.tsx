import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock, Zap, RefreshCcw, Check, AlertCircle, Activity,
  Calendar, Send, Pause, Play, Newspaper, MessageSquare,
  History,
} from 'lucide-react';
import { Spinner } from '../components/Spinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import {
  fetchSchedule, updateSchedule, fetchBotStatus,
  pauseWorkflow, resumeWorkflow,
  type ScheduleConfig,
} from '../lib/api';

const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i);

function fmt24(h: number) {
  const suffix = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:00 ${suffix}`;
}

function Toast({ msg, kind, onDismiss }: { msg: string; kind: 'success' | 'error'; onDismiss: () => void }) {
  useEffect(() => { const t = setTimeout(onDismiss, kind === 'error' ? 6000 : 3500); return () => clearTimeout(t); }, [kind, onDismiss]);
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-mono text-xs font-bold',
        kind === 'success' ? 'bg-brand-primary text-white' : 'bg-brand-danger text-white',
      )}
    >
      {kind === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {msg}
    </motion.div>
  );
}

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono',
      ok ? 'bg-brand-success/20 text-brand-success' : 'bg-brand-danger/20 text-brand-danger',
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', ok ? 'bg-brand-success animate-pulse' : 'bg-brand-danger')} />
      {ok ? 'Running' : 'Paused'}
    </span>
  );
}

export default function Scheduler() {
  const restEndpoint = useStore(s => s.restEndpoint);
  const masterToken  = useStore(s => s.masterToken);
  const cfg = { restEndpoint, masterToken };
  const qc  = useQueryClient();

  const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, kind: 'success' | 'error' = 'success') => setToast({ msg, kind });

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: schedData, isLoading: schedLoading, isError: schedError } = useQuery({
    queryKey: ['schedule', restEndpoint],
    queryFn: () => fetchSchedule(cfg),
    retry: 1,
    staleTime: 30_000,
  });

  const { data: botStatus, isLoading: botLoading } = useQuery({
    queryKey: ['bot-status', restEndpoint],
    queryFn: () => fetchBotStatus(cfg),
    retry: 1,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  const { data: historyData } = useQuery({
    queryKey: ['workflow-history', restEndpoint],
    queryFn: async () => {
      const base = restEndpoint.replace(/\/+$/, '');
      const res = await fetch(`${base}/workflow/history`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${masterToken}` },
      });
      if (!res.ok) return { history: [] };
      return res.json();
    },
    retry: 1,
    staleTime: 60_000,
  });

  const schedule: ScheduleConfig | null = schedData?.schedule ?? null;
  const [contentHours, setContentHours] = useState<number[] | null>(null);
  const [newsHours, setNewsHours]        = useState<number[] | null>(null);

  const displayContentHours = contentHours ?? schedule?.content_hours_utc ?? [];
  const displayNewsHours    = newsHours    ?? schedule?.news_hours_utc    ?? [];

  const toggleHour = (
    hours: number[],
    setHours: React.Dispatch<React.SetStateAction<number[] | null>>,
    h: number,
  ) => {
    setHours(hours.includes(h) ? hours.filter(x => x !== h) : [...hours, h].sort((a, b) => a - b));
  };

  // ── Bot status helpers ─────────────────────────────────────────────────────
  const sched           = (botStatus as any)?.scheduler;
  const schedulerRunning: boolean = !!sched?.running;
  const postsToday:       number  = sched?.posts_today ?? 0;
  const targetPosts:      number  = sched?.target_posts_per_day ?? displayContentHours.length;
  const lastPost:         string | null = sched?.last_post ?? null;
  const queueSize:        number  = sched?.queue_size ?? 0;

  const workflowHistory: any[] = (historyData as any)?.history ?? (historyData as any)?.workflows ?? [];

  // ── Mutations ──────────────────────────────────────────────────────────────
  const saveMut = useMutation({
    mutationFn: () => updateSchedule(cfg, {
      content_hours_utc: displayContentHours,
      news_hours_utc:    displayNewsHours,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule'] });
      setContentHours(null);
      setNewsHours(null);
      showToast('Schedule saved and applied.');
    },
    onError: () => showToast('Failed to save schedule.', 'error'),
  });

  interface BotPostResult { queued?: boolean; }
  interface BotActionResult { message?: string; }

  const postMut = useMutation({
    mutationFn: async (): Promise<BotPostResult> => {
      const base = restEndpoint.replace(/\/+$/, '');
      const res = await fetch(`${base}/bot/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${masterToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<BotPostResult>;
    },
    onSuccess: (d: BotPostResult) => {
      qc.invalidateQueries({ queryKey: ['bot-status'] });
      showToast(d?.queued ? 'Post queued for immediate publish.' : 'Queue full — try again shortly.', d?.queued ? 'success' : 'error');
    },
    onError: (err: Error) => showToast(err?.message || 'Failed to trigger post.', 'error'),
  });

  const newsMut = useMutation({
    mutationFn: async (): Promise<BotActionResult> => {
      const base = restEndpoint.replace(/\/+$/, '');
      const res = await fetch(`${base}/bot/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${masterToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<BotActionResult>;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bot-status'] }); showToast('News post triggered.'); },
    onError: (err: Error) => showToast(err?.message || 'Failed to trigger news post.', 'error'),
  });

  const engageMut = useMutation({
    mutationFn: async (): Promise<BotActionResult> => {
      const base = restEndpoint.replace(/\/+$/, '');
      const res = await fetch(`${base}/bot/engage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${masterToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<BotActionResult>;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bot-status'] }); showToast('Engagement cycle triggered.'); },
    onError: (err: Error) => showToast(err?.message || 'Failed to trigger engagement.', 'error'),
  });

  const pauseMut = useMutation({
    mutationFn: () => pauseWorkflow(cfg),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bot-status'] });
      showToast('Workflow paused.');
    },
    onError: (err: Error) => showToast(err?.message || 'Failed to pause workflow.', 'error'),
  });

  const resumeMut = useMutation({
    mutationFn: () => resumeWorkflow(cfg),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bot-status'] });
      showToast('Workflow resumed.');
    },
    onError: (err: Error) => showToast(err?.message || 'Failed to resume workflow.', 'error'),
  });

  const isDirty = contentHours !== null || newsHours !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6 pb-24"
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast key="toast" msg={toast.msg} kind={toast.kind} onDismiss={() => setToast(null)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <Calendar className="w-8 h-8 mr-3 text-brand-primary" />
            Scheduler Control
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">CONTENT ENGINE ORCHESTRATION</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Pause / Resume */}
          {schedulerRunning ? (
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => pauseMut.mutate()}
              disabled={pauseMut.isPending || botLoading}
              className="bg-brand-warning/10 border border-brand-warning/40 text-brand-warning px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-warning/20 flex items-center gap-2 disabled:opacity-60"
            >
              {pauseMut.isPending ? <Spinner size={14} /> : <Pause className="w-4 h-4" />}
              Pause
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => resumeMut.mutate()}
              disabled={resumeMut.isPending || botLoading}
              className="bg-brand-success/10 border border-brand-success/40 text-brand-success px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-success/20 flex items-center gap-2 disabled:opacity-60"
            >
              {resumeMut.isPending ? <Spinner size={14} /> : <Play className="w-4 h-4" />}
              Resume
            </motion.button>
          )}
          {/* Force actions */}
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => newsMut.mutate()}
            disabled={newsMut.isPending}
            className="bg-brand-elevated border border-brand-border text-brand-text px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:border-brand-accent/40 flex items-center gap-2 disabled:opacity-60"
          >
            {newsMut.isPending ? <Spinner size={14} /> : <Newspaper className="w-4 h-4" />}
            Post News
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => engageMut.mutate()}
            disabled={engageMut.isPending}
            className="bg-brand-elevated border border-brand-border text-brand-text px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:border-brand-accent/40 flex items-center gap-2 disabled:opacity-60"
          >
            {engageMut.isPending ? <Spinner size={14} /> : <MessageSquare className="w-4 h-4" />}
            Engage
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => postMut.mutate()}
            disabled={postMut.isPending}
            className="bg-brand-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center gap-2 disabled:opacity-60"
          >
            {postMut.isPending ? <Spinner size={14} /> : <Send className="w-4 h-4" />}
            Post Now
          </motion.button>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Scheduler',   value: <StatusBadge ok={schedulerRunning} />,                             icon: Activity },
          { label: 'Posts Today', value: `${postsToday} / ${targetPosts}`,                                  icon: Check    },
          { label: 'Queue Depth', value: String(queueSize),                                                  icon: Zap      },
          { label: 'Last Post',   value: lastPost ? new Date(lastPost).toLocaleTimeString() : '—',           icon: Clock    },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-brand-surface border border-brand-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-brand-text-muted" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted font-mono">{label}</span>
            </div>
            <div className="text-sm font-bold text-brand-text">{value}</div>
          </div>
        ))}
      </div>

      {schedError && (
        <div className="p-4 rounded-xl bg-brand-warning/10 border border-brand-warning/30 text-brand-warning text-sm font-mono">
          ⚠ Could not load live schedule — check API token.
        </div>
      )}

      {/* Content hours */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center">
            <Clock className="w-4 h-4 mr-2 text-brand-accent" />
            Content Post Hours — UTC ({displayContentHours.length} slots / day)
          </h2>
          {schedLoading && <Spinner size={16} />}
        </div>
        <p className="text-xs text-brand-text-muted font-mono mb-4">Click an hour to toggle it. Highlighted = active posting times.</p>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
          {ALL_HOURS.map(h => (
            <motion.button
              key={h}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleHour(displayContentHours, setContentHours, h)}
              className={cn(
                'py-2 rounded-xl text-xs font-bold font-mono transition-all border',
                displayContentHours.includes(h)
                  ? 'bg-brand-primary/20 border-brand-primary text-brand-primary shadow-glow-primary'
                  : 'bg-brand-elevated border-brand-border text-brand-text-muted hover:border-brand-primary/30',
              )}
            >
              {String(h).padStart(2, '0')}
            </motion.button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {displayContentHours.map(h => (
            <span key={h} className="text-[10px] font-mono bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full border border-brand-primary/20">
              {fmt24(h)}
            </span>
          ))}
          {displayContentHours.length === 0 && (
            <span className="text-[10px] font-mono text-brand-text-muted">No content hours selected</span>
          )}
        </div>
      </div>

      {/* News hours */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-5">
          <RefreshCcw className="w-4 h-4 mr-2 text-brand-warning" />
          News Post Hours — UTC ({displayNewsHours.length} slots / day)
        </h2>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
          {ALL_HOURS.map(h => (
            <motion.button
              key={h}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleHour(displayNewsHours, setNewsHours, h)}
              className={cn(
                'py-2 rounded-xl text-xs font-bold font-mono transition-all border',
                displayNewsHours.includes(h)
                  ? 'bg-brand-warning/20 border-brand-warning text-brand-warning'
                  : 'bg-brand-elevated border-brand-border text-brand-text-muted hover:border-brand-warning/30',
              )}
            >
              {String(h).padStart(2, '0')}
            </motion.button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {displayNewsHours.map(h => (
            <span key={h} className="text-[10px] font-mono bg-brand-warning/10 text-brand-warning px-2 py-0.5 rounded-full border border-brand-warning/20">
              {fmt24(h)}
            </span>
          ))}
          {displayNewsHours.length === 0 && (
            <span className="text-[10px] font-mono text-brand-text-muted">No news hours selected</span>
          )}
        </div>
      </div>

      {/* Workflow History */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-5">
          <History className="w-4 h-4 text-brand-text-muted" />
          Workflow History
          <span className="ml-auto text-[10px] font-mono text-brand-text-muted">Last 20 runs</span>
        </h2>
        {workflowHistory.length === 0 ? (
          <div className="py-10 text-center text-brand-text-muted font-mono text-xs uppercase">
            No workflow history available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border bg-brand-elevated">
                  <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">Run ID</th>
                  <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">Type</th>
                  <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">Status</th>
                  <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">Started</th>
                  <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">Duration</th>
                </tr>
              </thead>
              <tbody>
                {workflowHistory.slice(0, 20).map((run: any, i: number) => (
                  <tr key={run.id ?? i} className="border-b border-brand-border/50 hover:bg-brand-elevated/40 transition-colors">
                    <td className="py-3 px-4 text-xs font-mono text-brand-text-muted">{run.id ?? `run-${i}`}</td>
                    <td className="py-3 px-4 text-sm font-bold text-brand-text">{run.type ?? run.workflow_type ?? '—'}</td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border font-mono',
                        (run.status === 'success' || run.status === 'complete') ? 'bg-brand-success/10 border-brand-success/30 text-brand-success' :
                        run.status === 'error'   ? 'bg-brand-danger/10 border-brand-danger/30 text-brand-danger' :
                        'bg-brand-warning/10 border-brand-warning/30 text-brand-warning',
                      )}>
                        {run.status ?? 'unknown'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-brand-text-muted">
                      {run.started_at || run.created_at ? new Date(run.started_at || run.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-brand-text-muted">
                      {run.duration_ms ? `${run.duration_ms}ms` : run.duration ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating save bar */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 inset-x-0 flex justify-center z-40 px-4"
          >
            <div className="bg-brand-surface border border-brand-primary/40 rounded-2xl shadow-2xl p-4 flex items-center gap-4 w-full max-w-md">
              <span className="text-xs font-mono text-brand-text-muted flex-1">Unsaved schedule changes</span>
              <button
                onClick={() => { setContentHours(null); setNewsHours(null); }}
                className="text-xs font-bold text-brand-text-muted hover:text-brand-text px-3 py-1.5 rounded-lg transition-colors"
              >
                Discard
              </button>
              <button
                onClick={() => saveMut.mutate()}
                disabled={saveMut.isPending}
                className="bg-brand-primary text-white px-5 py-2 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {saveMut.isPending ? <Spinner size={16} /> : <Check className="w-4 h-4" />}
                Save Schedule
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
