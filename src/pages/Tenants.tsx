import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Plus, Users, HardDrive, Plug, DollarSign, 
  Settings, Activity, Search, Edit2, ShieldAlert, BarChart3, Database, 
  Power, PowerOff
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

const defaultTenants = [
  { id: 1, name: 'Kanyoza Systems', plan: 'Enterprise', users: 89, status: 'Active', amount: 45000, integrations: 12, storageUsed: 45, storageLimit: 100, lastActive: '2 hours ago', color: 'bg-indigo-500' },
  { id: 2, name: 'TechHub Malawi', plan: 'Business', users: 34, status: 'Active', amount: 18500, integrations: 5, storageUsed: 12, storageLimit: 50, lastActive: '5 mins ago', color: 'bg-cyan-500' },
  { id: 3, name: 'Ministry of Education', plan: 'Enterprise', users: 247, status: 'Active', amount: 78000, integrations: 8, storageUsed: 89, storageLimit: 500, lastActive: '1 day ago', color: 'bg-emerald-500' },
  { id: 4, name: 'Blantyre Diocese', plan: 'Business', users: 56, status: 'Active', amount: 24000, integrations: 3, storageUsed: 5, storageLimit: 50, lastActive: '3 hours ago', color: 'bg-purple-500' },
  { id: 5, name: 'Malawi Revenue Authority', plan: 'Enterprise', users: 123, status: 'Trial', amount: 0, integrations: 15, storageUsed: 120, storageLimit: 500, lastActive: 'Just now', color: 'bg-amber-500' },
  { id: 6, name: 'HealthPlus Hospital', plan: 'Business', users: 78, status: 'Suspended', amount: 31500, integrations: 4, storageUsed: 23, storageLimit: 50, lastActive: '5 days ago', color: 'bg-rose-500' },
];

const tabs = ['Overview', 'Users', 'Roles', 'Billing', 'Integrations', 'Knowledge Base', 'Plugins', 'Analytics'];

export default function Tenants() {
  const triggerNotification = useStore((state) => state.triggerNotification);
  const [tenants, setTenants] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('kanyoza_tenants');
      return saved ? JSON.parse(saved) : defaultTenants;
    } catch {
      return defaultTenants;
    }
  });

  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');

  // Add Tenant Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [plan, setPlan] = useState('Business');
  const [color, setColor] = useState('bg-indigo-500');

  useEffect(() => {
    localStorage.setItem('kanyoza_tenants', JSON.stringify(tenants));
    if (tenants.length > 0 && !selectedTenant) {
      setSelectedTenant(tenants[0]);
    }
  }, [tenants]);

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      triggerNotification({
        title: 'Validation Error',
        message: 'Tenant name is required',
        type: 'warning',
      });
      return;
    }

    const newTenant = {
      id: Date.now(),
      name: name.trim(),
      plan,
      users: 1,
      status: 'Active',
      amount: plan === 'Enterprise' ? 50000 : 20000,
      integrations: 1,
      storageUsed: 1,
      storageLimit: plan === 'Enterprise' ? 500 : 50,
      lastActive: 'Just now',
      color,
    };

    setTenants((prev) => [...prev, newTenant]);
    setSelectedTenant(newTenant);
    setName('');
    setPlan('Business');
    setColor('bg-indigo-500');
    setShowAddForm(false);

    triggerNotification({
      title: 'Tenant Provisioned',
      message: `"${newTenant.name}" has been registered successfully.`,
      type: 'success',
    });
  };

  const handleToggleStatus = (id: number, tenantName: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    setTenants((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );
    if (selectedTenant?.id === id) {
      setSelectedTenant((prev: any) => prev ? { ...prev, status: nextStatus } : null);
    }
    triggerNotification({
      title: 'Status Altered',
      message: `Tenant "${tenantName}" is now ${nextStatus}`,
      type: 'info',
    });
  };

  const handleColorChange = (tenantId: number, selectedColor: string) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, color: selectedColor } : t))
    );
    if (selectedTenant?.id === tenantId) {
      setSelectedTenant((prev: any) => prev ? { ...prev, color: selectedColor } : null);
    }
    triggerNotification({
      title: 'Color Updated',
      message: 'Tenant brand color changed.',
      type: 'success',
    });
  };

  // Quick stats derived from live data
  const activeCount = tenants.filter(t => t.status === 'Active').length;
  const enterpriseCount = tenants.filter(t => t.plan === 'Enterprise').length;
  const totalAmount = tenants.reduce((acc, curr) => acc + curr.amount, 0);

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
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex items-center gap-4 bg-brand-surface border border-brand-border px-4 py-2.5 rounded-xl">
            <div className="text-center">
              <p className="text-[10px] text-brand-text-muted font-mono uppercase">Active</p>
              <p className="text-lg font-bold text-brand-success">{activeCount}</p>
            </div>
            <div className="w-px h-8 bg-brand-border" />
            <div className="text-center">
              <p className="text-[10px] text-brand-text-muted font-mono uppercase">Enterprise</p>
              <p className="text-lg font-bold text-brand-primary">{enterpriseCount}</p>
            </div>
            <div className="w-px h-8 bg-brand-border" />
            <div className="text-center">
              <p className="text-[10px] text-brand-text-muted font-mono uppercase">Monthly billing</p>
              <p className="text-lg font-bold text-brand-accent">MWK {(totalAmount / 1000).toFixed(0)}K</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center gap-2 flex-shrink-0"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Cancel Creation' : 'Add Tenant'}</span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddTenant}
            className="p-5 bg-brand-surface border border-brand-border rounded-2xl space-y-4 overflow-hidden"
          >
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-brand-text">Register New Tenant</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Company/Tenant Name</label>
                <input
                  type="text"
                  placeholder="e.g. Zomba Global Corp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Subscription Tier</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full px-3 py-2.5 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary"
                >
                  <option value="Business">Business Tier</option>
                  <option value="Enterprise">Enterprise Tier</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-text-muted mb-1">Brand Theme Accent</label>
                <div className="flex gap-2.5 pt-2">
                  {['bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500'].map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={cn(
                        "w-6 h-6 rounded-full border border-white/20 transition-all",
                        c,
                        color === c ? "ring-2 ring-brand-primary scale-110" : ""
                      )}
                    />
                  ))}
                </div>
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
                Register & Initialize
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants.map((tenant, idx) => (
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

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-inner", tenant.color)}>
                  {tenant.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-brand-text text-sm leading-snug">{tenant.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono uppercase bg-brand-elevated border border-brand-border px-1.5 py-0.5 rounded text-brand-text-muted">
                      {tenant.plan}
                    </span>
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      tenant.status === 'Active' ? 'bg-brand-success' : tenant.status === 'Trial' ? 'bg-brand-warning' : 'bg-brand-danger'
                    )} />
                    <span className="text-[10px] text-brand-text-muted capitalize">{tenant.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 py-3 border-y border-brand-border/40 my-4 text-center">
              <div>
                <p className="text-[9px] text-brand-text-muted font-mono uppercase mb-0.5">USERS</p>
                <p className="text-sm font-bold text-brand-text">{tenant.users}</p>
              </div>
              <div>
                <p className="text-[9px] text-brand-text-muted font-mono uppercase mb-0.5">PLUGINS</p>
                <p className="text-sm font-bold text-brand-text">{tenant.integrations} Active</p>
              </div>
              <div>
                <p className="text-[9px] text-brand-text-muted font-mono uppercase mb-0.5">STORAGE</p>
                <p className="text-sm font-bold text-brand-text">{tenant.storageUsed}G</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[10px] text-brand-text-muted font-mono flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {tenant.lastActive}
              </p>
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  className="p-1.5 hover:bg-brand-elevated rounded text-brand-text-muted hover:text-brand-text transition-colors border border-transparent hover:border-brand-border"
                  onClick={() => {
                    setSelectedTenant(tenant);
                    setActiveTab('Overview');
                    triggerNotification({
                      title: 'Settings Loaded',
                      message: `Opened configure panel for ${tenant.name}`,
                      type: 'info'
                    });
                  }}
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 hover:bg-brand-elevated rounded text-brand-text-muted hover:text-brand-text transition-colors border border-transparent hover:border-brand-border"
                  onClick={() => {
                    triggerNotification({
                      title: 'Routing Redirect',
                      message: `Redirecting context view to authorized users`,
                      type: 'info'
                    });
                  }}
                >
                  <Users className="w-4 h-4" />
                </button>
                {tenant.status === 'Active' ? (
                  <button
                    className="p-1.5 hover:bg-brand-danger/20 rounded text-brand-text-muted hover:text-brand-danger transition-colors border border-transparent"
                    onClick={() => handleToggleStatus(tenant.id, tenant.name, tenant.status)}
                  >
                    <PowerOff className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    className="p-1.5 hover:bg-brand-success/20 rounded text-brand-text-muted hover:text-brand-success transition-colors border border-transparent"
                    onClick={() => handleToggleStatus(tenant.id, tenant.name, tenant.status)}
                  >
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
          className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden flex flex-col mt-6"
        >
          <div className="border-b border-brand-border px-6 pt-6 bg-brand-elevated">
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
                  onClick={() => {
                    setActiveTab(tab);
                    triggerNotification({
                      title: 'Context Shift',
                      message: `Loaded context: ${tab}`,
                      type: 'info'
                    });
                  }}
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
                    <input
                      type="text"
                      value={selectedTenant.name}
                      onChange={(e) => {
                        const newName = e.target.value;
                        setTenants(prev => prev.map(t => t.id === selectedTenant.id ? { ...t, name: newName } : t));
                        setSelectedTenant((prev: any) => prev ? { ...prev, name: newName } : null);
                      }}
                      className="w-full bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-brand-text-muted uppercase mb-1 block">Theme Color</label>
                    <div className="flex gap-2">
                      {['bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500'].map(c => (
                        <button
                          key={c}
                          className={cn(
                            "w-6 h-6 rounded-full ring-2 ring-offset-2 ring-offset-brand-surface transition-all",
                            c,
                            selectedTenant.color === c ? "ring-brand-text" : "ring-transparent"
                          )}
                          onClick={() => handleColorChange(selectedTenant.id, c)}
                        />
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
                      admin@{selectedTenant.name.toLowerCase().replace(/\s+/g, '') || 'tenant'}.mw
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
                    <div className="flex justify-between text-[10px] uppercase mb-1 font-mono">
                      <span className="text-brand-text-muted">Storage</span>
                      <span className="text-brand-text">{selectedTenant.storageUsed}GB / {selectedTenant.storageLimit}GB</span>
                    </div>
                    <div className="h-2 bg-brand-elevated rounded-full overflow-hidden">
                      <div className="h-full bg-brand-primary rounded-full" style={{ width: `${(selectedTenant.storageUsed / selectedTenant.storageLimit) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] uppercase mb-1 font-mono">
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
