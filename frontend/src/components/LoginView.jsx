import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

function LoginView({ setAuthenticated }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === '1234') {
      setAuthenticated(true);
      navigate('/receptionist/dashboard');
    } else {
      setError('Invalid PIN. Please try again.');
      setPin('');
    }
  };

  return (
    <div className="container animate-fade-in flex-center" style={{ minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-color)', borderRadius: '50%', marginBottom: '1.5rem' }}>
          <Lock size={32} />
        </div>
        <h2 className="title" style={{ fontSize: '1.8rem' }}>Staff Login</h2>
        <p className="subtitle" style={{ marginBottom: '2rem' }}>Enter your PIN to access the dashboard.</p>
        
        {error && (
          <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input 
            type="password" 
            placeholder="Enter PIN (Demo: 1234)" 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
            autoFocus
          />
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Unlock Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginView;
