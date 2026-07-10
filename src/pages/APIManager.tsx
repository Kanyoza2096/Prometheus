import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { Key, Plus, Copy, Trash2, Eye, EyeOff, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface ApiKeyEntry {
  id: string | number;
  label?: string;
  prefix?: string;
  created_at?: string;
  last_used?: string;
  revoked?: boolean;
}

export default function APIManager() {
  const { restEndpoint, masterToken } = useStore();
  const headers = masterToken ? { 'Content-Type': 'application/json', Authorization: `Bearer ${masterToken}` } : {};
  const base = restEndpoint.replace(/\/+$/, '');

  const [keys, setKeys] = useState<ApiKeyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [showNewForm, setShowNewForm] = useState(false);
  const [label, setLabel] = useState('');
  const [confirmRevoke, setConfirmRevoke] = useState<ApiKeyEntry | null>(null);
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchKeys = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${base}/keys`, { headers });
      if (res.ok) {
        const d = await res.json();
        setKeys(d.keys || []);
      } else throw new Error('Failed');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchKeys(); }, [restEndpoint]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch(`${base}/keys/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ label: label.trim() }),
      });
      if (res.ok) {
        const d = await res.json();
        setFreshKey(d.token || d.key);
        setLabel('');
        setShowNewForm(false);
        fetchKeys();
        showToast('Key generated', true);
      } else {
        const d = await res.json();
        showToast(d.error || 'Generate failed', false);
      }
    } catch (err: any) { showToast(err.message || 'Generate failed', false); }
    finally { setGenerating(false); }
  };

  const handleRevoke = async () => {
    if (!confirmRevoke) return;
    setRevoking(true);
    try {
      const res = await fetch(`${base}/keys/${confirmRevoke.id}`, { method: 'DELETE', headers });
      if (res.ok) {
        showToast('Key revoked', true);
        setConfirmRevoke(null);
        fetchKeys();
      } else {
        const d = await res.json();
        showToast(d.error || 'Revoke failed', false);
      }
    } catch (err: any) { showToast(err.message || 'Revoke failed', false); }
    finally { setRevoking(false); }
  };

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    showToast('Copied to clipboard', true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20 md:pb-0">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={cn("fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-mono text-xs font-bold", toast.ok ? "bg-brand-success text-white" : "bg-brand-danger text-white")}>
            {toast.ok ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}{toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <Key className="w-8 h-8 mr-3 text-brand-primary" /> API Manager
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">API KEY MANAGEMENT</p>
        </div>
        <button onClick={() => setShowNewForm(v => !v)}
          className="px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Generate Key
        </button>
      </div>

      <AnimatePresence>
        {freshKey && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-brand-success/10 border border-brand-success/30 rounded-xl flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold text-brand-success uppercase mb-1">New key — copy it now</p>
              <code className="text-xs font-mono text-brand-text break-all">{freshKey}</code>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleCopy(freshKey)} className="px-3 py-2 bg-brand-elevated rounded-lg text-brand-text hover:bg-brand-border/30 transition-colors"><Copy className="w-4 h-4" /></button>
              <button onClick={() => setFreshKey(null)} className="px-3 py-2 text-xs font-bold text-brand-text-muted hover:text-brand-text">Dismiss</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleGenerate} className="p-5 bg-brand-surface border border-brand-border rounded-2xl flex flex-col md:flex-row gap-4 md:items-end">
            <div className="flex-1">
              <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Key Label</label>
              <input autoFocus value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Production Server"
                className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowNewForm(false)} className="px-4 py-2 bg-brand-elevated border border-brand-border text-brand-text-muted rounded-xl text-sm font-semibold">Cancel</button>
              <button type="submit" disabled={generating || !label.trim()} className="px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-semibold shadow-glow-primary disabled:opacity-50">
                {generating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-4">API Keys</h2>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-brand-elevated/60 rounded-xl animate-pulse" />)}</div>
        ) : error ? (
          <div className="py-10 text-center text-brand-danger font-mono text-sm flex flex-col items-center gap-2">
            <AlertTriangle className="w-6 h-6" /> Failed to load.
            <button onClick={fetchKeys} className="mt-2 px-4 py-1.5 bg-brand-elevated rounded-lg text-xs font-bold">Retry</button>
          </div>
        ) : keys.length === 0 ? (
          <div className="py-10 text-center text-brand-text-muted font-mono text-xs uppercase">No API keys yet.</div>
        ) : (
          <div className="space-y-3">
            {keys.map((apiKey, idx) => (
              <motion.div key={apiKey.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * idx }}
                className="p-4 bg-brand-elevated rounded-xl border border-brand-border hover:border-brand-primary/30 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-brand-text">{apiKey.label}</h3>
                    <div className="flex items-center gap-4 text-xs text-brand-text-muted font-mono mt-1">
                      {apiKey.created_at && <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>}
                      <span>Last used: {apiKey.last_used || 'Never'}</span>
                    </div>
                  </div>
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase', !apiKey.revoked ? 'bg-brand-success/20 text-brand-success' : 'bg-brand-text-muted/20 text-brand-text-muted')}>
                    {apiKey.revoked ? 'revoked' : 'active'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-brand-surface rounded-lg text-xs font-mono text-brand-text border border-brand-border">
                    {showKeys[String(apiKey.id)] ? (apiKey.prefix || '****') : '••••••••••••'}
                  </code>
                  <button onClick={() => setShowKeys(prev => ({ ...prev, [String(apiKey.id)]: !prev[String(apiKey.id)] }))}
                    className="px-3 py-2 bg-brand-surface rounded-lg text-brand-text hover:bg-brand-border/30 transition-colors border border-brand-border">
                    {showKeys[String(apiKey.id)] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setConfirmRevoke(apiKey)} className="px-3 py-2 bg-brand-danger/10 rounded-lg text-brand-danger hover:bg-brand-danger/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirmRevoke && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setConfirmRevoke(null)}>
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
              <h3 className="text-sm font-bold text-brand-text mb-2">Revoke Key?</h3>
              <p className="text-xs text-brand-text-muted mb-5">This will deactivate "{confirmRevoke.label}".</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfirmRevoke(null)} className="px-4 py-2 bg-brand-elevated border border-brand-border text-brand-text-muted rounded-xl text-sm font-semibold">Cancel</button>
                <button onClick={handleRevoke} disabled={revoking} className="px-4 py-2 bg-brand-danger text-white rounded-xl text-sm font-semibold disabled:opacity-50">{revoking ? 'Revoking...' : 'Revoke'}</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
