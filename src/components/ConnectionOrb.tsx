import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export type OrbState = 'live' | 'partial' | 'offline' | 'connecting';

interface OrbConfig {
  color: string;
  glowColor: string;
  label: string;
  sublabel: string;
  r1Duration: number; // outer ring clockwise
  r2Duration: number; // mid ring counter (negative = CCW)
  r3Duration: number; // inner ring clockwise
  pulseDuration: number;
}

const CFG: Record<OrbState, OrbConfig> = {
  live: {
    color: '#22C55E',
    glowColor: 'rgba(34,197,94,0.65)',
    label: 'ENGINE LIVE',
    sublabel: 'All systems nominal',
    r1Duration: 7, r2Duration: -10, r3Duration: 5, pulseDuration: 2.2,
  },
  partial: {
    color: '#F59E0B',
    glowColor: 'rgba(245,158,11,0.6)',
    label: 'SOCKET ONLY',
    sublabel: 'Awaiting data stream',
    r1Duration: 11, r2Duration: -15, r3Duration: 8, pulseDuration: 1.8,
  },
  offline: {
    color: '#EF4444',
    glowColor: 'rgba(239,68,68,0.55)',
    label: 'ENGINE OFFLINE',
    sublabel: 'Check backend config',
    r1Duration: 0, r2Duration: 0, r3Duration: 0, pulseDuration: 2.8,
  },
  connecting: {
    color: '#818CF8',
    glowColor: 'rgba(129,140,248,0.75)',
    label: 'CONNECTING...',
    sublabel: 'Establishing uplink',
    r1Duration: 3.5, r2Duration: -5, r3Duration: 2.5, pulseDuration: 1.4,
  },
};

export function deriveState(
  socketConnected: boolean,
  isUsingLiveBackendData: boolean,
  booting: boolean,
): OrbState {
  if (booting) return 'connecting';
  if (socketConnected && isUsingLiveBackendData) return 'live';
  if (socketConnected) return 'partial';
  return 'offline';
}

/* ─── Sparkline ────────────────────────────────────────────────── */

function Sparkline({ history, color }: { history: number[]; color: string }) {
  const W = 88, H = 20, PAD = 2;
  const data = history.slice(-30);
  if (data.length < 2) return null;

  const max = Math.max(...data, 50);
  const pts = data.map((v, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v / max) * (H - PAD * 2));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  // Filled area path
  const firstX = PAD;
  const lastX  = PAD + (W - PAD * 2);
  const areaD  = `M${firstX},${H - PAD} L${pts.split(' ').join(' L')} L${lastX},${H - PAD} Z`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <motion.path
        d={areaD}
        fill="url(#spark-fill)"
        initial={false}
        animate={{ d: areaD }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      <motion.polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ points: pts, stroke: color }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      {/* Latest dot */}
      {data.length > 0 && (() => {
        const lx = parseFloat(pts.split(' ').at(-1)!.split(',')[0]);
        const ly = parseFloat(pts.split(' ').at(-1)!.split(',')[1]);
        return (
          <motion.circle cx={lx} cy={ly} r="2.5" fill={color}
            animate={{ r: [2, 3.5, 2], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          />
        );
      })()}
    </svg>
  );
}

/* ─── Ring helper (uses <g> wrapper for reliable SVG rotation) ─── */

function Ring({
  cx, cy, r, strokeW, dashFrac, gapFrac, color, duration, opacity = 1,
}: {
  cx: number; cy: number; r: number; strokeW: number;
  dashFrac: number; gapFrac: number; color: string;
  duration: number; opacity?: number;
}) {
  const C    = 2 * Math.PI * r;
  const dash = (C * dashFrac).toFixed(2);
  const gap  = (C * gapFrac).toFixed(2);

  // duration === 0 → stopped ring
  const spinning = duration !== 0;
  const dir      = duration > 0 ? 360 : -360;
  const absDur   = Math.abs(duration);

  return (
    <motion.g
      style={{ transformOrigin: `${cx}px ${cy}px` }}
      animate={spinning ? { rotate: dir } : { rotate: 0 }}
      transition={
        spinning
          ? { repeat: Infinity, duration: absDur, ease: 'linear' }
          : { duration: 0.5 }
      }
    >
      <motion.circle
        cx={cx} cy={cy} r={r}
        fill="none"
        strokeWidth={strokeW}
        strokeDasharray={`${dash} ${gap}`}
        strokeLinecap="round"
        animate={{ stroke: color, opacity }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
    </motion.g>
  );
}

/* ─── Full ConnectionOrb ──────────────────────────────────────── */

interface ConnectionOrbProps {
  socketConnected: boolean;
  isUsingLiveBackendData: boolean;
  latencyHistory?: number[];
  compact?: boolean;
  className?: string;
}

export function ConnectionOrb({
  socketConnected,
  isUsingLiveBackendData,
  latencyHistory = [],
  compact = false,
  className,
}: ConnectionOrbProps) {
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 2500);
    return () => clearTimeout(t);
  }, []);

  const state = deriveState(socketConnected, isUsingLiveBackendData, booting);
  const cfg   = CFG[state];

  if (compact) {
    // tiny 28 px orb for badges
    const cx = 14, cy = 14;
    return (
      <svg width="28" height="28" viewBox="0 0 28 28"
        style={{ filter: `drop-shadow(0 0 5px ${cfg.glowColor})`, transition: 'filter 0.8s' }}>
        <Ring cx={cx} cy={cy} r={11} strokeW={1.5} dashFrac={0.72} gapFrac={0.28}
          color={cfg.color} duration={cfg.r1Duration} />
        <Ring cx={cx} cy={cy} r={7.5} strokeW={1.5} dashFrac={0.6} gapFrac={0.4}
          color={cfg.color} duration={cfg.r2Duration} opacity={0.7} />
        <Ring cx={cx} cy={cy} r={4} strokeW={1.5} dashFrac={0.85} gapFrac={0.15}
          color={cfg.color} duration={cfg.r3Duration} opacity={0.5} />
        {/* centre */}
        <motion.circle cx={cx} cy={cy} r="2.5"
          animate={{ fill: cfg.color, scale: [1, 1.25, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ scale: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' },
                        opacity: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' },
                        fill: { duration: 0.8 } }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      </svg>
    );
  }

  // Full 88 px orb
  const cx = 44, cy = 44;

  const latestMs = latencyHistory.length > 0
    ? latencyHistory[latencyHistory.length - 1]
    : null;

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* Orb */}
      <div className="relative">
        <svg width="88" height="88" viewBox="0 0 88 88"
          style={{
            filter: `drop-shadow(0 0 10px ${cfg.glowColor}) drop-shadow(0 0 3px ${cfg.glowColor})`,
            transition: 'filter 0.9s ease',
          }}>
          {/* Outer glow halo */}
          <motion.circle cx={cx} cy={cy} r="42"
            fill="none" strokeWidth="1"
            animate={{ stroke: cfg.color, opacity: [0.12, 0.25, 0.12] }}
            transition={{
              opacity: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
              stroke: { duration: 0.8 },
            }}
          />

          <Ring cx={cx} cy={cy} r={36} strokeW={2}     dashFrac={0.72} gapFrac={0.28}
            color={cfg.color} duration={cfg.r1Duration} />
          <Ring cx={cx} cy={cy} r={26} strokeW={2.5}   dashFrac={0.60} gapFrac={0.40}
            color={cfg.color} duration={cfg.r2Duration} opacity={0.72} />
          <Ring cx={cx} cy={cy} r={16} strokeW={2}     dashFrac={0.85} gapFrac={0.15}
            color={cfg.color} duration={cfg.r3Duration} opacity={0.5} />

          {/* Soft fill core */}
          <motion.circle cx={cx} cy={cy} r="10"
            animate={{ fill: cfg.color, opacity: [0.08, 0.18, 0.08] }}
            transition={{
              opacity: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' },
              fill: { duration: 0.8 },
            }}
          />
          {/* Solid centre dot */}
          <motion.circle cx={cx} cy={cy} r="5"
            animate={{ fill: cfg.color, scale: [1, 1.3, 1], opacity: [0.85, 1, 0.85] }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
            transition={{
              scale:   { repeat: Infinity, duration: cfg.pulseDuration, ease: 'easeInOut' },
              opacity: { repeat: Infinity, duration: cfg.pulseDuration, ease: 'easeInOut' },
              fill:    { duration: 0.8 },
            }}
          />
        </svg>

        {/* Ping badge top-right */}
        {latestMs !== null && state === 'live' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-1 -right-1 bg-brand-surface border border-brand-success/40 rounded-full px-1.5 py-0.5 text-[9px] font-mono font-bold text-brand-success leading-none"
          >
            {latestMs}ms
          </motion.div>
        )}
      </div>

      {/* Label block */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex flex-col items-center gap-0.5"
        >
          <motion.p
            className="text-[10px] font-bold uppercase tracking-[0.15em] font-mono"
            animate={{ color: cfg.color }}
            transition={{ duration: 0.8 }}
          >
            {cfg.label}
          </motion.p>
          <p className="text-[9px] text-brand-text-muted font-mono tracking-wider">
            {cfg.sublabel}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Sparkline */}
      <AnimatePresence>
        {latencyHistory.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center gap-1"
          >
            <Sparkline history={latencyHistory} color={cfg.color} />
            <p className="text-[8px] text-brand-text-muted/50 font-mono uppercase tracking-widest">
              Latency — last {Math.min(latencyHistory.length, 30)} pings
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Compact pill badge for top bar ─────────────────────────── */

const PILL_COLOR: Record<OrbState, string> = {
  live:       'bg-brand-success/10 text-brand-success border-brand-success/30',
  partial:    'bg-brand-warning/10 text-brand-warning border-brand-warning/30',
  offline:    'bg-brand-danger/10  text-brand-danger  border-brand-danger/30',
  connecting: 'bg-brand-primary/10 text-brand-primary border-brand-primary/30',
};

export function ConnectionBadge({
  socketConnected,
  isUsingLiveBackendData,
}: {
  socketConnected: boolean;
  isUsingLiveBackendData: boolean;
}) {
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 2500);
    return () => clearTimeout(t);
  }, []);

  const state = deriveState(socketConnected, isUsingLiveBackendData, booting);

  return (
    <motion.div
      layout
      className={cn(
        'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center border gap-2',
        PILL_COLOR[state],
      )}
      transition={{ duration: 0.35 }}
    >
      <ConnectionOrb
        socketConnected={socketConnected}
        isUsingLiveBackendData={isUsingLiveBackendData}
        compact
      />
      <AnimatePresence mode="wait">
        <motion.span
          key={state}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 4 }}
          transition={{ duration: 0.25 }}
          className="whitespace-nowrap"
        >
          {CFG[state].label}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}
