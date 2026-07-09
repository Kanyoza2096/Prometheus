import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Zap, RefreshCcw, Check, AlertCircle, Activity, Calendar, Send } from 'lucide-react';
import { Spinner } from '../components/Spinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { fetchSchedule, updateSchedule, fetchBotStatus, type ScheduleConfig } from '../lib/api';

const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i);

function fmt24(h: number) {
  const suffix = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:00 ${suffix}`;
}

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono',
      ok ? 'bg-brand-success/20 text-brand-success' : 'bg-brand-danger/20 text-brand-danger'
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', ok ? 'bg-brand-success' : 'bg-brand-danger')} />
      {ok ? 'Running' : 'Stopped'}
    </span>
  );
}

export default function Scheduler() {
  const restEndpoint = useStore(s => s.restEndpoint);
  const masterToken  = useStore(s => s.masterToken);
  const cfg = { restEndpoint, masterToken };
  const qc  = useQueryClient();

  const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, kind: 'success' | 'error' = 'success') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch live schedule config
  const { data: schedData, isLoading: schedLoading, isError: schedError } = useQuery({
    queryKey: ['schedule', restEndpoint],
    queryFn:  () => fetchSchedule(cfg),
    retry: 1,
    staleTime: 30_000,
  });

  // Fetch scheduler runtime status
  const { data: botStatus } = useQuery({
    queryKey: ['bot-status', restEndpoint],
    queryFn:  () => fetchBotStatus(cfg),
    retry: 1,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  const schedule: ScheduleConfig | null = schedData?.schedule ?? null;

  // Local editable copies of hours
  const [contentHours, setContentHours] = useState<number[] | null>(null);
  const [newsHours,    setNewsHours]    = useState<number[] | null>(null);

  // Use live data when available, fall back to local edits
  const displayContentHours = contentHours ?? schedule?.content_hours_utc ?? [];
  const displayNewsHours    = newsHours    ?? schedule?.news_hours_utc    ?? [];

  const toggleHour = (
    hours: number[],
    setHours: React.Dispatch<React.SetStateAction<number[] | null>>,
    h: number
  ) => {
    setHours(hours.includes(h) ? hours.filter(x => x !== h) : [...hours, h].sort((a, b) => a - b));
  };

  // Mutation: save schedule
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

  // Mutation: trigger immediate post
  const postMut = useMutation({
    mutationFn: async () => {
      const base = restEndpoint.replace(/\/+$/, '');
      const res = await fetch(`${base}/bot/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${masterToken}`,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    onSuccess: (d: any) => {
      qc.invalidateQueries({ queryKey: ['bot-status'] });
      showToast(d?.queued ? 'Post queued for immediate publish.' : 'Queue full — try again shortly.', d?.queued ? 'success' : 'error');
    },
    onError: () => showToast('Failed to trigger post.', 'error'),
  });

  const isDirty =
    contentHours !== null ||
    newsHours    !== null;

  // /api/v1/bot/status returns { ok, scheduler: { running, posts_today, ... }, services, as_of }
  const sched = (botStatus as any)?.scheduler;
  const schedulerRunning: boolean = !!sched?.running;
  const postsToday:       number  = sched?.posts_today ?? 0;
  const targetPosts:      number  = sched?.target_posts_per_day ?? displayContentHours.length;
  const lastPost:         string | null = sched?.last_post ?? null;
  const queueSize:        number  = sched?.queue_size ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6 pb-20 md:pb-0"
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'fixed top-20 right-8 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-mono text-xs font-bold',
              toast.kind === 'success' ? 'bg-brand-primary text-white' : 'bg-brand-danger text-white'
            )}
          >
            {toast.kind === 'success'
              ? <Check className="w-4 h-4" />
              : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <Calendar className="w-8 h-8 mr-3 text-brand-primary" />
            Post Scheduler
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">CONTENT POSTING HOURS (UTC)</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => postMut.mutate()}
            disabled={postMut.isPending}
            className="bg-brand-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {postMut.isPending
              ? <><Spinner size={16} />Queuing…</>
              : <><Send className="w-4 h-4" />Post Now</>}
          </motion.button>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Scheduler',    value: <StatusBadge ok={!!schedulerRunning} />,                        icon: Activity },
          { label: 'Posts Today',  value: `${postsToday} / ${targetPosts}`,                               icon: Check    },
          { label: 'Queue Depth',  value: String(queueSize),                                               icon: Zap      },
          { label: 'Last Post',    value: lastPost ? new Date(lastPost).toLocaleTimeString() : '—',        icon: Clock    },
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
          ⚠ Could not load live schedule (check API token). Showing last-known config or defaults.
        </div>
      )}

      {/* Content hours editor */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center">
            <Clock className="w-4 h-4 mr-2 text-brand-accent" />
            Content Post Hours — UTC ({displayContentHours.length} slots / day)
          </h2>
          {schedLoading && <Spinner size={16} />}
        </div>
        <p className="text-xs text-brand-text-muted font-mono mb-4">
          Click an hour to toggle it. Highlighted slots = active posting times.
        </p>
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
                  : 'bg-brand-elevated border-brand-border text-brand-text-muted hover:border-brand-primary/30'
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

      {/* News hours editor */}
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
                  : 'bg-brand-elevated border-brand-border text-brand-text-muted hover:border-brand-warning/30'
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

      {/* Save bar */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 inset-x-0 flex justify-center z-40 px-4 md:px-0"
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
                {saveMut.isPending
                  ? <><Spinner size={16} />Saving…</>
                  : <><Check className="w-4 h-4" />Save Schedule</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
