import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Bug, Activity, Key, Users, FileText, Check, X, AlertTriangle, Trash2, Shield, Filter } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

const events = [
  { id: 1, time: '10:42:05', type: 'SQL Injection Attempt', source: '192.168.1.45', severity: 'CRITICAL', status: 'Blocked' },
  { id: 2, time: '10:38:12', type: 'Failed Authentication', source: '45.22.11.9', severity: 'HIGH', status: 'Investigating' },
  { id: 3, time: '10:15:00', type: 'Unusual Port Scan', source: '10.0.0.5', severity: 'MEDIUM', status: 'Logged' },
  { id: 4, time: '09:55:22', type: 'Multiple Failed Logins', source: '172.16.0.8', severity: 'HIGH', status: 'Blocked' },
  { id: 5, time: '09:30:10', type: 'Outdated TLS Version', source: '192.168.1.100', severity: 'LOW', status: 'Logged' },
  { id: 6, time: '08:45:00', type: 'Unauthorized API Access', source: '8.8.8.8', severity: 'CRITICAL', status: 'Blocked' },
  { id: 7, time: '08:12:33', type: 'Suspicious Payload', source: '10.0.0.12', severity: 'MEDIUM', status: 'Logged' },
  { id: 8, time: '07:50:11', type: 'Rate Limit Exceeded', source: '192.168.1.50', severity: 'LOW', status: 'Throttled' },
];

const apiKeys = [
  { id: 1, name: 'Prod Mobile App', key: '****9A2F', created: '2023-01-15', lastUsed: '2 mins ago', permissions: 'Read, Write' },
  { id: 2, name: 'Billing Service', key: '****3B4C', created: '2023-03-22', lastUsed: '1 hour ago', permissions: 'Read' },
  { id: 3, name: 'Analytics Webhook', key: '****7D8E', created: '2023-06-10', lastUsed: '5 days ago', permissions: 'Read' },
];

const sessions = [
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

const auditLogs = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  timestamp: `2023-10-25 10:${59 - i}:00`,
  user: ['admin', 'system', 'operator'][i % 3],
  action: ['READ', 'UPDATE', 'DELETE', 'LOGIN'][i % 4],
  resource: ['users', 'settings', 'database', 'auth'][i % 4],
  ip: `192.168.1.${i + 1}`,
  result: i % 7 === 0 ? 'FAIL' : 'SUCCESS'
}));

const loginData = Array.from({ length: 14 }).map((_, i) => ({ day: `Day ${i+1}`, attempts: Math.floor(Math.random() * 50) + 10 }));
const threatData = Array.from({ length: 14 }).map((_, i) => ({ day: `Day ${i+1}`, score: Math.floor(Math.random() * 20) + 70 }));

const roles = ['Admin', 'Operator', 'Viewer', 'API'];
const perms = ['Read', 'Write', 'Delete', 'Configure', 'Deploy'];

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
  const score = 84;
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

      {/* Section 1: Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex items-center justify-center gap-6">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-brand-border" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-brand-success transition-all duration-1000" strokeDasharray={dashArray} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-brand-success">{score}</span>
              </div>
            </div>
            <div>
              <div className="text-brand-text-muted text-xs font-mono mb-1 uppercase tracking-wider">Security Score</div>
              <div className="text-brand-success font-bold text-sm">System Healthy</div>
            </div>
         </div>
         <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col justify-center">
            <div className="w-10 h-10 bg-brand-danger/20 rounded-xl flex items-center justify-center mb-4"><Bug className="w-5 h-5 text-brand-danger"/></div>
            <div className="text-3xl font-bold text-brand-text">2</div>
            <div className="text-brand-text-muted text-xs font-mono uppercase mt-1">Active Threats</div>
         </div>
         <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col justify-center">
            <div className="w-10 h-10 bg-brand-warning/20 rounded-xl flex items-center justify-center mb-4"><AlertTriangle className="w-5 h-5 text-brand-warning"/></div>
            <div className="text-3xl font-bold text-brand-text">5</div>
            <div className="text-brand-text-muted text-xs font-mono uppercase mt-1">Open Vulnerabilities</div>
         </div>
         <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col justify-center">
            <div className="w-10 h-10 bg-brand-primary/20 rounded-xl flex items-center justify-center mb-4"><Activity className="w-5 h-5 text-brand-primary"/></div>
            <div className="text-3xl font-bold text-brand-text">2h ago</div>
            <div className="text-brand-text-muted text-xs font-mono uppercase mt-1">Last Scan</div>
         </div>
      </div>

      {/* Section 2: Threat Detection */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2"><Activity className="text-brand-danger" /> Live Threat Detection</h2>
          <button className="p-2 bg-brand-elevated rounded-lg hover:bg-brand-border/50 transition-colors"><Filter className="w-4 h-4" /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
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
                <tr key={ev.id} className="border-b border-brand-border/50 hover:bg-brand-elevated transition-colors">
                  <td className="py-3 px-4 text-xs font-mono text-brand-text-muted">{ev.time}</td>
                  <td className="py-3 px-4 text-sm font-bold text-brand-text">{ev.type}</td>
                  <td className="py-3 px-4 text-xs font-mono text-brand-text-muted">{ev.source}</td>
                  <td className="py-3 px-4">
                    <span className={cn("px-2 py-1 rounded-md text-[10px] font-bold border", getSeverityClass(ev.severity))}>{ev.severity}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-brand-text-muted">{ev.status}</td>
                  <td className="py-3 px-4 text-right flex gap-2 justify-end">
                     <button className="px-3 py-1 bg-brand-elevated hover:bg-brand-border/50 text-xs font-bold rounded-lg transition-colors">Dismiss</button>
                     <button className="px-3 py-1 bg-brand-danger/10 hover:bg-brand-danger/20 text-brand-danger text-xs font-bold rounded-lg transition-colors">Block IP</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col">
           <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-6 flex items-center gap-2"><Key className="w-4 h-4" /> API Keys</h2>
           <div className="space-y-4 flex-1">
             {apiKeys.map(k => (
               <div key={k.id} className="p-4 bg-brand-elevated rounded-xl border border-brand-border transition-colors hover:border-brand-primary/30">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-brand-text">{k.name}</span>
                    <span className="text-xs font-mono bg-brand-surface px-2 py-1 rounded-md text-brand-text-muted">{k.key}</span>
                  </div>
                  <div className="text-xs text-brand-text-muted font-mono mb-4">Used: {k.lastUsed} • {k.permissions}</div>
                  <button className="w-full py-2 bg-brand-danger/10 hover:bg-brand-danger/20 text-brand-danger text-xs font-bold rounded-lg transition-all">Revoke Key</button>
               </div>
             ))}
           </div>
         </div>

         <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col">
           <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-6 flex items-center gap-2"><Users className="w-4 h-4" /> Active Sessions</h2>
           <div className="space-y-4 flex-1">
             {sessions.map(s => (
               <div key={s.id} className="p-4 bg-brand-elevated rounded-xl border border-brand-border transition-colors hover:border-brand-primary/30">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm text-brand-text truncate pr-2">{s.user}</span>
                    <button className="text-brand-danger hover:text-red-400 p-1 bg-brand-surface rounded-lg"><Trash2 className="w-4 h-4"/></button>
                  </div>
                  <div className="text-xs text-brand-text-muted mb-1">{s.device} • {s.location}</div>
                  <div className="text-xs font-mono text-brand-text-muted">IP: {s.ip} • Dur: {s.duration}</div>
               </div>
             ))}
           </div>
         </div>

         <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col">
           <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-6 flex items-center gap-2"><Activity className="w-4 h-4" /> Rate Limits</h2>
           <div className="space-y-6 flex-1">
             {rateLimits.map(rl => {
               const percent = (rl.used / rl.limit) * 100;
               const color = percent > 80 ? 'bg-brand-danger' : percent > 50 ? 'bg-brand-warning' : 'bg-brand-success';
               return (
                 <div key={rl.endpoint}>
                   <div className="flex justify-between text-xs mb-2">
                     <span className="font-mono text-brand-text">{rl.endpoint}</span>
                     <span className="text-brand-text-muted">{rl.used} / {rl.limit}</span>
                   </div>
                   <div className="w-full h-2 bg-brand-elevated rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} className={cn("h-full", color)} />
                   </div>
                 </div>
               )
             })}
           </div>
         </div>
      </div>

      {/* Section 4: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-6 flex items-center gap-2"><FileText className="w-4 h-4" /> Audit Log</h2>
          <div className="overflow-x-auto h-[320px] overflow-y-auto scrollbar-hide pr-2">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-brand-border text-xs text-brand-text-muted font-mono uppercase sticky top-0 bg-brand-surface z-10">
                  <th className="pb-3 pr-4">Time</th>
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Action</th>
                  <th className="pb-3 pr-4">Resource</th>
                  <th className="pb-3 pr-4">Result</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id} className="border-b border-brand-border/50 hover:bg-brand-elevated transition-colors">
                    <td className="py-3 pr-4 text-xs font-mono text-brand-text-muted whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 pr-4 text-sm text-brand-text">{log.user}</td>
                    <td className="py-3 pr-4 text-xs font-bold font-mono">{log.action}</td>
                    <td className="py-3 pr-4 text-sm text-brand-text-muted">{log.resource}</td>
                    <td className="py-3 pr-4">
                       {log.result === 'SUCCESS' ? <Check className="w-4 h-4 text-brand-success" /> : <X className="w-4 h-4 text-brand-danger" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-6">Security Trends</h2>
          <div className="flex-1 grid grid-rows-2 gap-6">
             <div className="h-full min-h-[130px]">
               <div className="text-xs text-brand-text-muted mb-2 font-mono">Failed Logins (14 Days)</div>
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={loginData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                   <RechartsTooltip contentStyle={{ backgroundColor: '#141A2E', borderColor: '#1E293B', color: '#F1F5F9' }} />
                   <Line type="monotone" dataKey="attempts" stroke="#EF4444" strokeWidth={2} dot={false} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
             <div className="h-full min-h-[130px]">
               <div className="text-xs text-brand-text-muted mb-2 font-mono">Threat Score</div>
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={threatData}>
                   <defs>
                     <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                   <RechartsTooltip contentStyle={{ backgroundColor: '#141A2E', borderColor: '#1E293B', color: '#F1F5F9' }} />
                   <Area type="monotone" dataKey="score" stroke="#4F46E5" fillOpacity={1} fill="url(#colorScore)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>

      {/* Section 5: Permissions */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-6 flex items-center gap-2"><Shield className="w-4 h-4" /> Role Permissions Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="p-4 border-b border-brand-border text-brand-text-muted font-mono text-xs uppercase bg-brand-elevated rounded-tl-xl">Role</th>
                {perms.map((p, idx) => <th key={p} className={cn("p-4 border-b border-brand-border text-brand-text-muted font-mono text-xs uppercase text-center bg-brand-elevated", idx === perms.length - 1 && "rounded-tr-xl")}>{p}</th>)}
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role} className="border-b border-brand-border/50 hover:bg-brand-elevated transition-colors">
                  <td className="p-4 text-brand-text font-bold text-sm">{role}</td>
                  {perms.map(p => {
                     const checked = role === 'Admin' ? true :
                                     role === 'API' ? ['Read', 'Write'].includes(p) :
                                     role === 'Viewer' ? p === 'Read' :
                                     role === 'Operator' ? ['Read', 'Write', 'Configure'].includes(p) : false;
                     return (
                       <td key={p} className="p-4 text-center">
                         {checked ? <Check className="w-5 h-5 mx-auto text-brand-success" /> : <X className="w-5 h-5 mx-auto text-brand-border" />}
                       </td>
                     )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
