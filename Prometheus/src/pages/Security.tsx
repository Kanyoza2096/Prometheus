import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Key, Lock, Users, Eye, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const securityStats = [
  { label: 'Security Score', value: '94', color: '#10B981', icon: ShieldAlert },
  { label: 'Active Sessions', value: '12', color: '#4F46E5', icon: Key },
  { label: 'Failed Logins (24h)', value: '3', color: '#EF4444', icon: AlertTriangle },
  { label: 'Threats Blocked', value: '45', color: '#F59E0B', icon: ShieldAlert },
];

const permissions = [
  { role: 'Admin', users: 2, permissions: ['All'] },
  { role: 'Manager', users: 5, permissions: ['Read', 'Write', 'Delete'] },
  { role: 'User', users: 15, permissions: ['Read'] },
  { role: 'Guest', users: 8, permissions: ['Limited Read'] },
];

const recentActivities = [
  { id: 1, action: 'Login successful', user: 'admin@example.com', time: '2 min ago', status: 'success' },
  { id: 2, action: 'Failed login attempt', user: 'unknown', time: '15 min ago', status: 'warning' },
  { id: 3, action: 'API key generated', user: 'john@example.com', time: '1 hour ago', status: 'info' },
  { id: 4, action: 'Permission changed', user: 'sarah@example.com', time: '2 hours ago', status: 'info' },
  { id: 5, action: 'Threat detected and blocked', user: 'system', time: '3 hours ago', status: 'danger' },
];

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Security() {
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
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
          <ShieldAlert className="w-8 h-8 mr-3 text-brand-primary" />
          Security
        </h1>
        <p className="text-brand-text-muted text-sm font-mono mt-1">SECURITY CENTER & ACCESS CONTROL</p>
      </motion.div>

      {/* Security Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {securityStats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.08 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-brand-surface border border-brand-border rounded-2xl p-6 hover:border-brand-primary/30 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: stat.color + '20' }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </motion.div>
            </div>
            <p className="text-xs text-brand-text-muted font-mono mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-brand-text">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Permissions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-4">Role Permissions</h2>
          <div className="space-y-3">
            {permissions.map((role, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.08 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className="p-4 bg-brand-elevated rounded-xl border border-brand-border hover:border-brand-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-brand-text">{role.role}</h3>
                  <span className="text-xs text-brand-text-muted font-mono">{role.users} users</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((perm, permIdx) => (
                    <span
                      key={permIdx}
                      className="px-2 py-1 rounded-lg text-xs font-bold uppercase bg-brand-primary/10 text-brand-primary"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivities.map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.08 }}
                whileHover={{ scale: 1.01, x: -4 }}
                className="flex items-start gap-3 p-3 bg-brand-elevated rounded-xl border border-brand-border hover:border-brand-primary/30 transition-all cursor-pointer"
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  activity.status === 'success' && 'bg-brand-success/20',
                  activity.status === 'warning' && 'bg-brand-warning/20',
                  activity.status === 'danger' && 'bg-brand-danger/20',
                  activity.status === 'info' && 'bg-brand-primary/20'
                )}>
                  {activity.status === 'success' && <CheckCircle className="w-4 h-4 text-brand-success" />}
                  {activity.status === 'warning' && <AlertTriangle className="w-4 h-4 text-brand-warning" />}
                  {activity.status === 'danger' && <ShieldAlert className="w-4 h-4 text-brand-danger" />}
                  {activity.status === 'info' && <Eye className="w-4 h-4 text-brand-primary" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-brand-text">{activity.action}</p>
                  <div className="flex items-center gap-2 text-xs text-brand-text-muted font-mono mt-1">
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* JWT & Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-brand-surface border border-brand-border rounded-2xl p-6"
      >
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text mb-4">Active Sessions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-text-muted">User</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-text-muted">Device</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-text-muted">IP Address</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-text-muted">Started</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-text-muted">Action</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i, idx) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + idx * 0.08 }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  className="border-b border-brand-border last:border-b-0"
                >
                  <td className="py-4 px-4 text-sm text-brand-text">user{i}@example.com</td>
                  <td className="py-4 px-4 text-sm text-brand-text-muted">Chrome / Windows</td>
                  <td className="py-4 px-4 text-sm font-mono text-brand-text-muted">192.168.1.{i}</td>
                  <td className="py-4 px-4 text-sm font-mono text-brand-text-muted">2 hours ago</td>
                  <td className="py-4 px-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1 text-xs font-bold text-brand-danger bg-brand-danger/10 rounded-lg hover:bg-brand-danger/20 transition-colors"
                    >
                      Revoke
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}