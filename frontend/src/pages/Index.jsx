import React from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "../hooks/useTheme";

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

// Fallback Page
import NotFound from "./NotFound";

const IndexPage = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notifications" element={<Notifications />} />

            <Route path="/vehicles" element={<VehicleList />} />
            <Route path="/vehicle/:id" element={<VehicleDetails />} />
            <Route path="/add-vehicle" element={<AddVehicle />} />

            <Route path="/maintenance-records" element={<Maintenance />} />
            <Route path="/upcoming-services" element={<UpcomingServices />} />
            <Route path="/service-centers" element={<ServiceCenters />} />

            <Route path="/expense-reports" element={<ExpenseReports />} />
            <Route path="/fuel-consumption" element={<FuelConsumption />} />
            <Route path="/performance-analytics" element={<PerformanceAnalytics />} />

            <Route path="/report-complaint" element={<Report />} />
            <Route path="/complaint-history" element={<ComplaintHistory />} />

            <Route path="/profile" element={<UserProfile />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />

            {/* Fallback Wildcard Catch */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default IndexPage;
