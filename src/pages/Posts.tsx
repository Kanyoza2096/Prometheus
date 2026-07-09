import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, FileText, Send, Share2, Star, Plus, Clock, Activity, 
  MoreHorizontal, ChevronLeft, ChevronRight, X, Image as ImageIcon,
  CheckCircle2, AlertCircle, Edit3,
  Brain
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { useStore } from '../store/useStore';

type TabId = 'calendar' | 'drafts' | 'published' | 'scheduled' | 'templates';
type Platform = 'facebook' | 'twitter' | 'linkedin' | 'instagram';

type PostMock = {
  id: string;
  title: string;
  excerpt: string;
  platform: Platform;
  date: string; // ISO string representation
  status: 'published' | 'scheduled' | 'draft';
  engagement?: number;
  wordCount?: number;
};

const TEMPLATES = [
  { id: 't1', name: 'Product Update', category: 'Announcement', prompt: 'Write an engaging post about our new feature launch...' },
  { id: 't2', name: 'Weekly Tips', category: 'Educational', prompt: 'Share 3 actionable tips regarding industry best practices...' },
  { id: 't3', name: 'Customer Spotlight', category: 'Engagement', prompt: 'Highlight a customer success story with metrics...' },
  { id: 't4', name: 'Event Promo', category: 'Promotional', prompt: 'Create urgency for our upcoming webinar next week...' },
  { id: 't5', name: 'Behind the Scenes', category: 'Culture', prompt: 'Share a photo of the team working on a hard problem...' },
  { id: 't6', name: 'Poll / Question', category: 'Engagement', prompt: 'Ask an open-ended question about current industry trends...' },
  { id: 't7', name: 'Flash Sale', category: 'Promotional', prompt: 'Write copy for a 24-hour flash sale with clear CTAs...' },
  { id: 't8', name: 'Milestone Celebrate', category: 'Announcement', prompt: 'Thank our followers for hitting 10k subscribers...' },
];

const PLATFORM_COLORS = {
  facebook: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  twitter: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  linkedin: 'text-blue-700 bg-blue-700/10 border-blue-700/20',
  instagram: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
};

const PLATFORM_LABELS = {
  facebook: 'Facebook',
  twitter: 'X (Twitter)',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
};

const generateDefaultPosts = (): PostMock[] => {
  const posts: PostMock[] = [];
  const today = new Date();
  
  posts.push({ id: 's1', title: 'New Feature Announcement', excerpt: 'We are thrilled to unveil our new platform analytics engine with native responsive widgets.', platform: 'twitter', date: addDays(today, 1).toISOString(), status: 'scheduled' });
  posts.push({ id: 's2', title: 'Weekly Insights #42', excerpt: 'Here are the top 3 things we learned from managing high-throughput multi-tenant deployments.', platform: 'linkedin', date: addDays(today, 2).toISOString(), status: 'scheduled' });
  posts.push({ id: 's3', title: 'Flash Sale Reminder', excerpt: 'Only 4 hours left to grab 50% off of premium API credits!', platform: 'facebook', date: addDays(today, 4).toISOString(), status: 'scheduled' });
  
  posts.push({ id: 'd1', title: 'Interview with CEO', excerpt: 'Deep dive into our 2026 roadmap and server-less compute vision.', platform: 'linkedin', date: today.toISOString(), status: 'draft', wordCount: 450 });
  posts.push({ id: 'd2', title: 'Behind the Scenes: Design', excerpt: 'How we rebuilt our workflows engine and optimized Framer Motion loops.', platform: 'instagram', date: today.toISOString(), status: 'draft', wordCount: 120 });
  posts.push({ id: 'd3', title: 'Quick Poll: Preferred tools', excerpt: 'Which state management library do you prefer for large scale applications?', platform: 'twitter', date: today.toISOString(), status: 'draft', wordCount: 45 });
  
  posts.push({ id: 'p1', title: 'Milestone: 10K Users!', excerpt: 'Thank you for your incredible support as we scale up.', platform: 'facebook', date: addDays(today, -1).toISOString(), status: 'published', engagement: 1205 });
  posts.push({ id: 'p2', title: 'System Uptime Report', excerpt: 'We hit a pristine 100% uptime metric across all regional datacenters.', platform: 'twitter', date: addDays(today, -2).toISOString(), status: 'published', engagement: 432 });

  return posts;
};

export default function Posts() {
  const triggerNotification = useStore((state) => state.triggerNotification);

  // States
  const [activeTab, setActiveTab] = useState<TabId>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  
  const [builderPlatform, setBuilderPlatform] = useState<Platform>('linkedin');
  const [builderTitle, setBuilderTitle] = useState('');
  const [builderContent, setBuilderContent] = useState('');
  const [scheduleDate, setScheduleDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [posts, setPosts] = useState<PostMock[]>(() => {
    try {
      const saved = localStorage.getItem('kanyoza_posts');
      return saved ? JSON.parse(saved) : generateDefaultPosts();
    } catch {
      return generateDefaultPosts();
    }
  });

  useEffect(() => {
    localStorage.setItem('kanyoza_posts', JSON.stringify(posts));
  }, [posts]);

  // Calendar Logic
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startDate = startOfWeek(monthStart);
  const calendarDays = Array.from({ length: 35 }).map((_, i) => addDays(startDate, i));

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Post Actions
  const handleSaveDraft = () => {
    if (!builderContent.trim()) {
      triggerNotification({ title: 'Validation Error', message: 'Content is required.', type: 'warning' });
      return;
    }
    const newPost: PostMock = {
      id: 'post_' + Date.now(),
      title: builderTitle.trim() || 'Untitled Post Draft',
      excerpt: builderContent.substring(0, 100) + '...',
      platform: builderPlatform,
      date: new Date().toISOString(),
      status: 'draft',
      wordCount: builderContent.split(/\s+/).length,
    };
    setPosts((prev) => [newPost, ...prev]);
    setIsBuilderOpen(false);
    resetBuilder();
    triggerNotification({ title: 'Draft Saved', message: `Saved draft for ${PLATFORM_LABELS[builderPlatform]}.`, type: 'success' });
  };

  const handlePublishNow = () => {
    if (!builderContent.trim()) {
      triggerNotification({ title: 'Validation Error', message: 'Content is required.', type: 'warning' });
      return;
    }
    const newPost: PostMock = {
      id: 'post_' + Date.now(),
      title: builderTitle.trim() || 'Instant Publish Content',
      excerpt: builderContent.substring(0, 100) + '...',
      platform: builderPlatform,
      date: new Date().toISOString(),
      status: 'published',
      engagement: 0,
      wordCount: builderContent.split(/\s+/).length,
    };
    setPosts((prev) => [newPost, ...prev]);
    setIsBuilderOpen(false);
    resetBuilder();
    setActiveTab('published');
    triggerNotification({ title: 'Content Dispatched', message: `Post is now LIVE on ${PLATFORM_LABELS[builderPlatform]}!`, type: 'success' });
  };

  const handleSchedulePost = () => {
    if (!builderContent.trim()) {
      triggerNotification({ title: 'Validation Error', message: 'Content is required.', type: 'warning' });
      return;
    }
    const newPost: PostMock = {
      id: 'post_' + Date.now(),
      title: builderTitle.trim() || 'Scheduled Publication',
      excerpt: builderContent.substring(0, 100) + '...',
      platform: builderPlatform,
      date: new Date(scheduleDate + 'T12:00:00').toISOString(),
      status: 'scheduled',
    };
    setPosts((prev) => [newPost, ...prev]);
    setIsBuilderOpen(false);
    resetBuilder();
    setActiveTab('scheduled');
    triggerNotification({ title: 'Slot Reserved', message: `Publication scheduled for ${format(new Date(newPost.date), 'MMM d, yyyy')}.`, type: 'success' });
  };

  const handleAIOptimize = () => {
    if (!builderContent.trim()) {
      triggerNotification({ title: 'Optimize Target Missing', message: 'Please write a simple draft or select a quick prompt first.', type: 'warning' });
      return;
    }
    setBuilderContent((prev) => prev + '\n\n🚀 Engineered with high-throughput platform optimizations and intelligent multi-tenant workflows! Connect with our system gateways now.');
    triggerNotification({ title: 'AI Copy Tuning Complete', message: 'Injected hyper-growth professional hashtags & engagement hooks.', type: 'success' });
  };

  const handleAddMedia = () => {
    triggerNotification({ title: 'Asset Repository', message: 'Select static attachments or workspace diagrams.', type: 'info' });
  };

  const handleMoreActions = (title: string) => {
    triggerNotification({ title: 'Actions Context', message: `Context rules parsed for "${title}".`, type: 'info' });
  };

  const resetBuilder = () => {
    setBuilderTitle('');
    setBuilderContent('');
    setBuilderPlatform('linkedin');
    setScheduleDate(format(new Date(), 'yyyy-MM-dd'));
  };

  // Category Filters
  const drafts = posts.filter(p => p.status === 'draft');
  const published = posts.filter(p => p.status === 'published');
  const scheduled = posts.filter(p => p.status === 'scheduled');
  const currentCategoryPosts = activeTab === 'drafts' ? drafts : activeTab === 'published' ? published : activeTab === 'scheduled' ? scheduled : [];

  const renderTabNavigation = () => (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6 border-b border-brand-border">
      {[
        { id: 'calendar', label: 'Calendar', icon: Calendar },
        { id: 'drafts', label: `Drafts (${drafts.length})`, icon: FileText },
        { id: 'published', label: `Published (${published.length})`, icon: Share2 },
        { id: 'scheduled', label: `Scheduled (${scheduled.length})`, icon: Clock },
        { id: 'templates', label: 'Templates', icon: Star },
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as TabId)}
          className={cn(
            "px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors flex items-center border-b-2",
            activeTab === tab.id 
              ? "border-brand-primary text-brand-primary" 
              : "border-transparent text-brand-text-muted hover:text-brand-text"
          )}
        >
          <tab.icon className="w-4 h-4 mr-2" />
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1600px] mx-auto pb-24 relative flex h-[calc(100vh-80px)]"
    >
      <div className={cn(
        "flex-1 flex flex-col min-h-0 overflow-y-auto px-4 md:px-8 pt-6 transition-all duration-300",
        isBuilderOpen ? "lg:mr-[400px]" : ""
      )}>
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">Content Studio</h1>
            <p className="text-brand-text-muted text-sm font-mono mt-1">OMNICHANNEL PUBLISHING HUB</p>
          </div>
          <button 
            onClick={() => { resetBuilder(); setIsBuilderOpen(true); }}
            className="bg-brand-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" /> New Post
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Scheduled', value: scheduled.length.toString(), icon: Clock, color: 'text-brand-accent' },
            { label: 'Published Live', value: published.length.toString(), icon: CheckCircle2, color: 'text-brand-success' },
            { label: 'Drafts Ready', value: drafts.length.toString(), icon: FileText, color: 'text-brand-warning' },
            { label: 'Templates Available', value: TEMPLATES.length.toString(), icon: Star, color: 'text-brand-primary' },
          ].map((stat, i) => (
            <div key={i} className="bg-brand-surface border border-brand-border rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <span className="text-brand-text-muted font-mono text-xs uppercase tracking-wider">{stat.label}</span>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <span className="text-2xl font-bold font-mono text-brand-text">{stat.value}</span>
            </div>
          ))}
        </div>

        {renderTabNavigation()}

        {/* TAB CONTENTS */}
        <div className="flex-1 pb-10">
          
          {/* CALENDAR TAB */}
          {activeTab === 'calendar' && (
            <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-elevated">
                <h2 className="text-sm font-bold font-mono text-brand-text uppercase tracking-widest">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-2">
                  <button onClick={handlePrevMonth} className="p-2 hover:bg-brand-surface rounded-lg text-brand-text-muted hover:text-brand-text border border-brand-border"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={handleToday} className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-brand-primary text-white rounded-lg shadow-glow-primary">Today</button>
                  <button onClick={handleNextMonth} className="p-2 hover:bg-brand-surface rounded-lg text-brand-text-muted hover:text-brand-text border border-brand-border"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 border-b border-brand-border text-center py-2 bg-brand-bg/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <span key={d} className="text-[10px] font-mono font-bold uppercase text-brand-text-muted tracking-wider">{d}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 grid-rows-5 divide-x divide-y divide-brand-border/60">
                {calendarDays.map((day, i) => {
                  const dayScheduled = posts.filter(p => p.status === 'scheduled' && isSameDay(new Date(p.date), day));
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "min-h-[100px] p-2 flex flex-col justify-between transition-colors",
                        isCurrentMonth ? "bg-brand-surface" : "bg-brand-bg/30 text-brand-text-muted",
                        isToday ? "bg-brand-primary/5" : ""
                      )}
                    >
                      <span className={cn(
                        "text-xs font-bold font-mono",
                        isToday ? "text-brand-primary underline" : "text-brand-text-muted"
                      )}>
                        {format(day, 'd')}
                      </span>
                      <div className="space-y-1 mt-1">
                        {dayScheduled.map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => {
                              setBuilderTitle(p.title);
                              setBuilderContent(p.excerpt);
                              setBuilderPlatform(p.platform);
                              setIsBuilderOpen(true);
                            }}
                            className={cn(
                              "text-[10px] p-1.5 rounded border font-sans truncate cursor-pointer transition-colors hover:bg-brand-elevated leading-tight",
                              PLATFORM_COLORS[p.platform]
                            )}
                          >
                            <span className="font-bold">{p.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* LIST VIEWS (DRAFTS, PUBLISHED, SCHEDULED) */}
          {['drafts', 'published', 'scheduled'].includes(activeTab) && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentCategoryPosts.map(post => (
                <div key={post.id} className="bg-brand-surface border border-brand-border rounded-2xl p-6 hover:border-brand-primary/30 transition-all flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border", PLATFORM_COLORS[post.platform])}>
                      {PLATFORM_LABELS[post.platform]}
                    </span>
                    <button className="text-brand-text-muted hover:text-brand-text p-1 hover:bg-brand-elevated rounded-lg" onClick={() => handleMoreActions(post.title)}>
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-brand-text leading-tight">{post.title}</h3>
                  <p className="text-sm text-brand-text-muted mb-6 flex-1 line-clamp-3">{post.excerpt}</p>
                  
                  <div className="flex justify-between items-center text-xs font-mono text-brand-text-muted mb-6 border-t border-brand-border/40 pt-4">
                    <span>{format(new Date(post.date), 'MMM d, yyyy')}</span>
                    {post.status === 'published' && <span className="text-brand-success font-bold">Engagement: {post.engagement}</span>}
                    {post.status === 'draft' && <span>{post.wordCount} words</span>}
                    {post.status === 'scheduled' && <span className="text-brand-accent font-bold">Scheduled</span>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setBuilderTitle(post.title);
                        setBuilderContent(post.excerpt);
                        setBuilderPlatform(post.platform);
                        setIsBuilderOpen(true);
                      }}
                      className="flex-1 py-2 bg-brand-bg border border-brand-border rounded-xl text-xs font-bold uppercase hover:bg-brand-elevated transition-colors flex justify-center items-center text-brand-text"
                    >
                      <Edit3 className="w-4 h-4 mr-2" /> Edit
                    </button>
                    {post.status === 'draft' && (
                      <button
                        className="flex-1 py-2 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-xl text-xs font-bold uppercase hover:bg-brand-primary/20 transition-colors flex justify-center items-center"
                        onClick={() => {
                          setBuilderTitle(post.title);
                          setBuilderContent(post.excerpt);
                          setBuilderPlatform(post.platform);
                          setIsBuilderOpen(true);
                          triggerNotification({ title: 'Scheduler Ready', message: 'Set date for draft publishing.', type: 'info' });
                        }}
                      >
                        <Calendar className="w-4 h-4 mr-2" /> Schedule
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {currentCategoryPosts.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-brand-border rounded-2xl bg-brand-surface">
                  <Share2 className="w-12 h-12 text-brand-border mx-auto mb-3 opacity-60" />
                  <p className="text-brand-text-muted font-mono uppercase text-xs tracking-wider">No active posts in active pipeline</p>
                </div>
              )}
            </div>
          )}

          {/* TEMPLATES TAB */}
          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {TEMPLATES.map(template => (
                <div key={template.id} className="bg-brand-surface border border-brand-border rounded-2xl p-5 hover:border-brand-primary/50 transition-colors flex flex-col">
                  <div className="mb-4">
                    <span className="px-2 py-1 bg-brand-bg border border-brand-border text-brand-text-muted rounded text-[10px] font-bold uppercase tracking-wider">
                      {template.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm mb-2 text-brand-text h-10 line-clamp-2 leading-snug">{template.name}</h3>
                  <p className="text-xs text-brand-text-muted italic flex-1 mb-6">"{template.prompt}"</p>
                  <button
                    onClick={() => {
                      setBuilderTitle(`Template: ${template.name}`);
                      setBuilderContent(template.prompt);
                      setIsBuilderOpen(true);
                      triggerNotification({ title: 'Template Active', message: 'Template content copied to generator.', type: 'info' });
                    }}
                    className="w-full py-2 bg-brand-elevated border border-brand-border rounded-xl text-xs font-bold uppercase hover:border-brand-primary/50 hover:text-brand-primary transition-colors flex justify-center items-center text-brand-text-muted"
                  >
                    <Star className="w-4 h-4 mr-2" /> Use Template
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* SIDE PANEL: POST BUILDER */}
      <AnimatePresence>
        {isBuilderOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsBuilderOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
            />
            
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed lg:absolute top-0 right-0 bottom-0 w-[400px] max-w-[90vw] bg-brand-surface border-l border-brand-border shadow-2xl z-50 flex flex-col h-full"
            >
              <div className="p-5 border-b border-brand-border flex items-center justify-between bg-brand-elevated">
                <h2 className="text-lg font-bold uppercase tracking-widest flex items-center">
                  <Edit3 className="w-5 h-5 mr-2 text-brand-primary" /> Post Builder
                </h2>
                <button onClick={() => setIsBuilderOpen(false)} className="p-1.5 text-brand-text-muted hover:text-brand-text rounded-lg hover:bg-brand-surface transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-1 font-mono">Title</label>
                  <input
                    type="text"
                    value={builderTitle}
                    onChange={(e) => setBuilderTitle(e.target.value)}
                    placeholder="Provide headline/index..."
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-brand-primary text-brand-text"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-3 font-mono">Platform</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(PLATFORM_LABELS) as Platform[]).map(plat => (
                      <button
                        key={plat}
                        onClick={() => setBuilderPlatform(plat)}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center",
                          builderPlatform === plat 
                            ? "bg-brand-primary text-white border-brand-primary shadow-glow-primary" 
                            : "bg-brand-bg border-brand-border text-brand-text-muted hover:text-brand-text"
                        )}
                      >
                        {PLATFORM_LABELS[plat]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted font-mono">Content Body</label>
                    <button
                      className="text-[10px] font-bold uppercase tracking-wider text-brand-accent hover:underline flex items-center"
                      onClick={handleAIOptimize}
                      type="button"
                    >
                      <Brain className="w-3.5 h-3.5 mr-1" /> AI Optimize
                    </button>
                  </div>
                  <textarea 
                    rows={8}
                    value={builderContent}
                    onChange={(e) => setBuilderContent(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl p-4 text-sm font-sans focus:outline-none focus:border-brand-primary resize-none placeholder-brand-text-muted/50 text-brand-text"
                    placeholder="Write your post here or use a prompt..."
                  />
                  <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-brand-text-muted">
                    <span>{builderContent.length} chars</span>
                    <button type="button" className="hover:text-brand-text flex items-center" onClick={handleAddMedia}><ImageIcon className="w-3 h-3 mr-1" /> Add Media</button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-3 font-mono">Quick Prompts</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Generate engaging post', 
                      'Write educational content', 
                      'Create promotional copy', 
                      'Draft announcement', 
                      'Write call-to-action'
                    ].map((prompt, i) => (
                      <button 
                        type="button"
                        key={i}
                        onClick={() => setBuilderContent(prev => prev ? prev + '\n' + prompt : prompt)}
                        className="px-3 py-1.5 bg-brand-bg border border-brand-border hover:border-brand-primary/50 text-brand-text-muted hover:text-brand-primary rounded-full text-[10px] font-mono transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-3 font-mono">Publish Date</label>
                  <div className="flex gap-2">
                    <input 
                      type="date" 
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="flex-1 bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-primary text-brand-text"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-brand-border bg-brand-elevated space-y-3 shrink-0">
                <button
                  className="w-full py-3 bg-brand-primary text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex justify-center items-center"
                  onClick={handlePublishNow}
                >
                  <Send className="w-4 h-4 mr-2" /> Publish Now
                </button>
                <div className="flex gap-2">
                  <button
                    className="flex-1 py-3 bg-brand-bg border border-brand-border text-brand-text-muted hover:text-brand-text rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                    onClick={handleSaveDraft}
                  >
                    Save Draft
                  </button>
                  <button
                    className="flex-1 py-3 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary hover:bg-brand-primary/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                    onClick={handleSchedulePost}
                  >
                    Schedule Slot
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
