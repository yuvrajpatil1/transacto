import axios from "axios";

export const axiosInstance = axios.create({
  // baseURL: "https://transacto-backend.onrender.com",
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

// Add token dynamically to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ Sending token:", token);
  } else {
    console.warn("❌ No token found in localStorage");
  }
  return config;
});
