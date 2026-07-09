import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldAlert, Bug, Activity, AlertTriangle, FileText,
  RefreshCw, Play, Check, AlertCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { Spinner } from '../components/Spinner';
import {
  fetchGuardianStatus, fetchGuardianIssues, fetchAuditLogs,
  triggerScan,
  type GuardianIssue, type AuditLogEntry,
} from '../lib/api';

function Toast({ msg, kind, onDismiss }: { msg: string; kind: 'success' | 'error'; onDismiss: () => void }) {
  useEffect(() => { const t = setTimeout(onDismiss, kind === 'error' ? 6000 : 4000); return () => clearTimeout(t); }, [kind, onDismiss]);
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'fixed top-20 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl border shadow-2xl text-sm font-bold font-mono',
        kind === 'success'
          ? 'bg-brand-success/10 text-brand-success border-brand-success/30'
          : 'bg-brand-danger/10 text-brand-danger border-brand-danger/30',
      )}
    >
      {kind === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {msg}
    </motion.div>
  );
}

const getSeverityClass = (severity: string) => {
  switch ((severity || '').toLowerCase()) {
    case 'critical': return 'bg-[#EF4444]/20 border-[#EF4444]/30 text-[#EF4444]';
    case 'high':     return 'bg-[#F97316]/20 border-[#F97316]/30 text-[#F97316]';
    case 'medium':   return 'bg-[#EAB308]/20 border-[#EAB308]/30 text-[#EAB308]';
    default:         return 'bg-brand-text-muted/20 border-brand-border text-brand-text-muted';
  }
};

export default function Security() {
  const { restEndpoint, masterToken } = useStore();
  const cfg = { restEndpoint, masterToken };
  const qc = useQueryClient();

  const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, kind: 'success' | 'error' = 'success') => setToast({ msg, kind });

  // ── Filters ────────────────────────────────────────────────────────────────
  const [severityFilter, setSeverityFilter] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [auditUserFilter, setAuditUserFilter] = useState('');

  // ── Queries ────────────────────────────────────────────────────────────────
  const statusQuery = useQuery({
    queryKey: ['guardian-status', restEndpoint],
    queryFn: () => fetchGuardianStatus(cfg),
    retry: 1,
    staleTime: 30_000,
  });
  const issuesQuery = useQuery({
    queryKey: ['guardian-issues', restEndpoint, severityFilter],
    queryFn: () => fetchGuardianIssues(cfg, severityFilter || undefined),
    retry: 1,
    staleTime: 30_000,
  });
  const auditQuery = useQuery({
    queryKey: ['audit-logs', restEndpoint],
    queryFn: () => fetchAuditLogs(cfg, 50),
    retry: 1,
    staleTime: 30_000,
  });

  interface ScanResult { findings?: number; message?: string; }

  // ── Scan mutation ──────────────────────────────────────────────────────────
  const scanMut = useMutation({
    mutationFn: () => triggerScan(cfg),
    onSuccess: (res: ScanResult) => {
      qc.invalidateQueries({ queryKey: ['guardian-status', restEndpoint] });
      qc.invalidateQueries({ queryKey: ['guardian-issues', restEndpoint] });
      showToast(`Scan complete — ${res.findings ?? 0} finding(s) detected.`);
    },
    onError: (err: Error) => showToast(err?.message || 'Scan failed.', 'error'),
  });

  const status = statusQuery.data;
  const issues: GuardianIssue[] = issuesQuery.data?.issues ?? [];
  const logs: AuditLogEntry[] = auditQuery.data?.logs ?? [];

  const filteredLogs = logs.filter(l => {
    const actionMatch = !auditActionFilter || (l.action || '').toLowerCase().includes(auditActionFilter.toLowerCase());
    const userMatch   = !auditUserFilter   || (l.user   || '').toLowerCase().includes(auditUserFilter.toLowerCase());
    return actionMatch && userMatch;
  });

  const total      = status?.total_findings ?? issues.length;
  const critical   = status?.critical ?? issues.filter(i => i.severity === 'critical').length;
  const high       = status?.high     ?? issues.filter(i => i.severity === 'high').length;
  const score      = Math.max(0, 100 - critical * 15 - high * 8 - Math.max(0, total - critical - high) * 2);
  const circumference = 2 * Math.PI * 45;
  const dashArray  = `${(score / 100) * circumference} ${circumference}`;

  const anyLoading = statusQuery.isLoading || issuesQuery.isLoading;
  const anyError   = statusQuery.isError && issuesQuery.isError;

  const refetchAll = () => {
    statusQuery.refetch();
    issuesQuery.refetch();
    auditQuery.refetch();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key="toast" msg={toast.msg} kind={toast.kind} onDismiss={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-brand-primary" />
            Security Center
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">GUARDIAN THREAT DETECTION & AUDIT TRAIL</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refetchAll}
            className="p-2.5 bg-brand-elevated rounded-xl hover:bg-brand-border/50 transition-colors border border-brand-border"
          >
            <RefreshCw className={cn('w-4 h-4', (statusQuery.isFetching || issuesQuery.isFetching) && 'animate-spin')} />
          </button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => scanMut.mutate()}
            disabled={scanMut.isPending}
            className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center gap-2 disabled:opacity-60"
          >
            {scanMut.isPending ? <Spinner size={14} /> : <Play className="w-4 h-4" />}
            {scanMut.isPending ? 'Scanning…' : 'Run Scan'}
          </motion.button>
        </div>
      </div>

      {anyError && (
        <div className="py-16 text-center text-brand-danger font-mono text-sm flex flex-col items-center gap-2 bg-brand-surface border border-brand-border rounded-2xl">
          <AlertTriangle className="w-6 h-6" />
          Failed to load Guardian security data.
          <button onClick={refetchAll} className="mt-2 px-4 py-1.5 bg-brand-elevated rounded-lg text-xs font-bold">Retry</button>
        </div>
      )}

      {!anyError && (
        <>
          {/* ── Score cards ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Score ring */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex items-center justify-center gap-6">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-brand-border" />
                  <circle
                    cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                    className={cn('transition-all duration-1000', score > 80 ? 'text-brand-success' : score > 65 ? 'text-brand-warning' : 'text-brand-danger')}
                    strokeDasharray={dashArray}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn('text-2xl font-bold', score > 80 ? 'text-brand-success' : score > 65 ? 'text-brand-warning' : 'text-brand-danger')}>
                    {anyLoading ? '--' : score}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-brand-text-muted text-xs font-mono mb-1 uppercase tracking-wider">Security Score</div>
                <div className={cn('font-bold text-sm', score > 80 ? 'text-brand-success' : 'text-brand-warning')}>
                  {score > 80 ? 'System Guarded' : 'Action Recommended'}
                </div>
                {status?.last_scan && (
                  <div className="text-[10px] font-mono text-brand-text-muted mt-1">Last: {status.last_scan}</div>
                )}
              </div>
            </div>

            {/* Critical */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col justify-center">
              <div className="w-10 h-10 bg-brand-danger/20 rounded-xl flex items-center justify-center mb-4">
                <Bug className="w-5 h-5 text-brand-danger" />
              </div>
              <div className="text-3xl font-bold text-brand-text">{anyLoading ? '—' : critical}</div>
              <div className="text-brand-text-muted text-xs font-mono uppercase mt-1">Critical Findings</div>
            </div>

            {/* Total */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col justify-center">
              <div className="w-10 h-10 bg-brand-warning/20 rounded-xl flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5 text-brand-warning" />
              </div>
              <div className="text-3xl font-bold text-brand-text">{anyLoading ? '—' : total}</div>
              <div className="text-brand-text-muted text-xs font-mono uppercase mt-1">Total Issues</div>
            </div>

            {/* Scanner status */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col justify-center">
              <div className="w-10 h-10 bg-brand-primary/20 rounded-xl flex items-center justify-center mb-4">
                <Activity className="w-5 h-5 text-brand-primary" />
              </div>
              <div className="text-3xl font-bold text-brand-text">
                {scanMut.isPending ? <Spinner size={24} /> : status?.last_scan ? 'Live' : '—'}
              </div>
              <div className="text-brand-text-muted text-xs font-mono uppercase mt-1">Guardian Scanner</div>
            </div>
          </div>

          {/* ── Guardian Findings ─────────────────────────────────────────── */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Activity className="text-brand-danger" /> Guardian Findings
              </h2>
              <div className="flex items-center gap-2">
                <select
                  value={severityFilter}
                  onChange={e => setSeverityFilter(e.target.value)}
                  className="bg-brand-elevated border border-brand-border rounded-xl px-3 py-2 text-xs text-brand-text font-mono focus:outline-none focus:border-brand-primary"
                >
                  <option value="">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-elevated">
                    <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">Title</th>
                    <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">Repo</th>
                    <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">Severity</th>
                    <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {issuesQuery.isLoading && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center">
                        <div className="flex justify-center"><Spinner size={20} /></div>
                      </td>
                    </tr>
                  )}
                  {!issuesQuery.isLoading && issues.map(issue => (
                    <tr key={issue.id} className="border-b border-brand-border/50 hover:bg-brand-elevated/40 transition-colors">
                      <td className="py-3 px-4 text-sm font-bold text-brand-text">{issue.title || 'Untitled finding'}</td>
                      <td className="py-3 px-4 text-xs font-mono text-brand-text-muted">{issue.repo || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={cn('px-2 py-1 rounded-md text-[10px] font-bold border uppercase', getSeverityClass(issue.severity))}>
                          {issue.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-brand-text-muted">{issue.status || 'open'}</td>
                    </tr>
                  ))}
                  {!issuesQuery.isLoading && issues.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-brand-text-muted font-mono uppercase text-xs tracking-wider">
                        All clear. No active security findings detected.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Audit Log ─────────────────────────────────────────────────── */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-accent" /> Audit Log
              </h2>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter by action…"
                  value={auditActionFilter}
                  onChange={e => setAuditActionFilter(e.target.value)}
                  className="bg-brand-elevated border border-brand-border rounded-xl px-3 py-2 text-xs text-brand-text font-mono focus:outline-none focus:border-brand-primary w-40"
                />
                <input
                  type="text"
                  placeholder="Filter by user…"
                  value={auditUserFilter}
                  onChange={e => setAuditUserFilter(e.target.value)}
                  className="bg-brand-elevated border border-brand-border rounded-xl px-3 py-2 text-xs text-brand-text font-mono focus:outline-none focus:border-brand-primary w-40"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-elevated">
                    <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">Time</th>
                    <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">Action</th>
                    <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">User</th>
                    <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">Resource</th>
                    <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {auditQuery.isLoading && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center">
                        <div className="flex justify-center"><Spinner size={20} /></div>
                      </td>
                    </tr>
                  )}
                  {!auditQuery.isLoading && filteredLogs.map(log => (
                    <tr key={log.id} className="border-b border-brand-border/50 hover:bg-brand-elevated/40 transition-colors">
                      <td className="py-3 px-4 text-xs font-mono text-brand-text-muted whitespace-nowrap">{log.created_at || '—'}</td>
                      <td className="py-3 px-4 text-sm font-bold text-brand-text">{log.action || '—'}</td>
                      <td className="py-3 px-4 text-xs font-mono text-brand-text-muted">{log.user || '—'}</td>
                      <td className="py-3 px-4 text-xs text-brand-text-muted">{log.resource || '—'}</td>
                      <td className="py-3 px-4 text-sm text-brand-text-muted">{log.status || '—'}</td>
                    </tr>
                  ))}
                  {!auditQuery.isLoading && filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-brand-text-muted font-mono uppercase text-xs tracking-wider">
                        No audit events recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
