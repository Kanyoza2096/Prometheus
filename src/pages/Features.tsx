import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { ToggleLeft, AlertTriangle, ShieldOff, Unlock, RefreshCw, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

function formatLabel(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function Features() {
  const { restEndpoint, masterToken } = useStore();
  const headers = masterToken ? { 'Content-Type': 'application/json', Authorization: `Bearer ${masterToken}` } : {};
  const base = restEndpoint.replace(/\/+$/, '');

  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [limits, setLimits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rlLoading, setRlLoading] = useState(true);
  const [rlError, setRlError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [unblocking, setUnblocking] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchFeatures = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${base}/features`, { headers });
      if (res.ok) {
        const d = await res.json();
        setFeatures(d.features || {});
      }
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const fetchLimits = async () => {
    setRlLoading(true);
    setRlError(null);
    try {
      const res = await fetch(`${base}/rate-limits`, { headers });
      if (res.ok) {
        const d = await res.json();
        setLimits(d.rate_limits || []);
      }
    } catch (err: any) { setRlError(err.message); }
    finally { setRlLoading(false); }
  };

  useEffect(() => { fetchFeatures(); fetchLimits(); }, [restEndpoint]);

  const handleToggle = async (key: string, enabled: boolean) => {
    setToggling(key);
    const newEnabled = !enabled;
    // Optimistic update
    setFeatures(prev => ({ ...prev, [key]: newEnabled }));
    try {
      const res = await fetch(`${base}/features/toggle`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ feature: key, enabled: newEnabled }),
      });
      if (!res.ok) {
        setFeatures(prev => ({ ...prev, [key]: enabled }));
        showToast('Toggle failed', false);
      } else {
        showToast(`${formatLabel(key)} ${newEnabled ? 'enabled' : 'disabled'}`, true);
      }
    } catch {
      setFeatures(prev => ({ ...prev, [key]: enabled }));
      showToast('Toggle failed', false);
    } finally { setToggling(null); }
  };

  const handleUnblock = async (identifier: string) => {
    setUnblocking(identifier);
    try {
      const res = await fetch(`${base}/rate-limits/unblock`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ identifier }),
      });
      if (res.ok) {
        showToast(`${identifier} unblocked`, true);
        fetchLimits();
      } else {
        showToast('Unblock failed', false);
      }
    } catch { showToast('Unblock failed', false); }
    finally { setUnblocking(null); }
  };

  const entries = Object.entries(features);
  const blockedLimits = limits.filter(l => l.blocked);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={cn("fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-mono text-xs font-bold", toast.ok ? "bg-brand-success text-white" : "bg-brand-danger text-white")}>
            {toast.ok ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}{toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <ToggleLeft className="w-8 h-8 mr-3 text-brand-primary" /> Feature Toggles
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">SYSTEM-WIDE FEATURE FLAGS</p>
        </div>
        <button onClick={fetchFeatures} className="p-2.5 bg-brand-elevated border border-brand-border rounded-xl text-brand-text-muted hover:text-brand-text">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-brand-surface/60 border border-brand-border rounded-2xl animate-pulse" />)}</div>
      ) : error ? (
        <div className="py-10 text-center text-brand-danger font-mono text-sm flex flex-col items-center gap-2">
          <AlertTriangle className="w-6 h-6" /> Failed to load.
          <button onClick={fetchFeatures} className="mt-2 px-4 py-1.5 bg-brand-elevated rounded-lg text-xs font-bold">Retry</button>
        </div>
      ) : entries.length === 0 ? (
        <div className="py-10 text-center text-brand-text-muted font-mono text-xs uppercase border border-dashed border-brand-border rounded-2xl">No feature flags configured.</div>
      ) : (
        <div className="bg-brand-surface border border-brand-border rounded-2xl divide-y divide-brand-border">
          {entries.map(([key, enabled], idx) => (
            <motion.div key={key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * idx }}
              className="flex items-center justify-between p-5">
              <div><h3 className="text-sm font-bold text-brand-text">{formatLabel(key)}</h3><code className="text-[10px] font-mono text-brand-text-muted">{key}</code></div>
              <button onClick={() => handleToggle(key, enabled)}
                className={cn('relative w-12 h-6 rounded-full transition-colors shrink-0', enabled ? 'bg-brand-success' : 'bg-brand-elevated border border-brand-border')}>
                <motion.span layout className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow flex items-center justify-center', enabled ? 'left-6' : 'left-0.5')}>
                  {toggling === key && <RefreshCw className="w-3 h-3 animate-spin" />}
                </motion.span>
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-5 mt-8">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-3">
            <ShieldOff className="w-6 h-6 text-brand-warning" /> Rate Limits
            {blockedLimits.length > 0 && <span className="px-2 py-0.5 bg-brand-danger/20 text-brand-danger text-xs font-bold rounded-full border border-brand-danger/30">{blockedLimits.length} blocked</span>}
          </h2>
        </div>
        <button onClick={fetchLimits} className="p-2.5 bg-brand-elevated border border-brand-border rounded-xl text-brand-text-muted hover:text-brand-text">
          <RefreshCw className={cn('w-4 h-4', rlLoading && 'animate-spin')} />
        </button>
      </div>

      {rlLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-brand-surface/60 border border-brand-border rounded-2xl animate-pulse" />)}</div>
      ) : rlError ? (
        <div className="py-10 text-center text-brand-danger font-mono text-sm flex flex-col items-center gap-2"><AlertTriangle className="w-6 h-6" /> Failed to load.<button onClick={fetchLimits} className="mt-2 px-4 py-1.5 bg-brand-elevated rounded-lg text-xs font-bold">Retry</button></div>
      ) : limits.length === 0 ? (
        <div className="py-10 text-center text-brand-text-muted font-mono text-xs uppercase border border-dashed border-brand-border rounded-2xl">No rate limit entries.</div>
      ) : (
        <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead><tr className="border-b border-brand-border bg-brand-elevated">{['Identifier','Remaining','Status',''].map(h => <th key={h} className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">{h}</th>)}</tr></thead>
            <tbody>
              {limits.map((l, i) => (
                <tr key={l.id ?? i} className="border-b border-brand-border/50 hover:bg-brand-elevated/40 transition-colors">
                  <td className="py-3 px-4 text-xs font-mono text-brand-text">{l.identifier || '—'}</td>
                  <td className="py-3 px-4 text-xs font-mono"><span className={l.remaining === 0 ? 'text-brand-danger font-bold' : 'text-brand-text'}>{l.remaining ?? '—'} / {l.limit ?? '—'}</span></td>
                  <td className="py-3 px-4"><span className={cn('px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase font-mono', l.blocked ? 'bg-brand-danger/10 border-brand-danger/30 text-brand-danger' : 'bg-brand-success/10 border-brand-success/30 text-brand-success')}>{l.blocked ? 'Blocked' : 'Active'}</span></td>
                  <td className="py-3 px-4">{l.blocked && (
                    <button onClick={() => handleUnblock(String(l.identifier ?? l.id))} disabled={unblocking === String(l.identifier ?? l.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-brand-success/10 border border-brand-success/30 text-brand-success rounded-lg text-xs font-bold hover:bg-brand-success/20 transition-colors disabled:opacity-50">
                      {unblocking === String(l.identifier ?? l.id) ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Unlock className="w-3 h-3" />} Unblock
                    </button>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
