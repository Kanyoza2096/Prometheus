import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, FileText, Send, Share2, Star, Plus, Clock, Activity, 
  MoreHorizontal, ChevronLeft, ChevronRight, X, Image as ImageIcon,
  CheckCircle2, AlertCircle, Edit3,
  Brain
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format, addDays, startOfWeek, addWeeks, isSameDay } from 'date-fns';

type TabId = 'calendar' | 'drafts' | 'published' | 'scheduled' | 'templates';
type Platform = 'facebook' | 'twitter' | 'linkedin' | 'instagram';

type PostMock = {
  id: string;
  title: string;
  excerpt: string;
  platform: Platform;
  date: Date;
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

const generateMockPosts = () => {
  const posts: PostMock[] = [];
  const today = new Date();
  
  // Scheduled
  posts.push({ id: 's1', title: 'New Feature Announcement', excerpt: 'We are thrilled to unveil...', platform: 'twitter', date: addDays(today, 1), status: 'scheduled' });
  posts.push({ id: 's2', title: 'Weekly Insights #42', excerpt: 'Here are the top 3 things we learned...', platform: 'linkedin', date: addDays(today, 2), status: 'scheduled' });
  posts.push({ id: 's3', title: 'Flash Sale Reminder', excerpt: 'Only 4 hours left to grab 50% off!', platform: 'facebook', date: addDays(today, 4), status: 'scheduled' });
  
  // Drafts
  posts.push({ id: 'd1', title: 'Interview with CEO', excerpt: 'Deep dive into our 2026 roadmap.', platform: 'linkedin', date: today, status: 'draft', wordCount: 450 });
  posts.push({ id: 'd2', title: 'Behind the Scenes: Design', excerpt: 'How we rebuilt our workflows engine.', platform: 'instagram', date: today, status: 'draft', wordCount: 120 });
  posts.push({ id: 'd3', title: 'Quick Poll: Preferred tools', excerpt: 'Which framework do you use daily?', platform: 'twitter', date: today, status: 'draft', wordCount: 45 });
  
  // Published
  posts.push({ id: 'p1', title: 'Milestone: 10K Users!', excerpt: 'Thank you for your support.', platform: 'facebook', date: addDays(today, -1), status: 'published', engagement: 1205 });
  posts.push({ id: 'p2', title: 'System Uptime Report', excerpt: '100% uptime this month.', platform: 'twitter', date: addDays(today, -2), status: 'published', engagement: 432 });

  return posts;
};

const MOCK_POSTS = generateMockPosts();

export default function Posts() {
  const [activeTab, setActiveTab] = useState<TabId>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  
  const [builderPlatform, setBuilderPlatform] = useState<Platform>('linkedin');
  const [builderContent, setBuilderContent] = useState('');
  
  // Calendar Logic
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startDate = startOfWeek(monthStart);
  
  const calendarDays = Array.from({ length: 35 }).map((_, i) => addDays(startDate, i));

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const renderTabNavigation = () => (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6 border-b border-brand-border">
      {[
        { id: 'calendar', label: 'Calendar', icon: Calendar },
        { id: 'drafts', label: 'Drafts', icon: FileText },
        { id: 'published', label: 'Published', icon: Share2 },
        { id: 'scheduled', label: 'Scheduled', icon: Clock },
        { id: 'templates', label: 'Templates', icon: Star },
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as TabId)}
          className={cn(
            "px-4 py-3 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors flex items-center border-b-2",
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
            onClick={() => setIsBuilderOpen(true)}
            className="bg-brand-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" /> New Post
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Scheduled', value: '14', icon: Clock, color: 'text-brand-accent' },
            { label: 'Published Today', value: '8', icon: CheckCircle2, color: 'text-brand-success' },
            { label: 'Drafts', value: '6', icon: FileText, color: 'text-brand-warning' },
            { label: 'Templates', value: '24', icon: Star, color: 'text-brand-primary' },
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
                <h2 className="text-lg font-bold font-mono text-brand-text uppercase tracking-widest">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex space-x-2">
                  <button onClick={handleToday} className="px-3 py-1.5 bg-brand-bg border border-brand-border rounded text-xs font-bold uppercase tracking-wider hover:bg-brand-surface">
                    Today
                  </button>
                  <button onClick={handlePrevMonth} className="p-1.5 bg-brand-bg border border-brand-border rounded hover:bg-brand-surface">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={handleNextMonth} className="p-1.5 bg-brand-bg border border-brand-border rounded hover:bg-brand-surface">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 border-b border-brand-border bg-brand-bg">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-2 text-center text-[10px] font-bold uppercase tracking-widest text-brand-text-muted">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 auto-rows-fr bg-brand-border gap-px flex-1">
                {calendarDays.map((day, i) => {
                  const dayPosts = MOCK_POSTS.filter(p => isSameDay(p.date, day));
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "min-h-[100px] p-2 bg-brand-surface transition-colors hover:bg-brand-elevated cursor-pointer group",
                        !isCurrentMonth && "opacity-50"
                      )}
                      onClick={() => setIsBuilderOpen(true)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={cn(
                          "w-6 h-6 flex items-center justify-center rounded-full text-xs font-mono font-bold",
                          isToday ? "bg-brand-primary text-white" : "text-brand-text-muted group-hover:text-brand-text"
                        )}>
                          {format(day, 'd')}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {dayPosts.map(post => (
                          <div key={post.id} className={cn(
                            "px-1.5 py-1 text-[10px] truncate rounded border flex items-center gap-1",
                            PLATFORM_COLORS[post.platform]
                          )}>
                            <div className="w-1 h-1 rounded-full bg-current shrink-0" />
                            {post.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DRAFTS TAB */}
          {activeTab === 'drafts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {MOCK_POSTS.filter(p => p.status === 'draft').map(post => (
                <div key={post.id} className="bg-brand-surface border border-brand-border rounded-2xl p-5 hover:border-brand-primary/50 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <span className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border", PLATFORM_COLORS[post.platform])}>
                      {PLATFORM_LABELS[post.platform]}
                    </span>
                    <button className="text-brand-text-muted hover:text-brand-text"><MoreHorizontal className="w-5 h-5" /></button>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-brand-text">{post.title}</h3>
                  <p className="text-sm text-brand-text-muted mb-6 line-clamp-2">{post.excerpt}</p>
                  <div className="flex justify-between items-center text-xs font-mono text-brand-text-muted mb-6 border-t border-brand-border pt-4">
                    <span>{format(post.date, 'MMM d, yyyy')}</span>
                    <span>{post.wordCount} words</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setIsBuilderOpen(true)} className="flex-1 py-2 bg-brand-bg border border-brand-border rounded-xl text-xs font-bold uppercase hover:bg-brand-elevated transition-colors flex justify-center items-center">
                      <Edit3 className="w-4 h-4 mr-2" /> Edit
                    </button>
                    <button className="flex-1 py-2 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-xl text-xs font-bold uppercase hover:bg-brand-primary/20 transition-colors flex justify-center items-center">
                      <Calendar className="w-4 h-4 mr-2" /> Schedule
                    </button>
                  </div>
                </div>
              ))}
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
                  <h3 className="font-bold text-lg mb-2 text-brand-text">{template.name}</h3>
                  <p className="text-sm text-brand-text-muted italic flex-1 mb-6">"{template.prompt}"</p>
                  <button onClick={() => { setBuilderContent(template.prompt); setIsBuilderOpen(true); }} className="w-full py-2 bg-brand-elevated border border-brand-border rounded-xl text-xs font-bold uppercase hover:border-brand-primary/50 hover:text-brand-primary transition-colors flex justify-center items-center">
                    <Star className="w-4 h-4 mr-2" /> Use Template
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* PLACEHOLDERS FOR OTHER TABS */}
          {['published', 'scheduled'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center py-24 text-brand-text-muted">
              <Share2 className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-mono text-sm uppercase tracking-widest mb-2">Displaying {activeTab} posts</p>
              <p className="font-mono text-xs opacity-60 mb-6">Switch back to Calendar or Drafts for full mock functionality.</p>
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
              className="fixed lg:absolute top-0 right-0 bottom-0 w-[400px] max-w-[90vw] bg-brand-surface border-l border-brand-border shadow-2xl z-50 flex flex-col"
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-3">Platform</label>
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
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">Content</label>
                    <button className="text-[10px] font-bold uppercase tracking-wider text-brand-accent hover:underline flex items-center">
                      <Brain className="w-3 h-3 mr-1" /> AI Optimize
                    </button>
                  </div>
                  <textarea 
                    rows={8}
                    value={builderContent}
                    onChange={(e) => setBuilderContent(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl p-4 text-sm font-sans focus:outline-none focus:border-brand-primary resize-none placeholder-brand-text-muted/50"
                    placeholder="Write your post here or use a prompt..."
                  />
                  <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-brand-text-muted">
                    <span>{builderContent.length} chars</span>
                    <button className="hover:text-brand-text flex items-center"><ImageIcon className="w-3 h-3 mr-1" /> Add Media</button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-3">Quick Prompts</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Generate engaging post', 
                      'Write educational content', 
                      'Create promotional copy', 
                      'Draft announcement', 
                      'Write call-to-action'
                    ].map((prompt, i) => (
                      <button 
                        key={i}
                        onClick={() => setBuilderContent(prompt)}
                        className="px-3 py-1.5 bg-brand-bg border border-brand-border hover:border-brand-primary/50 text-brand-text-muted hover:text-brand-primary rounded-full text-[10px] font-mono transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-3">Schedule</label>
                  <div className="flex gap-2">
                    <input 
                      type="date" 
                      className="flex-1 bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-primary text-brand-text"
                    />
                    <input 
                      type="time" 
                      className="w-32 bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-primary text-brand-text"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-brand-border bg-brand-elevated space-y-3">
                <button className="w-full py-3 bg-brand-primary text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex justify-center items-center">
                  <Send className="w-4 h-4 mr-2" /> Publish Now
                </button>
                <div className="flex gap-2">
                  <button className="flex-1 py-3 bg-brand-bg border border-brand-border text-brand-text-muted hover:text-brand-text rounded-xl text-sm font-bold uppercase tracking-wider transition-colors">
                    Save Draft
                  </button>
                  <button className="flex-1 py-3 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary hover:bg-brand-primary/20 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors">
                    Schedule
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
