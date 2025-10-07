import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import api from "../api/axios";
import axios from "axios";
import "./Login.css";
export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/auth/login`,
        form,
        { withCredentials: true }
      );
      localStorage.setItem("adminLoggedIn", "true"); // temp guard
      navigate("/dashboard/quotes");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth__container">
      <form className="card auth__card" onSubmit={onSubmit}>
        <h2 className="card__title">Login</h2>
        {error && <div className="alert">{error}</div>}

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={onChange}
            placeholder="Admin emailID"
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            required
            value={form.password}
            onChange={onChange}
            placeholder="••••••••"
          />
        </label>

        <button className="btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
