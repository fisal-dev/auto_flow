import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../utils/api";
import {
  LayoutDashboard, Car, Wrench, MapPin, ReceiptText,
  Fuel, GaugeCircle, AlertCircle, User, Settings,
  Menu, X, LogOut, Bell, ChevronRight, CalendarClock, Users
} from "lucide-react";

const getNavGroups = (role) => {
  if (role === 'admin' || role === 'owner') {
    return [
      {
        label: "Administration",
        items: [
          { label: "Admin Dashboard", path: "/admin/dashboard",   icon: LayoutDashboard },
          { label: "User Directory",  path: "/admin/users",       icon: Users },
          { label: "Complaints Support", path: "/admin/complaints", icon: AlertCircle },
          { label: "Service Stations",path: "/admin/stores",      icon: MapPin },
          { label: "Garage Console",  path: "/garage-console",    icon: Car },
          { label: "Team Portal",     path: "/team-management",   icon: Users },
        ],
      },
      {
        label: "Account",
        items: [
          { label: "Profile",   path: "/profile",  icon: User },
          { label: "Settings",  path: "/settings", icon: Settings },
        ],
      },
    ];
  } else if (role === 'manager') {
    return [
      {
        label: "Business",
        items: [
          { label: "Dashboard",      path: "/dashboard",           icon: LayoutDashboard },
          { label: "Garage Console", path: "/garage-console",      icon: Car },
          { label: "Service Centers",path: "/service-centers",     icon: MapPin },
          { label: "Complaints",     path: "/admin/complaints",    icon: AlertCircle },
          { label: "Team Portal",    path: "/team-management",     icon: Users },
        ],
      },
      {
        label: "Account",
        items: [
          { label: "Profile",  path: "/profile",  icon: User },
          { label: "Settings", path: "/settings", icon: Settings },
        ],
      },
    ];
  } else {
    return [
      {
        label: "Fleet",
        items: [
          { label: "Dashboard",    path: "/dashboard",           icon: LayoutDashboard },
          { label: "Vehicles",     path: "/vehicles",            icon: Car },
          { label: "Maintenance",  path: "/maintenance-records", icon: Wrench },
          { label: "Upcoming",     path: "/upcoming-services",   icon: CalendarClock },
          { label: "Service Centers",path: "/service-centers",    icon: MapPin },
        ],
      },
      {
        label: "Finances",
        items: [
          { label: "Expense Reports",   path: "/expense-reports",      icon: ReceiptText },
          { label: "Fuel Log",          path: "/fuel-consumption",     icon: Fuel },
          { label: "Performance",       path: "/performance-analytics",icon: GaugeCircle },
        ],
      },
      {
        label: "Support",
        items: [
          { label: "Report Issue",  path: "/report-complaint", icon: AlertCircle },
          { label: "Complaints",    path: "/complaint-history", icon: AlertCircle },
        ],
      },
      {
        label: "Account",
        items: [
          { label: "Profile",   path: "/profile",  icon: User },
          { label: "Settings",  path: "/settings", icon: Settings },
        ],
      },
    ];
  }
};

const NavItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className="relative block"
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 bg-indigo-500/15 border border-indigo-500/25 rounded-xl"
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        />
      )}
      <div className={`
        relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold
        transition-colors duration-200 z-10
        ${isActive
          ? "text-indigo-300"
          : "text-slate-500 hover:text-slate-200 hover:bg-white/4"
        }
      `}>
        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-indigo-400" : "text-slate-600"}`} />
        {item.label}
      </div>
    </Link>
  );
};

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role || 'customer';
  const rawName = user.name || 'User';
  
  const formatName = (str) => {
    if (!str) return "";
    return str
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const getInitials = (n) => {
    if (!n) return "U";
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const name = formatName(rawName);
  const initials = getInitials(rawName);

  const navGroups = getNavGroups(role);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const handleSignOut = () => {
    const deviceToken = localStorage.getItem("rememberDeviceToken");
    if (deviceToken) {
      api.post("/user/logout-device", { deviceToken }).catch(() => {});
    }
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberDeviceToken");
  };

  const pageTitle = (() => {
    for (const g of navGroups) {
      for (const item of g.items) {
        if (location.pathname === item.path || location.pathname.startsWith(item.path + "/")) {
          return item.label;
        }
      }
    }
    return "Dashboard";
  })();

  return (
    <div className="h-screen bg-background text-foreground flex relative overflow-hidden font-sans transition-colors duration-300">

      {/* Ambient glows */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none -translate-y-1/4 translate-x-1/4 transition-colors duration-300" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none translate-y-1/4 -translate-x-1/4 transition-colors duration-300" />

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 border-r border-white/5 z-30 h-screen sticky top-0 left-0 bg-surface/80 backdrop-blur-xl transition-colors duration-300">
        
        {/* Brand */}
        <div className="p-5 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center border border-indigo-500/20 group-hover:border-indigo-500/40 transition-all duration-200 shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)] bg-background">
              <img src="/autoflow_logo.png" alt="AutoFlow Logo" className="w-full h-full object-cover scale-[1.15]" />
            </div>
            <span className="text-base font-bold text-foreground tracking-tight">
              Auto<span className="text-indigo-400">Flow</span>
            </span>
          </Link>
        </div>

        {/* Nav Groups */}
        <nav className="flex-grow overflow-y-auto custom-scrollbar py-4 px-3 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 px-3.5 mb-2">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem key={item.path} item={item} isActive={isActive(item.path)} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom sign out */}
        <div className="p-3 border-t border-white/5 safe-pb">
          <Link
            to="/login"
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/8 transition-all duration-200"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* ── Mobile Overlay & Drawer ── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.38 }}
              className="fixed inset-y-0 left-0 w-60 z-50 lg:hidden flex flex-col bg-surface border-r border-white/5"
            >
              <div className="p-5 border-b border-white/5 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md overflow-hidden flex items-center justify-center border border-indigo-500/20 bg-background">
                    <img src="/autoflow_logo.png" alt="AutoFlow Logo" className="w-full h-full object-cover scale-[1.15]" />
                  </div>
                  <span className="font-bold text-foreground">Auto<span className="text-indigo-400">Flow</span></span>
                </Link>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 rounded-lg bg-white/5 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-grow overflow-y-auto custom-scrollbar py-4 px-3 space-y-5">
                {navGroups.map((group) => (
                  <div key={group.label}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 px-3.5 mb-2">
                      {group.label}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((item) => (
                        <NavItem
                          key={item.path}
                          item={item}
                          isActive={isActive(item.path)}
                          onClick={() => setIsSidebarOpen(false)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="p-3 border-t border-white/5 safe-pb">
                <Link
                  to="/login"
                  onClick={() => {
                    handleSignOut();
                    setIsSidebarOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/8 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/5 transition-colors duration-300">
          <div className="px-4 lg:px-6 py-3.5 flex items-center justify-between gap-4">
            
            {/* Mobile menu btn + breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-foreground transition-colors"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Link
                  to="/"
                  className="inline-link text-slate-600 hover:text-indigo-400 hidden sm:inline transition-colors duration-200"
                >
                  AutoFlow
                </Link>
                <ChevronRight className="w-3 h-3 hidden sm:inline" />
                <span className="font-semibold text-slate-200">{pageTitle}</span>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <Link
                to="/notifications"
                className="p-2 rounded-lg bg-indigo-500/5 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 transition-all border border-indigo-500/10 hover:border-indigo-500/20 relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-400 rounded-full" />
              </Link>
              <Link to="/profile" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 hover:border-indigo-500/20 transition-all">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                  {initials}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-slate-300">{name}</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
