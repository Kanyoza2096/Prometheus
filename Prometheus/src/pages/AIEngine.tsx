import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, SlidersHorizontal, Target, Zap, Bot, MessageSquareText, Check, Loader2, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { fetchStatus } from '../lib/api';

const PERSONA_KEY = 'kanyoza_persona_v2';

interface StoredPersona {
  tone: number;
  aggression: number;
  humor: number;
  model: string;
  system_prompt: string;
}

const DEFAULT_PERSONA: StoredPersona = {
  tone: 65,
  aggression: 30,
  humor: 50,
  model: 'gemini-2.5-flash',
  system_prompt: 'You are Kanyoza, an advanced enterprise automation bot. Always remain professional but slightly witty. Analyze user requests thoroughly.',
};

function loadPersona(): StoredPersona {
  try {
    const raw = localStorage.getItem(PERSONA_KEY);
    if (raw) return { ...DEFAULT_PERSONA, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_PERSONA;
}

function savePersona(p: StoredPersona) {
  localStorage.setItem(PERSONA_KEY, JSON.stringify(p));
}

export default function AIEngine() {
  const restEndpoint = useStore(state => state.restEndpoint);
  const masterToken  = useStore(state => state.masterToken);
  const backendConfig = useStore(state => state.backendConfig);
  const cfg = { restEndpoint, masterToken };

  const saved = loadPersona();
  const [tone,          setTone]          = useState(saved.tone);
  const [aggression,    setAggression]    = useState(saved.aggression);
  const [humor,         setHumor]         = useState(saved.humor);
  const [primaryModel,  setPrimaryModel]  = useState(saved.model);
  const [promptOverride,setPromptOverride]= useState(saved.system_prompt);
  const [isSaving,      setIsSaving]      = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, kind: 'success' | 'error' = 'success') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch backend status to get real AI config
  const { data: statusData, isError: statusError } = useQuery({
    queryKey: ['backend-status', restEndpoint],
    queryFn:  () => fetchStatus(cfg),
    retry: 1,
    staleTime: 60_000,
  });

  // Build the available models list — prefer backend's real model
  const backendModel = statusData?.config?.gemini_model || backendConfig?.config?.gemini_model;

  const MODELS = backendModel
    ? [
        { key: backendModel,             name: backendModel,          desc: 'Active model configured on backend',           latency: '~400ms', isActive: true  },
        { key: 'gemini-1.5-pro',         name: 'Gemini 1.5 Pro',      desc: 'Complex reasoning & workflow orchestration',   latency: '~1.2s',  isActive: false },
        { key: 'gemini-1.5-flash',       name: 'Gemini 1.5 Flash',    desc: 'High throughput classification & routing',     latency: '~300ms', isActive: false },
      ].filter((m, i, arr) => arr.findIndex(x => x.key === m.key) === i)
    : [
        { key: 'gemini-1.5-pro',   name: 'Gemini 1.5 Pro',   desc: 'Complex reasoning & workflow orchestration',  latency: '~1.2s',  isActive: false },
        { key: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', desc: 'High throughput text classification & routing', latency: '~300ms', isActive: false },
      ];

  const handleApplyPersona = () => {
    setIsSaving(true);
    const persona: StoredPersona = { tone, aggression, humor, model: primaryModel, system_prompt: promptOverride };
    savePersona(persona);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Personality matrix saved and applied to session.');
    }, 600);
  };

  const handleModelSelect = (model: string) => {
    setPrimaryModel(model);
    const m = MODELS.find(x => x.key === model);
    showToast(`Primary model set to ${m?.name || model}`);
  };

  const getPreviewText = () => {
    let text = "Acknowledged. I'll execute the background sync now.";
    if      (humor > 66)      text += " Don't worry, I haven't broken the prod server... today.";
    else if (aggression > 66) text += " Stand aside and let me handle this immediately.";
    else if (tone < 33)       text += " Task queued with priority vector 0x01. Operating within nominal bounds.";
    else                      text += " Operating at optimal parameters.";
    return text;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto relative"
    >
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

      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <BrainCircuit className="w-8 h-8 mr-3 text-brand-primary" />
            AI Personality Matrix
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">LLM BEHAVIORAL OVERRIDES & CORE PROMPTS</p>
        </div>
        <div className="flex items-center gap-3">
          {statusData && (
            <span className="text-[10px] font-mono text-brand-success flex items-center gap-1 mb-1">
              <Wifi className="w-3 h-3" />
              Live config · v{statusData.version} · {statusData.config.environment}
            </span>
          )}
          {statusError && !statusData && (
            <span className="text-[10px] font-mono text-brand-warning flex items-center gap-1 mb-1">
              <WifiOff className="w-3 h-3" />
              Offline — using saved persona
            </span>
          )}
        </div>
      </div>

      {/* Live Backend Config Banner */}
      {statusData && (
        <div className="mb-6 p-4 rounded-xl bg-brand-elevated border border-brand-border grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
          <div>
            <p className="text-brand-text-muted uppercase tracking-wider mb-1">AI Provider</p>
            <p className="font-bold text-brand-primary uppercase">{statusData.config.ai_provider}</p>
          </div>
          <div>
            <p className="text-brand-text-muted uppercase tracking-wider mb-1">Active Model</p>
            <p className="font-bold text-brand-text">{statusData.config.gemini_model}</p>
          </div>
          <div>
            <p className="text-brand-text-muted uppercase tracking-wider mb-1">Gemini Key</p>
            <p className={cn('font-bold', statusData.config.gemini_key_configured ? 'text-brand-success' : 'text-brand-danger')}>
              {statusData.config.gemini_key_configured ? '● Configured' : '○ Missing'}
            </p>
          </div>
          <div>
            <p className="text-brand-text-muted uppercase tracking-wider mb-1">Facebook</p>
            <p className={cn('font-bold', statusData.config.facebook_configured ? 'text-brand-success' : 'text-brand-danger')}>
              {statusData.config.facebook_configured ? '● Configured' : '○ Missing'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-6 text-brand-text">
              <SlidersHorizontal className="w-4 h-4 mr-2 text-brand-accent" />
              Behavioral Sliders
            </h2>
            <div className="space-y-8">
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
                Persona is persisted locally and applied to all AI sessions.
              </span>
              <button
                onClick={handleApplyPersona}
                disabled={isSaving}
                className="bg-brand-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                  : <><Zap className="w-4 h-4 mr-2" />Apply Persona</>}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-6 text-brand-text border-b border-brand-border pb-4">
              <Target className="w-4 h-4 mr-2 text-brand-accent" />
              Model Selection
            </h2>
            <div className="space-y-3">
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
                    <div className="flex gap-1">
                      {m.isActive && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-brand-success/20 text-brand-success uppercase">
                          Backend
                        </span>
                      )}
                      <span className={cn(
                        'flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
                        primaryModel === m.key
                          ? 'text-brand-primary bg-brand-primary/10'
                          : 'text-brand-text-muted bg-brand-surface'
                      )}>
                        {primaryModel === m.key ? 'Active' : 'Select'}
                      </span>
                    </div>
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
