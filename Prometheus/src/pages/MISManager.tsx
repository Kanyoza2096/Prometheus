import React from 'react';
import { motion } from 'motion/react';
import { Database, Building, Users, GraduationCap, Heart, ShoppingCart, Hotel, DollarSign, Plus, Settings, ArrowRight } from 'lucide-react';

const misSystems = [
  {
    id: 'school',
    name: 'School Management',
    icon: GraduationCap,
    status: 'active',
    users: 245,
    modules: ['Students', 'Teachers', 'Grades', 'Attendance', 'Finance'],
    color: '#4F46E5',
  },
  {
    id: 'church',
    name: 'Church Management',
    icon: Building,
    status: 'active',
    users: 156,
    modules: ['Members', 'Groups', 'Events', 'Giving', 'Communications'],
    color: '#10B981',
  },
  {
    id: 'hospital',
    name: 'Hospital Management',
    icon: Heart,
    status: 'inactive',
    users: 0,
    modules: ['Patients', 'Doctors', 'Appointments', 'Pharmacy', 'Billing'],
    color: '#EF4444',
  },
  {
    id: 'crm',
    name: 'CRM System',
    icon: Users,
    status: 'active',
    users: 89,
    modules: ['Leads', 'Contacts', 'Deals', 'Tasks', 'Reports'],
    color: '#8B5CF6',
  },
  {
    id: 'erp',
    name: 'ERP System',
    icon: Building,
    status: 'active',
    users: 124,
    modules: ['Inventory', 'Procurement', 'HR', 'Finance', 'Production'],
    color: '#F59E0B',
  },
  {
    id: 'inventory',
    name: 'Inventory Management',
    icon: ShoppingCart,
    status: 'active',
    users: 45,
    modules: ['Products', 'Stock', 'Orders', 'Suppliers', 'Reports'],
    color: '#EC4899',
  },
  {
    id: 'hotel',
    name: 'Hotel Management',
    icon: Hotel,
    status: 'inactive',
    users: 0,
    modules: ['Reservations', 'Rooms', 'Guests', 'Billing', 'Housekeeping'],
    color: '#06B6D4',
  },
  {
    id: 'bank',
    name: 'Banking System',
    icon: DollarSign,
    status: 'inactive',
    users: 0,
    modules: ['Accounts', 'Transactions', 'Loans', 'Cards', 'Reports'],
    color: '#14B8A6',
  },
];

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function MISManager() {
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
          <Database className="w-8 h-8 mr-3 text-brand-primary" />
          MIS Manager
        </h1>
        <p className="text-brand-text-muted text-sm font-mono mt-1">MANAGEMENT INFORMATION SYSTEMS & MODULES</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {misSystems.map((system, idx) => (
          <motion.div
            key={system.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2 + idx * 0.06 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={cn(
              'bg-brand-surface border rounded-2xl p-6 transition-all',
              system.status === 'active'
                ? 'border-brand-primary/30'
                : 'border-brand-border'
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: system.color + '20' }}
              >
                <system.icon
                  className="w-7 h-7"
                  style={{ color: system.color }}
                />
              </motion.div>
              <span className={cn(
                'px-3 py-1 rounded-full text-[10px] font-bold uppercase',
                system.status === 'active'
                  ? 'bg-brand-success/20 text-brand-success'
                  : 'bg-brand-text-muted/20 text-brand-text-muted'
              )}>
                {system.status}
              </span>
            </div>

            <h3 className="text-base font-bold text-brand-text mb-2">{system.name}</h3>
            
            <div className="mb-4">
              <p className="text-xs text-brand-text-muted font-mono mb-1">Active Users</p>
              <p className="text-xl font-bold text-brand-text">{system.users}</p>
            </div>

            <div className="mb-4">
              <p className="text-xs text-brand-text-muted font-mono mb-2">Modules</p>
              <div className="flex flex-wrap gap-1">
                {system.modules.map((module, moduleIdx) => (
                  <span
                    key={moduleIdx}
                    className="px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase bg-brand-elevated text-brand-text-muted"
                  >
                    {module}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-2',
                  system.status === 'active'
                    ? 'bg-brand-primary text-white hover:bg-brand-primary/90 shadow-glow-primary'
                    : 'bg-brand-elevated text-brand-text hover:bg-brand-border/30'
                )}
              >
                <span>{system.status === 'active' ? 'Open' : 'Activate'}</span>
                <ArrowRight className="w-3 h-3" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-brand-text bg-brand-elevated hover:bg-brand-border/30 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}