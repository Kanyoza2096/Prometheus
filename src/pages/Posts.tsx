import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { Calendar, Plus, Clock, Activity, Share2, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Posts() {
  const { recentPosts } = useStore();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto pb-24 md:pb-0"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">Content Studio</h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">BROADCAST MANAGEMENT</p>
        </div>
        <div className="flex items-center space-x-3 self-start md:self-auto">
          <button className="p-2 rounded-lg bg-brand-surface border border-brand-border text-brand-text-muted hover:text-brand-text transition-colors">
            <Calendar className="w-5 h-5" />
          </button>
          <button className="bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors shadow-glow-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" /> New Broadcast
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {recentPosts.map(post => (
          <motion.div 
            key={post.id}
            whileHover={{ y: -4 }}
            className="bg-brand-surface rounded-2xl border border-brand-border overflow-hidden group"
          >
            <div className="h-48 relative overflow-hidden">
              <img src={post.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-brand-surface/20 to-transparent"></div>
              <div className="absolute top-4 right-4 flex space-x-2">
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white">
                  {post.platform}
                </span>
              </div>
            </div>
            
            <div className="p-5 relative -mt-6">
              <div className="w-10 h-10 rounded-xl bg-brand-elevated border border-brand-border flex items-center justify-center mb-4 shadow-lg">
                <Share2 className="w-5 h-5 text-brand-accent" />
              </div>
              
              <h3 className="text-lg font-bold mb-2 line-clamp-2">{post.title}</h3>
              
              <div className="flex items-center justify-between text-xs font-mono text-brand-text-muted mt-6 pt-4 border-t border-brand-border">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {formatDistanceToNow(post.time)} ago
                </span>
                <span className="flex items-center text-brand-success">
                  <Activity className="w-4 h-4 mr-1.5" />
                  {post.engagement} eng
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
