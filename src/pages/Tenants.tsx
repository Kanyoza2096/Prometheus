import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Plus, Search, Edit2, Trash2, Users, CheckCircle, XCircle } from 'lucide-react';

const tenantsData = [
  { id: 1, name: 'Acme Corp', domain: 'acme.example.com', users: 25, status: 'active', plan: 'Enterprise', created: '2024-01-01' },
  { id: 2, name: 'Tech Start Inc', domain: 'techstart.example.com', users: 10, status: 'active', plan: 'Business', created: '2024-01-05' },
  { id: 3, name: 'Local School', domain: 'school.example.com', users: 50, status: 'active', plan: 'Education', created: '2024-01-10' },
  { id: 4, name: 'Community Church', domain: 'church.example.com', users: 15, status: 'inactive', plan: 'Non-Profit', created: '2024-01-08' },
  { id: 5, name: 'Medical Clinic', domain: 'clinic.example.com', users: 8, status: 'active', plan: 'Healthcare', created: '2024-01-12' },
];

const plans = ['All', 'Enterprise', 'Business', 'Education', 'Non-Profit', 'Healthcare'];

export default function Tenants() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('All');

  const filteredTenants = tenantsData.filter((tenant) => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) || tenant.domain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = selectedPlan === 'All' || tenant.plan === selectedPlan;
    return matchesSearch && matchesPlan;
  });

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
            <Building2 className="w-8 h-8 mr-3 text-brand-primary" />
            Tenants
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">MULTI-TENANT MANAGEMENT</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tenant</span>
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-muted" />
          <input
            type="text"
            placeholder="Search tenants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-brand-surface border border-brand-border rounded-xl text-brand-text placeholder-brand-text-muted focus:outline-none focus:border-brand-primary"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {plans.map((plan, idx) => (
            <motion.button
              key={plan}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPlan(plan)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap',
                selectedPlan === plan
                  ? 'bg-brand-primary text-white shadow-glow-primary'
                  : 'bg-brand-surface border border-brand-border text-brand-text hover:bg-brand-elevated'
              )}
            >
              {plan}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTenants.map((tenant, idx) => (
          <motion.div
            key={tenant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + idx * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-brand-surface border border-brand-border rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <motion.div
                whileHover={{ rotate: 5 }}
                className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center"
              >
                <Building2 className="w-6 h-6 text-brand-primary" />
              </motion.div>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                tenant.status === 'active'
                  ? 'bg-brand-success/20 text-brand-success'
                  : 'bg-brand-text-muted/20 text-brand-text-muted'
              )}>
                {tenant.status}
              </span>
            </div>
            <h3 className="text-sm font-bold text-brand-text mb-1">{tenant.name}</h3>
            <p className="text-xs text-brand-text-muted font-mono mb-3">{tenant.domain}</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-brand-elevated rounded-lg border border-brand-border">
                <p className="text-[10px] text-brand-text-muted font-mono mb-1">Plan</p>
                <p className="text-sm font-bold text-brand-text">{tenant.plan}</p>
              </div>
              <div className="p-3 bg-brand-elevated rounded-lg border border-brand-border">
                <p className="text-[10px] text-brand-text-muted font-mono mb-1">Users</p>
                <p className="text-sm font-bold text-brand-text">{tenant.users}</p>
              </div>
            </div>
            <p className="text-xs text-brand-text-muted font-mono mb-4">Created: {tenant.created}</p>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-3 py-2 text-xs font-bold text-brand-text bg-brand-elevated rounded-lg hover:bg-brand-border/30 transition-colors flex items-center justify-center space-x-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-3 py-2 text-xs font-bold text-brand-danger bg-brand-danger/10 rounded-lg hover:bg-brand-danger/20 transition-colors flex items-center justify-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
