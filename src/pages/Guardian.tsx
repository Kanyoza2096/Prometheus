import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, CheckCircle, Search, Filter, Loader2, AlertTriangle, Shield } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useMutation } from '@tanstack/react-query';
import { triggerScan, type ScanResult } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';

export default function Guardian() {
  const guardianAlerts = useStore(state => state.guardianAlerts);
  const restEndpoint   = useStore(state => state.restEndpoint);
  const masterToken    = useStore(state => state.masterToken);
  const cfg = { restEndpoint, masterToken };

  const [lastScan, setLastScan] = useState<ScanResult | null>(null);

  const scanMutation = useMutation({
    mutationFn: () => triggerScan(cfg),
    onSuccess:  (data) => setLastScan(data),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto pb-24 md:pb-0"
    >
      {/* Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">Guardian</h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">SECURITY & COMPLIANCE</p>
        </div>
        <button
          onClick={() => scanMutation.mutate()}
          disabled={scanMutation.isPending}
          className="bg-brand-elevated border border-brand-border hover:bg-brand-border text-brand-text px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors flex items-center self-start md:self-auto group disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {scanMutation.isPending
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin text-brand-primary" />Scanning…</>
            : <><Search className="w-4 h-4 mr-2 text-brand-text-muted group-hover:text-brand-primary transition-colors" />Scan Now</>}
        </button>
      </div>

      {/* Scan result / error banners ─────────────────────────────────────── */}
      <AnimatePresence>
        {lastScan && !scanMutation.isError && (
          <motion.div
            key="scan-result"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <div className={cn(
              'rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-sm',
              lastScan.critical > 0
                ? 'bg-brand-danger/10 border-brand-danger/30 text-brand-danger'
                : 'bg-brand-success/10 border-brand-success/30 text-brand-success'
            )}>
              <div className="flex items-center gap-3">
                {lastScan.critical > 0
                  ? <AlertTriangle className="w-5 h-5 shrink-0" />
                  : <Shield className="w-5 h-5 shrink-0" />}
                <span className="font-bold">
                  Scan <span className="opacity-60">{lastScan.scan_id}</span> complete —{' '}
                  {lastScan.findings === 0
                    ? 'No issues found'
                    : `${lastScan.findings} issue${lastScan.findings !== 1 ? 's' : ''} found (${lastScan.critical} CRITICAL · ${lastScan.high} HIGH · ${lastScan.medium} MEDIUM · ${lastScan.low} LOW)`}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-brand-text-muted shrink-0">
                <span>{lastScan.duration_ms}ms</span>
                <button onClick={() => setLastScan(null)} className="hover:text-white transition-colors">✕</button>
              </div>
            </div>
          </motion.div>
        )}
        {scanMutation.isError && (
          <motion.div
            key="scan-error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <div className="rounded-xl border border-brand-danger/30 bg-brand-danger/10 p-4 flex items-center gap-3 font-mono text-sm text-brand-danger">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Scan failed — backend unreachable. Check your REST endpoint in Settings.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert table ─────────────────────────────────────────────────────── */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-elevated/30">
          <div className="flex space-x-2">
            <span className="px-3 py-1 bg-brand-danger/20 text-brand-danger rounded text-xs font-bold font-mono">
              CRITICAL: {guardianAlerts.filter(a => a.severity === 'CRITICAL').length}
            </span>
            <span className="px-3 py-1 bg-brand-warning/20 text-brand-warning rounded text-xs font-bold font-mono hidden md:inline-block">
              HIGH: {guardianAlerts.filter(a => a.severity === 'HIGH').length}
            </span>
          </div>
          <button className="p-2 text-brand-text-muted hover:text-brand-text rounded-md hover:bg-brand-elevated transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-brand-border">
          {guardianAlerts.length > 0 ? guardianAlerts.map(alert => (
            <div
              key={alert.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-brand-elevated/30 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className={cn(
                  'p-2 rounded-lg mt-1 shadow-lg',
                  alert.severity === 'CRITICAL' ? 'bg-brand-danger/20 text-brand-danger shadow-glow-danger' :
                  alert.severity === 'HIGH'     ? 'bg-brand-warning/20 text-brand-warning shadow-glow-warning' :
                                                  'bg-brand-accent/20 text-brand-accent shadow-glow-accent'
                )}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1">{alert.title}</h3>
                  <p className="text-xs text-brand-text-muted font-mono">
                    {formatDistanceToNow(alert.time)} ago · ID: {alert.id}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 ml-12 md:ml-0">
                <span className={cn(
                  'px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded border',
                  alert.severity === 'CRITICAL' ? 'text-brand-danger border-brand-danger/30' :
                  alert.severity === 'HIGH'     ? 'text-brand-warning border-brand-warning/30' :
                                                  'text-brand-accent border-brand-accent/30'
                )}>
                  {alert.severity}
                </span>
                <button className="text-xs font-bold text-brand-primary hover:text-brand-text uppercase px-3 py-1.5 rounded bg-brand-elevated border border-brand-border transition-colors">
                  Investigate
                </button>
              </div>
            </div>
          )) : (
            <div className="p-12 flex flex-col items-center justify-center text-brand-text-muted">
              <CheckCircle className="w-12 h-12 text-brand-success mb-4 opacity-50" />
              <p className="font-mono text-sm uppercase tracking-widest">No Issues Detected</p>
              <p className="font-mono text-xs mt-2 opacity-60">Run a scan above to check for vulnerabilities</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
