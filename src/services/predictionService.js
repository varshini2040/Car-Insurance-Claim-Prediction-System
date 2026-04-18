import axios from "axios";

export const makePrediction = async (data) => {
  try {
    const res = await axios.post("/api/predict", data);
    return res.data;
  } catch (error) {
    console.error("Prediction service error:", error.response?.data || error.message);
    throw error;
  }
};