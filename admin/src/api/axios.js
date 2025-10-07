import axios from "axios";

const RAW_BASE = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, 
});

// (Optional) response interceptor for 401 → redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("adminLoggedIn");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

