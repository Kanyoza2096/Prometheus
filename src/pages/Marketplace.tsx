import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Store, Search, Plus, Star, Download, Trash2, RefreshCw, CheckCircle, Upload } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

const categories = [
  { name: 'All', count: 47 },
  { name: 'Education', count: 8 },
  { name: 'Healthcare', count: 5 },
  { name: 'Business', count: 9 },
  { name: 'Government', count: 3 },
  { name: 'Finance', count: 6 },
  { name: 'Social Media', count: 7 },
  { name: 'CRM', count: 4 },
  { name: 'ERP', count: 3 },
  { name: 'Inventory', count: 2 },
  { name: 'Church', count: 4 },
  { name: 'Schools', count: 4 }
];

const defaultPlugins = [
  { id: 1, name: 'School Manager Pro', category: 'Education', author: 'Kanyoza Systems', version: 'v2.3.1', description: 'Comprehensive school management system with advanced reporting capabilities and parent portals.', rating: 4.8, downloads: '12k', price: 'Free', status: 'installed' },
  { id: 2, name: 'Healthcare Records', category: 'Healthcare', author: 'MedTech Inc', version: 'v1.8.0', description: 'HIPAA compliant electronic health records management tailored for modern clinics.', rating: 4.5, downloads: '3.4k', price: '$49/mo', status: 'not_installed' },
  { id: 3, name: 'Business Analytics Suite', category: 'Business', author: 'DataCorp', version: 'v3.1.0', description: 'Real-time business intelligence and visualization tools for enterprise decisions.', rating: 4.9, downloads: '25k', price: 'Free', status: 'installed' },
  { id: 4, name: 'Government Portal', category: 'Government', author: 'GovTech Solutions', version: 'v1.2.0', description: 'Secure citizen services portal and comprehensive e-governance framework.', rating: 4.2, downloads: '1.2k', price: 'Free', status: 'not_installed' },
  { id: 5, name: 'Finance Tracker Pro', category: 'Finance', author: 'FinSys', version: 'v2.0.1', description: 'Enterprise financial tracking, forecasting system, and tax compliance automation.', rating: 4.7, downloads: '8.9k', price: '$79/mo', status: 'not_installed' },
  { id: 6, name: 'Social Media Bot', category: 'Social Media', author: 'Kanyoza Systems', version: 'v4.5.2', description: 'Automated social media engagement and scheduling across all major networks.', rating: 4.6, downloads: '45k', price: 'Free', status: 'installed' },
  { id: 7, name: 'CRM Integration', category: 'CRM', author: 'SalesPro', version: 'v1.5.0', description: 'Seamless integration with major CRM providers to sync leads and customer data.', rating: 4.4, downloads: '5.6k', price: '$59/mo', status: 'not_installed' },
  { id: 8, name: 'Church Management', category: 'Church', author: 'FaithTech', version: 'v2.1.0', description: 'Member management, giving tracking, event scheduling, and pastoral care tools.', rating: 4.9, downloads: '4.2k', price: 'Free', status: 'installed' },
  { id: 9, name: 'ERP Connector', category: 'ERP', author: 'EnterpriseWorks', version: 'v1.0.3', description: 'Connect your existing legacy ERP system directly to the Kanyoza core platform.', rating: 4.1, downloads: '800', price: '$149/mo', status: 'not_installed' },
  { id: 10, name: 'Inventory Manager', category: 'Inventory', author: 'StockFlow', version: 'v1.3.0', description: 'Multi-warehouse inventory tracking, barcodes, and automated low-stock alerts.', rating: 4.5, downloads: '2.1k', price: '$39/mo', status: 'not_installed' },
  { id: 11, name: 'School MIS', category: 'Schools', author: 'EduTech', version: 'v3.0.0', description: 'Complete management information system optimized for primary and secondary schools.', rating: 4.7, downloads: '6.7k', price: 'Free', status: 'update_available' },
  { id: 12, name: 'Hospital MIS', category: 'Healthcare', author: 'HealthSys', version: 'v2.2.0', description: 'Integrated hospital management, ward tracking, and automated billing system.', rating: 4.3, downloads: '1.5k', price: '$99/mo', status: 'not_installed' },
];

const getInitials = (name: string) => name.split(' ').map(n=>n[0]).join('').substring(0,2);

export default function Marketplace() {
  const triggerNotification = useStore((state) => state.triggerNotification);
  const [plugins, setPlugins] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('kanyoza_plugins');
      return saved ? JSON.parse(saved) : defaultPlugins;
    } catch {
      return defaultPlugins;
    }
  });

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('kanyoza_plugins', JSON.stringify(plugins));
  }, [plugins]);

  const filteredPlugins = plugins.filter((plugin) => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || plugin.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstallPlugin = (id: number, name: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'installed' } : p))
    );
    triggerNotification({
      title: 'Plugin Installed',
      message: `"${name}" has been successfully added to your workspace.`,
      type: 'success',
    });
  };

  const handleUninstallPlugin = (id: number, name: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'not_installed' } : p))
    );
    triggerNotification({
      title: 'Plugin Uninstalled',
      message: `"${name}" was removed from your active configurations.`,
      type: 'info',
    });
  };

  const handleUpdatePlugin = (id: number, name: string, version: string) => {
    const parts = version.replace('v', '').split('.');
    const nextPatch = parseInt(parts[2]) + 1;
    const nextVersion = `v${parts[0]}.${parts[1]}.${nextPatch}`;

    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'installed', version: nextVersion } : p))
    );
    triggerNotification({
      title: 'Plugin Updated',
      message: `"${name}" upgraded to latest build: ${nextVersion}`,
      type: 'success',
    });
  };

  const handleConfigurePlugin = (name: string) => {
    triggerNotification({
      title: 'Settings Dispatched',
      message: `Loading operational credentials portal for "${name}".`,
      type: 'info',
    });
  };

  const handleSubmitPlugin = () => {
    triggerNotification({
      title: 'Submit Protocol',
      message: 'Initial validation sandbox ready. Drag package to submit.',
      type: 'info',
    });
  };

  // Stat calculations
  const totalInstalled = plugins.filter(p => p.status === 'installed').length;
  const totalUpdates = plugins.filter(p => p.status === 'update_available').length;

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
           <h1 className="text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
             <Store className="w-8 h-8 text-brand-primary" />
             Plugin Marketplace
           </h1>
           <p className="text-brand-text-muted text-sm font-mono mt-1">EXTEND PLATFORM CAPABILITIES</p>
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
             <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-text-muted" />
             <input
               type="text"
               placeholder="Search plugins..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-brand-surface border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-brand-text outline-none focus:border-brand-primary transition-all"
             />
          </div>
          <button
            className="bg-brand-elevated border border-brand-border hover:bg-brand-border/50 text-brand-text px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors whitespace-nowrap"
            onClick={handleSubmitPlugin}
          >
             <Upload className="w-4 h-4" /> Submit Plugin
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex items-center justify-between">
            <div>
              <div className="text-brand-text-muted text-xs font-mono uppercase tracking-wider mb-1">Total Plugins</div>
              <div className="text-3xl font-bold text-brand-text">{plugins.length}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center"><Store className="w-6 h-6 text-brand-primary"/></div>
         </div>
         <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex items-center justify-between">
            <div>
              <div className="text-brand-text-muted text-xs font-mono uppercase tracking-wider mb-1">Installed</div>
              <div className="text-3xl font-bold text-brand-text">{totalInstalled}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-brand-success/10 flex items-center justify-center"><CheckCircle className="w-6 h-6 text-brand-success"/></div>
         </div>
         <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex items-center justify-between">
            <div>
              <div className="text-brand-text-muted text-xs font-mono uppercase tracking-wider mb-1">Updates Available</div>
              <div className="text-3xl font-bold text-brand-warning">{totalUpdates}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-brand-warning/10 flex items-center justify-center"><RefreshCw className="w-6 h-6 text-brand-warning"/></div>
         </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map(cat => {
          const matchingCount = cat.name === 'All' ? plugins.length : plugins.filter(p => p.category === cat.name).length;
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={cn(
                "px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-bold flex items-center gap-3 transition-all",
                selectedCategory === cat.name
                  ? "bg-brand-primary text-white shadow-glow-primary"
                  : "bg-brand-surface border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-brand-elevated"
              )}
            >
              {cat.name}
              <span className={cn("px-2 py-0.5 rounded-md text-xs font-mono", selectedCategory === cat.name ? "bg-white/20 text-white" : "bg-brand-elevated text-brand-text-muted")}>
                {matchingCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Plugin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredPlugins.map(plugin => (
            <motion.div
              layout
              key={plugin.id}
              initial={{opacity:0, scale:0.95}}
              animate={{opacity:1, scale:1}}
              exit={{opacity:0, scale:0.9}}
              whileHover={{y:-4}}
              className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col transition-all hover:border-brand-primary/30 group"
            >
              <div className="flex justify-between items-start mb-5">
                 <div className="w-14 h-14 rounded-xl bg-brand-elevated border border-brand-border text-brand-primary flex items-center justify-center font-bold text-xl group-hover:bg-brand-primary/10 transition-colors">
                   {getInitials(plugin.name)}
                 </div>
                 {plugin.status === 'installed' && <span className="bg-brand-success/10 text-brand-success border border-brand-success/20 text-[10px] font-bold uppercase px-2.5 py-1 rounded-md flex items-center gap-1.5"><CheckCircle className="w-3 h-3"/> Installed</span>}
                 {plugin.status === 'update_available' && <span className="bg-brand-warning/10 text-brand-warning border border-brand-warning/20 text-[10px] font-bold uppercase px-2.5 py-1 rounded-md flex items-center gap-1.5"><RefreshCw className="w-3 h-3"/> Update</span>}
              </div>
              <h3 className="text-base font-bold text-brand-text mb-1">{plugin.name}</h3>
              <p className="text-xs text-brand-text-muted font-mono mb-4">by {plugin.author} • {plugin.version}</p>
              <p className="text-sm text-brand-text-secondary mb-6 line-clamp-2 min-h-[40px]">{plugin.description}</p>
              
              <div className="flex items-center justify-between mb-6 pt-4 border-t border-brand-border/50">
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1.5 text-brand-warning text-sm font-bold"><Star className="w-4 h-4 fill-current"/> {plugin.rating}</div>
                   <div className="flex items-center gap-1.5 text-brand-text-muted text-xs font-mono"><Download className="w-4 h-4"/> {plugin.downloads}</div>
                </div>
                <div className="text-sm font-bold text-brand-text bg-brand-elevated px-3 py-1 rounded-md border border-brand-border">{plugin.price}</div>
              </div>
              
              <div className="mt-auto flex gap-3">
                 {plugin.status === 'installed' ? (
                   <>
                     <button
                       className="flex-1 bg-brand-elevated hover:bg-brand-border/50 border border-brand-border text-brand-text font-bold text-sm py-2.5 rounded-xl transition-all"
                       onClick={() => handleConfigurePlugin(plugin.name)}
                     >
                       Configure
                     </button>
                     <button
                       className="px-4 bg-brand-danger/10 hover:bg-brand-danger/20 text-brand-danger rounded-xl transition-all"
                       onClick={() => handleUninstallPlugin(plugin.id, plugin.name)}
                     >
                       <Trash2 className="w-4 h-4"/>
                     </button>
                   </>
                 ) : plugin.status === 'update_available' ? (
                   <button
                     className="w-full bg-brand-warning text-brand-bg font-bold text-sm py-2.5 rounded-xl hover:bg-brand-warning/90 shadow-glow-warning transition-all"
                     onClick={() => handleUpdatePlugin(plugin.id, plugin.name, plugin.version)}
                   >
                     Update to Latest
                   </button>
                 ) : (
                   <button
                     className="w-full bg-brand-primary text-white font-bold text-sm py-2.5 rounded-xl hover:bg-brand-primary/90 shadow-glow-primary transition-all"
                     onClick={() => handleInstallPlugin(plugin.id, plugin.name)}
                   >
                     Install Plugin
                   </button>
                 )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {filteredPlugins.length === 0 && (
        <div className="py-20 text-center">
          <Store className="w-16 h-16 text-brand-border mx-auto mb-4" />
          <p className="text-brand-text-muted font-mono uppercase text-xs tracking-widest">No matching plugins found in directory</p>
        </div>
      )}
    </motion.div>
  );
}
