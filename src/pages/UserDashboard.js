import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const UserDashboard = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [claims, setClaims] = useState([]);

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
  sectionHeader: { display: "flex", justifyContent: "space-between" },
  sectionTitle: { display: "flex", gap: "10px", fontSize: "1.5rem" },

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
