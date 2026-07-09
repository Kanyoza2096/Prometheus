import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { Spinner } from '../components/Spinner';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { fetchConversations, fetchConversation, sendMessageReply, type ConversationSummary, type MessageEntry } from '../lib/api';

export default function Messenger() {
  const { restEndpoint, masterToken, triggerNotification } = useStore();
  const cfg = { restEndpoint, masterToken };
  const qc = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');

  const {
    data: convData,
    isLoading: convLoading,
    isError: convError,
    refetch: refetchConvs,
  } = useQuery({
    queryKey: ['conversations', restEndpoint],
    queryFn: () => fetchConversations(cfg),
    refetchInterval: 20_000,
  });

  const conversations: ConversationSummary[] = convData?.conversations ?? [];
  const activeId = selectedId ?? conversations[0]?.sender_id ?? null;

  const {
    data: msgData,
    isLoading: msgLoading,
    isError: msgError,
  } = useQuery({
    queryKey: ['conversation', restEndpoint, activeId],
    queryFn: () => fetchConversation(cfg, activeId as string),
    enabled: !!activeId,
    refetchInterval: 10_000,
  });

  const messages: MessageEntry[] = msgData?.messages ?? [];

  const replyMut = useMutation({
    mutationFn: (text: string) => sendMessageReply(cfg, activeId as string, text),
    onSuccess: () => {
      setMessageInput('');
      qc.invalidateQueries({ queryKey: ['conversation', restEndpoint, activeId] });
      qc.invalidateQueries({ queryKey: ['conversations', restEndpoint] });
    },
    onError: (err: any) => {
      triggerNotification({ title: 'Send Failed', message: err?.message || 'Could not send reply.', type: 'warning' });
    },
  });

  const filteredConversations = useMemo(
    () =>
      conversations.filter(
        c =>
          (c.name || c.sender_id).toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.last_message || '').toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [conversations, searchQuery]
  );

  const selectedConversation = conversations.find(c => c.sender_id === activeId) || null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = messageInput.trim();
    if (!text || !activeId || replyMut.isPending) return;
    replyMut.mutate(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 pb-20 md:pb-0"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full md:w-96 bg-brand-surface border border-brand-border rounded-2xl flex flex-col overflow-hidden shrink-0"
      >
        <div className="p-4 border-b border-brand-border bg-brand-elevated/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-brand-text">Omni-Channel Inbox</h2>
              <span className="text-[10px] font-mono text-brand-text-muted">LIVE CONVERSATIONS</span>
            </div>
            <button
              onClick={() => refetchConvs()}
              className="w-10 h-10 rounded-xl bg-brand-elevated text-brand-text flex items-center justify-center border border-brand-border hover:bg-brand-border/30 transition-colors"
            >
              <RefreshCw className={cn('w-4 h-4', convLoading && 'animate-spin')} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text placeholder-brand-text-muted focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-brand-surface/40">
          {convLoading && (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-brand-elevated/60 rounded-xl animate-pulse" />
              ))}
            </div>
          )}
          {convError && (
            <div className="py-8 text-center text-xs text-brand-danger font-mono flex flex-col items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Failed to load conversations
            </div>
          )}
          {!convLoading && !convError && filteredConversations.map((conv, idx) => {
            const isSelected = activeId === conv.sender_id;
            return (
              <motion.div
                key={conv.sender_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + idx * 0.03 }}
                onClick={() => setSelectedId(conv.sender_id)}
                className={cn(
                  'p-3 rounded-xl cursor-pointer transition-all border',
                  isSelected
                    ? 'bg-brand-primary/10 border-brand-primary/30 shadow-sm'
                    : 'bg-brand-elevated/50 border-transparent hover:border-brand-border'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full border border-brand-border bg-brand-elevated flex items-center justify-center text-xs font-bold text-brand-text-muted shrink-0">
                    {(conv.name || conv.sender_id).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xs font-bold text-brand-text truncate">{conv.name || conv.sender_id}</h3>
                      <span className="text-[9px] text-brand-text-muted font-mono">{conv.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-brand-text-muted truncate pr-2">{conv.last_message}</p>
                      {!!conv.unread && (
                        <span className="w-4 h-4 rounded-full bg-brand-danger text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {!convLoading && !convError && filteredConversations.length === 0 && (
            <div className="py-8 text-center text-xs text-brand-text-muted font-mono uppercase">
              No conversations found
            </div>
          )}
        </div>
      </motion.div>

      {selectedConversation || activeId ? (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="flex-1 bg-brand-surface border border-brand-border rounded-2xl flex flex-col overflow-hidden"
        >
          <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-elevated/40">
            <div>
              <h3 className="text-sm font-bold text-brand-text leading-tight">
                {selectedConversation?.name || activeId}
              </h3>
              <span className="text-[10px] text-brand-primary font-mono tracking-wider uppercase">Live channel</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-surface/20">
            {msgLoading && (
              <div className="flex justify-center py-10">
                <Spinner size={20} />
              </div>
            )}
            {msgError && (
              <div className="py-10 text-center text-xs text-brand-danger font-mono">Failed to load messages</div>
            )}
            {!msgLoading && !msgError && messages.map((msg, idx) => (
              <motion.div
                key={msg.id ?? idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className={cn('flex', msg.is_me ? 'justify-end' : 'justify-start')}
              >
                <div className={cn(
                  'max-w-[70%] p-3 rounded-xl border leading-relaxed',
                  msg.is_me
                    ? 'bg-brand-primary border-brand-primary text-white rounded-tr-none'
                    : 'bg-brand-elevated border-brand-border text-brand-text rounded-tl-none'
                )}>
                  <p className="text-xs">{msg.text}</p>
                  {msg.time && <p className="text-[9px] font-mono opacity-80 text-right mt-1.5">{msg.time}</p>}
                </div>
              </motion.div>
            ))}
            {!msgLoading && !msgError && messages.length === 0 && (
              <div className="py-20 text-center text-xs text-brand-text-muted font-mono uppercase">
                No messages yet in this channel
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-brand-border bg-brand-elevated/20">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a reply..."
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                disabled={replyMut.isPending}
                className="flex-1 px-4 py-2.5 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text placeholder-brand-text-muted focus:outline-none focus:border-brand-primary disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={replyMut.isPending || !messageInput.trim()}
                className="w-10 h-10 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center justify-center disabled:opacity-50"
              >
                {replyMut.isPending ? <Spinner size={16} /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="flex-1 bg-brand-surface border border-brand-border rounded-2xl flex flex-col items-center justify-center text-brand-text-muted">
          <MessageSquare className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm font-mono uppercase">No active conversation</p>
        </div>
      )}
    </motion.div>
  );
}
