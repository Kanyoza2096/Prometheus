import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BrainCircuit, Cpu, Settings2, Sparkles, Check, RotateCcw,
  AlertCircle, Send, Bot, ChevronDown, Sliders, Shield,
  MessageSquare, RefreshCw,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { Spinner } from '../components/Spinner';
import {
  fetchAIConfig, updateAIConfig,
  fetchPersona, applyPersona,
  resetPersona, chatWithAI,
  fetchPersonaDirect, updatePersonaDirect,
  type AIConfigPayload, type PersonaPayload,
} from '../lib/api';

// ── constants ─────────────────────────────────────────────────────────────────

const MODEL_OPTIONS = [
  { id: 'gemini-1.5-pro',     name: 'Gemini 1.5 Pro',     provider: 'Google',    ctx: '1M tokens' },
  { id: 'gemini-1.5-flash',   name: 'Gemini 1.5 Flash',   provider: 'Google',    ctx: '1M tokens' },
  { id: 'gemini-2.0-flash',   name: 'Gemini 2.0 Flash',   provider: 'Google',    ctx: '1M tokens' },
  { id: 'gpt-4o',             name: 'GPT-4o',             provider: 'OpenAI',    ctx: '128k tokens' },
  { id: 'claude-3-5-sonnet',  name: 'Claude 3.5 Sonnet',  provider: 'Anthropic', ctx: '200k tokens' },
];

const SAFETY_LEVELS = ['none', 'low', 'medium', 'high'] as const;

const MOOD_CARDS = [
  { id: 'analytical',   label: 'Analytical',   emoji: '🧠', desc: 'Data-driven, precise' },
  { id: 'professional', label: 'Professional',  emoji: '💼', desc: 'Formal, polished' },
  { id: 'creative',     label: 'Creative',      emoji: '🎨', desc: 'Imaginative, expressive' },
  { id: 'urgent',       label: 'Urgent',        emoji: '⚡', desc: 'Direct, action-oriented' },
] as const;

// ── sub-components ────────────────────────────────────────────────────────────

function Toast({ msg, kind, onDismiss }: { msg: string; kind: 'success' | 'error'; onDismiss: () => void }) {
  useEffect(() => { const t = setTimeout(onDismiss, kind === 'error' ? 6000 : 4000); return () => clearTimeout(t); }, [kind, onDismiss]);
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'fixed top-20 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl border shadow-2xl text-sm font-bold font-mono',
        kind === 'success'
          ? 'bg-brand-success/10 text-brand-success border-brand-success/30'
          : 'bg-brand-danger/10 text-brand-danger border-brand-danger/30',
      )}
    >
      {kind === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {msg}
    </motion.div>
  );
}

function SliderRow({ label, value, onChange, min = 0, max = 100, step = 1, color = 'brand-primary' }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; color?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text-muted font-mono">{label}</span>
        <span className="text-xs font-bold font-mono text-brand-text">{value}</span>
      </div>
      <div className="relative h-2 bg-brand-elevated rounded-full">
        <div
          className={cn('absolute left-0 top-0 h-full rounded-full transition-all', `bg-${color}`)}
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex justify-between text-[9px] font-mono text-brand-text-muted">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function AIBrain() {
  const { restEndpoint, masterToken, setPersonaMood, personaMood } = useStore();
  const cfg = { restEndpoint, masterToken };
  const qc = useQueryClient();

  // ── toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, kind: 'success' | 'error' = 'success') => setToast({ msg, kind });

  // ── remote data ─────────────────────────────────────────────────────────────
  const configQ        = useQuery({ queryKey: ['ai-config',        restEndpoint], queryFn: () => fetchAIConfig(cfg),       retry: 1, staleTime: 30_000 });
  const personaQ       = useQuery({ queryKey: ['ai-persona',       restEndpoint], queryFn: () => fetchPersona(cfg),         retry: 1, staleTime: 30_000 });
  const personaDirectQ = useQuery({ queryKey: ['persona-direct',   restEndpoint], queryFn: () => fetchPersonaDirect(cfg),  retry: 1, staleTime: 30_000 });

  // ── local editable state ────────────────────────────────────────────────────
  const [model, setModel] = useState('gemini-1.5-pro');
  const [temperature, setTemperature] = useState(0.7);
  const [safetyLevel, setSafetyLevel] = useState<string>('medium');
  const [tone, setTone] = useState(50);
  const [aggression, setAggression] = useState(30);
  const [humor, setHumor] = useState(40);
  const [mood, setMood] = useState<'analytical' | 'professional' | 'creative' | 'urgent'>(personaMood);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [modelDropOpen, setModelDropOpen] = useState(false);

  // Sync remote → local when data arrives
  useEffect(() => {
    if (!configQ.data) return;
    const d = configQ.data;
    if (d.model) setModel(d.model);
    if (d.temperature !== undefined) setTemperature(d.temperature);
    if (d.safety_level) setSafetyLevel(d.safety_level);
    if (d.tone_assertiveness !== undefined) setTone(d.tone_assertiveness);
    if (d.tone_humor !== undefined) setHumor(d.tone_humor);
    if (d.tone_formality !== undefined) setAggression(d.tone_formality);
    if (d.persona_mood) setMood(d.persona_mood as 'analytical' | 'professional' | 'creative' | 'urgent');
    if (d.system_prompt_override) setSystemPrompt(d.system_prompt_override);
  }, [configQ.data]);

  useEffect(() => {
    if (!personaQ.data) return;
    const d = personaQ.data;
    if (d.tone !== undefined) setTone(d.tone);
    if (d.humor !== undefined) setHumor(d.humor);
    if (d.aggression !== undefined) setAggression(d.aggression);
    if (d.model) setModel(d.model);
    if (d.system_prompt) setSystemPrompt(d.system_prompt);
  }, [personaQ.data]);

  // Sync /persona (direct route) → fills any gaps not covered by /ai/persona
  useEffect(() => {
    if (!personaDirectQ.data) return;
    const d = personaDirectQ.data;
    if (d.tone      !== undefined && tone      === 50) setTone(d.tone);
    if (d.humor     !== undefined && humor     === 40) setHumor(d.humor);
    if (d.aggression !== undefined && aggression === 30) setAggression(d.aggression);
    if (d.model && model === 'gemini-1.5-pro') setModel(d.model);
    if (d.system_prompt && !systemPrompt) setSystemPrompt(d.system_prompt);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personaDirectQ.data]);

  // ── mutations ───────────────────────────────────────────────────────────────
  const saveConfigMut = useMutation({
    mutationFn: () => updateAIConfig(cfg, {
      model,
      temperature,
      safety_level: safetyLevel,
      tone_assertiveness: tone,
      tone_humor: humor,
      tone_formality: aggression,
      persona_mood: mood,
      system_prompt_override: systemPrompt,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-config', restEndpoint] });
      setPersonaMood(mood);
      showToast('AI configuration saved successfully.');
    },
    onError: (err: Error) => showToast(err?.message || 'Failed to save config.', 'error'),
  });

  const savePersonaMut = useMutation({
    mutationFn: () => applyPersona(cfg, { tone, aggression, humor, model, system_prompt: systemPrompt }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-persona', restEndpoint] });
      showToast('Persona saved.');
    },
    onError: (err: Error) => showToast(err?.message || 'Failed to save persona.', 'error'),
  });

  // Also persist to the direct /persona route
  const savePersonaDirectMut = useMutation({
    mutationFn: () => updatePersonaDirect(cfg, { tone, aggression, humor, model, system_prompt: systemPrompt }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['persona-direct', restEndpoint] }),
    onError: () => { /* silent — /persona is secondary */ },
  });

  interface ResetPersonaResponse {
    persona?: {
      tone?: number;
      humor?: number;
      aggression?: number;
      model?: string;
      system_prompt?: string;
    };
  }

  const resetMut = useMutation({
    mutationFn: () => resetPersona(cfg),
    onSuccess: (res: ResetPersonaResponse) => {
      if (res?.persona) {
        const p = res.persona;
        if (p.tone !== undefined) setTone(p.tone);
        if (p.humor !== undefined) setHumor(p.humor);
        if (p.aggression !== undefined) setAggression(p.aggression);
        if (p.model) setModel(p.model);
        if (p.system_prompt) setSystemPrompt(p.system_prompt);
      }
      qc.invalidateQueries({ queryKey: ['ai-persona', restEndpoint] });
      qc.invalidateQueries({ queryKey: ['ai-config', restEndpoint] });
      showToast('Persona reset to defaults.');
    },
    onError: (err: Error) => showToast(err?.message || 'Failed to reset persona.', 'error'),
  });

  // ── chat ─────────────────────────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const chatMut = useMutation({
    mutationFn: (msg: string) => chatWithAI(cfg, msg),
    onSuccess: (res: Record<string, unknown>, msg: string) => {
      const reply = (res?.response as string) || (res?.reply as string) || '(no response)';
      setChatMessages(prev => [...prev, { role: 'user', text: msg }, { role: 'ai', text: reply }]);
      setChatInput('');
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    },
    onError: (err: Error) => showToast(err?.message || 'Chat failed.', 'error'),
  });

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatMut.isPending) return;
    chatMut.mutate(chatInput.trim());
  };

  const isLoading = configQ.isLoading || personaQ.isLoading;
  const activeModel = MODEL_OPTIONS.find(m => m.id === model) ?? MODEL_OPTIONS[0];
  const isSaving = saveConfigMut.isPending || savePersonaMut.isPending;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-24">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key="toast" msg={toast.msg} kind={toast.kind} onDismiss={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-brand-primary" />
            AI Brain
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1 uppercase tracking-widest">Cognitive Engine Configuration</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { configQ.refetch(); personaQ.refetch(); }}
            className="p-2.5 bg-brand-elevated border border-brand-border rounded-xl text-brand-text-muted hover:text-brand-text transition-colors"
          >
            <RefreshCw className={cn('w-4 h-4', (configQ.isFetching || personaQ.isFetching) && 'animate-spin')} />
          </button>
          <button
            onClick={() => resetMut.mutate()}
            disabled={resetMut.isPending}
            className="px-4 py-2.5 bg-brand-elevated border border-brand-border rounded-xl text-xs font-bold uppercase tracking-wider text-brand-text-muted hover:text-brand-danger hover:border-brand-danger/40 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {resetMut.isPending ? <Spinner size={14} /> : <RotateCcw className="w-4 h-4" />}
            Reset Defaults
          </button>
          <button
            onClick={() => { saveConfigMut.mutate(); savePersonaMut.mutate(); savePersonaDirectMut.mutate(); }}
            disabled={isSaving || isLoading}
            className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Spinner size={14} /> : <Check className="w-4 h-4" />}
            Save All
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-brand-elevated animate-pulse rounded-2xl h-40 border border-brand-border" />
          ))}
        </div>
      )}

      {(configQ.isError || personaQ.isError) && !isLoading && (
        <div className="p-4 bg-brand-warning/10 border border-brand-warning/30 rounded-xl text-brand-warning text-sm font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Could not load AI config from backend — editing local values only.
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Model Selector ─────────────────────────────────────────────── */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-5 h-5 text-brand-primary" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text">Active Model</h2>
            </div>

            <div className="relative">
              <button
                onClick={() => setModelDropOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-brand-elevated border border-brand-border rounded-xl text-sm text-brand-text font-bold hover:border-brand-primary/40 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
                  {activeModel.name}
                  <span className="text-[10px] font-mono text-brand-text-muted">{activeModel.provider}</span>
                </span>
                <ChevronDown className={cn('w-4 h-4 text-brand-text-muted transition-transform', modelDropOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {modelDropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute z-20 top-full mt-1 w-full bg-brand-surface border border-brand-border rounded-xl shadow-2xl overflow-hidden"
                  >
                    {MODEL_OPTIONS.map(m => (
                      <button
                        key={m.id}
                        onClick={() => { setModel(m.id); setModelDropOpen(false); }}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-3 text-left hover:bg-brand-elevated transition-colors',
                          model === m.id && 'bg-brand-primary/10 text-brand-primary',
                        )}
                      >
                        <div>
                          <div className="text-sm font-bold">{m.name}</div>
                          <div className="text-[10px] font-mono text-brand-text-muted">{m.provider} · {m.ctx}</div>
                        </div>
                        {model === m.id && <Check className="w-4 h-4 text-brand-primary" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Temperature */}
            <SliderRow
              label={`Temperature — ${temperature.toFixed(2)}`}
              value={temperature}
              onChange={setTemperature}
              min={0} max={2} step={0.01}
              color="brand-accent"
            />

            {/* Safety */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-brand-text-muted" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text-muted font-mono">Safety Level</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {SAFETY_LEVELS.map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setSafetyLevel(lvl)}
                    className={cn(
                      'py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors',
                      safetyLevel === lvl
                        ? 'bg-brand-primary/20 border-brand-primary text-brand-primary'
                        : 'bg-brand-elevated border-brand-border text-brand-text-muted hover:border-brand-primary/30',
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Personality Sliders ─────────────────────────────────────────── */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="w-5 h-5 text-brand-accent" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text">Personality Matrix</h2>
            </div>
            <SliderRow label="Tone Assertiveness" value={tone} onChange={setTone} color="brand-primary" />
            <SliderRow label="Aggression" value={aggression} onChange={setAggression} color="brand-danger" />
            <SliderRow label="Humor" value={humor} onChange={setHumor} color="brand-warning" />
          </div>

          {/* ── Mood Selector ───────────────────────────────────────────────── */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-brand-warning" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text">Persona Mood</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MOOD_CARDS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={cn(
                    'p-4 rounded-2xl border text-left transition-all',
                    mood === m.id
                      ? 'bg-brand-primary/10 border-brand-primary shadow-glow-primary'
                      : 'bg-brand-elevated border-brand-border hover:border-brand-primary/30',
                  )}
                >
                  <div className="text-2xl mb-2">{m.emoji}</div>
                  <div className="text-xs font-bold text-brand-text uppercase tracking-wider">{m.label}</div>
                  <div className="text-[10px] text-brand-text-muted font-mono mt-0.5">{m.desc}</div>
                  {mood === m.id && <div className="mt-2 w-2 h-2 rounded-full bg-brand-primary" />}
                </button>
              ))}
            </div>
          </div>

          {/* ── System Prompt ───────────────────────────────────────────────── */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-5 h-5 text-brand-text-muted" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text">System Prompt Override</h2>
            </div>
            <textarea
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              rows={8}
              placeholder="Enter a custom system prompt to override the default AI instructions..."
              className="flex-1 w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-3 text-xs text-brand-text font-mono focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 resize-none"
            />
            <p className="text-[10px] text-brand-text-muted font-mono mt-2">
              {systemPrompt.length} chars · Leave blank to use default system prompt
            </p>
          </div>
        </div>
      )}

      {/* ── Test Chat ──────────────────────────────────────────────────────────── */}
      {!isLoading && (
        <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-brand-border bg-brand-elevated flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-accent" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text">Live Chat Test</h2>
            <span className="ml-auto text-[10px] font-mono text-brand-text-muted uppercase">POST /ai/chat</span>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-3 bg-brand-bg/40">
            {chatMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-brand-text-muted">
                <Bot className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-xs font-mono uppercase">Send a message to test the live AI</p>
              </div>
            )}
            {chatMessages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div className={cn(
                  'max-w-[75%] px-4 py-3 rounded-xl text-xs leading-relaxed border',
                  m.role === 'user'
                    ? 'bg-brand-primary border-brand-primary/40 text-white rounded-tr-none'
                    : 'bg-brand-elevated border-brand-border text-brand-text rounded-tl-none',
                )}>
                  {m.text}
                </div>
              </motion.div>
            ))}
            {chatMut.isPending && (
              <div className="flex justify-start">
                <div className="bg-brand-elevated border border-brand-border px-4 py-3 rounded-xl rounded-tl-none flex items-center gap-2 text-xs text-brand-text-muted">
                  <Spinner size={12} /> Thinking…
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleChat} className="p-4 border-t border-brand-border bg-brand-elevated/20 flex items-center gap-3">
            <input
              type="text"
              placeholder="Type a test message…"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              disabled={chatMut.isPending}
              className="flex-1 bg-brand-elevated border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text font-mono focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={chatMut.isPending || !chatInput.trim()}
              className="p-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-colors shadow-glow-primary disabled:opacity-50 flex items-center justify-center"
            >
              {chatMut.isPending ? <Spinner size={14} /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}
    </motion.div>
  );
}
