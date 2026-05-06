import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { authService } from "../services/authService";

const UserDashboard = ({ user, onUserUpdate }) => {
  const [applications, setApplications] = useState([]);
  const [claims, setClaims] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: user?.address || "",
    dateOfBirth: user?.dateOfBirth || "",
  });
  const [isSaving, setIsSaving] = useState(false);

useEffect(() => {
  loadMyApplications();
  loadMyClaims();
}, []);

const loadMyApplications = async () => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/insurance/myapplications/${user._id}`
    );

    setApplications(res.data.applications);
  } catch (error) {
    console.log("Error Loading Applications:", error);
  }
};

  // ===============================
  // Claims (MongoDB)
  // ===============================
  const loadMyClaims = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/claims/myclaims/${user._id}`
      );

      setClaims(res.data.claims);
    } catch (error) {
      console.log("Error Loading Claims:", error);
    }
  };

  // ===============================
  // SAVE PROFILE
  // ===============================
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const result = await authService.updateUserProfile(user._id, profileData);

      if (result.success) {
        alert("✅ Profile updated successfully!");
        setIsEditingProfile(false);
        
        // Update parent component with new user data
        if (onUserUpdate) {
          onUserUpdate(result.updated);
        }
      } else {
        alert("❌ Failed to update profile: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("❌ Error saving profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Badge Style
  const getBadgeStyle = (status) => {
    switch (status) {
      case "Approved":
      case "approved":
        return styles.statusApproved;
      case "Rejected":
      case "rejected":
        return styles.statusRejected;
      default:
        return styles.statusPending;
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <i className="fas fa-user-circle" style={styles.icon}></i>
          Welcome, {user.name}!
        </h1>
        <p style={styles.subtitle}>
          Manage your insurance applications & claims
        </p>
      </div>

      {/* QUICK STATS */}
      <div style={styles.statsGrid}>
        {/* Insurance Count */}
        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statIcon,
              backgroundColor: "#e7f1ff",
              color: "#0d6efd",
            }}
          >
            <i className="fas fa-file-contract"></i>
          </div>
          <div>
            <h3 style={styles.statNumber}>{applications.length}</h3>
            <p style={styles.statLabel}>Insurance Applications</p>
          </div>
        </div>

        {/* Claims Count */}
        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statIcon,
              backgroundColor: "#dcfce7",
              color: "#198754",
            }}
          >
            <i className="fas fa-car-crash"></i>
          </div>
          <div>
            <h3 style={styles.statNumber}>{claims.length}</h3>
            <p style={styles.statLabel}>Applied Claims</p>
          </div>
        </div>
      </div>

      {/* ============================= */}
      {/* MY INSURANCE APPLICATIONS */}
      {/* ============================= */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            <i className="fas fa-file-alt"></i> My Insurance Applications
          </h2>
          <Link to="/apply-insurance" style={styles.newApplicationButton}>
            <i className="fas fa-plus"></i> New Application
          </Link>
        </div>

        {applications.length === 0 ? (
          <div style={styles.emptyState}>
            <h3>No Applications Yet</h3>
            <p>You haven't submitted any insurance applications.</p>
          </div>
        ) : (
          <div style={styles.applicationsGrid}>
            {applications.map((app, index) => (
              <div key={index} style={styles.applicationCard}>
                <div style={styles.applicationHeader}>
                  <h4 style={styles.applicationTitle}>
                    {app.vehicleYear} {app.vehicleModel}
                  </h4>
                  <span
                    style={{
                      ...styles.statusBadge,
                      ...getBadgeStyle(app.status),
                    }}
                  >
                    {app.status.toUpperCase()}
                  </span>
                </div>

                <div style={styles.applicationDetails}>
                  <p>
                    <strong>Vehicle Type:</strong> {app.vehicleType}
                  </p>
                  <p>
                    <strong>Coverage Type:</strong> {app.coverageType}
                  </p>
                  <p>
                    <strong>Submitted:</strong> {app.submittedAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================= */}
      {/* 🚗 MY APPLIED CLAIMS SECTION */}
      {/* ============================= */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            <i className="fas fa-car-crash"></i> My Applied Claims
          </h2>

          <Link to="/apply-claim" style={styles.newApplicationButton}>
            <i className="fas fa-plus"></i> New Claim
          </Link>
        </div>

        {claims.length === 0 ? (
          <div style={styles.emptyState}>
            <h3>No Claims Yet</h3>
            <p>You haven't submitted any claims.</p>
          </div>
        ) : (
          <div style={styles.applicationsGrid}>
            {claims.map((claim, index) => (
              <div key={index} style={styles.applicationCard}>
                <div style={styles.applicationHeader}>
                  <h4 style={styles.applicationTitle}>
                    Vehicle: {claim.vehicleNumber}
                  </h4>

                  <span
                    style={{
                      ...styles.statusBadge,
                      ...getBadgeStyle(claim.status),
                    }}
                  >
                    {claim.status.toUpperCase()}
                  </span>
                </div>

                <div style={styles.applicationDetails}>
                  <p>
                    <strong>Policy No:</strong> {claim.policyNumber}
                  </p>

                  <p>
                    <strong>Claim Amount:</strong> ₹{claim.claimAmount}
                  </p>

                  <p>
                    <strong>Prediction:</strong> {claim.predictionResult}
                  </p>

                  {/* Accident Image */}
                  {claim.accidentImage && (
                    <img
                      src={`http://localhost:5000/uploads/${claim.accidentImage}`}
                      alt="Accident"
                      style={{
                        width: "100%",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginTop: "10px",
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* STYLES (Same as your existing) */
const styles = {
  container: {
    backgroundColor: "#f8f9fa",
    padding: "1.5rem",
  },
  header: { textAlign: "center", marginBottom: "2rem" },
  title: {
    fontSize: "2.5rem",
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
  subtitle: { color: "#666" },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
    gap: "1.5rem",
    marginBottom: "1.5rem",
  },
  statCard: {
    background: "white",
    padding: "1.5rem",
    display: "flex",
    gap: "1rem",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  statIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
  },
  statNumber: { fontSize: "2rem", margin: 0 },
  statLabel: { color: "#555" },

  section: {
    background: "white",
    padding: "1.2rem",
    borderRadius: "12px",
    marginBottom: "25px",
    width: "100%",
  },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { display: "flex", gap: "10px", fontSize: "1.5rem", margin: 0 },
  editButton: {
    background: "#0d6efd",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
  },

  profileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
    marginTop: "1rem",
  },
  profileField: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontWeight: "600",
    marginBottom: "0.5rem",
    color: "#212529",
  },
  input: {
    padding: "0.75rem",
    border: "2px solid #e9ecef",
    borderRadius: "6px",
    fontSize: "1rem",
    fontFamily: "inherit",
  },
  displayValue: {
    padding: "0.75rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    margin: 0,
    color: "#555",
  },
  profileActions: {
    display: "flex",
    gap: "1rem",
    marginTop: "1.5rem",
  },
  saveButton: {
    background: "#198754",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
  },
  cancelButton: {
    background: "#6c757d",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
  },

  newApplicationButton: {
    background: "#0d6efd",
    color: "white",
    padding: "6px 12px",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "0.9rem",
    height: "fit-content",
  },

  applicationsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px,1fr))",
    gap: "1rem",
  },

  applicationCard: {
    border: "1px solid #ddd",
    padding: "1.5rem",
    borderRadius: "8px",
  },

  applicationHeader: { display: "flex", justifyContent: "space-between" },
  applicationTitle: { margin: 0 },

  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.9rem",
    fontWeight: "600",
  },

  statusPending: { background: "#fff3cd", color: "#856404" },
  statusApproved: { background: "#d1e7dd", color: "#0f5132" },
  statusRejected: { background: "#f8d7da", color: "#721c24" },

  emptyState: {
    textAlign: "center",
    color: "#666",
    padding: "1rem",
    marginTop: "0.5rem",
  },
};

export default UserDashboard;
