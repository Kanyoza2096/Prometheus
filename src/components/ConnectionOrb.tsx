import React, { useEffect, useState } from 'react';
import { motion, animate, useMotionValue, useTransform } from 'motion/react';
import { cn } from '../lib/utils';

type OrbState = 'live' | 'partial' | 'offline' | 'connecting';

interface ConnectionOrbProps {
  socketConnected: boolean;
  isUsingLiveBackendData: boolean;
  compact?: boolean;
  className?: string;
}

const STATE_CONFIG: Record<OrbState, {
  color: string;
  glow: string;
  label: string;
  sublabel: string;
  ring1Speed: number;
  ring2Speed: number;
  ring3Speed: number;
  centerScale: number[];
  opacity: number;
}> = {
  live: {
    color: '#22C55E',
    glow: 'drop-shadow(0 0 8px rgba(34,197,94,0.7))',
    label: 'ENGINE LIVE',
    sublabel: 'All systems nominal',
    ring1Speed: 6,
    ring2Speed: -9,
    ring3Speed: 4,
    centerScale: [1, 1.25, 1],
    opacity: 1,
  },
  partial: {
    color: '#F59E0B',
    glow: 'drop-shadow(0 0 8px rgba(245,158,11,0.7))',
    label: 'SOCKET ONLY',
    sublabel: 'Awaiting data stream',
    ring1Speed: 10,
    ring2Speed: -14,
    ring3Speed: 7,
    centerScale: [1, 1.15, 1],
    opacity: 0.9,
  },
  offline: {
    color: '#EF4444',
    glow: 'drop-shadow(0 0 6px rgba(239,68,68,0.6))',
    label: 'ENGINE OFFLINE',
    sublabel: 'Check backend config',
    ring1Speed: 0,
    ring2Speed: 0,
    ring3Speed: 0,
    centerScale: [1, 1.05, 1],
    opacity: 0.7,
  },
  connecting: {
    color: '#818CF8',
    glow: 'drop-shadow(0 0 10px rgba(129,140,248,0.8))',
    label: 'CONNECTING...',
    sublabel: 'Establishing uplink',
    ring1Speed: 3,
    ring2Speed: -4,
    ring3Speed: 2,
    centerScale: [1, 1.3, 1],
    opacity: 1,
  },
};

function deriveState(socketConnected: boolean, isUsingLiveBackendData: boolean, booting: boolean): OrbState {
  if (booting) return 'connecting';
  if (socketConnected && isUsingLiveBackendData) return 'live';
  if (socketConnected && !isUsingLiveBackendData) return 'partial';
  return 'offline';
}

export function ConnectionOrb({ socketConnected, isUsingLiveBackendData, compact = false, className }: ConnectionOrbProps) {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 2500);
    return () => clearTimeout(t);
  }, []);

  const state = deriveState(socketConnected, isUsingLiveBackendData, booting);
  const cfg = STATE_CONFIG[state];

  const cx = compact ? 16 : 44;
  const cy = compact ? 16 : 44;

  // Ring radii
  const r1 = compact ? 12 : 36;
  const r2 = compact ? 8.5 : 26;
  const r3 = compact ? 5.5 : 16;

  const svgSize = compact ? 32 : 88;

  // Dashes for partial arcs
  const dash1 = (2 * Math.PI * r1 * 0.72).toFixed(1);
  const gap1  = (2 * Math.PI * r1 * 0.28).toFixed(1);
  const dash2 = (2 * Math.PI * r2 * 0.6).toFixed(1);
  const gap2  = (2 * Math.PI * r2 * 0.4).toFixed(1);
  const dash3 = (2 * Math.PI * r3 * 0.85).toFixed(1);
  const gap3  = (2 * Math.PI * r3 * 0.15).toFixed(1);

  const ringVariants = (speed: number) => ({
    animate: speed === 0
      ? { rotate: 0 }
      : { rotate: speed > 0 ? 360 : -360 },
  });

  const ringTransition = (speed: number) => ({
    repeat: speed === 0 ? 0 : Infinity,
    duration: speed === 0 ? 1 : Math.abs(speed),
    ease: 'linear' as const,
  });

  return (
    <div className={cn('flex flex-col items-center', compact ? 'gap-0' : 'gap-3', className)}>
      {/* Orb SVG */}
      <div className="relative flex items-center justify-center">
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          style={{ filter: cfg.glow, opacity: cfg.opacity, transition: 'filter 1s, opacity 1s' }}
        >
          {/* Outer ring */}
          <motion.circle
            cx={cx} cy={cy} r={r1}
            fill="none"
            stroke={cfg.color}
            strokeWidth={compact ? 1.5 : 2}
            strokeDasharray={`${dash1} ${gap1}`}
            strokeLinecap="round"
            style={{ originX: `${cx}px`, originY: `${cy}px` }}
            variants={ringVariants(cfg.ring1Speed)}
            animate="animate"
            transition={ringTransition(cfg.ring1Speed)}
          />
          {/* Mid ring (counter-spin) */}
          <motion.circle
            cx={cx} cy={cy} r={r2}
            fill="none"
            stroke={cfg.color}
            strokeWidth={compact ? 1.5 : 2.5}
            strokeDasharray={`${dash2} ${gap2}`}
            strokeLinecap="round"
            strokeOpacity={0.7}
            style={{ originX: `${cx}px`, originY: `${cy}px` }}
            variants={ringVariants(cfg.ring2Speed)}
            animate="animate"
            transition={ringTransition(cfg.ring2Speed)}
          />
          {/* Inner ring */}
          <motion.circle
            cx={cx} cy={cy} r={r3}
            fill="none"
            stroke={cfg.color}
            strokeWidth={compact ? 1.5 : 2}
            strokeDasharray={`${dash3} ${gap3}`}
            strokeLinecap="round"
            strokeOpacity={0.5}
            style={{ originX: `${cx}px`, originY: `${cy}px` }}
            variants={ringVariants(cfg.ring3Speed)}
            animate="animate"
            transition={ringTransition(cfg.ring3Speed)}
          />
          {/* Center dot with pulse */}
          <motion.circle
            cx={cx} cy={cy}
            r={compact ? 2.5 : 5}
            fill={cfg.color}
            animate={{ scale: cfg.centerScale, opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{ originX: `${cx}px`, originY: `${cy}px` }}
          />
          {/* Subtle fill glow under center */}
          <motion.circle
            cx={cx} cy={cy}
            r={compact ? 5 : 10}
            fill={cfg.color}
            fillOpacity={0.1}
            animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.05, 0.15] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            style={{ originX: `${cx}px`, originY: `${cy}px` }}
          />
        </svg>
      </div>

      {/* Labels — only in full mode */}
      {!compact && (
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] font-mono" style={{ color: cfg.color }}>
            {cfg.label}
          </p>
          <p className="text-[9px] text-brand-text-muted font-mono mt-0.5 tracking-wider">
            {cfg.sublabel}
          </p>
        </motion.div>
      )}
    </div>
  );
}

/** Compact pill badge for the top bar */
export function ConnectionBadge({ socketConnected, isUsingLiveBackendData }: {
  socketConnected: boolean;
  isUsingLiveBackendData: boolean;
}) {
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 2500);
    return () => clearTimeout(t);
  }, []);

  const state = deriveState(socketConnected, isUsingLiveBackendData, booting);
  const cfg = STATE_CONFIG[state];

  const pillColor: Record<OrbState, string> = {
    live:       'bg-brand-success/10 text-brand-success border-brand-success/30',
    partial:    'bg-brand-warning/10 text-brand-warning border-brand-warning/30',
    offline:    'bg-brand-danger/10  text-brand-danger  border-brand-danger/30',
    connecting: 'bg-brand-primary/10 text-brand-primary border-brand-primary/30',
  };

  return (
    <div className={cn(
      'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center border gap-1.5',
      pillColor[state]
    )}>
      {/* mini orb */}
      <ConnectionOrb
        socketConnected={socketConnected}
        isUsingLiveBackendData={isUsingLiveBackendData}
        compact
      />
      <motion.span
        key={cfg.label}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {cfg.label}
      </motion.span>
    </div>
  );
}
