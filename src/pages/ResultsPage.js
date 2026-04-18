import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Results = () => {
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Get stored prediction result
    const storedResult = localStorage.getItem("predictionResult");

    if (storedResult) {
      setResult(JSON.parse(storedResult));
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

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Prediction Result ✅</h2>

      <h3>
        Output:{" "}
        {result.prediction === 1 ? (
          <span style={{ color: "red" }}>Fraud Claim 🚨</span>
        ) : (
          <span style={{ color: "green" }}>Genuine Claim ✅</span>
        )}
      </h3>

      <button
        style={{ marginTop: "20px" }}
        onClick={() => navigate("/predict")}
      >
        Predict Again
      </button>
    </div>
  );
};

export default Results;

const styles = {
  container: {
    width: "70%",
    margin: "auto",
    padding: "40px",
    textAlign: "center",
    fontFamily: "Arial",
  },

  resultBox: {
    padding: "25px",
    marginTop: "20px",
    borderRadius: "12px",
    border: "2px solid green",
    background: "#f9fff9",
    fontSize: "18px",
  },

  detailsBox: {
    marginTop: "30px",
    padding: "20px",
    borderRadius: "12px",
    border: "2px solid #444",
    background: "#f4f4f4",
  },

  table: {
    width: "100%",
    marginTop: "15px",
    borderCollapse: "collapse",
  },

  btn: {
    marginTop: "30px",
    padding: "12px 25px",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "black",
    color: "white",
  },
};