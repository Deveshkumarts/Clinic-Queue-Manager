import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Users, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../supabase';

function DashboardView() {
  const [data, setData] = useState({
    totalPatients: 0,
    emergencies: 0,
    completedCount: 0,
    avgConsultationMinutes: 0
  });

  const fetchAnalytics = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: tokens } = await supabase
        .from('tokens')
        .select('*')
        .gte('added_at', today.toISOString());
        
      if (!tokens) return;

      const totalPatients = tokens.length;
      const emergencies = tokens.filter(t => t.is_emergency).length;
      const completed = tokens.filter(t => t.status === 'COMPLETED');
      
      let totalTime = 0;
      let count = 0;
      completed.forEach(t => {
        if (t.called_at && t.completed_at) {
          totalTime += (new Date(t.completed_at) - new Date(t.called_at));
          count++;
        }
      });
      
      const avgMs = count > 0 ? (totalTime / count) : 0;

      setData({
        totalPatients,
        emergencies,
        completedCount: completed.length,
        avgConsultationMinutes: Math.max(0, Math.round(avgMs / 60000)) || 5
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Polling every 5 seconds for live updates on dashboard
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Mock data for the chart to show "Today's Patient Flow" based on the single metric we have
  const chartData = [
    { name: 'Waiting', value: data.totalPatients - data.completedCount },
    { name: 'Completed', value: data.completedCount },
    { name: 'Emergencies', value: data.emergencies },
  ];

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="title">Clinic Analytics Overview</h1>
        <p className="subtitle">Real-time performance and efficiency metrics.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', color: 'var(--primary-color)' }}>
            <Users size={32} />
          </div>
          <div>
            <div className="stat-label">Total Patients Today</div>
            <div className="stat-value">{data.totalPatients}</div>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', color: 'var(--success-color)' }}>
            <Activity size={32} />
          </div>
          <div>
            <div className="stat-label">Consultations Completed</div>
            <div className="stat-value">{data.completedCount}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem', color: '#ef4444' }}>
            <AlertCircle size={32} />
          </div>
          <div>
            <div className="stat-label">Priority / Emergencies</div>
            <div className="stat-value" style={{ color: '#ef4444' }}>{data.emergencies}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem', color: 'var(--accent-color)' }}>
            <Clock size={32} />
          </div>
          <div>
            <div className="stat-label">Avg Consultation Time</div>
            <div className="stat-value">{data.avgConsultationMinutes} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>min</span></div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="title" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Patient Flow Breakdown</h2>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" stroke="var(--text-main)" />
              <YAxis stroke="var(--text-main)" allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}
                itemStyle={{ color: 'var(--text-main)' }}
              />
              <Legend />
              <Bar dataKey="value" fill="var(--primary-color)" radius={[4, 4, 0, 0]} name="Patients" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default DashboardView;
