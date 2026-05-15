import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = ({ user, isAdmin }) => {
  const navigate = useNavigate();

  // ✅ Track Active Button
  const [activeButton, setActiveButton] = useState("");

  // ✅ Get Started Logic
  const handleGetStarted = () => {
    setActiveButton("getStarted"); // highlight

    if (!user) {
      navigate("/signin");
    } else if (isAdmin) {
      navigate("/admin-dashboard");
    } else {
      navigate("/user-dashboard");
    }
  };

  // ✅ View Analytics Logic
  const handleViewAnalytics = () => {
    setActiveButton("analytics"); // highlight

    if (!user) {
      navigate("/signin");
    } else if (isAdmin) {
      navigate("/analytics");
    } else {
      alert("❌ Analytics is available only for Admin!");
    }
  };

  return (
    <div style={styles.homePage}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.container}>
          <div style={styles.heroContent}>

            {/* Left Text */}
            <div style={styles.heroText}>
              <h1 style={styles.heroTitle}>
                AI Resume Screening System
              </h1>

              <p style={styles.heroDescription}>
                Our advanced machine learning system helps insurance companies
                assess risk and optimize claim decisions with high accuracy.
              </p>

              {/* Buttons */}
              <div style={styles.heroActions}>

                {/* ✅ Get Started */}
                <button
                  onClick={handleGetStarted}
                  style={{
                    ...styles.primaryButton,
                    ...(activeButton === "getStarted"
                      ? styles.activeButton
                      : {}),
                  }}
                >
                  <i className="fas fa-rocket"></i> Get Started
                </button>

                {/* ✅ View Analytics */}
                <button
                  onClick={handleViewAnalytics}
                  style={{
                    ...styles.outlineButton,
                    ...(activeButton === "analytics"
                      ? styles.activeButton
                      : {}),
                  }}
                >
                  <i className="fas fa-chart-line"></i> View Analytics
                </button>

              </div>
            </div>

            {/* Right Visual */}
            <div style={styles.heroVisual}>
              <div style={styles.visualPlaceholder}>
                <i
                  className="fas fa-car-crash"
                  style={styles.visualIcon}
                ></i>
                <p style={styles.visualText}>
                  AI Insurance Analytics Dashboard
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>How It Works</h2>
            <p style={styles.sectionSubtitle}>
              AI-powered fraud detection and claim approval system
            </p>
          </div>

          <div style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <i className="fas fa-database"></i>
              </div>
              <h3>Data Analysis</h3>
              <p>
                Analyze vehicle details, driver history, and claim patterns for
                risk prediction.
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <i className="fas fa-brain"></i>
              </div>
              <h3>AI Prediction</h3>
              <p>
                Machine learning models classify claims into low-risk and fraud
                categories.
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Admin Analytics</h3>
              <p>
                Admin dashboard provides monthly trends, fraud alerts, and claim
                approval statistics.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ---------------- STYLES ---------------- */

const styles = {
  homePage: {
    minHeight: "100vh",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 2rem",
  },

  heroSection: {
    background: "linear-gradient(135deg, #0d6efd, #0043ce)",
    color: "white",
    padding: "4rem 0",
  },

  heroContent: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "4rem",
    alignItems: "center",
  },

  heroTitle: {
    fontSize: "3rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
  },

  heroDescription: {
    fontSize: "1.2rem",
    marginBottom: "2rem",
    opacity: 0.9,
  },

  heroActions: {
    display: "flex",
    gap: "1rem",
  },

  primaryButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "white",
    color: "#0d6efd",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  outlineButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "transparent",
    color: "white",
    border: "2px solid white",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  /* ✅ ACTIVE BUTTON STYLE */
  activeButton: {
    backgroundColor: "white",
    color: "#0d6efd",
    border: "2px solid white",
    transform: "scale(1.05)",
  },

  heroVisual: {
    textAlign: "center",
  },

  visualPlaceholder: {
    opacity: 0.85,
  },

  visualIcon: {
    fontSize: "7rem",
    marginBottom: "1rem",
  },

  visualText: {
    fontSize: "1.1rem",
  },

  featuresSection: {
    padding: "4rem 0",
    backgroundColor: "#f8f9fa",
  },

  sectionHeader: {
    textAlign: "center",
    marginBottom: "3rem",
  },

  sectionTitle: {
    fontSize: "2.5rem",
    marginBottom: "1rem",
  },

  sectionSubtitle: {
    fontSize: "1.1rem",
    color: "#6c757d",
  },

  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
  },

  featureCard: {
    background: "white",
    padding: "2rem",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },

  featureIcon: {
    width: "80px",
    height: "80px",
    background: "#0d6efd",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.5rem",
    fontSize: "2rem",
  },
};

export default Home;
