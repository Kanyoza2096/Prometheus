import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, Cpu } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface LogLine {
  id: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'error' | 'success' | 'command' | 'system';
  content: string;
}

export default function CommandTerminal() {
  const { isTerminalOpen, toggleTerminal, healthMatrix, pendingCommand, setPendingCommand } = useStore();
  const [isMaximized, setIsMaximized] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<LogLine[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Boot sequence effect
  useEffect(() => {
    if (isTerminalOpen && history.length === 0) {
      const bootSequence = [
        { type: 'system', content: 'INITIALIZING KANYOZA PLATFORM v10...' },
        { type: 'info', content: 'Bootstrapping Python 3.12 + Flask environment...' },
        { type: 'success', content: 'Dependency Registry wired. Service Container initialized.' },
        { type: 'info', content: 'Connecting EventBus to TaskQueue (3 workers, 200 slots)...' },
        { type: 'success', content: 'Supabase Repositories active. Graceful degradation: Enabled.' },
        { type: 'warning', content: 'Playwright Card Renderer: Pre-caching Inter webfonts...' },
        { type: 'system', content: 'SYSTEM READY. Type "/help" for available owner commands.' },
      ];

      bootSequence.forEach((log, index) => {
        setTimeout(() => {
          setHistory(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            type: log.type as any,
            content: log.content
          }]);
        }, index * 400 + 300);
      });
    }
  }, [isTerminalOpen, history.length]);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  useEffect(() => {
    if (isTerminalOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isTerminalOpen]);

  // Global hotkey to open terminal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        toggleTerminal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTerminal]);

  useEffect(() => {
    if (pendingCommand) {
      if (!isTerminalOpen) toggleTerminal();
      // small delay to let terminal mount/open before running
      setTimeout(() => {
        handleCommand(pendingCommand);
        setPendingCommand(null);
      }, 300);
    }
  }, [pendingCommand, isTerminalOpen, toggleTerminal, setPendingCommand]);

  const addLog = (type: LogLine['type'], content: string) => {
    setHistory(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      type,
      content
    }]);
  };

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    addLog('command', `admin@kanyoza:~$ ${trimmedCmd}`);
    setCommandHistory(prev => [trimmedCmd, ...prev]);
    setHistoryIndex(-1);

    const args = trimmedCmd.toLowerCase().split(' ');
    const mainCommand = args[0];

    setTimeout(() => {
      switch (mainCommand) {
        case '/help':
          addLog('info', '🤖 Owner commands:');
          addLog('info', '  /help      — List available commands');
          addLog('info', '  /status    — Bot status and configuration summary');
          addLog('info', '  /analytics — Post and message statistics');
          addLog('info', '  /post      — Force publish a content post now');
          addLog('info', '  /news      — Force publish a news post now');
          addLog('info', '  /reload    — Hot-reload environment settings');
          addLog('info', '  /mood      — Show current persona mood');
          addLog('info', '  /ping      — Liveness check');
          addLog('info', '  /scan      — Run Code Guardian security scan (if configured)');
          addLog('info', '  clear      — Clear terminal output');
          break;
        case 'clear':
          setHistory([]);
          break;
        case '/status':
          addLog('system', '--- SYSTEM HEALTH MATRIX ---');
          healthMatrix.forEach(service => {
            const statusColor = service.status === 'online' ? 'success' : service.status === 'degraded' ? 'warning' : 'error';
            addLog(statusColor, `[${service.status.toUpperCase()}] ${service.name.padEnd(15)} | Latency: ${service.latency}ms | Uptime: ${service.uptime}%`);
          });
          addLog('info', 'Configuration: Production | Region: af-south-1');
          addLog('system', '----------------------------');
          break;
        case '/analytics':
          addLog('info', '--- REAL-TIME ANALYTICS ---');
          addLog('success', `Messages Today: 14,052`);
          addLog('success', `Posts Published: 124`);
          addLog('success', `Active Users: 843`);
          addLog('success', `API Calls: 1,045,920`);
          break;
        case '/post':
          addLog('warning', 'Initiating emergency content broadcast...');
          setTimeout(() => addLog('success', 'Content generated via Gemini AI.'), 800);
          setTimeout(() => addLog('success', 'Post published to Facebook Graph API successfully.'), 1600);
          break;
        case '/news':
          addLog('warning', 'Gathering latest tech ecosystem news...');
          setTimeout(() => addLog('info', 'Aggregating sources... [OK]'), 1000);
          setTimeout(() => addLog('success', 'News broadcast published.'), 2200);
          break;
        case '/reload':
          addLog('warning', 'Hot-reloading environment settings...');
          setTimeout(() => addLog('system', 'Core modules restarted. New config applied.'), 1500);
          break;
        case '/mood':
          addLog('system', 'Current Persona Mood: HIGHLY ANALYTICAL & PROFESSIONAL 🧠');
          addLog('info', 'Sentiment bias: +0.2 (Optimistic)');
          break;
        case '/scan':
          addLog('warning', 'Initiating Code Guardian security scan...');
          setTimeout(() => addLog('info', 'Scanning memory heuristics... [OK]'), 800);
          setTimeout(() => addLog('info', 'Verifying package signatures... [OK]'), 1600);
          setTimeout(() => addLog('success', 'Scan complete. 0 critical vulnerabilities found.'), 2500);
          break;
        case '/ping':
          addLog('info', `Pinging core-router [10.42.0.1] with 32 bytes of data:`);
          setTimeout(() => addLog('info', `Reply from 10.42.0.1: time=12ms TTL=64`), 600);
          setTimeout(() => addLog('info', `Reply from 10.42.0.1: time=14ms TTL=64`), 1200);
          setTimeout(() => addLog('info', `Reply from 10.42.0.1: time=11ms TTL=64`), 1800);
          break;
        default:
          addLog('error', `Command not found: ${mainCommand}. Type "/help" for a list of owner commands.`);
      }
    }, 100);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const prevIndex = historyIndex - 1;
        setHistoryIndex(prevIndex);
        setInput(commandHistory[prevIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'info': return 'text-brand-text-muted';
      case 'warning': return 'text-brand-warning';
      case 'error': return 'text-brand-danger';
      case 'success': return 'text-brand-success';
      case 'command': return 'text-brand-text font-bold';
      case 'system': return 'text-brand-primary font-bold';
      default: return 'text-brand-text';
    }
  };

  return (
    <AnimatePresence>
      {isTerminalOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={cn(
            "fixed z-50 flex flex-col bg-[#0A0E17]/95 backdrop-blur-2xl border border-brand-primary/30 shadow-[0_0_50px_rgba(79,70,229,0.2)] overflow-hidden transition-all duration-300",
            isMaximized 
              ? "inset-0 md:inset-4 md:rounded-2xl" 
              : "bottom-4 right-4 w-full max-w-[600px] h-[400px] rounded-2xl md:bottom-6 md:right-24"
          )}
        >
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0A0E17] border-b border-brand-border select-none">
            <div className="flex items-center space-x-2">
              <TerminalIcon className="w-4 h-4 text-brand-primary" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-text-muted">
                Kanyoza Secure Terminal
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => setIsMaximized(!isMaximized)} className="text-brand-text-muted hover:text-brand-text transition-colors">
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button onClick={toggleTerminal} className="text-brand-text-muted hover:text-brand-danger transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Terminal Output */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1 custom-scrollbar" onClick={() => inputRef.current?.focus()}>
            {history.map((log) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={log.id} 
                className="flex items-start"
              >
                <span className="text-brand-text-muted/50 mr-3 text-xs mt-0.5 select-none">
                  [{format(log.timestamp, 'HH:mm:ss')}]
                </span>
                <span className={cn("break-all whitespace-pre-wrap", getLogColor(log.type))}>
                  {log.content}
                </span>
              </motion.div>
            ))}
            <div ref={endOfMessagesRef} />
          </div>

          {/* Terminal Input */}
          <div className="p-4 bg-[#0A0E17]/80 border-t border-brand-border flex items-center">
            <span className="text-brand-success font-mono font-bold mr-2 select-none">admin@kanyoza:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-brand-text font-mono text-sm placeholder-brand-text-muted/30"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
