import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/admin/auth/logout");
    } catch (_) {
      // ignore even if it fails; just clear client flag
    } finally {
      localStorage.removeItem("adminLoggedIn");
      navigate("/login");
    }
  };

  return (
    <header className="navbar">
      <div className="navbar__title">Admin Dashboard</div>
      <button className="btn btn--ghost" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
}
