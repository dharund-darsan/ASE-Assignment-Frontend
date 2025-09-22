// src/api/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach JWT token if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log("Request Error:", error);
    Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    console.log(error.response);
    
    if (error.response && error.response.status === 401) {
      // Remove invalid token
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("userDetails");

      // Redirect to login page
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
