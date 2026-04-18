import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);

  // Load all claims
  useEffect(() => {
    axios.get("http://localhost:5000/api/claims/all").then((res) => {
      setClaims(res.data);
    });
  }, []);

  // Approve / Reject
  const updateStatus = async (id, status) => {
    await axios.put(`http://localhost:5000/api/claims/update/${id}`, {
      status,
    });

    alert("Claim Updated");

    const res = await axios.get("http://localhost:5000/api/claims/all");
    setClaims(res.data);
  };

  // Detect logic
const handleDetect = (claim) => {
  console.log("Detect clicked:", claim);

  // Force update
  const amount = parseFloat(claim.claimAmount);

  let result = "Approved";
  if (amount > 100000) {
    result = "Fraudulent";
  }

  setSelectedClaim({ ...claim });
  setDetectionResult(result);
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

      {/* RESULT CARD */}
      {selectedClaim && detectionResult && (
        <div
          style={{
            marginTop: "40px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "380px",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              fontFamily: "Arial, sans-serif",
            }}
          >
            {/* Top banner */}
            <div
              style={{
                background:
                  detectionResult === "Approved"
                    ? "#4CAF50"
                    : "#C62828",
                color: "white",
                textAlign: "center",
                padding: "25px",
              }}
            >
              <div style={{ fontSize: "40px" }}>
                {detectionResult === "Approved" ? "✔" : "⚠"}
              </div>

              <h2 style={{ margin: "10px 0" }}>
                {detectionResult}
              </h2>

              <p>
                {detectionResult === "Approved"
                  ? "This claim is considered low risk"
                  : "This claim is considered high risk"}
              </p>
            </div>

            {/* Middle details */}
            <div
              style={{
                background: "#f2f2f2",
                padding: "25px",
                textAlign: "center",
              }}
            >
              <h3>
                Customer:{" "}
                {selectedClaim.userId?.name || "Unknown"}
              </h3>
              <p>Vehicle: {selectedClaim.vehicleNumber}</p>
              <p>
                Claim Amount: ₹{selectedClaim.claimAmount}
              </p>
              <p>
                {selectedClaim.accidentType ||
                  "Accident type not specified"}
              </p>
            </div>

            {/* Bottom strip */}
            <div
              style={{
                background:
                  detectionResult === "Approved"
                    ? "#dcedc8"
                    : "#ffcdd2",
                padding: "15px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {detectionResult === "Approved"
                ? "Process the Claim"
                : "Investigate the Claim Carefully"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClaims;
