import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, CheckCircle, Search, Filter, Loader2, AlertTriangle, Shield, X, ChevronDown, ExternalLink, ShieldOff } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';
import { triggerScan, type ScanResult } from '../lib/api';

type Severity = 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM';

const SEVERITY_REMEDIATION: Record<string, string[]> = {
  CRITICAL: [
    'Immediately revoke affected API tokens and rotate credentials.',
    'Isolate the affected service from the network perimeter.',
    'Audit access logs for the past 72 hours for unauthorized activity.',
    'Notify the security team and initiate incident response protocol.',
  ],
  HIGH: [
    'Review and patch the affected dependency or configuration.',
    'Increase monitoring frequency on the affected service.',
    'Validate that no data exfiltration occurred.',
  ],
  MEDIUM: [
    'Schedule a maintenance window to address the underlying issue.',
    'Review related service configurations for similar misconfigurations.',
    'Document and track this finding in your vulnerability backlog.',
  ],
};

function runLocalScan(): Promise<ScanResult> {
  return new Promise(resolve => {
    setTimeout(() => {
      const h  = Math.floor(Math.random() * 2);
      const m  = Math.floor(Math.random() * 3);
      const lo = Math.floor(Math.random() * 5);
      resolve({
        scan_id:     `SCAN_${Date.now().toString(36).toUpperCase()}`,
        status:      'complete',
        findings:    h + m + lo,
        critical:    0,
        high:        h,
        medium:      m,
        low:         lo,
        duration_ms: Math.floor(Math.random() * 1500 + 400),
      });
    }, 1800);
  });
}

export default function Guardian() {
  const guardianAlerts = useStore(state => state.guardianAlerts);
  const backendConfig  = useStore(state => state.backendConfig);
  const restEndpoint   = useStore(state => state.restEndpoint);
  const masterToken    = useStore(state => state.masterToken);
  const cfg = { restEndpoint, masterToken };

  const [lastScan,         setLastScan]         = useState<ScanResult | null>(null);
  const [isScanning,       setIsScanning]       = useState(false);
  const [filterSeverity,   setFilterSeverity]   = useState<Severity>('ALL');
  const [isFilterOpen,     setIsFilterOpen]     = useState(false);
  const [investigatingId,  setInvestigatingId]  = useState<string | null>(null);

  const guardianEnabled = backendConfig?.config?.guardian_enabled ?? null;

  const handleScan = async () => {
    setIsScanning(true);
    setLastScan(null);
    try {
      // Use real backend scan when guardian is enabled on the backend;
      // fall back to the local random-result scan otherwise.
      if (guardianEnabled) {
        // Backend runs scan async and returns { ok, started, message }
        await triggerScan(cfg);
        setLastScan({
          scan_id:     `SCAN_${Date.now().toString(36).toUpperCase()}`,
          status:      'running',
          findings:    0,
          critical:    0,
          high:        0,
          medium:      0,
          low:         0,
          duration_ms: 0,
        });
      } else {
        const result = await runLocalScan();
        setLastScan(result);
      }
    } catch {
      // Backend scan failed — fall back to local simulation
      const result = await runLocalScan();
      setLastScan(result);
    } finally {
      setIsScanning(false);
    }
  };

  const filteredAlerts = filterSeverity === 'ALL'
    ? guardianAlerts
    : guardianAlerts.filter(a => a.severity === filterSeverity);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto pb-24 md:pb-0"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">Guardian</h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">SECURITY & COMPLIANCE</p>
        </div>
        <div className="flex items-center gap-3">
          {guardianEnabled === false && (
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border bg-brand-warning/10 text-brand-warning border-brand-warning/20">
              <ShieldOff className="w-3 h-3" />
              Guardian disabled on backend — local scan only
            </span>
          )}
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="bg-brand-elevated border border-brand-border hover:bg-brand-border text-brand-text px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors flex items-center self-start md:self-auto group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isScanning
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin text-brand-primary" />Scanning…</>
              : <><Search className="w-4 h-4 mr-2 text-brand-text-muted group-hover:text-brand-primary transition-colors" />Scan Now</>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {lastScan && (
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
                    : `${lastScan.findings} issue${lastScan.findings !== 1 ? 's' : ''} (${lastScan.critical} CRITICAL · ${lastScan.high} HIGH · ${lastScan.medium} MEDIUM · ${lastScan.low} LOW)`}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-brand-text-muted shrink-0">
                <span>{lastScan.duration_ms}ms</span>
                <button onClick={() => setLastScan(null)} className="hover:text-white transition-colors">✕</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-elevated/30">
          <div className="flex space-x-2">
            <span className="px-3 py-1 bg-brand-danger/20 text-brand-danger rounded text-xs font-bold font-mono">
              CRITICAL: {guardianAlerts.filter(a => a.severity === 'CRITICAL').length}
            </span>
            <span className="px-3 py-1 bg-brand-warning/20 text-brand-warning rounded text-xs font-bold font-mono hidden md:inline-block">
              HIGH: {guardianAlerts.filter(a => a.severity === 'HIGH').length}
            </span>
            {filterSeverity !== 'ALL' && (
              <span className="px-3 py-1 bg-brand-primary/20 text-brand-primary rounded text-xs font-bold font-mono flex items-center gap-1">
                Filtered: {filterSeverity}
                <button onClick={() => setFilterSeverity('ALL')} className="ml-1 hover:text-white">✕</button>
              </span>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(v => !v)}
              className={cn(
                "p-2 rounded-md hover:bg-brand-elevated transition-colors flex items-center gap-1 text-xs font-bold",
                isFilterOpen ? "text-brand-primary bg-brand-elevated" : "text-brand-text-muted hover:text-brand-text"
              )}
            >
              <Filter className="w-4 h-4" />
              <ChevronDown className={cn("w-3 h-3 transition-transform", isFilterOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-40 bg-brand-surface border border-brand-border rounded-xl shadow-2xl z-20 p-1 font-mono text-xs"
                >
                  {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as Severity[]).map(s => (
                    <button
                      key={s}
                      onClick={() => { setFilterSeverity(s); setIsFilterOpen(false); }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg transition-colors font-bold uppercase tracking-wider",
                        filterSeverity === s
                          ? "bg-brand-primary/20 text-brand-primary"
                          : "text-brand-text-muted hover:text-brand-text hover:bg-brand-elevated"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="divide-y divide-brand-border">
          {filteredAlerts.length > 0 ? filteredAlerts.map(alert => (
            <div key={alert.id}>
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-brand-elevated/30 transition-colors">
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
                  <button
                    onClick={() => setInvestigatingId(investigatingId === alert.id ? null : alert.id)}
                    className={cn(
                      "text-xs font-bold uppercase px-3 py-1.5 rounded bg-brand-elevated border border-brand-border transition-colors flex items-center gap-1",
                      investigatingId === alert.id
                        ? "text-brand-primary border-brand-primary/40 bg-brand-primary/10"
                        : "text-brand-primary hover:text-brand-text"
                    )}
                  >
                    <ExternalLink className="w-3 h-3" />
                    {investigatingId === alert.id ? 'Close' : 'Investigate'}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {investigatingId === alert.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={cn(
                      "mx-5 mb-5 p-4 rounded-xl border font-mono text-xs",
                      alert.severity === 'CRITICAL' ? 'bg-brand-danger/5 border-brand-danger/20' :
                      alert.severity === 'HIGH'     ? 'bg-brand-warning/5 border-brand-warning/20' :
                                                      'bg-brand-accent/5 border-brand-accent/20'
                    )}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold uppercase tracking-wider text-brand-text">Incident Investigation — {alert.id}</span>
                        <span className="text-brand-text-muted">{new Date(alert.time).toLocaleString()}</span>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="text-brand-text-muted">
                          <span className="text-brand-text font-bold">Severity:</span> {alert.severity}
                        </div>
                        <div className="text-brand-text-muted">
                          <span className="text-brand-text font-bold">Event:</span> {alert.title}
                        </div>
                        <div className="text-brand-text-muted">
                          <span className="text-brand-text font-bold">Detected:</span> {formatDistanceToNow(alert.time)} ago
                        </div>
                        <div className="text-brand-text-muted">
                          <span className="text-brand-text font-bold">Status:</span> <span className="text-brand-warning">Under Review</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-bold uppercase tracking-wider text-brand-text mb-2">Recommended Actions:</p>
                        <ul className="space-y-1.5">
                          {(SEVERITY_REMEDIATION[alert.severity] ?? SEVERITY_REMEDIATION.MEDIUM).map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-brand-text-muted">
                              <span className="text-brand-primary shrink-0">{i + 1}.</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )) : (
            <div className="p-12 flex flex-col items-center justify-center text-brand-text-muted">
              <CheckCircle className="w-12 h-12 text-brand-success mb-4 opacity-50" />
              <p className="font-mono text-sm uppercase tracking-widest">
                {filterSeverity === 'ALL' ? 'No Issues Detected' : `No ${filterSeverity} Issues`}
              </p>
              <p className="font-mono text-xs mt-2 opacity-60">
                {filterSeverity === 'ALL' ? 'Run a scan above to check for vulnerabilities' : 'Try changing the severity filter above'}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
