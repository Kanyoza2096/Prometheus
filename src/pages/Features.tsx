import React from 'react';
import { motion } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ToggleLeft, Loader2, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { fetchFeatures, toggleFeature } from '../lib/api';
import { cn } from '../lib/utils';

function formatLabel(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function Features() {
  const { restEndpoint, masterToken, triggerNotification } = useStore();
  const cfg = { restEndpoint, masterToken };
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['features', restEndpoint],
    queryFn: () => fetchFeatures(cfg),
    retry: 1,
  });

  const features = data?.features ?? {};
  const entries = Object.entries(features);

  const toggleMut = useMutation({
    mutationFn: ({ feature, enabled }: { feature: string; enabled: boolean }) => toggleFeature(cfg, feature, enabled),
    onMutate: async ({ feature, enabled }) => {
      await qc.cancelQueries({ queryKey: ['features', restEndpoint] });
      const prev = qc.getQueryData<{ features: Record<string, boolean> }>(['features', restEndpoint]);
      qc.setQueryData(['features', restEndpoint], (old: any) => ({ features: { ...(old?.features ?? {}), [feature]: enabled } }));
      return { prev };
    },
    onError: (err: any, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['features', restEndpoint], ctx.prev);
      triggerNotification({ title: 'Toggle Failed', message: err?.message || 'Could not update feature.', type: 'warning' });
    },
    onSuccess: (_data, { feature, enabled }) => {
      triggerNotification({ title: 'Feature Updated', message: `${formatLabel(feature)} is now ${enabled ? 'enabled' : 'disabled'}.`, type: 'success' });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['features', restEndpoint] }),
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
          <ToggleLeft className="w-8 h-8 mr-3 text-brand-primary" />
          Feature Toggles
        </h1>
        <p className="text-brand-text-muted text-sm font-mono mt-1">SYSTEM-WIDE FEATURE FLAGS</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-brand-surface/60 border border-brand-border rounded-2xl animate-pulse" />)}
        </div>
      )}

      {isError && (
        <div className="py-16 text-center text-brand-danger font-mono text-sm flex flex-col items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          Failed to load feature flags.
          <button onClick={() => refetch()} className="mt-2 px-4 py-1.5 bg-brand-elevated rounded-lg text-xs font-bold">Retry</button>
        </div>
      )}

      {!isLoading && !isError && entries.length === 0 && (
        <div className="py-16 text-center text-brand-text-muted font-mono text-xs uppercase border border-dashed border-brand-border rounded-2xl">
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
                  enabled ? 'bg-brand-success' : 'bg-brand-elevated border border-brand-border'
                )}
              >
                <motion.span
                  layout
                  className={cn(
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow flex items-center justify-center',
                    enabled ? 'left-6' : 'left-0.5'
                  )}
                >
                  {toggleMut.isPending && toggleMut.variables?.feature === key && (
                    <Loader2 className="w-3 h-3 animate-spin text-brand-text-muted" />
                  )}
                </motion.span>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
