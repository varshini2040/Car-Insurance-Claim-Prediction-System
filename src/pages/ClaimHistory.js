import React, { useEffect, useState } from "react";
import axios from "axios";

const ClaimHistory = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    const fetchClaims = async () => {
      const res = await axios.get(
        `http://localhost:5000/api/claims/history/${user._id}`
      );
      setClaims(res.data);
    };

    fetchClaims();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📌 My Claim History</h2>

      {claims.map((c) => (
        <div
          key={c._id}
          style={{
            border: "1px solid gray",
            margin: "10px",
            padding: "10px",
          }}
        >
          <p>Vehicle: {c.vehicleNumber}</p>
          <p>Amount: ₹{c.claimAmount}</p>

          <p>Status: {c.status}</p>
        </div>
      ))}
    </div>
  );
};

export default ClaimHistory;