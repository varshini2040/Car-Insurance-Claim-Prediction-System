import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [verificationData, setVerificationData] = useState({
    policyVerified: false,
    documentsComplete: false,
    policyConsistent: true,
    estimateMatches: true,
    thirdPartyInvolved: false,
    policeReportFiled: false,
    witnessAvailable: false,
    injuryReported: false,
    claimsPattern: "first",
    vehicleCondition: "acceptable",
  });

  // Load all claims
  useEffect(() => {
    axios.get("http://localhost:5000/api/claims/all").then((res) => {
      setClaims(res.data);
    });
  }, []);

  // Handle verification data change
  const handleVerificationChange = (field, value) => {
    setVerificationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Approve / Reject
  const updateStatus = async (id, status) => {
    await axios.put(`http://localhost:5000/api/claims/update/${id}`, {
      status,
    });

    alert("Claim Updated");

    const res = await axios.get("http://localhost:5000/api/claims/all");
    setClaims(res.data);
  };

  // Detect logic - Call ML API
const handleDetect = async (claim) => {
  console.log("🔍 Detect clicked:", claim);
  
  try {
    // Extract all 10 ML features from claim document
    const mlPayload = {
      // 10 ML Features stored in claim
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
      // Additional info
      userId: claim.userId?._id,
      policyNumber: claim.policyNumber,
      claimId: claim._id
    };

    console.log("📊 Sending to ML API:", mlPayload);

    // Call backend predict endpoint
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

    setSelectedClaim(claim);
    setDetectionResult({
      prediction: response.data.prediction === 1 ? "Fraud" : "Legitimate",
      fraudProbability: response.data.fraudProbability || 0,
      riskLevel: riskLevel,
      modelUsed: response.data.modelUsed || "RandomForest",
      inputFeatures: response.data.inputFeatures,
      allPredictions: response.data.allPredictions,
      probabilities: response.data.probabilities
    });

  } catch (error) {
    console.error("❌ Detection Error:", error.message);
    console.error("Full error:", error);
    
    let errorMsg = error.message;
    if (error.response?.data?.error) {
      errorMsg = error.response.data.error;
    } else if (error.response?.status === 503) {
      errorMsg = "ML API is not running. Make sure Flask server is started.";
    }
    
    alert(`❌ Error: ${errorMsg}`);
    setDetectionResult(null);
  }
};



  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Claim Approval Dashboard</h2>

      {/* CLAIM TABLE */}
      <table border="1" cellPadding="10" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>User</th>
            <th>Vehicle</th>
            <th>Amount</th>
            <th>Prediction</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {claims.map((c) => (
            <tr key={c._id}>
              <td>{c.userId?.name || "Unknown"}</td>
              <td>{c.vehicleNumber}</td>
              <td>₹{c.claimAmount}</td>

              <td
                style={{
                  color:
                    c.predictionResult === "Fraud"
                      ? "red"
                      : "green",
                  fontWeight: "bold",
                }}
              >
                {c.predictionResult}
              </td>

              <td>{c.status}</td>

              <td>
                <button onClick={() => handleDetect(c)}>
                  Detect
                </button>

                <button
                  onClick={() => updateStatus(c._id, "Approved")}
                >
                  Approve
                </button>

                <button
                  onClick={() => updateStatus(c._id, "Rejected")}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* VERIFICATION FORM */}
      {selectedClaim && !detectionResult && (
        <div style={{ padding: "20px", marginTop: "30px", background: "#f8f9fa", borderRadius: "10px", border: "2px solid #e0e0e0" }}>
          <h2 style={{ marginTop: 0, color: "#333" }}>📋 Claim Verification Checklist</h2>
          <p style={{ color: "#666", fontSize: "14px" }}>Fill these fields to verify if this is a genuine claim before running ML detection</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
            {/* Left Column */}
            <div>
              {/* Policy Verification */}
              <div style={{ marginBottom: "15px", background: "white", padding: "12px", borderRadius: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: "10px" }}>
                  <input
                    type="checkbox"
                    checked={verificationData.policyVerified}
                    onChange={(e) => handleVerificationChange("policyVerified", e.target.checked)}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>✓ Policy Verified & Active</span>
                </label>
                <p style={{ fontSize: "12px", color: "#999", margin: "4px 0 0 28px" }}>Policy number matched & coverage valid</p>
              </div>

              {/* Documents Complete */}
              <div style={{ marginBottom: "15px", background: "white", padding: "12px", borderRadius: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: "10px" }}>
                  <input
                    type="checkbox"
                    checked={verificationData.documentsComplete}
                    onChange={(e) => handleVerificationChange("documentsComplete", e.target.checked)}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>✓ All Documents Uploaded</span>
                </label>
                <p style={{ fontSize: "12px", color: "#999", margin: "4px 0 0 28px" }}>Police report, photos, estimates received</p>
              </div>

              {/* Claim Details Consistent */}
              <div style={{ marginBottom: "15px", background: "white", padding: "12px", borderRadius: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: "10px" }}>
                  <input
                    type="checkbox"
                    checked={verificationData.policyConsistent}
                    onChange={(e) => handleVerificationChange("policyConsistent", e.target.checked)}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>✓ Claim Details Match Policy</span>
                </label>
                <p style={{ fontSize: "12px", color: "#999", margin: "4px 0 0 28px" }}>Claim story matches policy terms & coverage</p>
              </div>

              {/* Estimate Matches Damage */}
              <div style={{ marginBottom: "15px", background: "white", padding: "12px", borderRadius: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: "10px" }}>
                  <input
                    type="checkbox"
                    checked={verificationData.estimateMatches}
                    onChange={(e) => handleVerificationChange("estimateMatches", e.target.checked)}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>✓ Estimate Matches Damage Photos</span>
                </label>
                <p style={{ fontSize: "12px", color: "#999", margin: "4px 0 0 28px" }}>Reported damage consistent with estimate</p>
              </div>
            </div>

            {/* Right Column */}
            <div>
              {/* Third Party Involved */}
              <div style={{ marginBottom: "15px", background: "white", padding: "12px", borderRadius: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: "10px" }}>
                  <input
                    type="checkbox"
                    checked={verificationData.thirdPartyInvolved}
                    onChange={(e) => handleVerificationChange("thirdPartyInvolved", e.target.checked)}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>✓ Third Party Involved</span>
                </label>
                <p style={{ fontSize: "12px", color: "#999", margin: "4px 0 0 28px" }}>Other party details verified & contacted</p>
              </div>

              {/* Police Report Filed */}
              <div style={{ marginBottom: "15px", background: "white", padding: "12px", borderRadius: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: "10px" }}>
                  <input
                    type="checkbox"
                    checked={verificationData.policeReportFiled}
                    onChange={(e) => handleVerificationChange("policeReportFiled", e.target.checked)}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>✓ Police Report Filed</span>
                </label>
                <p style={{ fontSize: "12px", color: "#999", margin: "4px 0 0 28px" }}>FIR filed & reference number available</p>
              </div>

              {/* Witness Available */}
              <div style={{ marginBottom: "15px", background: "white", padding: "12px", borderRadius: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: "10px" }}>
                  <input
                    type="checkbox"
                    checked={verificationData.witnessAvailable}
                    onChange={(e) => handleVerificationChange("witnessAvailable", e.target.checked)}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>✓ Witnesses Available</span>
                </label>
                <p style={{ fontSize: "12px", color: "#999", margin: "4px 0 0 28px" }}>Independent witnesses ready for verification</p>
              </div>

              {/* Claims Pattern */}
              <div style={{ marginBottom: "15px", background: "white", padding: "12px", borderRadius: "8px" }}>
                <label style={{ fontWeight: "600", fontSize: "14px", display: "block", marginBottom: "6px" }}>
                  📊 Claims Pattern
                </label>
                <select
                  value={verificationData.claimsPattern}
                  onChange={(e) => handleVerificationChange("claimsPattern", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    fontSize: "13px"
                  }}
                >
                  <option value="first">First claim (New claimant)</option>
                  <option value="occasional">Occasional claims (1-2 per year)</option>
                  <option value="frequent">Frequent claims (3+ per year)</option>
                  <option value="suspicious">Very frequent (Red flag)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary Bar */}
          <div style={{
            marginTop: "20px",
            padding: "12px",
            background: "#e8f5e9",
            borderRadius: "8px",
            border: "1px solid #81c784"
          }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#2e7d32" }}>
              <strong>✓ Verification Checklist:</strong> {
                [verificationData.policyVerified, verificationData.documentsComplete, verificationData.policyConsistent, verificationData.estimateMatches].filter(Boolean).length
              }/4 critical items verified
              {verificationData.claimsPattern === "suspicious" && <span style={{ color: "red" }}> ⚠️ Suspicious pattern detected!</span>}
            </p>
          </div>

          <div style={{ marginTop: "15px", textAlign: "center" }}>
            <button
              onClick={() => handleDetect(selectedClaim)}
              style={{
                padding: "12px 30px",
                fontSize: "15px",
                fontWeight: "600",
                background: "#0066cc",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              🔍 Run ML Fraud Detection
            </button>
            <button
              onClick={() => {
                setSelectedClaim(null);
                setVerificationData({
                  policyVerified: false,
                  documentsComplete: false,
                  policyConsistent: true,
                  estimateMatches: true,
                  thirdPartyInvolved: false,
                  policeReportFiled: false,
                  witnessAvailable: false,
                  injuryReported: false,
                  claimsPattern: "first",
                  vehicleCondition: "acceptable",
                });
              }}
              style={{
                marginLeft: "10px",
                padding: "12px 30px",
                fontSize: "15px",
                fontWeight: "600",
                background: "#999",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
      {selectedClaim && detectionResult && (
        <div
          style={{
            marginTop: "40px",
            display: "flex",
            justifyContent: "center",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "550px",
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
                background: detectionResult.prediction === "Fraud" ? "#dc2626" : "#16a34a",
                color: "white",
                padding: "20px",
                textAlign: "center",
                borderBottom: "4px solid rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>
                {detectionResult.prediction === "Fraud" ? "🚨" : "✅"}
              </div>
              <h2 style={{ margin: "0", fontSize: "20px", fontWeight: "600" }}>
                {detectionResult.prediction === "Fraud"
                  ? "Fraud Claim Detected"
                  : "Legitimate Claim Confirmed"}
              </h2>
            </div>

            {/* MAIN CONTENT */}
            <div style={{ padding: "25px" }}>
              {/* Prediction Box */}
              <div
                style={{
                  background: detectionResult.prediction === "Fraud" ? "#fee2e2" : "#dcfce7",
                  border: `2px solid ${
                    detectionResult.prediction === "Fraud" ? "#fca5a5" : "#86efac"
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
                  {detectionResult.prediction}
                </h3>
                <div style={{ fontSize: "13px", color: "#555" }}>
                  Confidence: <strong>{(detectionResult.fraudProbability * 100).toFixed(2)}%</strong>
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
                        detectionResult.riskLevel === "High"
                          ? "#dc2626"
                          : detectionResult.riskLevel === "Medium"
                          ? "#f59e0b"
                          : "#16a34a",
                    }}
                  >
                    {detectionResult.riskLevel}
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
                  {detectionResult.modelUsed || "Random Forest Classifier"}
                </div>
              </div>

              {/* Recommended Action */}
              <div
                style={{
                  background:
                    detectionResult.prediction === "Fraud" ? "#fef2f2" : "#f0fdf4",
                  border: `2px solid ${
                    detectionResult.prediction === "Fraud" ? "#fecaca" : "#bbf7d0"
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
                      detectionResult.prediction === "Fraud"
                        ? "#991b1b"
                        : "#166534",
                  }}
                >
                  {detectionResult.prediction === "Fraud"
                    ? "Manual Verification Required"
                    : "Process & Approve"}
                </h4>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClaims;
