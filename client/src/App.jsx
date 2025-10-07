import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import DashboardLayout from "./components/Layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import ChatPage from "./pages/ChatPage";
import OrderDetails from "./pages/OrderDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

export default function App() {
  return (
    // <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    //   <ThemeProvider>
    //     <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/dashboard"
                element={
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                }
              />
              <Route
                path="/history"
                element={
                  <DashboardLayout>
                    <ProtectedRoute>
                      <History />
                    </ProtectedRoute>
                  </DashboardLayout>
                }
              />
              <Route
                path="/chat"
                element={
                  <DashboardLayout>
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  </DashboardLayout>
                }
              />
              <Route
                path="/orders"
                element={
                  <DashboardLayout>
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  </DashboardLayout>
                }
              />
              <Route
                path="/orders/:orderId"
                element={
                  <DashboardLayout>
                    <ProtectedRoute>
                      <OrderDetails />
                    </ProtectedRoute>
                  </DashboardLayout>
                }
              />
              <Route
                path="/profile"
                element={
                  <DashboardLayout>
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  </DashboardLayout>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
    //     </AuthProvider>
    //   </ThemeProvider>
    // </GoogleOAuthProvider>
  );
}
