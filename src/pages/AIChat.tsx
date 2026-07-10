import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { MessageSquare, Send, Bot, User, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

const quickActions = [
  "Why did posting fail?",
  "Analyze today's errors",
  "Optimize scheduler",
  "Generate workflow",
];

export default function AIChat() {
  const { restEndpoint, masterToken } = useStore();
  const headers = masterToken ? { 'Content-Type': 'application/json', Authorization: `Bearer ${masterToken}` } : {};
  const base = restEndpoint.replace(/\/+$/, '');

  const [messages, setMessages] = useState<{ id: number; role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { id: Date.now(), role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${base}/ai/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: userMsg.content }),
      });
      const d = await res.json();
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: d.reply || d.response || 'No response received.',
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'AI service unavailable. Check your Gemini key.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-brand-border flex justify-between items-center bg-brand-elevated/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center border border-brand-primary/30">
            <Bot className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-brand-text">AI Chat</h2>
            <span className="text-[10px] font-mono text-brand-text-muted uppercase">Connected to Gemini</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-brand-text-muted font-mono text-xs uppercase">
            Send a message to test the AI
          </div>
        )}
        {messages.map(msg => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={cn("flex gap-3 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
            <div className="flex-shrink-0 mt-1">
              {msg.role === 'assistant' ? (
                <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-brand-elevated border border-brand-border flex items-center justify-center"><User className="w-4 h-4 text-brand-text-muted" /></div>
              )}
            </div>
            <div className={cn("px-4 py-3 rounded-2xl text-sm", msg.role === 'user' ? "bg-brand-primary text-white rounded-tr-sm" : "bg-brand-elevated border border-brand-border text-brand-text rounded-tl-sm")}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
            <div className="px-4 py-3 rounded-2xl bg-brand-elevated border border-brand-border text-brand-text-muted text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-brand-border bg-brand-elevated/30">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickActions.map(action => (
            <button key={action} onClick={() => setInput(action)}
              className="px-3 py-1.5 bg-brand-surface border border-brand-border hover:border-brand-primary hover:text-brand-primary text-[11px] font-mono text-brand-text-muted rounded-full transition-colors">
              {action}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask the AI..." className="flex-1 bg-brand-surface border border-brand-border rounded-xl px-4 py-3 min-h-[48px] max-h-32 text-sm text-brand-text resize-none focus:outline-none focus:border-brand-primary" rows={1} />
          <button onClick={handleSend} disabled={loading || !input.trim()}
            className="h-[48px] px-5 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 transition-colors">
            <Send className="w-4 h-4" /> Send
          </button>
        </div>
      </div>
    </div>
  );
}
