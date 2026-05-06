import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";

import { authService } from "../services/authService";
import "./UserDetails.css";

const UserDetails = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // All fields stored in ref
  const formDataRef = useRef({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",

    vehicleType: "",
    vehicleModel: "",
    vehicleYear: "",
    licensePlate: "",
    vehicleValue: "",

    policyNumber: "",
    policyType: "",
    coverageAmount: "",
    premiumAmount: "",
    policyStartDate: "",
    policyEndDate: "",

    accidentDate: "",
    accidentDescription: "",
    damageAmount: "",
    claimStatus: "",
  });

  // -------------------------------------------------------------
  // LOAD USER PROFILE FROM BACKEND
  // -------------------------------------------------------------
const { id } = useParams();

useEffect(() => {
  const fetchUserDetails = async () => {
    try {
      const res = await authService.getUserById(id);
      
      if (res.success && res.user) {
        setCurrentUser(res.user);

        Object.keys(formDataRef.current).forEach((key) => {
          formDataRef.current[key] = res.user[key] || "";
        });
      } else {
        console.error("Failed to fetch user:", res.message);
        alert("Failed to load user details");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      alert("Error loading user details");
    }
  };

  if (id) {
    fetchUserDetails();
  }
}, [id]);

  // -------------------------------------------------------------
  // HANDLE INPUT
  // -------------------------------------------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    formDataRef.current[name] = value;
  };

  // -------------------------------------------------------------
  // SAVE UPDATED PROFILE TO MONGODB
  // -------------------------------------------------------------
  const handleSave = async () => {
    try {
      const result = await authService.adminUpdateUser(id, formDataRef.current);

      if (result.success) {
        alert("✅ Profile updated successfully!");
        setCurrentUser(result.updated);
        setIsEditing(false);
      } else {
        alert("❌ Update failed: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("❌ Error saving profile: " + error.message);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    if (currentUser) {
      Object.keys(formDataRef.current).forEach((key) => {
        formDataRef.current[key] = currentUser[key] || "";
      });
    }
    setIsEditing(false);
  };

  const handleBack = () => {
    window.history.back();
  };

  // ---------------------------------------------------------------------
  // TABS COMPONENTS
  // ---------------------------------------------------------------------

  // PERSONAL DETAILS TAB
  const PersonalDetails = () => (
    <div className="form-section">
      <div className="section-header">
        <span className="section-icon">🚗</span>
        <h3>Personal Details</h3>
      </div>

      <div className="form-grid">
        <div className="input-group">
          <label>Full Name *</label>
          <input
            name="fullName"
            defaultValue={formDataRef.current.fullName}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label>Email *</label>
          <input
            name="email"
            defaultValue={formDataRef.current.email}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label>Phone *</label>
          <input
            name="phone"
            defaultValue={formDataRef.current.phone}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label>Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            defaultValue={formDataRef.current.dateOfBirth}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group full-width">
          <label>Address</label>
          <textarea
            name="address"
            defaultValue={formDataRef.current.address}
            onChange={handleInputChange}
            rows="3"
            readOnly={!isEditing}
          />
        </div>
      </div>
    </div>
  );

  // VEHICLE DETAILS TAB
  const VehicleDetails = () => (
    <div className="form-section">
      <div className="section-header">
        <span className="section-icon">🛞</span>
        <h3>Vehicle Details</h3>
      </div>

      <div className="form-grid">
        <div className="input-group">
          <label>Vehicle Type</label>
          <select
            name="vehicleType"
            defaultValue={formDataRef.current.vehicleType}
            onChange={handleInputChange}
            disabled={!isEditing}
          >
            <option>Car</option>
            <option>Swift</option>
            <option>SUV</option>
            <option>Sedan</option>
            <option>Electric Car</option>
            <option>Sports Car</option>
          </select>
        </div>

        <div className="input-group">
          <label>Vehicle Model *</label>
          <input
            name="vehicleModel"
            defaultValue={formDataRef.current.vehicleModel}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label>Manufacturing Year</label>
          <input
            type="number"
            name="vehicleYear"
            defaultValue={formDataRef.current.vehicleYear}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label>License Plate</label>
          <input
            name="licensePlate"
            defaultValue={formDataRef.current.licensePlate}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label>Vehicle Value</label>
          <input
            type="number"
            name="vehicleValue"
            defaultValue={formDataRef.current.vehicleValue}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>
      </div>
    </div>
  );

  // POLICY DETAILS TAB
  const PolicyDetails = () => (
    <div className="form-section">
      <div className="section-header">
        <span className="section-icon">📄</span>
        <h3>Policy Details</h3>
      </div>

      <div className="form-grid">
        <div className="input-group">
          <label>Policy Number *</label>
          <input
            name="policyNumber"
            defaultValue={formDataRef.current.policyNumber}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label>Policy Type</label>
          <select
            name="policyType"
            defaultValue={formDataRef.current.policyType}
            onChange={handleInputChange}
            disabled={!isEditing}
          >
            <option>Comprehensive</option>
            <option>Third Party</option>
            <option>Liability</option>
            <option>Collision</option>
          </select>
        </div>

        <div className="input-group">
          <label>Coverage Amount</label>
          <input
            type="number"
            name="coverageAmount"
            defaultValue={formDataRef.current.coverageAmount}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label>Premium Amount</label>
          <input
            type="number"
            name="premiumAmount"
            defaultValue={formDataRef.current.premiumAmount}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label>Policy Start Date</label>
          <input
            type="date"
            name="policyStartDate"
            defaultValue={formDataRef.current.policyStartDate}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label>Policy End Date</label>
          <input
            type="date"
            name="policyEndDate"
            defaultValue={formDataRef.current.policyEndDate}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>
      </div>
    </div>
  );

  // ACCIDENT HISTORY
  const AccidentHistory = () => (
    <div className="form-section">
      <div className="section-header">
        <span className="section-icon">💥</span>
        <h3>Accident History</h3>
      </div>

      <div className="form-grid">
        <div className="input-group">
          <label>Accident Date</label>
          <input
            type="date"
            name="accidentDate"
            defaultValue={formDataRef.current.accidentDate}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group full-width">
          <label>Description</label>
          <textarea
            name="accidentDescription"
            defaultValue={formDataRef.current.accidentDescription}
            onChange={handleInputChange}
            rows="4"
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label>Damage Amount</label>
          <input
            type="number"
            name="damageAmount"
            defaultValue={formDataRef.current.damageAmount}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label>Claim Status</label>
          <select
            name="claimStatus"
            defaultValue={formDataRef.current.claimStatus}
            onChange={handleInputChange}
            disabled={!isEditing}
          >
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Settled</option>
          </select>
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------
  // MAIN UI
  // ---------------------------------------------------------------------
  return (
    <div className="user-details-fullpage">
      <div className="user-details-header">
        <button className="back-btn" onClick={handleBack}>
          ← Back to Dashboard
        </button>

        <div className="header-content">
          <h1>User Profile Management</h1>
          <p>
            {currentUser
              ? `Viewing profile for ${currentUser.fullName || currentUser.name}`
              : "Loading user details..."}
          </p>
        </div>

        <div className="header-actions">
          {!isEditing && (
            <button type="button" className="edit-btn" onClick={handleEdit}>
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="user-details-content">
        {/* TABS */}
        <div className="tabs-navigation">
          <button
            className={`tab-btn ${activeTab === "personal" ? "active" : ""}`}
            onClick={() => setActiveTab("personal")}
          >
            🚗 Personal Details
          </button>

          <button
            className={`tab-btn ${activeTab === "vehicle" ? "active" : ""}`}
            onClick={() => setActiveTab("vehicle")}
          >
            🛞 Vehicle Details
          </button>

          <button
            className={`tab-btn ${activeTab === "policy" ? "active" : ""}`}
            onClick={() => setActiveTab("policy")}
          >
            📄 Policy Details
          </button>

          <button
            className={`tab-btn ${activeTab === "accident" ? "active" : ""}`}
            onClick={() => setActiveTab("accident")}
          >
            💥 Accident History
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="tab-content">
          {activeTab === "personal" && <PersonalDetails />}
          {activeTab === "vehicle" && <VehicleDetails />}
          {activeTab === "policy" && <PolicyDetails />}
          {activeTab === "accident" && <AccidentHistory />}

          {/* ACTION BUTTONS */}
          <div className="form-actions">
            {isEditing ? (
              <>
                <button className="save-btn" onClick={handleSave}>
                  Save Changes
                </button>
                <button className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </>
            ) : (
              <button className="cancel-btn" onClick={handleBack}>
                Back to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
