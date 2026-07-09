import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import {
  Link, CheckCircle, XCircle, AlertCircle, Plus, RefreshCw, Trash2, Edit2, X,
  Plug, Server,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { Spinner } from '../components/Spinner';
import {
  fetchSocialAccounts, createSocialAccount, updateSocialAccount,
  deleteSocialAccount, healthCheckSocialAccount,
  fetchIntegrations, fetchSystemConnectors,
  type SocialAccount, type IntegrationEntry,
} from '../lib/api';

const PLATFORMS = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'whatsapp', 'telegram', 'discord', 'slack'];

function PlatformIcon({ platform }: { platform?: string }) {
  const p = (platform || '').toLowerCase();
  const map: Record<string, string> = { facebook: '📘', instagram: '📸', twitter: '🐦', linkedin: '💼', tiktok: '🎵', youtube: '▶️', whatsapp: '💬', telegram: '✈️', discord: '🎮', slack: '💬' };
  return <span className="text-lg">{map[p] ?? '🔗'}</span>;
}

export default function Integrations() {
  const { restEndpoint, masterToken, triggerNotification, selectedWorkspaceId: workspaceId } = useStore();
  const cfg = { restEndpoint, masterToken };
  const qc = useQueryClient();

  // ── System Integrations ────────────────────────────────────────────────────
  const { data: intData, isLoading: intLoading } = useQuery({
    queryKey: ['integrations', restEndpoint],
    queryFn:  () => fetchIntegrations(cfg),
    retry: 1,
    staleTime: 60_000,
  });
  const integrations: IntegrationEntry[] = intData?.integrations ?? [];

  const { data: connData, isLoading: connLoading } = useQuery({
    queryKey: ['system-connectors', restEndpoint],
    queryFn:  () => fetchSystemConnectors(cfg),
    retry: 1,
    staleTime: 60_000,
  });
  const connectors = connData?.connectors ?? [];

  // ── Social Accounts ────────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['social-accounts', restEndpoint, workspaceId],
    queryFn:  () => fetchSocialAccounts(cfg, workspaceId as string | number),
    enabled: !!workspaceId,
    retry: 1,
  });
  const accounts: SocialAccount[] = data?.accounts ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SocialAccount | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<SocialAccount | null>(null);
  const [form, setForm] = useState({ platform: 'facebook', account_name: '', access_token: '' });
  const [healthResults, setHealthResults] = useState<Record<string | number, { ok: boolean; message?: string }>>({});

  const resetForm = () => { setForm({ platform: 'facebook', account_name: '', access_token: '' }); setEditing(null); setShowForm(false); };

  const createMut = useMutation({
    mutationFn: () => createSocialAccount(cfg, workspaceId as string | number, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['social-accounts', restEndpoint, workspaceId] }); triggerNotification({ title: 'Account Connected', message: `${form.platform} account added.`, type: 'success' }); resetForm(); },
    onError: (err: Error) => triggerNotification({ title: 'Connect Failed', message: err?.message || 'Could not connect account.', type: 'warning' }),
  });
  const updateMut = useMutation({
    mutationFn: () => updateSocialAccount(cfg, (editing as SocialAccount).id, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['social-accounts', restEndpoint, workspaceId] }); triggerNotification({ title: 'Account Updated', message: `${form.platform} account saved.`, type: 'success' }); resetForm(); },
    onError: (err: Error) => triggerNotification({ title: 'Update Failed', message: err?.message || 'Could not update account.', type: 'warning' }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string | number) => deleteSocialAccount(cfg, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['social-accounts', restEndpoint, workspaceId] }); triggerNotification({ title: 'Account Removed', message: `${confirmDelete?.platform} account disconnected.`, type: 'info' }); setConfirmDelete(null); },
    onError: (err: Error) => triggerNotification({ title: 'Delete Failed', message: err?.message || 'Could not remove account.', type: 'warning' }),
  });
  const healthMut = useMutation({
    mutationFn: (id: string | number) => healthCheckSocialAccount(cfg, id),
    onSuccess: (res: { ok?: boolean; status?: string; message?: string }, id) => {
      const ok = res?.ok ?? res?.status === 'healthy';
      setHealthResults(prev => ({ ...prev, [id]: { ok, message: res?.message } }));
      triggerNotification({ title: ok ? 'Health OK' : 'Health Failed', message: res?.message || (ok ? 'Account is reachable.' : 'Account unreachable.'), type: ok ? 'success' : 'warning' });
    },
    onError: (err: Error, id) => { setHealthResults(prev => ({ ...prev, [id]: { ok: false, message: err?.message } })); triggerNotification({ title: 'Health Check Failed', message: err?.message || 'Could not check account.', type: 'warning' }); },
  });

  const openEdit = (acc: SocialAccount) => { setEditing(acc); setForm({ platform: acc.platform, account_name: acc.account_name ?? '', access_token: '' }); setShowForm(true); };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.account_name.trim()) { triggerNotification({ title: 'Validation Error', message: 'Account name is required.', type: 'warning' }); return; }
    if (editing) updateMut.mutate(); else createMut.mutate();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20">

      {/* ── System Integrations ──────────────────────────────────────────── */}
      {(integrations.length > 0 || intLoading) && (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-4 flex items-center gap-2">
            <Plug className="w-4 h-4 text-brand-accent" /> System Integrations
          </h2>
          {intLoading ? (
            <div className="flex gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 flex-1 bg-brand-elevated animate-pulse rounded-xl" />)}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {integrations.map((int, i) => (
                <div key={int.id ?? i} className="bg-brand-elevated border border-brand-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('w-2 h-2 rounded-full shrink-0', int.enabled ? 'bg-brand-success' : 'bg-brand-text-muted')} />
                    <div className="text-xs font-bold text-brand-text truncate">{int.name ?? int.type ?? `Integration ${i + 1}`}</div>
                  </div>
                  {int.status && <div className="text-[9px] font-mono text-brand-text-muted">{int.status}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── System Connectors ────────────────────────────────────────────── */}
      {(connectors.length > 0 || connLoading) && (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-brand-primary" /> System Connectors
          </h2>
          {connLoading ? (
            <div className="flex gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 flex-1 bg-brand-elevated animate-pulse rounded-xl" />)}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(connectors as Array<{ name?: string; status?: string; type?: string; version?: string }>).map((c, i) => (
                <div key={i} className="bg-brand-elevated border border-brand-border rounded-xl p-3 flex items-center gap-2">
                  <span className={cn('w-2 h-2 rounded-full shrink-0', (c.status === 'connected' || c.status === 'ok') ? 'bg-brand-success animate-pulse' : 'bg-brand-danger')} />
                  <div>
                    <div className="text-xs font-bold text-brand-text">{c.name ?? c.type ?? `Connector ${i + 1}`}</div>
                    <div className="text-[9px] font-mono text-brand-text-muted">{c.status ?? '—'}{c.version ? ` v${c.version}` : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Social Accounts ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
            <Link className="w-8 h-8 text-brand-primary" /> Social Accounts
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">CONNECTED PLATFORM ACCOUNTS</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="p-2.5 bg-brand-elevated border border-brand-border rounded-xl text-brand-text-muted hover:text-brand-text">
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { resetForm(); setShowForm(v => !v); }}
            disabled={!workspaceId}
            className="px-4 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Connect Account
          </motion.button>
        </div>
      </div>

      {!workspaceId && (
        <div className="py-10 text-center text-brand-text-muted font-mono text-xs uppercase border border-dashed border-brand-border rounded-2xl">
          Select a workspace to manage social accounts.
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit} className="p-5 bg-brand-surface border border-brand-border rounded-2xl space-y-4 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-brand-text">{editing ? 'Edit Account' : 'Connect New Account'}</h3>
              <button type="button" onClick={resetForm}><X className="w-4 h-4 text-brand-text-muted" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Platform</label>
                <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} className="w-full px-3 py-2.5 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary">
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Account Name / Handle</label>
                <input value={form.account_name} onChange={e => setForm(f => ({ ...f, account_name: e.target.value }))} placeholder="@handle" className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary" />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Access Token</label>
                <input type="password" value={form.access_token} onChange={e => setForm(f => ({ ...f, access_token: e.target.value }))} placeholder={editing ? 'Leave blank to keep existing' : 'Paste token…'} className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-brand-surface hover:bg-brand-elevated border border-brand-border text-brand-text-muted rounded-xl text-sm font-semibold">Cancel</button>
              <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-sm font-semibold shadow-glow-primary disabled:opacity-50 flex items-center gap-2">
                {(createMut.isPending || updateMut.isPending) && <Spinner size={16} />}
                {editing ? 'Save Changes' : 'Connect'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {workspaceId && isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-brand-surface/60 border border-brand-border rounded-2xl animate-pulse" />)}
        </div>
      )}
      {workspaceId && isError && (
        <div className="py-12 text-center text-brand-danger font-mono text-sm flex flex-col items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          Failed to load social accounts.
          <button onClick={() => refetch()} className="mt-2 px-4 py-1.5 bg-brand-elevated rounded-lg text-xs font-bold">Retry</button>
        </div>
      )}
      {workspaceId && !isLoading && !isError && accounts.length === 0 && (
        <div className="py-12 text-center text-brand-text-muted font-mono text-xs uppercase border border-dashed border-brand-border rounded-2xl">
          No social accounts connected yet.
        </div>
      )}

      {workspaceId && !isLoading && !isError && accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc, idx) => {
            const health = healthResults[acc.id];
            return (
              <motion.div key={acc.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * idx }}
                className="bg-brand-surface border border-brand-border rounded-2xl p-5 hover:border-brand-primary/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-elevated flex items-center justify-center text-xl border border-brand-border">
                      <PlatformIcon platform={acc.platform} />
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-text text-sm">{acc.account_name ?? acc.platform}</h3>
                      <span className="text-[10px] font-mono text-brand-text-muted capitalize">{acc.platform}</span>
                    </div>
                  </div>
                  {health ? (
                    health.ok ? <CheckCircle className="w-5 h-5 text-brand-success" /> : <XCircle className="w-5 h-5 text-brand-danger" />
                  ) : (
                    <span className={cn('w-2.5 h-2.5 mt-1.5 rounded-full', acc.status === 'active' ? 'bg-brand-success animate-pulse' : 'bg-brand-text-muted')} />
                  )}
                </div>
                {acc.status && <div className="text-[10px] font-mono text-brand-text-muted mb-4 capitalize">{acc.status}</div>}
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => healthMut.mutate(acc.id)} disabled={healthMut.isPending && healthMut.variables === acc.id}
                    className="px-3 py-1.5 bg-brand-elevated border border-brand-border rounded-lg text-[10px] font-bold uppercase hover:border-brand-accent/40 flex items-center gap-1 disabled:opacity-50">
                    {healthMut.isPending && healthMut.variables === acc.id ? <Spinner size={10} /> : <CheckCircle className="w-3 h-3" />}
                    Health
                  </button>
                  <button onClick={() => openEdit(acc)} className="px-3 py-1.5 bg-brand-elevated border border-brand-border rounded-lg text-[10px] font-bold uppercase hover:border-brand-primary/40 flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => setConfirmDelete(acc)} className="ml-auto px-3 py-1.5 bg-brand-danger/10 border border-brand-danger/30 text-brand-danger rounded-lg text-[10px] font-bold uppercase hover:bg-brand-danger/20 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-brand-text mb-2">Disconnect Account?</h3>
            <p className="text-xs text-brand-text-muted mb-5">This will remove the {confirmDelete.platform} account permanently.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 bg-brand-elevated border border-brand-border text-brand-text-muted rounded-xl text-sm font-semibold">Cancel</button>
              <button onClick={() => deleteMut.mutate(confirmDelete.id)} disabled={deleteMut.isPending} className="px-4 py-2 bg-brand-danger text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
                {deleteMut.isPending && <Spinner size={16} />} Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
