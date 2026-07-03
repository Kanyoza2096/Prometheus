import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Bell, Palette, HardDrive, Terminal, Key, Database, Globe, Check, X, Shield, Sliders, Download, Trash2, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'general' | 'credentials'>('credentials');
  const { 
    wsEndpoint, 
    restEndpoint, 
    masterToken, 
    setConnectionParams,
    geminiKey,
    fbPageId,
    fbVerifyToken,
    fbPageAccessToken,
    fbAppSecret,
    setServiceKeys
  } = useStore();
  
  const [localWs, setLocalWs] = useState(wsEndpoint);
  const [localRest, setLocalRest] = useState(restEndpoint);
  const [localToken, setLocalToken] = useState(masterToken);
  const [isSaved, setIsSaved] = useState(false);

  const [localGemini, setLocalGemini] = useState(geminiKey);
  const [localFbPageId, setLocalFbPageId] = useState(fbPageId);
  const [localFbVerify, setLocalFbVerify] = useState(fbVerifyToken);
  const [localFbAccess, setLocalFbAccess] = useState(fbPageAccessToken);
  const [localFbSecret, setLocalFbSecret] = useState(fbAppSecret);
  const [isKeysSaved, setIsKeysSaved] = useState(false);

  // Modal states
  const [activeModal, setActiveModal] = useState<'profile' | 'alerts' | 'theme' | 'retention' | 'logs' | null>(null);

  // Profile data state
  const [profileName, setProfileName] = useState('Admin Alpha');
  const [profileClearance, setProfileClearance] = useState('5');
  const [profileDutyCode, setProfileDutyCode] = useState('ALPHA-9');
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  // Alerts routing state
  const [webhookUrl, setWebhookUrl] = useState('https://api.kanyoza.com/v1/alerts');
  const [slackWebhook, setSlackWebhook] = useState('https://hooks.slack.com/services/T000/B000/XXXX');
  const [severityThreshold, setSeverityThreshold] = useState('CRITICAL');
  const [smsRecipient, setSmsRecipient] = useState('+1 (555) 902-3841');
  const [isAlertsSaved, setIsAlertsSaved] = useState(false);

  // Theme presets
  const [themePreset, setThemePreset] = useState('dark');
  const [accentLevel, setAccentLevel] = useState(80);
  const [fontPref, setFontPref] = useState('sans');
  const [isThemeSaved, setIsThemeSaved] = useState(false);

  // Retention state
  const [retentionDays, setRetentionDays] = useState('30');
  const [isCachePurged, setIsCachePurged] = useState(false);
  const [isLogsExported, setIsLogsExported] = useState(false);

  const saveProfile = () => {
    setIsProfileSaved(true);
    setTimeout(() => {
      setIsProfileSaved(false);
      setActiveModal(null);
    }, 1000);
  };

  const saveAlerts = () => {
    setIsAlertsSaved(true);
    setTimeout(() => {
      setIsAlertsSaved(false);
      setActiveModal(null);
    }, 1000);
  };

  const saveTheme = () => {
    setIsThemeSaved(true);
    setTimeout(() => {
      setIsThemeSaved(false);
      setActiveModal(null);
    }, 1000);
  };

  const handlePurgeCache = () => {
    setIsCachePurged(true);
    setTimeout(() => setIsCachePurged(false), 1500);
  };

  const handleExportLogs = () => {
    setIsLogsExported(true);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      operator: { name: profileName, clearance: profileClearance, dutyCode: profileDutyCode },
      routing: { webhookUrl, slackWebhook, severityThreshold, smsRecipient },
      theme: { themePreset, accentLevel, fontPref },
      retentionDays,
      timestamp: new Date().toISOString()
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `kanyoza_system_config_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setTimeout(() => setIsLogsExported(false), 1500);
  };

  const handleSaveParams = () => {
    setConnectionParams({
      wsEndpoint: localWs,
      restEndpoint: localRest,
      masterToken: localToken
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSaveKeys = () => {
    setServiceKeys({
      geminiKey: localGemini,
      fbPageId: localFbPageId,
      fbVerifyToken: localFbVerify,
      fbPageAccessToken: localFbAccess,
      fbAppSecret: localFbSecret
    });
    setIsKeysSaved(true);
    setTimeout(() => setIsKeysSaved(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto pb-24 md:pb-0"
    >
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">System Config</h1>
        <p className="text-brand-text-muted text-sm font-mono mt-1">PREFERENCES & CREDENTIALS</p>
      </div>

      <div className="flex space-x-4 mb-6 border-b border-brand-border">
        <button
          onClick={() => setActiveTab('credentials')}
          className={cn(
            "pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative",
            activeTab === 'credentials' ? "text-brand-primary" : "text-brand-text-muted hover:text-brand-text"
          )}
        >
          Engine Credentials
          {activeTab === 'credentials' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={cn(
            "pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative",
            activeTab === 'general' ? "text-brand-primary" : "text-brand-text-muted hover:text-brand-text"
          )}
        >
          General Settings
          {activeTab === 'general' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />
          )}
        </button>
      </div>

      {activeTab === 'credentials' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-6">
              <Database className="w-4 h-4 mr-2 text-brand-accent" />
              Backend Engine Connection
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-2">
                  WebSocket Endpoint URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="w-4 h-4 text-brand-text-muted" />
                  </div>
                  <input
                    type="text"
                    value={localWs}
                    onChange={(e) => setLocalWs(e.target.value)}
                    className="w-full bg-brand-bg/50 border border-brand-border rounded-lg pl-10 pr-4 py-3 text-brand-text placeholder-brand-text-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono text-sm"
                    placeholder="wss://api.yourbackend.com/socket"
                  />
                </div>
                <p className="text-[10px] text-brand-text-muted mt-1 font-mono">Real-time telemetry and command streams</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-2">
                  REST API Base URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="w-4 h-4 text-brand-text-muted" />
                  </div>
                  <input
                    type="text"
                    value={localRest}
                    onChange={(e) => setLocalRest(e.target.value)}
                    className="w-full bg-brand-bg/50 border border-brand-border rounded-lg pl-10 pr-4 py-3 text-brand-text placeholder-brand-text-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono text-sm"
                    placeholder="https://api.yourbackend.com/v1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-2 flex justify-between items-center">
                  <span>Master API Token</span>
                  <button 
                    onClick={() => {
                      const token = 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                      setLocalToken(token);
                      const input = document.getElementById('master-token-input') as HTMLInputElement;
                      if (input) {
                        input.type = 'text';
                      }
                    }}
                    className="text-brand-primary hover:text-white transition-colors"
                  >
                    Generate New
                  </button>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="w-4 h-4 text-brand-text-muted" />
                  </div>
                  <input
                    id="master-token-input"
                    type="password"
                    value={localToken}
                    onChange={(e) => setLocalToken(e.target.value)}
                    className="w-full bg-brand-bg/50 border border-brand-border rounded-lg pl-10 pr-4 py-3 text-brand-text placeholder-brand-text-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono text-sm"
                    placeholder="sk_live_..."
                  />
                </div>
                <div className="mt-2 p-2 bg-brand-primary/10 border border-brand-primary/20 rounded text-[10px] text-brand-primary font-mono">
                  💡 INSTRUCTION: Copy this token and set it as <span className="font-bold text-white">MASTER_API_TOKEN</span> in your backend engine's .env file.
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-brand-border flex justify-end">
              <button 
                onClick={handleSaveParams}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all shadow-glow-primary flex items-center",
                  isSaved ? "bg-brand-success text-white" : "bg-brand-primary hover:bg-brand-primary/90 text-white"
                )}
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Saved
                  </>
                ) : (
                  "Save Connection Params"
                )}
              </button>
            </div>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center mb-6">
              <Terminal className="w-4 h-4 mr-2 text-brand-primary" />
              External Service Keys (Backend Env)
            </h2>
            
            <div className="space-y-6">
              <div className="pb-5 border-b border-brand-border">
                <h3 className="text-xs font-bold text-brand-text mb-4 uppercase tracking-wider">AI Engine</h3>
                <div>
                  <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 font-mono">
                    GEMINI_KEY
                  </label>
                  <input
                    type="password"
                    value={localGemini}
                    onChange={(e) => setLocalGemini(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-brand-bg/50 border border-brand-border rounded-lg px-4 py-3 text-brand-text placeholder-brand-text-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-brand-text mb-4 uppercase tracking-wider">Facebook Integration Plugin</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 font-mono">
                      PAGE_ID
                    </label>
                    <input
                      type="text"
                      value={localFbPageId}
                      onChange={(e) => setLocalFbPageId(e.target.value)}
                      placeholder="10493819203..."
                      className="w-full bg-brand-bg/50 border border-brand-border rounded-lg px-4 py-3 text-brand-text placeholder-brand-text-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 font-mono">
                      VERIFY_TOKEN
                    </label>
                    <input
                      type="password"
                      value={localFbVerify}
                      onChange={(e) => setLocalFbVerify(e.target.value)}
                      placeholder="webhook_verify_token..."
                      className="w-full bg-brand-bg/50 border border-brand-border rounded-lg px-4 py-3 text-brand-text placeholder-brand-text-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 font-mono">
                      PAGE_ACCESS_TOKEN
                    </label>
                    <input
                      type="password"
                      value={localFbAccess}
                      onChange={(e) => setLocalFbAccess(e.target.value)}
                      placeholder="EAAGm0PX4ZC..."
                      className="w-full bg-brand-bg/50 border border-brand-border rounded-lg px-4 py-3 text-brand-text placeholder-brand-text-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono text-sm"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 font-mono">
                      APP_SECRET
                    </label>
                    <input
                      type="password"
                      value={localFbSecret}
                      onChange={(e) => setLocalFbSecret(e.target.value)}
                      placeholder="f43a..."
                      className="w-full bg-brand-bg/50 border border-brand-border rounded-lg px-4 py-3 text-brand-text placeholder-brand-text-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-brand-border flex justify-end">
              <button 
                onClick={handleSaveKeys}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all shadow-glow-primary flex items-center",
                  isKeysSaved ? "bg-brand-success text-white" : "bg-brand-primary hover:bg-brand-primary/90 text-white"
                )}
              >
                {isKeysSaved ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Saved Keys
                  </>
                ) : (
                  "Save Service Keys"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'general' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {[
            { id: 'profile', icon: User, title: 'Operator Profile', desc: `Manage access clearance (${profileName})` },
            { id: 'alerts', icon: Bell, title: 'Alert Routing', desc: `Webhook and notifications (${severityThreshold})` },
            { id: 'theme', icon: Palette, title: 'Interface Theme', desc: `Configure appearance settings (${themePreset})` },
            { id: 'retention', icon: HardDrive, title: 'Data Retention', desc: `Manage local storage and exports (${retentionDays}d)` },
            { id: 'logs', icon: Terminal, title: 'System Logs', desc: 'Raw telemetry and debug output console' },
          ].map((section) => (
            <div 
              key={section.id} 
              onClick={() => setActiveModal(section.id as any)}
              className="bg-brand-surface border border-brand-border rounded-xl p-5 flex items-center justify-between group hover:border-brand-primary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-brand-elevated text-brand-text-muted group-hover:text-brand-primary transition-colors">
                  <section.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{section.title}</h3>
                  <p className="text-xs text-brand-text-muted mt-1">{section.desc}</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveModal(section.id as any); }}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-text-muted bg-brand-elevated border border-brand-border rounded-md group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary transition-all cursor-pointer"
              >
                Configure
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {/* Configuration Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            {/* Backdrop Closer */}
            <div className="absolute inset-0 cursor-default" onClick={() => setActiveModal(null)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-brand-surface border border-brand-border rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] relative z-10"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-brand-border bg-brand-elevated/40">
                <div className="flex items-center space-x-3">
                  <span className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                    {activeModal === 'profile' && <User className="w-5 h-5" />}
                    {activeModal === 'alerts' && <Bell className="w-5 h-5" />}
                    {activeModal === 'theme' && <Palette className="w-5 h-5" />}
                    {activeModal === 'retention' && <HardDrive className="w-5 h-5" />}
                    {activeModal === 'logs' && <Terminal className="w-5 h-5" />}
                  </span>
                  <div>
                    <h2 className="font-bold text-sm uppercase tracking-wider text-brand-text">
                      {activeModal === 'profile' && 'Operator Profile'}
                      {activeModal === 'alerts' && 'Alert Routing'}
                      {activeModal === 'theme' && 'Interface Theme'}
                      {activeModal === 'retention' && 'Data Retention'}
                      {activeModal === 'logs' && 'System Telemetry'}
                    </h2>
                    <p className="text-[10px] font-mono text-brand-text-muted uppercase tracking-widest mt-0.5">
                      Configure parameters
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="text-brand-text-muted hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. Profile Modal */}
                {activeModal === 'profile' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 font-mono">
                        Operator Name
                      </label>
                      <input 
                        type="text" 
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-primary transition-all font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 font-mono">
                        Access Clearance level
                      </label>
                      <select 
                        value={profileClearance}
                        onChange={(e) => setProfileClearance(e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-primary transition-all font-mono text-sm"
                      >
                        <option value="1">Level 1 - Public Clearance</option>
                        <option value="2">Level 2 - Operator Clearance</option>
                        <option value="3">Level 3 - Manager Clearance</option>
                        <option value="4">Level 4 - Engineer Clearance</option>
                        <option value="5">Level 5 - Admin Alpha Clearance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 font-mono">
                        Duty Code Designation
                      </label>
                      <input 
                        type="text" 
                        value={profileDutyCode}
                        onChange={(e) => setProfileDutyCode(e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-primary transition-all font-mono text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* 2. Alerts Modal */}
                {activeModal === 'alerts' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 font-mono">
                        Alert Webhook Delivery URL
                      </label>
                      <input 
                        type="text" 
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-primary transition-all font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 font-mono">
                        Slack Integration Webhook
                      </label>
                      <input 
                        type="text" 
                        value={slackWebhook}
                        onChange={(e) => setSlackWebhook(e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-primary transition-all font-mono text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 font-mono">
                          Min Severity
                        </label>
                        <select 
                          value={severityThreshold}
                          onChange={(e) => setSeverityThreshold(e.target.value)}
                          className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-primary transition-all font-mono text-sm"
                        >
                          <option value="INFO">INFO & ABOVE</option>
                          <option value="MEDIUM">MEDIUM & ABOVE</option>
                          <option value="HIGH">HIGH & ABOVE</option>
                          <option value="CRITICAL">CRITICAL ONLY</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 font-mono">
                          SMS recipient
                        </label>
                        <input 
                          type="text" 
                          value={smsRecipient}
                          onChange={(e) => setSmsRecipient(e.target.value)}
                          className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-primary transition-all font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Theme Modal */}
                {activeModal === 'theme' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 font-mono">
                        Command Center Visual Theme
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {['dark', 'cyberpunk', 'ocean', 'brutalist'].map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setThemePreset(p)}
                            className={cn(
                              "p-3 rounded-lg border text-left font-mono text-xs font-bold uppercase transition-all",
                              themePreset === p 
                                ? "bg-brand-primary/10 border-brand-primary text-brand-primary shadow-glow-primary"
                                : "bg-brand-bg border-brand-border text-brand-text-muted hover:border-brand-text-muted"
                            )}
                          >
                            {p === 'dark' && 'Command Dark'}
                            {p === 'cyberpunk' && 'Cyberpunk Gold'}
                            {p === 'ocean' && 'Ocean Pulse'}
                            {p === 'brutalist' && 'Raw Steel'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider font-mono">
                          Accent Glow Intensity
                        </label>
                        <span className="text-xs font-mono font-bold text-brand-accent">{accentLevel}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="10"
                        max="100"
                        value={accentLevel}
                        onChange={(e) => setAccentLevel(Number(e.target.value))}
                        className="w-full h-1 bg-brand-bg border-none rounded-lg appearance-none cursor-pointer accent-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 font-mono">
                        Dashboard Typographic pairing
                      </label>
                      <select 
                        value={fontPref}
                        onChange={(e) => setFontPref(e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-primary transition-all font-mono text-sm"
                      >
                        <option value="sans">Inter Sans + Space Grotesk</option>
                        <option value="mono">JetBrains Mono Full Code</option>
                        <option value="serif">Playfair Serif Editorial</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 4. Retention Modal */}
                {activeModal === 'retention' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 font-mono">
                        Payload Log Retention Period
                      </label>
                      <select 
                        value={retentionDays}
                        onChange={(e) => setRetentionDays(e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-primary transition-all font-mono text-sm"
                      >
                        <option value="7">7 Days - Minimal cache footprint</option>
                        <option value="30">30 Days - Recommended operational cache</option>
                        <option value="90">90 Days - Extended payload tracing</option>
                        <option value="365">1 Year - Enterprise Archive compliance</option>
                      </select>
                    </div>
                    
                    <div className="border border-brand-border rounded-xl p-4 bg-brand-elevated/20 space-y-3">
                      <div className="flex items-center space-x-2 text-brand-warning">
                        <Info className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase font-mono">Cache Action Items</span>
                      </div>
                      <p className="text-xs text-brand-text-muted leading-relaxed font-sans">
                        Data is persisted locally in Secure Local Storage. You can flush these local logs or download a JSON archive of your current configurations below.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <button
                        type="button"
                        onClick={handlePurgeCache}
                        disabled={isCachePurged}
                        className={cn(
                          "flex items-center justify-center space-x-2 px-4 py-3 border rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                          isCachePurged 
                            ? "bg-brand-success/10 border-brand-success/20 text-brand-success" 
                            : "bg-brand-danger/10 border-brand-danger/20 hover:bg-brand-danger/20 text-brand-danger"
                        )}
                      >
                        {isCachePurged ? (
                          <>
                            <Check className="w-4 h-4 animate-bounce" />
                            <span>Purged!</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            <span>Purge Logs</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleExportLogs}
                        disabled={isLogsExported}
                        className={cn(
                          "flex items-center justify-center space-x-2 px-4 py-3 border rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                          isLogsExported 
                            ? "bg-brand-success/10 border-brand-success/20 text-brand-success" 
                            : "bg-brand-primary/10 border-brand-primary/20 hover:bg-brand-primary/20 text-brand-primary"
                        )}
                      >
                        {isLogsExported ? (
                          <>
                            <Check className="w-4 h-4 animate-bounce" />
                            <span>Exported!</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Backup Config</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. Logs Modal */}
                {activeModal === 'logs' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-brand-text-muted">
                      <span>SYSTEM EVENTSTREAM</span>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-success"></span>
                      </span>
                    </div>

                    <div className="bg-[#0A0E17] border border-brand-border rounded-xl p-4 font-mono text-[11px] leading-relaxed text-brand-text-secondary h-64 overflow-y-auto space-y-1.5 custom-scrollbar">
                      <p className="text-brand-text-muted">[{new Date().toLocaleTimeString()}] SYS_INIT: Bootstrapping Secure Client environment...</p>
                      <p className="text-brand-primary">[{new Date().toLocaleTimeString()}] STG_LOAD: Loaded local cached credentials successfully.</p>
                      <p className="text-brand-success">[{new Date().toLocaleTimeString()}] NET_CONN: Successfully established websocket handshakes.</p>
                      <p className="text-brand-accent">[{new Date().toLocaleTimeString()}] MON_PULSE: Latency test completed. Server response in 45ms.</p>
                      <p className="text-brand-text-muted">[{new Date().toLocaleTimeString()}] SYS_READY: Operator clear level initialized at {profileClearance}.</p>
                      <p className="text-[#94A3B8]">[{new Date().toLocaleTimeString()}] STATS_PUB: Tracking total metrics for active systems.</p>
                      <p className="text-brand-warning">[{new Date().toLocaleTimeString()}] WARN_RATE: High-traffic threshold warning ignored.</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-brand-border bg-brand-elevated/20 flex justify-end space-x-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-brand-bg hover:bg-brand-elevated border border-brand-border text-xs font-bold uppercase tracking-wider text-brand-text-muted hover:text-white rounded-lg transition-all cursor-pointer font-mono"
                >
                  {activeModal === 'logs' ? 'Dismiss' : 'Cancel'}
                </button>
                {activeModal !== 'logs' && activeModal !== 'retention' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeModal === 'profile') saveProfile();
                      if (activeModal === 'alerts') saveAlerts();
                      if (activeModal === 'theme') saveTheme();
                    }}
                    className="px-5 py-2 bg-brand-primary hover:bg-brand-primary/90 text-xs font-bold uppercase tracking-wider text-white rounded-lg transition-all shadow-glow-primary flex items-center cursor-pointer font-mono"
                  >
                    {activeModal === 'profile' && isProfileSaved && <Check className="w-4 h-4 mr-1.5 text-brand-success" />}
                    {activeModal === 'alerts' && isAlertsSaved && <Check className="w-4 h-4 mr-1.5 text-brand-success" />}
                    {activeModal === 'theme' && isThemeSaved && <Check className="w-4 h-4 mr-1.5 text-brand-success" />}
                    
                    {activeModal === 'profile' && (isProfileSaved ? 'Updating...' : 'Save Profile')}
                    {activeModal === 'alerts' && (isAlertsSaved ? 'Saving...' : 'Save Routing')}
                    {activeModal === 'theme' && (isThemeSaved ? 'Applying...' : 'Apply Theme')}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
