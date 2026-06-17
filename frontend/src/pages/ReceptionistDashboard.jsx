import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const API_BASE_URL = `${BACKEND_URL}/api`;
const socket = io(BACKEND_URL);

function ReceptionistDashboard() {
  const [patientName, setPatientName] = useState('');
  const [queue, setQueue] = useState([]);
  const [settings, setSettings] = useState({ currentServingToken: 0, averageConsultationTime: 5 });
  const [localAvgTime, setLocalAvgTime] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchQueue = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/queue`);
      if (!response.ok) throw new Error('Failed to fetch queue');
      const data = await response.json();
      setQueue(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching queue:', error);
      setError('Could not connect to database. Please check your Supabase connection and environment variables.');
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
      setLocalAvgTime(data.averageConsultationTime);
      setError(null);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  useEffect(() => {
    fetchQueue();
    fetchSettings();

    socket.on('queueUpdated', fetchQueue);
    socket.on('settingsUpdated', fetchSettings);

    return () => {
      socket.off('queueUpdated');
      socket.off('settingsUpdated');
    };
  }, []);

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientName })
      });
      if (!response.ok) throw new Error('Failed to add patient');
      setPatientName('');
    } catch (error) {
      console.error('Error adding patient:', error);
      setError('Failed to add patient. Is the database connected?');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCallNext = async () => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/call-next`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to call next token');
    } catch (error) {
      console.error('Error calling next token:', error);
      setError('Failed to call next token.');
    }
  };

  const handleConsultationTimeBlur = async () => {
    if (localAvgTime === settings.averageConsultationTime) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ averageConsultationTime: localAvgTime })
      });
      if (!response.ok) throw new Error('Failed to update settings');
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Failed to save consultation time.');
    }
  };

  return (
    <div className="container">
      <div className="admin-header">
        <h1>Clinic Queue Manager</h1>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #f87171' }}>
          {error}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleAddPatient} className="flex gap-4 items-center">
          <label style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>Patient Name:</label>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Enter patient name" 
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || !patientName.trim()}>
            {isSubmitting ? 'Adding...' : 'Assign Token'}
          </button>
        </form>
      </div>

      <div className="card flex justify-between items-center">
        <div>
          <span style={{ fontWeight: 500, fontSize: '1.125rem' }}>Current Serving Token: </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-blue)' }}>#{settings.currentServingToken}</span>
        </div>
        <div className="flex items-center gap-4">
          <label style={{ fontWeight: 500 }}>Average Consultation Time:</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              className="form-input" 
              style={{ width: '80px', textAlign: 'center' }}
              value={localAvgTime}
              onChange={(e) => setLocalAvgTime(parseInt(e.target.value) || 0)}
              onBlur={handleConsultationTimeBlur}
              min="1"
            />
            <span>minutes</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Waiting Queue</h2>
        {queue.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>No patients in the queue.</p>
        ) : (
          <ul className="queue-list">
            {queue.map((patient) => (
              <li key={patient._id} className="queue-item">
                <span style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-main)', width: '60px' }}>#{patient.tokenNumber}</span>
                <span style={{ fontWeight: 500, flex: 1 }}>{patient.patientName}</span>
                <span className="status-badge">Waiting</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button 
        className="btn btn-success" 
        onClick={handleCallNext}
        disabled={queue.length === 0}
        style={{ width: '100%', fontSize: '1.25rem', padding: '1rem', marginTop: '1rem' }}
      >
        Call Next Token
      </button>
    </div>
  );
}

export default ReceptionistDashboard;
