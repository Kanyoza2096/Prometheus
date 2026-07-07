import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  MessageSquare, Send, Zap, Database, Globe, History, 
  Search, ShieldAlert, ZapIcon, Bot, User, Settings2,
  BrainCircuit
} from 'lucide-react';
import { cn } from '../lib/utils';

const initialConversation = [
  { id: 1, role: 'user', content: 'Why did posting fail at 14:30?' },
  { id: 2, role: 'assistant', content: 'I analyzed the logs. The failure at 14:30 was caused by Facebook API rate limiting (Error 32). Your page has a limit of 200 posts/day and hit 198/200. I\'ve adjusted the scheduler to stay within 80% of limits going forward.' },
  { id: 3, role: 'user', content: 'Analyze today\'s errors' },
  { id: 4, role: 'assistant', content: 'Today\'s error summary: 3 Critical, 8 High, 12 Medium severity issues. Primary concern: Instagram API token expired (needs refresh). Secondary: Redis memory at 89% — recommend increasing cache TTL.' },
  { id: 5, role: 'user', content: 'Generate a workflow for WhatsApp' },
  { id: 6, role: 'assistant', content: 'Here\'s a WhatsApp automation workflow:\n\n```\n[Incoming Message] → [Language Detection] → [Intent Classification] → [AI Response Generation] → [Personalization Layer] → [Send Response] → [Log to Supabase]\n```' },
];

const quickActions = [
  "Why did posting fail?",
  "Analyze today's errors",
  "Optimize scheduler",
  "Generate workflow",
  "Create plugin",
  "Scan security"
];

// Simple markdown renderer for code blocks
const formatMessage = (text: string) => {
  if (!text.includes('```')) return text;
  
  const parts = text.split(/```/);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      // Code block
      return (
        <pre key={i} className="bg-brand-bg/50 border border-brand-border p-4 rounded-xl font-mono text-xs overflow-x-auto my-3 text-brand-text">
          <code>{part.replace(/^\w+\n/, '')}</code>
        </pre>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

export default function AIChat() {
  const [messages, setMessages] = useState(initialConversation);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMsg = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    
    // Simulate AI thinking then responding
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: `I'm analyzing the platform data for your request: "${newMsg.content}". All systems report nominal status. The required action has been scheduled in the queue.`
      }]);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6 pb-6 md:pb-0">
      
      {/* Left Chat Area (2/3) */}
      <div className="flex-1 flex flex-col bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-brand-border flex justify-between items-center bg-brand-elevated/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center border border-brand-primary/30">
              <Bot className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-text leading-tight">AI Console</h2>
              <span className="text-[10px] font-mono text-brand-success uppercase tracking-widest flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-brand-success rounded-full" />
                Connected to Core
              </span>
            </div>
          </div>
          <button className="p-2 hover:bg-brand-surface rounded-lg text-brand-text-muted transition-colors">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
          {messages.map((msg, i) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className="flex-shrink-0 mt-1">
                {msg.role === 'assistant' ? (
                  <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center shadow-glow-primary">
                    <ZapIcon className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-brand-elevated border border-brand-border flex items-center justify-center">
                    <User className="w-4 h-4 text-brand-text-muted" />
                  </div>
                )}
              </div>
              <div className={cn(
                "px-5 py-4 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-brand-primary text-white rounded-tr-sm" 
                  : "bg-brand-elevated border border-brand-border text-brand-text rounded-tl-sm"
              )}>
                {formatMessage(msg.content)}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-5 border-t border-brand-border bg-brand-elevated/30">
          <div className="flex flex-wrap gap-2 mb-4">
            {quickActions.map(action => (
              <button 
                key={action}
                onClick={() => setInput(action)}
                className="px-3 py-1.5 bg-brand-surface border border-brand-border hover:border-brand-primary hover:text-brand-primary text-[11px] font-mono text-brand-text-muted rounded-full transition-colors whitespace-nowrap"
              >
                {action}
              </button>
            ))}
          </div>
          <div className="relative flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask the system..."
              className="flex-1 bg-brand-surface border border-brand-border rounded-xl px-4 py-3 min-h-[52px] max-h-32 text-sm text-brand-text resize-none focus:outline-none focus:border-brand-primary placeholder:text-brand-text-muted/50"
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="h-[52px] px-5 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-glow-primary"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Context Panel (1/3) */}
      <div className="hidden lg:flex w-80 flex-col gap-6">
        
        {/* Model Info */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
          <h3 className="text-[10px] font-mono text-brand-text-muted uppercase tracking-widest mb-4">AI Model Status</h3>
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-brand-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-primary/20 rounded-lg">
                <BrainCircuit className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-text">Gemini 1.5 Pro</p>
                <p className="text-[10px] text-brand-success font-mono">Active Engine</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-brand-text-muted">Context Window</span>
              <span className="text-brand-text font-mono">2M Tokens</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-brand-text-muted">Session Usage</span>
              <span className="text-brand-text font-mono">45.2k</span>
            </div>
            <div className="w-full h-1.5 bg-brand-elevated rounded-full mt-1">
              <div className="h-full bg-brand-primary rounded-full w-[2%]" />
            </div>
          </div>
        </div>

        {/* Platform Context */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
          <h3 className="text-[10px] font-mono text-brand-text-muted uppercase tracking-widest mb-4">Platform Context</h3>
          <div className="space-y-3">
            {[
              { name: 'Supabase Data', icon: Database, status: 'Connected', color: 'text-brand-success' },
              { name: 'Facebook Graph', icon: Globe, status: 'Degraded', color: 'text-brand-warning' },
              { name: 'Worker Queue', icon: Settings2, status: 'Processing', color: 'text-brand-primary' }
            ].map(svc => (
              <div key={svc.name} className="flex items-center justify-between p-3 bg-brand-elevated rounded-xl border border-brand-border">
                <div className="flex items-center gap-2">
                  <svc.icon className="w-4 h-4 text-brand-text-muted" />
                  <span className="text-xs font-bold text-brand-text">{svc.name}</span>
                </div>
                <span className={cn("text-[10px] font-mono uppercase", svc.color)}>{svc.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 flex-1 overflow-hidden flex flex-col">
          <h3 className="text-[10px] font-mono text-brand-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
            <History className="w-3 h-3" />
            Recent Threads
          </h3>
          <div className="space-y-2 overflow-y-auto pr-2">
            {[
              { title: 'API Rate Limit Analysis', date: '2 hrs ago', msgs: 12 },
              { title: 'New Tenant Provisioning', date: 'Yesterday', msgs: 4 },
              { title: 'Database Optimization', date: 'Oct 12', msgs: 28 },
              { title: 'Security Scan Review', date: 'Oct 10', msgs: 6 },
            ].map(thread => (
              <button key={thread.title} className="w-full text-left p-3 hover:bg-brand-elevated rounded-xl border border-transparent hover:border-brand-border transition-colors group">
                <p className="text-sm font-bold text-brand-text truncate group-hover:text-brand-primary transition-colors">{thread.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-brand-text-muted">{thread.date}</span>
                  <span className="text-[10px] text-brand-text-muted font-mono">{thread.msgs} msgs</span>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
