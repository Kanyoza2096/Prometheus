import React, { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { StatCard, LiveStream, HealthMatrix, RevenueTicker, RecentPostsWidget, GuardianAlertsWidget } from '../components/DashboardWidgets';
import SystemTopology from '../components/SystemTopology';
import { ResourceRadar, TrafficComposedChart } from '../components/ResourceUtilization';
import BackendStatusCard from '../components/BackendStatusCard';
import { MessageSquare, FileText, Users, Zap, ShieldAlert } from 'lucide-react';

const sparklineDataGen = () => Array.from({ length: 10 }, () => ({ value: Math.random() * 100 }));

export default function Dashboard() {
  const { stats } = useStore();
  const sparklines = useMemo(() => Array.from({ length: 5 }, () => sparklineDataGen()), []);

  const statCards = [
    { title: 'Messages', value: stats.messagesToday, icon: MessageSquare, trend: 12.5, trendUp: true, color: 'text-brand-primary' },
    { title: 'Posts', value: stats.postsPublished, icon: FileText, trend: 4.2, trendUp: true, color: 'text-brand-accent' },
    { title: 'Active Users', value: stats.activeUsers, icon: Users, trend: 2.1, trendUp: false, color: 'text-brand-warning' },
    { title: 'API Calls', value: stats.apiCalls, icon: Zap, trend: 24.8, trendUp: true, color: 'text-brand-success' },
    { title: 'Issues', value: stats.guardianIssues, icon: ShieldAlert, trend: 0, trendUp: true, color: 'text-brand-danger' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 pb-20 md:pb-0"
    >
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">Main Console</h1>
        <p className="text-brand-text-muted text-sm font-mono mt-1">REAL-TIME TELEMETRY ACTIVE</p>
      </div>

      {/* Top Row - Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => (
          <StatCard 
            key={card.title} 
            {...card} 
            sparklineData={sparklines[idx]} 
            colorClass={card.color} 
          />
        ))}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveStream />
        </div>
        <div>
          <HealthMatrix />
        </div>
      </div>

      {/* Infrastructure Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SystemTopology />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
          <BackendStatusCard />
          <ResourceRadar />
        </div>
      </div>

      {/* Advanced Analytics Row */}
      <div className="grid grid-cols-1 gap-6">
        <TrafficComposedChart />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <RevenueTicker />
        </div>
        <div className="lg:col-span-2">
          <RecentPostsWidget />
        </div>
        <div className="lg:col-span-1">
          <GuardianAlertsWidget />
        </div>
      </div>
    </motion.div>
  );
}
