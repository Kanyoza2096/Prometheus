import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Tooltip, ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Legend, Area,
} from 'recharts';
import { Cpu, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../store/useStore';
import { fetchHealth, fetchStats } from '../lib/api';
import type { HealthDeepPayload, StatsPayload } from '../lib/api';

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#0A0E17', borderColor: '#1E293B', borderRadius: '8px' },
  itemStyle: { color: '#E2E8F0' },
};

// Build radar data from real health service latencies and stats
function buildRadarFromHealth(health: HealthDeepPayload | null, stats: StatsPayload | null) {
  const services = health?.services || {};
  const geminiLatency = services.gemini?.latency_ms ?? 50;
  const facebookLatency = services.facebook?.latency_ms ?? 40;
  const supabaseLatency = services.supabase?.latency_ms ?? 30;

  // Normalize latencies to 0-100 scale for radar
  const maxLatency = 200;
  return [
    { subject: 'Gemini API', A: Math.min(100, Math.round((geminiLatency / maxLatency) * 100)), B: Math.min(100, Math.round((geminiLatency * 0.9 / maxLatency) * 100)), fullMark: 100 },
    { subject: 'Facebook',   A: Math.min(100, Math.round((facebookLatency / maxLatency) * 100)), B: Math.min(100, Math.round((facebookLatency * 0.85 / maxLatency) * 100)), fullMark: 100 },
    { subject: 'Supabase',    A: Math.min(100, Math.round((supabaseLatency / maxLatency) * 100)), B: Math.min(100, Math.round((supabaseLatency * 0.95 / maxLatency) * 100)), fullMark: 100 },
    { subject: 'API Volume', A: Math.min(100, Math.round((stats?.api_calls_today ?? 100) / 100)), B: Math.min(100, Math.round((stats?.api_calls_today ?? 80) / 120)), fullMark: 100 },
    { subject: 'Messages',   A: Math.min(100, Math.round((stats?.messages_today ?? 50) / 50)),   B: Math.min(100, Math.round((stats?.messages_today ?? 40) / 60)), fullMark: 100 },
    { subject: 'Workers',    A: services.worker?.status === 'ok' ? 85 : 40, B: 75, fullMark: 100 },
  ];
}

// Default traffic seed for initial display
const TRAFFIC_SEED = [
  { time: '00:00', requests: 4000, errors: 24, latency: 45 },
  { time: '04:00', requests: 3000, errors: 13, latency: 42 },
  { time: '08:00', requests: 2000, errors: 98, latency: 60 },
  { time: '12:00', requests: 2780, errors: 39, latency: 50 },
  { time: '16:00', requests: 1890, errors: 48, latency: 48 },
  { time: '20:00', requests: 2390, errors: 38, latency: 46 },
];

export function ResourceRadar() {
  const restEndpoint = useStore(state => state.restEndpoint);
  const masterToken  = useStore(state => state.masterToken);
  const cfg = { restEndpoint, masterToken };

  const { data: healthData, isFetching } = useQuery({
    queryKey: ['health-deep', restEndpoint],
    queryFn:  () => fetchHealth(cfg),
    refetchInterval: 60_000,
    retry: 1,
  });

  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats', restEndpoint],
    queryFn:  () => fetchStats(cfg),
    refetchInterval: 30_000,
    retry: 1,
  });

  const radarData = useMemo(
    () => buildRadarFromHealth(healthData || null, statsData || null),
    [healthData, statsData]
  );

  const isLive = !!healthData && !isFetching;

  return (
    <div className="bg-brand-surface rounded-2xl border border-brand-border p-5 h-[400px] flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-1">
            <Cpu className="w-4 h-4 mr-2 text-brand-primary" />
            Resource Utilization
          </h2>
          <p className="text-xs font-mono text-brand-text-muted">SERVICE LATENCY & LOAD ANALYSIS</p>
        </div>
        {isLive && (
          <span className="text-[10px] font-mono text-brand-success flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-success inline-block animate-pulse" />
            Live
          </span>
        )}
      </div>
      <div className="flex-1 w-full h-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="#1E293B" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'monospace' }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Radar name="Primary" dataKey="A" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.4} />
            <Radar name="Secondary" dataKey="B" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function TrafficComposedChart() {
  const restEndpoint = useStore(state => state.restEndpoint);
  const masterToken  = useStore(state => state.masterToken);
  const cfg = { restEndpoint, masterToken };

  const { data: healthData } = useQuery({
    queryKey: ['health-deep', restEndpoint],
    queryFn:  () => fetchHealth(cfg),
    refetchInterval: 60_000,
    retry: 1,
  });

  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats', restEndpoint],
    queryFn:  () => fetchStats(cfg),
    refetchInterval: 30_000,
    retry: 1,
  });

  const windowRef = useRef<typeof TRAFFIC_SEED>(TRAFFIC_SEED);
  const [trafficData, setTrafficData] = useState(TRAFFIC_SEED);

  useEffect(() => {
    if (!statsData) return;

    const apiCalls = statsData.api_calls_today;
    const messages = statsData.messages_today;
    const guardianIssues = statsData.guardian_issues;

    // Derive traffic point from real stats
    const point = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      requests: Math.round(apiCalls / 144 * 10) || 2000, // Rough per-hour estimate
      errors: guardianIssues || Math.round(apiCalls / 500),
      latency: healthData?.services?.gemini?.latency_ms ?? 45,
    };

    windowRef.current = [...windowRef.current.slice(-6), point];
    setTrafficData([...windowRef.current]);
  }, [statsData, healthData]);

  const isLive = !!statsData;

  return (
    <div className="bg-brand-surface rounded-2xl border border-brand-border p-5 h-[400px] flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-1">
            <Activity className="w-4 h-4 mr-2 text-brand-accent" />
            Traffic & Anomaly Correlation
          </h2>
          <p className="text-xs font-mono text-brand-text-muted">REQUEST VOLUME VS LATENCY & ERRORS</p>
        </div>
        {isLive && (
          <span className="text-[10px] font-mono text-brand-success flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-success inline-block animate-pulse" />
            Live
          </span>
        )}
      </div>
      <div className="flex-1 w-full h-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={trafficData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left"  stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0A0E17', borderColor: '#1E293B', borderRadius: '8px' }}
              itemStyle={{ color: '#E2E8F0', fontSize: '12px' }}
              labelStyle={{ color: '#94A3B8', fontSize: '10px', marginBottom: '4px' }}
            />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            <Area  yAxisId="left"  type="monotone" dataKey="requests" fill="#4F46E5" stroke="#4F46E5" fillOpacity={0.1} name="Requests/hr" />
            <Bar   yAxisId="right"                  dataKey="errors"   barSize={12}   fill="#EF4444" name="Errors/hr" radius={[4, 4, 0, 0]} />
            <Line  yAxisId="right" type="monotone" dataKey="latency"  stroke="#10B981" strokeWidth={2} name="Avg Latency (ms)" dot={{ r: 3, fill: '#0A0E17', strokeWidth: 2 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
