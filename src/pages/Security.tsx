import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldAlert, Bug, Activity, AlertTriangle, FileText,
  RefreshCw, Play, Check, AlertCircle, Server, Link,
  Clock,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { Spinner } from '../components/Spinner';
import {
  fetchGuardianStatus, fetchGuardianIssues, fetchAuditLogs, triggerScan,
  fetchSystemHealth, fetchScanHistory, fetchSystemConnectors,
  type GuardianIssue, type AuditLogEntry, type SystemHealthEntry,
} from '../lib/api';

function Toast({ msg, kind, onDismiss }: { msg: string; kind: 'success' | 'error'; onDismiss: () => void }) {
  useEffect(() => { const t = setTimeout(onDismiss, kind === 'error' ? 6000 : 4000); return () => clearTimeout(t); }, [kind, onDismiss]);
  return (
    <motion.div initial={{ opacity: 0, y: -20, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: -20 }}
      className={cn('fixed top-20 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl border shadow-2xl text-sm font-bold font-mono',
        kind === 'success' ? 'bg-brand-success/10 text-brand-success border-brand-success/30' : 'bg-brand-danger/10 text-brand-danger border-brand-danger/30')}>
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

const healthColor = (status?: string) => {
  switch ((status ?? '').toLowerCase()) {
    case 'healthy': case 'ok': case 'up': return 'text-brand-success';
    case 'degraded': case 'warn':         return 'text-brand-warning';
    default:                              return 'text-brand-danger';
  }
};

export default function Security() {
  const { restEndpoint, masterToken } = useStore();
  const cfg = { restEndpoint, masterToken };
  const qc = useQueryClient();

  const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, kind: 'success' | 'error' = 'success') => setToast({ msg, kind });

  const [severityFilter, setSeverityFilter] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [auditUserFilter, setAuditUserFilter] = useState('');

  // ── Queries ────────────────────────────────────────────────────────────────
  const statusQuery    = useQuery({ queryKey: ['guardian-status',   restEndpoint],             queryFn: () => fetchGuardianStatus(cfg),                    retry: 1, staleTime: 30_000 });
  const issuesQuery    = useQuery({ queryKey: ['guardian-issues',   restEndpoint, severityFilter], queryFn: () => fetchGuardianIssues(cfg, severityFilter || undefined), retry: 1, staleTime: 30_000 });
  const auditQuery     = useQuery({ queryKey: ['audit-logs',        restEndpoint],             queryFn: () => fetchAuditLogs(cfg, 50),                     retry: 1, staleTime: 30_000 });
  const healthQuery    = useQuery({ queryKey: ['system-health',     restEndpoint],             queryFn: () => fetchSystemHealth(cfg),                      retry: 1, staleTime: 60_000 });
  const scanHistQuery  = useQuery({ queryKey: ['scan-history',      restEndpoint],             queryFn: () => fetchScanHistory(cfg),                       retry: 1, staleTime: 60_000 });
  const connectorsQ    = useQuery({ queryKey: ['system-connectors', restEndpoint],             queryFn: () => fetchSystemConnectors(cfg),                  retry: 1, staleTime: 60_000 });

  interface ScanResult { findings?: number; message?: string; }
  const scanMut = useMutation({
    mutationFn: () => triggerScan(cfg),
    onSuccess: (res: ScanResult) => {
      qc.invalidateQueries({ queryKey: ['guardian-status', restEndpoint] });
      qc.invalidateQueries({ queryKey: ['guardian-issues', restEndpoint] });
      qc.invalidateQueries({ queryKey: ['scan-history',    restEndpoint] });
      showToast(`Scan complete — ${res.findings ?? 0} finding(s) detected.`);
    },
    onError: (err: Error) => showToast(err?.message || 'Scan failed.', 'error'),
  });

  const status  = statusQuery.data;
  const issues: GuardianIssue[]       = issuesQuery.data?.issues ?? [];
  const logs: AuditLogEntry[]         = auditQuery.data?.logs ?? [];
  // Backend returns a `connectors` dict (name -> health status), not a `services` array.
  const services: Array<{ service: string } & SystemHealthEntry> = Object.entries(healthQuery.data?.connectors ?? {})
    .map(([service, s]) => ({ service, ...(s as SystemHealthEntry) }));
  // Backend has no historical scan log — GET /scan returns the current Guardian
  // status + issue list, not a list of past runs.
  const currentScan = scanHistQuery.data;
  // ConnectorInfo.supported_connectors is string[] — map to display objects
  const connectors: Array<{ name: string; status: string }> = (connectorsQ.data?.supported_connectors ?? []).map(name => ({ name, status: 'connected' }));

  const filteredLogs = logs.filter(l => {
    const actionMatch = !auditActionFilter || (l.action || '').toLowerCase().includes(auditActionFilter.toLowerCase());
    const userMatch   = !auditUserFilter   || (l.user   || '').toLowerCase().includes(auditUserFilter.toLowerCase());
    return actionMatch && userMatch;
  });

  const total       = status?.total_findings ?? issues.length;
  const critical    = status?.critical ?? issues.filter(i => i.severity === 'critical').length;
  const high        = status?.high     ?? issues.filter(i => i.severity === 'high').length;
  const score       = Math.max(0, 100 - critical * 15 - high * 8 - Math.max(0, total - critical - high) * 2);
  const circumference = 2 * Math.PI * 45;
  const dashArray   = `${(score / 100) * circumference} ${circumference}`;
  const anyLoading  = statusQuery.isLoading || issuesQuery.isLoading;

  const refetchAll = () => { statusQuery.refetch(); issuesQuery.refetch(); auditQuery.refetch(); healthQuery.refetch(); scanHistQuery.refetch(); connectorsQ.refetch(); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      <AnimatePresence>
        {toast && <Toast key="toast" msg={toast.msg} kind={toast.kind} onDismiss={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-brand-primary" /> Security Center
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">GUARDIAN THREAT DETECTION & AUDIT TRAIL</p>
        </div>
        <div className="flex items-center gap-3">
          <button aria-label="Refresh security data" onClick={refetchAll} className="p-2.5 bg-brand-elevated rounded-xl hover:bg-brand-border/50 transition-colors border border-brand-border">
            <RefreshCw className={cn('w-4 h-4', (statusQuery.isFetching || healthQuery.isFetching) && 'animate-spin')} />
          </button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => scanMut.mutate()}
            disabled={scanMut.isPending}
            className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center gap-2 disabled:opacity-60"
          >
            {scanMut.isPending ? <Spinner size={14} /> : <Play className="w-4 h-4" />}
            {scanMut.isPending ? 'Scanning…' : 'Run Scan'}
          </motion.button>
        </div>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex items-center justify-center gap-6">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-brand-border" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                className={cn('transition-all duration-1000', score > 80 ? 'text-brand-success' : score > 65 ? 'text-brand-warning' : 'text-brand-danger')}
                strokeDasharray={dashArray} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn('text-2xl font-bold', score > 80 ? 'text-brand-success' : score > 65 ? 'text-brand-warning' : 'text-brand-danger')}>
                {anyLoading ? '--' : score}
              </span>
            </div>
          </div>
          <div>
            <div className="text-brand-text-muted text-xs font-mono mb-1 uppercase">Security Score</div>
            <div className={cn('font-bold text-sm', score > 80 ? 'text-brand-success' : 'text-brand-warning')}>
              {score > 80 ? 'Guarded' : 'Action Needed'}
            </div>
            {status?.last_scan && <div className="text-[10px] font-mono text-brand-text-muted mt-1">{status.last_scan}</div>}
          </div>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col justify-center">
          <div className="w-10 h-10 bg-brand-danger/20 rounded-xl flex items-center justify-center mb-4"><Bug className="w-5 h-5 text-brand-danger" /></div>
          <div className="text-3xl font-bold text-brand-text">{anyLoading ? '—' : critical}</div>
          <div className="text-brand-text-muted text-xs font-mono uppercase mt-1">Critical Findings</div>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col justify-center">
          <div className="w-10 h-10 bg-brand-warning/20 rounded-xl flex items-center justify-center mb-4"><AlertTriangle className="w-5 h-5 text-brand-warning" /></div>
          <div className="text-3xl font-bold text-brand-text">{anyLoading ? '—' : total}</div>
          <div className="text-brand-text-muted text-xs font-mono uppercase mt-1">Total Issues</div>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col justify-center">
          <div className="w-10 h-10 bg-brand-primary/20 rounded-xl flex items-center justify-center mb-4"><Activity className="w-5 h-5 text-brand-primary" /></div>
          <div className="text-3xl font-bold text-brand-text">{scanMut.isPending ? <Spinner size={24} /> : (currentScan?.issues?.length ?? '—')}</div>
          <div className="text-brand-text-muted text-xs font-mono uppercase mt-1">Current Scan Issues</div>
        </div>
      </div>

      {/* System Health */}
      {(healthQuery.data || healthQuery.isLoading) && (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-brand-success" /> System Health
            {healthQuery.data?.status && (
              <span className={cn('ml-auto text-xs font-bold', healthColor(healthQuery.data.status))}>{healthQuery.data.status.toUpperCase()}</span>
            )}
          </h2>
          {healthQuery.isLoading ? (
            <div className="flex gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 flex-1 bg-brand-elevated animate-pulse rounded-xl" />)}</div>
          ) : services.length === 0 ? (
            <p className="text-xs font-mono text-brand-text-muted">No service-level health data returned.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {services.map((svc, i) => (
                <div key={i} className="bg-brand-elevated border border-brand-border rounded-xl p-3">
                  <div className={cn('text-xs font-bold', healthColor(svc.status))}>{svc.status?.toUpperCase() ?? 'UNKNOWN'}</div>
                  <div className="text-xs text-brand-text mt-0.5">{svc.service ?? `Service ${i + 1}`}</div>
                  {svc.latency_ms !== undefined && (
                    <div className="text-[9px] font-mono text-brand-text-muted mt-0.5">{svc.latency_ms}ms</div>
                  )}
                </div>
              ))}
            </div>
          )}
          {healthQuery.data?.as_of && (
            <p className="text-[10px] font-mono text-brand-text-muted mt-3">As of: {new Date(healthQuery.data.as_of).toLocaleString()}</p>
          )}
        </div>
      )}

      {/* System Connectors */}
      {(connectorsQ.data || connectorsQ.isLoading) && (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-4 flex items-center gap-2">
            <Link className="w-4 h-4 text-brand-accent" /> System Connectors
          </h2>
          {connectorsQ.isLoading ? (
            <div className="flex gap-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 flex-1 bg-brand-elevated animate-pulse rounded-xl" />)}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(connectors as Array<{ name?: string; status?: string; type?: string }>).map((c, i) => (
                <div key={i} className="bg-brand-elevated border border-brand-border rounded-xl p-3 flex items-center gap-2">
                  <span className={cn('w-2 h-2 rounded-full shrink-0', (c.status === 'connected' || c.status === 'ok') ? 'bg-brand-success' : 'bg-brand-danger')} />
                  <div>
                    <div className="text-xs font-bold text-brand-text">{c.name ?? c.type ?? `Connector ${i + 1}`}</div>
                    <div className="text-[9px] font-mono text-brand-text-muted">{c.status ?? '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Guardian Findings */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2"><Activity className="text-brand-danger" /> Guardian Findings</h2>
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
            className="bg-brand-elevated border border-brand-border rounded-xl px-3 py-2 text-xs text-brand-text font-mono focus:outline-none focus:border-brand-primary">
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border bg-brand-elevated">
                {['Title', 'Repo', 'Severity', 'Status'].map(h => <th key={h} className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {issuesQuery.isLoading && <tr><td colSpan={4} className="py-8 text-center"><div className="flex justify-center"><Spinner size={20} /></div></td></tr>}
              {!issuesQuery.isLoading && issues.map(issue => (
                <tr key={issue.id} className="border-b border-brand-border/50 hover:bg-brand-elevated/40 transition-colors">
                  <td className="py-3 px-4 text-sm font-bold text-brand-text">{issue.title || 'Untitled'}</td>
                  <td className="py-3 px-4 text-xs font-mono text-brand-text-muted">{issue.repo || '—'}</td>
                  <td className="py-3 px-4"><span className={cn('px-2 py-1 rounded-md text-[10px] font-bold border uppercase', getSeverityClass(issue.severity))}>{issue.severity}</span></td>
                  <td className="py-3 px-4 text-sm text-brand-text-muted">{issue.status || 'open'}</td>
                </tr>
              ))}
              {!issuesQuery.isLoading && issues.length === 0 && (
                <tr><td colSpan={4} className="py-10 text-center text-brand-text-muted font-mono uppercase text-xs">No active security findings.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Current Scan Status — the backend has no historical scan log, only a live snapshot */}
      {currentScan && (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-text-muted" /> Current Scan Status
          </h2>
          <div className="flex items-center gap-4 p-3 bg-brand-elevated rounded-xl border border-brand-border">
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded border font-mono uppercase',
              currentScan.configured ? 'bg-brand-success/10 border-brand-success/30 text-brand-success' : 'bg-brand-warning/10 border-brand-warning/30 text-brand-warning')}>
              {currentScan.configured ? 'configured' : 'not configured'}
            </span>
            {currentScan.last_scan_at && (
              <span className="text-xs font-mono text-brand-text-muted flex-1">
                Last run: {new Date(currentScan.last_scan_at).toLocaleString()}
              </span>
            )}
            <span className={cn('text-xs font-bold font-mono', currentScan.issues.length > 0 ? 'text-brand-danger' : 'text-brand-success')}>
              {currentScan.issues.length} issue{currentScan.issues.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Audit Log */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-accent" /> Audit Log
          </h2>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Filter by action…" value={auditActionFilter} onChange={e => setAuditActionFilter(e.target.value)}
              className="bg-brand-elevated border border-brand-border rounded-xl px-3 py-2 text-xs text-brand-text font-mono focus:outline-none focus:border-brand-primary w-40" />
            <input type="text" placeholder="Filter by user…" value={auditUserFilter} onChange={e => setAuditUserFilter(e.target.value)}
              className="bg-brand-elevated border border-brand-border rounded-xl px-3 py-2 text-xs text-brand-text font-mono focus:outline-none focus:border-brand-primary w-40" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border bg-brand-elevated">
                {['Time', 'Action', 'User', 'Resource', 'Status'].map(h => <th key={h} className="py-3 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {auditQuery.isLoading && <tr><td colSpan={5} className="py-8 text-center"><div className="flex justify-center"><Spinner size={20} /></div></td></tr>}
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
                <tr><td colSpan={5} className="py-10 text-center text-brand-text-muted font-mono uppercase text-xs">No audit events recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
