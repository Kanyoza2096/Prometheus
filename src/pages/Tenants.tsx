import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, Plus, Users, HardDrive, Plug, DollarSign, 
  Settings, Activity, Search, Edit2, ShieldAlert, BarChart3, Database, 
  Power, PowerOff
} from 'lucide-react';
import { cn } from '../lib/utils';

const mockTenants = [
  { id: 1, name: 'Kanyoza Systems', plan: 'Enterprise', users: 89, status: 'Active', amount: 45000, integrations: 12, storageUsed: 45, storageLimit: 100, lastActive: '2 hours ago', color: 'bg-indigo-500' },
  { id: 2, name: 'TechHub Malawi', plan: 'Business', users: 34, status: 'Active', amount: 18500, integrations: 5, storageUsed: 12, storageLimit: 50, lastActive: '5 mins ago', color: 'bg-cyan-500' },
  { id: 3, name: 'Ministry of Education', plan: 'Enterprise', users: 247, status: 'Active', amount: 78000, integrations: 8, storageUsed: 89, storageLimit: 500, lastActive: '1 day ago', color: 'bg-emerald-500' },
  { id: 4, name: 'Blantyre Diocese', plan: 'Business', users: 56, status: 'Active', amount: 24000, integrations: 3, storageUsed: 5, storageLimit: 50, lastActive: '3 hours ago', color: 'bg-purple-500' },
  { id: 5, name: 'Malawi Revenue Authority', plan: 'Enterprise', users: 123, status: 'Trial', amount: 0, integrations: 15, storageUsed: 120, storageLimit: 500, lastActive: 'Just now', color: 'bg-amber-500' },
  { id: 6, name: 'HealthPlus Hospital', plan: 'Business', users: 78, status: 'Suspended', amount: 31500, integrations: 4, storageUsed: 23, storageLimit: 50, lastActive: '5 days ago', color: 'bg-rose-500' },
];

const tabs = ['Overview', 'Users', 'Roles', 'Billing', 'Integrations', 'Knowledge Base', 'Plugins', 'Analytics'];

export default function Tenants() {
  const [selectedTenant, setSelectedTenant] = useState<typeof mockTenants[0] | null>(mockTenants[0]);
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20 md:pb-0"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <Building2 className="w-8 h-8 mr-3 text-brand-primary" />
            Tenant Manager
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">ENTERPRISE AI OPERATING SYSTEM</p>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
          <div className="bg-brand-surface border border-brand-border px-4 py-2 rounded-xl flex items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] text-brand-text-muted font-mono uppercase">Total</p>
              <p className="text-lg font-bold text-brand-text">12</p>
            </div>
            <div className="w-px h-8 bg-brand-border" />
            <div className="text-center">
              <p className="text-[10px] text-brand-text-muted font-mono uppercase">Active</p>
              <p className="text-lg font-bold text-brand-success">10</p>
            </div>
            <div className="w-px h-8 bg-brand-border" />
            <div className="text-center">
              <p className="text-[10px] text-brand-text-muted font-mono uppercase">Enterprise</p>
              <p className="text-lg font-bold text-brand-primary">4</p>
            </div>
            <div className="w-px h-8 bg-brand-border" />
            <div className="text-center">
              <p className="text-[10px] text-brand-text-muted font-mono uppercase">Revenue</p>
              <p className="text-lg font-bold text-brand-accent">MWK 145K</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center gap-2 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tenant</span>
          </motion.button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTenants.map((tenant, idx) => (
          <motion.div
            key={tenant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.05 }}
            onClick={() => setSelectedTenant(tenant)}
            className={cn(
              "bg-brand-surface border rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-1 relative overflow-hidden",
              selectedTenant?.id === tenant.id ? "border-brand-primary shadow-glow-primary" : "border-brand-border hover:border-brand-text-muted"
            )}
          >
            {/* Status Line */}
            <div className={cn(
              "absolute top-0 left-0 w-full h-1",
              tenant.status === 'Active' ? 'bg-brand-success' : tenant.status === 'Trial' ? 'bg-brand-warning' : 'bg-brand-danger'
            )} />

            <div className="flex items-start justify-between mb-4 mt-1">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg", tenant.color)}>
                  {tenant.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-text leading-tight">{tenant.name}</h3>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider",
                    tenant.plan === 'Enterprise' ? 'bg-brand-primary/20 text-brand-primary' : 'bg-brand-accent/20 text-brand-accent'
                  )}>
                    {tenant.plan}
                  </span>
                </div>
              </div>
              <div className={cn(
                "px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1",
                tenant.status === 'Active' ? 'bg-brand-success/10 text-brand-success' : 
                tenant.status === 'Trial' ? 'bg-brand-warning/10 text-brand-warning' : 'bg-brand-danger/10 text-brand-danger'
              )}>
                <div className={cn("w-1.5 h-1.5 rounded-full", 
                  tenant.status === 'Active' ? 'bg-brand-success' : 
                  tenant.status === 'Trial' ? 'bg-brand-warning' : 'bg-brand-danger'
                )} />
                {tenant.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-brand-text-muted">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-mono">USERS</span>
                </div>
                <p className="text-sm font-bold">{tenant.users}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-brand-text-muted">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-mono">BILLING</span>
                </div>
                <p className="text-sm font-bold">MWK {tenant.amount.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-brand-text-muted">
                  <Plug className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-mono">PLUGINS</span>
                </div>
                <p className="text-sm font-bold">{tenant.integrations} Active</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-brand-text-muted">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-mono">STORAGE</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-brand-elevated rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-primary rounded-full" 
                      style={{ width: `${(tenant.storageUsed / tenant.storageLimit) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-brand-text-muted">{tenant.storageUsed}G</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-brand-border">
              <p className="text-[10px] text-brand-text-muted font-mono flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {tenant.lastActive}
              </p>
              <div className="flex gap-1">
                <button className="p-1.5 hover:bg-brand-elevated rounded text-brand-text-muted hover:text-brand-text transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-brand-elevated rounded text-brand-text-muted hover:text-brand-text transition-colors">
                  <Users className="w-4 h-4" />
                </button>
                {tenant.status === 'Active' ? (
                  <button className="p-1.5 hover:bg-brand-danger/20 rounded text-brand-text-muted hover:text-brand-danger transition-colors">
                    <PowerOff className="w-4 h-4" />
                  </button>
                ) : (
                  <button className="p-1.5 hover:bg-brand-success/20 rounded text-brand-text-muted hover:text-brand-success transition-colors">
                    <Power className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Panel */}
      {selectedTenant && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden flex flex-col"
        >
          <div className="border-b border-brand-border px-6 pt-6">
            <h2 className="text-lg font-bold text-brand-text mb-6 flex items-center gap-3">
              <div className={cn("w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px]", selectedTenant.color)}>
                {selectedTenant.name.substring(0, 2).toUpperCase()}
              </div>
              {selectedTenant.name} Configuration
            </h2>
            <div className="flex gap-6 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap",
                    activeTab === tab 
                      ? "border-brand-primary text-brand-primary" 
                      : "border-transparent text-brand-text-muted hover:text-brand-text"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-brand-bg/50">
            {activeTab === 'Overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-brand-surface border border-brand-border p-4 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 text-brand-text-muted mb-2">
                    <Building2 className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase">Identity</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-brand-text-muted uppercase mb-1 block">Tenant Name</label>
                    <input type="text" defaultValue={selectedTenant.name} className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text" />
                  </div>
                  <div>
                    <label className="text-[10px] text-brand-text-muted uppercase mb-1 block">Theme Color</label>
                    <div className="flex gap-2">
                      {['bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500'].map(c => (
                        <button key={c} className={cn("w-6 h-6 rounded-full ring-2 ring-offset-2 ring-offset-brand-surface transition-all", c, selectedTenant.color === c ? "ring-brand-text" : "ring-transparent")} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-brand-surface border border-brand-border p-4 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 text-brand-text-muted mb-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase">Compliance & SLA</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-brand-text-muted uppercase mb-1 block">SLA Tier</label>
                    <div className="px-3 py-2 bg-brand-elevated rounded-lg text-sm text-brand-text font-bold border border-brand-border">
                      {selectedTenant.plan === 'Enterprise' ? '99.99% Uptime Guarantee' : '99.9% Uptime'}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-brand-text-muted uppercase mb-1 block">Data Residency</label>
                    <div className="px-3 py-2 bg-brand-elevated rounded-lg text-sm text-brand-text border border-brand-border">
                      Africa (Malawi South)
                    </div>
                  </div>
                </div>

                <div className="bg-brand-surface border border-brand-border p-4 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 text-brand-text-muted mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase">Admin Contact</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-brand-text-muted uppercase mb-1 block">Primary Admin</label>
                    <div className="px-3 py-2 bg-brand-elevated rounded-lg text-sm text-brand-text border border-brand-border">
                      admin@{selectedTenant.name.toLowerCase().replace(/\s+/g, '')}.mw
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-brand-text-muted uppercase mb-1 block">Phone</label>
                    <div className="px-3 py-2 bg-brand-elevated rounded-lg text-sm text-brand-text border border-brand-border">
                      +265 88 123 4567
                    </div>
                  </div>
                </div>

                <div className="bg-brand-surface border border-brand-border p-4 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 text-brand-text-muted mb-2">
                    <HardDrive className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase">Quota Limits</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] uppercase mb-1">
                      <span className="text-brand-text-muted">Storage</span>
                      <span className="text-brand-text">{selectedTenant.storageUsed}GB / {selectedTenant.storageLimit}GB</span>
                    </div>
                    <div className="h-2 bg-brand-elevated rounded-full overflow-hidden">
                      <div className="h-full bg-brand-primary rounded-full" style={{ width: `${(selectedTenant.storageUsed / selectedTenant.storageLimit) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] uppercase mb-1">
                      <span className="text-brand-text-muted">API Calls (Monthly)</span>
                      <span className="text-brand-text">145k / 500k</span>
                    </div>
                    <div className="h-2 bg-brand-elevated rounded-full overflow-hidden">
                      <div className="h-full bg-brand-accent rounded-full" style={{ width: '29%' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab !== 'Overview' && (
              <div className="py-12 flex flex-col items-center justify-center text-brand-text-muted border-2 border-dashed border-brand-border rounded-xl">
                <Database className="w-8 h-8 mb-3 opacity-50" />
                <p className="text-sm font-mono">{activeTab} configuration panel loaded</p>
                <p className="text-xs mt-1">Select appropriate resource to manage.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
