// src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Predict from "./pages/Predict";
import ResultsPage from "./pages/ResultsPage";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Logout from "./pages/Logout";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import InsuranceApplication from "./pages/InsuranceApplication";
import UserDashboard from "./pages/UserDashboard";
import AdminUsersPage from "./components/AdminUsersPage";
import UserDetails from "./components/UserDetails";
import SubmitClaim from "./pages/SubmitClaim";
import ClaimHistory from "./pages/ClaimHistory";
import ClaimStatus from "./pages/ClaimStatus";
import { authService } from "./services/authService";
import AdminClaims from "./pages/AdminClaims";
import MyClaims from "./pages/MyClaims";
import AnalyticsPage from "./pages/AnalyticsPage";

import axios from "axios";
import "./App.css";
export const applyInsurance = (data) =>
  axios.post("http://localhost:5000/api/insurance/apply", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
// ---------------------------------------------------------------------
// WRAPPER COMPONENT TO USE NAVIGATION
// ---------------------------------------------------------------------
const AppContent = ({ user, isAdmin, login, logout }) => {
  const navigate = useNavigate();

  const handleProfileAction = (action) => {
    switch (action) {
      case "apply-insurance":
        navigate("/apply-insurance");
        break;
        case "predict":
        navigate("/predict");
        break;
      case "my-dashboard":
        navigate(isAdmin ? "/admin-dashboard" : "/user-dashboard");
        break;
      case "user-details":
  navigate(`/user-details/${user._id}`);
  break;

      case "admin-users":
        navigate("/admin/users");
        break; 
      case "AnalyticsPage":
  navigate("/analytics");
  break;
      case "logout":
        logout();
        navigate("/");
        break;
      default:
        break;
    }
  };

  const handleUserUpdate = (updatedUser) => {
    // Update user in localStorage and state
    localStorage.setItem("user", JSON.stringify(updatedUser));
    login(updatedUser, false);
  };

  return (
    <div className="App">
      <Header
        user={user}
        isAdmin={isAdmin}
        onProfileAction={handleProfileAction}
      />

      <main className="main-content">
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home user={user} isAdmin={isAdmin} />} />

          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn onLogin={login} />} />

          {/* ✅ PREDICTION ROUTES */}
          <Route path="/predict" element={<Predict />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/result" element={<ResultsPage />} />
          {/* USER PROTECTED ROUTES */}
          <Route
            path="/apply-insurance"
            element={
              user ? (
                <InsuranceApplication user={user} />
              ) : (
                <Navigate to="/signin" />
              )
            }
          />
          
           <Route
  path="/analytics"
  element={isAdmin ? <AnalyticsPage /> : <Navigate to="/signin" />}
/>


          <Route
            path="/user-dashboard"
            element={
              user ? <UserDashboard user={user} onUserUpdate={handleUserUpdate} /> : <Navigate to="/signin" />
            }
          />
           <Route path="/apply-claim" element={<Predict />} />
           <Route path="/myclaims" element={<MyClaims />} />
          
         <Route
  path="/user-details/:id"
  element={
    user ? <UserDetails /> : <Navigate to="/signin" />
  }
/>


          {/* LOGOUT */}
          <Route path="/logout" element={<Logout onLogout={logout} />} />

          {/* ADMIN ROUTES */}
          <Route path="/admin-login" element={<AdminLogin onLogin={login} />} />

          <Route
            path="/admin-dashboard"
            element={
              isAdmin ? <AdminDashboard /> : <Navigate to="/admin-login" />
            }
          />


<Route path="/submit" element={<SubmitClaim />} />
<Route path="/history" element={<ClaimHistory userId="USER_ID_HERE" />} />
<Route path="/status" element={<ClaimStatus />} />
 <Route path="/admin/claims" element={<AdminClaims />} />
          <Route
            path="/admin/users"
            element={
              isAdmin ? <AdminUsersPage /> : <Navigate to="/admin-login" />
            }
          />

          <Route
            path="/admin/users/:id"
            element={isAdmin ? <UserDetails /> : <Navigate to="/admin-login" />}
          />

          {/* CATCH ALL */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

// ---------------------------------------------------------------------
// MAIN APP COMPONENT
// ---------------------------------------------------------------------
function App() {

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const adminStatus = localStorage.getItem("isAdmin");

    if (adminStatus === "true") {
      setIsAdmin(true);
    }

    if (token) {
      authService.getProfile().then((res) => {
        if (res.success) {
          setUser(res.user);
        }
      });
    }
  }, []);

  const login = (userData, admin = false) => {
    setUser(userData);
    setIsAdmin(admin);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isAdmin", admin.toString());
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("predictionResult");
  };

  return (
    <Router>
      <AppContent user={user} isAdmin={isAdmin} login={login} logout={logout} />
    </Router>
  );
}

export default App;