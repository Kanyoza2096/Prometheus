import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, SlidersHorizontal, Target, Zap, Bot, MessageSquareText, Check, Loader2, AlertCircle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { fetchPersona, applyPersona, type PersonaPayload } from '../lib/api';

export default function AIEngine() {
  const restEndpoint = useStore(state => state.restEndpoint);
  const masterToken  = useStore(state => state.masterToken);
  const cfg = { restEndpoint, masterToken };

  const [tone,          setTone]          = useState(65);
  const [aggression,    setAggression]    = useState(30);
  const [humor,         setHumor]         = useState(50);
  const [primaryModel,  setPrimaryModel]  = useState<'pro' | 'flash'>('pro');
  const [promptOverride,setPromptOverride]= useState(
    'You are Kanyoza, an advanced enterprise automation bot. Always remain professional but slightly witty. Analyze user requests thoroughly.'
  );
  const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, kind: 'success' | 'error' = 'success') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch current persona from backend (pre-populate sliders) ─────────────
  const { data: livePersona } = useQuery({
    queryKey: ['persona', restEndpoint],
    queryFn: () => fetchPersona(cfg),
    retry: 1,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!livePersona) return;
    setTone(livePersona.tone);
    setAggression(livePersona.aggression);
    setHumor(livePersona.humor);
    setPromptOverride(livePersona.system_prompt);
    setPrimaryModel(livePersona.model === 'gemini-1.5-flash' ? 'flash' : 'pro');
  }, [livePersona]);

  // ── Apply Persona mutation ────────────────────────────────────────────────
  const applyMutation = useMutation({
    mutationFn: (payload: PersonaPayload) => applyPersona(cfg, payload),
    onSuccess: () => showToast('Personality matrix deployed to LLM orchestrator.'),
    onError:   (err: Error) => showToast(err.message, 'error'),
  });

  const handleApplyPersona = () => {
    applyMutation.mutate({
      tone,
      aggression,
      humor,
      model: primaryModel === 'pro' ? 'gemini-1.5-pro' : 'gemini-1.5-flash',
      system_prompt: promptOverride,
    });
  };

  const handleModelSelect = (model: 'pro' | 'flash') => {
    setPrimaryModel(model);
    const label = model === 'pro' ? 'Gemini 1.5 Pro' : 'Gemini 1.5 Flash';
    showToast(`Primary model set to ${label}`);
  };

  const getPreviewText = () => {
    let text = "Acknowledged. I'll execute the background sync now.";
    if      (humor > 66)      text += " Don't worry, I haven't broken the prod server... today.";
    else if (aggression > 66) text += " Stand aside and let me handle this immediately.";
    else if (tone < 33)       text += " Task queued with priority vector 0x01. Operating within nominal bounds.";
    else                      text += " Operating at optimal parameters.";
    return text;
  };

  const isApplying = applyMutation.isPending;

  const MODELS = [
    { key: 'pro'   as const, name: 'Gemini 1.5 Pro',   desc: 'Complex reasoning & workflow orchestration',      latency: '~1.2s'  },
    { key: 'flash' as const, name: 'Gemini 1.5 Flash', desc: 'High throughput text classification & routing',   latency: '~300ms' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto relative"
    >
      {/* Toast ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'fixed top-20 right-8 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-2 font-mono text-xs font-bold',
              toast.kind === 'success' ? 'bg-brand-primary text-white' : 'bg-red-600 text-white'
            )}
          >
            {toast.kind === 'success'
              ? <Check className="w-4 h-4 text-white" />
              : <AlertCircle className="w-4 h-4 text-white" />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <BrainCircuit className="w-8 h-8 mr-3 text-brand-primary" />
            AI Personality Matrix
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">LLM BEHAVIORAL OVERRIDES & CORE PROMPTS</p>
        </div>
        {livePersona && (
          <span className="text-[10px] font-mono text-brand-success flex items-center gap-1 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-success inline-block animate-pulse" />
            Synced from backend
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column: sliders + system prompt ─────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-6 text-brand-text">
              <SlidersHorizontal className="w-4 h-4 mr-2 text-brand-accent" />
              Behavioral Sliders
            </h2>
            <div className="space-y-8">
              {/* Tone */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-bold text-brand-text-muted uppercase tracking-wider">Communication Tone</label>
                  <span className="text-[10px] font-mono text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">
                    {tone < 33 ? 'SERIOUS' : tone < 66 ? 'BALANCED' : 'PLAYFUL'}
                  </span>
                </div>
                <input type="range" min="0" max="100" value={tone}
                  onChange={e => setTone(+e.target.value)}
                  className="w-full h-2 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-brand-primary" />
                <div className="flex justify-between text-[10px] font-mono text-brand-text-muted mt-2">
                  <span>Corporate</span><span>Casual</span>
                </div>
              </div>
              {/* Aggression */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-bold text-brand-text-muted uppercase tracking-wider">Assertiveness / Aggression</label>
                  <span className="text-[10px] font-mono text-brand-danger bg-brand-danger/10 px-2 py-0.5 rounded">
                    {aggression < 33 ? 'PASSIVE' : aggression < 66 ? 'ASSERTIVE' : 'AGGRESSIVE'}
                  </span>
                </div>
                <input type="range" min="0" max="100" value={aggression}
                  onChange={e => setAggression(+e.target.value)}
                  className="w-full h-2 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-brand-danger" />
                <div className="flex justify-between text-[10px] font-mono text-brand-text-muted mt-2">
                  <span>Accommodating</span><span>Direct/Pushy</span>
                </div>
              </div>
              {/* Humor */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-bold text-brand-text-muted uppercase tracking-wider">Humor Index</label>
                  <span className="text-[10px] font-mono text-brand-success bg-brand-success/10 px-2 py-0.5 rounded">
                    {humor < 33 ? 'DRY' : humor < 66 ? 'WITTY' : 'SATIRICAL'}
                  </span>
                </div>
                <input type="range" min="0" max="100" value={humor}
                  onChange={e => setHumor(+e.target.value)}
                  className="w-full h-2 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-brand-success" />
                <div className="flex justify-between text-[10px] font-mono text-brand-text-muted mt-2">
                  <span>Literal</span><span>Sarcastic</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Prompt */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-6 text-brand-text">
              <MessageSquareText className="w-4 h-4 mr-2 text-brand-primary" />
              System Prompt Override
            </h2>
            <textarea
              value={promptOverride}
              onChange={e => setPromptOverride(e.target.value)}
              className="w-full h-40 bg-brand-bg border border-brand-border rounded-xl p-4 text-sm font-mono text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all resize-none"
              placeholder="Enter system instructions..."
            />
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <span className="text-xs text-brand-text-muted font-mono">
                Supports standard Jinja2 template variables.
              </span>
              <button
                onClick={handleApplyPersona}
                disabled={isApplying}
                className="bg-brand-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isApplying
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deploying...</>
                  : <><Zap className="w-4 h-4 mr-2" />Apply Persona</>}
              </button>
            </div>
          </div>
        </div>

        {/* ── Right column: model selector + preview ───────────────────── */}
        <div className="space-y-6">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-6 text-brand-text border-b border-brand-border pb-4">
              <Target className="w-4 h-4 mr-2 text-brand-accent" />
              Active Models
            </h2>
            <div className="space-y-4">
              {MODELS.map(m => (
                <div
                  key={m.key}
                  onClick={() => handleModelSelect(m.key)}
                  className={cn(
                    'p-4 rounded-xl cursor-pointer transition-all border relative overflow-hidden',
                    primaryModel === m.key
                      ? 'bg-brand-elevated border-brand-primary/50 shadow-md'
                      : 'bg-brand-bg border-brand-border hover:border-brand-primary/30'
                  )}
                >
                  {primaryModel === m.key && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary" />
                  )}
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm">{m.name}</h3>
                    <span className={cn(
                      'flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
                      primaryModel === m.key
                        ? 'text-brand-success bg-brand-success/10'
                        : 'text-brand-text-muted bg-brand-surface'
                    )}>
                      {primaryModel === m.key ? 'Primary' : 'Select'}
                    </span>
                  </div>
                  <p className="text-xs text-brand-text-muted font-mono mb-2">{m.desc}</p>
                  <div className="flex items-center text-[10px] text-brand-text-muted font-mono">
                    <Zap className={cn('w-3 h-3 mr-1', primaryModel === m.key ? 'text-brand-primary' : 'text-brand-text-muted')} />
                    Latency: {m.latency}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personality Preview */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-2 text-brand-text relative z-10">
              <Bot className="w-4 h-4 mr-2 text-brand-primary" />
              Personality Preview
            </h2>
            <div className="p-4 bg-brand-bg rounded-xl border border-brand-border mt-4 relative z-10">
              <p className="text-sm text-brand-text-muted italic leading-relaxed">"{getPreviewText()}"</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
