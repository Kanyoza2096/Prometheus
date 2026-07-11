// ═══════════════════════════════════════════════════════════════════════════
// DATA FLOW VISUALIZER — With Failure Detection
// ═══════════════════════════════════════════════════════════════════════════

interface FlowNode {
  id: string;
  label: string;
  icon: React.ElementType;
  x: number;
  y: number;
  status: 'online' | 'degraded' | 'offline' | 'active';
  pulseCount: number;
  failureReason?: string;
}

interface FlowEdge {
  from: string;
  to: string;
  packets: { id: string; progress: number; opacity: number; isError: boolean }[];
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

const STATUS_LABELS: Record<string, string> = {
  online: 'Healthy',
  degraded: 'Degraded',
  offline: 'Down',
  active: 'Processing',
};

function DataFlowVisualizer() {
  const { socket, healthMatrix, stats } = useStore();
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [eventsPerSec, setEventsPerSec] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [failureEvents, setFailureEvents] = useState(0);
  const [lastFailure, setLastFailure] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const packetIdRef = useRef(0);

  // Initialize nodes and edges
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
        (node.id === 'redis' && h.id === 'redis') ||
        (node.id === 'gemini' && h.name?.toLowerCase().includes('gemini')) ||
        (node.id === 'browser' && h.name?.toLowerCase().includes('browser'))
      );
      if (!health) return node;
      const status = health.status === 'online' ? 'online' 
        : health.status === 'degraded' ? 'degraded' 
        : 'offline';
      return { ...node, status };
    }));
  }, [healthMatrix]);

  // Main socket event listeners — activity + failures
  useEffect(() => {
    if (!socket) return;

    // ── Spawn success packets ──────────────────────────────────────────
    const spawnPacket = () => {
      const edgeIndex = Math.floor(Math.random() * EDGES.length);
      const [from, to] = EDGES[edgeIndex];
      setEdges(prev => prev.map(edge => {
        if (edge.from === from && edge.to === to) {
          const newPacket = { 
            id: `pkt_${packetIdRef.current++}`, 
            progress: 0, 
            opacity: 0.8, 
            isError: false 
          };
          return { ...edge, packets: [...edge.packets.slice(-3), newPacket] };
        }
        return edge;
      }));
    };

    // ── Spawn error packets on failing edges ───────────────────────────
    const spawnErrorPacket = (fromNodeId: string, toNodeId: string) => {
      setEdges(prev => prev.map(edge => {
        if (edge.from === fromNodeId || edge.to === toNodeId || 
            edge.to === fromNodeId || edge.from === toNodeId) {
          const newPacket = { 
            id: `err_${packetIdRef.current++}`, 
            progress: 0, 
            opacity: 1, 
            isError: true 
          };
          return { ...edge, packets: [...edge.packets.slice(-3), newPacket] };
        }
        return edge;
      }));
    };

    // ── Activity events → success packets ──────────────────────────────
    const activityEvents = ['new_message', 'post_published', 'api_payload', 'scan_complete', 'stats'];
    activityEvents.forEach(event => {
      socket.on(event, () => {
        spawnPacket();
        setTotalEvents(prev => prev + 1);
      });
    });

    // ── Worker error → mark node offline ───────────────────────────────
    socket.on('worker_error', (data: any) => {
      const source = data?.source || data?.service || data?.worker || '';
      const errorMsg = data?.error || data?.message || 'Worker failure';
      
      setNodes(prev => prev.map(node => {
        if (node.id === source || 
            node.label?.toLowerCase().includes(source?.toLowerCase()) ||
            (source.includes('render') && node.id === 'render') ||
            (source.includes('browser') && node.id === 'browser') ||
            (source.includes('scheduler') && node.id === 'scheduler')) {
          return { ...node, status: 'offline', failureReason: errorMsg };
        }
        return node;
      }));

      // Spawn error packets from affected node
      const affectedNode = NODE_LAYOUT.find(n => 
        n.id === source || n.label?.toLowerCase().includes(source?.toLowerCase())
      );
      if (affectedNode) {
        EDGES.forEach(([from, to]) => {
          if (from === affectedNode.id || to === affectedNode.id) {
            spawnErrorPacket(from, to);
          }
        });
      }

      setFailureEvents(prev => prev + 1);
      setLastFailure(errorMsg);
      setTotalEvents(prev => prev + 1);
    });

    // ── Provider failed → mark connector + related nodes ───────────────
    socket.on('provider_failed', (data: any) => {
      const provider = data?.provider || data?.source || '';
      const errorMsg = data?.error || data?.message || `${provider} provider failed`;

      setNodes(prev => prev.map(node => {
        if (node.id === 'connectors') {
          return { ...node, status: 'degraded', failureReason: `${provider}: ${errorMsg}` };
        }
        if (node.id === provider || node.label?.toLowerCase().includes(provider?.toLowerCase())) {
          return { ...node, status: 'offline', failureReason: errorMsg };
        }
        return node;
      }));

      // Error packets on connector edges
      EDGES.forEach(([from, to]) => {
        if (from === 'connectors' || to === 'connectors') {
          spawnErrorPacket(from, to);
        }
      });

      setFailureEvents(prev => prev + 1);
      setLastFailure(`${provider}: ${errorMsg}`);
      setTotalEvents(prev => prev + 1);
    });

    // ── Scan complete with critical issues → mark guardian ─────────────
    socket.on('scan_complete', (data: any) => {
      if (data?.critical > 0 || data?.severity === 'CRITICAL') {
        setNodes(prev => prev.map(node => {
          if (node.id === 'command' || node.id === 'pipeline') {
            return { ...node, status: 'degraded', failureReason: `Security scan found ${data.critical || 0} critical issues` };
          }
          return node;
        }));
        setFailureEvents(prev => prev + 1);
        setLastFailure(data?.title || data?.summary || 'Security scan found critical issues');
      }
    });

    // ── Packet animation loop ──────────────────────────────────────────
    const interval = setInterval(() => {
      setEdges(prev => prev.map(edge => ({
        ...edge,
        packets: edge.packets
          .map(p => ({ ...p, progress: p.progress + 0.03, opacity: p.opacity - 0.012 }))
          .filter(p => p.progress < 1 && p.opacity > 0),
      })));
    }, 50);

    // ── Events per second counter ──────────────────────────────────────
    const epsInterval = setInterval(() => {
      setEventsPerSec(prev => {
        const diff = totalEvents - ((window as any).__lastTotal || 0);
        (window as any).__lastTotal = totalEvents;
        return diff;
      });
    }, 1000);

    // ── Health check watchdog — degrade nodes with stale health data ───
    const healthWatchdog = setInterval(() => {
      const now = Date.now();
      setNodes(prev => prev.map(node => {
        // Don't override nodes already marked offline by error events
        if (node.status === 'offline') return node;
        
        const health = healthMatrix.find(h => 
          h.id === node.id || h.name?.toLowerCase().includes(node.id)
        );
        if (health && health.lastChecked && (now - health.lastChecked) > 30000) {
          return { ...node, status: 'degraded', failureReason: 'No health check in 30s' };
        }
        return node;
      }));
    }, 10000);

    return () => {
      activityEvents.forEach(event => socket.off(event));
      socket.off('worker_error');
      socket.off('provider_failed');
      socket.off('scan_complete');
      clearInterval(interval);
      clearInterval(epsInterval);
      clearInterval(healthWatchdog);
    };
  }, [socket, totalEvents, healthMatrix]);

  // Determine node visual status
  const getNodeStatus = (node: FlowNode): 'online' | 'degraded' | 'offline' | 'active' => {
    if (node.status === 'offline') return 'offline';
    if (node.status === 'degraded') return 'degraded';
    if (node.id === 'connectors' && stats.apiCalls > 0) return 'active';
    if (node.id === 'scheduler' && stats.postsPublished > 0) return 'active';
    if (node.id === 'socketio' && eventsPerSec > 0) return 'active';
    return node.status;
  };

  const offlineCount = nodes.filter(n => getNodeStatus(n) === 'offline').length;
  const degradedCount = nodes.filter(n => getNodeStatus(n) === 'degraded').length;
  const systemHealthy = offlineCount === 0 && degradedCount === 0;

  return (
    <div className="relative w-full h-[420px] bg-brand-surface border border-brand-border rounded-2xl overflow-hidden group">
      {/* Background grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Failure overlay — red pulse at edges when system is degraded */}
      {!systemHealthy && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ border: '2px solid transparent' }}
          animate={{ 
            boxShadow: [
              'inset 0 0 0px rgba(239,68,68,0)',
              'inset 0 0 30px rgba(239,68,68,0.15)',
              'inset 0 0 0px rgba(239,68,68,0)',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      {/* SVG Edges with animated packets */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {edges.map(edge => {
          const fromNode = nodes.find(n => n.id === edge.from);
          const toNode = nodes.find(n => n.id === edge.to);
          if (!fromNode || !toNode) return null;
          
          const fromStatus = getNodeStatus(fromNode);
          const toStatus = getNodeStatus(toNode);
          const edgeFailed = fromStatus === 'offline' || toStatus === 'offline';
          const edgeDegraded = fromStatus === 'degraded' || toStatus === 'degraded';
          const strokeColor = edgeFailed ? '#ef4444' : edgeDegraded ? '#f59e0b' : '#374151';
          const strokeWidth = edgeFailed ? '2' : '1';
          
          return (
            <g key={`${edge.from}-${edge.to}`}>
              {/* Edge line */}
              <line 
                x1={`${fromNode.x}%`} y1={`${fromNode.y}%`} 
                x2={`${toNode.x}%`} y2={`${toNode.y}%`} 
                stroke={strokeColor} 
                strokeWidth={strokeWidth}
                strokeDasharray={edgeFailed ? '5 3' : 'none'}
                opacity={edgeFailed ? 0.6 : 0.4}
              />
              {/* Animated packets */}
              {edge.packets.map(pkt => (
                <motion.circle
                  key={pkt.id} 
                  r={pkt.isError ? 4 : 2.5}
                  fill={pkt.isError ? '#ef4444' : '#6366f1'}
                  opacity={pkt.opacity}
                  animate={{ 
                    cx: [`${fromNode.x}%`, `${toNode.x}%`], 
                    cy: [`${fromNode.y}%`, `${toNode.y}%`] 
                  }}
                  transition={{ duration: pkt.isError ? 0.3 : 0.6, ease: 'linear' }}
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
        const isHovered = hoveredNode === node.id;

        return (
          <motion.div
            key={node.id}
            className="absolute flex flex-col items-center gap-0.5"
            style={{ 
              left: `${node.x}%`, 
              top: `${node.y}%`, 
              transform: 'translate(-50%, -50%)',
              zIndex: isHovered ? 50 : 10,
            }}
            animate={{
              scale: status === 'active' ? [1, 1.06, 1] : status === 'offline' ? [1, 0.97, 1] : 1,
            }}
            transition={{ 
              duration: status === 'active' ? 1.5 : status === 'offline' ? 0.8 : 2, 
              repeat: Infinity 
            }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            {/* Pulse ring for active nodes */}
            {status === 'active' && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: `2px solid ${color}` }}
                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}

            {/* Error pulse ring for offline nodes */}
            {status === 'offline' && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: `2px solid ${color}` }}
                animate={{ scale: [1, 1.4], opacity: [0.7, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            {/* Node icon */}
            <motion.div
              className="p-2.5 rounded-xl cursor-pointer transition-all"
              style={{ 
                backgroundColor: `${color}18`, 
                border: `1.5px solid ${color}50`,
                boxShadow: status === 'offline' ? `0 0 12px ${color}40` : undefined,
              }}
              whileHover={{ scale: 1.2 }}
              title={`${node.label}: ${STATUS_LABELS[status]}${node.failureReason ? ` — ${node.failureReason}` : ''}`}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </motion.div>

            {/* Label */}
            <span className="text-[8px] font-mono font-bold uppercase text-brand-text-muted text-center leading-tight max-w-[60px]">
              {node.label}
            </span>

            {/* Status dot */}
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: color }}
              animate={{ 
                opacity: status === 'active' ? [1, 0.3, 1] : status === 'offline' ? [1, 0.5, 1] : 1 
              }}
              transition={{ duration: status === 'offline' ? 0.5 : 1, repeat: Infinity }}
            />

            {/* Tooltip on hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute bottom-full mb-2 bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 shadow-xl whitespace-nowrap z-50"
                >
                  <p className="text-xs font-bold text-brand-text">{node.label}</p>
                  <p className="text-[10px] font-mono" style={{ color }}>
                    {STATUS_LABELS[status]}
                  </p>
                  {node.failureReason && (
                    <p className="text-[9px] text-red-400 mt-1 max-w-[180px] whitespace-normal">
                      {node.failureReason}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Stats bar */}
      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center bg-brand-elevated/95 backdrop-blur-sm border border-brand-border rounded-lg px-3 py-1.5">
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-brand-primary" />
            <span className="text-brand-text-muted">Events/s:</span>
            <span className="text-brand-primary font-bold">{eventsPerSec}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-brand-success" />
            <span className="text-brand-text-muted">Total:</span>
            <span className="text-brand-success font-bold">{totalEvents.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-brand-warning" />
            <span className="text-brand-text-muted">Queue:</span>
            <span className="text-brand-warning font-bold">{Math.max(0, stats.apiCalls - stats.postsPublished)}</span>
          </div>
          {failureEvents > 0 && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span className="text-brand-text-muted">Failures:</span>
              <span className="text-red-400 font-bold">{failureEvents}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastFailure && (
            <span className="text-[9px] text-red-400/80 font-mono max-w-[200px] truncate hidden md:block">
              Last: {lastFailure}
            </span>
          )}
          <div className="flex items-center gap-2">
            <motion.span 
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: systemHealthy ? '#22c55e' : offlineCount > 0 ? '#ef4444' : '#f59e0b' }}
              animate={{ opacity: systemHealthy ? [1, 0.5, 1] : [1, 0.3, 1] }}
              transition={{ duration: systemHealthy ? 2 : 0.5, repeat: Infinity }}
            />
            <span className="text-[9px] font-mono text-brand-text-muted uppercase">
              {systemHealthy ? 'All Systems Operational' : `${offlineCount} down, ${degradedCount} degraded`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
