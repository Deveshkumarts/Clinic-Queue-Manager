import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const API_BASE_URL = 'http://localhost:5000/api';
const socket = io('http://localhost:5000');

function WaitingRoomDisplay() {
  const [settings, setSettings] = useState({ currentServingToken: 0, averageConsultationTime: 5 });
  const [queueCount, setQueueCount] = useState(0);

  const fetchData = async () => {
    try {
      const [settingsRes, queueRes] = await Promise.all([
        fetch(`${API_BASE_URL}/settings`),
        fetch(`${API_BASE_URL}/queue`)
      ]);
      
      const settingsData = await settingsRes.json();
      const queueData = await queueRes.json();
      
      setSettings(settingsData);
      setQueueCount(queueData.length);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();

    socket.on('settingsUpdated', fetchData);
    socket.on('queueUpdated', fetchData);
    socket.on('tokenCalled', () => {
      // Could add a sound effect here
      console.log('Next token called');
    });

    return () => {
      socket.off('settingsUpdated');
      socket.off('queueUpdated');
      socket.off('tokenCalled');
    };
  }, []);

  const estimatedWait = queueCount * settings.averageConsultationTime;

  return (
    <div className="queue-display-container">
      <div className="serving-card">
        <div className="serving-title">Now Serving</div>
        <div className="serving-token">#{settings.currentServingToken || 0}</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Tokens Ahead</div>
          <div className="stat-value">{queueCount}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Estimated Wait</div>
          <div className="stat-value">{estimatedWait} <span style={{ fontSize: '1.25rem', fontWeight: '500', color: 'var(--text-muted)' }}>MIN</span></div>
        </div>
      </div>
    </div>
  );
}

export default WaitingRoomDisplay;
