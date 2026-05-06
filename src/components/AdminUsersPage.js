import React, { useState, useEffect } from "react";
import UserDetails from "./UserDetails";
import "./AdminUsersPage.css";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 FETCH USERS FROM MONGODB
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch("http://localhost:5000/api/users");
        
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        
        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid response format");
        }

        // 🔥 Map MongoDB schema → UI schema
        const mappedUsers = data.map(user => ({
          id: user._id,
          fullName: user.fullName || user.name || "N/A",
          email: user.email || "N/A",
          phone: user.phone || "N/A",
          vehicleModel: user.vehicleModel || "N/A",
          vehicleType: user.vehicleType || "N/A",
          licensePlate: user.licensePlate || "N/A",
          policyType: user.policyType || "N/A",
          policyNumber: user.policyNumber || "N/A",
          status: user.claimStatus || "pending",
          joinDate: user.createdAt,
          applications: 1
        }));

        setUsers(mappedUsers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError(error.message || "Failed to fetch users");
        setLoading(false);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  // 🔹 FILTER USERS
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.policyNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusCount = status =>
    users.filter(user => user.status === status).length;

  const handleUserClick = user => setSelectedUser(user);
  const handleBackToList = () => setSelectedUser(null);

  // 🔹 UPDATE STATUS (Approve / Reject)
  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimStatus: newStatus })
      });

      if (!res.ok) {
        throw new Error(`Update failed: ${res.status}`);
      }

      const responseData = await res.json();

      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );

      if (selectedUser?.id === userId) {
        setSelectedUser(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  // 🔹 LOADING STATE
  if (loading) {
    return (
      <div className="admin-page loading">
        <div className="loading-spinner">Loading users...</div>
      </div>
    );
  }

  // 🔹 ERROR STATE
  if (error) {
    return (
      <div className="admin-page error">
        <div className="error-message">
          <h3>Error Loading Users</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  // 🔹 USER DETAILS VIEW
  if (selectedUser) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <button className="back-btn" onClick={handleBackToList}>
            ← Back to Users List
          </button>
          <div className="header-content">
            <h1>User Details - {selectedUser.fullName}</h1>
            <p>Viewing and managing user information</p>
          </div>
        </div>

        <UserDetails
          user={selectedUser}
          isAdmin={true}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    );
  }

  // 🔹 MAIN ADMIN PAGE
  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="header-content">
          <h1>User Management</h1>
          <p>Manage registered users and insurance details</p>
        </div>

        <div className="header-stats">
          <div className="stat-card">
            <h3>{users.length}</h3>
            <p>Total Users</p>
          </div>
          <div className="stat-card">
            <h3>{getStatusCount("approved")}</h3>
            <p>Approved</p>
          </div>
          <div className="stat-card">
            <h3>{getStatusCount("pending")}</h3>
            <p>Pending</p>
          </div>
        </div>
      </div>

      {/* 🔹 SEARCH & FILTER */}
      <div className="admin-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* 🔹 USERS LIST */}
      <div className="admin-layout">
        <div className="users-sidebar">
          <div className="users-list-header">
            <h3>Users ({filteredUsers.length})</h3>
          </div>

          <div className="users-list">
            {filteredUsers.length === 0 ? (
              <div className="no-users">No users found</div>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="user-card"
                  onClick={() => handleUserClick(user)}
                >
                  <div className="user-avatar">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>

                  <div className="user-info">
                    <h4>{user.fullName}</h4>
                    <span className={`status-badge ${user.status}`}>
                      {user.status}
                    </span>
                    <p>{user.email}</p>
                    <small>
                      🚗 {user.vehicleModel} | 📄 {user.policyType}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 🔹 RIGHT SIDE PLACEHOLDER */}
        <div className="user-details-main">
          <div className="no-selection">
            <h3>Select a User</h3>
            <p>Click a user to view full details</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
