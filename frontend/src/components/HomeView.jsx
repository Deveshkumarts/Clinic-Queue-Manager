import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Phone, MapPin, Award } from 'lucide-react';

function HomeView() {
  return (
    <div className="container animate-fade-in">
      <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', marginBottom: '2rem' }}>
        <h1 className="title" style={{ fontSize: '3.5rem', color: 'var(--primary-color)' }}>City Health Clinic</h1>
        <p className="subtitle" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          Providing compassionate, state-of-the-art medical care to our community. Your health is our priority.
        </p>
        <Link to="/queue" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', fontSize: '1.25rem', padding: '1rem 2rem' }}>
          View Live Waiting Room
        </Link>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="title" style={{ fontSize: '1.8rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            Meet the Doctor
          </h2>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem', fontWeight: 'bold' }}>
              JS
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Dr. John Smith</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>General Physician</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                <Award size={16} color="var(--primary-color)" /> MBBS, MD (Internal Medicine)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                <Award size={16} color="var(--primary-color)" /> 15+ Years Experience
              </div>
            </div>
          </div>
          <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Dr. Smith specializes in comprehensive health care for people of all ages. He is dedicated to preventive medicine and managing chronic conditions.
          </p>
        </div>

        <div className="card">
          <h2 className="title" style={{ fontSize: '1.8rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            Clinic Information
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <MapPin size={24} color="var(--primary-color)" style={{ marginTop: '0.25rem' }} />
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Location</h4>
                <p style={{ color: 'var(--text-muted)' }}>123 Health Avenue, Medical District<br />Metropolis, NY 10001</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <Clock size={24} color="var(--primary-color)" style={{ marginTop: '0.25rem' }} />
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Hours</h4>
                <p style={{ color: 'var(--text-muted)' }}>Monday - Friday: 9:00 AM - 5:00 PM<br />Saturday: 9:00 AM - 1:00 PM</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <Phone size={24} color="var(--primary-color)" style={{ marginTop: '0.25rem' }} />
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Contact</h4>
                <p style={{ color: 'var(--text-muted)' }}>+1 (555) 123-4567<br />contact@cityhealthclinic.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeView;
