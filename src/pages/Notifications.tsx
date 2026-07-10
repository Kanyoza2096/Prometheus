import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, RefreshCw, AlertTriangle, CheckCheck, Info, AlertCircle, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { Spinner } from '../components/Spinner';
import { fetchNotifications, markNotificationRead, type NotificationEntry } from '../lib/api';

function typeIcon(type?: string) {
  switch ((type ?? '').toLowerCase()) {
    case 'error':   return <AlertCircle className="w-4 h-4 text-brand-danger" />;
    case 'warning': return <AlertTriangle className="w-4 h-4 text-brand-warning" />;
    case 'success': return <Check className="w-4 h-4 text-brand-success" />;
    case 'info':    return <Info className="w-4 h-4 text-brand-accent" />;
    default:        return <Zap className="w-4 h-4 text-brand-primary" />;
  }
}

function typeColor(type?: string) {
  switch ((type ?? '').toLowerCase()) {
    case 'error':   return 'border-brand-danger/30 bg-brand-danger/5';
    case 'warning': return 'border-brand-warning/30 bg-brand-warning/5';
    case 'success': return 'border-brand-success/30 bg-brand-success/5';
    default:        return 'border-brand-border bg-brand-surface';
  }
}

export default function Notifications() {
  const { restEndpoint, masterToken, triggerNotification } = useStore();
  const cfg = { restEndpoint, masterToken };
  const qc  = useQueryClient();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['notifications', restEndpoint],
    queryFn:  () => fetchNotifications(cfg),
    retry: 1,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const notifications: NotificationEntry[] = data?.notifications ?? [];
  const unread = notifications.filter(n => !n.read);
  const displayed = filter === 'unread' ? unread : notifications;

  const readMut = useMutation({
    mutationFn: (id: string | number) => markNotificationRead(cfg, id),
    onSuccess: (_, id) => {
      qc.setQueryData<{ notifications: NotificationEntry[] }>(['notifications', restEndpoint], old => ({
        notifications: (old?.notifications ?? []).map(n => n.id === id ? { ...n, read: true } : n),
      }));
    },
    onError: () => triggerNotification({ title: 'Error', message: 'Could not mark notification as read.', type: 'warning' }),
  });

  const markAllMut = useMutation({
    mutationFn: async () => {
      await Promise.all(unread.map(n => markNotificationRead(cfg, n.id)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', restEndpoint] });
      triggerNotification({ title: 'All Clear', message: 'All notifications marked as read.', type: 'success' });
    },
    onError: () => triggerNotification({ title: 'Error', message: 'Could not mark all as read.', type: 'warning' }),
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-24 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-brand-primary" />
            Notifications
            {unread.length > 0 && (
              <span className="px-2.5 py-0.5 bg-brand-primary text-white text-xs font-bold rounded-full font-mono">
                {unread.length}
              </span>
            )}
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">SYSTEM ALERT FEED</p>
        </div>
        <div className="flex items-center gap-2">
          {unread.length > 0 && (
            <button
              onClick={() => markAllMut.mutate()}
              disabled={markAllMut.isPending}
              className="px-4 py-2.5 bg-brand-elevated border border-brand-border rounded-xl text-xs font-bold uppercase tracking-wider text-brand-text-muted hover:text-brand-text hover:border-brand-primary/40 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {markAllMut.isPending ? <Spinner size={14} /> : <CheckCheck className="w-4 h-4" />}
              Mark All Read
            </button>
          )}
          <button
            aria-label="Refresh notifications"
            onClick={() => refetch()}
            className="p-2.5 bg-brand-elevated border border-brand-border rounded-xl text-brand-text-muted hover:text-brand-text transition-colors"
          >
            <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 border-b border-brand-border pb-4">
        {(['all', 'unread'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors',
              filter === f
                ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/40'
                : 'bg-brand-elevated border border-brand-border text-brand-text-muted hover:text-brand-text',
            )}
          >
            {f === 'all' ? `All (${notifications.length})` : `Unread (${unread.length})`}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-brand-surface border border-brand-border rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="py-16 text-center text-brand-danger font-mono text-sm flex flex-col items-center gap-2 bg-brand-surface border border-brand-border rounded-2xl">
          <AlertTriangle className="w-6 h-6" />
          Failed to load notifications.
          <button onClick={() => refetch()} className="mt-2 px-4 py-1.5 bg-brand-elevated rounded-lg text-xs font-bold">Retry</button>
        </div>
      )}

      {!isLoading && !isError && displayed.length === 0 && (
        <div className="py-16 text-center border border-dashed border-brand-border rounded-2xl">
          <Bell className="w-10 h-10 text-brand-text-muted mx-auto mb-3 opacity-30" />
          <p className="text-brand-text-muted font-mono text-xs uppercase">
            {filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
          </p>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {!isLoading && !isError && displayed.map((n, idx) => (
          <motion.div
            key={n.id}
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: 0.03 * idx }}
            className={cn(
              'flex items-start gap-4 p-5 rounded-2xl border transition-all',
              typeColor(n.type),
              n.read && 'opacity-60',
            )}
          >
            <div className="mt-0.5 shrink-0">{typeIcon(n.type)}</div>
            <div className="flex-1 min-w-0">
              {n.title && <div className="text-sm font-bold text-brand-text mb-0.5">{n.title}</div>}
              {n.message && <div className="text-xs text-brand-text-muted leading-relaxed">{n.message}</div>}
              {n.created_at && (
                <div className="text-[10px] font-mono text-brand-text-muted mt-2">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              )}
            </div>
            {!n.read && (
              <button
                onClick={() => readMut.mutate(n.id)}
                disabled={readMut.isPending && readMut.variables === n.id}
                className="shrink-0 p-1.5 bg-brand-elevated border border-brand-border rounded-lg text-brand-text-muted hover:text-brand-success hover:border-brand-success/40 transition-colors disabled:opacity-50"
                title="Mark as read"
              >
                {readMut.isPending && readMut.variables === n.id
                  ? <Spinner size={12} />
                  : <Check className="w-3.5 h-3.5" />
                }
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
