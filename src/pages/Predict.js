import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Predict = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    policyNumber: "",
    licensePlate: "",
    accidentDate: "",
    accidentLocation: "",
    damageType: "",
    description: "",
    driverFault: "",
    weatherCondition: "",
    estimatedCost: "",
    claimAmount: "",
    age: "",
gender: "",
vehicleAge: "",
vehicleType: "",
annualPremium: "",
drivingExperience: "",
accidentHistory: "",
claimHistory: "",
creditScore: "",
policyDuration: ""
  });

  
const [carImage, setCarImage] = useState(null);
const [plateImage, setPlateImage] = useState(null);
const [licenseImage, setLicenseImage] = useState(null);
const [isSubmitting, setIsSubmitting] = useState(false);
const [submitted, setSubmitted] = useState(false);


  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        policyNumber: user.policyNumber || "",
        licensePlate: user.licensePlate || ""
      }));
    }
  }, [user]);

  
  // ============================
  // HANDLE INPUT CHANGE
  // ============================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ============================
  // SUBMIT CLAIM
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("User not found ❌");
      return;
    }

    if (!formData.policyNumber || !formData.licensePlate) {
      alert("Policy not loaded yet ❌");
      return;
    }

    if (!carImage || !plateImage || !licenseImage) {
      alert("All three verification images are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const data = new FormData();

      data.append("userId", user._id);
      data.append("policyNumber", formData.policyNumber);
      data.append("licensePlate", formData.licensePlate);

      data.append("accidentDate", formData.accidentDate);
      data.append("accidentLocation", formData.accidentLocation);
      data.append("damageType", formData.damageType);
      data.append("driverAtFault", formData.driverFault);
      data.append("weather", formData.weatherCondition);
      data.append("describeAccident", formData.description);
      data.append("estimatedCost", formData.estimatedCost);
      data.append("claimAmount", formData.claimAmount);
      data.append("age", formData.age);
data.append("gender", formData.gender);
data.append("vehicleAge", formData.vehicleAge);
data.append("vehicleType", formData.vehicleType);
data.append("annualPremium", formData.annualPremium);
data.append("drivingExperience", formData.drivingExperience);
data.append("accidentHistory", formData.accidentHistory);
data.append("claimHistory", formData.claimHistory);
data.append("creditScore", formData.creditScore);
data.append("policyDuration", formData.policyDuration);
data.append("carImage", carImage);
data.append("plateImage", plateImage);
data.append("licenseImage", licenseImage);

      await axios.post(
        "http://localhost:5000/api/claims/submit",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setSubmitted(true);
      setTimeout(() => navigate("/myclaims"), 1800);




    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Submit failed ❌");
    } finally {
      setIsSubmitting(false);
    }
  };


  if (submitted) {
    return (
      <div style={styles.successPage}>
        <div style={styles.successBox}>
          <h2 style={styles.successTitle}>✅ Claim Submitted Successfully</h2>
          <p style={styles.successText}>
            Your claim has been submitted and is under review by the insurance administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <div style={styles.header}>
          <h2 style={styles.title}>🚗 Apply Claim</h2>
          <p style={styles.subtitle}>Submit your insurance claim details</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Policy Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Policy Details</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Policy Number</label>
                <input
                  name="policyNumber"
                  placeholder="Policy Number"
                  value={formData.policyNumber}
                  readOnly
                  style={{...styles.input, backgroundColor: '#f8f9fa', cursor: 'not-allowed'}}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>License Plate</label>
                <input
                  name="licensePlate"
                  placeholder="License Plate"
                  value={formData.licensePlate}
                  readOnly
                  style={{...styles.input, backgroundColor: '#f8f9fa', cursor: 'not-allowed'}}
                />
              </div>
            </div>
          </div>

          {/* Accident Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Accident Details</h3>
            <div style={styles.formGrid}>
              <input type="date" name="accidentDate" required onChange={handleChange} style={styles.input}/>
              <input name="accidentLocation" placeholder="Accident Location" required onChange={handleChange} style={styles.input}/>
              
              <select name="damageType" required onChange={handleChange} style={styles.input}>
                <option value="">Damage Type</option>
                <option value="Minor">Minor</option>
                <option value="Major">Major</option>
                <option value="Total Loss">Total Loss</option>
              </select>

              <select name="driverFault" onChange={handleChange} style={styles.input}>
                <option value="">Driver at Fault?</option>
                <option>Yes</option>
                <option>No</option>
              </select>

              <select name="weatherCondition" onChange={handleChange} style={styles.input}>
                <option value="">Weather</option>
                <option>Clear</option>
                <option>Rainy</option>
                <option>Fog</option>
              </select>

              <textarea name="description" placeholder="Describe accident" onChange={handleChange} style={styles.input}/>
            </div>
          </div>

          {/* Financial Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Financial Details</h3>
            <div style={styles.formGrid}>
              <input type="number" name="estimatedCost" placeholder="Estimated Cost" onChange={handleChange} style={styles.input}/>
              <input type="number" name="claimAmount" placeholder="Claim Amount *" required onChange={handleChange} style={styles.input}/>
            </div>
          </div>

{/* Additional Claim Details */}
<div style={styles.section}>
  <h3 style={styles.sectionTitle}>Additional Claim Details</h3>

  <div style={styles.formGrid}>

    <input
  type="number"
  name="age"
  placeholder="Age"
  onChange={handleChange}
  style={styles.input}
/>

<select
  name="gender"
  onChange={handleChange}
  style={styles.input}
>
  <option value="">Gender</option>
  <option value="Male">Male</option>
  <option value="Female">Female</option>
</select>

<input
  type="number"
  name="vehicleAge"
  placeholder="Vehicle Age"
  onChange={handleChange}
  style={styles.input}
/>

<select
  name="vehicleType"
  onChange={handleChange}
  style={styles.input}
>
  <option value="">Vehicle Type</option>
  <option value="Sedan">Sedan</option>
  <option value="SUV">SUV</option>
  <option value="Hatchback">Hatchback</option>
  <option value="Truck">Truck</option>
</select>

<input
  type="number"
  name="annualPremium"
  placeholder="Annual Premium"
  onChange={handleChange}
  style={styles.input}
/>

<input
  type="number"
  name="drivingExperience"
  placeholder="Driving Experience (Years)"
  onChange={handleChange}
  style={styles.input}
/>

<input
  type="number"
  name="accidentHistory"
  placeholder="Accident History"
  onChange={handleChange}
  style={styles.input}
/>

<input
  type="number"
  name="claimHistory"
  placeholder="Claim History"
  onChange={handleChange}
  style={styles.input}
/>

<input
  type="number"
  name="creditScore"
  placeholder="Credit Score (300-850)"
  min="300"
  max="850"
  required
  onChange={handleChange}
  style={styles.input}
/>

<input
  type="number"
  name="policyDuration"
  placeholder="Policy Duration (Months)"
  onChange={handleChange}
  style={styles.input}
/>

  </div>
</div>

         {/* Upload Section */}
<div style={styles.section}>
  <h3 style={styles.sectionTitle}>Upload Evidence</h3>

  {/* Accident Car Image */}
  <div style={{ marginBottom: "15px" }}>
    <label><strong>Accident Car Image</strong></label>
    <input
      type="file"
      accept="image/*"
      onChange={(e) => setCarImage(e.target.files[0])}
      required
      style={styles.fileInput}
    />

    {carImage && (
      <img
        src={URL.createObjectURL(carImage)}
        alt="Car Preview"
        style={styles.preview}
      />
    )}
  </div>

  {/* Number Plate Image */}
  <div style={{ marginBottom: "15px" }}>
    <label><strong>Number Plate Image</strong></label>
    <input
      type="file"
      accept="image/*"
      onChange={(e) => setPlateImage(e.target.files[0])}
      required
      style={styles.fileInput}
    />

    {plateImage && (
      <img
        src={URL.createObjectURL(plateImage)}
        alt="Plate Preview"
        style={styles.preview}
      />
    )}
  </div>

  {/* Driving License Image */}
  <div style={{ marginBottom: "15px" }}>
    <label><strong>Driver's License Image</strong></label>
    <input
      type="file"
      accept="image/*"
      onChange={(e) => setLicenseImage(e.target.files[0])}
      required
      style={styles.fileInput}
    />

    {licenseImage && (
      <img
        src={URL.createObjectURL(licenseImage)}
        alt="License Preview"
        style={styles.preview}
      />
    )}
  </div>
</div>

          <button
  type="submit"
  disabled={!formData.policyNumber || !formData.licensePlate || isSubmitting}
  style={{
    ...styles.submitButton,
    backgroundColor:
      !formData.policyNumber || !formData.licensePlate || isSubmitting
        ? "#adb5bd"
        : "#0d6efd",
    cursor:
      !formData.policyNumber || !formData.licensePlate || isSubmitting
        ? "not-allowed"
        : "pointer"
  }}
>
  {isSubmitting ? "Submitting your claim..." : "Submit Claim"}
</button>
        </form>

        
      </div>
    </div>
  );
};

// 🎨 SAME STYLE AS YOUR INSURANCE PAGE
const styles = {
  container: {
    minHeight: '80vh',
    backgroundColor: '#f8f9fa',
    padding: '2rem 0'
  },
  card: {
    maxWidth: '900px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    padding: '2rem'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem'
  },
  subtitle: {
    color: '#6c757d'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  section: {
    padding: '1.5rem',
    border: '1px solid #e9ecef',
    borderRadius: '8px'
  },
  sectionTitle: {
    color: '#0d6efd',
    marginBottom: '1rem'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontWeight: '600',
    color: '#333',
    fontSize: '0.9rem'
  },
  input: {
    padding: '0.75rem',
    border: '2px solid #e9ecef',
    borderRadius: '6px',
    fontSize: '1rem',
    fontFamily: 'inherit'
  },
  fileInput: {
    padding: '0.5rem'
  },
  submitButton: {
    padding: '1rem',
    backgroundColor: '#0d6efd',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600'
  },
  preview: {
    width: '100%',
    marginTop: '10px',
    borderRadius: '8px'
  },
  output: {
    marginTop: '20px',
    padding: '15px',
    background: '#d1e7dd',
    borderRadius: '8px'
  },
  successPage: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    padding: "2rem"
  },
  successBox: {
    maxWidth: "560px",
    width: "100%",
    background: "white",
    border: "1px solid #d1e7dd",
    borderRadius: "8px",
    padding: "2rem",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
  },
  successTitle: {
    color: "#0f5132",
    marginTop: 0
  },
  successText: {
    color: "#495057",
    fontSize: "1.05rem",
    marginBottom: 0
  }
};

export default Predict;
