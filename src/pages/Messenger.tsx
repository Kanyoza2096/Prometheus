import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Search, Plus, Phone, Video, MoreVertical, Smile, Paperclip } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

const defaultConversations = [
  {
    id: 1,
    name: 'John Smith',
    avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=4F46E5&color=fff',
    lastMessage: 'Hey, can you send me the report?',
    time: '2 min ago',
    unread: 3,
    platform: 'Facebook',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=10B981&color=fff',
    lastMessage: 'Thanks for your help!',
    time: '15 min ago',
    unread: 0,
    platform: 'WhatsApp',
  },
  {
    id: 3,
    name: 'Michael Brown',
    avatar: 'https://ui-avatars.com/api/?name=Michael+Brown&background=F59E0B&color=fff',
    lastMessage: 'Let\'s schedule a meeting',
    time: '1 hour ago',
    unread: 1,
    platform: 'Telegram',
  },
  {
    id: 4,
    name: 'Emily Davis',
    avatar: 'https://ui-avatars.com/api/?name=Emily+Davis&background=EF4444&color=fff',
    lastMessage: 'Great work on the project!',
    time: '2 hours ago',
    unread: 0,
    platform: 'Instagram',
  },
];

const defaultChatsMap: Record<number, any[]> = {
  1: [
    { id: 101, sender: 'John Smith', text: 'Hey there!', time: '10:30 AM', isMe: false },
    { id: 102, sender: 'Me', text: 'Hi John! How can I help you?', time: '10:31 AM', isMe: true },
    { id: 103, sender: 'John Smith', text: 'I was wondering if you could send me the latest report.', time: '10:32 AM', isMe: false },
    { id: 104, sender: 'Me', text: 'Sure thing! I\'ll send it over right away.', time: '10:33 AM', isMe: true },
    { id: 105, sender: 'John Smith', text: 'Hey, can you send me the report?', time: '10:35 AM', isMe: false },
  ],
  2: [
    { id: 201, sender: 'Sarah Johnson', text: 'Excellent progress on the pipeline.', time: 'Yesterday', isMe: false },
    { id: 202, sender: 'Me', text: 'Thank you Sarah, we aim to deliver.', time: 'Yesterday', isMe: true },
    { id: 203, sender: 'Sarah Johnson', text: 'Thanks for your help!', time: '15 min ago', isMe: false },
  ],
  3: [
    { id: 301, sender: 'Michael Brown', text: 'Let\'s schedule a meeting', time: '1 hour ago', isMe: false },
  ],
  4: [
    { id: 401, sender: 'Emily Davis', text: 'Great work on the project!', time: '2 hours ago', isMe: false },
  ],
};

export default function Messenger() {
  const triggerNotification = useStore((state) => state.triggerNotification);

  // States
  const [conversations, setConversations] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('kanyoza_conversations');
      return saved ? JSON.parse(saved) : defaultConversations;
    } catch {
      return defaultConversations;
    }
  });

  const [chatsMap, setChatsMap] = useState<Record<number, any[]>>(() => {
    try {
      const saved = localStorage.getItem('kanyoza_chats_map');
      return saved ? JSON.parse(saved) : defaultChatsMap;
    } catch {
      return defaultChatsMap;
    }
  });

  const [selectedConvId, setSelectedConvId] = useState<number>(conversations[0]?.id || 1);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPlatform, setNewContactPlatform] = useState('WhatsApp');

  useEffect(() => {
    localStorage.setItem('kanyoza_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('kanyoza_chats_map', JSON.stringify(chatsMap));
  }, [chatsMap]);

  const selectedConversation = conversations.find((c) => c.id === selectedConvId) || conversations[0] || null;
  const activeMessages = selectedConversation ? (chatsMap[selectedConversation.id] || []) : [];

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage = {
      id: Date.now(),
      sender: 'Me',
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    // Update messages map
    const conversationId = selectedConversation.id;
    setChatsMap((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage],
    }));

    // Update conversation last message & unread
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessage: newMessage.text, time: 'Just now', unread: 0 }
          : c
      )
    );

    setMessageInput('');

    // Auto reply mock
    setTimeout(() => {
      const autoReply = {
        id: Date.now() + 1,
        sender: selectedConversation.name,
        text: `Understood. Processing request regarding: "${newMessage.text.substring(0, 20)}..."`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
      };

      setChatsMap((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), autoReply],
      }));

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, lastMessage: autoReply.text, time: 'Just now' }
            : c
        )
      );

      triggerNotification({
        title: 'New Message',
        message: `${selectedConversation.name}: ${autoReply.text}`,
        type: 'info',
      });
    }, 1500);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) {
      triggerNotification({
        title: 'Validation Error',
        message: 'Contact name is required.',
        type: 'warning',
      });
      return;
    }

    const nextId = Date.now();
    const newConv = {
      id: nextId,
      name: newContactName.trim(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newContactName)}&background=8B5CF6&color=fff`,
      lastMessage: 'Conversation initialized.',
      time: 'Just now',
      unread: 0,
      platform: newContactPlatform,
    };

    setConversations((prev) => [newConv, ...prev]);
    setChatsMap((prev) => ({
      ...prev,
      [nextId]: [
        { id: Date.now(), sender: newConv.name, text: `Hello! This is a secure chat on ${newContactPlatform}.`, time: 'Just now', isMe: false }
      ],
    }));

    setSelectedConvId(nextId);
    setNewContactName('');
    setShowAddContactForm(false);

    triggerNotification({
      title: 'Contact Initialized',
      message: `Direct channel created with ${newConv.name} on ${newContactPlatform}`,
      type: 'success',
    });
  };

  const handleTriggerAction = (actionName: string) => {
    triggerNotification({
      title: 'Protocol Error',
      message: `${actionName} system offline. Real-time media server requires peer gateway sync.`,
      type: 'warning',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 pb-20 md:pb-0"
    >
      {/* Conversation List */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full md:w-96 bg-brand-surface border border-brand-border rounded-2xl flex flex-col overflow-hidden shrink-0"
      >
        <div className="p-4 border-b border-brand-border bg-brand-elevated/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-brand-text">Omni-Channel Chats</h2>
              <span className="text-[10px] font-mono text-brand-text-muted">CENTRAL DECENTRALIZED MESSAGING</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-glow-primary hover:bg-brand-primary/90 transition-colors"
              onClick={() => setShowAddContactForm(!showAddContactForm)}
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>

          <AnimatePresence>
            {showAddContactForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddContact}
                className="mb-4 p-3 bg-brand-surface border border-brand-border rounded-xl space-y-2.5 overflow-hidden"
              >
                <div>
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-brand-elevated border border-brand-border rounded-lg text-xs text-brand-text placeholder-brand-text-muted focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="flex justify-between items-center gap-2">
                  <select
                    value={newContactPlatform}
                    onChange={(e) => setNewContactPlatform(e.target.value)}
                    className="bg-brand-elevated border border-brand-border rounded-lg text-[10px] text-brand-text py-1 px-2 focus:outline-none"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Telegram">Telegram</option>
                    <option value="Instagram">Instagram</option>
                  </select>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowAddContactForm(false)}
                      className="text-[10px] font-bold text-brand-text-muted hover:text-brand-text px-2 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="text-[10px] font-bold bg-brand-primary text-white px-2 py-1 rounded-md"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
            <input
              type="text"
              placeholder="Search chat sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text placeholder-brand-text-muted focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-brand-surface/40">
          {filteredConversations.map((conv, idx) => {
            const isSelected = selectedConvId === conv.id;
            return (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.04 }}
                onClick={() => {
                  setSelectedConvId(conv.id);
                  // Reset unread locally
                  setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c));
                }}
                className={cn(
                  'p-3 rounded-xl cursor-pointer transition-all border',
                  isSelected
                    ? 'bg-brand-primary/10 border-brand-primary/30 shadow-sm'
                    : 'bg-brand-elevated/50 border-transparent hover:border-brand-border'
                )}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={conv.avatar}
                    alt={conv.name}
                    className="w-10 h-10 rounded-full border border-brand-border"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xs font-bold text-brand-text truncate">{conv.name}</h3>
                      <span className="text-[9px] text-brand-text-muted font-mono">{conv.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-brand-text-muted truncate pr-2">{conv.lastMessage}</p>
                      {conv.unread > 0 && (
                        <span className="w-4 h-4 rounded-full bg-brand-danger text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-mono mt-1 inline-block uppercase text-brand-primary tracking-wider">{conv.platform}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {filteredConversations.length === 0 && (
            <div className="py-8 text-center text-xs text-brand-text-muted font-mono uppercase">
              No chat channels match search index
            </div>
          )}
        </div>
      </motion.div>

      {/* Chat Window */}
      {selectedConversation ? (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="flex-1 bg-brand-surface border border-brand-border rounded-2xl flex flex-col overflow-hidden"
        >
          {/* Chat Header */}
          <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-elevated/40">
            <div className="flex items-center gap-3">
              <img
                src={selectedConversation.avatar}
                alt={selectedConversation.name}
                className="w-10 h-10 rounded-full border border-brand-border"
              />
              <div>
                <h3 className="text-sm font-bold text-brand-text leading-tight">{selectedConversation.name}</h3>
                <span className="text-[10px] text-brand-primary font-mono tracking-wider uppercase">{selectedConversation.platform} SECURE CORRIDOR</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="w-9 h-9 rounded-lg bg-brand-elevated text-brand-text hover:bg-brand-border/40 transition-all border border-brand-border flex items-center justify-center"
                onClick={() => handleTriggerAction('VOIP Voice Uplink')}
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                className="w-9 h-9 rounded-lg bg-brand-elevated text-brand-text hover:bg-brand-border/40 transition-all border border-brand-border flex items-center justify-center"
                onClick={() => handleTriggerAction('Secure Video Feed')}
              >
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-surface/20">
            {activeMessages.map((msg: any, idx: number) => (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className={cn('flex', msg.isMe ? 'justify-end' : 'justify-start')}
              >
                <div className={cn(
                  'max-w-[70%] p-3 rounded-xl border leading-relaxed',
                  msg.isMe
                    ? 'bg-brand-primary border-brand-primary text-white rounded-tr-none'
                    : 'bg-brand-elevated border-brand-border text-brand-text rounded-tl-none'
                )}>
                  <p className="text-xs">{msg.text}</p>
                  <p className="text-[9px] font-mono opacity-80 text-right mt-1.5">{msg.time}</p>
                </div>
              </motion.div>
            ))}
            {activeMessages.length === 0 && (
              <div className="py-20 text-center text-xs text-brand-text-muted font-mono uppercase">
                Direct channel ready. Type a message below to initiate transmission.
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-4 border-t border-brand-border bg-brand-elevated/20">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-10 h-10 rounded-xl bg-brand-elevated text-brand-text hover:bg-brand-border/30 border border-brand-border transition-colors flex items-center justify-center"
                onClick={() => triggerNotification({ title: 'Keyboard Event', message: 'Emoji matrix initialized.', type: 'info' })}
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="w-10 h-10 rounded-xl bg-brand-elevated text-brand-text hover:bg-brand-border/30 border border-brand-border transition-colors flex items-center justify-center"
                onClick={() => triggerNotification({ title: 'Attachments Portal', message: 'Secure file upload gateway synced.', type: 'info' })}
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text placeholder-brand-text-muted focus:outline-none focus:border-brand-primary"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="flex-1 bg-brand-surface border border-brand-border rounded-2xl flex flex-col items-center justify-center text-brand-text-muted">
          <MessageSquare className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm font-mono uppercase">No active communication gateway</p>
        </div>
      )}
    </motion.div>
  );
}
