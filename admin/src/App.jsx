import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// Pages & Components
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Quotes from "./pages/Quotes";
import QuoteDetails from "./pages/QuoteDetails";
import Users from "./pages/UserTable";
import UserDetails from "./pages/UserDetails";
import ChatDetails from "./pages/ChatDetails";
import Orders from "./pages/Orders";              
import OrderDetails from "./pages/OrderDetails";  
import CreateOrder from "./pages/CreateOrder";    
import TrackOrder from "./pages/TrackOrder"; // ✅ Import TrackOrder page
import Leads from "./pages/Leads";
import LeadDetails from "./pages/LeadDetails";
import Vendors from "./pages/Vendors";
import VendorDetails from "./pages/VendorDetails";
import TempLeadDetails from "./pages/TempLeadDetails";
import TempLeads from "./pages/TempLeads";

// Auth wrapper
function RequireAuth({ children }) {
  const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Redirect root to /dashboard/quotes */}
      <Route path="/" element={<Navigate to="/dashboard/quotes" replace />} />

      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* Public route for tracking order */}
      <Route path="/track-order/:trackingToken" element={<TrackOrder />} />

      {/* Protected dashboard */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="quotes" replace />} />

        {/* Quotes */}
        <Route path="quotes" element={<Quotes />} />
        <Route path="quotes/:id" element={<QuoteDetails />} />

        {/* Users */}
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetails />} />

        {/* Temp Leads */}
        <Route path="temp-leads" element={<TempLeads />} />
        <Route path="temp-leads/:id" element={<TempLeadDetails />} />

        {/* Leads */}
        <Route path="leads" element={<Leads />} />
        <Route path="leads/:id" element={<LeadDetails />} />

        {/* Vendors */}
        <Route path="vendors" element={<Vendors />} />
        <Route path="vendors/:id" element={<VendorDetails />} />

        {/* Chat Details */}
        <Route path="chats/:userId/:chatId" element={<ChatDetails />} />

        {/* Orders */}
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetails />} />

        {/* New Order Creation */}
        <Route path="create-order" element={<CreateOrder />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<div className="card">Not Found</div>} />
    </Routes>
  );
}
