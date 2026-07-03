import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Posts from './pages/Posts';
import ApiAnalytics from './pages/ApiAnalytics';
import Guardian from './pages/Guardian';
import Settings from './pages/Settings';
import AIEngine from './pages/AIEngine';
import PayloadInspector from './pages/PayloadInspector';
import Workflows from './pages/Workflows';
import PrometheusMetrics from './pages/PrometheusMetrics';

export default function App() {
  const isAuthenticated = useStore(state => state.isAuthenticated);
  const login = useStore(state => state.login);
  const logout = useStore(state => state.logout);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        login();
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        login();
      } else {
        logout();
      }
    });

    return () => subscription.unsubscribe();
  }, [login, logout]);

  return (
    <BrowserRouter>
      <Routes>
        {!isAuthenticated ? (
          <Route path="*" element={<Login />} />
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="posts" element={<Posts />} />
            <Route path="workflows" element={<Workflows />} />
            <Route path="engine" element={<AIEngine />} />
            <Route path="payloads" element={<PayloadInspector />} />
            <Route path="api" element={<ApiAnalytics />} />
            <Route path="prometheus" element={<PrometheusMetrics />} />
            <Route path="guardian" element={<Guardian />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}
