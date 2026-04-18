import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";

import jsPDF from "jspdf";

const AnalyticsPage = () => {
  // CLAIM STATS
  const [claimStats, setClaimStats] = useState({
    totalClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    pendingClaims: 0,
      fraudulent: 0,
  });

  // INSURANCE STATS
  const [insuranceStats, setInsuranceStats] = useState({
    totalApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    pendingApplications: 0,
  });

  // MONTHLY DATA
  const [monthlyClaims, setMonthlyClaims] = useState([]);
  const [monthlyApplications, setMonthlyApplications] = useState([]);

  // FRAUD TREND
  const [fraudMonthly, setFraudMonthly] = useState([]);

  // COMBINED DATA
  const [combinedData, setCombinedData] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  // ==========================================
  // LOAD ANALYTICS DATA
  // ==========================================
  const loadAnalytics = async () => {
    try {
      // =============================
      // FETCH CLAIMS
      // =============================
      const claimRes = await axios.get(
        "http://localhost:5000/api/claims/all"
      );
      const claims = claimRes.data;

      const approvedC = claims.filter((c) => c.status === "approved").length;
      const rejectedC = claims.filter((c) => c.status === "rejected").length;
      const pendingC = claims.filter((c) => c.status === "pending").length;
      const fraudulentC = claims.filter(
  (c) =>
    c.predictionResult === "Fraud" ||
    c.predictionResult === "Fraudulent"
).length;
      setClaimStats({
        totalClaims: claims.length,
        approvedClaims: approvedC,
        rejectedClaims: rejectedC,
        pendingClaims: pendingC,
        fraudulent: fraudulentC,
      });

      // =============================
      // MONTHLY CLAIM TREND
      // =============================
      const claimMonthMap = {};
      claims.forEach((c) => {
        const date = new Date(c.accidentDate || c.createdAt);
        const month = date.toLocaleString("default", { month: "short" });

        claimMonthMap[month] = (claimMonthMap[month] || 0) + 1;
      });

      const claimTrend = Object.keys(claimMonthMap).map((m) => ({
        month: m,
        claims: claimMonthMap[m],
      }));

      setMonthlyClaims(claimTrend);

// =============================
// FRAUD RISK TREND
// =============================
const fraudMonthMap = {};

claims.forEach((c) => {
  const isFraud =
    c.predictionResult === "Fraud" ||
    c.predictionResult === "Fraudulent" ||
    c.fraudRisk === "High";

  if (isFraud) {
    const date = new Date(c.accidentDate || c.createdAt);

    if (!date || isNaN(date)) return;

    const month = date.toLocaleString("default", { month: "short" });

    fraudMonthMap[month] = (fraudMonthMap[month] || 0) + 1;
  }
});

let fraudTrend = Object.keys(fraudMonthMap).map((m) => ({
  month: m,
  fraudClaims: fraudMonthMap[m],
}));

// Fallback if no fraud data exists
if (fraudTrend.length === 0) {
  fraudTrend = [{ month: "No Data", fraudClaims: 0 }];
}

setFraudMonthly(fraudTrend);

      // =============================
      // FETCH INSURANCE APPLICATIONS
      // =============================
      const insRes = await axios.get(
        "http://localhost:5000/api/insurance/all"
      );
      const apps = insRes.data;

      const approvedA = apps.filter((a) => a.status === "approved").length;
      const rejectedA = apps.filter((a) => a.status === "rejected").length;
      const pendingA = apps.filter((a) => a.status === "pending").length;

      setInsuranceStats({
        totalApplications: apps.length,
        approvedApplications: approvedA,
        rejectedApplications: rejectedA,
        pendingApplications: pendingA,
      });

      // =============================
      // MONTHLY APPLICATION TREND
      // =============================
      const appMonthMap = {};
      apps.forEach((a) => {
        const date = new Date(a.submittedAt);
        const month = date.toLocaleString("default", { month: "short" });

        appMonthMap[month] = (appMonthMap[month] || 0) + 1;
      });

      const appTrend = Object.keys(appMonthMap).map((m) => ({
        month: m,
        applications: appMonthMap[m],
      }));

      setMonthlyApplications(appTrend);

      // =============================
      // COMBINED CLAIMS vs APPLICATIONS
      // =============================
      const combinedMap = {};

      claimTrend.forEach((c) => {
        combinedMap[c.month] = {
          month: c.month,
          claims: c.claims,
          applications: 0,
        };
      });

      appTrend.forEach((a) => {
        if (!combinedMap[a.month]) {
          combinedMap[a.month] = {
            month: a.month,
            claims: 0,
            applications: a.applications,
          };
        } else {
          combinedMap[a.month].applications = a.applications;
        }
      });

      setCombinedData(Object.values(combinedMap));
    } catch (error) {
      console.log("Analytics Load Error:", error);
    }
  };

  // ==========================================
  // EXPORT PDF REPORT
  // ==========================================
 const exportPDF = () => {
  const doc = new jsPDF();

  // =========================
  // HEADER BAR
  // =========================
  doc.setFillColor(13, 110, 253); // blue
  doc.rect(0, 0, 210, 25, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("InsurePredict", 20, 15);

  doc.setFontSize(12);
  doc.text("Insurance Analytics Report", 120, 15);

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // =========================
  // CLAIMS SECTION
  // =========================
  let y = 40;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Claims Summary", 20, y);

  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  const claimRows = [
    ["Total Claims", claimStats.totalClaims],
    ["Approved Claims", claimStats.approvedClaims],
    ["Rejected Claims", claimStats.rejectedClaims],
    ["Pending Claims", claimStats.pendingClaims],
    ["Fraudulent Claims", claimStats.fraudulent],
  ];

  claimRows.forEach((row) => {
    doc.setFillColor(245, 245, 245);
    doc.rect(20, y - 6, 170, 10, "F");

    doc.text(row[0], 25, y);
    doc.text(String(row[1]), 170, y, { align: "right" });

    y += 12;
  });

  // =========================
  // INSURANCE SECTION
  // =========================
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Insurance Applications Summary", 20, y);

  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  const appRows = [
    ["Total Applications", insuranceStats.totalApplications],
    ["Approved Applications", insuranceStats.approvedApplications],
    ["Rejected Applications", insuranceStats.rejectedApplications],
    ["Pending Applications", insuranceStats.pendingApplications],
  ];

  appRows.forEach((row) => {
    doc.setFillColor(245, 245, 245);
    doc.rect(20, y - 6, 170, 10, "F");

    doc.text(row[0], 25, y);
    doc.text(String(row[1]), 170, y, { align: "right" });

    y += 12;
  });

  // =========================
  // FOOTER
  // =========================
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    "Generated by InsurePredict - AI Insurance Analytics System",
    20,
    285
  );

  doc.text(
    `Date: ${new Date().toLocaleDateString()}`,
    160,
    285,
    { align: "right" }
  );

  doc.save("Insurance_Analytics_Report.pdf");
};

  // PIE DATA
  const pieData = [
    { name: "Approved", value: claimStats.approvedClaims },
    { name: "Rejected", value: claimStats.rejectedClaims },
    { name: "Pending", value: claimStats.pendingClaims },
       { name: "Fraudulent", value: claimStats.fraudulent },
  ];

  const COLORS = ["#198754", "#dc3545", "#ffc107","#6f42c1"];

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Admin Analytics Dashboard</h1>
        <p style={styles.subtitle}>
          Claims + Insurance Applications + Fraud Insights
        </p>

        <button onClick={exportPDF} style={styles.exportBtn}>
          📄 Download Report
        </button>
      </div>

      {/* CLAIM STATS */}
      <h2 style={styles.mainSection}>🚗 Claims Analytics</h2>

      <div style={styles.statsGrid}>
        <StatCard title="Total Claims" value={claimStats.totalClaims} />
        <StatCard title="Approved" value={claimStats.approvedClaims} color="green" />
        <StatCard title="Rejected" value={claimStats.rejectedClaims} color="red" />
        <StatCard title="Pending" value={claimStats.pendingClaims} color="orange" />
        
      </div>

      {/* PIE + CLAIM TREND */}
      <div style={styles.section}>
        <div style={styles.chartGrid}>
          {/* PIE */}
          <div style={styles.chartCard}>
            <h3>Status Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={100} label>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* CLAIM TREND */}
          <div style={styles.chartCard}>
            <h3>Monthly Claims Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyClaims}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line dataKey="claims" stroke="#0d6efd" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* FRAUD TREND */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🚨 Fraud Risk Trend</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={fraudMonthly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line dataKey="fraudClaims" stroke="#dc3545" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* INSURANCE APPLICATION STATS */}
      <h2 style={styles.mainSection}>📌 Insurance Applications Analytics</h2>

      <div style={styles.statsGrid}>
        <StatCard title="Total Applications" value={insuranceStats.totalApplications} />
        <StatCard title="Approved" value={insuranceStats.approvedApplications} color="green" />
        <StatCard title="Rejected" value={insuranceStats.rejectedApplications} color="red" />
        <StatCard title="Pending" value={insuranceStats.pendingApplications} color="orange" />
         
      </div>

      {/* INSURANCE TREND */}
      <div style={styles.section}>
        <h3 style={{ textAlign: "center" }}>
          📅 Monthly Insurance Applications Trend
        </h3>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={monthlyApplications}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line dataKey="applications" stroke="#198754" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* COMPARISON CHART */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          📊 Claims vs Applications Comparison
        </h2>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="claims" fill="#0d6efd" />
            <Bar dataKey="applications" fill="#198754" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ✅ Reusable Card Component
const StatCard = ({ title, value, color }) => (
  <div
    style={{
      background: "white",
      padding: "1.5rem",
      borderRadius: "12px",
      textAlign: "center",
      boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
      borderLeft: `6px solid ${color || "#0d6efd"}`,
    }}
  >
    <h2>{value}</h2>
    <p>{title}</p>
  </div>
);

// STYLES
const styles = {
  container: {
    padding: "2rem",
    background: "#f8f9fa",
    minHeight: "100vh",
  },

  header: { textAlign: "center", marginBottom: "2rem" },

  title: { fontSize: "2.5rem", color: "#0d6efd" },

  subtitle: { color: "#6c757d" },

  exportBtn: {
    marginTop: "15px",
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#0d6efd",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  mainSection: {
    marginTop: "2rem",
    marginBottom: "1rem",
    fontSize: "1.8rem",
    color: "#333",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: "1.5rem",
  },

  section: {
    background: "white",
    padding: "2rem",
    borderRadius: "12px",
    marginTop: "2rem",
    boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
  },

  sectionTitle: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
    textAlign: "center",
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2rem",
  },

  chartCard: {
    background: "#f8f9fa",
    padding: "1.5rem",
    borderRadius: "12px",
  },
};

export default AnalyticsPage;
