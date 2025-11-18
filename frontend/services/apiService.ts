import axios from "axios";

// Use relative path for Next.js API Routes
// In production, this will automatically use the same domain
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiService.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

