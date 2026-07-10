import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { 
  GitBranch, Play, Pause, RefreshCcw, Plus, Trash2, 
  CheckCircle2, Clock, AlertCircle, Database, Activity, Zap, Send
} from 'lucide-react';
import { cn } from '../lib/utils';

interface WorkflowRun {
  workflow?: string;
  triggered_by?: string;
  ok?: boolean;
  duration_ms?: number;
  topic?: string;
  platforms?: string[];
  error?: string;
  ran_at?: string;
}

interface WorkflowStatus {
  status: 'running' | 'paused' | 'idle';
  progress: number;
  current_step: string;
}

interface ScheduleConfig {
  content_hours_utc: number[];
  news_hours_utc: number[];
  post_interval_hours: number | null;
  news_interval_hours: number | null;
  enabled: boolean;
}

export default function Workflows() {
  const { restEndpoint, masterToken } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schedulerStatus, setSchedulerStatus] = useState<WorkflowStatus>({ status: 'idle', progress: 0, current_step: '' });
  const [schedule, setSchedule] = useState<ScheduleConfig | null>(null);
  const [history, setHistory] = useState<WorkflowRun[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const headers = masterToken ? { 'Content-Type': 'application/json', Authorization: `Bearer ${masterToken}` } : {};
  const base = restEndpoint.replace(/\/+$/, '');

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusRes, schedRes, histRes] = await Promise.all([
        fetch(`${base}/workflow/status`, { headers }),
        fetch(`${base}/schedule`, { headers }),
        fetch(`${base}/workflow/history`, { headers }),
      ]);

      if (statusRes.ok) {
        const d = await statusRes.json();
        setSchedulerStatus(d);
      }
      if (schedRes.ok) {
        const d = await schedRes.json();
        setSchedule(d.schedule || d);
      }
      if (histRes.ok) {
        const d = await histRes.json();
        setHistory(d.history || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [restEndpoint]);

  const apiAction = async (path: string, method = 'POST') => {
    setActionLoading(path);
    try {
      const res = await fetch(`${base}${path}`, { method, headers });
      const d = await res.json();
      if (res.ok) {
        showToast(d.message || 'Action completed', true);
        fetchAll();
      } else {
        showToast(d.error || 'Action failed', false);
      }
    } catch (err: any) {
      showToast(err.message || 'Request failed', false);
    } finally {
      setActionLoading(null);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const activeHours = schedule?.content_hours_utc || [];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-brand-elevated rounded w-48" />
        <div className="h-64 bg-brand-surface border border-brand-border rounded-2xl" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20 md:pb-0 max-w-5xl">
      {/* Toast */}
      {toast && (
        <div className={cn("fixed top-20 right-6 z-50 px-4 py-2 rounded-xl border text-xs font-bold font-mono", toast.ok ? "bg-brand-success/10 text-brand-success border-brand-success/30" : "bg-brand-danger/10 text-brand-danger border-brand-danger/30")}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <GitBranch className="w-8 h-8 mr-3 text-brand-primary" />
            Workflow Engine
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">AUTOMATION PIPELINE CONTROL</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAll} className="p-2.5 bg-brand-elevated border border-brand-border rounded-xl text-brand-text-muted hover:text-brand-text transition-all">
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-brand-danger/5 border border-brand-danger/20 rounded-xl text-xs text-brand-danger font-mono">{error}</div>
      )}

      {/* Status + Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", schedulerStatus.status === 'running' ? "bg-brand-success/20 text-brand-success" : "bg-brand-warning/20 text-brand-warning")}>
            {schedulerStatus.status === 'running' ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-brand-text-muted">Scheduler Status</p>
            <p className="text-lg font-bold text-brand-text capitalize">{schedulerStatus.status}</p>
            <p className="text-[10px] text-brand-text-muted font-mono">{schedulerStatus.current_step || 'Idle'}</p>
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 flex flex-col justify-center gap-3">
          <button onClick={() => apiAction('/bot/post')} disabled={actionLoading === '/bot/post'}
            className="w-full py-2.5 bg-brand-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            <Send className="w-4 h-4" /> {actionLoading === '/bot/post' ? 'Posting...' : 'Force Post Now'}
          </button>
          <div className="flex gap-2">
            <button onClick={() => apiAction('/bot/news')} disabled={actionLoading === '/bot/news'}
              className="flex-1 py-2 bg-brand-elevated border border-brand-border rounded-xl text-xs font-bold uppercase tracking-wider text-brand-text-muted hover:text-brand-text transition-all disabled:opacity-50">
              Post News
            </button>
            <button onClick={() => apiAction('/bot/engage')} disabled={actionLoading === '/bot/engage'}
              className="flex-1 py-2 bg-brand-elevated border border-brand-border rounded-xl text-xs font-bold uppercase tracking-wider text-brand-text-muted hover:text-brand-text transition-all disabled:opacity-50">
              Engage
            </button>
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 flex flex-col justify-center gap-3">
          {schedulerStatus.status === 'running' ? (
            <button onClick={() => apiAction('/workflow/pause')} disabled={actionLoading === '/workflow/pause'}
              className="w-full py-2.5 bg-brand-warning text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-warning/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              <Pause className="w-4 h-4" /> Pause Scheduler
            </button>
          ) : (
            <button onClick={() => apiAction('/workflow/resume')} disabled={actionLoading === '/workflow/resume'}
              className="w-full py-2.5 bg-brand-success text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-success/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              <Play className="w-4 h-4" /> Resume Scheduler
            </button>
          )}
          <button onClick={() => apiAction('/workflow/trigger')} disabled={actionLoading === '/workflow/trigger'}
            className="w-full py-2 bg-brand-elevated border border-brand-border rounded-xl text-xs font-bold uppercase tracking-wider text-brand-text-muted hover:text-brand-text transition-all disabled:opacity-50">
            Trigger Workflow
          </button>
        </div>
      </div>

      {/* Schedule Hours Grid */}
      {schedule && (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-4">Posting Schedule (UTC Hours)</h2>
          <div className="grid grid-cols-12 gap-2">
            {hours.map(h => (
              <div key={h} className={cn(
                "py-2 rounded-lg text-center text-xs font-mono font-bold border transition-all",
                activeHours.includes(h)
                  ? "bg-brand-primary/20 text-brand-primary border-brand-primary/30"
                  : "bg-brand-elevated text-brand-text-muted border-brand-border"
              )}>
                {h.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflow History */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-brand-border">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text">Recent Workflow History</h2>
        </div>
        {history.length === 0 ? (
          <div className="p-12 text-center text-brand-text-muted font-mono text-xs uppercase">
            No workflow runs recorded yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-elevated text-[10px] font-mono uppercase text-brand-text-muted">
                <tr>
                  <th className="px-5 py-3">Workflow</th>
                  <th className="px-5 py-3">Trigger</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Topic</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {history.map((run, i) => (
                  <tr key={i} className="hover:bg-brand-elevated/50 transition-colors">
                    <td className="px-5 py-3 font-bold text-brand-text">{run.workflow || 'post_publish'}</td>
                    <td className="px-5 py-3 text-brand-text-muted">{run.triggered_by || 'api'}</td>
                    <td className="px-5 py-3">
                      {run.ok ? (
                        <span className="text-brand-success flex items-center gap-1 text-xs"><CheckCircle2 className="w-3 h-3" /> Success</span>
                      ) : (
                        <span className="text-brand-danger flex items-center gap-1 text-xs"><AlertCircle className="w-3 h-3" /> Failed</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-brand-text text-xs">{run.topic || '—'}</td>
                    <td className="px-5 py-3 text-brand-text-muted font-mono">{run.duration_ms ? `${run.duration_ms}ms` : '—'}</td>
                    <td className="px-5 py-3 text-brand-text-muted text-xs">{run.ran_at ? new Date(run.ran_at).toLocaleTimeString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
