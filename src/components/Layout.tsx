import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import {
  LayoutDashboard,
  FileText,
  Activity,
  ShieldAlert,
  Settings,
  LogOut,
  Bell,
  Zap,
  Menu,
  Terminal as TerminalIcon,
  X,
  BrainCircuit,
  Network,
  GitBranch,
  BarChart3,
  Keyboard,
} from 'lucide-react';
import { cn } from '../lib/utils';
import CommandTerminal from './CommandTerminal';
import CommandPalette from './CommandPalette';
import { supabase } from '../lib/supabase';

export default function Layout() {
  const {
    logout, socketConnected, connectSocket, disconnectSocket,
    guardianAlerts, toggleTerminal, setPendingCommand, fetchInitialData, isUsingLiveBackendData,
  } = useStore();

  const [isMobileMenuOpen,    setIsMobileMenuOpen]    = useState(false);
  const [isFabOpen,           setIsFabOpen]           = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAdminMenuOpen,     setIsAdminMenuOpen]     = useState(false);
  const [isShortcutsOpen,     setIsShortcutsOpen]     = useState(false);
  const [clockTime,           setClockTime]           = useState(() => new Date().toISOString().replace('T', ' ').substring(0, 19));
  const navigate = useNavigate();

  // Live UTC clock — updates every second
  useEffect(() => {
    const tick = () => {
      setClockTime(new Date().toISOString().replace('T', ' ').substring(0, 19));
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    connectSocket();
    fetchInitialData();
    return () => disconnectSocket();
  }, [connectSocket, disconnectSocket, fetchInitialData]);

  const navItems = [
    { to: '/',          icon: LayoutDashboard, label: 'Command Center' },
    { to: '/posts',     icon: FileText,        label: 'Content Studio' },
    { to: '/workflows', icon: GitBranch,       label: 'Workflows'      },
    { to: '/engine',    icon: BrainCircuit,    label: 'AI Matrix'      },
    { to: '/payloads',  icon: Network,         label: 'Payload Logs'   },
    { to: '/api',       icon: Activity,        label: 'API Analytics'  },
    { to: '/prometheus',icon: BarChart3,       label: 'Prometheus'     },
    { to: '/guardian',  icon: ShieldAlert,     label: 'Guardian'       },
    { to: '/settings',  icon: Settings,        label: 'Settings'       },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate('/');
  };

  const handleFabCommand = (cmd: string, path?: string) => {
    setPendingCommand(cmd);
    if (!useStore.getState().isTerminalOpen) {
      toggleTerminal();
    }
    if (path) navigate(path);
  };

  const unreadAlerts = guardianAlerts.filter(a => a.severity === 'CRITICAL').length;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-bg text-brand-text overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-brand-surface border-b border-brand-border z-50">
        <div className="flex items-center">
          <Zap className="w-6 h-6 text-brand-primary animate-pulse" />
          <span className="ml-2 font-bold uppercase tracking-widest text-sm">Kanyoza</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-brand-text-muted">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <nav className={cn(
        'fixed md:relative top-0 left-0 h-full w-64 bg-brand-surface border-r border-brand-border z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col',
        isMobileMenuOpen ? 'translate-x-0 visible' : '-translate-x-full invisible md:visible'
      )}>
        <div className="p-6 hidden md:flex items-center space-x-3 mb-4">
          <div className="relative">
            <Zap className="w-8 h-8 text-brand-primary" />
            <div className="absolute inset-0 bg-brand-primary blur-md opacity-50" />
          </div>
          <div>
            <h1 className="font-bold uppercase tracking-widest text-sm">Kanyoza</h1>
            <p className="text-[10px] text-brand-text-muted font-mono">SYS-NET-ONLINE</p>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 md:py-0 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group font-medium text-sm',
                isActive
                  ? 'bg-brand-elevated text-brand-text border border-brand-border shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                  : 'text-brand-text-muted hover:bg-brand-bg hover:text-brand-text'
              )}
            >
              <item.icon className="w-5 h-5 group-hover:text-brand-primary transition-colors" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-brand-border">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center space-x-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                socketConnected
                  ? 'bg-brand-success animate-pulse shadow-glow-success'
                  : 'bg-brand-danger shadow-glow-danger'
              )} />
              <span className="text-xs font-mono text-brand-text-muted uppercase">
                {socketConnected ? 'Uplink Active' : 'Uplink Offline'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium text-brand-text-muted hover:text-brand-danger hover:bg-brand-danger/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Terminate Session</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:h-screen h-[calc(100vh-3.5rem)] overflow-hidden relative">
        {/* Top Bar */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 bg-brand-surface/50 backdrop-blur-md border-b border-brand-border hidden md:flex z-30">
          <div className="flex items-center space-x-4 text-xs font-mono">
            <div className="text-brand-text-muted">
              <span className="text-brand-primary mr-2">SYS_TIME:</span>
              <span className="tabular-nums">{clockTime} UTC</span>
            </div>
            <div className={cn(
              'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center border',
              isUsingLiveBackendData
                ? 'bg-brand-success/10 text-brand-success border-brand-success/30'
                : 'bg-brand-accent/10 text-brand-accent border-brand-accent/30'
            )}>
              <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', isUsingLiveBackendData ? 'bg-brand-success animate-pulse' : 'bg-brand-accent')} />
              {isUsingLiveBackendData ? 'Live Database Active' : 'Fallback Mock Data'}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Keyboard shortcuts hint */}
            <div className="relative">
              <button
                onClick={() => { setIsShortcutsOpen(v => !v); setIsNotificationsOpen(false); setIsAdminMenuOpen(false); }}
                className="p-1 rounded-lg hover:bg-brand-elevated transition-colors text-brand-text-muted hover:text-brand-text"
                title="Keyboard shortcuts"
              >
                <Keyboard className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {isShortcutsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 bg-brand-surface border border-brand-border rounded-2xl shadow-2xl p-4 z-50 font-mono text-xs"
                  >
                    <p className="font-bold uppercase tracking-wider mb-3 text-brand-text">Keyboard Shortcuts</p>
                    <div className="space-y-2 text-brand-text-muted">
                      {[
                        { keys: 'Ctrl + K',  label: 'Command palette'     },
                        { keys: 'Ctrl + `',  label: 'Toggle terminal'     },
                        { keys: 'Escape',    label: 'Close modals'        },
                      ].map(({ keys, label }) => (
                        <div key={keys} className="flex items-center justify-between">
                          <span>{label}</span>
                          <kbd className="px-2 py-0.5 bg-brand-elevated border border-brand-border rounded text-[10px] font-bold">{keys}</kbd>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsAdminMenuOpen(false); setIsShortcutsOpen(false); }}
                className="p-1 rounded-lg hover:bg-brand-elevated transition-colors relative"
              >
                <Bell className="w-5 h-5 text-brand-text-muted hover:text-brand-text transition-colors" />
                {unreadAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-danger rounded-full flex items-center justify-center text-[9px] font-bold shadow-glow-danger text-white">
                    {unreadAlerts}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-brand-surface border border-brand-border rounded-2xl shadow-2xl p-4 z-50"
                  >
                    <div className="flex justify-between items-center pb-3 border-b border-brand-border mb-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text">System Alerts</h3>
                      <span className="text-[10px] font-mono bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded">
                        {guardianAlerts.length} total
                      </span>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                      {guardianAlerts.length === 0 ? (
                        <p className="text-center text-xs font-mono text-brand-text-muted py-4 opacity-60">No active alerts</p>
                      ) : guardianAlerts.slice(0, 5).map(alert => (
                        <div
                          key={alert.id}
                          onClick={() => { navigate('/guardian'); setIsNotificationsOpen(false); }}
                          className="p-2.5 bg-brand-bg hover:bg-brand-elevated rounded-xl border border-brand-border/60 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={cn(
                              'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded',
                              alert.severity === 'CRITICAL' ? 'bg-brand-danger/20 text-brand-danger' : 'bg-brand-warning/20 text-brand-warning'
                            )}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-xs font-bold truncate text-brand-text">{alert.title}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => { navigate('/guardian'); setIsNotificationsOpen(false); }}
                      className="w-full mt-3 py-2 text-center text-xs font-bold text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-colors border border-brand-primary/20 uppercase"
                    >
                      View All in Guardian
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Admin menu */}
            <div className="relative border-l border-brand-border pl-4">
              <button
                onClick={() => { setIsAdminMenuOpen(!isAdminMenuOpen); setIsNotificationsOpen(false); setIsShortcutsOpen(false); }}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity text-left"
              >
                <div className="w-8 h-8 rounded-full bg-brand-elevated border border-brand-border flex items-center justify-center overflow-hidden">
                  <img src="https://ui-avatars.com/api/?name=Admin&background=4F46E5&color=fff" alt="Admin" />
                </div>
                <div className="text-sm">
                  <p className="font-bold leading-none">Admin Alpha</p>
                  <p className="text-xs text-brand-text-muted font-mono mt-1">Level 5 Clearance</p>
                </div>
              </button>

              <AnimatePresence>
                {isAdminMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-brand-surface border border-brand-border rounded-2xl shadow-2xl p-2 z-50 font-mono text-xs space-y-1"
                  >
                    <button
                      onClick={() => { navigate('/settings'); setIsAdminMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-brand-elevated text-brand-text transition-colors flex items-center space-x-2"
                    >
                      <Settings className="w-4 h-4 text-brand-primary" />
                      <span>Operator Settings</span>
                    </button>
                    <button
                      onClick={() => { toggleTerminal(); setIsAdminMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-brand-elevated text-brand-text transition-colors flex items-center space-x-2"
                    >
                      <TerminalIcon className="w-4 h-4 text-brand-accent" />
                      <span>Command Terminal</span>
                    </button>
                    <div className="border-t border-brand-border my-1" />
                    <button
                      onClick={() => { handleLogout(); setIsAdminMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-brand-danger/20 text-brand-danger transition-colors flex items-center space-x-2 font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Terminate Session</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-bg relative z-10 scroll-smooth p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <AnimatePresence>
            {isFabOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="absolute bottom-16 right-0 mb-2 flex flex-col items-end space-y-2 origin-bottom-right"
              >
                {[
                  { label: 'System Terminal',      icon: TerminalIcon, color: 'bg-[#1C2541]', onClick: toggleTerminal },
                  { label: 'Force Post Now',        icon: Zap,          color: 'bg-brand-primary', onClick: () => handleFabCommand('/post', '/posts') },
                  { label: 'Trigger Security Scan', icon: ShieldAlert,  color: 'bg-brand-danger',  onClick: () => handleFabCommand('/scan', '/guardian') },
                  { label: 'System Pulse Check',    icon: Activity,     color: 'bg-brand-accent',  onClick: () => handleFabCommand('/ping') },
                ].map((action, i) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => { if (action.onClick) action.onClick(); setIsFabOpen(false); }}
                    className="flex items-center space-x-3 group"
                  >
                    <span className="px-3 py-1.5 bg-brand-elevated rounded-md text-xs font-bold uppercase tracking-wider text-brand-text shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {action.label}
                    </span>
                    <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg', action.color)}>
                      <action.icon className="w-5 h-5" />
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsFabOpen(!isFabOpen)}
            className="w-14 h-14 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-glow-primary hover:scale-105 active:scale-95 transition-all z-50 relative"
          >
            <motion.div animate={{ rotate: isFabOpen ? 45 : 0 }}>
              <Zap className="w-6 h-6" />
            </motion.div>
          </button>
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <CommandPalette />
      <CommandTerminal />
    </div>
  );
}
