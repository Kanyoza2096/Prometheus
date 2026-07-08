import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Send, Search, Plus, Phone, Video, MoreVertical, Smile, Paperclip, Clock } from 'lucide-react';

const conversations = [
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

const messages = [
  { id: 1, sender: 'John Smith', text: 'Hey there!', time: '10:30 AM', isMe: false },
  { id: 2, sender: 'Me', text: 'Hi John! How can I help you?', time: '10:31 AM', isMe: true },
  { id: 3, sender: 'John Smith', text: 'I was wondering if you could send me the latest report.', time: '10:32 AM', isMe: false },
  { id: 4, sender: 'Me', text: 'Sure thing! I\'ll send it over right away.', time: '10:33 AM', isMe: true },
  { id: 5, sender: 'John Smith', text: 'Hey, can you send me the report?', time: '10:35 AM', isMe: false },
];

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Messenger() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageInput, setMessageInput] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-140px)] flex gap-6"
    >
      {/* Conversation List */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full md:w-96 bg-brand-surface border border-brand-border rounded-2xl flex flex-col"
      >
        <div className="p-4 border-b border-brand-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-brand-text">Messages</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text placeholder-brand-text-muted focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.map((conv, idx) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              whileHover={{ scale: 1.02, x: 4 }}
              onClick={() => setSelectedConversation(conv)}
              className={cn(
                'p-3 rounded-xl cursor-pointer transition-all',
                selectedConversation.id === conv.id
                  ? 'bg-brand-primary/10 border border-brand-primary/30'
                  : 'bg-brand-elevated border border-transparent hover:border-brand-border'
              )}
            >
              <div className="flex items-start gap-3">
                <motion.img
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  src={conv.avatar}
                  alt={conv.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-brand-text truncate">{conv.name}</h3>
                    <span className="text-[10px] text-brand-text-muted font-mono">{conv.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-brand-text-muted truncate">{conv.lastMessage}</p>
                    {conv.unread > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: 'spring' }}
                        className="w-5 h-5 rounded-full bg-brand-danger text-white text-[10px] font-bold flex items-center justify-center"
                      >
                        {conv.unread}
                      </motion.span>
                    )}
                  </div>
                  <span className="text-[9px] text-brand-text-muted font-mono mt-1 block">{conv.platform}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Chat Window */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
        className="flex-1 bg-brand-surface border border-brand-border rounded-2xl flex flex-col"
      >
        {/* Chat Header */}
        <div className="p-4 border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.img
              whileHover={{ scale: 1.1, rotate: 5 }}
              src={selectedConversation.avatar}
              alt={selectedConversation.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="text-sm font-bold text-brand-text">{selectedConversation.name}</h3>
              <p className="text-xs text-brand-text-muted font-mono">{selectedConversation.platform}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl bg-brand-elevated text-brand-text hover:bg-brand-border/30 transition-colors flex items-center justify-center"
            >
              <Phone className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl bg-brand-elevated text-brand-text hover:bg-brand-border/30 transition-colors flex items-center justify-center"
            >
              <Video className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl bg-brand-elevated text-brand-text hover:bg-brand-border/30 transition-colors flex items-center justify-center"
            >
              <MoreVertical className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.08 }}
              className={cn('flex', msg.isMe ? 'justify-end' : 'justify-start')}
            >
              <div className={cn(
                'max-w-[70%] p-3 rounded-2xl',
                msg.isMe
                  ? 'bg-brand-primary text-white rounded-tr-sm'
                  : 'bg-brand-elevated text-brand-text rounded-tl-sm'
              )}>
                <p className="text-sm mb-1">{msg.text}</p>
                <p className="text-[10px] font-mono opacity-70 text-right">{msg.time}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-brand-border">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl bg-brand-elevated text-brand-text hover:bg-brand-border/30 transition-colors flex items-center justify-center"
            >
              <Smile className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl bg-brand-elevated text-brand-text hover:bg-brand-border/30 transition-colors flex items-center justify-center"
            >
              <Paperclip className="w-5 h-5" />
            </motion.button>
            <input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 px-4 py-3 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text placeholder-brand-text-muted focus:outline-none focus:border-brand-primary"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}