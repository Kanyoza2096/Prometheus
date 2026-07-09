import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Key, Plus, Copy, Trash2, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { fetchApiKeys, generateApiKeyLabeled, revokeApiKey, type ApiKeyEntry } from '../lib/api';

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function APIManager() {
  const { restEndpoint, masterToken, triggerNotification } = useStore();
  const cfg = { restEndpoint, masterToken };
  const qc = useQueryClient();

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [showNewForm, setShowNewForm] = useState(false);
  const [label, setLabel] = useState('');
  const [confirmRevoke, setConfirmRevoke] = useState<ApiKeyEntry | null>(null);
  const [freshKey, setFreshKey] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['api-keys', restEndpoint],
    queryFn: () => fetchApiKeys(cfg),
    retry: 1,
  });

  const keys: ApiKeyEntry[] = data?.keys ?? [];

  const genMut = useMutation({
    mutationFn: (l: string) => generateApiKeyLabeled(cfg, l),
    onSuccess: (res: any) => {
      const newKey = res?.api_key || res?.key || res?.token;
      if (newKey) setFreshKey(newKey);
      setLabel('');
      setShowNewForm(false);
      qc.invalidateQueries({ queryKey: ['api-keys', restEndpoint] });
      triggerNotification({ title: 'API Key Generated', message: 'New key created successfully.', type: 'success' });
    },
    onError: (err: any) => triggerNotification({ title: 'Generation Failed', message: err?.message || 'Could not generate key.', type: 'warning' }),
  });

  const revokeMut = useMutation({
    mutationFn: (id: string | number) => revokeApiKey(cfg, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['api-keys', restEndpoint] });
      triggerNotification({ title: 'Key Revoked', message: `"${confirmRevoke?.label}" has been deactivated.`, type: 'info' });
      setConfirmRevoke(null);
    },
    onError: (err: any) => triggerNotification({ title: 'Revoke Failed', message: err?.message || 'Could not revoke key.', type: 'warning' }),
  });

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    triggerNotification({ title: 'Copied', message: 'Key copied to clipboard.', type: 'info' });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20 md:pb-0">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <Key className="w-8 h-8 mr-3 text-brand-primary" />
            API Manager
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">API KEY MANAGEMENT</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center space-x-2"
          onClick={() => setShowNewForm(v => !v)}
        >
          <Plus className="w-4 h-4" />
          <span>Generate Key</span>
        </motion.button>
      </motion.div>

      {freshKey && (
        <div className="p-4 bg-brand-success/10 border border-brand-success/30 rounded-xl flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold text-brand-success uppercase mb-1">New key — copy it now, it won't be shown again</p>
            <code className="text-xs font-mono text-brand-text break-all">{freshKey}</code>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => handleCopy(freshKey)} className="px-3 py-2 bg-brand-elevated rounded-lg text-brand-text hover:bg-brand-border/30 transition-colors">
              <Copy className="w-4 h-4" />
            </button>
            <button onClick={() => setFreshKey(null)} className="px-3 py-2 text-xs font-bold text-brand-text-muted hover:text-brand-text">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {showNewForm && (
        <form
          onSubmit={e => { e.preventDefault(); if (label.trim()) genMut.mutate(label.trim()); }}
          className="p-5 bg-brand-surface border border-brand-border rounded-2xl flex flex-col md:flex-row gap-4 md:items-end"
        >
          <div className="flex-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Key Label</label>
            <input
              autoFocus
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. Production Server"
              className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary"
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowNewForm(false)} className="px-4 py-2 bg-brand-elevated border border-brand-border text-brand-text-muted rounded-xl text-sm font-semibold">
              Cancel
            </button>
            <button
              type="submit"
              disabled={genMut.isPending || !label.trim()}
              className="px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-semibold shadow-glow-primary disabled:opacity-50 flex items-center gap-2"
            >
              {genMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Generate
            </button>
          </div>
        </form>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-brand-surface border border-brand-border rounded-2xl p-6"
      >
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-4">API Keys</h2>

        {isLoading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-brand-elevated/60 rounded-xl animate-pulse" />)}
          </div>
        )}

        {isError && (
          <div className="py-10 text-center text-brand-danger font-mono text-sm flex flex-col items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Failed to load API keys.
            <button onClick={() => refetch()} className="mt-2 px-4 py-1.5 bg-brand-elevated rounded-lg text-xs font-bold">Retry</button>
          </div>
        )}

        {!isLoading && !isError && keys.length === 0 && (
          <div className="py-10 text-center text-brand-text-muted font-mono text-xs uppercase">
            No API keys yet — generate one to get started.
          </div>
        )}

        <div className="space-y-3">
          {!isLoading && !isError && keys.map((apiKey, idx) => (
            <motion.div
              key={apiKey.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="p-4 bg-brand-elevated rounded-xl border border-brand-border hover:border-brand-primary/30 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-brand-text">{apiKey.label}</h3>
                  <div className="flex items-center gap-4 text-xs text-brand-text-muted font-mono mt-1">
                    {apiKey.created_at && <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>}
                    <span>Last used: {apiKey.last_used || 'Never'}</span>
                  </div>
                </div>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                  apiKey.status !== 'revoked'
                    ? 'bg-brand-success/20 text-brand-success'
                    : 'bg-brand-text-muted/20 text-brand-text-muted'
                )}>
                  {apiKey.status || 'active'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-brand-surface rounded-lg text-xs font-mono text-brand-text border border-brand-border">
                  {showKeys[String(apiKey.id)] ? (apiKey.prefix || apiKey.id) : '•'.repeat(12)}
                </code>
                <button
                  onClick={() => setShowKeys(prev => ({ ...prev, [String(apiKey.id)]: !prev[String(apiKey.id)] }))}
                  className="px-3 py-2 bg-brand-surface rounded-lg text-brand-text hover:bg-brand-border/30 transition-colors border border-brand-border"
                >
                  {showKeys[String(apiKey.id)] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setConfirmRevoke(apiKey)}
                  className="px-3 py-2 bg-brand-danger/10 rounded-lg text-brand-danger hover:bg-brand-danger/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {confirmRevoke && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setConfirmRevoke(null)}>
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-brand-text mb-2">Revoke API Key?</h3>
            <p className="text-xs text-brand-text-muted mb-5">
              This will permanently deactivate "{confirmRevoke.label}". Any integrations using it will stop working immediately.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmRevoke(null)} className="px-4 py-2 bg-brand-elevated border border-brand-border text-brand-text-muted rounded-xl text-sm font-semibold">
                Cancel
              </button>
              <button
                onClick={() => revokeMut.mutate(confirmRevoke.id)}
                disabled={revokeMut.isPending}
                className="px-4 py-2 bg-brand-danger text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                {revokeMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
