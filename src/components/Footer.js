import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.footerContainer}>
        <div style={styles.footerContent}>
          <div style={styles.footerBrand}>
            <h3 style={styles.brandTitle}>
              <i className="fas fa-shield-alt" style={styles.brandIcon}></i>
              InsurePredict
            </h3>
            <p style={styles.brandDescription}>AI-Powered Car Insurance Claim Prediction System</p>
          </div>
          <div style={styles.footerCopyright}>
            <p style={styles.copyrightText}>&copy; 2025 InsurePredict. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#212529',
    color: 'white',
    padding: '2rem 0',
    marginTop: 'auto'
  },
  footerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem'
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerBrand: {
    flex: 1
  },
  brandTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem'
  },
  brandIcon: {
    marginRight: '0.5rem'
  },
  brandDescription: {
    color: '#6c757d',
    margin: 0
  },
  footerCopyright: {
    textAlign: 'right'
  },
  copyrightText: {
    margin: 0,
    color: '#6c757d'
  }
};

export default Footer;