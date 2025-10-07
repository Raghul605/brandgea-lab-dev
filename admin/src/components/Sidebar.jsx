import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar__nav">
        {/* Quotes */}
        <NavLink
          to="/dashboard/quotes"
          className={({ isActive }) =>
            "navlink" + (isActive ? " navlink--active" : "")
          }
        >
          Quotes
        </NavLink>

        {/* Users */}
        <NavLink
          to="/dashboard/users"
          className={({ isActive }) =>
            "navlink" + (isActive ? " navlink--active" : "")
          }
        >
          Users
        </NavLink>

        {/* Orders */}
        <NavLink
          to="/dashboard/orders"
          className={({ isActive }) =>
            "navlink" + (isActive ? " navlink--active" : "")
          }
        >
          Orders
        </NavLink>

        {/* ✅ New Create Order link */}
        <NavLink
          to="/dashboard/create-order"
          className={({ isActive }) =>
            "navlink" + (isActive ? " navlink--active" : "")
          }
        >
          Create Order
        </NavLink>
      </nav>
    </aside>
  );
}
