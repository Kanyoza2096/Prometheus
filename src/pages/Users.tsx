import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users as UsersIcon, Plus, Search, Edit2, Trash2, Mail, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

const defaultUsers = [
  { id: 1, name: 'John Smith', email: 'john@example.com', role: 'Admin', status: 'active', joined: '2026-01-01' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Manager', status: 'active', joined: '2026-01-05' },
  { id: 3, name: 'Michael Brown', email: 'michael@example.com', role: 'User', status: 'inactive', joined: '2026-01-10' },
  { id: 4, name: 'Emily Davis', email: 'emily@example.com', role: 'User', status: 'active', joined: '2026-01-12' },
  { id: 5, name: 'Chris Wilson', email: 'chris@example.com', role: 'Manager', status: 'active', joined: '2026-01-08' },
  { id: 6, name: 'Alex Turner', email: 'alex@example.com', role: 'User', status: 'active', joined: '2026-01-15' },
];

const roles = ['All', 'Admin', 'Manager', 'User', 'Guest'];

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Users() {
  const triggerNotification = useStore((state) => state.triggerNotification);
  const [users, setUsers] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('kanyoza_users');
      return saved ? JSON.parse(saved) : defaultUsers;
    } catch {
      return defaultUsers;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');

  // Add User Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('User');

  useEffect(() => {
    localStorage.setItem('kanyoza_users', JSON.stringify(users));
  }, [users]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'All' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const roleColors = {
    Admin: 'bg-brand-danger/20 text-brand-danger',
    Manager: 'bg-brand-warning/20 text-brand-warning',
    User: 'bg-brand-primary/20 text-brand-primary',
    Guest: 'bg-brand-text-muted/20 text-brand-text-muted',
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      triggerNotification({
        title: 'Validation Error',
        message: 'Name and email are required fields.',
        type: 'warning',
      });
      return;
    }

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      role,
      status: 'active',
      joined: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [newUser, ...prev]);
    setName('');
    setEmail('');
    setRole('User');
    setShowAddForm(false);

    triggerNotification({
      title: 'User Dispatched',
      message: `Account created for ${newUser.name} with ${newUser.role} access`,
      type: 'success',
    });
  };

  const handleDeleteUser = (id: number, name: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    triggerNotification({
      title: 'User Revoked',
      message: `Access authorization for ${name} has been deleted.`,
      type: 'info',
    });
  };

  const handleToggleStatus = (id: number, name: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u))
    );
    triggerNotification({
      title: 'Status Altered',
      message: `User ${name} status set to ${nextStatus.toUpperCase()}`,
      type: 'info',
    });
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
            <UsersIcon className="w-8 h-8 mr-3 text-brand-primary" />
            Users
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">USER MANAGEMENT & ADMINISTRATION</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center space-x-2"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel Creation' : 'Add User'}</span>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddUser}
            className="p-5 bg-brand-surface border border-brand-border rounded-2xl space-y-4 overflow-hidden"
          >
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-brand-text">Create Account Portal</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">User Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chimwemwe Phiri"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. phiri@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Authorization Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2.5 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="User">User</option>
                  <option value="Guest">Guest</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-brand-surface hover:bg-brand-elevated border border-brand-border text-brand-text-muted rounded-xl text-sm font-semibold transition-colors"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-sm font-semibold shadow-glow-primary transition-colors"
              >
                Dispatch Authorization
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

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
            placeholder="Search credential indices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-sm text-brand-text placeholder-brand-text-muted focus:outline-none focus:border-brand-primary"
          />
        </div>
        <div className="flex gap-2">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={cn(
                'px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all duration-200',
                selectedRole === role
                  ? 'bg-brand-primary border-brand-primary text-white shadow-glow-primary'
                  : 'bg-brand-surface border-brand-border text-brand-text-muted hover:border-brand-primary/40'
              )}
            >
              {role}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border text-[10px] font-mono font-bold text-brand-text-muted uppercase tracking-widest bg-brand-elevated">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredUsers.map((user, idx) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="hover:bg-brand-elevated/40 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center font-bold text-brand-primary uppercase">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-brand-text">{user.name}</div>
                        <div className="text-xs text-brand-text-muted font-mono">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      'px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider',
                      roleColors[user.role as keyof typeof roleColors]
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleStatus(user.id, user.name, user.status)}
                      className={cn(
                        'px-2 py-1 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-all',
                        user.status === 'active'
                          ? 'bg-brand-success/15 text-brand-success hover:bg-brand-success/25'
                          : 'bg-brand-text-muted/15 text-brand-text-muted hover:bg-brand-text-muted/25'
                      )}
                    >
                      {user.status === 'active' ? (
                        <CheckCircle className="w-3.5 h-3.5 text-brand-success" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-brand-text-muted" />
                      )}
                      <span>{user.status}</span>
                    </button>
                  </td>
                  <td className="py-4 px-4 text-xs text-brand-text-muted font-mono">{user.joined}</td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1.5 text-xs font-bold text-brand-text bg-brand-elevated rounded-lg hover:bg-brand-border/30 border border-brand-border transition-colors flex items-center space-x-1"
                        onClick={() => handleToggleStatus(user.id, user.name, user.status)}
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Toggle Status</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1.5 text-xs font-bold text-brand-danger bg-brand-danger/10 rounded-lg hover:bg-brand-danger/20 transition-colors flex items-center space-x-1"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-brand-text-muted font-mono uppercase text-xs tracking-widest">
                    No matching users found in authorization vault
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
