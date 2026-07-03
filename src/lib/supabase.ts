import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const getSupabaseUrl = () => 
  localStorage.getItem('supabase_url') || import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';

export const getSupabaseKey = () => 
  localStorage.getItem('supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const isSupabaseConfigured = () => {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  return !!url && url !== 'https://placeholder-url.supabase.co' && !url.includes('placeholder') && !!key && key !== 'placeholder-key';
};

let currentClient: SupabaseClient = createClient(getSupabaseUrl(), getSupabaseKey());

export const refreshSupabaseClient = () => {
  currentClient = createClient(getSupabaseUrl(), getSupabaseKey());
  return currentClient;
};

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = currentClient as any;
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});

