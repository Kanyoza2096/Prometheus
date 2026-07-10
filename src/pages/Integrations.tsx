import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { Link, CheckCircle, XCircle, Plug, Server, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface IntegrationEntry {
  id: string;
  name: string;
  category: string;
  connected: boolean;
  status: string;
  description: string;
}

export default function Integrations() {
  const { restEndpoint, masterToken } = useStore();
  const [integrations, setIntegrations] = useState<IntegrationEntry[]>([]);
  const [connectors, setConnectors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headers = masterToken ? { Authorization: `Bearer ${masterToken}` } : {};

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const base = restEndpoint.replace(/\/+$/, '');

      const [intRes, connRes] = await Promise.allSettled([
        fetch(`${base}/integrations`, { headers }),
        fetch(`${base}/system/connectors`, { headers }),
      ]);

      if (intRes.status === 'fulfilled' && intRes.value.ok) {
        const data = await intRes.value.json();
        setIntegrations(data.integrations || []);
      }

      if (connRes.status === 'fulfilled' && connRes.value.ok) {
        const data = await connRes.value.json();
        setConnectors(data.supported_connectors || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [restEndpoint]);

  const categories = [...new Set(integrations.map(i => i.category))];
  const connectedCount = integrations.filter(i => i.connected).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <Link className="w-8 h-8 mr-3 text-brand-primary" />
            Integrations
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">
            {connectedCount}/{integrations.length} Services Connected
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-brand-elevated border border-brand-border rounded-xl text-sm font-bold uppercase tracking-wider text-brand-text-muted hover:text-brand-text transition-all"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2].map(section => (
            <div key={section}>
              <div className="h-4 w-32 bg-brand-elevated animate-pulse rounded mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-brand-surface border border-brand-border rounded-2xl p-5 animate-pulse space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-brand-elevated rounded w-2/3" />
                      <div className="h-5 bg-brand-elevated rounded-full w-16" />
                    </div>
                    <div className="h-3 bg-brand-elevated rounded w-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-16 text-center border border-brand-border rounded-2xl bg-brand-surface">
          <XCircle className="w-12 h-12 text-brand-danger mx-auto mb-4" />
          <h3 className="text-lg font-bold text-brand-text mb-2">Failed to Load</h3>
          <p className="text-xs text-brand-text-muted font-mono mb-4">{error}</p>
          <button onClick={fetchData} className="px-5 py-2.5 bg-brand-elevated border border-brand-border text-brand-text text-xs font-bold uppercase rounded-xl hover:bg-brand-surface transition-all">
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* System Integrations */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-4 flex items-center gap-2">
              <Plug className="w-4 h-4 text-brand-accent" /> System Integrations
            </h2>
            {integrations.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-brand-border rounded-2xl">
                <p className="text-xs text-brand-text-muted font-mono uppercase">No integration data available</p>
              </div>
            ) : (
              <div className="space-y-6">
                {categories.map(category => (
                  <div key={category}>
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-text-muted mb-3">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {integrations.filter(i => i.category === category).map(integration => (
                        <div key={integration.id} className="bg-brand-surface border border-brand-border rounded-xl p-4 hover:border-brand-primary/30 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-brand-text">{integration.name}</h4>
                            {integration.connected ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-brand-success bg-brand-success/10 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3" /> Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-brand-text-muted bg-brand-elevated px-2 py-0.5 rounded-full">
                                <XCircle className="w-3 h-3" /> Offline
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-brand-text-muted">{integration.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Connectors */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-4 flex items-center gap-2">
              <Server className="w-4 h-4 text-brand-primary" /> System Connectors
            </h2>
            {connectors.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-brand-border rounded-2xl">
                <p className="text-xs text-brand-text-muted font-mono uppercase">No connectors registered</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {connectors.map((name, i) => (
                  <div key={i} className="bg-brand-surface border border-brand-border rounded-xl p-4 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse shrink-0" />
                    <span className="text-xs font-bold text-brand-text capitalize truncate">{name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
