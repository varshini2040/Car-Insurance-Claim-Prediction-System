import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

const percent = (value) =>
  Number.isFinite(Number(value)) ? `${Number(value).toFixed(2)}%` : "Unavailable";

const money = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

const Row = ({ label, children }) => (
  <div style={styles.row}>
    <span style={styles.label}>{label}</span>
    <span style={styles.value}>
      {children === undefined || children === null || children === "" ? "Unavailable" : children}
    </span>
  </div>
);

const MatchBadge = ({ match }) => (
  <span style={match ? styles.match : styles.mismatch}>{match ? "Match" : "Mismatch"}</span>
);

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

const VerificationSection = ({ title, data, extra }) => (
  <section style={styles.reportSection}>
    <h3 style={styles.sectionTitle}>{title}</h3>
    <Row label="Similarity">{percent(data?.similarity)}</Row>
    <Row label="Status"><MatchBadge match={Boolean(data?.match)} /></Row>
    {extra}
  </section>
);

const buildReport = (response) => {
  const report = response?.data?.detectionReport || {};
  const claim = response?.data?.claim || {};

  return {
    fraud: report.fraud_detection || {},
    verification: report.image_verification || {},
    plateOcr: report.plate_ocr || claim.plateOcr || {},
    licenseOcr: report.license_ocr || claim.licenseOcr || {},
    decision: report.final_decision || {},
    claimSummary: report.policy_holder || {},
    fileWarnings: report.file_warnings || [],
    claim,
  };
};

const firstAvailable = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [report, setReport] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState("");

  const loadClaims = async () => {
    try {
      const response = await axios.get(`${API}/api/claims/all`);
      setClaims(response.data);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load claims.");
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const openClaim = (claim) => {
    setSelectedClaim(claim);
    setReport(null);
    setError("");
  };

  const detectClaim = async () => {
    if (!selectedClaim?._id) return;

    try {
      setIsDetecting(true);
      setError("");
      const response = await axios.post(`${API}/api/claims/${selectedClaim._id}/detect`);
      const nextReport = buildReport(response);
      setReport(nextReport);
      setSelectedClaim((current) => ({ ...current, ...nextReport.claim }));
      setClaims((current) =>
        current.map((claim) =>
          claim._id === selectedClaim._id ? { ...claim, ...nextReport.claim } : claim
        )
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Detection failed.");
    } finally {
      setIsDetecting(false);
    }
  };

  const updateStatus = async (claim, status) => {
    try {
      const response = await axios.put(`${API}/api/claims/update/${claim._id}`, { status });
      setClaims((current) =>
        current.map((item) => (item._id === claim._id ? response.data.claim : item))
      );
      setSelectedClaim((current) =>
        current?._id === claim._id ? { ...current, status } : current
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not update claim.");
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.heading}>
        <div>
          <h1 style={{ margin: 0 }}>Claim Verification Dashboard</h1>
          <p style={styles.muted}>Open a claim and click Detect to generate the admin-only report.</p>
        </div>
        <button style={styles.secondaryButton} onClick={loadClaims}>Refresh</button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Policy</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Claim Amount</th>
              <th style={styles.th}>Detection</th>
              <th style={styles.th}>Claim Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim._id}>
                <td style={styles.td}>{claim.policyNumber}</td>
                <td style={styles.td}>{claim.userId?.name || "Unknown"}</td>
                <td style={styles.td}>{money(claim.claimAmount)}</td>
                <td style={styles.td}>{claim.analyzedAt ? "Detected" : "Not Detected"}</td>
                <td style={styles.td}>{claim.status}</td>
                <td style={styles.td}>
                  <div style={styles.actions}>
                    <button style={styles.primaryButton} onClick={() => openClaim(claim)}>Open</button>
                    <button style={styles.approveButton} onClick={() => updateStatus(claim, "Approved")}>Approve</button>
                    <button style={styles.rejectButton} onClick={() => updateStatus(claim, "Rejected")}>Reject</button>
                  </div>
                </td>
              </tr>
            ))}
            {!claims.length && (
              <tr><td style={styles.empty} colSpan="6">No claims found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedClaim && (
        <div style={styles.overlay} onMouseDown={() => setSelectedClaim(null)}>
          <article style={styles.report} onMouseDown={(event) => event.stopPropagation()}>
            <div style={styles.reportHeader}>
              <div>
                <h2 style={{ margin: 0 }}>Claim Details</h2>
                <p style={styles.muted}>Detection report appears only after Detect is clicked.</p>
              </div>
              <button style={styles.closeButton} onClick={() => setSelectedClaim(null)}>x</button>
            </div>

            <section style={styles.reportSection}>
              <h3 style={styles.sectionTitle}>Claim Information</h3>
              <Row label="Policy Number">{selectedClaim.policyNumber}</Row>
              <Row label="Customer Name">{selectedClaim.userId?.name}</Row>
              <Row label="Vehicle Number">{selectedClaim.licensePlate}</Row>
              <Row label="Claim Amount">{money(selectedClaim.claimAmount)}</Row>
            </section>

            <div style={styles.modalActions}>
              <button style={styles.detectButton} onClick={detectClaim} disabled={isDetecting}>
                {isDetecting ? "Detecting..." : "Detect"}
              </button>
              <button style={styles.approveButton} onClick={() => updateStatus(selectedClaim, "Approved")}>Approve</button>
              <button style={styles.rejectButton} onClick={() => updateStatus(selectedClaim, "Rejected")}>Reject</button>
            </div>

            {report && (
              <>
                {(() => {
                  const claimPlate = firstAvailable(
                    report.claimSummary.claim_license_plate,
                    report.plateOcr.submitted_claim_plate,
                    report.plateOcr.submittedClaimPlate,
                    selectedClaim.licensePlate
                  );
                  const policyPlate = firstAvailable(
                    report.claimSummary.insurance_plate,
                    report.plateOcr.insured_plate,
                    report.plateOcr.insuredPlate
                  );
                  const detectedPlate = firstAvailable(
                    report.plateOcr.detected_plate,
                    report.plateOcr.detectedPlate
                  );
                  const plateMatch = firstAvailable(
                    report.plateOcr.match_percentage,
                    report.plateOcr.matchPercentage
                  );
                  const licenseMatch = firstAvailable(
                    report.licenseOcr.match_percentage,
                    report.licenseOcr.matchPercentage
                  );

                  return (
                    <>
                <section style={styles.reportSection}>
                  <h3 style={styles.sectionTitle}>Selected Claim Summary</h3>
                  <Row label="Customer Name">
                    {report.claimSummary.name || selectedClaim.userId?.name}
                  </Row>
                  <Row label="Policy Number">
                    {report.claimSummary.policy_number || selectedClaim.policyNumber}
                  </Row>
                  <Row label="Claim Amount">
                    {money(report.claimSummary.claim_amount || selectedClaim.claimAmount)}
                  </Row>
                  <Row label="Claim Vehicle Number">
                    {claimPlate}
                  </Row>
                  <Row label="Policy Vehicle Number">
                    {policyPlate}
                  </Row>
                </section>

                <section style={styles.reportSection}>
                  <h3 style={styles.sectionTitle}>Random Forest Analysis</h3>
                  <Row label="Fraud Probability">{percent(report.fraud.fraud_probability)}</Row>
                  <Row label="Prediction">{report.fraud.prediction_label}</Row>
                  <Row label="Risk Level">{report.fraud.risk_level}</Row>
                </section>

                <VerificationSection
                  title="Vehicle Verification"
                  data={report.verification.vehicle}
                  extra={
                    <>
                      <Row label="Visual Similarity">{percent(report.verification.vehicle?.visual_similarity)}</Row>
                      <Row label="Note">{vehicleConditionNote(report.verification.vehicle)}</Row>
                    </>
                  }
                />

                <VerificationSection
                  title="License Plate Verification"
                  data={report.verification.plate}
                  extra={
                    <>
                      <Row label="Detected Plate">{detectedPlate}</Row>
                      <Row label="Submitted Claim Plate">
                        {claimPlate}
                      </Row>
                      <Row label="OCR Match">{percent(plateMatch)}</Row>
                      <Row label="Visual Similarity">{percent(report.verification.plate?.visual_similarity)}</Row>
                      <Row label="Mismatch Reason">
                        {joinMessages(
                          report.verification.plate?.mismatch_reasons ||
                            report.plateOcr.mismatch_reasons ||
                            report.plateOcr.mismatchReasons
                        )}
                      </Row>
                      <Row label="File Warning">{joinMessages(report.fileWarnings)}</Row>
                    </>
                  }
                />

                <VerificationSection
                  title="Driver License Verification"
                  data={report.verification.license}
                  extra={
                    <>
                      <Row label="Insurance License">{report.licenseOcr.insured_license || report.licenseOcr.insuredLicense}</Row>
                      <Row label="Detected License">{report.licenseOcr.detected_license || report.licenseOcr.detectedLicense}</Row>
                      <Row label="OCR Match">{percent(licenseMatch)}</Row>
                      <Row label="Visual Similarity">{percent(report.verification.license?.visual_similarity)}</Row>
                    </>
                  }
                />

                <section style={{ ...styles.reportSection, ...styles.decision }}>
                  <h3 style={styles.sectionTitle}>Final Decision</h3>
                  <Row label="Overall Risk Score">{percent(report.decision.overall_risk_score)}</Row>
                  <Row label="Recommended Action">{report.decision.recommended_action}</Row>
                  <Row label="Decision">{report.decision.final_status}</Row>
                </section>
                    </>
                  );
                })()}
              </>
            )}
          </article>
        </div>
      )}
    </main>
  );
};

const styles = {
  page: { padding: "28px", background: "#f5f7fb", minHeight: "100vh" },
  heading: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px", gap: "16px" },
  muted: { color: "#64748b", margin: "6px 0 0" },
  error: { padding: "12px", background: "#fee2e2", color: "#991b1b", borderRadius: "8px", marginBottom: "16px" },
  tableWrap: { overflowX: "auto", background: "white", borderRadius: "8px", boxShadow: "0 8px 24px rgba(15,23,42,.08)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "14px", textAlign: "left", background: "#0f172a", color: "white", whiteSpace: "nowrap" },
  td: { padding: "14px", borderBottom: "1px solid #e2e8f0", verticalAlign: "middle" },
  empty: { padding: "32px", textAlign: "center", color: "#64748b" },
  actions: { display: "flex", gap: "6px", flexWrap: "wrap" },
  primaryButton: { border: 0, borderRadius: "6px", padding: "8px 10px", background: "#2563eb", color: "white", cursor: "pointer" },
  secondaryButton: { border: "1px solid #cbd5e1", borderRadius: "7px", padding: "9px 14px", background: "white", cursor: "pointer" },
  detectButton: { border: 0, borderRadius: "6px", padding: "9px 14px", background: "#0f766e", color: "white", cursor: "pointer", fontWeight: 700 },
  approveButton: { border: 0, borderRadius: "6px", padding: "8px 10px", background: "#16a34a", color: "white", cursor: "pointer" },
  rejectButton: { border: 0, borderRadius: "6px", padding: "8px 10px", background: "#dc2626", color: "white", cursor: "pointer" },
  overlay: { position: "fixed", inset: 0, background: "rgba(15,23,42,.72)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "30px 14px", overflowY: "auto", zIndex: 1000 },
  report: { width: "min(760px, 100%)", background: "white", borderRadius: "8px", padding: "26px", boxShadow: "0 24px 60px rgba(0,0,0,.3)" },
  reportHeader: { display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: "18px", gap: "16px" },
  closeButton: { border: 0, background: "transparent", fontSize: "24px", cursor: "pointer", lineHeight: 1 },
  reportSection: { padding: "18px 0", borderBottom: "1px solid #e2e8f0" },
  sectionTitle: { margin: "0 0 12px", color: "#0f172a" },
  row: { display: "grid", gridTemplateColumns: "190px 1fr", gap: "14px", padding: "6px 0" },
  label: { color: "#475569", fontWeight: 700 },
  value: { color: "#0f172a", overflowWrap: "anywhere" },
  match: { color: "#166534", background: "#dcfce7", borderRadius: "999px", padding: "4px 10px", fontWeight: 700 },
  mismatch: { color: "#991b1b", background: "#fee2e2", borderRadius: "999px", padding: "4px 10px", fontWeight: 700 },
  decision: { marginTop: "12px", padding: "18px", border: "1px solid #bfdbfe", borderRadius: "8px", background: "#eff6ff" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "8px", flexWrap: "wrap", padding: "16px 0" },
};

export default AdminClaims;
