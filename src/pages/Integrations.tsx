import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import {
  Link, CheckCircle, XCircle, AlertCircle, Plus, RefreshCw, Trash2, Edit2, X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { Spinner } from '../components/Spinner';
import { Skeleton } from '../components/Skeleton';
import { fetchSocialAccounts, createSocialAccount, updateSocialAccount, deleteSocialAccount, healthCheckSocialAccount, type SocialAccount } from '../lib/api';

const PLATFORMS = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'whatsapp', 'telegram', 'discord', 'slack'];

export default function Integrations() {
  const { restEndpoint, masterToken, triggerNotification, selectedWorkspaceId: workspaceId } = useStore();
  const cfg = { restEndpoint, masterToken };
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['social-accounts', restEndpoint, workspaceId],
    queryFn: () => fetchSocialAccounts(cfg, workspaceId as string | number),
    enabled: !!workspaceId,
    retry: 1,
  });
  const accounts: SocialAccount[] = data?.accounts ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SocialAccount | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<SocialAccount | null>(null);
  const [form, setForm] = useState({ platform: 'facebook', account_name: '', access_token: '' });

  const resetForm = () => { setForm({ platform: 'facebook', account_name: '', access_token: '' }); setEditing(null); setShowForm(false); };

  const createMut = useMutation({
    mutationFn: () => createSocialAccount(cfg, workspaceId as string | number, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social-accounts', restEndpoint, workspaceId] });
      triggerNotification({ title: 'Account Connected', message: `${form.platform} account added.`, type: 'success' });
      resetForm();
    },
    onError: (err: any) => triggerNotification({ title: 'Connect Failed', message: err?.message || 'Could not connect account.', type: 'warning' }),
  });

  const updateMut = useMutation({
    mutationFn: () => updateSocialAccount(cfg, (editing as SocialAccount).id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social-accounts', restEndpoint, workspaceId] });
      triggerNotification({ title: 'Account Updated', message: `${form.platform} account saved.`, type: 'success' });
      resetForm();
    },
    onError: (err: any) => triggerNotification({ title: 'Update Failed', message: err?.message || 'Could not update account.', type: 'warning' }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string | number) => deleteSocialAccount(cfg, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social-accounts', restEndpoint, workspaceId] });
      triggerNotification({ title: 'Account Removed', message: `${confirmDelete?.platform} account disconnected.`, type: 'info' });
      setConfirmDelete(null);
    },
    onError: (err: any) => triggerNotification({ title: 'Delete Failed', message: err?.message || 'Could not remove account.', type: 'warning' }),
  });

  const healthMut = useMutation({
    mutationFn: (id: string | number) => healthCheckSocialAccount(cfg, id),
    onSuccess: (res, id) => {
      qc.invalidateQueries({ queryKey: ['social-accounts', restEndpoint, workspaceId] });
      triggerNotification({ title: 'Health Check', message: res.message || (res.healthy ? 'Connection healthy.' : 'Connection issue detected.'), type: res.healthy ? 'success' : 'warning' });
    },
    onError: (err: any) => triggerNotification({ title: 'Health Check Failed', message: err?.message || 'Could not check connection.', type: 'warning' }),
  });

  const openEdit = (a: SocialAccount) => {
    setEditing(a);
    setForm({ platform: a.platform, account_name: a.account_name || '', access_token: '' });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.account_name.trim()) {
      triggerNotification({ title: 'Validation Error', message: 'Account name is required.', type: 'warning' });
      return;
    }
    if (editing) updateMut.mutate(); else createMut.mutate();
  };

  const connectedCount = accounts.filter(a => a.status === 'connected' || a.health === 'healthy').length;
  const degradedCount = accounts.filter(a => a.health === 'degraded').length;
  const offlineCount = accounts.filter(a => a.status === 'offline' || a.health === 'unhealthy').length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <Link className="w-8 h-8 mr-3 text-brand-primary" />
            Integration Center
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">CONNECTED SOCIAL ACCOUNTS</p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="flex items-center text-xs font-mono bg-brand-surface border border-brand-border px-3 py-1.5 rounded-full text-brand-text">
              <CheckCircle className="w-3.5 h-3.5 text-brand-success mr-1.5" />
              <span>{connectedCount} Connected</span>
            </div>
            {degradedCount > 0 && (
              <div className="flex items-center text-xs font-mono bg-brand-surface border border-brand-border px-3 py-1.5 rounded-full text-brand-text">
                <AlertCircle className="w-3.5 h-3.5 text-brand-warning mr-1.5" />
                <span>{degradedCount} Degraded</span>
              </div>
            )}
            {offlineCount > 0 && (
              <div className="flex items-center text-xs font-mono bg-brand-surface border border-brand-border px-3 py-1.5 rounded-full text-brand-text">
                <XCircle className="w-3.5 h-3.5 text-brand-danger mr-1.5" />
                <span>{offlineCount} Offline</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!workspaceId}
            className="bg-brand-primary text-white shadow-glow-primary px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
            onClick={() => { resetForm(); setShowForm(v => !v); }}
          >
            <Plus className="w-4 h-4" />
            Connect Account
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="p-5 bg-brand-surface border border-brand-border rounded-2xl space-y-4 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-brand-text">{editing ? 'Edit Account' : 'Connect New Account'}</h3>
              <button type="button" onClick={resetForm}><X className="w-4 h-4 text-brand-text-muted" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Platform</label>
                <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} className="w-full px-3 py-2.5 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary capitalize">
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Account Name</label>
                <input value={form.account_name} onChange={e => setForm(f => ({ ...f, account_name: e.target.value }))} className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary" />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Access Token</label>
                <input type="password" value={form.access_token} onChange={e => setForm(f => ({ ...f, access_token: e.target.value }))} placeholder={editing ? 'Leave blank to keep' : ''} className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="px-4 py-2 bg-brand-surface hover:bg-brand-elevated border border-brand-border text-brand-text-muted rounded-xl text-sm font-semibold" onClick={resetForm}>Cancel</button>
              <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-sm font-semibold shadow-glow-primary disabled:opacity-50 flex items-center gap-2">
                {(createMut.isPending || updateMut.isPending) && <Spinner size={14} />}
                {editing ? 'Save Changes' : 'Connect'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {!workspaceId && (
        <div className="py-16 text-center text-brand-text-muted font-mono text-xs uppercase border border-dashed border-brand-border rounded-2xl">
          Create a workspace first to connect accounts.
        </div>
      )}

      {workspaceId && isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      )}

      {workspaceId && isError && (
        <div className="py-16 text-center text-brand-danger font-mono text-sm flex flex-col items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          Failed to load connected accounts.
          <button onClick={() => refetch()} className="mt-2 px-4 py-1.5 bg-brand-elevated rounded-lg text-xs font-bold">Retry</button>
        </div>
      )}

      {workspaceId && !isLoading && !isError && accounts.length === 0 && (
        <div className="py-16 text-center text-brand-text-muted font-mono text-xs uppercase border border-dashed border-brand-border rounded-2xl">
          No accounts connected yet.
        </div>
      )}

      {workspaceId && !isLoading && !isError && accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {accounts.map((a, idx) => {
            const healthy = a.health === 'healthy' || a.status === 'connected';
            const degraded = a.health === 'degraded';
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.04 * idx }}
                className="bg-brand-surface border border-brand-border rounded-2xl p-5 hover:border-brand-primary/30 transition-all flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-brand-text capitalize leading-tight">{a.platform}</h3>
                    <span className="text-[10px] uppercase tracking-wider font-mono text-brand-text-muted">{a.account_name || 'Unnamed'}</span>
                  </div>
                  <div title={a.health || a.status || ''}>
                    {healthy && <CheckCircle className="w-5 h-5 text-brand-success" />}
                    {degraded && <AlertCircle className="w-5 h-5 text-brand-warning" />}
                    {!healthy && !degraded && <XCircle className="w-5 h-5 text-brand-danger" />}
                  </div>
                </div>
                <div className="bg-brand-bg rounded-lg p-2 border border-brand-border mb-4">
                  <span className="block text-[10px] text-brand-text-muted font-mono mb-1">LAST CHECKED</span>
                  <span className="text-xs font-bold text-brand-text font-mono truncate block">{a.last_checked || 'Never'}</span>
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <button
                    disabled={healthMut.isPending && healthMut.variables === a.id}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 border border-brand-primary/20 disabled:opacity-50"
                    onClick={() => healthMut.mutate(a.id)}
                  >
                    {healthMut.isPending && healthMut.variables === a.id ? <Spinner size={14} /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>Check</span>
                  </button>
                  <button
                    className="py-2 px-3 rounded-lg bg-brand-bg border border-brand-border text-brand-text-muted hover:text-brand-text hover:border-brand-text-muted transition-colors flex items-center justify-center"
                    onClick={() => openEdit(a)}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="py-2 px-3 rounded-lg bg-brand-bg border border-brand-border text-brand-text-muted hover:text-brand-danger hover:border-brand-danger/30 transition-colors flex items-center justify-center"
                    onClick={() => setConfirmDelete(a)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
            <p className="text-xs text-brand-text-muted mb-5 capitalize">This will disconnect the {confirmDelete.platform} account "{confirmDelete.account_name}".</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 bg-brand-elevated border border-brand-border text-brand-text-muted rounded-xl text-sm font-semibold">Cancel</button>
              <button onClick={() => deleteMut.mutate(confirmDelete.id)} disabled={deleteMut.isPending} className="px-4 py-2 bg-brand-danger text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
                {deleteMut.isPending && <Spinner size={14} />}
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
