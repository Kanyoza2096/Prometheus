import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { 
  Activity, Server, Database, Globe, Cpu, 
  MessageCircle, Send, Zap, Shield 
} from 'lucide-react';

interface FlowNode {
  id: string;
  label: string;
  icon: React.ElementType;
  x: number;
  y: number;
  status: 'online' | 'degraded' | 'offline' | 'active';
  pulseCount: number;
}

interface FlowEdge {
  from: string;
  to: string;
  packets: { id: string; progress: number; opacity: number }[];
}

const NODE_LAYOUT: Omit<FlowNode, 'status' | 'pulseCount'>[] = [
  { id: 'gemini',     label: 'Gemini AI',        icon: Cpu,            x: 50,  y: 5 },
  { id: 'pipeline',   label: 'Content Pipeline',  icon: Zap,            x: 50,  y: 22 },
  { id: 'render',     label: 'Render Queue',      icon: Activity,       x: 85,  y: 22 },
  { id: 'command',    label: 'Command Executor',   icon: MessageCircle, x: 15,  y: 40 },
  { id: 'scheduler',  label: 'Post Scheduler',     icon: Send,          x: 50,  y: 40 },
  { id: 'browser',    label: 'Browser Manager',    icon: Globe,         x: 85,  y: 40 },
  { id: 'connectors', label: 'Connectors',         icon: Server,        x: 50,  y: 58 },
  { id: 'supabase',   label: 'Supabase',           icon: Database,      x: 30,  y: 76 },
  { id: 'redis',      label: 'Upstash Redis',      icon: Database,      x: 70,  y: 76 },
  { id: 'socketio',   label: 'Socket.IO',          icon: Activity,      x: 50,  y: 92 },
];

const EDGES: [string, string][] = [
  ['gemini', 'pipeline'],
  ['pipeline', 'render'],
  ['pipeline', 'scheduler'],
  ['gemini', 'command'],
  ['command', 'connectors'],
  ['scheduler', 'connectors'],
  ['render', 'browser'],
  ['browser', 'connectors'],
  ['connectors', 'supabase'],
  ['connectors', 'redis'],
  ['supabase', 'socketio'],
  ['redis', 'socketio'],
];

const STATUS_COLORS: Record<string, string> = {
  online: '#22c55e',
  degraded: '#f59e0b',
  offline: '#ef4444',
  active: '#3b82f6',
};

export default function DataFlowVisualizer() {
  const { socket, healthMatrix, stats } = useStore();
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [eventsPerSec, setEventsPerSec] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const packetIdRef = useRef(0);

  // Initialize nodes
  useEffect(() => {
    setNodes(NODE_LAYOUT.map(n => ({ ...n, status: 'offline', pulseCount: 0 })));
    setEdges(EDGES.map(([from, to]) => ({ from, to, packets: [] })));
  }, []);

  // Update node statuses from health matrix
  useEffect(() => {
    setNodes(prev => prev.map(node => {
      const health = healthMatrix.find(h => 
        h.id === node.id || 
        h.name?.toLowerCase().includes(node.id) ||
        (node.id === 'supabase' && h.id === 'supabase') ||
        (node.id === 'redis' && h.id === 'redis')
      );
      const status = health 
        ? (health.status === 'online' ? 'online' : health.status === 'degraded' ? 'degraded' : 'offline')
        : node.status;
      return { ...node, status };
    }));
  }, [healthMatrix]);

  // Animate data packets on edges
  useEffect(() => {
    if (!socket) return;

    const spawnPacket = () => {
      const edgeIndex = Math.floor(Math.random() * EDGES.length);
      const [from, to] = EDGES[edgeIndex];
      
      setEdges(prev => prev.map(edge => {
        if (edge.from === from && edge.to === to) {
          const newPacket = {
            id: `pkt_${packetIdRef.current++}`,
            progress: 0,
            opacity: 0.8,
          };
          return { ...edge, packets: [...edge.packets.slice(-3), newPacket] };
        }
        return edge;
      }));
    };

    // Spawn packets on socket events
    const handlers = ['new_message', 'post_published', 'api_payload', 'scan_complete', 'stats'];
    handlers.forEach(event => {
      socket.on(event, () => {
        spawnPacket();
        setTotalEvents(prev => prev + 1);
      });
    });

    // Animate packet movement
    const interval = setInterval(() => {
      setEdges(prev => prev.map(edge => ({
        ...edge,
        packets: edge.packets
          .map(p => ({ ...p, progress: p.progress + 0.03, opacity: p.opacity - 0.01 }))
          .filter(p => p.progress < 1 && p.opacity > 0),
      })));
    }, 50);

    // Calculate events per second
    const epsInterval = setInterval(() => {
      setEventsPerSec(prev => {
        const diff = totalEvents - (window as any).__lastTotal;
        (window as any).__lastTotal = totalEvents;
        return diff;
      });
    }, 1000);
    (window as any).__lastTotal = totalEvents;

    return () => {
      clearInterval(interval);
      clearInterval(epsInterval);
    };
  }, [socket, totalEvents]);

  const getNodeStatus = (node: FlowNode) => {
    // Override with activity indicators
    if (node.id === 'connectors' && stats.apiCalls > 0) return 'active';
    if (node.id === 'scheduler' && stats.postsPublished > 0) return 'active';
    if (node.id === 'socketio' && eventsPerSec > 0) return 'active';
    return node.status;
  };

  return (
    <div className="relative w-full h-[600px] bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
      {/* Background grid */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />

      {/* Edges with animated packets */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {edges.map(edge => {
          const fromNode = nodes.find(n => n.id === edge.from);
          const toNode = nodes.find(n => n.id === edge.to);
          if (!fromNode || !toNode) return null;
          
          const x1 = `${fromNode.x}%`;
          const y1 = `${fromNode.y}%`;
          const x2 = `${toNode.x}%`;
          const y2 = `${toNode.y}%`;

          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#374151" strokeWidth="1" />
              {edge.packets.map(pkt => (
                <motion.circle
                  key={pkt.id}
                  r="3"
                  fill="#6366f1"
                  opacity={pkt.opacity}
                  animate={{
                    cx: [`${fromNode.x}%`, `${toNode.x}%`],
                    cy: [`${fromNode.y}%`, `${toNode.y}%`],
                  }}
                  transition={{ duration: 0.6, ease: 'linear' }}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map(node => {
        const Icon = node.icon;
        const status = getNodeStatus(node);
        const color = STATUS_COLORS[status];

        return (
          <motion.div
            key={node.id}
            className="absolute flex flex-col items-center gap-1"
            style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
            animate={{
              scale: status === 'active' ? [1, 1.05, 1] : 1,
            }}
            transition={{ duration: 2, repeat: status === 'active' ? Infinity : 0 }}
          >
            {/* Pulse ring */}
            {status === 'active' && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: `2px solid ${color}` }}
                animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}

            {/* Node icon */}
            <motion.div
              className="p-3 rounded-xl cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
              whileHover={{ scale: 1.15 }}
              title={`${node.label}: ${status}`}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </motion.div>

            {/* Label */}
            <span className="text-[9px] font-mono font-bold uppercase text-brand-text-muted text-center leading-tight max-w-[70px]">
              {node.label}
            </span>

            {/* Status dot */}
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: color }}
              animate={{ opacity: status === 'active' ? [1, 0.4, 1] : 1 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        );
      })}

      {/* Stats overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-brand-elevated/90 backdrop-blur-sm border border-brand-border rounded-xl px-4 py-2">
        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-brand-primary" />
            <span className="text-brand-text-muted">Events/s:</span>
            <span className="text-brand-primary font-bold">{eventsPerSec}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-brand-success" />
            <span className="text-brand-text-muted">Total:</span>
            <span className="text-brand-success font-bold">{totalEvents.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-brand-warning" />
            <span className="text-brand-text-muted">Queue:</span>
            <span className="text-brand-warning font-bold">{stats.apiCalls - stats.postsPublished}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono text-brand-text-muted uppercase">Live</span>
        </div>
      </div>
    </div>
  );
}
