import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Search, Plus, Upload, FolderOpen, FileText, Trash2, Edit2, MoreVertical } from 'lucide-react';

const documents = [
  { id: 1, title: 'API Documentation', type: 'pdf', size: '2.4 MB', lastUpdated: '2024-01-15', category: 'Technical' },
  { id: 2, title: 'User Guide', type: 'docx', size: '1.8 MB', lastUpdated: '2024-01-12', category: 'General' },
  { id: 3, title: 'Architecture Overview', type: 'pdf', size: '3.2 MB', lastUpdated: '2024-01-10', category: 'Technical' },
  { id: 4, title: 'Security Policies', type: 'pdf', size: '1.1 MB', lastUpdated: '2024-01-08', category: 'Security' },
  { id: 5, title: 'Onboarding Checklist', type: 'xlsx', size: '0.5 MB', lastUpdated: '2024-01-05', category: 'Operations' },
  { id: 6, title: 'Marketing Materials', type: 'pptx', size: '15.6 MB', lastUpdated: '2024-01-03', category: 'Marketing' },
];

const categories = ['All', 'Technical', 'General', 'Security', 'Operations', 'Marketing'];

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
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
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
          <BookOpen className="w-8 h-8 mr-3 text-brand-primary" />
          Knowledge Base
        </h1>
        <p className="text-brand-text-muted text-sm font-mono mt-1">DOCUMENT MANAGEMENT & RAG SOURCES</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-muted" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-brand-surface border border-brand-border rounded-xl text-brand-text placeholder-brand-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
          />
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-3 bg-brand-elevated border border-brand-border rounded-xl text-brand-text text-sm font-bold hover:bg-brand-border/30 transition-colors flex items-center space-x-2" onClick={() => alert('Feature coming soon')}>
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </button>
          <button className="px-4 py-3 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors flex items-center space-x-2 shadow-glow-primary" onClick={() => alert('Feature coming soon')}>
            <Plus className="w-4 h-4" />
            <span>New Document</span>
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {categories.map((category, idx) => (
          <motion.button
            key={category}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 + idx * 0.05 }}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDocuments.map((doc, idx) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.45 + idx * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-brand-surface border border-brand-border rounded-2xl p-6 hover:border-brand-primary/30 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <motion.div
                whileHover={{ rotate: 5 }}
                className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center"
              >
                <FileText className="w-6 h-6 text-brand-primary" />
              </motion.div>
              <button className="text-brand-text-muted hover:text-brand-text transition-colors" onClick={() => alert('Feature coming soon')}>
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-sm font-bold text-brand-text mb-2 line-clamp-2">{doc.title}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-brand-elevated text-brand-text-muted">
                {doc.type}
              </span>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-brand-elevated text-brand-text-muted">
                {doc.category}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-brand-text-muted">
              <span>{doc.size}</span>
              <span>{doc.lastUpdated}</span>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-brand-border">
              <button className="flex-1 px-3 py-2 text-xs font-bold text-brand-text bg-brand-elevated rounded-lg hover:bg-brand-border/30 transition-colors flex items-center justify-center space-x-1" onClick={() => alert('Feature coming soon')}>
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button className="flex-1 px-3 py-2 text-xs font-bold text-brand-danger bg-brand-danger/10 rounded-lg hover:bg-brand-danger/20 transition-colors flex items-center justify-center space-x-1" onClick={() => alert('Feature coming soon')}>
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}