import React from 'react';
import { motion } from 'motion/react';
import { FileClock, Search, Filter, Download } from 'lucide-react';

const auditLogs = [
  { id: 1, timestamp: '2024-01-15 14:32:45', user: 'admin@example.com', action: 'User created', resource: 'User', resourceId: '123', status: 'success', ip: '192.168.1.1' },
  { id: 2, timestamp: '2024-01-15 14:30:12', user: 'john@example.com', action: 'Post published', resource: 'Post', resourceId: '456', status: 'success', ip: '192.168.1.2' },
  { id: 3, timestamp: '2024-01-15 14:25:00', user: 'sarah@example.com', action: 'Login failed', resource: 'Auth', resourceId: '-', status: 'failed', ip: '192.168.1.3' },
  { id: 4, timestamp: '2024-01-15 14:20:33', user: 'michael@example.com', action: 'API key generated', resource: 'API', resourceId: '789', status: 'success', ip: '192.168.1.4' },
  { id: 5, timestamp: '2024-01-15 14:15:00', user: 'admin@example.com', action: 'Permission changed', resource: 'Role', resourceId: '321', status: 'success', ip: '192.168.1.1' },
  { id: 6, timestamp: '2024-01-15 14:10:22', user: 'emily@example.com', action: 'File uploaded', resource: 'File', resourceId: '654', status: 'success', ip: '192.168.1.5' },
  { id: 7, timestamp: '2024-01-15 14:05:45', user: 'chris@example.com', action: 'Settings updated', resource: 'Settings', resourceId: '-', status: 'success', ip: '192.168.1.6' },
  { id: 8, timestamp: '2024-01-15 14:00:00', user: 'system', action: 'Backup completed', resource: 'System', resourceId: '-', status: 'success', ip: '127.0.0.1' },
];

const statusColors = {
  success: 'bg-brand-success/20 text-brand-success',
  failed: 'bg-brand-danger/20 text-brand-danger',
  warning: 'bg-brand-warning/20 text-brand-warning',
};

export default function AuditLogs() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20 md:pb-0"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <FileClock className="w-8 h-8 mr-3 text-brand-primary" />
            Audit Logs
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">SYSTEM AUDIT & ACTIVITY LOGS</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm font-bold text-brand-text hover:bg-brand-border/30 transition-colors flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-brand-surface border border-brand-border rounded-2xl p-6"
      >
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-muted" />
          <input
            type="text"
            placeholder="Search logs..."
            className="w-full pl-10 pr-4 py-3 bg-brand-elevated border border-brand-border rounded-xl text-brand-text placeholder-brand-text-muted focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-text-muted">Timestamp</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-text-muted">User</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-text-muted">Action</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-text-muted">Resource</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-text-muted">Status</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-text-muted">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, idx) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + idx * 0.05 }}
                  className="border-b border-brand-border last:border-b-0"
                >
                  <td className="py-4 px-4 text-sm font-mono text-brand-text">{log.timestamp}</td>
                  <td className="py-4 px-4 text-sm text-brand-text">{log.user}</td>
                  <td className="py-4 px-4 text-sm text-brand-text">{log.action}</td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-mono text-brand-text-muted">{log.resource} ({log.resourceId})</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      'px-2 py-1 rounded-lg text-xs font-bold uppercase',
                      statusColors[log.status as keyof typeof statusColors]
                    )}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-mono text-brand-text-muted">{log.ip}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
