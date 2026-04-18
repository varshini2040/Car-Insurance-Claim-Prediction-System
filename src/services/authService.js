import axios from "axios";

const AUTH_API = "http://localhost:5000/api/auth";
const USER_API = "http://localhost:5000/api/users";

export const authService = {
  
  // USER REGISTRATION
  async register(userData) {
    try {
      const res = await axios.post(`${AUTH_API}/signup`, userData);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  },

  // USER LOGIN
  async login(email, password) {
    try {
      const res = await axios.post(`${AUTH_API}/login`, { email, password });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login error");
    }
  },

  // ADMIN LOGIN
  async adminLogin(username, password) {
    try {
      const res = await axios.post(`${AUTH_API}/admin-login`, {
        username,
        password,
      });

      if (res.data.success && res.data.token) {
        localStorage.setItem("adminToken", res.data.token);
      }

      return res.data;
    } catch (error) {
      throw new Error("Invalid admin credentials");
    }
  },

  // GET LOGGED-IN USER PROFILE
  async getProfile() {
    const token = localStorage.getItem("token");

    const res = await axios.get(`${AUTH_API}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  },

  // GET ANY USER BY ID (ADMIN)
  async getUserById(id) {
    try {
      const adminToken = localStorage.getItem("adminToken");

      const res = await axios.get(`${USER_API}/${id}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      return res.data;
    } catch (error) {
      console.error("Get user error:", error);
      return { success: false };
    }
  },

  // ADMIN UPDATE USER DETAILS
  async adminUpdateUser(id, updatedData) {
    try {
      const adminToken = localStorage.getItem("adminToken");

      const res = await axios.put(
        `${USER_API}/${id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      return res.data;
    } catch (error) {
      console.error("Update error:", error);
      return { success: false };
    }
  },
};
