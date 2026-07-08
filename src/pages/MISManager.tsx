import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Plus, Users, FileText, Settings, Building, GraduationCap, Heart, Briefcase, ShoppingCart, Hotel, DollarSign, Download, Power, Check } from 'lucide-react';
import { cn } from '../lib/utils';

const misTypesList = [
  { id: 'school', name: 'School MIS', icon: GraduationCap },
  { id: 'church', name: 'Church MIS', icon: Building },
  { id: 'hospital', name: 'Hospital MIS', icon: Heart },
  { id: 'crm', name: 'CRM', icon: Users },
  { id: 'erp', name: 'ERP', icon: Briefcase },
  { id: 'inventory', name: 'Inventory', icon: ShoppingCart },
  { id: 'hotel', name: 'Hotel', icon: Hotel },
  { id: 'bank', name: 'Bank', icon: DollarSign },
];

const subModules = [
  { name: 'Users Management', status: 'online' },
  { name: 'Permissions', status: 'online' },
  { name: 'Database', status: 'online' },
  { name: 'Reports', status: 'online' },
  { name: 'Automation', status: 'offline' },
  { name: 'AI Assistant', status: 'online' },
  { name: 'Messaging', status: 'online' },
  { name: 'Notifications', status: 'online' },
  { name: 'Analytics', status: 'online' },
  { name: 'Settings', status: 'offline' },
];

const allSystems = [
  { name: 'Kanyoza Primary School MIS', type: 'School MIS', org: 'Kanyoza Primary', users: 247, status: 'Active', activity: '5 mins ago' },
  { name: 'City Hospital MIS', type: 'Hospital MIS', org: 'City General', users: 184, status: 'Active', activity: '12 mins ago' },
  { name: 'Grace Church MIS', type: 'Church MIS', org: 'Grace Community', users: 56, status: 'Active', activity: '1 hour ago' },
  { name: 'Global CRM', type: 'CRM', org: 'Global Tech', users: 312, status: 'Active', activity: '2 mins ago' },
  { name: 'Metro Hotel System', type: 'Hotel', org: 'Metro Hotels', users: 89, status: 'Inactive', activity: '2 days ago' },
  { name: 'State Bank Systems', type: 'Bank', org: 'State Bank', users: 450, status: 'Active', activity: '1 min ago' },
];

export default function MISManager() {
  const [selectedType, setSelectedType] = useState('school');
  const [activeTab, setActiveTab] = useState('Users');
  
  const selectedDetails = misTypesList.find(t => t.id === selectedType) || misTypesList[0];
  const SelectedIcon = selectedDetails.icon;

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
           <h1 className="text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
             <Database className="w-8 h-8 text-brand-primary" />
             MIS Manager
           </h1>
           <p className="text-brand-text-muted text-sm font-mono mt-1">MANAGEMENT INFORMATION SYSTEMS & MODULES</p>
        </div>
        <button className="bg-brand-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-brand-primary/90 shadow-glow-primary transition-all">
           <Plus className="w-5 h-5" /> Add MIS
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <div className="text-brand-text-muted text-xs font-mono uppercase tracking-wider mb-2">Active MIS</div>
            <div className="text-3xl font-bold text-brand-text">6</div>
         </div>
         <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <div className="text-brand-text-muted text-xs font-mono uppercase tracking-wider mb-2">Total Users</div>
            <div className="text-3xl font-bold text-brand-text">1,247</div>
         </div>
         <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <div className="text-brand-text-muted text-xs font-mono uppercase tracking-wider mb-2">Active Sessions</div>
            <div className="text-3xl font-bold text-brand-text">89</div>
         </div>
         <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <div className="text-brand-text-muted text-xs font-mono uppercase tracking-wider mb-2">Reports Generated</div>
            <div className="text-3xl font-bold text-brand-text">342</div>
         </div>
      </div>

      {/* Type Selector */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {misTypesList.map(type => (
          <button key={type.id} onClick={() => setSelectedType(type.id)} className={cn("min-w-[150px] p-5 rounded-2xl border flex flex-col items-center justify-center gap-4 transition-all flex-shrink-0", selectedType === type.id ? "bg-brand-primary/10 border-brand-primary text-brand-primary shadow-glow-primary" : "bg-brand-surface border-brand-border text-brand-text hover:bg-brand-elevated")}>
            <type.icon className="w-8 h-8" />
            <span className="text-sm font-bold">{type.name}</span>
          </button>
        ))}
      </div>

      {/* Main Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Panel - Overview */}
        <div className="lg:col-span-4 bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col">
           <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-xl font-bold text-brand-text mb-2">Kanyoza {selectedDetails.name}</h2>
                <div className="flex gap-2 items-center">
                  <span className="px-2 py-1 bg-brand-success/20 text-brand-success text-[10px] font-bold uppercase rounded-md">Active</span>
                  <span className="text-xs text-brand-text-muted font-mono">v3.4.1</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-brand-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <SelectedIcon className="w-7 h-7 text-brand-primary" />
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-brand-elevated border border-brand-border p-4 rounded-xl">
                 <div className="text-xs text-brand-text-muted font-mono mb-1 uppercase tracking-wider">Users</div>
                 <div className="text-xl font-bold text-brand-text">247</div>
              </div>
              <div className="bg-brand-elevated border border-brand-border p-4 rounded-xl">
                 <div className="text-xs text-brand-text-muted font-mono mb-1 uppercase tracking-wider">Roles</div>
                 <div className="text-xl font-bold text-brand-text">8</div>
              </div>
              <div className="bg-brand-elevated border border-brand-border p-4 rounded-xl">
                 <div className="text-xs text-brand-text-muted font-mono mb-1 uppercase tracking-wider">DB Size</div>
                 <div className="text-xl font-bold text-brand-text">4.2GB</div>
              </div>
              <div className="bg-brand-elevated border border-brand-border p-4 rounded-xl">
                 <div className="text-xs text-brand-text-muted font-mono mb-1 uppercase tracking-wider">Uptime</div>
                 <div className="text-xl font-bold text-brand-text">99.9%</div>
              </div>
           </div>
           
           <h3 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-4">Sub-modules Status</h3>
           <div className="space-y-3 flex-1 overflow-y-auto pr-2 scrollbar-hide max-h-[350px]">
             {subModules.map(mod => (
               <div key={mod.name} className="flex justify-between items-center p-3.5 bg-brand-elevated border border-brand-border rounded-xl">
                 <span className="text-sm font-bold text-brand-text">{mod.name}</span>
                 {mod.status === 'online' ? (
                    <span className="flex items-center text-xs text-brand-success font-bold font-mono">
                      <div className="w-2 h-2 rounded-full bg-brand-success mr-2 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />Online
                    </span>
                 ) : (
                    <span className="flex items-center text-xs text-brand-text-muted font-bold font-mono">
                      <div className="w-2 h-2 rounded-full bg-brand-text-muted mr-2" />Offline
                    </span>
                 )}
               </div>
             ))}
           </div>
        </div>

        {/* Right Panel - Controls */}
        <div className="lg:col-span-8 bg-brand-surface border border-brand-border rounded-2xl flex flex-col overflow-hidden min-h-[500px]">
          <div className="flex border-b border-brand-border bg-brand-elevated">
            {['Users', 'Reports', 'Automation', 'Settings'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={cn("flex-1 py-4 text-sm font-bold transition-all border-b-2 uppercase tracking-wider", activeTab === tab ? "border-brand-primary text-brand-primary bg-brand-surface" : "border-transparent text-brand-text-muted hover:text-brand-text hover:bg-brand-surface/50")}>
                {tab}
              </button>
            ))}
          </div>
          
          <div className="p-8 flex-1 bg-brand-surface overflow-y-auto">
            {activeTab === 'Users' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-brand-border text-xs text-brand-text-muted font-mono uppercase">
                      <th className="pb-4 pr-4">Name</th>
                      <th className="pb-4 pr-4">Role</th>
                      <th className="pb-4 pr-4">Last Login</th>
                      <th className="pb-4 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/50">
                    {[
                      {name:'Alice Smith', role:'Admin', login:'2 mins ago', status:'Active'},
                      {name:'Bob Jones', role:'Teacher', login:'1 hour ago', status:'Active'},
                      {name:'Charlie Brown', role:'Staff', login:'1 day ago', status:'Offline'},
                      {name:'Diana Prince', role:'Principal', login:'3 hours ago', status:'Active'},
                      {name:'Evan Wright', role:'Teacher', login:'5 days ago', status:'Offline'},
                    ].map((u,i) => (
                      <tr key={i} className="hover:bg-brand-elevated transition-colors">
                        <td className="py-4 pr-4 text-sm font-bold text-brand-text">{u.name}</td>
                        <td className="py-4 pr-4 text-sm text-brand-text-muted">{u.role}</td>
                        <td className="py-4 pr-4 text-xs font-mono text-brand-text-muted">{u.login}</td>
                        <td className="py-4 pr-4 text-xs font-bold uppercase">
                           {u.status === 'Active' ? <span className="text-brand-success bg-brand-success/10 px-2 py-1 rounded-md">Active</span> : <span className="text-brand-text-muted bg-brand-border/50 px-2 py-1 rounded-md">Offline</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {activeTab === 'Reports' && (
              <div className="space-y-4">
                {[
                  {name:'Monthly Attendance Report', date:'Oct 24, 2023', type:'PDF'},
                  {name:'Financial Summary Q3', date:'Oct 20, 2023', type:'XLSX'},
                  {name:'Grade Distribution Analytics', date:'Oct 15, 2023', type:'PDF'},
                  {name:'Teacher Performance Metrics', date:'Oct 10, 2023', type:'CSV'},
                  {name:'Term 3 Student Results', date:'Oct 01, 2023', type:'PDF'},
                ].map((r,i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-brand-elevated border border-brand-border rounded-xl hover:border-brand-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-brand-primary" /></div>
                      <div>
                        <div className="text-sm font-bold text-brand-text mb-1">{r.name}</div>
                        <div className="text-xs text-brand-text-muted font-mono">{r.date} • {r.type}</div>
                      </div>
                    </div>
                    <button className="p-2.5 bg-brand-surface hover:bg-brand-primary/20 hover:text-brand-primary rounded-lg text-brand-text-muted transition-colors"><Download className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'Automation' && (
              <div className="space-y-4">
                {[
                  {name:'Auto-send daily attendance reports to parents', active:true},
                  {name:'Flag students missing 3+ consecutive days', active:true},
                  {name:'Generate weekly financial summary for admin', active:false},
                  {name:'Database backup every 12 hours', active:true},
                ].map((a,i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-brand-elevated border border-brand-border rounded-xl">
                    <span className="text-sm font-bold text-brand-text">{a.name}</span>
                    <button className={cn("w-12 h-7 rounded-full flex items-center px-1 transition-all", a.active ? "bg-brand-primary justify-end" : "bg-brand-surface border border-brand-border justify-start")}>
                      <motion.div layout className="w-5 h-5 bg-white rounded-full shadow" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'Settings' && (
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="text-xs text-brand-text-muted font-mono mb-2 block uppercase tracking-wider">MIS Display Name</label>
                  <input type="text" defaultValue={`Kanyoza ${selectedDetails.name}`} className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text outline-none focus:border-brand-primary transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-brand-text-muted font-mono mb-2 block uppercase tracking-wider">Admin Contact Email</label>
                  <input type="email" defaultValue="admin@kanyozaprimary.edu" className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text outline-none focus:border-brand-primary transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-brand-text-muted font-mono mb-2 block uppercase tracking-wider">Maintenance Mode</label>
                  <select className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text outline-none focus:border-brand-primary transition-colors appearance-none">
                    <option>Disabled (Normal Operation)</option>
                    <option>Enabled (Admins only)</option>
                    <option>Enabled (Complete Offline)</option>
                  </select>
                </div>
                <button className="w-full bg-brand-primary text-white font-bold text-sm py-3.5 rounded-xl shadow-glow-primary hover:bg-brand-primary/90 transition-all mt-4">Save Configuration</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Table */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-brand-text">Registered Organizations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-brand-border text-xs text-brand-text-muted font-mono uppercase tracking-wider">
                <th className="py-4 px-4">System Name</th>
                <th className="py-4 px-4">Type</th>
                <th className="py-4 px-4">Organization</th>
                <th className="py-4 px-4">Users</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Last Activity</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allSystems.map((s,i) => (
                <tr key={i} className="border-b border-brand-border/50 hover:bg-brand-elevated transition-colors">
                  <td className="py-4 px-4 text-sm font-bold text-brand-text">{s.name}</td>
                  <td className="py-4 px-4 text-xs font-mono text-brand-text-muted bg-brand-surface">{s.type}</td>
                  <td className="py-4 px-4 text-sm text-brand-text-muted">{s.org}</td>
                  <td className="py-4 px-4 text-sm font-mono text-brand-text-secondary">{s.users}</td>
                  <td className="py-4 px-4">
                    <span className={cn("px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase", s.status === 'Active' ? "bg-brand-success/10 text-brand-success border border-brand-success/20" : "bg-brand-text-muted/10 text-brand-text-muted border border-brand-border")}>{s.status}</span>
                  </td>
                  <td className="py-4 px-4 text-xs font-mono text-brand-text-muted">{s.activity}</td>
                  <td className="py-4 px-4 text-right flex justify-end gap-2">
                    <button className="p-2 bg-brand-elevated hover:bg-brand-border/50 rounded-lg transition-colors"><Settings className="w-4 h-4 text-brand-text-secondary" /></button>
                    <button className="p-2 bg-brand-danger/10 hover:bg-brand-danger/20 rounded-lg text-brand-danger transition-colors"><Power className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </motion.div>
  );
}
