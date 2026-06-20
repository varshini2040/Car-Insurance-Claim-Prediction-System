import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ResultsPage.css";

const Results = () => {
  const [result, setResult] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Get stored prediction result
    const storedResult = localStorage.getItem("predictionResult");
    const userData = JSON.parse(localStorage.getItem("user"));

    if (storedResult) {
      setResult(JSON.parse(storedResult));
    }
    
    if (userData) {
      setUser(userData);
    }
  }, []);

  if (!result) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>No Prediction Data Found ❌</h2>
        <button onClick={() => navigate("/predict")}>
          Back to Predict Page
        </button>
      </div>
    );
  }

  const fraudProbability = result.fraudProbability || result.fraud_probability || 0;
  const predictionLabel = result.predictionResult || (result.prediction === 1 ? "Fraud Claim" : "Genuine Claim");
  const customerName = user?.fullName || user?.name || "N/A";
  const vehicleNumber = result.licensePlate || "N/A";
  const policyNumber = result.policyNumber || "POL123456";
  const claimAmount = result.claimAmount || 0;
  
  // Dummy verification data (can be enhanced with actual image verification)
  const vehicleSimilarity = result.vehicleSimilarity || 92.4;
  const storedPlate = result.licensePlate || "TN39AB1234";
  const detectedPlate = result.licensePlateMatch?.detected_plate || "TN39AB1234";
  const plateMatch = result.licensePlateMatch?.match_percentage || 100;
  const storedLicense = result.driverLicenseMatch?.stored_license_no || "TN123456789";
  const detectedLicense = result.driverLicenseMatch?.detected_license_no || "TN123456789";
  const licenseMatch = result.driverLicenseMatch?.match_percentage || 100;
  const overallRiskScore = result.overallRiskScore || fraudProbability * 0.78;
  
  const riskStatus = fraudProbability >= 70 ? "⚠️ Suspicious Claim" : "✅ Verified Claim";
  const recommendedAction = fraudProbability >= 70 ? "Manual Verification Required" : "Approved for Processing";
return (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f8f9fa",
    }}
  >
    <div
      style={{
        background: "white",
        padding: "40px",
        borderRadius: "10px",
        textAlign: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h1>✅ Claim Submitted Successfully</h1>
      <p>Your claim has been submitted and is under review.</p>

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          padding: "10px 20px",
          background: "#0d6efd",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Go to Dashboard
      </button>
    </div>
  </div>
);
};

export default Results;

const styles = {
  mainContainer: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
    fontFamily: "'Courier New', monospace",
  },

  reportContainer: {
    maxWidth: "800px",
    margin: "0 auto",
    backgroundColor: "#1e1e1e",
    color: "#00ff00",
    padding: "30px",
    borderRadius: "10px",
    border: "2px solid #00ff00",
    boxShadow: "0 0 20px rgba(0, 255, 0, 0.3)",
    lineHeight: "1.8",
  },

  header: {
    textAlign: "center",
    marginBottom: "20px",
    borderBottom: "2px solid #00ff00",
    paddingBottom: "10px",
  },

  header: {
    textAlign: "center",
    marginBottom: "20px",
    borderBottom: "2px solid #00ff00",
    paddingBottom: "10px",
  },

  section: {
    marginBottom: "15px",
    paddingLeft: "10px",
  },

  sectionTitle: {
    fontSize: "16px",
    marginBottom: "10px",
    color: "#00ff00",
    textDecoration: "underline",
  },

  infoRow: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "8px",
    fontSize: "14px",
  },

  label: {
    fontWeight: "bold",
    minWidth: "180px",
    color: "#00ff00",
  },

  value: {
    flex: 1,
    color: "#00ff00",
    wordBreak: "break-word",
  },

  divider: {
    textAlign: "center",
    margin: "15px 0",
    color: "#00ff00",
    fontSize: "12px",
    letterSpacing: "2px",
  },

  buttonContainer: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginTop: "30px",
  },

  btn: {
    padding: "12px 25px",
    fontSize: "14px",
    cursor: "pointer",
    borderRadius: "5px",
    border: "1px solid #00ff00",
    backgroundColor: "#1e1e1e",
    color: "#00ff00",
    fontFamily: "'Courier New', monospace",
    transition: "all 0.3s ease",
  },
};