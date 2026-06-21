import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Bell, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../supabase';

function PatientView({ state }) {
  const { activeToken, waitingTokens, avgConsultationTime, doctorStatus, statusMessage } = state;
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [trackedToken, setTrackedToken] = useState('');
  const [cancelPhone, setCancelPhone] = useState('');
  const [hasNotified, setHasNotified] = useState(false);
  
  const prevActiveTokenRef = useRef(null);

  useEffect(() => {
    if (activeToken && activeToken.id !== prevActiveTokenRef.current) {
      if (audioEnabled) {
        const text = `Token number ${activeToken.token_number}, ${activeToken.patient_name}, please proceed to consultation.`;
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
      }
      prevActiveTokenRef.current = activeToken.id;
    }
  }, [activeToken, audioEnabled]);

  useEffect(() => {
    if (trackedToken && Notification.permission === 'granted' && !hasNotified) {
      const index = waitingTokens.findIndex(t => t.token_number === Number(trackedToken));
      if (index === 0) {
        new Notification("ClinicQ Update", { body: "You are next! Please return to the waiting area." });
        setHasNotified(true);
      } else if (index === -1 && activeToken?.token_number === Number(trackedToken)) {
        new Notification("ClinicQ Update", { body: "It is your turn! Please proceed to consultation." });
        setHasNotified(true);
      }
    }
  }, [waitingTokens, activeToken, trackedToken, hasNotified]);

  const handleTrack = (e) => {
    e.preventDefault();
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    setHasNotified(false);
    alert(`Now tracking Token ${trackedToken}. You will be notified when you are next.`);
  };

  const handleCancelToken = async (e) => {
    e.preventDefault();
    if (!cancelPhone.trim()) return;

    const { data, error } = await supabase
      .from('tokens')
      .update({ status: 'CANCELLED' })
      .eq('phone_number', cancelPhone)
      .eq('status', 'WAITING')
      .select();
    
    if (error) {
      alert("Error cancelling token: " + error.message);
    } else if (data && data.length > 0) {
      alert(`Success: Cancelled ${data.length} waiting token(s) for ${cancelPhone}.`);
      setCancelPhone('');
    } else {
      alert("No waiting tokens found for that phone number.");
    }
  };

  return (
    <div className="container animate-fade-in">
      {doctorStatus === 'AWAY' && (
        <div style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          <span><strong>Doctor Away:</strong> {statusMessage || 'Consultations will resume shortly.'}</span>
        </div>
      )}

      <div className="grid-2">
        {/* Left Column: Now Serving & Actions */}
        <div>
          <div className="card" style={{ marginBottom: '2rem', textAlign: 'center', padding: '3rem 2rem' }}>
            <h2 className="title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Now Serving</h2>
            {activeToken ? (
              <div className="animate-fade-in">
                <div className="token-display">
                  {activeToken.token_number}
                </div>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  {activeToken.patient_name} {activeToken.is_emergency && <span style={{ color: '#ef4444' }}>(Priority)</span>}
                </h3>
                <div className="status-badge active">In Consultation</div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>
                <div className="token-display" style={{ color: 'var(--border-color)' }}>--</div>
                <p>Waiting for next patient</p>
              </div>
            )}
            
            <button 
              onClick={() => setAudioEnabled(!audioEnabled)}
              style={{ marginTop: '2rem', background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              {audioEnabled ? 'Audio On' : 'Audio Off'}
            </button>
          </div>

          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={20} color="var(--primary-color)" /> Track My Token
            </h3>
            <form onSubmit={handleTrack} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="number" 
                placeholder="Enter Token #" 
                value={trackedToken}
                onChange={(e) => setTrackedToken(e.target.value)}
                style={{ marginBottom: 0 }}
              />
              <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>Notify Me</button>
            </form>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Get a browser notification when you are next in line.</p>
          </div>

          <div className="card" style={{ borderColor: '#fca5a5' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
              <XCircle size={20} color="#ef4444" /> Cancel My Token
            </h3>
            <form onSubmit={handleCancelToken} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="tel" 
                placeholder="Enter Registered Phone #" 
                value={cancelPhone}
                onChange={(e) => setCancelPhone(e.target.value)}
                style={{ marginBottom: 0, borderColor: '#fca5a5' }}
              />
              <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap', backgroundColor: '#ef4444' }}>Cancel Token</button>
            </form>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Enter your phone number to remove yourself from the queue.</p>
          </div>
        </div>

        {/* Right Column: Waiting Queue */}
        <div className="card">
          <h2 className="title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Waiting List ({waitingTokens.length})</h2>
          
          {waitingTokens.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Queue is empty</p>
          ) : (
            <div className="queue-list">
              {waitingTokens.map((token, index) => (
                <div key={token.id} className="queue-item" style={{ borderLeft: token.is_emergency ? '4px solid #ef4444' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="queue-number" style={{ color: token.is_emergency ? '#ef4444' : 'var(--text-main)' }}>
                      #{token.token_number}
                    </div>
                    <div>
                      <div className="queue-name" style={{ fontWeight: token.is_emergency ? 600 : 400 }}>
                        {token.patient_name} {token.is_emergency && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginLeft: '0.5rem' }}>PRIORITY</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div className="status-badge">Waiting</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      ~{(index + 1) * avgConsultationTime} min wait
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientView;
