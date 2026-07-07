import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Send, Bot, User, Settings, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';

const initialMessages = [
  { id: 1, role: 'assistant', content: 'Hello! I\'m Kanyoza AI. How can I help you today?', timestamp: '10:30 AM' },
  { id: 2, role: 'user', content: 'Can you help me create a new post?', timestamp: '10:31 AM' },
  { id: 3, role: 'assistant', content: 'Of course! I can help you create engaging content. What would you like to post about?', timestamp: '10:31 AM' },
];

export default function AIChat() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      role: 'user' as const,
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');

    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        role: 'assistant' as const,
        content: 'Thank you for your message! I\'m processing your request and will get back to you shortly.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-140px)] flex flex-col"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
          <MessageCircle className="w-8 h-8 mr-3 text-brand-primary" />
          AI Chat Console
        </h1>
        <p className="text-brand-text-muted text-sm font-mono mt-1">INTERACT WITH AI CORE DIRECTLY</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex-1 bg-brand-surface border border-brand-border rounded-2xl flex flex-col overflow-hidden"
      >
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message, idx) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className={cn(
                'flex gap-4',
                message.role === 'user' && 'justify-end'
              )}
            >
              <div className={cn(
                'flex gap-4 max-w-[80%]',
                message.role === 'user' && 'flex-row-reverse'
              )}>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: message.role === 'assistant' ? -5 : 5 }}
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    message.role === 'assistant' && 'bg-brand-primary/20',
                    message.role === 'user' && 'bg-brand-elevated'
                  )}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="w-5 h-5 text-brand-primary" />
                  ) : (
                    <User className="w-5 h-5 text-brand-text" />
                  )}
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    'p-4 rounded-2xl',
                    message.role === 'assistant'
                      ? 'bg-brand-elevated text-brand-text rounded-tl-sm border border-brand-border'
                      : 'bg-brand-primary text-white rounded-tr-sm'
                  )}
                >
                  <p className="text-sm mb-2">{message.content}</p>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-mono opacity-70">{message.timestamp}</span>
                    {message.role === 'assistant' && (
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="opacity-70 hover:opacity-100 transition-opacity"
                        >
                          <Copy className="w-3 h-3" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="opacity-70 hover:opacity-100 transition-opacity"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="opacity-70 hover:opacity-100 transition-opacity"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 border-t border-brand-border"
        >
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-brand-elevated border border-brand-border rounded-xl text-brand-text hover:bg-brand-border/30 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="w-full px-4 py-3 bg-brand-elevated border border-brand-border rounded-xl text-brand-text placeholder-brand-text-muted focus:outline-none focus:border-brand-primary"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-colors shadow-glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
