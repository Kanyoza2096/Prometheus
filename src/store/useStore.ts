import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { supabase, isSupabaseConfigured, refreshSupabaseClient } from '../lib/supabase';

export type ServiceStatus = 'online' | 'degraded' | 'offline';

export interface LiveNotification {
  id: string;
  type: 'alert' | 'post' | 'message' | 'payload';
  title: string;
  subtitle?: string;
  severity?: string;
}

export interface SystemHealth {
  id: string;
  name: string;
  status: ServiceStatus;
  latency: number;
  lastChecked: number;
  uptime: number;
}

export interface LiveMessage {
  id: string;
  user: string;
  avatar: string;
  message: string;
  time: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface GuardianAlert {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  time: number;
}

export interface Post {
  id: string;
  title: string;
  platform: 'facebook' | 'twitter' | 'linkedin';
  time: number;
  engagement: number;
  thumbnail: string;
}

export interface PayloadLog {
  id: string;
  time: string;
  method: string;
  endpoint: string;
  status: number;
  latency: string;
  type: 'inbound' | 'outbound';
  request: any;
  response: any;
}

interface AppState {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  
  wsEndpoint: string;
  restEndpoint: string;
  masterToken: string;
  setConnectionParams: (params: { wsEndpoint?: string; restEndpoint?: string; masterToken?: string }) => void;

  supabaseUrl: string;
  supabaseAnonKey: string;
  geminiKey: string;
  githubToken: string;
  githubRepo: string;
  githubBranch: string;
  fbPageId: string;
  fbVerifyToken: string;
  fbPageAccessToken: string;
  fbAppSecret: string;
  isUsingLiveBackendData: boolean;
  setServiceKeys: (keys: { supabaseUrl?: string; supabaseAnonKey?: string; geminiKey?: string; githubToken?: string; githubRepo?: string; githubBranch?: string; fbPageId?: string; fbVerifyToken?: string; fbPageAccessToken?: string; fbAppSecret?: string }) => void;

  socket: Socket | null;
  socketConnected: boolean;
  connectSocket: () => void;
  disconnectSocket: () => void;

  messages: LiveMessage[];
  addMessage: (msg: LiveMessage) => void;
  isStreamPaused: boolean;
  setStreamPaused: (paused: boolean) => void;

  healthMatrix: SystemHealth[];
  updateHealth: (health: SystemHealth[]) => void;

  guardianAlerts: GuardianAlert[];
  addAlert: (alert: GuardianAlert) => void;

  recentPosts: Post[];
  addPost: (post: Post) => void;

  payloads: PayloadLog[];
  addPayload: (payload: PayloadLog) => void;

  lastNotification: LiveNotification | null;
  dismissNotification: () => void;

  stats: {
    messagesToday: number;
    postsPublished: number;
    activeUsers: number;
    apiCalls: number;
    guardianIssues: number;
    revenueMonthly: number;
  };
  updateStats: (partial: Partial<AppState['stats']>) => void;

  isTerminalOpen: boolean;
  toggleTerminal: () => void;
  pendingCommand: string | null;
  setPendingCommand: (cmd: string | null) => void;

  personaMood: 'analytical' | 'professional' | 'creative' | 'urgent';
  setPersonaMood: (mood: AppState['personaMood']) => void;

  latencyHistory: number[];
  pushLatency: (ms: number) => void;

  fetchInitialData: () => Promise<void>;

  backendConfig: Record<string, any> | null;
  realtimeChannel: any;
  pollingTimer: ReturnType<typeof setInterval> | null;
  startRealtimeSubscriptions: () => void;
  stopRealtimeSubscriptions: () => void;
}

const INITIAL_HEALTH: SystemHealth[] = [
  { id: 'gemini', name: 'Gemini AI', status: 'online', latency: 45, lastChecked: Date.now(), uptime: 99.99 },
  { id: 'fb', name: 'Facebook API', status: 'online', latency: 120, lastChecked: Date.now(), uptime: 99.95 },
  { id: 'supa', name: 'Supabase', status: 'online', latency: 15, lastChecked: Date.now(), uptime: 100 },
  { id: 'mwk', name: 'MWK Converter', status: 'degraded', latency: 850, lastChecked: Date.now(), uptime: 98.5 },
  { id: 'play', name: 'Playwright', status: 'online', latency: 320, lastChecked: Date.now(), uptime: 99.1 },
  { id: 'guard', name: 'Code Guardian', status: 'online', latency: 85, lastChecked: Date.now(), uptime: 100 },
];

export const useStore = create<AppState>((set, get) => ({
  isAuthenticated: false, // Set to true to skip login during dev if needed
  login: () => set({ isAuthenticated: true }),
  logout: () => {
    get().disconnectSocket();
    get().stopRealtimeSubscriptions();
    set({ isAuthenticated: false });
  },

  wsEndpoint: localStorage.getItem('ws_endpoint') || import.meta.env.VITE_WS_ENDPOINT || 'wss://kanyoza-systems-bot.onrender.com',
  restEndpoint: localStorage.getItem('rest_endpoint') || import.meta.env.VITE_REST_ENDPOINT || 'https://kanyoza-systems-bot.onrender.com/api/v1',
  masterToken: localStorage.getItem('master_token') || import.meta.env.VITE_MASTER_TOKEN || 'sk_live_default_token',
  setConnectionParams: (params) => {
    // Capture the previous endpoint BEFORE updating state so the comparison is valid
    const previousWsEndpoint = get().wsEndpoint;

    if (params.wsEndpoint !== undefined) localStorage.setItem('ws_endpoint', params.wsEndpoint);
    if (params.restEndpoint !== undefined) localStorage.setItem('rest_endpoint', params.restEndpoint);
    if (params.masterToken !== undefined) localStorage.setItem('master_token', params.masterToken);

    set((state) => ({ ...state, ...params }));

    // Reconnect socket only when the WebSocket URL actually changed
    if (params.wsEndpoint && params.wsEndpoint !== previousWsEndpoint) {
      get().disconnectSocket();
      get().connectSocket();
    }
  },

  supabaseUrl: localStorage.getItem('supabase_url') || import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: localStorage.getItem('supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  geminiKey: localStorage.getItem('gemini_key') || '',
  githubToken: localStorage.getItem('github_token') || '',
  githubRepo: localStorage.getItem('github_repo') || '',
  githubBranch: localStorage.getItem('github_branch') || 'main',
  fbPageId: localStorage.getItem('fb_page_id') || '',
  fbVerifyToken: localStorage.getItem('fb_verify_token') || '',
  fbPageAccessToken: localStorage.getItem('fb_page_access_token') || '',
  fbAppSecret: localStorage.getItem('fb_app_secret') || '',
  isUsingLiveBackendData: false,
  setServiceKeys: (keys) => {
    if (keys.supabaseUrl !== undefined) localStorage.setItem('supabase_url', keys.supabaseUrl);
    if (keys.supabaseAnonKey !== undefined) localStorage.setItem('supabase_anon_key', keys.supabaseAnonKey);
    if (keys.geminiKey !== undefined) localStorage.setItem('gemini_key', keys.geminiKey);
    if (keys.githubToken !== undefined) localStorage.setItem('github_token', keys.githubToken);
    if (keys.githubRepo !== undefined) localStorage.setItem('github_repo', keys.githubRepo);
    if (keys.githubBranch !== undefined) localStorage.setItem('github_branch', keys.githubBranch);
    if (keys.fbPageId !== undefined) localStorage.setItem('fb_page_id', keys.fbPageId);
    if (keys.fbVerifyToken !== undefined) localStorage.setItem('fb_verify_token', keys.fbVerifyToken);
    if (keys.fbPageAccessToken !== undefined) localStorage.setItem('fb_page_access_token', keys.fbPageAccessToken);
    if (keys.fbAppSecret !== undefined) localStorage.setItem('fb_app_secret', keys.fbAppSecret);

    set((state) => ({ ...state, ...keys }));
    refreshSupabaseClient();
    get().fetchInitialData();
  },

  socket: null,
  socketConnected: false,
  connectSocket: () => {
    if (get().socket) return;
    
    // Connect to backend with auth token.
    // Token is passed only in the auth payload (server-side handshake), NOT in query params
    // which would expose it in URLs, server logs, and infrastructure observability tooling.
    // Connect to the /dashboard namespace registered on the backend.
    // Use polling first so the connection works even when gunicorn runs
    // a sync worker (sync workers cannot upgrade HTTP→WebSocket).
    // Socket.IO will automatically upgrade to WebSocket once the
    // eventlet/gevent worker is in place on the backend.
    const base = get().wsEndpoint.replace(/\/+$/, '');
    const socket = io(`${base}/dashboard`, {
      transports: ['polling', 'websocket'],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      auth: {
        token: get().masterToken
      }
    });

    socket.on('connect', () => set({ socketConnected: true }));
    socket.on('disconnect', () => set({ socketConnected: false }));
    
    socket.on('new_message', (msg: LiveMessage) => {
      if (!get().isStreamPaused) {
        get().addMessage(msg);
      }
      set(state => ({ stats: { ...state.stats, messagesToday: state.stats.messagesToday + 1 } }));
    });

    socket.on('post_published', (post: Post) => {
      get().addPost(post);
      set(state => ({ stats: { ...state.stats, postsPublished: state.stats.postsPublished + 1 } }));
    });

    socket.on('api_call', (data?: any) => {
       set(state => ({ stats: { ...state.stats, apiCalls: state.stats.apiCalls + 1 } }));
       if (data && typeof data === 'object') {
         get().addPayload({
           id: data.id || `req_${Math.floor(Math.random() * 900000 + 100000)}`,
           time: data.time || new Date().toLocaleTimeString(),
           method: data.method || 'POST',
           endpoint: data.endpoint || '/api/v1/webhook',
           status: data.status || 200,
           latency: data.latency || `${Math.floor(Math.random() * 200 + 50)}ms`,
           type: data.type || 'inbound',
           request: data.request || {},
           response: data.response || {}
         });
       }
    });

    socket.on('payload', (data?: any) => {
       if (data && typeof data === 'object') {
         get().addPayload(data);
       }
    });

    socket.on('traffic', (data?: any) => {
       if (data && typeof data === 'object') {
         get().addPayload(data);
       }
    });

    socket.on('service_status', (healthUpdates: SystemHealth[]) => {
      get().updateHealth(healthUpdates);
    });

    socket.on('scan_complete', (alert: GuardianAlert) => {
      get().addAlert(alert);
      set(state => ({ stats: { ...state.stats, guardianIssues: state.stats.guardianIssues + 1 } }));
    });

    set({ socket });
  },
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, socketConnected: false });
    }
  },

  messages: [
    { id: 'm1', user: 'Operator_01', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', message: 'Core neural pipeline initialized with vector 0x09', time: Date.now() - 120000, sentiment: 'positive' },
    { id: 'm2', user: 'Guardian_Bot', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', message: 'Security scan completed: 0 active threats detected in perimeter', time: Date.now() - 340000, sentiment: 'positive' },
    { id: 'm3', user: 'System_Relay', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', message: 'API rate limits nominal across all active gateway nodes', time: Date.now() - 600000, sentiment: 'neutral' }
  ],
  addMessage: (msg) => set(state => ({ 
    messages: [msg, ...state.messages].slice(0, 20) 
  })),
  isStreamPaused: false,
  setStreamPaused: (paused) => set({ isStreamPaused: paused }),

  healthMatrix: INITIAL_HEALTH,
  updateHealth: (updates) => set(state => {
    const newHealth = [...state.healthMatrix];
    updates.forEach(u => {
      const idx = newHealth.findIndex(h => h.id === u.id);
      if (idx !== -1) newHealth[idx] = { ...newHealth[idx], ...u };
    });
    return { healthMatrix: newHealth };
  }),

  guardianAlerts: [
    { id: '1', severity: 'HIGH', title: 'Unauthorized API Access Attempt', time: Date.now() - 3600000 },
    { id: '2', severity: 'MEDIUM', title: 'MWK Converter Latency Spike', time: Date.now() - 7200000 },
  ],
  addAlert: (alert) => set(state => ({
    guardianAlerts: [alert, ...state.guardianAlerts].slice(0, 50),
    lastNotification: {
      id:       `n_${Date.now()}`,
      type:     'alert',
      title:    alert.title,
      subtitle: alert.severity,
      severity: alert.severity,
    },
  })),

  recentPosts: [
    { id: 'p1', title: 'AI Automation Trends 2026', platform: 'linkedin', time: Date.now() - 1000 * 60 * 30, engagement: 245, thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=150&q=80' },
    { id: 'p2', title: 'Malawi Tech Ecosystem Report', platform: 'twitter', time: Date.now() - 1000 * 60 * 120, engagement: 1042, thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=150&q=80' },
    { id: 'p3', title: 'New Command Center Launch', platform: 'facebook', time: Date.now() - 1000 * 60 * 60 * 5, engagement: 856, thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=150&q=80' }
  ],
  addPost: (post) => set(state => ({
    recentPosts: [post, ...state.recentPosts].slice(0, 20),
    lastNotification: {
      id:       `n_${Date.now()}`,
      type:     'post',
      title:    post.title,
      subtitle: post.platform,
    },
  })),

  payloads: [
    {
      id: 'req_109283',
      time: new Date(Date.now() - 30000).toLocaleTimeString(),
      method: 'POST',
      endpoint: 'graph.facebook.com/v19.0/me/messages',
      status: 200,
      latency: '145ms',
      type: 'outbound',
      request: {
        messaging_type: "RESPONSE",
        recipient: { id: "84759284759" },
        message: { text: "We have received your query regarding the enterprise plan. A representative will connect shortly." }
      },
      response: {
        recipient_id: "84759284759",
        message_id: "m_029384092834"
      }
    },
    {
      id: 'req_109284',
      time: new Date(Date.now() - 60000).toLocaleTimeString(),
      method: 'POST',
      endpoint: 'generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
      status: 200,
      latency: '1.2s',
      type: 'outbound',
      request: {
        contents: [{ role: "user", parts: [{ text: "Extract sentiment and intent from: 'I need to upgrade my plan immediately, the current limits are blocking my team.'" }] }],
        generationConfig: { temperature: 0.2 }
      },
      response: {
        candidates: [{
          content: { parts: [{ text: "{\n  \"sentiment\": \"urgent_positive\",\n  \"intent\": \"upgrade_subscription\"\n}" }] }
        }]
      }
    },
    {
      id: 'req_109285',
      time: new Date(Date.now() - 120000).toLocaleTimeString(),
      method: 'POST',
      endpoint: '/api/v1/webhook/facebook',
      status: 400,
      latency: '45ms',
      type: 'inbound',
      request: {
        object: "page",
        entry: [{
          id: "10493819203",
          time: 1718293840,
          messaging: [{
            sender: { id: "UNKNOWN_MALFORMED" }
          }]
        }]
      },
      response: {
        error: "Malformed payload structure in messaging array."
      }
    }
  ],
  addPayload: (payload) => set(state => ({
    payloads: [payload, ...state.payloads].slice(0, 50)
  })),

  lastNotification: null,
  dismissNotification: () => set({ lastNotification: null }),

  stats: {
    messagesToday: 14052,
    postsPublished: 124,
    activeUsers: 843,
    apiCalls: 1045920,
    guardianIssues: 2,
    revenueMonthly: 45250,
  },
  updateStats: (partial) => set(state => ({ stats: { ...state.stats, ...partial } })),

  isTerminalOpen: false,
  toggleTerminal: () => set(state => ({ isTerminalOpen: !state.isTerminalOpen })),
  pendingCommand: null,
  setPendingCommand: (cmd) => set({ pendingCommand: cmd }),

  personaMood: (localStorage.getItem('persona_mood') as AppState['personaMood']) || 'analytical',
  setPersonaMood: (mood) => {
    localStorage.setItem('persona_mood', mood);
    set({ personaMood: mood });
  },

  latencyHistory: [],
  pushLatency: (ms) => set(state => ({
    latencyHistory: [...state.latencyHistory.slice(-59), ms],
  })),

  fetchInitialData: async () => {
    const { restEndpoint, masterToken } = get();
    let loadedLive = false;

    // 1. Try querying Supabase if configured with real credentials
    if (isSupabaseConfigured()) {
      try {
        const { data: supaMsgs } = await supabase.from('messages').select('*').limit(20);
        if (supaMsgs && supaMsgs.length > 0) {
          set({ messages: supaMsgs });
          loadedLive = true;
        }

        const { data: supaPosts } = await supabase.from('posts').select('*').limit(20);
        if (supaPosts && supaPosts.length > 0) {
          set({ recentPosts: supaPosts });
          loadedLive = true;
        }

        const { data: supaAlerts } = await supabase.from('alerts').select('*').limit(20);
        if (supaAlerts && supaAlerts.length > 0) {
          set({ guardianAlerts: supaAlerts });
          loadedLive = true;
        }

        const { data: supaPayloads } = await supabase.from('payloads').select('*').limit(20);
        if (supaPayloads && supaPayloads.length > 0) {
          set({ payloads: supaPayloads });
          loadedLive = true;
        }
      } catch (err) {
        console.warn('Supabase query error:', err);
      }
    }

    // 2. Try fetching from custom REST API
    if (restEndpoint) {
      try {
        const baseUrl = restEndpoint.endsWith('/') ? restEndpoint.slice(0, -1) : restEndpoint;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (masterToken) {
          headers['Authorization'] = `Bearer ${masterToken}`;
          headers['X-API-Token'] = masterToken;
          headers['x-api-key'] = masterToken;
        }

        // Try fetching live stats from real endpoint
        const statsRes = await fetch(`${baseUrl}/dashboard/live`, { headers }).catch(() => null);
        if (statsRes && statsRes.ok) {
          const d = await statsRes.json();
          if (d) {
            get().updateStats({
              messagesToday:  d.messages_today   ?? 0,
              postsPublished: d.posts_published  ?? 0,
              activeUsers:    d.active_users      ?? 0,
              apiCalls:       d.api_calls_today   ?? 0,
              guardianIssues: d.guardian_issues   ?? 0,
            });
            loadedLive = true;
          }
        }

        // Try fetching messages
        const msgsRes = await fetch(`${baseUrl}/messages`, { headers }).catch(() => null);
        if (msgsRes && msgsRes.ok) {
          const msgsData = await msgsRes.json();
          if (Array.isArray(msgsData) && msgsData.length > 0) {
            set({ messages: msgsData });
            loadedLive = true;
          }
        }

        // Try fetching posts
        const postsRes = await fetch(`${baseUrl}/posts`, { headers }).catch(() => null);
        if (postsRes && postsRes.ok) {
          const postsData = await postsRes.json();
          if (Array.isArray(postsData) && postsData.length > 0) {
            set({ recentPosts: postsData });
            loadedLive = true;
          }
        }

        // Try fetching alerts
        const alertsRes = await fetch(`${baseUrl}/alerts`, { headers }).catch(() => null);
        if (alertsRes && alertsRes.ok) {
          const alertsData = await alertsRes.json();
          if (Array.isArray(alertsData) && alertsData.length > 0) {
            set({ guardianAlerts: alertsData });
            loadedLive = true;
          }
        }

        // Try fetching health matrix from /health/deep (returns object, not array)
        const healthRes = await fetch(`${baseUrl}/health/deep`, { headers }).catch(() => null);
        if (healthRes && healthRes.ok) {
          const healthData = await healthRes.json();
          if (healthData?.services && typeof healthData.services === 'object') {
            const matrix: SystemHealth[] = Object.entries(healthData.services).map(([name, svc]: [string, any]) => ({
              id:           name,
              name:         svc.page_name || name.charAt(0).toUpperCase() + name.slice(1),
              status:       svc.status === 'ok' ? 'online' : svc.status === 'degraded' ? 'degraded' : 'offline',
              latency:      svc.latency_ms ?? 0,
              lastChecked:  Date.now(),
              uptime:       svc.status === 'ok' ? 99.9 : svc.status === 'degraded' ? 85.0 : 0,
            }));
            set({ healthMatrix: matrix });
            loadedLive = true;
          }
        }

        // Try fetching payloads/logs/traffic from backend API
        const payloadsRes = await fetch(`${baseUrl}/payloads`, { headers }).catch(() => null);
        if (payloadsRes && payloadsRes.ok) {
          const payloadsData = await payloadsRes.json();
          if (Array.isArray(payloadsData) && payloadsData.length > 0) {
            set({ payloads: payloadsData });
            loadedLive = true;
          }
        } else {
          const logsRes = await fetch(`${baseUrl}/logs`, { headers }).catch(() => null);
          if (logsRes && logsRes.ok) {
            const logsData = await logsRes.json();
            if (Array.isArray(logsData) && logsData.length > 0) {
              set({ payloads: logsData });
              loadedLive = true;
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch initial data from backend:', err);
      }
    }

    set({ isUsingLiveBackendData: loadedLive });
  },

  backendConfig: null,
  realtimeChannel: null,
  pollingTimer: null,

  startRealtimeSubscriptions: () => {
    get().stopRealtimeSubscriptions();

    const { restEndpoint, masterToken } = get();
    const base = restEndpoint.replace(/\/+$/, '');
    const headers: Record<string, string> = masterToken
      ? { Authorization: `Bearer ${masterToken}` }
      : {};

    // Fetch backend config immediately on startup
    fetch(`${base}/api/v1/status`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) set({ backendConfig: data }); })
      .catch(() => {});

    // Poll stats + health every 30 s
    const timer = setInterval(async () => {
      try {
        const [sr, hr] = await Promise.allSettled([
          fetch(`${base}/api/v1/dashboard/live`, { headers }),
          fetch(`${base}/api/v1/health/deep`,    { headers }),
        ]);
        if (sr.status === 'fulfilled' && sr.value.ok) {
          const d = await sr.value.json();
          get().updateStats({
            messagesToday:  d.messages_today  ?? get().stats.messagesToday,
            postsPublished: d.posts_published ?? get().stats.postsPublished,
            activeUsers:    d.active_users    ?? get().stats.activeUsers,
            apiCalls:       d.api_calls_today ?? get().stats.apiCalls,
            guardianIssues: d.guardian_issues ?? get().stats.guardianIssues,
          });
          set({ isUsingLiveBackendData: true });
        }
        if (hr.status === 'fulfilled' && hr.value.ok) {
          const hd = await hr.value.json();
          if (hd?.services && typeof hd.services === 'object') {
            const matrix: SystemHealth[] = Object.entries(hd.services).map(([name, svc]: [string, any]) => ({
              id:          name,
              name:        svc.page_name || name.charAt(0).toUpperCase() + name.slice(1),
              status:      svc.status === 'ok' ? 'online' : svc.status === 'degraded' ? 'degraded' : 'offline',
              latency:     svc.latency_ms ?? 0,
              lastChecked: Date.now(),
              uptime:      svc.status === 'ok' ? 99.9 : svc.status === 'degraded' ? 85.0 : 0,
            }));
            set({ healthMatrix: matrix });
          }
        }
      } catch { /* ignore */ }
    }, 30_000);

    set({ pollingTimer: timer });

    // Supabase real-time subscriptions (if Supabase is configured)
    if (!isSupabaseConfigured()) return;

    const channel = supabase
      .channel('kanyoza-live-v2')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, ({ new: row }: any) => {
        if (!get().isStreamPaused) {
          get().addMessage({
            id:        String(row.id    || `msg_${Date.now()}`),
            user:      row.sender_id   || row.user     || 'Facebook User',
            avatar:    row.avatar      || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.sender_id || 'User')}&background=4F46E5&color=fff`,
            message:   row.content     || row.text     || row.message || '',
            time:      new Date(row.created_at || Date.now()).getTime(),
            sentiment: row.sentiment   || 'neutral',
          });
        }
        set(s => ({ stats: { ...s.stats, messagesToday: s.stats.messagesToday + 1 } }));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, ({ new: row }: any) => {
        get().addPost({
          id:         String(row.id         || `p_${Date.now()}`),
          title:      row.title      || row.content || 'New Post',
          platform:   row.platform   || 'facebook',
          time:       new Date(row.created_at || Date.now()).getTime(),
          engagement: row.engagement || 0,
          thumbnail:  row.thumbnail  || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=150&q=80',
        });
        set(s => ({ stats: { ...s.stats, postsPublished: s.stats.postsPublished + 1 } }));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, ({ new: row }: any) => {
        get().addAlert({
          id:       String(row.id       || `a_${Date.now()}`),
          severity: row.severity || 'MEDIUM',
          title:    row.title    || row.message || 'Security Alert',
          time:     new Date(row.created_at || Date.now()).getTime(),
        });
        set(s => ({ stats: { ...s.stats, guardianIssues: s.stats.guardianIssues + 1 } }));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payloads' }, ({ new: row }: any) => {
        get().addPayload({
          id:       String(row.id       || `req_${Date.now()}`),
          time:     new Date(row.created_at || Date.now()).toLocaleTimeString(),
          method:   row.method   || 'POST',
          endpoint: row.endpoint || '/api/v1/webhook',
          status:   row.status   || 200,
          latency:  row.latency  || '100ms',
          type:     row.type     || 'inbound',
          request:  row.request  || {},
          response: row.response || {},
        });
      })
      .subscribe();

    set({ realtimeChannel: channel });
  },

  stopRealtimeSubscriptions: () => {
    const { realtimeChannel, pollingTimer } = get();
    if (pollingTimer) { clearInterval(pollingTimer); set({ pollingTimer: null }); }
    if (realtimeChannel) { supabase.removeChannel(realtimeChannel); set({ realtimeChannel: null }); }
  },

}));
