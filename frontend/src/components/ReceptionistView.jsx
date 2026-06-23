import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Users, Clock, Play, UserPlus, ShieldAlert, Settings } from 'lucide-react';

function ReceptionistView({ state }) {
  const { activeToken, waitingTokens, doctorStatus, statusMessage, baselineConsultationTime } = state;
  const [patientName, setPatientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [newBaseline, setNewBaseline] = useState('');
  const [awayMessage, setAwayMessage] = useState(statusMessage || '');

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!patientName.trim() || !phoneNumber.trim()) return;
    
    const { data: highestToken } = await supabase
      .from('tokens')
      .select('token_number')
      .order('token_number', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    const nextTokenNumber = highestToken ? highestToken.token_number + 1 : 1;

    const { error } = await supabase.from('tokens').insert({
      patient_name: patientName,
      phone_number: phoneNumber,
      token_number: nextTokenNumber,
      is_emergency: isEmergency,
      status: 'WAITING'
    });

    if (error) {
      alert("Error adding patient: " + error.message);
      return;
    }

    setPatientName('');
    setPhoneNumber('');
    setIsEmergency(false);
  };

  const handleCallNext = async () => {
    if (activeToken) {
      await supabase.from('tokens').update({ status: 'COMPLETED', completed_at: new Date().toISOString() }).eq('id', activeToken.id);
    }
    if (waitingTokens.length > 0) {
      const nextToken = waitingTokens[0];
      await supabase.from('tokens').update({ status: 'ACTIVE', called_at: new Date().toISOString() }).eq('id', nextToken.id);
    }
  };

  const handleSetBaseline = async (e) => {
    e.preventDefault();
    if (!newBaseline) return;
    await supabase.from('settings').update({ baseline_consultation_time: Number(newBaseline) }).eq('key', 'global');
    setNewBaseline('');
  };

  const handleToggleStatus = async () => {
    const newStatus = doctorStatus === 'AVAILABLE' ? 'AWAY' : 'AVAILABLE';
    await supabase.from('settings').update({ doctor_status: newStatus, status_message: newStatus === 'AWAY' ? awayMessage : '' }).eq('key', 'global');
  };

  return (
    <div className="container animate-fade-in">
      <h2 className="title" style={{ marginBottom: '2rem' }}>Staff Dashboard</h2>

      <div className="grid-2">
        {/* Left Column: Actions */}
        <div>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus /> Add Patient
            </h3>
            <form onSubmit={handleAddPatient}>
              <input 
                type="text" 
                placeholder="Patient Name" 
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  style={{ width: 'auto', margin: 0 }}
                />
                Emergency / Priority
              </label>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Add to Queue</button>
            </form>
          </div>

          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings /> Baseline Settings
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>CURRENT AVG TIME</span>
              <span style={{ fontWeight: 600 }}>{baselineConsultationTime} min</span>
            </div>
            
            <form onSubmit={handleSetBaseline} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="number" 
                placeholder="New baseline (min)" 
                value={newBaseline}
                onChange={(e) => setNewBaseline(e.target.value)}
                style={{ marginBottom: 0 }}
              />
              <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>Update</button>
            </form>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Used as fallback if no actual data is available.</p>
          </div>
        </div>

        {/* Right Column: Queue Control */}
        <div>
          <div className="card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'left' }}>Queue Control</h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              CURRENTLY SERVING
            </div>
            <div className="token-display" style={{ fontSize: '4rem', margin: '0.5rem 0 2rem 0' }}>
              {activeToken ? `#${activeToken.token_number}` : '--'}
            </div>
            <button 
              onClick={handleCallNext} 
              className="btn-success"
              disabled={waitingTokens.length === 0 && !activeToken}
              style={{ opacity: (waitingTokens.length === 0 && !activeToken) ? 0.5 : 1 }}
            >
              Call Next Token
            </button>
          </div>

          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Doctor Status</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className={`status-badge ${doctorStatus === 'AVAILABLE' ? 'active' : ''}`} style={{ background: doctorStatus === 'AWAY' ? '#ef4444' : '', color: doctorStatus === 'AWAY' ? 'white' : '' }}>
                {doctorStatus}
              </span>
              <button onClick={handleToggleStatus} className="btn-primary" style={{ background: doctorStatus === 'AVAILABLE' ? '#d97706' : 'var(--primary-color)' }}>
                {doctorStatus === 'AVAILABLE' ? 'Set to Away' : 'Set to Available'}
              </button>
            </div>
            
            {doctorStatus === 'AWAY' && (
              <div>
                <input 
                  type="text" 
                  placeholder="Away Message (e.g., Back in 10 mins)" 
                  value={awayMessage}
                  onChange={(e) => {
                    setAwayMessage(e.target.value);
                    supabase.from('settings').update({ status_message: e.target.value }).eq('key', 'global');
                  }}
                  style={{ marginBottom: 0 }}
                />
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Waiting ({waitingTokens.length})
            </h3>
            {waitingTokens.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {waitingTokens.map(token => (
                  <div key={token.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-color)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary-color)' }}>#{token.token_number}</span>
                      <span>{token.patient_name}</span>
                      {token.is_emergency && <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold', padding: '0.1rem 0.4rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.25rem' }}>EMERGENCY</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No patients waiting</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceptionistView;
