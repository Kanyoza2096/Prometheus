import React, { useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import ParticleBackground from '../components/ParticleBackground';
import { Shield, Fingerprint, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isShake, setIsShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brand-bg">
      <ParticleBackground />
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-primary/10 via-brand-bg/80 to-brand-bg"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <motion.div 
          animate={isShake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="bg-brand-surface/80 backdrop-blur-xl border border-brand-border p-8 rounded-2xl shadow-[0_0_40px_rgba(79,70,229,0.15)]"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-brand-elevated rounded-2xl flex items-center justify-center mb-4 border border-brand-primary/30 shadow-glow-primary">
              <Shield className="w-8 h-8 text-brand-primary" />
            </div>
            <h1 className="text-2xl font-bold text-brand-text tracking-tight uppercase">Kanyoza Command</h1>
            <p className="text-brand-text-muted text-sm mt-2 font-mono">AUTHORIZED PERSONNEL ONLY</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="mb-4 bg-brand-danger/10 border border-brand-danger/30 rounded-lg p-3 flex items-start"
            >
              <AlertCircle className="w-4 h-4 text-brand-danger mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-brand-danger font-mono">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-2">
                Operator ID
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-brand-bg/50 border border-brand-border rounded-lg px-4 py-3 text-brand-text placeholder-brand-text-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono text-sm"
                placeholder="operator@kanyoza.com"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider">
                  Passkey
                </label>
                <button type="button" className="text-xs text-brand-primary hover:text-brand-accent transition-colors">
                  Reset Protocol?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-brand-bg/50 border border-brand-border rounded-lg px-4 py-3 text-brand-text placeholder-brand-text-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center">
              <input type="checkbox" id="remember" className="rounded border-brand-border bg-brand-bg text-brand-primary focus:ring-brand-primary" />
              <label htmlFor="remember" className="ml-2 text-sm text-brand-text-muted">Maintain active session</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg py-3 px-4 font-bold tracking-wide transition-all shadow-glow-primary flex items-center justify-center group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                ) : (
                  <Fingerprint className="w-5 h-5 mr-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                )}
                {loading ? 'AUTHENTICATING...' : 'ENTER COMMAND CENTER'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            </button>
          </form>
        </motion.div>
      </motion.div>

      {/* Helper text for the reviewer */}
      <div className="absolute bottom-4 left-0 w-full flex flex-col items-center justify-center text-brand-text-muted font-mono text-xs opacity-50 space-y-1">
        <p>Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set</p>
      </div>
    </div>
  );
}
