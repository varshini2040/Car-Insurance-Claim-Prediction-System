import React, { useState } from "react";
import axios from "axios";

const ClaimStatus = () => {
  const [claimId, setClaimId] = useState("");
  const [claim, setClaim] = useState(null);

  const checkStatus = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/claims/status/${claimId}`
    );

    setClaim(res.data);
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Check Claim Status</h2>

      <input
        type="text"
        placeholder="Enter Claim ID"
        onChange={(e) => setClaimId(e.target.value)}
      />

      <button onClick={checkStatus}>Check</button>

      {claim && (
        <div>
          <h3>Status: {claim.status}</h3>
          <h3>Prediction: {claim.predictionResult}</h3>
          <h3>Claim Amount: ₹{claim.claimAmount}</h3>
        </div>
      )}
    </div>
  );
};

export default ClaimStatus;