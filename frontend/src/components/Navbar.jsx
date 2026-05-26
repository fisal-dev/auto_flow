import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Menu, X, ChevronRight } from "lucide-react";
import { api } from "../utils/api";

const navLinks = [
  { label: "Home",  path: "/" },
  { label: "About", path: "/about" },
];

const dashboardRoutes = [
  "/dashboard", "/vehicles", "/vehicle/",
  "/maintenance-records", "/upcoming-services",
  "/service-centers", "/expense-reports",
  "/fuel-consumption", "/performance-analytics",
  "/report-complaint", "/complaint-history",
  "/profile", "/settings", "/notifications", "/add-vehicle",
  "/admin", "/team-management", "/garage-console",
];

const hideNavbarRoutes = [
  ...dashboardRoutes,
  "/login",
  "/signup",
  "/forgot-password"
];

export default function Navbar() {
  const [isOpen,    setIsOpen]    = useState(false);
  const [scrolled,  setScrolled]  = useState(false);
  const location = useLocation();

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const currentNavLinks = isLoggedIn 
    ? [...navLinks, { label: "Dashboard", path: "/dashboard" }]
    : navLinks;

  const shouldHideNavbar = hideNavbarRoutes.some(r =>
    location.pathname === r || location.pathname.startsWith(r)
  );

  const handleNavbarSignOut = () => {
    const deviceToken = localStorage.getItem("rememberDeviceToken");
    if (deviceToken) {
      api.post("/user/logout-device", { deviceToken }).catch(() => {});
    }
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberDeviceToken");
    window.location.reload();
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  if (shouldHideNavbar) return null;

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300
          ${scrolled
            ? "bg-background/90 backdrop-blur-2xl border-b border-white/5 shadow-[0_1px_40px_rgba(0,0,0,0.4)]"
            : "bg-transparent"
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center border border-indigo-500/20 group-hover:border-indigo-500/40 transition-all duration-200 shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)] bg-background">
              <img src="/autoflow_logo.png" alt="AutoFlow Logo" className="w-full h-full object-cover scale-[1.15]" />
            </div>
            <span className="text-base font-bold text-foreground tracking-tight">
              Auto<span className="text-indigo-400">Flow</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {currentNavLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                    ${isActive
                      ? "text-foreground bg-white/8"
                      : "text-slate-400 hover:text-foreground hover:bg-white/5"
                    }
                  `}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0.5 left-3 right-3 h-px bg-indigo-400 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-semibold text-slate-400 hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={handleNavbarSignOut}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 border border-rose-500/50 rounded-xl transition-all duration-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-400 hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
                >
                  Sign in
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/50 rounded-xl shadow-[0_0_20px_rgba(var(--accent-rgb),0.25)] hover:shadow-[0_0_28px_rgba(var(--accent-rgb),0.4)] transition-all duration-200"
                  >
                    Get Started <ChevronRight className="w-3.5 h-3.5" />
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-foreground transition-all"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="fixed top-0 right-0 bottom-0 w-72 z-50 bg-surface/95 backdrop-blur-2xl border-l border-white/5 flex flex-col md:hidden"
            >
              <div className="p-5 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md overflow-hidden flex items-center justify-center border border-indigo-500/20 bg-background">
                    <img src="/autoflow_logo.png" alt="AutoFlow Logo" className="w-full h-full object-cover scale-[1.15]" />
                  </div>
                  <span className="font-bold text-foreground">Auto<span className="text-indigo-400">Flow</span></span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="p-4 flex-grow space-y-1">
                {currentNavLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`
                        flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all
                        ${isActive
                          ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                          : "text-slate-400 hover:text-foreground hover:bg-white/5"
                        }
                      `}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-white/5 space-y-3">
                {isLoggedIn ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="block w-full py-3 text-center text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={handleNavbarSignOut}
                      className="block w-full py-3 text-center text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block w-full py-3 text-center text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/signup"
                      className="block w-full py-3 text-center text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
