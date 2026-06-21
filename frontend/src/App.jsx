import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import PatientView from './components/PatientView';
import ReceptionistView from './components/ReceptionistView';
import DashboardView from './components/DashboardView';
import HomeView from './components/HomeView';
import LoginView from './components/LoginView';
import AIChatWidget from './components/AIChatWidget';
import { Activity, Moon, Sun, BarChart2 } from 'lucide-react';

function ChatWidgetWrapper({ queueState }) {
  const location = useLocation();
  const showWidget = location.pathname === '/' || location.pathname === '/queue';
  if (!showWidget) return null;
  return <AIChatWidget queueState={queueState} />;
}
function App() {
  const [queueState, setQueueState] = useState({
    activeToken: null,
    waitingTokens: [],
    avgConsultationTime: 5,
    baselineConsultationTime: 5,
    doctorStatus: 'AVAILABLE',
    statusMessage: ''
  });

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchState = async () => {
    try {
      const { data: tokensData } = await supabase.from('tokens').select('*');
      const { data: settingsData } = await supabase.from('settings').select('*');
      
      const settings = settingsData?.find(s => s.key === 'global') || {
        baseline_consultation_time: 5,
        doctor_status: 'AVAILABLE',
        status_message: ''
      };

      const tokens = tokensData || [];
      const activeToken = tokens.find(t => t.status === 'ACTIVE') || null;
      const waitingTokens = tokens.filter(t => t.status === 'WAITING').sort((a, b) => {
        if (a.is_emergency !== b.is_emergency) return b.is_emergency ? 1 : -1;
        return a.token_number - b.token_number;
      });

      const completedTokens = tokens.filter(t => t.status === 'COMPLETED').sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at)).slice(0, 10);
      let avgConsultationMs = settings.baseline_consultation_time * 60 * 1000;
      
      if (completedTokens.length > 0) {
        let totalTime = 0;
        let count = 0;
        for (const token of completedTokens) {
          if (token.called_at && token.completed_at) {
            totalTime += (new Date(token.completed_at) - new Date(token.called_at));
            count++;
          }
        }
        if (count > 0) avgConsultationMs = totalTime / count;
      }

      setQueueState({
        activeToken,
        waitingTokens,
        avgConsultationTime: Math.max(1, Math.round(avgConsultationMs / 60000)),
        baselineConsultationTime: settings.baseline_consultation_time,
        doctorStatus: settings.doctor_status,
        statusMessage: settings.status_message
      });
    } catch (err) {
      console.error("Error fetching state:", err);
    }
  };

  useEffect(() => {
    fetchState();

    const channel = supabase.channel('public-db')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tokens' }, () => {
        fetchState();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
        fetchState();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Router>
      <div className="app-wrapper">
        <nav className="navbar">
          <div className="brand">
            <Activity color="var(--primary-color)" />
            ClinicQ
          </div>
          <div className="links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
            <Link to="/queue" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>Live Queue</Link>
            <Link to={isAuthenticated ? "/receptionist/dashboard" : "/receptionist"} style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>Receptionist</Link>
            {isAuthenticated && (
              <Link to="/dashboard" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <BarChart2 size={18} /> Analytics
              </Link>
            )}
            <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex', color: 'var(--text-main)' }}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/queue" element={<PatientView state={queueState} />} />
          <Route path="/receptionist" element={<LoginView setAuthenticated={setIsAuthenticated} />} />
          <Route path="/receptionist/dashboard" element={
            isAuthenticated ? <ReceptionistView state={queueState} /> : <LoginView setAuthenticated={setIsAuthenticated} />
          } />
          <Route path="/dashboard" element={<DashboardView />} />
        </Routes>
        <ChatWidgetWrapper queueState={queueState} />
      </div>
    </Router>
  );
}

export default App;
