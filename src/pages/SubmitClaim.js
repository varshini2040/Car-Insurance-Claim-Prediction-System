import React, { useState } from "react";
import axios from "axios";

const SubmitClaim = () => {
  const [formData, setFormData] = useState({
    userId: "",
    vehicleNumber: "",
    accidentHistory: "",
    claimAmount: "",
  });

  const [message, setMessage] = useState("");

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit Claim
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/claims/submit",
        formData
      );

      setMessage("✅ Claim Submitted Successfully!");
    } catch (error) {
      setMessage("❌ Error Submitting Claim");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Submit Insurance Claim</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="userId"
          placeholder="User ID"
          onChange={handleChange}
          required
        />

        <br /><br />

        <input
          type="text"
          name="vehicleNumber"
          placeholder="Vehicle Number"
          onChange={handleChange}
          required
        />

        <br /><br />

        <input
          type="text"
          name="accidentHistory"
          placeholder="Accident History"
          onChange={handleChange}
          required
        />

        <br /><br />

        <input
          type="number"
          name="claimAmount"
          placeholder="Claim Amount"
          onChange={handleChange}
          required
        />

        <br /><br />

        <button type="submit">Submit Claim</button>
      </form>

      <h3>{message}</h3>
    </div>
  );
};

export default SubmitClaim;