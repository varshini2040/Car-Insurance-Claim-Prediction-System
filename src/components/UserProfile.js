import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css";

const UserProfile = ({ user, isAdmin, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (isOpen) setSettingsOpen(false);
  };

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const handleMenuItemClick = (action) => {
    setIsOpen(false);
    setSettingsOpen(false);

    // Call App.js handler
    if (onAction) {
      onAction(action);
    }
  };

  return (
    <div className="profile-container" ref={dropdownRef}>
      {/* Profile Icon */}
      <div
        className={`profile-icon ${isOpen ? "active" : ""}`}
        onClick={toggleDropdown}
        aria-label="User profile menu"
        aria-expanded={isOpen}
      >
        <div className="profile-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
        <svg
          className={`dropdown-arrow ${isOpen ? "open" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="dropdown-menu">
          {/* Header */}
          <div className="dropdown-header">
            <div className="user-avatar-large">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            <div className="user-info">
              <h3>{user?.name || "User"}</h3>
              <p>{user?.email || "email@example.com"}</p>
              {isAdmin && <span className="admin-badge">Administrator</span>}
            </div>
          </div>

          <div className="dropdown-content">
            {/* Apply Insurance (Users only) */}
            {!isAdmin && (
              <div
                className="menu-item"
                onClick={() => handleMenuItemClick("apply-insurance")}
              >
                <div className="menu-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#4a90e2" />
                  </svg>
                </div>
                <span>Apply Insurance</span>
              </div>
            )}
            {/* Predict (Users only) */}
{!isAdmin && (
  <div
    className="menu-item"
    onClick={() => handleMenuItemClick("predict")}
  >
    <div className="menu-icon">
      <svg width="20" height="20" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#4a90e2" />
      </svg>
    </div>
    <span>Apply Claim</span>
  </div>
)}

            {/* Dashboard */}
            <div
              className="menu-item"
              onClick={() => handleMenuItemClick("my-dashboard")}
            >
              <div className="menu-icon">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="#4a90e2" />
                </svg>
              </div>
              <span>{isAdmin ? "Admin Dashboard" : "My Dashboard"}</span>
            </div>

            {/* User Details (Users only) */}
            {!isAdmin && (
              <div
                className="menu-item"
                onClick={() => handleMenuItemClick("user-details")}
              >
                <div className="menu-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#4a90e2" />
                  </svg>
                </div>
                <span>My Details</span>
              </div>
            )}

            {/* Admin User Management */}
            {isAdmin && (
              <div
                className="menu-item"
                onClick={() => handleMenuItemClick("admin-users")}
              >
                <div className="menu-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#4a90e2" />
                  </svg>
                </div>
                <span>User Data</span>
              </div>
            )}

            {/* Settings Section */}
            <div className="menu-section">
              <div
                className="menu-item settings-item"
                onClick={toggleSettings}
              >
                <div className="menu-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#4a90e2" />
                  </svg>
                </div>
                <span>Settings</span>
              </div>

              {/* Settings Submenu */}
              {settingsOpen && (
                <div className="settings-submenu">
                  <div className="submenu-item">
                    <span>Notifications</span>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationsEnabled}
                        onChange={toggleNotifications}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="menu-divider"></div>

            {/* Logout */}
            <div
              className="menu-item logout-item"
              onClick={() => handleMenuItemClick("logout")}
            >
              <div className="menu-icon">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <rect width="20" height="20" fill="#e74c3c" />
                </svg>
              </div>
              <span>Log Out</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
