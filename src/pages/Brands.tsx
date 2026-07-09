import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Palette, Plus, Trash2, Edit2, Loader2, AlertTriangle, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { fetchWorkspaces, fetchBrands, createBrand, updateBrand, deleteBrand, type Brand, type Workspace } from '../lib/api';

export default function Brands() {
  const { restEndpoint, masterToken, triggerNotification } = useStore();
  const cfg = { restEndpoint, masterToken };
  const qc = useQueryClient();

  const { data: wsData } = useQuery({
    queryKey: ['workspaces', restEndpoint],
    queryFn: () => fetchWorkspaces(cfg),
    retry: 1,
  });
  const workspaces: Workspace[] = wsData?.workspaces ?? [];
  const [workspaceId, setWorkspaceId] = useState<string | number | null>(null);

  useEffect(() => {
    if (!workspaceId && workspaces.length > 0) setWorkspaceId(workspaces[0].id);
  }, [workspaces, workspaceId]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['brands', restEndpoint, workspaceId],
    queryFn: () => fetchBrands(cfg, workspaceId as string | number),
    enabled: !!workspaceId,
    retry: 1,
  });
  const brands: Brand[] = data?.brands ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Brand | null>(null);
  const [form, setForm] = useState({ name: '', tone: '', hashtags: '', language: '', audience: '' });

  const resetForm = () => { setForm({ name: '', tone: '', hashtags: '', language: '', audience: '' }); setEditing(null); setShowForm(false); };

  const createMut = useMutation({
    mutationFn: () => createBrand(cfg, workspaceId as string | number, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brands', restEndpoint, workspaceId] });
      triggerNotification({ title: 'Brand Created', message: `"${form.name}" added.`, type: 'success' });
      resetForm();
    },
    onError: (err: any) => triggerNotification({ title: 'Create Failed', message: err?.message || 'Could not create brand.', type: 'warning' }),
  });

  const updateMut = useMutation({
    mutationFn: () => updateBrand(cfg, (editing as Brand).id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brands', restEndpoint, workspaceId] });
      triggerNotification({ title: 'Brand Updated', message: `"${form.name}" saved.`, type: 'success' });
      resetForm();
    },
    onError: (err: any) => triggerNotification({ title: 'Update Failed', message: err?.message || 'Could not update brand.', type: 'warning' }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string | number) => deleteBrand(cfg, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brands', restEndpoint, workspaceId] });
      triggerNotification({ title: 'Brand Deleted', message: `"${confirmDelete?.name}" removed.`, type: 'info' });
      setConfirmDelete(null);
    },
    onError: (err: any) => triggerNotification({ title: 'Delete Failed', message: err?.message || 'Could not delete brand.', type: 'warning' }),
  });

  const openEdit = (b: Brand) => {
    setEditing(b);
    setForm({ name: b.name, tone: b.tone || '', hashtags: b.hashtags || '', language: b.language || '', audience: b.audience || '' });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      triggerNotification({ title: 'Validation Error', message: 'Brand name is required.', type: 'warning' });
      return;
    }
    if (editing) updateMut.mutate(); else createMut.mutate();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <Palette className="w-8 h-8 mr-3 text-brand-primary" />
            Brands
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">BRAND VOICE & IDENTITY PROFILES</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={workspaceId ?? ''}
            onChange={e => setWorkspaceId(e.target.value)}
            className="px-3 py-2 bg-brand-surface border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary"
          >
            {workspaces.length === 0 && <option value="">No workspaces</option>}
            {workspaces.map(ws => <option key={ws.id} value={ws.id}>{ws.name}</option>)}
          </select>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!workspaceId}
            className="px-4 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center gap-2 disabled:opacity-50"
            onClick={() => { resetForm(); setShowForm(v => !v); }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Brand</span>
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
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-brand-text">{editing ? 'Edit Brand' : 'New Brand'}</h3>
              <button type="button" onClick={resetForm}><X className="w-4 h-4 text-brand-text-muted" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary" />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Tone</label>
                <input value={form.tone} onChange={e => setForm(f => ({ ...f, tone: e.target.value }))} placeholder="e.g. Bold, friendly" className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary" />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Language</label>
                <input value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} placeholder="e.g. English" className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary" />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Audience</label>
                <input value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))} placeholder="e.g. Young professionals" className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Default Hashtags</label>
                <input value={form.hashtags} onChange={e => setForm(f => ({ ...f, hashtags: e.target.value }))} placeholder="#brand #marketing" className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="px-4 py-2 bg-brand-surface hover:bg-brand-elevated border border-brand-border text-brand-text-muted rounded-xl text-sm font-semibold" onClick={resetForm}>Cancel</button>
              <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-sm font-semibold shadow-glow-primary disabled:opacity-50 flex items-center gap-2">
                {(createMut.isPending || updateMut.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? 'Save Changes' : 'Create Brand'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {!workspaceId && (
        <div className="py-16 text-center text-brand-text-muted font-mono text-xs uppercase border border-dashed border-brand-border rounded-2xl">
          Create a workspace first to manage brands.
        </div>
      )}

      {workspaceId && isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-brand-surface/60 border border-brand-border rounded-2xl animate-pulse" />)}
        </div>
      )}

      {workspaceId && isError && (
        <div className="py-16 text-center text-brand-danger font-mono text-sm flex flex-col items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          Failed to load brands.
          <button onClick={() => refetch()} className="mt-2 px-4 py-1.5 bg-brand-elevated rounded-lg text-xs font-bold">Retry</button>
        </div>
      )}

      {workspaceId && !isLoading && !isError && brands.length === 0 && (
        <div className="py-16 text-center text-brand-text-muted font-mono text-xs uppercase border border-dashed border-brand-border rounded-2xl">
          No brands in this workspace yet.
        </div>
      )}

      {workspaceId && !isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((b, idx) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="bg-brand-surface border border-brand-border rounded-2xl p-5 hover:border-brand-primary/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-brand-text text-sm">{b.name}</h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {b.tone && <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-brand-elevated text-brand-text-muted">{b.tone}</span>}
                {b.language && <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-brand-elevated text-brand-text-muted">{b.language}</span>}
              </div>
              {b.audience && <p className="text-xs text-brand-text-muted mb-4">Audience: {b.audience}</p>}
              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button onClick={() => openEdit(b)} className="p-1.5 hover:bg-brand-elevated rounded text-brand-text-muted hover:text-brand-text transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setConfirmDelete(b)} className="p-1.5 hover:bg-brand-danger/20 rounded text-brand-text-muted hover:text-brand-danger transition-colors">
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
            <h3 className="text-sm font-bold text-brand-text mb-2">Delete Brand?</h3>
            <p className="text-xs text-brand-text-muted mb-5">This will permanently remove "{confirmDelete.name}" and its knowledge base documents.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 bg-brand-elevated border border-brand-border text-brand-text-muted rounded-xl text-sm font-semibold">Cancel</button>
              <button onClick={() => deleteMut.mutate(confirmDelete.id)} disabled={deleteMut.isPending} className="px-4 py-2 bg-brand-danger text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
                {deleteMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
