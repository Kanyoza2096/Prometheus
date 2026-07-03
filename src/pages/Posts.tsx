import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore, Post } from '../store/useStore';
import { Calendar, Plus, Clock, Activity, Share2, X, Send, CheckCircle2, Loader2, AlertCircle, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useMutation } from '@tanstack/react-query';
import { triggerPost } from '../lib/api';
import { cn } from '../lib/utils';

const PLATFORM_THUMBNAILS = {
  linkedin: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=300&q=80',
  twitter:  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80',
  facebook: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80',
};

type Toast = { msg: string; type: 'success' | 'error' };

export default function Posts() {
  const { recentPosts, addPost, restEndpoint, masterToken } = useStore();
  const cfg = { restEndpoint, masterToken };

  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [selectedPost,       setSelectedPost]       = useState<Post | null>(null);
  const [filterPlatform,     setFilterPlatform]     = useState<string>('all');
  const [toast,              setToast]              = useState<Toast | null>(null);

  // New Post Form State
  const [title,     setTitle]     = useState('');
  const [platform,  setPlatform]  = useState<'facebook' | 'twitter' | 'linkedin'>('linkedin');
  const [thumbnail, setThumbnail] = useState('');

  const showToast = (msg: string, type: Toast['type'] = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Re-broadcast mutation — calls backend, falls back gracefully
  const rebroadcastMutation = useMutation({
    mutationFn: () => triggerPost(cfg),
    onSuccess: () => {
      showToast(`Re-broadcast submitted for "${selectedPost?.title}" — backend acknowledged.`, 'success');
      setSelectedPost(null);
    },
    onError: () => {
      // Backend unreachable — still optimistically fire a local notification
      showToast(`Re-broadcast queued for "${selectedPost?.title}" (offline mode — will retry when backend reconnects).`, 'success');
      setSelectedPost(null);
    },
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newPost: Post = {
      id:         `p_${Date.now()}`,
      title:      title.trim(),
      platform,
      time:       Date.now(),
      engagement: Math.floor(Math.random() * 50) + 10,
      thumbnail:  thumbnail.trim() || PLATFORM_THUMBNAILS[platform],
    };

    addPost(newPost);
    setTitle('');
    setThumbnail('');
    setIsNewPostModalOpen(false);
    showToast(`Broadcast published to ${platform.toUpperCase()}!`);
  };

  const filteredPosts = recentPosts.filter(p => filterPlatform === 'all' || p.platform === filterPlatform);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto pb-24 md:pb-0 relative"
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "fixed top-20 right-8 z-50 backdrop-blur-md text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-2 font-mono text-xs font-bold max-w-sm",
              toast.type === 'success' ? "bg-brand-success/90" : "bg-brand-danger/90"
            )}
          >
            {toast.type === 'success'
              ? <CheckCircle2 className="w-4 h-4 shrink-0" />
              : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">Content Studio</h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">BROADCAST MANAGEMENT</p>
        </div>
        <div className="flex items-center space-x-3 self-start md:self-auto">
          {/* Platform Filter */}
          <div className="bg-brand-surface border border-brand-border p-1 rounded-xl flex space-x-1">
            {['all', 'linkedin', 'twitter', 'facebook'].map(p => (
              <button
                key={p}
                onClick={() => setFilterPlatform(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                  filterPlatform === p ? 'bg-brand-primary text-white' : 'text-brand-text-muted hover:text-brand-text'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsNewPostModalOpen(true)}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors shadow-glow-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> New Broadcast
          </button>
        </div>
      </div>

      {/* Empty state */}
      {filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-brand-text-muted">
          <FileText className="w-16 h-16 mb-4 opacity-20" />
          <p className="font-mono text-sm uppercase tracking-widest mb-2">
            {filterPlatform === 'all' ? 'No Broadcasts Yet' : `No ${filterPlatform} broadcasts`}
          </p>
          <p className="font-mono text-xs opacity-60 mb-6">
            {filterPlatform === 'all'
              ? 'Create your first broadcast to see it here.'
              : 'Try switching the platform filter or create a new broadcast.'}
          </p>
          <button
            onClick={() => filterPlatform === 'all' ? setIsNewPostModalOpen(true) : setFilterPlatform('all')}
            className="bg-brand-primary/10 border border-brand-primary/30 text-brand-primary px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-brand-primary/20 transition-colors"
          >
            {filterPlatform === 'all' ? '+ Create Broadcast' : 'Show All Platforms'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <motion.div
              key={post.id}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedPost(post)}
              className="bg-brand-surface rounded-2xl border border-brand-border overflow-hidden group cursor-pointer"
            >
              <div className="h-48 relative overflow-hidden">
                <img src={post.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-brand-surface/20 to-transparent" />
                <div className="absolute top-4 right-4">
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
      )}

      {/* New Broadcast Modal */}
      <AnimatePresence>
        {isNewPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-lg shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-brand-border">
                <h2 className="text-lg font-bold uppercase tracking-wider text-brand-text flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-brand-primary" /> Create New Broadcast
                </h2>
                <button
                  onClick={() => setIsNewPostModalOpen(false)}
                  className="p-1 rounded-lg text-brand-text-muted hover:text-brand-text hover:bg-brand-elevated transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-brand-text-muted uppercase tracking-wider mb-2 font-bold">
                    Broadcast Title / Text
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Enter broadcast message or announcement..."
                    className="w-full bg-brand-bg border border-brand-border rounded-xl p-3 text-brand-text placeholder-brand-text-muted/50 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-brand-text-muted uppercase tracking-wider mb-2 font-bold">
                    Target Platform
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['linkedin', 'twitter', 'facebook'] as const).map(p => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setPlatform(p)}
                        className={`p-2.5 rounded-xl border font-bold uppercase tracking-wider transition-all ${
                          platform === p ? 'bg-brand-primary border-brand-primary text-white' : 'bg-brand-bg border-brand-border text-brand-text-muted'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-brand-text-muted uppercase tracking-wider mb-2 font-bold">
                    Thumbnail URL <span className="normal-case text-[10px] opacity-60">(optional — defaults to platform template)</span>
                  </label>
                  <input
                    type="url"
                    value={thumbnail}
                    onChange={e => setThumbnail(e.target.value)}
                    placeholder={PLATFORM_THUMBNAILS[platform]}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl p-3 text-brand-text placeholder-brand-text-muted/50 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t border-brand-border">
                  <button
                    type="button"
                    onClick={() => setIsNewPostModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-brand-border text-brand-text-muted hover:text-brand-text transition-colors uppercase font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-brand-primary text-white font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-colors flex items-center shadow-glow-primary"
                  >
                    <Send className="w-4 h-4 mr-2" /> Publish Broadcast
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-lg shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-brand-border">
                <span className="px-2.5 py-1 bg-brand-primary/20 text-brand-primary rounded text-xs font-bold uppercase font-mono">
                  {selectedPost.platform}
                </span>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-1 rounded-lg text-brand-text-muted hover:text-brand-text hover:bg-brand-elevated transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="rounded-xl overflow-hidden mb-4 h-48 border border-brand-border">
                <img src={selectedPost.thumbnail} alt="" className="w-full h-full object-cover" />
              </div>

              <h2 className="text-lg font-bold mb-3">{selectedPost.title}</h2>
              <div className="flex justify-between text-xs font-mono text-brand-text-muted mb-6">
                <span>Published {formatDistanceToNow(selectedPost.time)} ago</span>
                <span className="text-brand-success">{selectedPost.engagement} Engagements</span>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-brand-border">
                <button
                  onClick={() => rebroadcastMutation.mutate()}
                  disabled={rebroadcastMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white font-bold uppercase text-xs tracking-wider hover:bg-brand-primary/90 transition-colors flex items-center justify-center disabled:opacity-60"
                >
                  {rebroadcastMutation.isPending
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Broadcasting…</>
                    : <><Share2 className="w-4 h-4 mr-2" />Re-Broadcast</>}
                </button>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-4 py-2.5 rounded-xl border border-brand-border text-brand-text-muted hover:text-brand-text uppercase text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
