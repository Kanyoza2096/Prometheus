import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Store, Search, Plus, Star, Download } from 'lucide-react';

const categories = ['All', 'Education', 'Healthcare', 'Business', 'Government', 'Finance', 'Social Media', 'CRM', 'ERP', 'Inventory', 'Church', 'Schools'];

const plugins = [
  { id: 1, name: 'School Manager Pro', category: 'Education', author: 'Kanyoza', rating: 4.8, downloads: 1245, price: 'Free', installed: true },
  { id: 2, name: 'Healthcare Records', category: 'Healthcare', author: 'MedTech', rating: 4.6, downloads: 892, price: '$49', installed: false },
  { id: 3, name: 'Business Analytics', category: 'Business', author: 'DataCorp', rating: 4.9, downloads: 2341, price: '$99', installed: true },
  { id: 4, name: 'Government Portal', category: 'Government', author: 'GovTech', rating: 4.5, downloads: 567, price: 'Free', installed: false },
  { id: 5, name: 'Finance Tracker', category: 'Finance', author: 'FinSys', rating: 4.7, downloads: 1567, price: '$79', installed: false },
  { id: 6, name: 'Social Media Bot', category: 'Social Media', author: 'Kanyoza', rating: 4.8, downloads: 3421, price: 'Free', installed: true },
  { id: 7, name: 'CRM Integration', category: 'CRM', author: 'SalesPro', rating: 4.4, downloads: 987, price: '$59', installed: false },
  { id: 8, name: 'Church Management', category: 'Church', author: 'FaithTech', rating: 4.9, downloads: 765, price: 'Free', installed: true },
];

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlugins = plugins.filter((plugin) => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || plugin.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
            <Store className="w-8 h-8 mr-3 text-brand-primary" />
            Marketplace
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">PLUGIN & EXTENSION MARKETPLACE</p>
        </div>
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
            placeholder="Search plugins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-brand-surface border border-brand-border rounded-xl text-brand-text placeholder-brand-text-muted focus:outline-none focus:border-brand-primary"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {categories.map((category, idx) => (
          <motion.button
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + idx * 0.03 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap',
              selectedCategory === category
                ? 'bg-brand-primary text-white shadow-glow-primary'
                : 'bg-brand-surface border border-brand-border text-brand-text hover:bg-brand-elevated'
            )}
          >
            {category}
          </motion.button>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPlugins.map((plugin, idx) => (
          <motion.div
            key={plugin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + idx * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-brand-surface border border-brand-border rounded-2xl p-6 hover:border-brand-primary/30 transition-all"
          >
            <motion.div
              whileHover={{ rotate: 5 }}
              className="w-16 h-16 rounded-xl bg-brand-primary/20 flex items-center justify-center mb-4"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-primary" />
            </motion.div>
            <h3 className="text-sm font-bold text-brand-text mb-1">{plugin.name}</h3>
            <p className="text-xs text-brand-text-muted font-mono mb-3">{plugin.author}</p>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-brand-elevated text-brand-text-muted">
                {plugin.category}
              </span>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-brand-elevated text-brand-text-muted">
                {plugin.price}
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-brand-warning" />
                <span className="text-sm text-brand-text font-bold">{plugin.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-brand-text-muted font-mono">
                <Download className="w-3 h-3" />
                <span>{plugin.downloads}</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full px-4 py-2 rounded-xl text-sm font-bold transition-colors',
                plugin.installed
                  ? 'bg-brand-success/20 text-brand-success'
                  : 'bg-brand-primary text-white hover:bg-brand-primary/90 shadow-glow-primary'
              )}
            >
              {plugin.installed ? 'Installed' : 'Install'}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
