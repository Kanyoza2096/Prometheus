import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Bug, Activity, Key, Users, FileText, Check, X, AlertTriangle, Trash2, Shield, Filter, AlertCircle } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

const defaultEvents = [
  { id: 1, time: '10:42:05', type: 'SQL Injection Attempt', source: '192.168.1.45', severity: 'CRITICAL', status: 'Blocked' },
  { id: 2, time: '10:38:12', type: 'Failed Authentication', source: '45.22.11.9', severity: 'HIGH', status: 'Investigating' },
  { id: 3, time: '10:15:00', type: 'Unusual Port Scan', source: '10.0.0.5', severity: 'MEDIUM', status: 'Logged' },
  { id: 4, time: '09:55:22', type: 'Multiple Failed Logins', source: '172.16.0.8', severity: 'HIGH', status: 'Blocked' },
  { id: 5, time: '09:30:10', type: 'Outdated TLS Version', source: '192.168.1.100', severity: 'LOW', status: 'Logged' },
  { id: 6, time: '08:45:00', type: 'Unauthorized API Access', source: '8.8.8.8', severity: 'CRITICAL', status: 'Blocked' },
  { id: 7, time: '08:12:33', type: 'Suspicious Payload', source: '10.0.0.12', severity: 'MEDIUM', status: 'Logged' },
  { id: 8, time: '07:50:11', type: 'Rate Limit Exceeded', source: '192.168.1.50', severity: 'LOW', status: 'Throttled' },
];

const defaultApiKeys = [
  { id: 1, name: 'Prod Mobile App', key: '****9A2F', created: '2025-01-15', lastUsed: '2 mins ago', permissions: 'Read, Write' },
  { id: 2, name: 'Billing Service', key: '****3B4C', created: '2025-03-22', lastUsed: '1 hour ago', permissions: 'Read' },
  { id: 3, name: 'Analytics Webhook', key: '****7D8E', created: '2025-06-10', lastUsed: '5 days ago', permissions: 'Read' },
];

const defaultSessions = [
  { id: 1, user: 'admin@kanyoza.com', device: 'Chrome / Mac', ip: '192.168.1.1', location: 'New York, US', duration: '2h 15m' },
  { id: 2, user: 'operator@kanyoza.com', device: 'Firefox / Win', ip: '10.0.0.5', location: 'London, UK', duration: '45m' },
  { id: 3, user: 'api-service', device: 'Node.js', ip: '172.16.0.10', location: 'AWS us-east-1', duration: '5d 12h' },
];

const rateLimits = [
  { endpoint: '/api/v1/users', used: 450, limit: 1000 },
  { endpoint: '/api/v1/payments', used: 95, limit: 100 },
  { endpoint: '/api/v1/reports', used: 12, limit: 50 },
  { endpoint: '/api/v1/auth', used: 200, limit: 500 },
];

const loginData = Array.from({ length: 14 }).map((_, i) => ({ day: `Day ${i+1}`, attempts: Math.floor(Math.random() * 50) + 10 }));
const threatData = Array.from({ length: 14 }).map((_, i) => ({ day: `Day ${i+1}`, score: Math.floor(Math.random() * 20) + 70 }));

const getSeverityClass = (severity: string) => {
  switch (severity) {
    case 'CRITICAL': return 'bg-[#EF4444]/20 border-[#EF4444]/30 text-[#EF4444]';
    case 'HIGH': return 'bg-[#F97316]/20 border-[#F97316]/30 text-[#F97316]';
    case 'MEDIUM': return 'bg-[#EAB308]/20 border-[#EAB308]/30 text-[#EAB308]';
    case 'LOW': return 'bg-brand-text-muted/20 border-brand-border text-brand-text-muted';
    default: return '';
  }
}

export default function Security() {
  const triggerNotification = useStore((state) => state.triggerNotification);

  // States
  const [events, setEvents] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('kanyoza_threat_events');
      return saved ? JSON.parse(saved) : defaultEvents;
    } catch {
      return defaultEvents;
    }
  });

  const [apiKeys, setApiKeys] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('kanyoza_api_keys');
      return saved ? JSON.parse(saved) : defaultApiKeys;
    } catch {
      return defaultApiKeys;
    }
  });

  const [sessions, setSessions] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('kanyoza_user_sessions');
      return saved ? JSON.parse(saved) : defaultSessions;
    } catch {
      return defaultSessions;
    }
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('kanyoza_threat_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('kanyoza_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem('kanyoza_user_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Actions
  const handleDismissEvent = (id: number, type: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
    triggerNotification({
      title: 'Threat Log Cleared',
      message: `Event "${type}" has been archived.`,
      type: 'info',
    });
  };

  const handleBlockIP = (ip: string, type: string) => {
    setEvents((prev) => prev.map((ev) => ev.source === ip ? { ...ev, status: 'IP Blocked' } : ev));
    triggerNotification({
      title: 'IP Firewall Block',
      message: `Source IP ${ip} blocked globally on all gateways.`,
      type: 'warning',
    });
  };

  const handleRevokeKey = (id: number, name: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
    triggerNotification({
      title: 'API Key Revoked',
      message: `Access Token "${name}" was permanently deactivated.`,
      type: 'warning',
    });
  };

  const handleTerminateSession = (id: number, user: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    triggerNotification({
      title: 'Session Revoked',
      message: `Logged out session for ${user}.`,
      type: 'info',
    });
  };

  const handleFilterLogs = () => {
    triggerNotification({
      title: 'Filter Configured',
      message: 'Secured logs filtered by current severity indicators.',
      type: 'info',
    });
  };

  // Calculations
  const criticalThreats = events.filter(e => e.severity === 'CRITICAL' || e.severity === 'HIGH').length;
  const score = Math.max(50, 100 - (events.length * 3) - (criticalThreats * 5));
  const circumference = 2 * Math.PI * 45; // ~282.7
  const dashArray = `${(score / 100) * circumference} ${circumference}`;

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
             <ShieldAlert className="w-8 h-8 text-brand-primary" />
             Security Center
           </h1>
           <p className="text-brand-text-muted text-sm font-mono mt-1">THREAT DETECTION & ACCESS CONTROL</p>
         </div>
      </div>

      {/* Section 1: Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex items-center justify-center gap-6">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-brand-border" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className={cn("transition-all duration-1000", score > 80 ? "text-brand-success" : score > 65 ? "text-brand-warning" : "text-brand-danger")} strokeDasharray={dashArray} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-2xl font-bold", score > 80 ? "text-brand-success" : score > 65 ? "text-brand-warning" : "text-brand-danger")}>{score}</span>
              </div>
            </div>
            <div>
              <div className="text-brand-text-muted text-xs font-mono mb-1 uppercase tracking-wider">Security Score</div>
              <div className={cn("font-bold text-sm", score > 80 ? "text-brand-success" : "text-brand-warning")}>
                {score > 80 ? 'System Guarded' : 'Action Recommended'}
              </div>
            </div>
         </div>
         <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col justify-center">
            <div className="w-10 h-10 bg-brand-danger/20 rounded-xl flex items-center justify-center mb-4"><Bug className="w-5 h-5 text-brand-danger"/></div>
            <div className="text-3xl font-bold text-brand-text">{criticalThreats}</div>
            <div className="text-brand-text-muted text-xs font-mono uppercase mt-1">Active Threats</div>
         </div>
         <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col justify-center">
            <div className="w-10 h-10 bg-brand-warning/20 rounded-xl flex items-center justify-center mb-4"><AlertTriangle className="w-5 h-5 text-brand-warning"/></div>
            <div className="text-3xl font-bold text-brand-text">{events.length}</div>
            <div className="text-brand-text-muted text-xs font-mono uppercase mt-1">Total Issues Logs</div>
         </div>
         <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col justify-center">
            <div className="w-10 h-10 bg-brand-primary/20 rounded-xl flex items-center justify-center mb-4"><Activity className="w-5 h-5 text-brand-primary"/></div>
            <div className="text-3xl font-bold text-brand-text">Live</div>
            <div className="text-brand-text-muted text-xs font-mono uppercase mt-1">Firewall Scanner</div>
         </div>
      </div>

      {/* Section 2: Threat Detection */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2"><Activity className="text-brand-danger" /> Live Threat Detection</h2>
          <button className="p-2 bg-brand-elevated rounded-lg hover:bg-brand-border/50 transition-colors border border-brand-border" onClick={handleFilterLogs}><Filter className="w-4 h-4" /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border text-brand-text-muted text-xs uppercase font-mono">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Source IP</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id} className="border-b border-brand-border/50 hover:bg-brand-elevated/40 transition-colors">
                  <td className="py-3 px-4 text-xs font-mono text-brand-text-muted">{ev.time}</td>
                  <td className="py-3 px-4 text-sm font-bold text-brand-text">{ev.type}</td>
                  <td className="py-3 px-4 text-xs font-mono text-brand-text-muted">{ev.source}</td>
                  <td className="py-3 px-4">
                    <span className={cn("px-2 py-1 rounded-md text-[10px] font-bold border", getSeverityClass(ev.severity))}>{ev.severity}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-brand-text-muted">{ev.status}</td>
                  <td className="py-3 px-4 text-right">
                     <div className="flex gap-2 justify-end">
                       <button
                         className="px-2.5 py-1 bg-brand-elevated hover:bg-brand-border/50 text-xs font-bold rounded-lg transition-colors border border-brand-border text-brand-text"
                         onClick={() => handleDismissEvent(ev.id, ev.type)}
                       >
                         Dismiss
                       </button>
                       <button
                         className="px-2.5 py-1 bg-brand-danger/10 hover:bg-brand-danger/20 text-brand-danger text-xs font-bold rounded-lg transition-colors"
                         onClick={() => handleBlockIP(ev.source, ev.type)}
                       >
                         Block IP
                       </button>
                     </div>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-brand-text-muted font-mono uppercase text-xs tracking-wider">
                    All clear. No active security warnings detected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col">
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-6 flex items-center gap-2"><Key className="w-4 h-4 text-brand-primary" /> API Keys</h2>
            <div className="space-y-4 flex-1">
              {apiKeys.map(k => (
                <div key={k.id} className="p-4 bg-brand-elevated rounded-xl border border-brand-border transition-colors hover:border-brand-primary/30">
                   <div className="flex justify-between items-start mb-2">
                     <span className="font-bold text-sm text-brand-text">{k.name}</span>
                     <span className="text-xs font-mono bg-brand-surface px-2 py-1 rounded-md text-brand-text-muted border border-brand-border">{k.key}</span>
                   </div>
                   <div className="text-xs text-brand-text-muted font-mono mb-4">Used: {k.lastUsed} • {k.permissions}</div>
                   <button
                     className="w-full py-2 bg-brand-danger/10 hover:bg-brand-danger/20 text-brand-danger text-xs font-bold rounded-lg transition-all"
                     onClick={() => handleRevokeKey(k.id, k.name)}
                   >
                     Revoke Key
                   </button>
                </div>
              ))}
              {apiKeys.length === 0 && (
                <div className="py-8 text-center border border-dashed border-brand-border rounded-xl text-brand-text-muted text-xs font-mono uppercase">
                  No active access keys.
                </div>
              )}
            </div>
         </div>

         <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col">
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-6 flex items-center gap-2"><Users className="w-4 h-4 text-brand-accent" /> Active Sessions</h2>
            <div className="space-y-4 flex-1">
              {sessions.map(s => (
                <div key={s.id} className="p-4 bg-brand-elevated rounded-xl border border-brand-border transition-colors hover:border-brand-primary/30">
                   <div className="flex justify-between items-start mb-1">
                     <span className="font-bold text-sm text-brand-text truncate pr-2">{s.user}</span>
                     <button
                       className="text-brand-danger hover:bg-brand-danger/10 p-1 rounded-lg transition-colors border border-transparent hover:border-brand-danger/20"
                       onClick={() => handleTerminateSession(s.id, s.user)}
                     >
                       <Trash2 className="w-4 h-4"/>
                     </button>
                   </div>
                   <div className="text-xs text-brand-text-muted mb-1">{s.device} • {s.location}</div>
                   <div className="text-xs font-mono text-brand-text-muted">IP: {s.ip} • Dur: {s.duration}</div>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="py-8 text-center border border-dashed border-brand-border rounded-xl text-brand-text-muted text-xs font-mono uppercase">
                  No active user sessions.
                </div>
              )}
            </div>
         </div>

         <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col">
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-6 flex items-center gap-2"><Activity className="w-4 h-4 text-brand-success" /> Rate Limits</h2>
            <div className="space-y-6 flex-1">
              {rateLimits.map(rl => {
                const pct = (rl.used / rl.limit) * 100;
                return (
                  <div key={rl.endpoint} className="space-y-2">
                     <div className="flex justify-between text-xs font-mono text-brand-text">
                        <span className="font-bold">{rl.endpoint}</span>
                        <span className="text-brand-text-muted">{rl.used} / {rl.limit} req/m</span>
                     </div>
                     <div className="h-2 bg-brand-elevated rounded-full overflow-hidden border border-brand-border">
                        <div className={cn("h-full rounded-full transition-all duration-500", pct > 85 ? "bg-brand-danger" : pct > 60 ? "bg-brand-warning" : "bg-brand-success")} style={{ width: `${pct}%` }} />
                     </div>
                  </div>
                );
              })}
            </div>
         </div>
      </div>
    </motion.div>
  );
}
