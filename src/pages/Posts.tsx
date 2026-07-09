import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText, Send, Plus, Clock, X, CheckCircle2,
  Trash2, Loader2, AlertCircle, RefreshCcw, Facebook, Twitter, Linkedin,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { fetchPosts, createPost, deletePost, forcePostNow, type PostRecord } from '../lib/api';

type TabId = 'published' | 'drafts' | 'scheduled';

const PLATFORM_ICONS: Record<string, any> = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
};

const PLATFORM_COLORS: Record<string, string> = {
  facebook: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  twitter: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  linkedin: 'text-blue-700 bg-blue-700/10 border-blue-700/20',
};

function timeAgo(dateStr?: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr).getTime();
  if (Number.isNaN(d)) return '—';
  const diff = Math.max(0, Date.now() - d);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function SkeletonCard() {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 animate-pulse">
      <div className="h-4 w-24 bg-brand-elevated rounded mb-4" />
      <div className="h-5 w-3/4 bg-brand-elevated rounded mb-3" />
      <div className="h-3 w-full bg-brand-elevated rounded mb-2" />
      <div className="h-3 w-2/3 bg-brand-elevated rounded mb-6" />
      <div className="h-8 w-full bg-brand-elevated rounded" />
    </div>
  );
}

export default function Posts() {
  const restEndpoint = useStore(s => s.restEndpoint);
  const masterToken  = useStore(s => s.masterToken);
  const triggerNotification = useStore(s => s.triggerNotification);
  const cfg = { restEndpoint, masterToken };
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabId>('published');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PostRecord | null>(null);

  // Form state
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Announcement');
  const [caption, setCaption] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['facebook']);
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later' | 'draft'>('now');
  const [scheduledFor, setScheduledFor] = useState('');

  const stateParam = activeTab === 'published' ? 'published' : activeTab === 'drafts' ? 'draft' : 'scheduled';

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['posts', restEndpoint, activeTab],
    queryFn: () => fetchPosts(cfg, { state: stateParam, per_page: 20 }),
    retry: 1,
    staleTime: 15_000,
  });

  const posts: PostRecord[] = data?.posts ?? [];

  const resetForm = () => {
    setTopic(''); setCategory('Announcement'); setCaption('');
    setPlatforms(['facebook']); setScheduleMode('now'); setScheduledFor('');
  };

  const createMut = useMutation({
    mutationFn: () => createPost(cfg, {
      caption,
      topic,
      category,
      state: scheduleMode === 'draft' ? 'draft' : 'publish',
      platforms,
      scheduled_for: scheduleMode === 'later' ? scheduledFor : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      triggerNotification({ title: 'Post Created', message: 'Your post was saved successfully.', type: 'success' });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      triggerNotification({ title: 'Create Failed', message: err?.message || 'Could not create post.', type: 'warning' });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string | number) => deletePost(cfg, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      triggerNotification({ title: 'Post Deleted', message: 'The post has been removed.', type: 'success' });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      triggerNotification({ title: 'Delete Failed', message: err?.message || 'Could not delete post.', type: 'warning' });
    },
  });

  const forcePostMut = useMutation({
    mutationFn: () => forcePostNow(cfg),
    onSuccess: (d: any) => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      triggerNotification({ title: d?.queued ? 'Post Queued' : 'Queue Full', message: d?.message || 'Immediate post triggered.', type: d?.queued ? 'success' : 'warning' });
    },
    onError: (err: any) => {
      triggerNotification({ title: 'Trigger Failed', message: err?.message || 'Could not trigger post.', type: 'warning' });
    },
  });

  const togglePlatform = (p: string) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const submitDisabled = !caption.trim() || platforms.length === 0 || createMut.isPending || (scheduleMode === 'later' && !scheduledFor);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto pb-24 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <FileText className="w-7 h-7 mr-3 text-brand-primary" />
            Content Studio
            <span className="ml-3 text-xs font-mono px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              {posts.length}
            </span>
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">OMNICHANNEL PUBLISHING HUB</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => forcePostMut.mutate()}
            disabled={forcePostMut.isPending}
            className="bg-brand-elevated border border-brand-border text-brand-text px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider hover:border-brand-primary/40 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {forcePostMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Force Post
          </motion.button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> New Post
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-brand-border">
        {([
          { id: 'published', label: 'Published' },
          { id: 'drafts', label: 'Drafts' },
          { id: 'scheduled', label: 'Scheduled' },
        ] as { id: TabId; label: string }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2',
              activeTab === tab.id ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-text-muted hover:text-brand-text'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : isError ? (
        <div className="py-20 text-center border-2 border-dashed border-brand-danger/30 rounded-2xl bg-brand-surface">
          <AlertCircle className="w-10 h-10 text-brand-danger mx-auto mb-3" />
          <p className="text-brand-danger font-mono text-sm mb-4">Failed to load posts</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-brand-elevated border border-brand-border rounded-xl text-xs font-bold uppercase tracking-wider hover:border-brand-primary/40 inline-flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" /> Retry
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-brand-border rounded-2xl bg-brand-surface">
          <FileText className="w-12 h-12 text-brand-border mx-auto mb-3 opacity-60" />
          <p className="text-brand-text-muted font-mono text-sm">
            No posts yet. Create your first post to start engaging your audience.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post, i) => {
            const Icon = PLATFORM_ICONS[post.platform ?? ''] ?? Send;
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-brand-surface border border-brand-border rounded-2xl p-6 hover:border-brand-primary/30 transition-all flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={cn('px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5', PLATFORM_COLORS[post.platform ?? ''] ?? 'text-brand-text-muted bg-brand-elevated border-brand-border')}>
                    <Icon className="w-3 h-3" /> {post.platform ?? 'unknown'}
                  </span>
                  <button
                    onClick={() => setDeleteTarget(post)}
                    className="text-brand-text-muted hover:text-brand-danger p-1 hover:bg-brand-elevated rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-bold text-lg mb-2 text-brand-text leading-tight">
                  {post.topic || post.category || 'Untitled Post'}
                </h3>
                <p className="text-sm text-brand-text-muted mb-6 flex-1 line-clamp-3 font-sans">
                  {post.caption || 'No caption provided.'}
                </p>
                <div className="flex justify-between items-center text-xs font-mono text-brand-text-muted border-t border-brand-border/40 pt-4">
                  <span>{timeAgo(post.created_at || post.scheduled_for)}</span>
                  {activeTab === 'published' && (
                    <span className="text-brand-success font-bold">Engagement: {(post.engagement ?? 0).toLocaleString()}</span>
                  )}
                  {activeTab === 'scheduled' && (
                    <span className="text-brand-accent font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> Scheduled</span>
                  )}
                  {activeTab === 'drafts' && (
                    <span className="text-brand-warning font-bold">Draft</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* New Post Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-5 border-b border-brand-border flex items-center justify-between bg-brand-elevated sticky top-0">
                  <h2 className="text-lg font-bold uppercase tracking-widest">New Post</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-brand-text-muted hover:text-brand-text rounded-lg hover:bg-brand-surface">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-text-muted mb-1.5 block">Topic</label>
                    <input
                      value={topic} onChange={e => setTopic(e.target.value)}
                      placeholder="e.g. Product launch"
                      className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2.5 text-sm text-brand-text font-sans focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-text-muted mb-1.5 block">Category</label>
                    <select
                      value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2.5 text-sm text-brand-text font-sans focus:outline-none focus:border-brand-primary"
                    >
                      {['Announcement', 'Educational', 'Engagement', 'Promotional', 'Culture'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-text-muted mb-1.5 block">Caption *</label>
                    <textarea
                      value={caption} onChange={e => setCaption(e.target.value)}
                      rows={4}
                      placeholder="Write your post content..."
                      className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2.5 text-sm text-brand-text font-sans focus:outline-none focus:border-brand-primary resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-text-muted mb-1.5 block">Platforms *</label>
                    <div className="flex gap-2 flex-wrap">
                      {['facebook', 'twitter', 'linkedin'].map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => togglePlatform(p)}
                          className={cn(
                            'px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors',
                            platforms.includes(p) ? PLATFORM_COLORS[p] : 'bg-brand-bg border-brand-border text-brand-text-muted'
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-text-muted mb-1.5 block">Publishing</label>
                    <div className="flex gap-2">
                      {([
                        { id: 'now', label: 'Publish Now' },
                        { id: 'later', label: 'Schedule' },
                        { id: 'draft', label: 'Save Draft' },
                      ] as const).map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setScheduleMode(opt.id)}
                          className={cn(
                            'flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors',
                            scheduleMode === opt.id ? 'bg-brand-primary/20 border-brand-primary text-brand-primary' : 'bg-brand-bg border-brand-border text-brand-text-muted'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {scheduleMode === 'later' && (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-brand-text-muted mb-1.5 block">Date &amp; Time</label>
                      <input
                        type="datetime-local"
                        value={scheduledFor}
                        onChange={e => setScheduledFor(e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2.5 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  )}

                  {/* Preview */}
                  {caption.trim() && (
                    <div className="bg-brand-bg border border-brand-border rounded-xl p-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text-muted">Preview</span>
                      <p className="text-sm text-brand-text mt-2 whitespace-pre-wrap font-sans line-clamp-4">{caption}</p>
                    </div>
                  )}
                </div>
                <div className="p-5 border-t border-brand-border flex gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-xs font-bold uppercase hover:bg-brand-elevated text-brand-text"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => createMut.mutate()}
                    disabled={submitDisabled}
                    className="flex-1 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-bold uppercase hover:bg-brand-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Submit
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                <AlertCircle className="w-10 h-10 text-brand-danger mb-3" />
                <h3 className="text-lg font-bold text-brand-text mb-2">Delete Post?</h3>
                <p className="text-sm text-brand-text-muted mb-6 font-sans">
                  This will permanently remove "{deleteTarget.topic || deleteTarget.category || 'this post'}". This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-xs font-bold uppercase hover:bg-brand-elevated text-brand-text"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteMut.mutate(deleteTarget.id)}
                    disabled={deleteMut.isPending}
                    className="flex-1 py-2.5 bg-brand-danger text-white rounded-xl text-xs font-bold uppercase hover:bg-brand-danger/90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleteMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
