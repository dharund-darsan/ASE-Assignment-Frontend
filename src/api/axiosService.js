// src/api/apiService.js
import axiosInstance from "./axiosInstance";

const apiRequest = async (method, url, data = {}, params = {}) => {

  try {
    const response = await axiosInstance({
      method,
      url,
      data,
      params,
    });
    return response;
  } catch (error) {
    console.log("API Error:", error);
    if(error.status === 401) {
      localStorage.removeItem("jwtToken");
      window.location.href = "/auth";
      return;
    }
    throw error;
  }
};

export default apiRequest;
