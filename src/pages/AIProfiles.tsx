import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bot, Plus, Trash2, Edit2, AlertTriangle, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Spinner } from '../components/Spinner';
import { Skeleton } from '../components/Skeleton';
import { fetchAIProfiles, createAIProfile, updateAIProfile, deleteAIProfile, type AIProfile } from '../lib/api';

export default function AIProfiles() {
  const { restEndpoint, masterToken, triggerNotification, selectedWorkspaceId: workspaceId } = useStore();
  const cfg = { restEndpoint, masterToken };
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['ai-profiles', restEndpoint, workspaceId],
    queryFn: () => fetchAIProfiles(cfg, workspaceId as string | number),
    enabled: !!workspaceId,
    retry: 1,
    staleTime: 60_000,
  });
  const profiles: AIProfile[] = data?.ai_profiles ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AIProfile | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AIProfile | null>(null);
  const [form, setForm] = useState({ name: '', tone: '', expertise: '', complexity: '', emoji_level: '', writing_style: '', system_prompt_override: '' });

  const resetForm = () => { setForm({ name: '', tone: '', expertise: '', complexity: '', emoji_level: '', writing_style: '', system_prompt_override: '' }); setEditing(null); setShowForm(false); };

  const createMut = useMutation({
    mutationFn: () => createAIProfile(cfg, workspaceId as string | number, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-profiles', restEndpoint, workspaceId] });
      triggerNotification({ title: 'Profile Created', message: `"${form.name}" added.`, type: 'success' });
      resetForm();
    },
    onError: (err: any) => triggerNotification({ title: 'Create Failed', message: err?.message || 'Could not create profile.', type: 'warning' }),
  });

  const updateMut = useMutation({
    mutationFn: () => updateAIProfile(cfg, (editing as AIProfile).id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-profiles', restEndpoint, workspaceId] });
      triggerNotification({ title: 'Profile Updated', message: `"${form.name}" saved.`, type: 'success' });
      resetForm();
    },
    onError: (err: any) => triggerNotification({ title: 'Update Failed', message: err?.message || 'Could not update profile.', type: 'warning' }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string | number) => deleteAIProfile(cfg, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-profiles', restEndpoint, workspaceId] });
      triggerNotification({ title: 'Profile Deleted', message: `"${confirmDelete?.name}" removed.`, type: 'info' });
      setConfirmDelete(null);
    },
    onError: (err: any) => triggerNotification({ title: 'Delete Failed', message: err?.message || 'Could not delete profile.', type: 'warning' }),
  });

  const openEdit = (p: AIProfile) => {
    setEditing(p);
    setForm({
      name: p.name,
      tone: p.tone || '',
      expertise: p.expertise || '',
      complexity: p.complexity || '',
      emoji_level: p.emoji_level || '',
      writing_style: p.writing_style || '',
      system_prompt_override: p.system_prompt_override || '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      triggerNotification({ title: 'Validation Error', message: 'Profile name is required.', type: 'warning' });
      return;
    }
    if (editing) updateMut.mutate(); else createMut.mutate();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <Bot className="w-8 h-8 mr-3 text-brand-primary" />
            AI Profiles
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">PER-WORKSPACE AI PERSONA PROFILES</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!workspaceId}
            className="px-4 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center gap-2 disabled:opacity-50"
            onClick={() => { resetForm(); setShowForm(v => !v); }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Profile</span>
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
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-brand-text">{editing ? 'Edit Profile' : 'New AI Profile'}</h3>
              <button type="button" onClick={resetForm}><X className="w-4 h-4 text-brand-text-muted" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary" />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Tone</label>
                <input value={form.tone} onChange={e => setForm(f => ({ ...f, tone: e.target.value }))} placeholder="e.g. Witty, formal" className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary" />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Expertise</label>
                <input value={form.expertise} onChange={e => setForm(f => ({ ...f, expertise: e.target.value }))} placeholder="e.g. Finance, tech" className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary" />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Complexity</label>
                <select value={form.complexity} onChange={e => setForm(f => ({ ...f, complexity: e.target.value }))} className="w-full px-3 py-2.5 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary">
                  <option value="">Select</option>
                  <option value="simple">Simple</option>
                  <option value="moderate">Moderate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Emoji Level</label>
                <select value={form.emoji_level} onChange={e => setForm(f => ({ ...f, emoji_level: e.target.value }))} className="w-full px-3 py-2.5 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary">
                  <option value="">Select</option>
                  <option value="none">None</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Writing Style</label>
                <input value={form.writing_style} onChange={e => setForm(f => ({ ...f, writing_style: e.target.value }))} placeholder="e.g. Concise, storytelling" className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">System Prompt Override (optional)</label>
                <textarea rows={3} value={form.system_prompt_override} onChange={e => setForm(f => ({ ...f, system_prompt_override: e.target.value }))} className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="px-4 py-2 bg-brand-surface hover:bg-brand-elevated border border-brand-border text-brand-text-muted rounded-xl text-sm font-semibold" onClick={resetForm}>Cancel</button>
              <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-sm font-semibold shadow-glow-primary disabled:opacity-50 flex items-center gap-2">
                {(createMut.isPending || updateMut.isPending) && <Spinner size={14} />}
                {editing ? 'Save Changes' : 'Create Profile'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {!workspaceId && (
        <div className="py-16 text-center text-brand-text-muted font-mono text-xs uppercase border border-dashed border-brand-border rounded-2xl">
          Create a workspace first to manage AI profiles.
        </div>
      )}

      {workspaceId && isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      )}

      {workspaceId && isError && (
        <div className="py-16 text-center text-brand-danger font-mono text-sm flex flex-col items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          Failed to load AI profiles.
          <button onClick={() => refetch()} className="mt-2 px-4 py-1.5 bg-brand-elevated rounded-lg text-xs font-bold">Retry</button>
        </div>
      )}

      {workspaceId && !isLoading && !isError && profiles.length === 0 && (
        <div className="py-16 text-center text-brand-text-muted font-mono text-xs uppercase border border-dashed border-brand-border rounded-2xl">
          No AI profiles in this workspace yet.
        </div>
      )}

      {workspaceId && !isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="bg-brand-surface border border-brand-border rounded-2xl p-5 hover:border-brand-primary/30 transition-all"
            >
              <h3 className="font-bold text-brand-text text-sm mb-3">{p.name}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {p.tone && <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-brand-elevated text-brand-text-muted">{p.tone}</span>}
                {p.expertise && <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-brand-elevated text-brand-text-muted">{p.expertise}</span>}
                {p.complexity && <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-brand-elevated text-brand-text-muted">{p.complexity}</span>}
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-brand-elevated rounded text-brand-text-muted hover:text-brand-text transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setConfirmDelete(p)} className="p-1.5 hover:bg-brand-danger/20 rounded text-brand-text-muted hover:text-brand-danger transition-colors">
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
            <h3 className="text-sm font-bold text-brand-text mb-2">Delete AI Profile?</h3>
            <p className="text-xs text-brand-text-muted mb-5">This will permanently remove "{confirmDelete.name}".</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 bg-brand-elevated border border-brand-border text-brand-text-muted rounded-xl text-sm font-semibold">Cancel</button>
              <button onClick={() => deleteMut.mutate(confirmDelete.id)} disabled={deleteMut.isPending} className="px-4 py-2 bg-brand-danger text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
                {deleteMut.isPending && <Spinner size={14} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
