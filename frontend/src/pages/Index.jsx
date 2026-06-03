import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "../hooks/useTheme";
import { api } from "../utils/api";
import ProtectedRoute from "../components/ProtectedRoute";

// Component Imports
import Home from "../components/Home";
import LoginPage from "../components/LoginPage";
import SignUpPage from "../components/SignUp";
import ForgotPassword from "../components/ForgotPassword";
import Dashboard from "../components/Dashboard";
import Notifications from "../components/NotificationsPage";
import VehicleList from "../components/VehicleList";
import VehicleDetails from "../components/VehicleDetails";
import AddVehicle from "../components/AddVehicle";
import Maintenance from "../components/Maintenance";
import UpcomingServices from "../components/UpcomingServices";
import ServiceCenters from "../components/ServiceCenters";
import ExpenseReports from "../components/ExpenseReports";
import FuelConsumption from "../components/FuelConsumption";
import PerformanceAnalytics from "../components/PerformanceAnalytics";
import Report from "../components/Report";
import ComplaintHistory from "../components/ComplaintHistory";
import UserProfile from "../components/UserProfile";
import SettingsPage from "../components/SettingsPage";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import About from "../components/About";
import PrivacyPolicy from "../components/PrivacyPolicy";
import TermsOfService from "../components/TermsOfService";
import CookiePolicy from "../components/CookiePolicy";
import ManagerManagement from "../components/ManagerManagement";
import GarageConsole from "../components/GarageConsole";

// Admin Portal Imports
import AdminDashboard from "../components/AdminDashboard";
import AdminUserManagement from "../components/AdminUserManagement";
import AdminComplaintResolution from "../components/AdminComplaintResolution";
import AdminStoreManagement from "../components/AdminStoreManagement";

// Fallback Page
import NotFound from "./NotFound";

const IndexPage = () => {
  const [checkingSession, setCheckingSession] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const autoLogin = async () => {
      const deviceToken = localStorage.getItem("rememberDeviceToken");
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

      if (deviceToken && !isLoggedIn) {
        setCheckingSession(true);
        try {
          const res = await api.post("/user/verify-device", { deviceToken });
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("token", res.token);
          localStorage.setItem("user", JSON.stringify(res.user));

          if (location.pathname === "/" || location.pathname === "/login" || location.pathname === "/signup") {
            navigate("/dashboard");
          } else {
            window.location.reload();
          }
        } catch (err) {
          console.warn("Auto-login via remembered device failed:", err.message);
          localStorage.removeItem("rememberDeviceToken");
        } finally {
          setCheckingSession(false);
        }
      }
    };

    autoLogin();
  }, []);

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-semibold animate-pulse">Recognizing your device...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            {/* ── Public routes ──────────────────────────────────────────── */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />

            {/* ── All logged-in users ─────────────────────────────────────── */}
            <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/profile"       element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/settings"      element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/service-centers" element={<ProtectedRoute><ServiceCenters /></ProtectedRoute>} />

            {/* ── Customer-only routes ────────────────────────────────────── */}
            <Route path="/vehicles"            element={<ProtectedRoute roles={["customer"]}><VehicleList /></ProtectedRoute>} />
            <Route path="/vehicle/:id"         element={<ProtectedRoute roles={["customer"]}><VehicleDetails /></ProtectedRoute>} />
            <Route path="/add-vehicle"         element={<ProtectedRoute roles={["customer"]}><AddVehicle /></ProtectedRoute>} />
            <Route path="/maintenance-records" element={<ProtectedRoute roles={["customer"]}><Maintenance /></ProtectedRoute>} />
            <Route path="/maintenance"         element={<ProtectedRoute roles={["customer"]}><Maintenance /></ProtectedRoute>} />
            <Route path="/upcoming-services"   element={<ProtectedRoute roles={["customer"]}><UpcomingServices /></ProtectedRoute>} />
            <Route path="/expense-reports"     element={<ProtectedRoute roles={["customer"]}><ExpenseReports /></ProtectedRoute>} />
            <Route path="/fuel-consumption"    element={<ProtectedRoute roles={["customer"]}><FuelConsumption /></ProtectedRoute>} />
            <Route path="/performance-analytics" element={<ProtectedRoute roles={["customer"]}><PerformanceAnalytics /></ProtectedRoute>} />
            <Route path="/report-complaint"    element={<ProtectedRoute roles={["customer"]}><Report /></ProtectedRoute>} />
            <Route path="/complaint-history"   element={<ProtectedRoute roles={["customer"]}><ComplaintHistory /></ProtectedRoute>} />

            {/* ── Manager + Owner routes ──────────────────────────────────── */}
            <Route path="/garage-console"  element={<ProtectedRoute roles={["manager", "owner"]}><GarageConsole /></ProtectedRoute>} />
            <Route path="/team-management" element={<ProtectedRoute roles={["manager", "owner"]}><ManagerManagement /></ProtectedRoute>} />

            {/* ── Manager + Owner + Admin ─────────────────────────────────── */}
            <Route path="/admin/complaints" element={<ProtectedRoute roles={["manager", "owner", "admin"]}><AdminComplaintResolution /></ProtectedRoute>} />

            {/* ── Owner + Admin only ──────────────────────────────────────── */}
            <Route path="/admin/dashboard" element={<ProtectedRoute roles={["owner", "admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users"     element={<ProtectedRoute roles={["owner", "admin"]}><AdminUserManagement /></ProtectedRoute>} />
            <Route path="/admin/stores"    element={<ProtectedRoute roles={["owner", "admin"]}><AdminStoreManagement /></ProtectedRoute>} />

            {/* ── Fallback ────────────────────────────────────────────────── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default IndexPage;
