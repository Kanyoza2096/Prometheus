import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, WifiOff, X, Zap, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface UplinkDownOverlayProps {
  socketConnected: boolean;
  isUsingLiveBackendData: boolean;
  onRetry: () => Promise<void>;
}

const COUNTDOWN_SECS = 30;
const BOOT_GRACE_MS  = 5000;

type Phase = 'hidden' | 'countdown' | 'retrying' | 'success';

// Module-level ref so the async retry callback can read the latest value without stale closure
const _socketRef = { current: false };
export function syncSocketRef(val: boolean) { _socketRef.current = val; }

export default function UplinkDownOverlay({
  socketConnected,
  isUsingLiveBackendData,
  onRetry,
}: UplinkDownOverlayProps) {
  const [phase,      setPhase]      = useState<Phase>('hidden');
  const [countdown,  setCountdown]  = useState(COUNTDOWN_SECS);
  const [dismissed,  setDismissed]  = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError,  setLastError]  = useState<string | null>(null);

  const bootedRef         = useRef(false);
  const wasEverConnected  = useRef(false);
  const timerRef          = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef          = useRef<Phase>('hidden');

  // Keep phaseRef in sync so callbacks don't read stale state
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Boot grace period
  useEffect(() => {
    const t = setTimeout(() => { bootedRef.current = true; }, BOOT_GRACE_MS);
    return () => clearTimeout(t);
  }, []);

  // Track whether the socket was ever successfully connected this session
  useEffect(() => {
    if (socketConnected) {
      wasEverConnected.current = true;
    }
  }, [socketConnected]);

  // React to connection changes after boot
  // Only surface the overlay if the socket was previously connected and then dropped
  // (i.e., a real backend was configured and then lost). Never show on initial load failure.
  useEffect(() => {
    if (!bootedRef.current) return;

    if (socketConnected) {
      const cur = phaseRef.current;
      if (cur === 'retrying' || cur === 'countdown') {
        setPhase('success');
        const t = setTimeout(() => {
          setPhase('hidden');
          setDismissed(false);
          setRetryCount(0);
          setLastError(null);
        }, 2400);
        return () => clearTimeout(t);
      }
    } else {
      // Only show the overlay if:
      // 1. The socket was previously connected (real backend was configured)
      // 2. OR the user has confirmed live backend data is in use
      const shouldAlert = wasEverConnected.current || isUsingLiveBackendData;
      if (shouldAlert && !dismissed && (phaseRef.current === 'hidden' || phaseRef.current === 'success')) {
        setPhase('countdown');
        setCountdown(COUNTDOWN_SECS);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnected]);

  // Re-surface after dismiss clears (only if socket was ever connected)
  useEffect(() => {
    if (!bootedRef.current) return;
    const shouldAlert = wasEverConnected.current || isUsingLiveBackendData;
    if (!socketConnected && !dismissed && shouldAlert && phaseRef.current === 'hidden') {
      setPhase('countdown');
      setCountdown(COUNTDOWN_SECS);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dismissed]);

  // Countdown tick
  useEffect(() => {
    if (phase !== 'countdown') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          triggerRetry();
          return COUNTDOWN_SECS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const triggerRetry = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('retrying');
    setLastError(null);
    setRetryCount(c => c + 1);
    try {
      await onRetry();
      // Wait up to 6 s for socket to come up (handled by socketConnected effect)
      setTimeout(() => {
        if (!_socketRef.current) {
          setPhase('countdown');
          setCountdown(COUNTDOWN_SECS);
        }
      }, 6000);
    } catch (err: any) {
      setLastError(err?.message ?? 'Connection attempt failed');
      setPhase('countdown');
      setCountdown(COUNTDOWN_SECS);
    }
  }, [onRetry]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    setPhase('hidden');
    setTimeout(() => setDismissed(false), 60_000);
  }, []);

  // Countdown arc geometry
  const R  = 52;
  const C  = 2 * Math.PI * R;
  const progress    = phase === 'countdown' ? countdown / COUNTDOWN_SECS : 1;
  const dashOffset  = C * (1 - progress);

  const accentColor: Record<Phase, string> = {
    hidden:     '#4F46E5',
    countdown:  '#EF4444',
    retrying:   '#818CF8',
    success:    '#22C55E',
  };

  return (
    <AnimatePresence>
      {phase !== 'hidden' && (
        <motion.div
          key="uplink-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ backdropFilter: 'blur(14px)', background: 'rgba(10,14,26,0.88)' }}
        >
          {/* Grid background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(129,140,248,0.5) 1px, transparent 1px),' +
                  'linear-gradient(90deg, rgba(129,140,248,0.5) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            <motion.div className="absolute inset-0"
              style={{ background: `radial-gradient(ellipse 55% 38% at 50% 50%, ${accentColor[phase]}18, transparent)` }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            />
          </div>

          {/* Dismiss X — only during countdown */}
          <AnimatePresence>
            {phase === 'countdown' && (
              <motion.button
                key="dismiss-x"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.25 }}
                onClick={dismiss}
                className="absolute top-5 right-5 p-2 rounded-xl bg-brand-surface/60 border border-brand-border text-brand-text-muted hover:text-white hover:border-brand-text-muted transition-colors"
                title="Dismiss (re-surfaces in 60 s)"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Card */}
          <motion.div
            initial={{ scale: 0.90, y: 28, opacity: 0 }}
            animate={{ scale: 1,    y: 0,  opacity: 1 }}
            exit={{ scale: 0.90,    y: 28, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-md w-full mx-4 bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Top accent line — colour transitions with phase */}
            <motion.div
              className="h-[3px] w-full"
              animate={{ backgroundColor: accentColor[phase] }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />

            {/* Phase content — cross-fades between phases */}
            <div className="p-8 flex flex-col items-center text-center">
              <AnimatePresence mode="wait">

                {/* ── SUCCESS ─────────────────────────────────────────── */}
                {phase === 'success' && (
                  <motion.div key="success"
                    initial={{ opacity: 0, scale: 0.7, y: 12 }}
                    animate={{ opacity: 1, scale: 1,   y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center gap-5"
                  >
                    <div className="w-24 h-24 rounded-full bg-brand-success/12 border border-brand-success/30 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.22, 0.95, 1.08, 1] }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                      >
                        <Zap className="w-12 h-12 text-brand-success" style={{ filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.7))' }} />
                      </motion.div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold uppercase tracking-widest text-brand-success">
                        Uplink Restored
                      </p>
                      <p className="text-xs text-brand-text-muted font-mono mt-1">
                        Resuming all data streams...
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ── RETRYING ────────────────────────────────────────── */}
                {phase === 'retrying' && (
                  <motion.div key="retrying"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="flex flex-col items-center gap-5 w-full"
                  >
                    <RetryOrb />
                    <div>
                      <p className="text-xl font-bold uppercase tracking-widest text-brand-primary">
                        Re-establishing Uplink
                      </p>
                      <p className="text-xs text-brand-text-muted font-mono mt-1">
                        Attempt #{retryCount} — probing all endpoints...
                      </p>
                    </div>

                    {/* Animated progress bar */}
                    <div className="w-full h-[3px] bg-brand-elevated rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-brand-primary rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: '88%' }}
                        transition={{ duration: 5.5, ease: [0.4, 0, 0.2, 1] }}
                      />
                    </div>

                    <div className="flex gap-2 flex-wrap justify-center">
                      {['WebSocket', 'REST API', 'Supabase'].map((s, i) => (
                        <motion.span key={s}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.4, duration: 0.3 }}
                          className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-elevated border border-brand-border text-brand-text-muted"
                        >
                          {s}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ── COUNTDOWN ───────────────────────────────────────── */}
                {phase === 'countdown' && (
                  <motion.div key="countdown"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="flex flex-col items-center gap-5 w-full"
                  >
                    {/* Countdown ring */}
                    <div className="relative flex items-center justify-center w-32 h-32">
                      <svg width="128" height="128" viewBox="0 0 128 128"
                        className="absolute inset-0 -rotate-90">
                        {/* Track */}
                        <circle cx="64" cy="64" r={R} fill="none"
                          stroke="rgba(239,68,68,0.12)" strokeWidth="7" />
                        {/* Arc */}
                        <motion.circle cx="64" cy="64" r={R} fill="none"
                          stroke="#EF4444" strokeWidth="7" strokeLinecap="round"
                          strokeDasharray={C}
                          animate={{ strokeDashoffset: dashOffset }}
                          transition={{ duration: 0.85, ease: 'easeOut' }}
                          style={{ filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.75))' }}
                        />
                      </svg>

                      {/* Centre content */}
                      <div className="relative flex flex-col items-center justify-center gap-0.5">
                        <motion.div
                          animate={{ opacity: [1, 0.45, 1] }}
                          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        >
                          <WifiOff className="w-7 h-7 text-brand-danger" />
                        </motion.div>
                        <motion.span
                          key={countdown}
                          initial={{ scale: 0.75, opacity: 0 }}
                          animate={{ scale: 1,    opacity: 1 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="text-3xl font-bold font-mono tabular-nums text-brand-danger leading-none"
                        >
                          {countdown}
                        </motion.span>
                        <span className="text-[9px] text-brand-text-muted font-mono uppercase tracking-wider">
                          retry in
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-brand-danger" />
                        <h2 className="text-xl font-bold uppercase tracking-widest text-brand-text">
                          Uplink Down
                        </h2>
                      </div>
                      <p className="text-xs text-brand-text-muted font-mono leading-relaxed">
                        Backend connection was lost. Verify your WebSocket endpoint in&nbsp;
                        <span className="text-brand-primary font-bold">Settings → Engine Credentials</span>.
                      </p>
                    </div>

                    {/* Last error */}
                    <AnimatePresence>
                      {lastError && (
                        <motion.div
                          key="last-error"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-full px-3 py-2 bg-brand-danger/10 border border-brand-danger/20 rounded-lg text-[10px] font-mono text-brand-danger text-left"
                        >
                          <span className="font-bold">Last error: </span>{lastError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Stats row */}
                    <div className="flex items-center gap-6 text-[10px] font-mono text-brand-text-muted">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        Auto-retry in <span className="text-brand-danger font-bold tabular-nums ml-1">{countdown}s</span>
                      </span>
                      {retryCount > 0 && (
                        <span className="flex items-center gap-1.5">
                          <RefreshCw className="w-3 h-3" />
                          Attempt <span className="text-brand-text font-bold ml-1">#{retryCount}</span>
                        </span>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 w-full pt-1">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => triggerRetry()}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                        style={{ boxShadow: '0 0 20px rgba(79,70,229,0.35)' }}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retry Now
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={dismiss}
                        className="px-5 py-3 bg-brand-elevated hover:bg-brand-border border border-brand-border text-brand-text-muted hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                      >
                        Dismiss
                      </motion.button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Spinning retry orb ──────────────────────────────────────── */
function RetryOrb() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96"
      style={{ filter: 'drop-shadow(0 0 12px rgba(129,140,248,0.8)) drop-shadow(0 0 4px rgba(129,140,248,0.4))' }}>

      <motion.g style={{ transformOrigin: '48px 48px' }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }}>
        <circle cx="48" cy="48" r="40" fill="none"
          stroke="#818CF8" strokeWidth="2"
          strokeDasharray="176 75" strokeLinecap="round" />
      </motion.g>

      <motion.g style={{ transformOrigin: '48px 48px' }}
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}>
        <circle cx="48" cy="48" r="28" fill="none"
          stroke="#818CF8" strokeWidth="2.5" strokeOpacity="0.7"
          strokeDasharray="112 64" strokeLinecap="round" />
      </motion.g>

      <motion.g style={{ transformOrigin: '48px 48px' }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
        <circle cx="48" cy="48" r="16" fill="none"
          stroke="#818CF8" strokeWidth="2" strokeOpacity="0.5"
          strokeDasharray="72 29" strokeLinecap="round" />
      </motion.g>

      <motion.circle cx="48" cy="48" r="5" fill="#818CF8"
        animate={{ scale: [1, 1.4, 1], opacity: [0.85, 1, 0.85] }}
        style={{ transformOrigin: '48px 48px' }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
      />
      <motion.circle cx="48" cy="48" r="12" fill="#818CF8" fillOpacity="0.07"
        animate={{ scale: [1, 1.55, 1], opacity: [0.15, 0.03, 0.15] }}
        style={{ transformOrigin: '48px 48px' }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      />
    </svg>
  );
}
