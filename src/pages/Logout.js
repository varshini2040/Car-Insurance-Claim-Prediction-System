// src/pages/Logout.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = ({ onLogout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Perform logout actions
    onLogout();
    
    // Redirect to home after a brief delay
    const timer = setTimeout(() => {
      navigate('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [onLogout, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.content}>
          <i className="fas fa-sign-out-alt fa-4x" style={styles.icon}></i>
          <h2 style={styles.title}>Logging Out</h2>
          <p style={styles.message}>You are being signed out of your account...</p>
          <div style={styles.spinner}>
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: '2rem 0'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '3rem',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem'
  },
  icon: {
    color: '#6c757d',
    marginBottom: '1rem'
  },
  title: {
    fontSize: '2rem',
    margin: 0,
    color: '#212529'
  },
  message: {
    color: '#6c757d',
    fontSize: '1.1rem',
    margin: 0
  },
  spinner: {
    fontSize: '2rem',
    color: '#0d6efd'
  }
};

export default Logout;