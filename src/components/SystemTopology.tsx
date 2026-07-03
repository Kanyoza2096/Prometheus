import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { Network, Server, Database, BrainCircuit, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

interface Node {
  id: string;
  x: number; // percentage
  y: number; // percentage
  label: string;
  type: 'core' | 'db' | 'ai' | 'security' | 'gateway';
  status: 'online' | 'degraded' | 'offline';
}

interface Edge {
  source: string;
  target: string;
  active: boolean;
}

export default function SystemTopology() {
  const { healthMatrix } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const nodes: Node[] = [
    { id: 'flask', x: 12, y: 50, label: 'Flask WSGI', type: 'gateway', status: 'online' },
    { id: 'eventbus', x: 35, y: 50, label: 'Event Bus', type: 'core', status: 'online' },
    { id: 'aiorch', x: 62, y: 20, label: 'AI Orchestrator', type: 'ai', status: healthMatrix.find(h => h.id === 'gemini')?.status || 'online' },
    { id: 'workers', x: 62, y: 80, label: 'Task Queue', type: 'core', status: 'online' },
    { id: 'supa', x: 35, y: 85, label: 'Supabase DB', type: 'db', status: healthMatrix.find(h => h.id === 'supa')?.status || 'online' },
    { id: 'renderer', x: 88, y: 70, label: 'Renderer', type: 'core', status: 'online' },
    { id: 'plugins', x: 88, y: 30, label: 'Social Plugins', type: 'gateway', status: healthMatrix.find(h => h.id === 'fb')?.status || 'online' },
  ];

  const edges: Edge[] = [
    { source: 'flask', target: 'eventbus', active: true },
    { source: 'eventbus', target: 'aiorch', active: true },
    { source: 'eventbus', target: 'workers', active: true },
    { source: 'eventbus', target: 'supa', active: true },
    { source: 'workers', target: 'renderer', active: true },
    { source: 'workers', target: 'plugins', active: true },
    { source: 'aiorch', target: 'plugins', active: false },
  ];

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    let animationFrameId: number;
    let offset = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const getX = (pct: number) => (pct / 100) * canvas.width;
      const getY = (pct: number) => (pct / 100) * canvas.height;

      // Draw edges
      edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        if (!sourceNode || !targetNode) return;

        ctx.beginPath();
        ctx.moveTo(getX(sourceNode.x), getY(sourceNode.y));
        ctx.lineTo(getX(targetNode.x), getY(targetNode.y));
        
        ctx.strokeStyle = edge.active ? '#4F46E5' : '#1E293B';
        ctx.lineWidth = 2;
        
        if (edge.active) {
          ctx.setLineDash([5, 10]);
          ctx.lineDashOffset = -offset;
        } else {
          ctx.setLineDash([]);
        }
        
        ctx.stroke();
      });

      offset += 0.5;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodes, edges, dimensions]);

  const getNodeIcon = (type: Node['type']) => {
    switch (type) {
      case 'core': return <Server className="w-6 h-6 md:w-8 md:h-8" />;
      case 'db': return <Database className="w-6 h-6 md:w-8 md:h-8" />;
      case 'ai': return <BrainCircuit className="w-6 h-6 md:w-8 md:h-8" />;
      case 'security': return <Shield className="w-6 h-6 md:w-8 md:h-8" />;
      case 'gateway': return <Network className="w-6 h-6 md:w-8 md:h-8" />;
    }
  };

  return (
    <div className="bg-brand-surface rounded-2xl border border-brand-border p-5 h-[400px] md:h-[450px] flex flex-col relative overflow-hidden group">
      <div className="flex justify-between items-center mb-4 z-10 flex-shrink-0">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-1">
            <Network className="w-4 h-4 mr-2 text-brand-primary" />
            Network Topology
          </h2>
          <p className="text-[10px] md:text-xs font-mono text-brand-text-muted">LIVE MICROSERVICE MAP</p>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 relative z-10 w-full h-full">
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
        
        {dimensions.width > 0 && nodes.map(node => (
          <motion.div
            key={node.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              "absolute w-14 h-14 md:w-20 md:h-20 rounded-xl flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-colors shadow-lg z-10 hover:z-30",
              node.status === 'online' ? "bg-brand-elevated border-brand-success text-brand-success shadow-[0_0_15px_rgba(16,185,129,0.2)]" :
              node.status === 'degraded' ? "bg-brand-elevated border-brand-warning text-brand-warning shadow-[0_0_15px_rgba(245,158,11,0.2)]" :
              "bg-brand-elevated border-brand-danger text-brand-danger shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            )}
            style={{ left: `${node.x}%`, top: `${node.y}%`, borderWidth: 1 }}
            whileHover={{ scale: 1.1 }}
            title={node.label}
          >
            {getNodeIcon(node.type)}
            <div className="absolute -bottom-7 md:-bottom-8 whitespace-nowrap text-[9px] md:text-[11px] font-mono font-bold text-brand-text-muted bg-brand-surface px-1.5 md:px-2 py-0.5 rounded border border-brand-border z-20">
              {node.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
