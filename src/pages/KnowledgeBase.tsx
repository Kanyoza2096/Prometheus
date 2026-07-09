import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Search, Plus, FileText, Trash2, Loader2, AlertTriangle, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { fetchWorkspaces, fetchBrands, fetchKnowledgeDocs, createKnowledgeDoc, deleteKnowledgeDoc, searchKnowledge, type Workspace, type Brand, type KnowledgeDoc } from '../lib/api';

const DOC_TYPES = ['fact', 'faq', 'policy', 'product', 'general'];

export default function KnowledgeBase() {
  const { restEndpoint, masterToken, triggerNotification } = useStore();
  const cfg = { restEndpoint, masterToken };
  const qc = useQueryClient();

  const { data: wsData } = useQuery({ queryKey: ['workspaces', restEndpoint], queryFn: () => fetchWorkspaces(cfg), retry: 1 });
  const workspaces: Workspace[] = wsData?.workspaces ?? [];
  const [workspaceId, setWorkspaceId] = useState<string | number | null>(null);
  useEffect(() => { if (!workspaceId && workspaces.length > 0) setWorkspaceId(workspaces[0].id); }, [workspaces, workspaceId]);

  const { data: brandData } = useQuery({
    queryKey: ['brands', restEndpoint, workspaceId],
    queryFn: () => fetchBrands(cfg, workspaceId as string | number),
    enabled: !!workspaceId,
  });
  const brands: Brand[] = brandData?.brands ?? [];
  const [brandId, setBrandId] = useState<string | number | null>(null);
  useEffect(() => { setBrandId(brands.length > 0 ? brands[0].id : null); }, [brands]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['knowledge', restEndpoint, brandId],
    queryFn: () => fetchKnowledgeDocs(cfg, brandId as string | number),
    enabled: !!brandId,
    retry: 1,
  });
  const documents: KnowledgeDoc[] = data?.documents ?? [];

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeDoc[] | null>(null);
  const searchMut = useMutation({
    mutationFn: (q: string) => searchKnowledge(cfg, brandId as string | number, q),
    onSuccess: res => setSearchResults(res.results ?? []),
    onError: (err: any) => triggerNotification({ title: 'Search Failed', message: err?.message || 'Could not search knowledge base.', type: 'warning' }),
  });

  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<KnowledgeDoc | null>(null);
  const [form, setForm] = useState({ title: '', content: '', doc_type: 'fact', tags: '' });

  const createMut = useMutation({
    mutationFn: () => createKnowledgeDoc(cfg, brandId as string | number, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge', restEndpoint, brandId] });
      triggerNotification({ title: 'Document Added', message: 'Knowledge document created.', type: 'success' });
      setForm({ title: '', content: '', doc_type: 'fact', tags: '' });
      setShowForm(false);
    },
    onError: (err: any) => triggerNotification({ title: 'Create Failed', message: err?.message || 'Could not create document.', type: 'warning' }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string | number) => deleteKnowledgeDoc(cfg, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge', restEndpoint, brandId] });
      triggerNotification({ title: 'Document Deleted', message: 'Removed from knowledge base.', type: 'info' });
      setConfirmDelete(null);
    },
    onError: (err: any) => triggerNotification({ title: 'Delete Failed', message: err?.message || 'Could not delete document.', type: 'warning' }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    searchMut.mutate(searchQuery.trim());
  };

  const displayedDocs = searchResults ?? documents;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-brand-primary" />
            Knowledge Base
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">RAG DOCUMENT SOURCES</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select value={workspaceId ?? ''} onChange={e => setWorkspaceId(e.target.value)} className="px-3 py-2 bg-brand-surface border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary">
            {workspaces.length === 0 && <option value="">No workspaces</option>}
            {workspaces.map(ws => <option key={ws.id} value={ws.id}>{ws.name}</option>)}
          </select>
          <select value={brandId ?? ''} onChange={e => setBrandId(e.target.value)} className="px-3 py-2 bg-brand-surface border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary">
            {brands.length === 0 && <option value="">No brands</option>}
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-muted" />
          <input
            type="text"
            placeholder="Semantic search documents..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); if (!e.target.value) setSearchResults(null); }}
            disabled={!brandId}
            className="w-full pl-12 pr-4 py-3 bg-brand-surface border border-brand-border rounded-xl text-brand-text placeholder-brand-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all disabled:opacity-60"
          />
        </form>
        <button
          disabled={!brandId}
          className="px-4 py-3 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors flex items-center space-x-2 shadow-glow-primary disabled:opacity-50"
          onClick={() => setShowForm(v => !v)}
        >
          <Plus className="w-4 h-4" />
          <span>New Document</span>
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={e => { e.preventDefault(); if (!form.content.trim()) { triggerNotification({ title: 'Validation Error', message: 'Content is required.', type: 'warning' }); return; } createMut.mutate(); }}
            className="p-5 bg-brand-surface border border-brand-border rounded-2xl space-y-4 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-brand-text">New Knowledge Document</h3>
              <button type="button" onClick={() => setShowForm(false)}><X className="w-4 h-4 text-brand-text-muted" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title (optional)" className="px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary" />
              <select value={form.doc_type} onChange={e => setForm(f => ({ ...f, doc_type: e.target.value }))} className="px-3 py-2.5 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary">
                {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="tags, comma, separated" className="px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary" />
            </div>
            <textarea rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Document content..." className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary resize-none" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-brand-surface hover:bg-brand-elevated border border-brand-border text-brand-text-muted rounded-xl text-sm font-semibold">Cancel</button>
              <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-sm font-semibold shadow-glow-primary disabled:opacity-50 flex items-center gap-2">
                {createMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Document
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {!brandId && (
        <div className="py-16 text-center text-brand-text-muted font-mono text-xs uppercase border border-dashed border-brand-border rounded-2xl">
          Select or create a brand to manage its knowledge base.
        </div>
      )}

      {brandId && (isLoading || searchMut.isPending) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-brand-surface/60 border border-brand-border rounded-2xl animate-pulse" />)}
        </div>
      )}

      {brandId && isError && (
        <div className="py-16 text-center text-brand-danger font-mono text-sm flex flex-col items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          Failed to load documents.
          <button onClick={() => refetch()} className="mt-2 px-4 py-1.5 bg-brand-elevated rounded-lg text-xs font-bold">Retry</button>
        </div>
      )}

      {brandId && !isLoading && !isError && !searchMut.isPending && displayedDocs.length === 0 && (
        <div className="py-16 text-center text-brand-text-muted font-mono text-xs uppercase border border-dashed border-brand-border rounded-2xl">
          {searchResults ? 'No matching documents found.' : 'No documents yet — add one to power your AI responses.'}
        </div>
      )}

      {brandId && !isLoading && !isError && !searchMut.isPending && displayedDocs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayedDocs.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="bg-brand-surface border border-brand-border rounded-2xl p-6 hover:border-brand-primary/30 transition-all flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-brand-primary" />
              </div>
              {doc.title && <h3 className="text-sm font-bold text-brand-text mb-2 line-clamp-2">{doc.title}</h3>}
              <p className="text-xs text-brand-text-muted line-clamp-3 mb-4 flex-1">{doc.content}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {doc.doc_type && <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-brand-elevated text-brand-text-muted">{doc.doc_type}</span>}
              </div>
              <div className="flex gap-2 pt-4 border-t border-brand-border">
                <button
                  className="flex-1 px-3 py-2 text-xs font-bold text-brand-danger bg-brand-danger/10 rounded-lg hover:bg-brand-danger/20 transition-colors flex items-center justify-center space-x-1"
                  onClick={() => setConfirmDelete(doc)}
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-brand-text mb-2">Delete Document?</h3>
            <p className="text-xs text-brand-text-muted mb-5">This will permanently remove this document from the knowledge base.</p>
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
