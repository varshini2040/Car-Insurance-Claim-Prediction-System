// src/pages/InsuranceApplication.js
import React, { useState } from 'react';
import { applyInsurance } from "../services/api.js";

const InsuranceApplication = ({ user }) => {
  const [formData, setFormData] = useState({
    policyNumber: "POL" + Date.now(),
    name: user?.name || '',
email: user?.email || '',
phone: '',
    vehicleType: '',
    vehicleModel: '',
    vehicleYear: '',
    licensePlate: '',
    purchaseDate: '',
    coverageType: 'comprehensive',
     policyDuration:'0',
    previousClaims: '0',
    drivingExperience: '',
    annualMileage: ''
  });
  const [documents, setDocuments] = useState({
    licenseFront: null,
    licenseBack: null,
    vehicleFront: null,
    vehicleBack: null,
    vehicleSide: null,
    
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setDocuments(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  const data = new FormData();

  // Add normal fields
  for (let key in formData) {
    data.append(key, formData[key]);
  }

  // Add uploaded files
  for (let key in documents) {
    if (documents[key]) data.append(key, documents[key]);
  }

  // Add user details  
  data.append("userId", user._id);
  data.append("userEmail", user.email);
  data.append("userName", user.name);
  data.append("userPhoneNumber", formData.phone);

  try {
    const response = await applyInsurance(data);
    
    if (response.data.success) {
      alert("Insurance Application Submitted!");

      // 🔥 UPDATE LOCALSTORAGE WITH POLICY NUMBER AND LICENSE PLATE
      const updatedUser = {
        ...user,
        policyNumber: response.data.policyNumber,
        licensePlate: response.data.licensePlate || formData.licensePlate
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Reset form
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        vehicleType: '',
        vehicleModel: '',
        vehicleYear: '',
        licensePlate: '',
        purchaseDate: '',
        coverageType: 'comprehensive',
        policyDuration:'0',
        previousClaims: '0',
        drivingExperience: '',
        annualMileage: ''
      });

      setDocuments({
        licenseFront: null,
        licenseBack: null,
        vehicleFront: null,
        vehicleBack: null,
        vehicleSide: null,
      });
    }

  } catch (err) {
    alert("Error submitting application");
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            <i className="fas fa-file-contract" style={styles.icon}></i>
            Insurance Application
          </h2>
          <p style={styles.subtitle}>Complete your car insurance application</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Personal Details</h3>
              <div style={styles.formGrid}>
              <div style={styles.formGroup}>
  <label style={styles.label}>Policy Number</label>
  <input
    type="text"
    name="policyNumber"
    value={formData.policyNumber}
    readOnly
    style={styles.input}
  />
</div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                  placeholder="Enter your Name"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email *</label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                  placeholder="Enter your Email"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                  placeholder="Enter your Phone Number"
                />
              </div>
              </div>
              
          
            <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Vehicle Information</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Vehicle Type *</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  required
                  style={styles.select}
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="Swift">Swift</option>
                  <option value="Electric Vehicle">Electric Vehicle</option>
                  <option value="Sedan">Sedan</option>
                  <option value="sportcar">sportcar</option>
                  <option value="Coupe">Coupe</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Vehicle Model *</label>
                <input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                  placeholder="e.g., Toyota Camry"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Vehicle Year *</label>
                <input
                  type="number"
                  name="vehicleYear"
                  value={formData.vehicleYear}
                  onChange={handleInputChange}
                  required
                  min="1990"
                  max="2024"
                  style={styles.input}
                  placeholder="e.g., 2022"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>License Plate *</label>
                <input
                  type="text"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                  placeholder="e.g., ABC123"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Purchase Date</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </div>
              </div>

              
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Policy</h3>
            <div style={styles.formGrid}>
             <div style={styles.formGroup}>
                <label style={styles.label}>Coverage Type *</label>
                <select
                  name="coverageType"
                  value={formData.coverageType}
                  onChange={handleInputChange}
                  required
                  style={styles.select}
                >
                  <option value="comprehensive">Comprehensive</option>
                  <option value="thirdParty">Third Party</option>
                  <option value="liability">Liability Only</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Policy Duration</label>
                <select
                  name="policyDuration"
                  value={formData.policyDuration}
                  onChange={handleInputChange}
                  style={styles.select}
                >
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3+</option>
                </select>
              </div>

              
            </div>
          </div>


          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Driver Information</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Previous Claims</label>
                <select
                  name="previousClaims"
                  value={formData.previousClaims}
                  onChange={handleInputChange}
                  style={styles.select}
                >
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3+</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Driving Experience (Years) *</label>
                <input
                  type="number"
                  name="drivingExperience"
                  value={formData.drivingExperience}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="60"
                  style={styles.input}
                  placeholder="e.g., 5"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Annual Mileage (km) *</label>
                <input
                  type="number"
                  name="annualMileage"
                  value={formData.annualMileage}
                  onChange={handleInputChange}
                  required
                  min="1000"
                  style={styles.input}
                  placeholder="e.g., 15000"
                />
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Required Documents</h3>
            <div style={styles.documentsGrid}>
              <div style={styles.documentGroup}>
                <label style={styles.label}>Driver's License (Front) *</label>
                <input
                  type="file"
                  name="licenseFront"
                  onChange={handleFileChange}
                  accept="image/*"
                  required
                  style={styles.fileInput}
                />
                <small style={styles.helpText}>JPG, PNG, PDF (Max 5MB)</small>
              </div>

              <div style={styles.documentGroup}>
                <label style={styles.label}>Driver's License (Back) *</label>
                <input
                  type="file"
                  name="licenseBack"
                  onChange={handleFileChange}
                  accept="image/*"
                
                  style={styles.fileInput}
                />
                <small style={styles.helpText}>JPG, PNG, PDF (Max 5MB)</small>
              </div>

              <div style={styles.documentGroup}>
                <label style={styles.label}>Vehicle Front Photo *</label>
                <input
                  type="file"
                  name="vehicleFront"
                  onChange={handleFileChange}
                  accept="image/*"
                   required
                  style={styles.fileInput}
                />
                <small style={styles.helpText}>JPG, PNG (Max 5MB)</small>
              </div>

              <div style={styles.documentGroup}>
                <label style={styles.label}>Vehicle Back Photo *</label>
                <input
                  type="file"
                  name="vehicleBack"
                  onChange={handleFileChange}
                  accept="image/*"
                  required
                  style={styles.fileInput}
                />
                <small style={styles.helpText}>JPG, PNG (Max 5MB)</small>
              </div>

              <div style={styles.documentGroup}>
                <label style={styles.label}>Vehicle Side Photo</label>
                <input
                  type="file"
                  name="vehicleSide"
                  onChange={handleFileChange}
                  accept="image/*"
                  style={styles.fileInput}
                />
                <small style={styles.helpText}>JPG, PNG (Max 5MB)</small>
              </div>

              
            </div>
          </div>

          <button
            type="submit"
            style={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Submitting Application...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                Submit Application
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '80vh',
    backgroundColor: '#f8f9fa',
    padding: '2rem 0'
  },
  card: {
    maxWidth: '1000px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '2rem'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  subtitle: {
    color: '#6c757d',
    margin: 0
  },
  icon: {
    marginRight: '0.5rem'
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
    fontSize: '1.3rem',
    marginBottom: '1rem',
    color: '#0d6efd'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem'
  },
  documentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  documentGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#212529'
  },
  input: {
    padding: '0.75rem',
    border: '2px solid #e9ecef',
    borderRadius: '6px',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease'
  },
  select: {
    padding: '0.75rem',
    border: '2px solid #e9ecef',
    borderRadius: '6px',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease'
  },
  fileInput: {
    padding: '0.5rem',
    border: '2px dashed #e9ecef',
    borderRadius: '6px',
    fontSize: '1rem'
  },
  helpText: {
    color: '#6c757d',
    fontSize: '0.875rem',
    marginTop: '0.25rem'
  },
  submitButton: {
    padding: '1rem 2rem',
    backgroundColor: '#0d6efd',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.3s ease',
    marginTop: '1rem'
  }
};

export default InsuranceApplication;