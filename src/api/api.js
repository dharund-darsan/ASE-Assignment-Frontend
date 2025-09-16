// src/api/api.js
import apiRequest from "./axiosService";

// 🔹 AUTH
export const register = (data) => apiRequest("post", "/auth/register", data);
export const login = (data) => apiRequest("post", "/auth/login", data);

// 🔹 USERS
export const getUser = (id) => apiRequest("get", `/users/${id}`);
export const getUserList = () => apiRequest("get", "/users");

// 🔹 APPOINTMENTS
export const createAppointment = (data) =>
  apiRequest("post", "/appointment/create", data);

export const updateAppointment = (data) =>
  apiRequest("put", "/appointment/update", data);

export const getAppointmentList = (startDate, endDate) =>
  apiRequest("get", "/appointment/list", {}, { startDate, endDate });

export const cancelAppointment = (data) =>
  apiRequest("put", "/appointment/cancel", data);

export const addAppointmentStatus = (data) =>
  apiRequest("put", "/appointment/addAppointmentStatus", data);
