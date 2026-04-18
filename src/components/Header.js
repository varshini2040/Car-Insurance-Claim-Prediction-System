// src/components/Header.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import UserProfile from './UserProfile';

const Header = ({ user, isAdmin, onProfileAction }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navContainer}>
        <Link to="/" style={styles.navBrand}>
          <i className="fas fa-shield-alt" style={styles.brandIcon}></i>
          InsurePredict
        </Link>
        
        <div style={styles.navMenu}>
          {/* Home link - Show ONLY for Guest users (not logged in) */}
          {!user && (
            <Link to="/" style={isActive('/') ? {...styles.navLink, ...styles.navLinkActive} : styles.navLink}>
              <i className="fas fa-home"></i> Home
            </Link>
          )}
          
          
          
          {/* Show Apply Insurance and My Dashboard only for regular users (not admin) */}
          {user && !isAdmin && (
            <>
              <Link to="/apply-insurance" style={isActive('/apply-insurance') ? {...styles.navLink, ...styles.navLinkActive} : styles.navLink}>
                <i className="fas fa-file-contract"></i> Apply Insurance
              </Link>
              <Link to="/user-dashboard" style={isActive('/user-dashboard') ? {...styles.navLink, ...styles.navLinkActive} : styles.navLink}>
                <i className="fas fa-tachometer-alt"></i> My Dashboard
              </Link>
<Link to="/predict" style={isActive('/predict') ? {...styles.navLink, ...styles.navLinkActive} : styles.navLink}>
                <i className="fas fa-tachometer-alt"></i> Apply Claim
              </Link>
            </>
          )}
          
          {/* Show Admin Panel only for admin users */}
          {isAdmin && (
            <Link to="/admin-dashboard" style={isActive('/admin-dashboard') ? {...styles.navLink, ...styles.navLinkActive} : styles.navLink}>
              <i className="fas fa-cog"></i> Admin Panel
            </Link>
          )}
        </div>

        <div style={styles.authSection}>
          {user ? (
            <div style={styles.userSection}>
              <span style={styles.userName}>
                <i className="fas fa-user"></i> Welcome, {user.name}
                {isAdmin && <span style={styles.adminBadge}></span>}
              </span>
              {/* User Profile Dropdown */}
              <div style={styles.profileContainer}>
                <UserProfile 
                  user={user} 
                  isAdmin={isAdmin} 
                  onAction={onProfileAction}
                />
              </div>
            </div>
          ) : (
            <div style={styles.authButtons}>
              <Link to="/signin" style={styles.authButton}>
                <i className="fas fa-sign-in-alt"></i> Sign In
              </Link>
              <Link to="/signup" style={{...styles.authButton, ...styles.signUpButton}}>
                <i className="fas fa-user-plus"></i> Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    background: 'linear-gradient(135deg, #0d6efd, #0043ce)',
    padding: '1rem 0',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  navBrand: {
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  brandIcon: {
    fontSize: '1.8rem'
  },
  navMenu: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center'
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '500'
  },
  navLinkActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
  },
  authSection: {
    display: 'flex',
    alignItems: 'center'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    color: 'white'
  },
  userName: {
    fontSize: '1rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },

  profileContainer: {
    marginLeft: '0.5rem'
  },
  authButtons: {
    display: 'flex',
    gap: '1rem'
  },
  authButton: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '500'
  },
  signUpButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '2px solid rgba(255, 255, 255, 0.3)'
  }
};

// Add hover effects
const addHoverEffect = (style) => ({
  ...style,
  ':hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-1px)'
  }
});

// Apply hover effects
styles.navLink = addHoverEffect(styles.navLink);
styles.authButton = addHoverEffect(styles.authButton);

// Special hover for signup button
styles.signUpButton = {
  ...styles.signUpButton,
  ':hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: 'translateY(-1px)'
  }
};

export default Header;