import React from 'react';
import { motion } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ToggleLeft, AlertTriangle, ShieldOff, Unlock, RefreshCw } from 'lucide-react';
import { Spinner } from '../components/Spinner';
import { useStore } from '../store/useStore';
import { fetchFeatures, toggleFeature, fetchRateLimits, unblockRateLimit, type RateLimitEntry } from '../lib/api';
import { cn } from '../lib/utils';

function formatLabel(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function Features() {
  const { restEndpoint, masterToken, triggerNotification } = useStore();
  const cfg = { restEndpoint, masterToken };
  const qc = useQueryClient();

  // ── Feature flags ─────────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['features', restEndpoint],
    queryFn: () => fetchFeatures(cfg),
    retry: 1,
    staleTime: 60_000,
  });
  const features = data?.features ?? {};
  const entries = Object.entries(features);

  const toggleMut = useMutation({
    mutationFn: ({ feature, enabled }: { feature: string; enabled: boolean }) => toggleFeature(cfg, feature, enabled),
    onMutate: async ({ feature, enabled }) => {
      await qc.cancelQueries({ queryKey: ['features', restEndpoint] });
      const prev = qc.getQueryData<{ features: Record<string, boolean> }>(['features', restEndpoint]);
      qc.setQueryData(['features', restEndpoint], (old: { features: Record<string, boolean> } | undefined) => ({
        features: { ...(old?.features ?? {}), [feature]: enabled },
      }));
      return { prev };
    },
    onError: (err: Error, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['features', restEndpoint], ctx.prev);
      triggerNotification({ title: 'Toggle Failed', message: err?.message || 'Could not update feature.', type: 'warning' });
    },
    onSuccess: (_data, { feature, enabled }) => {
      triggerNotification({ title: 'Feature Updated', message: `${formatLabel(feature)} is now ${enabled ? 'enabled' : 'disabled'}.`, type: 'success' });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['features', restEndpoint] }),
  });

  // ── Rate limits ────────────────────────────────────────────────────────────
  const { data: rlData, isLoading: rlLoading, isError: rlError, refetch: rlRefetch } = useQuery({
    queryKey: ['rate-limits', restEndpoint],
    queryFn: () => fetchRateLimits(cfg),
    retry: 1,
    staleTime: 30_000,
  });
  const limits: RateLimitEntry[] = rlData?.limits ?? [];
  const blockedLimits = limits.filter(l => l.blocked);

  const unblockMut = useMutation({
    mutationFn: (identifier: string) => unblockRateLimit(cfg, identifier),
    onSuccess: (_, identifier) => {
      qc.invalidateQueries({ queryKey: ['rate-limits', restEndpoint] });
      triggerNotification({ title: 'Unblocked', message: `${identifier} unblocked.`, type: 'success' });
    },
    onError: (err: Error) => triggerNotification({ title: 'Unblock Failed', message: err?.message || 'Could not unblock.', type: 'warning' }),
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20">

      {/* ── Feature Flags ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
              <ToggleLeft className="w-8 h-8 mr-3 text-brand-primary" />
              Feature Toggles
            </h1>
            <p className="text-brand-text-muted text-sm font-mono mt-1">SYSTEM-WIDE FEATURE FLAGS</p>
          </div>
          <button aria-label="Refresh feature flags" onClick={() => refetch()} className="p-2.5 bg-brand-elevated border border-brand-border rounded-xl text-brand-text-muted hover:text-brand-text transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-brand-surface/60 border border-brand-border rounded-2xl animate-pulse" />)}
          </div>
        )}
        {isError && (
          <div className="py-10 text-center text-brand-danger font-mono text-sm flex flex-col items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Failed to load feature flags.
            <button onClick={() => refetch()} className="mt-2 px-4 py-1.5 bg-brand-elevated rounded-lg text-xs font-bold">Retry</button>
          </div>
        )}
        {!isLoading && !isError && entries.length === 0 && (
          <div className="py-10 text-center text-brand-text-muted font-mono text-xs uppercase border border-dashed border-brand-border rounded-2xl">
            No feature flags configured.
          </div>
        )}
        {!isLoading && !isError && entries.length > 0 && (
          <div className="bg-brand-surface border border-brand-border rounded-2xl divide-y divide-brand-border">
            {entries.map(([key, enabled], idx) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.03 * idx }}
                className="flex items-center justify-between p-5"
              >
                <div>
                  <h3 className="text-sm font-bold text-brand-text">{formatLabel(key)}</h3>
                  <code className="text-[10px] font-mono text-brand-text-muted">{key}</code>
                </div>
                <button
                  onClick={() => toggleMut.mutate({ feature: key, enabled: !enabled })}
                  className={cn(
                    'relative w-12 h-6 rounded-full transition-colors shrink-0',
                    enabled ? 'bg-brand-success' : 'bg-brand-elevated border border-brand-border',
                  )}
                >
                  <motion.span
                    layout
                    className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow flex items-center justify-center', enabled ? 'left-6' : 'left-0.5')}
                  >
                    {toggleMut.isPending && toggleMut.variables?.feature === key && <Spinner size={12} />}
                  </motion.span>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Rate Limits ───────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-3">
              <ShieldOff className="w-6 h-6 text-brand-warning" />
              Rate Limits
              {blockedLimits.length > 0 && (
                <span className="px-2 py-0.5 bg-brand-danger/20 text-brand-danger text-xs font-bold rounded-full border border-brand-danger/30">
                  {blockedLimits.length} blocked
                </span>
              )}
            </h2>
            <p className="text-brand-text-muted text-sm font-mono mt-1">API RATE LIMIT STATUS & CONTROLS</p>
          </div>
          <button aria-label="Refresh rate limits" onClick={() => rlRefetch()} className="p-2.5 bg-brand-elevated border border-brand-border rounded-xl text-brand-text-muted hover:text-brand-text transition-colors">
            <RefreshCw className={cn('w-4 h-4', rlLoading && 'animate-spin')} />
          </button>
        </div>

        {rlLoading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-brand-surface/60 border border-brand-border rounded-2xl animate-pulse" />)}
          </div>
        )}
        {rlError && !rlLoading && (
          <div className="py-10 text-center text-brand-danger font-mono text-sm flex flex-col items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Failed to load rate limit data.
            <button onClick={() => rlRefetch()} className="mt-2 px-4 py-1.5 bg-brand-elevated rounded-lg text-xs font-bold">Retry</button>
          </div>
        )}
        {!rlLoading && !rlError && limits.length === 0 && (
          <div className="py-10 text-center text-brand-text-muted font-mono text-xs uppercase border border-dashed border-brand-border rounded-2xl">
            No rate limit entries.
          </div>
        )}
        {!rlLoading && !rlError && limits.length > 0 && (
          <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border bg-brand-elevated">
                  <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">Identifier</th>
                  <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">Endpoint</th>
                  <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">Remaining</th>
                  <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">Reset At</th>
                  <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">Status</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {limits.map((l, i) => (
                  <tr key={l.id ?? i} className="border-b border-brand-border/50 hover:bg-brand-elevated/40 transition-colors">
                    <td className="py-3 px-4 text-xs font-mono text-brand-text">{l.identifier ?? '—'}</td>
                    <td className="py-3 px-4 text-xs font-mono text-brand-text-muted">{l.endpoint ?? '—'}</td>
                    <td className="py-3 px-4 text-xs font-mono">
                      <span className={cn(l.remaining === 0 ? 'text-brand-danger font-bold' : 'text-brand-text')}>
                        {l.remaining ?? '—'} / {l.limit ?? '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-brand-text-muted">
                      {l.reset_at ? new Date(l.reset_at).toLocaleTimeString() : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase font-mono',
                        l.blocked ? 'bg-brand-danger/10 border-brand-danger/30 text-brand-danger' : 'bg-brand-success/10 border-brand-success/30 text-brand-success',
                      )}>
                        {l.blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {l.blocked && (
                        <button
                          onClick={() => unblockMut.mutate(String(l.identifier ?? l.id))}
                          disabled={unblockMut.isPending && unblockMut.variables === String(l.identifier ?? l.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-brand-success/10 border border-brand-success/30 text-brand-success rounded-lg text-xs font-bold hover:bg-brand-success/20 transition-colors disabled:opacity-50"
                        >
                          {unblockMut.isPending && unblockMut.variables === String(l.identifier ?? l.id) ? <Spinner size={12} /> : <Unlock className="w-3 h-3" />}
                          Unblock
                        </button>
                      )}
                    </td>
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
