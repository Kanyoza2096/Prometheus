import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Plus, Users, FileText, Settings, Building, GraduationCap, Heart, Briefcase, ShoppingCart, Hotel, DollarSign, Download, Power } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

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

export default function MISManager() {
  const { restEndpoint, masterToken } = useStore();
  const [selectedType, setSelectedType] = useState('school');
  const [activeTab, setActiveTab] = useState('Users');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const selectedDetails = misTypesList.find(t => t.id === selectedType) || misTypesList[0];
  const SelectedIcon = selectedDetails.icon;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={cn("fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-mono text-xs font-bold", toast.ok ? "bg-brand-success text-white" : "bg-brand-danger text-white")}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
            <Database className="w-8 h-8 text-brand-primary" /> MIS Manager
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">MANAGEMENT INFORMATION SYSTEMS</p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {misTypesList.map(type => (
          <button key={type.id} onClick={() => setSelectedType(type.id)}
            className={cn("min-w-[150px] p-5 rounded-2xl border flex flex-col items-center justify-center gap-4 transition-all flex-shrink-0",
              selectedType === type.id ? "bg-brand-primary/10 border-brand-primary text-brand-primary shadow-glow-primary" : "bg-brand-surface border-brand-border text-brand-text hover:bg-brand-elevated")}>
            <type.icon className="w-8 h-8" /> <span className="text-sm font-bold">{type.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-bold text-brand-text mb-2">Kanyoza {selectedDetails.name}</h2>
              <div className="flex gap-2 items-center"><span className="px-2 py-1 bg-brand-success/20 text-brand-success text-[10px] font-bold uppercase rounded-md">Available</span></div>
            </div>
            <div className="w-14 h-14 bg-brand-primary/20 rounded-xl flex items-center justify-center flex-shrink-0"><SelectedIcon className="w-7 h-7 text-brand-primary" /></div>
          </div>
          <p className="text-xs text-brand-text-muted font-mono leading-relaxed">
            This module is ready for deployment. Connect a {selectedDetails.name} instance to begin managing your organization through the Kanyoza platform.
          </p>
        </div>

        <div className="lg:col-span-8 bg-brand-surface border border-brand-border rounded-2xl flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Database className="w-16 h-16 text-brand-border mx-auto mb-4 opacity-40" />
            <p className="text-brand-text-muted font-mono uppercase text-xs tracking-widest">MIS Module Ready</p>
            <p className="text-brand-text-muted text-xs font-mono mt-2">Select a system type and configure your instance</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
