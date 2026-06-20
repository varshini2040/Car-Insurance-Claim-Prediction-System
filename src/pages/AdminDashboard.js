import React, { useEffect, useState } from "react";
import axios from "axios";
import { getStatusStats, normalizeStatus } from "../utils/status";

const percent = (value) =>
  Number.isFinite(Number(value)) ? `${Number(value).toFixed(2)}%` : "Unavailable";

const claimCustomerName = (claim) =>
  claim?.userName || claim?.userId?.name || "Unavailable";

const claimCustomerEmail = (claim) =>
  claim?.userEmail || claim?.userId?.email || "Unavailable";

const normalizeClaim = (claim = {}) => ({
  ...claim,
  userName: claimCustomerName(claim),
  userEmail: claimCustomerEmail(claim),
});

const AdminDashboard = () => {
  const [insuranceApps, setInsuranceApps] = useState([]);
  const [claims, setClaims] = useState([]);

  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [insuranceResult, setInsuranceResult] = useState(null);
  const [claimResult, setClaimResult] = useState(null);
  const [openingClaimId, setOpeningClaimId] = useState(null);
  const [detectingClaimId, setDetectingClaimId] = useState(null);

  
  // ============================
  // LOAD DATA FROM MONGODB
  // ============================
  useEffect(() => {
    loadInsurance();
    loadClaims();
  }, []);

  const loadInsurance = async () => {
    const res = await axios.get("http://localhost:5000/api/insurance/all");
    setInsuranceApps(res.data);
  };

  const loadClaims = async () => {
    const res = await axios.get("http://localhost:5000/api/claims/all");
    setClaims(res.data.map(normalizeClaim));
  };

  const openClaim = async (claim) => {
    if (!claim?._id) return;

    setOpeningClaimId(claim._id);
    setClaimResult(null);

    try {
      const res = await axios.get(`http://localhost:5000/api/claims/${claim._id}`);
      const latestClaim = normalizeClaim(res.data?.claim || res.data || claim);
      setSelectedClaim(latestClaim);
      setClaims((current) =>
        current.map((item) => (item._id === latestClaim._id ? latestClaim : item))
      );
    } catch (err) {
      console.log("Open claim error:", err.response?.data || err.message);
      setSelectedClaim(normalizeClaim(claim));
      alert(err.response?.data?.message || "Could not load latest claim details");
    } finally {
      setOpeningClaimId(null);
    }
  };

  // ============================
  // UPDATE STATUS
  // ============================
  const updateInsuranceStatus = async (id, status) => {
    await axios.put(`http://localhost:5000/api/insurance/update/${id}`, {
      status,
    });
    loadInsurance();
    setSelectedInsurance(null);
  };

  const updateClaimStatus = async (id, status) => {
    await axios.put(`http://localhost:5000/api/claims/update/${id}`, {
      status,
    });
    loadClaims();
    setSelectedClaim(null);
  };
// Detect Insurance
const predictInsurance = (app) => {
  const mileage = Number(app.annualMileage || 0);
  const claims = Number(app.previousClaims || 0);

  if (mileage > 20000 || claims > 2) {
    setInsuranceResult("High Risk");
  } else {
    setInsuranceResult("Low Risk");
  }
};

// Detect Claim - ML INTEGRATED
const detectClaim = async (claim) => {
  if (!claim?._id) return;

  // Clear previous report/result
  setClaimResult(null);
  setDetectingClaimId(claim._id);

  try {
    const res = await axios.post(
      `http://localhost:5000/api/claims/${claim._id}/detect`
    );

    // Admin should see full detection data only after clicking Detect.
    // Store the ML response subset needed for rendering.
    const report = res.data?.detectionReport || {};
    const updatedClaim = res.data?.claim;
    setClaimResult({
      fraud: report.fraud_detection || {},
      verification: report.image_verification || {},
      plateOcr: report.plate_ocr || updatedClaim?.plateOcr || {},
      licenseOcr: report.license_ocr || updatedClaim?.licenseOcr || {},
      decision: report.final_decision || {},
      referenceImages: report.reference_images || {},
      claimSummary: report.policy_holder || {},
      fileWarnings: report.file_warnings || [],
    });
    if (updatedClaim) {
      setSelectedClaim((current) => normalizeClaim({ ...current, ...updatedClaim }));
      setClaims((current) =>
        current.map((item) =>
          item._id === updatedClaim._id ? normalizeClaim({ ...item, ...updatedClaim }) : item
        )
      );
    }
  } catch (err) {
    console.log("Detect claim error:", err.response?.data || err.message);
    alert(err.response?.data?.message || "Detection failed");
  } finally {
    setDetectingClaimId(null);
  }
};


  // ============================
  // STATS
  // ============================
  const insuranceStats = getStatusStats(insuranceApps);
  const claimStats = getStatusStats(claims);

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <h1 style={styles.mainTitle}>Admin Dashboard</h1>
      <p style={styles.subtitle}>
        Manage Applied Insurance & Claim Submissions
      </p>

      {/* ============================
          INSURANCE APPLICATIONS
      ============================ */}
      <h2 style={styles.sectionTitle}>📌 Applied Insurance Applications</h2>

      <div style={styles.statsRow}>
        <StatCard title="Total" value={insuranceStats.total} />
        <StatCard title="Approved" value={insuranceStats.approved} />
        <StatCard title="Pending" value={insuranceStats.pending} />
        <StatCard title="Rejected" value={insuranceStats.rejected} />
        
      </div>

<table style={styles.table}>
  <thead>
    <tr>
      <th style={styles.th}>Policy No</th>
      <th style={styles.th}>User</th>
      <th style={styles.th}>Vehicle Model</th>
      <th style={styles.th}>License Plate</th>
      <th style={styles.th}>Status</th>
      <th style={styles.th}>Action</th>
    </tr>
  </thead>

  <tbody>
    {insuranceApps.map((app) => (
      <tr key={app._id}>
        <td style={styles.td}>{app.policyNumber}</td>

        <td style={styles.td}>
          <b>{app.userName}</b><br />
          <span style={{ color: "gray", fontSize: "12px" }}>
            {app.userEmail}
          </span>
        </td>

        <td style={styles.td}>
          {app.vehicleYear} {app.vehicleModel}
        </td>

        <td style={styles.td}>
          {app.licensePlate || "N/A"}
        </td>

        <td style={styles.td}>
          <span style={styles.status(app.status)}>
            {app.status}
          </span>
        </td>

        <td style={styles.td}>
          <button
            style={styles.viewBtn}
            onClick={() => {
              setSelectedInsurance(app);
              setInsuranceResult(null); // Clear previous result
            }}
          >
            View
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

      {/* ============================
          CLAIM SUBMISSIONS
      ============================ */}
      <h2 style={styles.sectionTitle}>🚗 Claim Submissions</h2>

      <div style={styles.statsRow}>
        <StatCard title="Total" value={claimStats.total} />
        <StatCard title="Approved" value={claimStats.approved} />
        <StatCard title="Pending" value={claimStats.pending} />
        <StatCard title="Rejected" value={claimStats.rejected} />
        
      </div>

      <table style={styles.table}>
  <thead>
    <tr>
      <th style={styles.th}>Policy No</th>
      <th style={styles.th}>User</th>
      <th style={styles.th}>License Plate</th>
      <th style={styles.th}>Status</th>
      <th style={styles.th}>Action</th>
    </tr>
  </thead>

  <tbody>
    {claims.map((c) => (
      <tr key={c._id}>
        <td style={styles.td}>{c.policyNumber}</td>

        <td style={styles.td}>
          <b>{claimCustomerName(c)}</b><br />
          <span style={{ color: "gray", fontSize: "12px" }}>
            {claimCustomerEmail(c)}
          </span>
        </td>

       <td style={styles.td}>
          {c.licensePlate || "N/A"}
        </td>

        <td style={styles.td}>
          <span style={styles.status(c.status)}>
            {c.status}
          </span>
        </td>

        <td>
                <button
                  style={styles.viewBtn}
                  onClick={() => openClaim(c)}
                  disabled={openingClaimId === c._id}
                >
                  {openingClaimId === c._id ? "Loading..." : "👁 View"}
                </button>
              </td>
      </tr>
    ))}
  </tbody>
</table>

      {/* ============================
          INSURANCE VIEW MODAL FULL
      ============================ */}
      {selectedInsurance && (
        <Modal close={() => setSelectedInsurance(null)}>
          <h2>Application Details</h2>

          <div style={styles.grid}>
            <Box title="User Information">
              <p><b>Policy Number:</b> {selectedInsurance.policyNumber}</p>
              <p>
                <b>Name:</b> {selectedInsurance.userName}
              </p>
              <p>
                <b>Email:</b> {selectedInsurance.userEmail}
              </p>
              <p><b>Phone Number:</b> {selectedInsurance.userPhoneNumber}</p>
             

            </Box>

            <Box title="Vehicle Information">
               <p>
                <b>Plate:</b> {selectedInsurance.licensePlate}
              </p>
              <p>
                <b>Type:</b> {selectedInsurance.vehicleType}
              </p>
              <p>
                <b>Model:</b> {selectedInsurance.vehicleModel}
              </p>
              <p>
                <b>Year:</b> {selectedInsurance.vehicleYear}
              </p>
              
              
            </Box>

            <Box title="Insurance Details">
              <p>
                <b>Coverage:</b> {selectedInsurance.coverageType}
              </p>
              <p>
                <b>Policy Duration:</b> {selectedInsurance.policyDuration}
              </p>
              <p>
                <b>Previous Claims:</b> {selectedInsurance.previousClaims}
              </p>
              <p>
                <b>Driving Exp:</b> {selectedInsurance.drivingExperience} yrs
              </p>
              <p>
                <b>Mileage:</b> {selectedInsurance.annualMileage} km
              </p>
            </Box>

            <Box title="Status">
              <span style={styles.status(selectedInsurance.status)}>
                {selectedInsurance.status}
              </span>
            </Box>
</div>

          {/* ✅ Uploaded Images Section */}
          <h3 style={{ marginTop: "20px" }}>Uploaded Photos</h3>

          <div style={styles.imageGrid}>
            {showImage("License Front", selectedInsurance.licenseFront)}
            {showImage("License Back", selectedInsurance.licenseBack)}
            {showImage("Vehicle Front", selectedInsurance.vehicleFront)}
            {showImage("Vehicle Back", selectedInsurance.vehicleBack)}
            {showImage("Vehicle Side", selectedInsurance.vehicleSide)}
            {showImage("Vehicle Number Plate", selectedInsurance.vehicleNumberPlate)}
          </div>

          {insuranceResult && (
  <div style={resultStyles.card}>
    <div
      style={{
        ...resultStyles.top,
        background:
          insuranceResult === "Low Risk" ? "#4CAF50" : "#C62828",
      }}
    >
      <div style={resultStyles.icon}>
        {insuranceResult === "Low Risk" ? "✔" : "⚠"}
      </div>
      <h2>
        {insuranceResult === "Low Risk" ? "Approved" : "Fraudulent"}
      </h2>
      <p>
        {insuranceResult === "Low Risk"
          ? "This claim is considered low risk"
          : "This claim is considered high risk"}
      </p>
    </div>

    <div style={resultStyles.middle}>
      <h3>Customer: {selectedInsurance.userName}</h3>
      <p>
        Vehicle: {selectedInsurance.vehicleYear}{" "}
        {selectedInsurance.vehicleModel}
      </p>
    </div>

    <div
      style={{
        ...resultStyles.bottom,
        background:
          insuranceResult === "Low Risk" ? "#dcedc8" : "#ffcdd2",
      }}
    >
      {insuranceResult === "Low Risk"
        ? "Process the Claim"
        : "Investigate the Claim Carefully"}
    </div>
  </div>
)}


          

          {/* Approve Reject */}
          <div style={styles.modalActions}>
          
           
            <button
              style={styles.approveBtn}
              onClick={() =>
                updateInsuranceStatus(selectedInsurance._id, "approved")
              }
            >
              Approve
            </button>

            <button
              style={styles.rejectBtn}
              onClick={() =>
                updateInsuranceStatus(selectedInsurance._id, "rejected")
              }
            >
              Reject
            </button>
<button
    style={styles.closeActionBtn}
    onClick={() => setSelectedInsurance(null)}
  >
    Close
  </button>
              
          </div>
        </Modal>
      )}

      {/* ============================
          CLAIM VIEW MODAL SIMPLE
      ============================ */}
      {selectedClaim && (
        <Modal close={() => setSelectedClaim(null)}>
          <h2>Claim Details</h2>

          <h3 style={styles.modalSectionTitle}>Customer Information</h3>
          <p><b>Customer Name:</b> {claimCustomerName(selectedClaim)}</p>
          <p><b>Customer Email:</b> {claimCustomerEmail(selectedClaim)}</p>
          <p><b>Policy Number:</b> {selectedClaim.policyNumber}</p>
          

          <h3 style={styles.modalSectionTitle}>Claim Information</h3>

<p><b>Age:</b> {selectedClaim.age}</p>
<p><b>Gender:</b> {selectedClaim.gender}</p>

<p><b>Vehicle Age:</b> {selectedClaim.vehicleAge} Years</p>
<p><b>Vehicle Type:</b> {selectedClaim.vehicleType}</p>

<p><b>Annual Premium:</b> ₹{selectedClaim.annualPremium}</p>

<p><b>Driving Experience:</b> {selectedClaim.drivingExperience} Years</p>

<p><b>Accident History:</b> {selectedClaim.accidentHistory}</p>

<p><b>Claim History:</b> {selectedClaim.claimHistory}</p>

<p><b>Credit Score:</b> {selectedClaim.creditScore}</p>

<p><b>Policy Duration:</b> {selectedClaim.policyDuration} Months</p>

<p><b>Accident Date:</b> {selectedClaim.accidentDate}</p>
<p><b>Accident Location:</b> {selectedClaim.accidentLocation}</p>
<p><b>Damage Type:</b> {selectedClaim.damageType}</p>
<p><b>Driver at Fault:</b> {selectedClaim.driverAtFault}</p>
<p><b>Weather:</b> {selectedClaim.weather}</p>
<p><b>Describe Accident:</b> {selectedClaim.describeAccident}</p>

<p><b>Estimated Cost:</b> ₹{selectedClaim.estimatedCost}</p>
<p><b>Claim Amount:</b> ₹{selectedClaim.claimAmount}</p>


<p><b>Status:</b> {selectedClaim.status}</p>
          
{/* Accident Car Image */}
{selectedClaim.carImage && (
  <div style={{ textAlign: "center", marginBottom: "20px" }}>
    <h3>Accident Car Image</h3>
    <img
      src={`http://localhost:5000/uploads/${selectedClaim.carImage}`}
      alt="Car"
      style={{ width: "250px", borderRadius: "10px" }}
    />
  </div>
)}

{/* Number Plate Image */}
{selectedClaim.plateImage && (
  <div style={{ textAlign: "center", marginBottom: "20px" }}>
    <h3>Number Plate Image</h3>
    <img
      src={`http://localhost:5000/uploads/${selectedClaim.plateImage}`}
      alt="Plate"
      style={{ width: "250px", borderRadius: "10px" }}
    />
  </div>
)}

{/* Driving License Image */}
{selectedClaim.licenseImage && (
  <div style={{ textAlign: "center", marginBottom: "20px" }}>
    <h3>Driving License Image</h3>
    <img
      src={`http://localhost:5000/uploads/${selectedClaim.licenseImage}`}
      alt="License"
      style={{ width: "250px", borderRadius: "10px" }}
    />
  </div>
)}
      
{claimResult && (
  <ClaimDetectionResultCard claim={selectedClaim} result={claimResult} />
)}
{detectingClaimId === selectedClaim._id && (
  <div style={styles.detectingNotice}>
    <div style={styles.spinner} />
    <div>
      <b>Detecting claim...</b>
      <p style={styles.detectingText}>
        Fraud analysis and image verification are running. This can take a few seconds.
      </p>
    </div>
  </div>
)}
          {/* Approve Reject */}
          <div style={styles.modalActions}>
            <button
  style={{
    ...styles.predictBtn,
    ...(detectingClaimId === selectedClaim._id ? styles.disabledBtn : {}),
  }}
  onClick={() => detectClaim(selectedClaim)}
  disabled={detectingClaimId === selectedClaim._id}
>
  {detectingClaimId === selectedClaim._id ? "Detecting..." : "Detect"}
</button>
           
            <button
              style={styles.approveBtn}
              onClick={() => updateClaimStatus(selectedClaim._id, "Approved")}
            >
              Approve
            </button>

            <button
              style={styles.rejectBtn}
              onClick={() => updateClaimStatus(selectedClaim._id, "Rejected")}
            >
              Reject
            </button>   
            <button
    style={styles.closeActionBtn}
    onClick={() => setSelectedClaim(null)}
  >
    Close
  </button>         
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ============================
   IMAGE FUNCTION
============================ */
const showImage = (label, file) => {
  if (!file) return null;
  return (
    <div style={styles.imageBox}>
      <p>{label}</p>
      <img
        src={`http://localhost:5000/uploads/${file}`}
        alt={label}
        style={styles.img}
      />
    </div>
  );
};

/* ============================
   SMALL COMPONENTS
============================ */
const StatCard = ({ title, value }) => (
  <div style={styles.statCard}>
    <h2>{value}</h2>
    <p>{title}</p>
  </div>
);

const Modal = ({ children, close }) => (
  <div style={styles.overlay}>
    <div style={styles.modalBox}>
      <button style={styles.closeBtn} onClick={close}>
        ✖
      </button>
      {children}
    </div>
  </div>
);

const Box = ({ title, children }) => (
  <div style={styles.detailBox}>
    <h3 style={{ color: "#0d6efd" }}>{title}</h3>
    {children}
  </div>
);

const resultValue = (value) =>
  value === undefined || value === null || value === "" ? "Unavailable" : value;

const matchText = (match) =>
  match === undefined || match === null ? "Unavailable" : match ? "Match" : "Mismatch";

const vehicleConditionNote = (vehicle = {}) => {
  if (vehicle.match === false) {
    return "Different vehicle detected";
  }

  const similarity = Number(vehicle.similarity);
  const visualSimilarity = Number(vehicle.visual_similarity);
  const hasLowerVisualScore =
    Number.isFinite(visualSimilarity)
      ? visualSimilarity < 75
      : Number.isFinite(similarity) && similarity < 75;

  if (vehicle.match && (vehicle.plate_identity_confirmed || hasLowerVisualScore)) {
    return "Same vehicle, damaged condition detected";
  }

  return null;
};

const joinMessages = (messages = []) =>
  Array.isArray(messages) && messages.length ? messages.join("; ") : null;

const ResultRow = ({ label, value }) => (
  <div style={claimResultStyles.row}>
    <span style={claimResultStyles.label}>{label}</span>
    <span style={claimResultStyles.value}>{resultValue(value)}</span>
  </div>
);

const ResultSection = ({ title, children }) => (
  <section style={claimResultStyles.section}>
    <h3 style={claimResultStyles.sectionTitle}>{title}</h3>
    {children}
  </section>
);

const ResultImage = ({ label, file }) => {
  if (!file) return null;

  return (
    <div style={claimResultStyles.imageBox}>
      <span style={claimResultStyles.imageLabel}>{label}</span>
      <img
        src={`http://localhost:5000/uploads/${file}`}
        alt={label}
        style={claimResultStyles.image}
      />
    </div>
  );
};

const ClaimDetectionResultCard = ({ claim, result }) => {
  const fraudLabel =
    result.fraud?.prediction_label === "Fraud" ? "Fraud Claim" : "Genuine Claim";
  const claimSummary = result.claimSummary || {};
  const detectedPlate =
    result.plateOcr?.detected_plate ?? result.plateOcr?.detectedPlate;
  const insuredPlate =
    claimSummary.insurance_plate ??
    result.plateOcr?.insured_plate ??
    result.plateOcr?.insuredPlate;
  const plateMatch =
    result.plateOcr?.match_percentage ?? result.plateOcr?.matchPercentage;
  const licenseOcr = result.licenseOcr || {};
  const licenseMatch =
    licenseOcr.match_percentage ?? licenseOcr.matchPercentage;
  const referenceImages = result.referenceImages || {};
  const vehicle = result.verification?.vehicle || {};
  const vehicleNote = vehicleConditionNote(vehicle);
  const submittedClaimPlate =
    claimSummary.claim_license_plate ||
    result.plateOcr?.submitted_claim_plate ||
    result.plateOcr?.submittedClaimPlate ||
    claim?.licensePlate;
  const plateMismatch = joinMessages(
    result.verification?.plate?.mismatch_reasons ||
      result.plateOcr?.mismatch_reasons ||
      result.plateOcr?.mismatchReasons
  );
  const fileWarnings = joinMessages(result.fileWarnings);

  return (
    <div style={claimResultStyles.wrap}>
      <div style={claimResultStyles.card}>
        <h1 style={claimResultStyles.title}>Claim detection completed</h1>
        <p style={claimResultStyles.subtitle}>
          Image verification and fraud analysis were generated for this claim.
        </p>

        <ResultSection title="Claim Summary">
          <ResultRow label="Customer Name" value={claimSummary.name || claimCustomerName(claim)} />
          <ResultRow label="Policy Number" value={claimSummary.policy_number || claim?.policyNumber} />
          <ResultRow label="Claim Amount" value={claimSummary.claim_amount || claim?.claimAmount} />
          <ResultRow label="Claim Vehicle Number" value={submittedClaimPlate} />
          <ResultRow label="Policy Vehicle Number" value={insuredPlate} />
        </ResultSection>

        <ResultSection title="🤖 Fraud Detection">
          <ResultRow label="Fraud Probability" value={percent(result.fraud?.fraud_probability)} />
          <ResultRow label="Prediction" value={fraudLabel} />
          <ResultRow label="Risk Level" value={result.fraud?.risk_level} />
        </ResultSection>

        <ResultSection title="🚗 Vehicle Verification">
          <div style={claimResultStyles.imageGrid}>
            <ResultImage
              label="Insurance Vehicle Image"
              file={
                referenceImages.insurance_vehicle_front ||
                referenceImages.insurance_vehicle ||
                referenceImages.insurance_vehicle_back ||
                referenceImages.insurance_vehicle_side
              }
            />
            <ResultImage label="Claim Vehicle Image" file={referenceImages.claim_vehicle} />
          </div>
          <ResultRow label="Similarity" value={percent(vehicle.similarity)} />
          <ResultRow label="Visual Similarity" value={percent(vehicle.visual_similarity)} />
          <ResultRow label="Result" value={matchText(vehicle.match)} />
          {vehicleNote && <ResultRow label="Note" value={vehicleNote} />}
        </ResultSection>

        <ResultSection title="🔢 Number Plate Verification">
          <div style={claimResultStyles.imageGrid}>
            <ResultImage label="Insurance Plate Image" file={referenceImages.insurance_plate} />
            <ResultImage label="Claim Plate Image" file={referenceImages.claim_plate} />
          </div>
          <ResultRow label="Similarity" value={percent(result.verification?.plate?.similarity)} />
          <ResultRow
            label="Visual Similarity"
            value={percent(result.verification?.plate?.visual_similarity)}
          />
          <ResultRow label="Result" value={matchText(result.verification?.plate?.match)} />
          <ResultRow label="Insurance Plate Number" value={insuredPlate} />
          <ResultRow label="Submitted Claim Plate" value={submittedClaimPlate} />
          <ResultRow label="Detected Claim Plate Number" value={detectedPlate} />
          <ResultRow label="Plate Match" value={percent(plateMatch)} />
          {plateMismatch && <ResultRow label="Mismatch Reason" value={plateMismatch} />}
          {fileWarnings && <ResultRow label="File Warning" value={fileWarnings} />}
        </ResultSection>

        <ResultSection title="🪪 Driver License Verification">
          <div style={claimResultStyles.imageGrid}>
            <ResultImage label="Insurance License Image" file={referenceImages.insurance_license} />
            <ResultImage label="Claim License Image" file={referenceImages.claim_license} />
          </div>
          <ResultRow label="Similarity" value={percent(result.verification?.license?.similarity)} />
          <ResultRow
            label="Visual Similarity"
            value={percent(result.verification?.license?.visual_similarity)}
          />
          <ResultRow
            label="License Verification Result"
            value={matchText(result.verification?.license?.match)}
          />
          <ResultRow
            label="Insurance License Number"
            value={licenseOcr.insured_license || licenseOcr.insuredLicense}
          />
          <ResultRow
            label="Detected Claim License Number"
            value={licenseOcr.detected_license || licenseOcr.detectedLicense}
          />
          <ResultRow label="License OCR Match" value={percent(licenseMatch)} />
        </ResultSection>

        <section style={claimResultStyles.decision}>
          <h3 style={claimResultStyles.sectionTitle}>🎯 Final Decision</h3>
          <ResultRow
            label="Overall Risk Score"
            value={percent(result.decision?.overall_risk_score)}
          />
          <ResultRow label="Final Status" value={result.decision?.final_status} />
          <ResultRow
            label="Recommended Action"
            value={result.decision?.recommended_action}
          />
        </section>
      </div>
    </div>
  );
};

/* ============================
   STYLES
============================ */
const styles = {
  page: { padding: "2rem", background: "#f8f9fa" },
  mainTitle: { textAlign: "center", fontSize: "2.5rem", color: "#0d6efd" },
  subtitle: { textAlign: "center", marginBottom: "2rem" },

  sectionTitle: { marginTop: "2rem" },

statsRow: {
  display: "flex",
  gap: "15px",
  marginBottom: "20px",
},

  statCard: {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  textAlign: "center",
  flex: 1,
},

table: {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px"
},

th: {
  border: "1px solid #ddd",
  padding: "12px",
  backgroundColor: "#0d6efd",
  color: "white",
  textAlign: "left"
},

td: {
  border: "1px solid #ddd",
  padding: "12px",
  textAlign: "left"
},

viewBtn: {
  background: "#0d6efd",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "5px",
  cursor: "pointer"
},

  modalSectionTitle: {
    margin: "18px 0 10px",
    color: "#0d6efd",
    fontSize: "18px",
  },

  status: (s) => {
    const status = normalizeStatus(s);

    return {
      padding: "6px 14px",
      borderRadius: "20px",
      background:
        status === "approved"
          ? "#d1e7dd"
          : status === "rejected"
          ? "#f8d7da"
          : "#fff3cd",
    };
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "850px",
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
  },

  closeBtn: {
    position: "absolute",
    top: "10px",
    right: "15px",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    background: "none",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginTop: "15px",
  },

  detailBox: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "15px",
  },

  imageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: "15px",
    marginTop: "10px",
  },

  imageBox: {
    textAlign: "center",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "10px",
  },

  img: {
    width: "100%",
    height: "160px",
    objectFit: "cover",
    borderRadius: "8px",
  },

  modalActions: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },

  approveBtn: {
    background: "green",
    color: "white",
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
  },

  rejectBtn: {
    background: "red",
    color: "white",
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
  },
  predictBtn: {
  background: "#0dcaf0",
  color: "white",
  padding: "10px 18px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
},
disabledBtn: {
  opacity: 0.7,
  cursor: "not-allowed",
},
detectingNotice: {
  margin: "24px 0 8px",
  padding: "14px 16px",
  border: "1px solid #bae6fd",
  borderRadius: "8px",
  background: "#f0f9ff",
  color: "#0f172a",
  display: "flex",
  gap: "12px",
  alignItems: "center",
},
detectingText: {
  margin: "4px 0 0",
  color: "#52627a",
  fontSize: "13px",
},
spinner: {
  width: "22px",
  height: "22px",
  border: "3px solid #bae6fd",
  borderTopColor: "#0ea5e9",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
},
closeActionBtn: {
  background: "#6c757d",
  color: "white",
  padding: "10px 18px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
},


};
const resultStyles = {
  card: {
    marginTop: "20px",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    fontFamily: "Arial",
  },

  top: {
    color: "white",
    textAlign: "center",
    padding: "25px",
  },

  icon: {
    fontSize: "40px",
    marginBottom: "10px",
  },

  middle: {
    background: "#f2f2f2",
    padding: "20px",
    textAlign: "center",
  },

  bottom: {
    padding: "15px",
    textAlign: "center",
    fontWeight: "bold",
  },
};

const claimResultStyles = {
  wrap: {
    display: "flex",
    justifyContent: "center",
    margin: "34px 0 26px",
  },
  card: {
    width: "min(620px, 100%)",
    background: "#fff",
    color: "#000",
    borderRadius: "8px",
    padding: "30px 26px",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.12)",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    margin: "0 0 18px",
    fontSize: "26px",
    lineHeight: 1.2,
    fontWeight: 700,
  },
  subtitle: {
    margin: "0 0 30px",
    color: "#52627a",
    fontSize: "13px",
  },
  section: {
    padding: "0 0 18px",
    marginBottom: "28px",
    borderBottom: "1px solid #d7dee8",
  },
  sectionTitle: {
    margin: "0 0 18px",
    fontSize: "16px",
    fontWeight: 700,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "180px minmax(0, 1fr)",
    gap: "18px",
    alignItems: "start",
    padding: "6px 0",
    fontSize: "14px",
  },
  label: {
    fontWeight: 700,
  },
  value: {
    textAlign: "right",
    overflowWrap: "anywhere",
  },
  imageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginBottom: "14px",
  },
  imageBox: {
    border: "1px solid #d7dee8",
    borderRadius: "6px",
    padding: "8px",
    background: "#f8fafc",
  },
  imageLabel: {
    display: "block",
    marginBottom: "7px",
    fontSize: "12px",
    fontWeight: 700,
    color: "#52627a",
  },
  image: {
    width: "100%",
    height: "130px",
    objectFit: "cover",
    borderRadius: "4px",
    display: "block",
  },
  decision: {
    marginTop: "-10px",
    padding: "22px 16px",
    border: "1px solid #9ec5fe",
    borderRadius: "6px",
    background: "#edf5ff",
  },
};

export default AdminDashboard;
