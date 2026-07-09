import React from 'react';
import { motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, Bug, Activity, AlertTriangle, FileText, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { fetchGuardianStatus, fetchGuardianIssues, fetchAuditLogs, type GuardianIssue, type AuditLogEntry } from '../lib/api';

const getSeverityClass = (severity: string) => {
  switch ((severity || '').toLowerCase()) {
    case 'critical': return 'bg-[#EF4444]/20 border-[#EF4444]/30 text-[#EF4444]';
    case 'high': return 'bg-[#F97316]/20 border-[#F97316]/30 text-[#F97316]';
    case 'medium': return 'bg-[#EAB308]/20 border-[#EAB308]/30 text-[#EAB308]';
    case 'low': return 'bg-brand-text-muted/20 border-brand-border text-brand-text-muted';
    default: return 'bg-brand-text-muted/20 border-brand-border text-brand-text-muted';
  }
};

export default function Security() {
  const { restEndpoint, masterToken } = useStore();
  const cfg = { restEndpoint, masterToken };

  const statusQuery = useQuery({ queryKey: ['guardian-status', restEndpoint], queryFn: () => fetchGuardianStatus(cfg), retry: 1 });
  const issuesQuery = useQuery({ queryKey: ['guardian-issues', restEndpoint], queryFn: () => fetchGuardianIssues(cfg), retry: 1 });
  const auditQuery = useQuery({ queryKey: ['audit-logs', restEndpoint], queryFn: () => fetchAuditLogs(cfg, 25), retry: 1 });

  const status = statusQuery.data;
  const issues: GuardianIssue[] = issuesQuery.data?.issues ?? [];
  const logs: AuditLogEntry[] = auditQuery.data?.logs ?? [];

  const total = status?.total_findings ?? issues.length;
  const critical = status?.critical ?? issues.filter(i => i.severity === 'critical').length;
  const high = status?.high ?? issues.filter(i => i.severity === 'high').length;
  const score = Math.max(0, 100 - critical * 15 - high * 8 - Math.max(0, total - critical - high) * 2);
  const circumference = 2 * Math.PI * 45;
  const dashArray = `${(score / 100) * circumference} ${circumference}`;

  const anyLoading = statusQuery.isLoading || issuesQuery.isLoading;
  const anyError = statusQuery.isError && issuesQuery.isError;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-brand-primary" />
            Security Center
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">GUARDIAN THREAT DETECTION & AUDIT TRAIL</p>
        </div>
        <button
          onClick={() => { statusQuery.refetch(); issuesQuery.refetch(); auditQuery.refetch(); }}
          className="p-2 bg-brand-elevated rounded-lg hover:bg-brand-border/50 transition-colors border border-brand-border"
        >
          <RefreshCw className={cn('w-4 h-4', (statusQuery.isFetching || issuesQuery.isFetching) && 'animate-spin')} />
        </button>
      </div>

      {anyError && (
        <div className="py-16 text-center text-brand-danger font-mono text-sm flex flex-col items-center gap-2 bg-brand-surface border border-brand-border rounded-2xl">
          <AlertTriangle className="w-6 h-6" />
          Failed to load Guardian security data.
        </div>
      )}

      {!anyError && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex items-center justify-center gap-6">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-brand-border" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className={cn('transition-all duration-1000', score > 80 ? 'text-brand-success' : score > 65 ? 'text-brand-warning' : 'text-brand-danger')} strokeDasharray={dashArray} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn('text-2xl font-bold', score > 80 ? 'text-brand-success' : score > 65 ? 'text-brand-warning' : 'text-brand-danger')}>{anyLoading ? '--' : score}</span>
                </div>
              </div>
              <div>
                <div className="text-brand-text-muted text-xs font-mono mb-1 uppercase tracking-wider">Security Score</div>
                <div className={cn('font-bold text-sm', score > 80 ? 'text-brand-success' : 'text-brand-warning')}>
                  {score > 80 ? 'System Guarded' : 'Action Recommended'}
                </div>
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
              <div className="text-3xl font-bold text-brand-text">{status?.last_scan ? 'Live' : '—'}</div>
              <div className="text-brand-text-muted text-xs font-mono uppercase mt-1">
                {status?.last_scan ? `Last scan: ${status.last_scan}` : 'Scanner Status'}
              </div>
            </div>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2"><Activity className="text-brand-danger" /> Guardian Findings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-border text-brand-text-muted text-xs uppercase font-mono">
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Repo</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {issuesQuery.isLoading && (
                    <tr><td colSpan={4} className="py-8 text-center text-brand-text-muted font-mono uppercase text-xs">Loading findings...</td></tr>
                  )}
                  {!issuesQuery.isLoading && issues.map(issue => (
                    <tr key={issue.id} className="border-b border-brand-border/50 hover:bg-brand-elevated/40 transition-colors">
                      <td className="py-3 px-4 text-sm font-bold text-brand-text">{issue.title || 'Untitled finding'}</td>
                      <td className="py-3 px-4 text-xs font-mono text-brand-text-muted">{issue.repo || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={cn('px-2 py-1 rounded-md text-[10px] font-bold border uppercase', getSeverityClass(issue.severity))}>{issue.severity}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-brand-text-muted">{issue.status || 'open'}</td>
                    </tr>
                  ))}
                  {!issuesQuery.isLoading && issues.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-brand-text-muted font-mono uppercase text-xs tracking-wider">
                        All clear. No active security findings detected.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-6 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-accent" /> Audit Log
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-border text-brand-text-muted text-xs uppercase font-mono">
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Resource</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {auditQuery.isLoading && (
                    <tr><td colSpan={5} className="py-8 text-center text-brand-text-muted font-mono uppercase text-xs">Loading audit log...</td></tr>
                  )}
                  {!auditQuery.isLoading && logs.map(log => (
                    <tr key={log.id} className="border-b border-brand-border/50 hover:bg-brand-elevated/40 transition-colors">
                      <td className="py-3 px-4 text-xs font-mono text-brand-text-muted">{log.created_at || '—'}</td>
                      <td className="py-3 px-4 text-sm font-bold text-brand-text">{log.action || '—'}</td>
                      <td className="py-3 px-4 text-xs font-mono text-brand-text-muted">{log.user || '—'}</td>
                      <td className="py-3 px-4 text-xs text-brand-text-muted">{log.resource || '—'}</td>
                      <td className="py-3 px-4 text-sm text-brand-text-muted">{log.status || '—'}</td>
                    </tr>
                  ))}
                  {!auditQuery.isLoading && logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-brand-text-muted font-mono uppercase text-xs tracking-wider">
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
