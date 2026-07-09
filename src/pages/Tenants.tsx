import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Users, Trash2, Edit2, AlertTriangle, X } from 'lucide-react';
import { Spinner } from '../components/Spinner';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { fetchWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace, type Workspace } from '../lib/api';

const PLANS = ['free', 'pro', 'business'];

export default function Tenants() {
  const { restEndpoint, masterToken, triggerNotification } = useStore();
  const cfg = { restEndpoint, masterToken };
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['workspaces', restEndpoint],
    queryFn: () => fetchWorkspaces(cfg),
    retry: 1,
  });
  const workspaces: Workspace[] = data?.workspaces ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Workspace | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Workspace | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [plan, setPlan] = useState('free');
  const [ownerEmail, setOwnerEmail] = useState('');

  const resetForm = () => { setName(''); setSlug(''); setPlan('free'); setOwnerEmail(''); setEditing(null); setShowForm(false); };

  const createMut = useMutation({
    mutationFn: () => createWorkspace(cfg, { name: name.trim(), slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, '-'), plan, owner_email: ownerEmail.trim() || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspaces', restEndpoint] });
      triggerNotification({ title: 'Workspace Created', message: `"${name}" provisioned successfully.`, type: 'success' });
      resetForm();
    },
    onError: (err: any) => triggerNotification({ title: 'Create Failed', message: err?.message || 'Could not create workspace.', type: 'warning' }),
  });

  const updateMut = useMutation({
    mutationFn: () => updateWorkspace(cfg, (editing as Workspace).id, { name: name.trim(), plan, owner_email: ownerEmail.trim() || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspaces', restEndpoint] });
      triggerNotification({ title: 'Workspace Updated', message: `"${name}" saved.`, type: 'success' });
      resetForm();
    },
    onError: (err: any) => triggerNotification({ title: 'Update Failed', message: err?.message || 'Could not update workspace.', type: 'warning' }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string | number) => deleteWorkspace(cfg, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspaces', restEndpoint] });
      triggerNotification({ title: 'Workspace Deleted', message: `"${confirmDelete?.name}" removed.`, type: 'info' });
      setConfirmDelete(null);
    },
    onError: (err: any) => triggerNotification({ title: 'Delete Failed', message: err?.message || 'Could not delete workspace.', type: 'warning' }),
  });

  const openEdit = (ws: Workspace) => {
    setEditing(ws);
    setName(ws.name);
    setSlug(ws.slug);
    setPlan(ws.plan);
    setOwnerEmail(ws.owner_email || '');
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      triggerNotification({ title: 'Validation Error', message: 'Workspace name is required.', type: 'warning' });
      return;
    }
    if (editing) updateMut.mutate(); else createMut.mutate();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <Building2 className="w-8 h-8 mr-3 text-brand-primary" />
            Workspaces
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">MULTI-TENANT WORKSPACE MANAGEMENT</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center gap-2 flex-shrink-0"
          onClick={() => { resetForm(); setShowForm(v => !v); }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Workspace</span>
        </motion.button>
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
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-brand-text">
                {editing ? 'Edit Workspace' : 'Register New Workspace'}
              </h3>
              <button type="button" onClick={resetForm}><X className="w-4 h-4 text-brand-text-muted" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary" />
              </div>
              {!editing && (
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Slug (optional)</label>
                  <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="auto-generated" className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary" />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Plan</label>
                <select value={plan} onChange={e => setPlan(e.target.value)} className="w-full px-3 py-2.5 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary">
                  {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Owner Email</label>
                <input value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} placeholder="admin@example.com" className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="px-4 py-2 bg-brand-surface hover:bg-brand-elevated border border-brand-border text-brand-text-muted rounded-xl text-sm font-semibold transition-colors" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-sm font-semibold shadow-glow-primary transition-colors disabled:opacity-50 flex items-center gap-2">
                {(createMut.isPending || updateMut.isPending) && <Spinner size={16} />}
                {editing ? 'Save Changes' : 'Register'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-brand-surface/60 border border-brand-border rounded-2xl animate-pulse" />)}
        </div>
      )}

      {isError && (
        <div className="py-16 text-center text-brand-danger font-mono text-sm flex flex-col items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          Failed to load workspaces.
          <button onClick={() => refetch()} className="mt-2 px-4 py-1.5 bg-brand-elevated rounded-lg text-xs font-bold">Retry</button>
        </div>
      )}

      {!isLoading && !isError && workspaces.length === 0 && (
        <div className="py-16 text-center text-brand-text-muted font-mono text-xs uppercase border border-dashed border-brand-border rounded-2xl">
          No workspaces yet — create one to get started.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((ws, idx) => (
            <motion.div
              key={ws.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="bg-brand-surface border border-brand-border rounded-2xl p-5 relative overflow-hidden hover:border-brand-primary/30 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-brand-primary/80">
                    {ws.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-text text-sm leading-snug">{ws.name}</h3>
                    <span className="text-[10px] font-mono uppercase bg-brand-elevated border border-brand-border px-1.5 py-0.5 rounded text-brand-text-muted">
                      {ws.plan}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 py-3 border-y border-brand-border/40 my-4 text-center">
                <div>
                  <p className="text-[9px] text-brand-text-muted font-mono uppercase mb-0.5">MEMBERS</p>
                  <p className="text-sm font-bold text-brand-text flex items-center justify-center gap-1"><Users className="w-3 h-3" />{ws.member_count ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-brand-text-muted font-mono uppercase mb-0.5">SLUG</p>
                  <p className="text-sm font-bold text-brand-text truncate">{ws.slug}</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button onClick={() => openEdit(ws)} className="p-1.5 hover:bg-brand-elevated rounded text-brand-text-muted hover:text-brand-text transition-colors border border-transparent hover:border-brand-border">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setConfirmDelete(ws)} className="p-1.5 hover:bg-brand-danger/20 rounded text-brand-text-muted hover:text-brand-danger transition-colors border border-transparent">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-brand-text mb-2">Delete Workspace?</h3>
            <p className="text-xs text-brand-text-muted mb-5">
              This will permanently remove "{confirmDelete.name}" and all associated brands, accounts, and data.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 bg-brand-elevated border border-brand-border text-brand-text-muted rounded-xl text-sm font-semibold">Cancel</button>
              <button onClick={() => deleteMut.mutate(confirmDelete.id)} disabled={deleteMut.isPending} className="px-4 py-2 bg-brand-danger text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
                {deleteMut.isPending && <Spinner size={16} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
