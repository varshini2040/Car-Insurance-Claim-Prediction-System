import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [insuranceApps, setInsuranceApps] = useState([]);
  const [claims, setClaims] = useState([]);

  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [insuranceResult, setInsuranceResult] = useState(null);
  const [claimResult, setClaimResult] = useState(null); // Object: { prediction, fraudProbability, riskLevel, modelUsed }

  
  // ============================
  // LOAD DATA FROM MONGODB
  // ============================
  useEffect(() => {
    loadInsurance();
    loadClaims();
  }, []);

  const loadInsurance = async () => {
    const res = await axios.get("http://localhost:5000/api/insurance/all");
    setInsuranceApps(res.data);
  };

  const loadClaims = async () => {
    const res = await axios.get("http://localhost:5000/api/claims/all");
    setClaims(res.data);
  };

  // ============================
  // UPDATE STATUS
  // ============================
  const updateInsuranceStatus = async (id, status) => {
    await axios.put(`http://localhost:5000/api/insurance/update/${id}`, {
      status,
    });
    loadInsurance();
    setSelectedInsurance(null);
  };

  const updateClaimStatus = async (id, status) => {
    await axios.put(`http://localhost:5000/api/claims/update/${id}`, {
      status,
    });
    loadClaims();
    setSelectedClaim(null);
  };
// Detect Insurance
const predictInsurance = (app) => {
  const mileage = Number(app.annualMileage || 0);
  const claims = Number(app.previousClaims || 0);

  if (mileage > 20000 || claims > 2) {
    setInsuranceResult("High Risk");
  } else {
    setInsuranceResult("Low Risk");
  }
};

// Detect Claim - ML INTEGRATED
const predictClaim = async (claim) => {
  try {
    // Extract all 10 ML features from claim
    const mlPayload = {
      age: Number(claim.age) || 30,
      gender: claim.gender || "Male",
      vehicle_age: Number(claim.vehicleAge) || 5,
      vehicle_type: claim.vehicleType || "Sedan",
      annual_premium: Number(claim.annualPremium) || 50000,
      driving_experience: Number(claim.drivingExperience) || 5,
      accident_history: Number(claim.accidentHistory) || 0,
      claim_history: Number(claim.claimHistory) || 0,
      credit_score: Number(claim.creditScore) || 700,
      policy_duration: Number(claim.policyDuration) || 2,
      userId: claim.userId?._id,
      policyNumber: claim.policyNumber,
      claimId: claim._id
    };

    console.log("📊 Sending to ML API:", mlPayload);

    // Call ML prediction endpoint
    const response = await axios.post(
      "http://localhost:5000/api/claims/predict",
      mlPayload,
      { timeout: 15000 }
    );

    console.log("✅ ML Response:", response.data);

    // Determine risk level based on fraud probability
    let riskLevel = "Low";
    if (response.data.fraudProbability > 0.7) {
      riskLevel = "High";
    } else if (response.data.fraudProbability > 0.3) {
      riskLevel = "Medium";
    }

    setClaimResult({
      prediction: response.data.prediction === 1 ? "Fraud" : "Legitimate",
      fraudProbability: response.data.fraudProbability || 0,
      riskLevel: riskLevel,
      modelUsed: response.data.modelUsed || "best_insurance_model"
    });

  } catch (error) {
    console.error("❌ Prediction Error:", error.message);
    alert(`❌ Error: ${error.response?.data?.error || error.message}`);
    setClaimResult(null);
  }
};

  // ============================
  // STATS
  // ============================
  const getStats = (data) => ({
    total: data.length,
    approved: data.filter((x) => x.status === "approved").length,
    pending: data.filter((x) => x.status === "pending").length,
    rejected: data.filter((x) => x.status === "rejected").length,
    notdetected: data.filter((x) => x.status === "notdetected").length,
  });

  const insuranceStats = getStats(insuranceApps);
  const claimStats = getStats(claims);

  return (
    <div style={styles.page}>
      <h1 style={styles.mainTitle}>Admin Dashboard</h1>
      <p style={styles.subtitle}>
        Manage Applied Insurance & Claim Submissions
      </p>

      {/* ============================
          INSURANCE APPLICATIONS
      ============================ */}
      <h2 style={styles.sectionTitle}>📌 Applied Insurance Applications</h2>

      <div style={styles.statsRow}>
        <StatCard title="Total" value={insuranceStats.total} />
        <StatCard title="Approved" value={insuranceStats.approved} />
        <StatCard title="Pending" value={insuranceStats.pending} />
        <StatCard title="Rejected" value={insuranceStats.rejected} />
        
      </div>

<table style={styles.table}>
  <thead>
    <tr>
      <th style={styles.th}>Policy No</th>
      <th style={styles.th}>User</th>
      <th style={styles.th}>Vehicle Model</th>
      <th style={styles.th}>License Plate</th>
      <th style={styles.th}>Status</th>
      <th style={styles.th}>Action</th>
    </tr>
  </thead>

  <tbody>
    {insuranceApps.map((app) => (
      <tr key={app._id}>
        <td style={styles.td}>{app.policyNumber}</td>

        <td style={styles.td}>
          <b>{app.userName}</b><br />
          <span style={{ color: "gray", fontSize: "12px" }}>
            {app.userEmail}
          </span>
        </td>

        <td style={styles.td}>
          {app.vehicleYear} {app.vehicleModel}
        </td>

        <td style={styles.td}>
          {app.licensePlate || "N/A"}
        </td>

        <td style={styles.td}>
          <span style={styles.status(app.status)}>
            {app.status}
          </span>
        </td>

        <td style={styles.td}>
          <button
            style={styles.viewBtn}
            onClick={() => {
              setSelectedInsurance(app);
              setInsuranceResult(null); // Clear previous result
            }}
          >
            View
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

      {/* ============================
          CLAIM SUBMISSIONS
      ============================ */}
      <h2 style={styles.sectionTitle}>🚗 Claim Submissions</h2>

      <div style={styles.statsRow}>
        <StatCard title="Total" value={claimStats.total} />
        <StatCard title="Approved" value={claimStats.approved} />
        <StatCard title="Pending" value={claimStats.pending} />
        <StatCard title="Rejected" value={claimStats.rejected} />
        
      </div>

      <table style={styles.table}>
  <thead>
    <tr>
      <th style={styles.th}>Policy No</th>
      <th style={styles.th}>User</th>
      <th style={styles.th}>License Plate</th>
      <th style={styles.th}>Status</th>
      <th style={styles.th}>Action</th>
    </tr>
  </thead>

  <tbody>
    {claims.map((c) => (
      <tr key={c._id}>
        <td style={styles.td}>{c.policyNumber}</td>

        <td style={styles.td}>
          <b>{c.userId?.name}</b><br />
          <span style={{ color: "gray", fontSize: "12px" }}>
            {c.userId?.email}
          </span>
        </td>

       <td style={styles.td}>
          {c.licensePlate || "N/A"}
        </td>

        <td style={styles.td}>
          <span style={styles.status(c.status)}>
            {c.status}
          </span>
        </td>

        <td>
                <button
                  style={styles.viewBtn}
                  onClick={() => {
                    setSelectedClaim(c);
                    setClaimResult(null); // Clear previous result
                  }}
                >
                  👁 View
                </button>
              </td>
      </tr>
    ))}
  </tbody>
</table>

      {/* ============================
          INSURANCE VIEW MODAL FULL
      ============================ */}
      {selectedInsurance && (
        <Modal close={() => setSelectedInsurance(null)}>
          <h2>Application Details</h2>

          <div style={styles.grid}>
            <Box title="User Information">
              <p><b>Policy Number:</b> {selectedInsurance.policyNumber}</p>
              <p>
                <b>Name:</b> {selectedInsurance.userName}
              </p>
              <p>
                <b>Email:</b> {selectedInsurance.userEmail}
              </p>
              <p><b>Phone Number:</b> {selectedInsurance.userPhoneNumber}</p>
             

            </Box>

            <Box title="Vehicle Information">
               <p>
                <b>Plate:</b> {selectedInsurance.licensePlate}
              </p>
              <p>
                <b>Type:</b> {selectedInsurance.vehicleType}
              </p>
              <p>
                <b>Model:</b> {selectedInsurance.vehicleModel}
              </p>
              <p>
                <b>Year:</b> {selectedInsurance.vehicleYear}
              </p>
              
              
            </Box>

            <Box title="Insurance Details">
              <p>
                <b>Coverage:</b> {selectedInsurance.coverageType}
              </p>
              <p>
                <b>Policy Duration:</b> {selectedInsurance.policyDuration}
              </p>
              <p>
                <b>Previous Claims:</b> {selectedInsurance.previousClaims}
              </p>
              <p>
                <b>Driving Exp:</b> {selectedInsurance.drivingExperience} yrs
              </p>
              <p>
                <b>Mileage:</b> {selectedInsurance.annualMileage} km
              </p>
            </Box>

            <Box title="Status">
              <span style={styles.status(selectedInsurance.status)}>
                {selectedInsurance.status}
              </span>
            </Box>
</div>

          {/* ✅ Uploaded Images Section */}
          <h3 style={{ marginTop: "20px" }}>Uploaded Photos</h3>

          <div style={styles.imageGrid}>
            {showImage("License Front", selectedInsurance.licenseFront)}
            {showImage("License Back", selectedInsurance.licenseBack)}
            {showImage("Vehicle Front", selectedInsurance.vehicleFront)}
            {showImage("Vehicle Back", selectedInsurance.vehicleBack)}
            {showImage("Vehicle Side", selectedInsurance.vehicleSide)}
          </div>

          {insuranceResult && (
  <div style={resultStyles.card}>
    <div
      style={{
        ...resultStyles.top,
        background:
          insuranceResult === "Low Risk" ? "#4CAF50" : "#C62828",
      }}
    >
      <div style={resultStyles.icon}>
        {insuranceResult === "Low Risk" ? "✔" : "⚠"}
      </div>
      <h2>
        {insuranceResult === "Low Risk" ? "Approved" : "Fraudulent"}
      </h2>
      <p>
        {insuranceResult === "Low Risk"
          ? "This claim is considered low risk"
          : "This claim is considered high risk"}
      </p>
    </div>

    <div style={resultStyles.middle}>
      <h3>Customer: {selectedInsurance.userName}</h3>
      <p>
        Vehicle: {selectedInsurance.vehicleYear}{" "}
        {selectedInsurance.vehicleModel}
      </p>
    </div>

    <div
      style={{
        ...resultStyles.bottom,
        background:
          insuranceResult === "Low Risk" ? "#dcedc8" : "#ffcdd2",
      }}
    >
      {insuranceResult === "Low Risk"
        ? "Process the Claim"
        : "Investigate the Claim Carefully"}
    </div>
  </div>
)}


          

          {/* Approve Reject */}
          <div style={styles.modalActions}>
           <button
    style={styles.predictBtn}
    onClick={() => predictInsurance(selectedInsurance)}
  >
    Detect
  </button>
           
            <button
              style={styles.approveBtn}
              onClick={() =>
                updateInsuranceStatus(selectedInsurance._id, "approved")
              }
            >
              Approve
            </button>

            <button
              style={styles.rejectBtn}
              onClick={() =>
                updateInsuranceStatus(selectedInsurance._id, "rejected")
              }
            >
              Reject
            </button>
<button
    style={styles.closeActionBtn}
    onClick={() => setSelectedInsurance(null)}
  >
    Close
  </button>
              
          </div>
        </Modal>
      )}

      {/* ============================
          CLAIM VIEW MODAL SIMPLE
      ============================ */}
      {selectedClaim && (
        <Modal close={() => setSelectedClaim(null)}>
          <h2>Claim Details</h2>
          <p><b>Policy Number:</b> {selectedClaim.policyNumber}</p>
<p><b>License Plate:</b> {selectedClaim.licensePlate}</p>

<p><b>Age:</b> {selectedClaim.age}</p>
<p><b>Gender:</b> {selectedClaim.gender}</p>

<p><b>Vehicle Age:</b> {selectedClaim.vehicleAge} Years</p>
<p><b>Vehicle Type:</b> {selectedClaim.vehicleType}</p>

<p><b>Annual Premium:</b> ₹{selectedClaim.annualPremium}</p>

<p><b>Driving Experience:</b> {selectedClaim.drivingExperience} Years</p>

<p><b>Accident History:</b> {selectedClaim.accidentHistory}</p>

<p><b>Claim History:</b> {selectedClaim.claimHistory}</p>

<p><b>Credit Score:</b> {selectedClaim.creditScore}</p>

<p><b>Policy Duration:</b> {selectedClaim.policyDuration} Months</p>

<p><b>Accident Date:</b> {selectedClaim.accidentDate}</p>
<p><b>Accident Location:</b> {selectedClaim.accidentLocation}</p>
<p><b>Damage Type:</b> {selectedClaim.damageType}</p>
<p><b>Driver at Fault:</b> {selectedClaim.driverAtFault}</p>
<p><b>Weather:</b> {selectedClaim.weather}</p>
<p><b>Describe Accident:</b> {selectedClaim.describeAccident}</p>

<p><b>Estimated Cost:</b> ₹{selectedClaim.estimatedCost}</p>
<p><b>Claim Amount:</b> ₹{selectedClaim.claimAmount}</p>

<p><b>Prediction Result:</b> {selectedClaim.predictionResult}</p>
<p><b>Fraud Risk:</b> {selectedClaim.fraudRisk}</p>
<p><b>Status:</b> {selectedClaim.status}</p>
          


          {/* Accident Image */}
          {selectedClaim.accidentImage && (
            <div style={{ textAlign: "center" }}>
              <h3>Accident Image</h3>
              <img
                src={`http://localhost:5000/uploads/${selectedClaim.accidentImage}`}
                alt="Accident"
                style={{ width: "250px", borderRadius: "10px" }}
              />
            </div>
          )}
{claimResult && (
  <div
    style={{
      marginTop: "20px",
      borderRadius: "14px",
      overflow: "hidden",
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      background: "white",
    }}
  >
    {/* HEADER - Alert */}
    <div
      style={{
        background: claimResult.prediction === "Fraud" ? "#dc2626" : "#16a34a",
        color: "white",
        padding: "20px",
        textAlign: "center",
        borderBottom: "4px solid rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ fontSize: "28px", marginBottom: "8px" }}>
        {claimResult.prediction === "Fraud" ? "🚨" : "✅"}
      </div>
      <h2 style={{ margin: "0", fontSize: "20px", fontWeight: "600" }}>
        {claimResult.prediction === "Fraud"
          ? "Fraud Claim Detected"
          : "Legitimate Claim Confirmed"}
      </h2>
    </div>

    {/* MAIN CONTENT */}
    <div style={{ padding: "25px" }}>
      {/* Prediction Box */}
      <div
        style={{
          background: claimResult.prediction === "Fraud" ? "#fee2e2" : "#dcfce7",
          border: `2px solid ${
            claimResult.prediction === "Fraud" ? "#fca5a5" : "#86efac"
          }`,
          borderRadius: "10px",
          padding: "16px",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "14px", color: "#666", marginBottom: "6px" }}>
          Prediction
        </div>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: "700" }}>
          {claimResult.prediction}
        </h3>
        <div style={{ fontSize: "13px", color: "#555" }}>
          Confidence: <strong>{(claimResult.fraudProbability * 100).toFixed(2)}%</strong>
        </div>
      </div>

      {/* Risk Level */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            flex: 1,
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "12px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
            Risk Level
          </div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color:
                claimResult.riskLevel === "High"
                  ? "#dc2626"
                  : claimResult.riskLevel === "Medium"
                  ? "#f59e0b"
                  : "#16a34a",
            }}
          >
            {claimResult.riskLevel}
          </div>
        </div>
      </div>

      {/* Customer & Claim Details Grid */}
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
          Claim Information
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px",
            }}
          >
            <div style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}>
              Customer
            </div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>
              {selectedClaim.userId?.name || "Unknown"}
            </div>
          </div>

          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px",
            }}
          >
            <div style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}>
              Vehicle
            </div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>
              {selectedClaim.vehicleType || "N/A"}
            </div>
          </div>

          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px",
            }}
          >
            <div style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}>
              Claim Amount
            </div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>
              ₹{selectedClaim.claimAmount}
            </div>
          </div>

          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px",
            }}
          >
            <div style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}>
              Damage Type
            </div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>
              {selectedClaim.damageType || "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Indicators */}
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
          Risk Indicators
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "12px",
          }}
        >
          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}>
              Credit Score
            </div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#111" }}>
              {selectedClaim.creditScore || "N/A"}
            </div>
          </div>

          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}>
              Accident History
            </div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#111" }}>
              {selectedClaim.accidentHistory || 0}
            </div>
          </div>

          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}>
              Claim History
            </div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#111" }}>
              {selectedClaim.claimHistory || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Model Info */}
      <div
        style={{
          background: "#f0f9ff",
          border: "1px solid #bfdbfe",
          borderRadius: "8px",
          padding: "12px",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "11px", color: "#1e40af", marginBottom: "4px" }}>
          Model Used
        </div>
        <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e3a8a" }}>
          {claimResult.modelUsed || "Random Forest Classifier"}
        </div>
      </div>

      {/* Recommended Action */}
      <div
        style={{
          background:
            claimResult.prediction === "Fraud" ? "#fef2f2" : "#f0fdf4",
          border: `2px solid ${
            claimResult.prediction === "Fraud" ? "#fecaca" : "#bbf7d0"
          }`,
          borderRadius: "8px",
          padding: "14px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "12px", color: "#666", marginBottom: "6px" }}>
          Recommended Action
        </div>
        <h4
          style={{
            margin: "0",
            fontSize: "15px",
            fontWeight: "700",
            color:
              claimResult.prediction === "Fraud"
                ? "#991b1b"
                : "#166534",
          }}
        >
          {claimResult.prediction === "Fraud"
            ? "Manual Verification Required"
            : "Process & Approve"}
        </h4>
      </div>
    </div>
  </div>
)}
          {/* Approve Reject */}
          <div style={styles.modalActions}>
            <button
  style={styles.predictBtn}
  onClick={() => predictClaim(selectedClaim)}
>
  Detect
</button>
           
            <button
              style={styles.approveBtn}
              onClick={() => updateClaimStatus(selectedClaim._id, "approved")}
            >
              Approve
            </button>

            <button
              style={styles.rejectBtn}
              onClick={() => updateClaimStatus(selectedClaim._id, "rejected")}
            >
              Reject
            </button>   
            <button
    style={styles.closeActionBtn}
    onClick={() => setSelectedClaim(null)}
  >
    Close
  </button>         
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ============================
   IMAGE FUNCTION
============================ */
const showImage = (label, file) => {
  if (!file) return null;
  return (
    <div style={styles.imageBox}>
      <p>{label}</p>
      <img
        src={`http://localhost:5000/uploads/${file}`}
        alt={label}
        style={styles.img}
      />
    </div>
  );
};

/* ============================
   SMALL COMPONENTS
============================ */
const StatCard = ({ title, value }) => (
  <div style={styles.statCard}>
    <h2>{value}</h2>
    <p>{title}</p>
  </div>
);

const Modal = ({ children, close }) => (
  <div style={styles.overlay}>
    <div style={styles.modalBox}>
      <button style={styles.closeBtn} onClick={close}>
        ✖
      </button>
      {children}
    </div>
  </div>
);

const Box = ({ title, children }) => (
  <div style={styles.detailBox}>
    <h3 style={{ color: "#0d6efd" }}>{title}</h3>
    {children}
  </div>
);

/* ============================
   STYLES
============================ */
const styles = {
  page: { padding: "2rem", background: "#f8f9fa" },
  mainTitle: { textAlign: "center", fontSize: "2.5rem", color: "#0d6efd" },
  subtitle: { textAlign: "center", marginBottom: "2rem" },

  sectionTitle: { marginTop: "2rem" },

statsRow: {
  display: "flex",
  gap: "15px",
  marginBottom: "20px",
},

  statCard: {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  textAlign: "center",
  flex: 1,
},

table: {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px"
},

th: {
  border: "1px solid #ddd",
  padding: "12px",
  backgroundColor: "#0d6efd",
  color: "white",
  textAlign: "left"
},

td: {
  border: "1px solid #ddd",
  padding: "12px",
  textAlign: "left"
},

viewBtn: {
  background: "#0d6efd",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "5px",
  cursor: "pointer"
},

  status: (s) => ({
    padding: "6px 14px",
    borderRadius: "20px",
    background:
      s === "approved"
        ? "#d1e7dd"
        : s === "rejected"
        ? "#f8d7da"
        : "#fff3cd",
  }),

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "850px",
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
  },

  closeBtn: {
    position: "absolute",
    top: "10px",
    right: "15px",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    background: "none",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginTop: "15px",
  },

  detailBox: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "15px",
  },

  imageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: "15px",
    marginTop: "10px",
  },

  imageBox: {
    textAlign: "center",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "10px",
  },

  img: {
    width: "100%",
    height: "160px",
    objectFit: "cover",
    borderRadius: "8px",
  },

  modalActions: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },

  approveBtn: {
    background: "green",
    color: "white",
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
  },

  rejectBtn: {
    background: "red",
    color: "white",
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
  },
  predictBtn: {
  background: "#0dcaf0",
  color: "white",
  padding: "10px 18px",
  border: "none",
  borderRadius: "8px",
},
closeActionBtn: {
  background: "#6c757d",
  color: "white",
  padding: "10px 18px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
},


};
const resultStyles = {
  card: {
    marginTop: "20px",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    fontFamily: "Arial",
  },

  top: {
    color: "white",
    textAlign: "center",
    padding: "25px",
  },

  icon: {
    fontSize: "40px",
    marginBottom: "10px",
  },

  middle: {
    background: "#f2f2f2",
    padding: "20px",
    textAlign: "center",
  },

  bottom: {
    padding: "15px",
    textAlign: "center",
    fontWeight: "bold",
  },
};

export default AdminDashboard;
