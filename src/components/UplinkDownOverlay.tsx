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
const BOOT_GRACE_MS  = 5000; // don't show during initial boot

type Phase = 'hidden' | 'countdown' | 'retrying' | 'success';

export default function UplinkDownOverlay({
  socketConnected,
  isUsingLiveBackendData,
  onRetry,
}: UplinkDownOverlayProps) {
  const [phase,         setPhase]         = useState<Phase>('hidden');
  const [countdown,     setCountdown]     = useState(COUNTDOWN_SECS);
  const [dismissed,     setDismissed]     = useState(false);
  const [retryCount,    setRetryCount]    = useState(0);
  const [lastError,     setLastError]     = useState<string | null>(null);
  const bootedRef   = useRef(false);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  // After boot grace, allow the overlay to show
  useEffect(() => {
    const t = setTimeout(() => { bootedRef.current = true; }, BOOT_GRACE_MS);
    return () => clearTimeout(t);
  }, []);

  // React to connection changes
  useEffect(() => {
    if (!bootedRef.current) return;

    if (socketConnected) {
      // Connection restored — show brief success, then hide
      if (phase === 'retrying' || phase === 'countdown') {
        setPhase('success');
        const t = setTimeout(() => {
          setPhase('hidden');
          setDismissed(false);
          setRetryCount(0);
          setLastError(null);
        }, 2200);
        return () => clearTimeout(t);
      }
    } else {
      // Lost connection
      if (phase === 'hidden' || phase === 'success') {
        if (!dismissed) {
          setPhase('countdown');
          setCountdown(COUNTDOWN_SECS);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnected, dismissed]);

  // Re-surface if still offline and dismissed flag resets
  useEffect(() => {
    if (!bootedRef.current) return;
    if (!socketConnected && !dismissed && phase === 'hidden') {
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
          handleRetry();
          return COUNTDOWN_SECS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleRetry = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('retrying');
    setLastError(null);
    setRetryCount(c => c + 1);
    try {
      await onRetry();
      // success is handled by the socketConnected useEffect above
      // if socket still not connected after retry, fall back to countdown
      setTimeout(() => {
        if (!useStore_socketConnected.current) {
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

  const handleDismiss = () => {
    setDismissed(true);
    setPhase('hidden');
    // Re-surface after 60 s if still offline
    setTimeout(() => setDismissed(false), 60_000);
  };

  // Circular progress arc math
  const R  = 52;
  const C  = 2 * Math.PI * R; // circumference
  const progress = phase === 'countdown' ? countdown / COUNTDOWN_SECS : 1;
  const dashOffset = C * (1 - progress);

  const shouldShow = phase !== 'hidden';

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          key="uplink-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ backdropFilter: 'blur(12px)', background: 'rgba(10,14,26,0.85)' }}
        >
          {/* Animated grid background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(129,140,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.5) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            {/* Sweeping gradient */}
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(239,68,68,0.06), transparent)',
              }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            />
          </div>

          {/* Dismiss button */}
          {phase === 'countdown' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              onClick={handleDismiss}
              className="absolute top-6 right-6 p-2 rounded-xl bg-brand-surface/60 border border-brand-border text-brand-text-muted hover:text-white hover:border-brand-text transition-all"
              title="Dismiss (re-surfaces in 60s)"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}

          {/* Main card */}
          <motion.div
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 24, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-md w-full mx-4 bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Top accent bar */}
            <div className={cn(
              'h-1 w-full',
              phase === 'success'   ? 'bg-brand-success'  :
              phase === 'retrying'  ? 'bg-brand-primary'  :
                                     'bg-brand-danger'
            )} />

            <div className="p-8 flex flex-col items-center text-center space-y-6">

              {/* ── Phase: SUCCESS ─────────────────────────────── */}
              {phase === 'success' && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="flex flex-col items-center space-y-4"
                >
                  <div className="w-20 h-20 rounded-full bg-brand-success/15 border border-brand-success/30 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: 2, duration: 0.4 }}
                    >
                      <Zap className="w-10 h-10 text-brand-success" />
                    </motion.div>
                  </div>
                  <div>
                    <p className="text-xl font-bold uppercase tracking-widest text-brand-success">Uplink Restored</p>
                    <p className="text-xs text-brand-text-muted font-mono mt-1">Resuming data streams...</p>
                  </div>
                </motion.div>
              )}

              {/* ── Phase: RETRYING ────────────────────────────── */}
              {phase === 'retrying' && (
                <>
                  {/* Spinning orb — inline rings */}
                  <RetryOrb />
                  <div className="space-y-1">
                    <p className="text-xl font-bold uppercase tracking-widest text-brand-primary">
                      Re-establishing Uplink
                    </p>
                    <p className="text-xs text-brand-text-muted font-mono">
                      Attempt #{retryCount} — probing endpoints...
                    </p>
                  </div>
                  {/* Live progress bar */}
                  <div className="w-full h-1 bg-brand-elevated rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-brand-primary rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '90%' }}
                      transition={{ duration: 5.5, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-[10px] text-brand-text-muted font-mono">
                    Checking WebSocket → REST API → Supabase...
                  </p>
                </>
              )}

              {/* ── Phase: COUNTDOWN ───────────────────────────── */}
              {phase === 'countdown' && (
                <>
                  {/* Countdown ring + icon */}
                  <div className="relative flex items-center justify-center w-32 h-32">
                    {/* SVG countdown arc */}
                    <svg
                      width="128" height="128"
                      viewBox="0 0 128 128"
                      className="absolute inset-0 -rotate-90"
                    >
                      {/* Track */}
                      <circle
                        cx="64" cy="64" r={R}
                        fill="none"
                        stroke="rgba(239,68,68,0.15)"
                        strokeWidth="6"
                      />
                      {/* Progress arc */}
                      <motion.circle
                        cx="64" cy="64" r={R}
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={C}
                        animate={{ strokeDashoffset: dashOffset }}
                        transition={{ duration: 0.5, ease: 'linear' }}
                        style={{ filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.8))' }}
                      />
                    </svg>

                    {/* Center icon */}
                    <div className="relative flex flex-col items-center justify-center">
                      <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      >
                        <WifiOff className="w-8 h-8 text-brand-danger mb-1" />
                      </motion.div>
                      <span className="text-2xl font-bold font-mono tabular-nums text-brand-danger leading-none">
                        {countdown}
                      </span>
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
                    <p className="text-xs text-brand-text-muted font-mono leading-relaxed max-w-xs">
                      No connection to the backend engine. Check your WebSocket endpoint in Settings, then retry.
                    </p>
                  </div>

                  {/* Error from last attempt */}
                  {lastError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full px-4 py-2 bg-brand-danger/10 border border-brand-danger/20 rounded-lg text-[10px] font-mono text-brand-danger text-left"
                    >
                      <span className="font-bold">Last error: </span>{lastError}
                    </motion.div>
                  )}

                  {/* Stats row */}
                  <div className="flex items-center gap-6 text-[10px] font-mono text-brand-text-muted">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>Auto-retry in <span className="text-brand-danger font-bold tabular-nums">{countdown}s</span></span>
                    </div>
                    {retryCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <RefreshCw className="w-3 h-3" />
                        <span>Attempt <span className="text-brand-text font-bold">#{retryCount}</span></span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 w-full pt-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleRetry()}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-glow-primary"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retry Now
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleDismiss}
                      className="px-5 py-3 bg-brand-elevated hover:bg-brand-border border border-brand-border text-brand-text-muted hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                    >
                      Dismiss
                    </motion.button>
                  </div>

                  <p className="text-[9px] text-brand-text-muted/50 font-mono">
                    Configure endpoint in Settings → Engine Credentials
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Spinning orb shown during retry phase — 3 rings, indigo */
function RetryOrb() {
  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg width="96" height="96" viewBox="0 0 96 96"
        style={{ filter: 'drop-shadow(0 0 10px rgba(129,140,248,0.8))' }}>
        {/* Outer ring */}
        <motion.circle
          cx="48" cy="48" r="40"
          fill="none" stroke="#818CF8" strokeWidth="2"
          strokeDasharray="188 64" strokeLinecap="round"
          style={{ originX: '48px', originY: '48px' }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
        />
        {/* Mid ring counter */}
        <motion.circle
          cx="48" cy="48" r="28"
          fill="none" stroke="#818CF8" strokeWidth="2.5"
          strokeDasharray="110 66" strokeLinecap="round"
          strokeOpacity={0.7}
          style={{ originX: '48px', originY: '48px' }}
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 4.5, ease: 'linear' }}
        />
        {/* Inner ring */}
        <motion.circle
          cx="48" cy="48" r="16"
          fill="none" stroke="#818CF8" strokeWidth="2"
          strokeDasharray="72 29" strokeLinecap="round"
          strokeOpacity={0.5}
          style={{ originX: '48px', originY: '48px' }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        />
        {/* Center pulse */}
        <motion.circle
          cx="48" cy="48" r="5"
          fill="#818CF8"
          animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          style={{ originX: '48px', originY: '48px' }}
        />
        <motion.circle
          cx="48" cy="48" r="12"
          fill="#818CF8" fillOpacity={0.08}
          animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0.03, 0.15] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{ originX: '48px', originY: '48px' }}
        />
      </svg>
    </div>
  );
}

// Ref to track socketConnected inside the async retry callback without stale closure
const useStore_socketConnected = { current: false };
export function syncSocketRef(val: boolean) { useStore_socketConnected.current = val; }
