import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, SlidersHorizontal, Sparkles, Target, Zap, Bot, MessageSquareText, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AIEngine() {
  const [tone, setTone] = useState(65);
  const [aggression, setAggression] = useState(30);
  const [humor, setHumor] = useState(50);
  const [primaryModel, setPrimaryModel] = useState<'pro' | 'flash'>('pro');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [promptOverride, setPromptOverride] = useState(
    "You are Kanyoza, an advanced enterprise automation bot. Always remain professional but slightly witty. Analyze user requests thoroughly."
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApplyPersona = () => {
    showToast('AI Personality Matrix overrides deployed to LLM orchestrator.');
  };

  const getPreviewText = () => {
    let text = "Acknowledged. I'll execute the background sync now.";
    if (humor > 66) {
      text += " Don't worry, I haven't broken the prod server... today.";
    } else if (aggression > 66) {
      text += " Stand aside and let me handle this immediately.";
    } else if (tone < 33) {
      text += " Task queued with priority vector 0x01. Operating within nominal bounds.";
    } else {
      text += " Operating at optimal parameters.";
    }
    return text;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto relative"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 bg-brand-primary text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-2 font-mono text-xs font-bold"
          >
            <Check className="w-4 h-4 text-brand-success" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
          <BrainCircuit className="w-8 h-8 mr-3 text-brand-primary" />
          AI Personality Matrix
        </h1>
        <p className="text-brand-text-muted text-sm font-mono mt-1">LLM BEHAVIORAL OVERRIDES & CORE PROMPTS</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-6 text-brand-text">
              <SlidersHorizontal className="w-4 h-4 mr-2 text-brand-accent" />
              Behavioral Sliders
            </h2>

            <div className="space-y-8">
              {/* Tone Slider */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-bold text-brand-text-muted uppercase tracking-wider">
                    Communication Tone
                  </label>
                  <span className="text-[10px] font-mono text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">
                    {tone < 33 ? 'SERIOUS' : tone < 66 ? 'BALANCED' : 'PLAYFUL'}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={tone}
                  onChange={(e) => setTone(parseInt(e.target.value))}
                  className="w-full h-2 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
                <div className="flex justify-between text-[10px] font-mono text-brand-text-muted mt-2">
                  <span>Corporate</span>
                  <span>Casual</span>
                </div>
              </div>

              {/* Aggression Slider */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-bold text-brand-text-muted uppercase tracking-wider">
                    Assertiveness / Aggression
                  </label>
                  <span className="text-[10px] font-mono text-brand-danger bg-brand-danger/10 px-2 py-0.5 rounded">
                    {aggression < 33 ? 'PASSIVE' : aggression < 66 ? 'ASSERTIVE' : 'AGGRESSIVE'}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={aggression}
                  onChange={(e) => setAggression(parseInt(e.target.value))}
                  className="w-full h-2 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-brand-danger"
                />
                <div className="flex justify-between text-[10px] font-mono text-brand-text-muted mt-2">
                  <span>Accommodating</span>
                  <span>Direct/Pushy</span>
                </div>
              </div>

              {/* Humor Slider */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-bold text-brand-text-muted uppercase tracking-wider">
                    Humor Index
                  </label>
                  <span className="text-[10px] font-mono text-brand-success bg-brand-success/10 px-2 py-0.5 rounded">
                    {humor < 33 ? 'DRY' : humor < 66 ? 'WITTY' : 'SATIRICAL'}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={humor}
                  onChange={(e) => setHumor(parseInt(e.target.value))}
                  className="w-full h-2 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-brand-success"
                />
                <div className="flex justify-between text-[10px] font-mono text-brand-text-muted mt-2">
                  <span>Literal</span>
                  <span>Sarcastic</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-6 text-brand-text">
              <MessageSquareText className="w-4 h-4 mr-2 text-brand-primary" />
              System Prompt Override
            </h2>
            <div className="relative">
              <textarea
                value={promptOverride}
                onChange={(e) => setPromptOverride(e.target.value)}
                className="w-full h-40 bg-brand-bg border border-brand-border rounded-xl p-4 text-sm font-mono text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all resize-none"
                placeholder="Enter system instructions..."
              />
            </div>
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <span className="text-xs text-brand-text-muted font-mono">
                Supports standard Jinja2 template variables.
              </span>
              <button 
                onClick={handleApplyPersona}
                className="bg-brand-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center"
              >
                <Zap className="w-4 h-4 mr-2" />
                Apply Persona
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-6 text-brand-text border-b border-brand-border pb-4">
              <Target className="w-4 h-4 mr-2 text-brand-accent" />
              Active Models
            </h2>
            
            <div className="space-y-4">
              <div 
                onClick={() => { setPrimaryModel('pro'); showToast('Primary model set to Gemini 1.5 Pro'); }}
                className={cn(
                  "p-4 rounded-xl cursor-pointer transition-all border relative overflow-hidden",
                  primaryModel === 'pro' 
                    ? "bg-brand-elevated border-brand-primary/50 shadow-md" 
                    : "bg-brand-bg border-brand-border hover:border-brand-primary/30"
                )}
              >
                {primaryModel === 'pro' && <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary"></div>}
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-sm">Gemini 1.5 Pro</h3>
                  <span className={cn(
                    "flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                    primaryModel === 'pro' ? "text-brand-success bg-brand-success/10" : "text-brand-text-muted bg-brand-surface"
                  )}>
                    {primaryModel === 'pro' ? 'Primary' : 'Select'}
                  </span>
                </div>
                <p className="text-xs text-brand-text-muted font-mono mb-2">Used for complex reasoning & workflow orchestration</p>
                <div className="flex items-center text-[10px] text-brand-text-muted font-mono">
                  <Zap className="w-3 h-3 mr-1 text-brand-primary" /> Latency: ~1.2s
                </div>
              </div>

              <div 
                onClick={() => { setPrimaryModel('flash'); showToast('Primary model set to Gemini 1.5 Flash'); }}
                className={cn(
                  "p-4 rounded-xl cursor-pointer transition-all border relative overflow-hidden",
                  primaryModel === 'flash' 
                    ? "bg-brand-elevated border-brand-primary/50 shadow-md" 
                    : "bg-brand-bg border-brand-border hover:border-brand-primary/30"
                )}
              >
                {primaryModel === 'flash' && <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary"></div>}
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-sm">Gemini 1.5 Flash</h3>
                  <span className={cn(
                    "flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                    primaryModel === 'flash' ? "text-brand-success bg-brand-success/10" : "text-brand-text-muted bg-brand-surface"
                  )}>
                    {primaryModel === 'flash' ? 'Primary' : 'Select'}
                  </span>
                </div>
                <p className="text-xs text-brand-text-muted font-mono mb-2">High throughput text classification & routing</p>
                <div className="flex items-center text-[10px] text-brand-text-muted font-mono">
                  <Zap className="w-3 h-3 mr-1 text-brand-text-muted" /> Latency: ~300ms
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-2 text-brand-text relative z-10">
              <Bot className="w-4 h-4 mr-2 text-brand-primary" />
              Personality Preview
            </h2>
            <div className="p-4 bg-brand-bg rounded-xl border border-brand-border mt-4 relative z-10">
              <p className="text-sm text-brand-text-muted italic leading-relaxed">
                "{getPreviewText()}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
