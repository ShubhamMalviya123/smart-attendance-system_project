import axios from "axios";

// In deployment, set REACT_APP_API_URL as an environment variable
// (e.g. https://your-backend.onrender.com or https://your-backend.onrender.com/api) in Vercel's project settings.
// Locally, it falls back to your dev backend on port 9630.
const getBaseUrl = () => {
  let url = process.env.REACT_APP_API_URL || "http://localhost:9630/api";
  url = url.trim().replace(/\/+$/, "");
  if (!url.endsWith("/api")) {
    url += "/api";
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If token expires/invalid, redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginCall = (error.config?.url || "").includes("/auth/login");
    if (error.response && error.response.status === 401 && !isLoginCall) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;
