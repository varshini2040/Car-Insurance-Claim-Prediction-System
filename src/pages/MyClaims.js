import React, { useEffect, useState } from "react";
import axios from "axios";

const MyClaims = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [claims, setClaims] = useState([]);

  // Fetch My Claims
  const fetchMyClaims = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/claims/myclaims/${user._id}`
      );

      setClaims(res.data.claims);
    } catch (error) {
      console.log("Error Fetching Claims:", error);
    }
  };

  useEffect(() => {
    fetchMyClaims();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📌 My Submitted Claims</h2>

      {claims.length === 0 ? (
        <p>No Claims Submitted Yet</p>
      ) : (
        <div style={styles.grid}>
          {claims.map((c) => (
            <div key={c._id} style={styles.card}>
              <h3>🚗 Vehicle: {c.vehicleNumber}</h3>

              <p>
                <b>Policy:</b> {c.policyNumber}
              </p>

              <p>
                <b>Amount:</b> ₹{c.claimAmount}
              </p>

              <p>
                <b>Status:</b>{" "}
                <span style={styles.status}>{c.status}</span>
              </p>

              <p>
                <b>Prediction:</b> {c.predictionResult}
              </p>

              {/* Accident Image */}
              {c.accidentImage && (
                <img
                  src={`http://localhost:5000/uploads/${c.accidentImage}`}
                  alt="Accident"
                  style={styles.image}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClaims;

const styles = {
  container: {
    padding: "30px",
    minHeight: "100vh",
    background: "#f4f8ff",
  },
  title: {
    textAlign: "center",
    marginBottom: "25px",
    fontSize: "2rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
    gap: "20px",
  },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
  },
  status: {
    padding: "5px 12px",
    borderRadius: "10px",
    background: "#0d6efd",
    color: "white",
  },
  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    borderRadius: "10px",
    marginTop: "10px",
  },
};
