import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Search, Edit2, Trash2, Shield, Mail, Phone } from 'lucide-react';

const usersData = [
  { id: 1, name: 'John Smith', email: 'john@example.com', role: 'Admin', status: 'active', joined: '2024-01-01' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Manager', status: 'active', joined: '2024-01-05' },
  { id: 3, name: 'Michael Brown', email: 'michael@example.com', role: 'User', status: 'inactive', joined: '2024-01-10' },
  { id: 4, name: 'Emily Davis', email: 'emily@example.com', role: 'User', status: 'active', joined: '2024-01-12' },
  { id: 5, name: 'Chris Wilson', email: 'chris@example.com', role: 'Manager', status: 'active', joined: '2024-01-08' },
  { id: 6, name: 'Alex Turner', email: 'alex@example.com', role: 'User', status: 'active', joined: '2024-01-15' },
];

const roles = ['All', 'Admin', 'Manager', 'User', 'Guest'];

export default function Users() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');

  const filteredUsers = usersData.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'All' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const roleColors = {
    Admin: 'bg-brand-danger/20 text-brand-danger',
    Manager: 'bg-brand-warning/20 text-brand-warning',
    User: 'bg-brand-primary/20 text-brand-primary',
    Guest: 'bg-brand-text-muted/20 text-brand-text-muted',
  };

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
            <Users className="w-8 h-8 mr-3 text-brand-primary" />
            Users
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">USER MANAGEMENT & ADMINISTRATION</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-muted" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-brand-surface border border-brand-border rounded-xl text-brand-text placeholder-brand-text-muted focus:outline-none focus:border-brand-primary"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {roles.map((role, idx) => (
            <motion.button
              key={role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + idx * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedRole(role)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap',
                selectedRole === role
                  ? 'bg-brand-primary text-white shadow-glow-primary'
                  : 'bg-brand-surface border border-brand-border text-brand-text hover:bg-brand-elevated'
              )}
            >
              {role}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-brand-surface border border-brand-border rounded-2xl p-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-text-muted">User</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-text-muted">Role</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-text-muted">Status</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-text-muted">Joined</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + idx * 0.05 }}
                  className="border-b border-brand-border last:border-b-0"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff`}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-bold text-brand-text">{user.name}</p>
                        <p className="text-xs text-brand-text-muted font-mono">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      'px-2 py-1 rounded-lg text-xs font-bold uppercase',
                      roleColors[user.role as keyof typeof roleColors]
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      'px-2 py-1 rounded-lg text-xs font-bold uppercase',
                      user.status === 'active'
                        ? 'bg-brand-success/20 text-brand-success'
                        : 'bg-brand-text-muted/20 text-brand-text-muted'
                    )}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-brand-text-muted font-mono">{user.joined}</td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 text-xs font-bold text-brand-text bg-brand-elevated rounded-lg hover:bg-brand-border/30 transition-colors flex items-center space-x-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 text-xs font-bold text-brand-danger bg-brand-danger/10 rounded-lg hover:bg-brand-danger/20 transition-colors flex items-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </motion.button>
                    </div>
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

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
