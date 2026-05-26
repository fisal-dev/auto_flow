import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Car } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const dashboardRoutes = [
  "/dashboard", "/vehicles", "/vehicle/",
  "/maintenance-records", "/upcoming-services",
  "/service-centers", "/expense-reports",
  "/fuel-consumption", "/performance-analytics",
  "/report-complaint", "/complaint-history",
  "/profile", "/settings", "/notifications", "/add-vehicle",
  "/admin", "/team-management", "/garage-console",
];

const hideFooterRoutes = [
  ...dashboardRoutes,
  "/login",
  "/signup",
  "/forgot-password"
];

export default function Footer() {
  const location = useLocation();

  const shouldHideFooter = hideFooterRoutes.some(r =>
    location.pathname === r || location.pathname.startsWith(r)
  );
  if (shouldHideFooter) return null;

  return (
    <footer className="border-t border-white/5 bg-background relative overflow-hidden">
      {/* Subtle gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-12 safe-pb">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">

          {/* Brand */}
          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-2.5 mb-3">
              <div className="w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center border border-indigo-500/25 bg-surface shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)]">
                <img src="/autoflow_logo.png" alt="AutoFlow Logo" className="w-full h-full object-cover scale-[1.15]" />
              </div>
              <span className="text-base font-bold text-white">
                Auto<span className="text-indigo-400">Flow</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Keep your fleet running smoothly. Maintenance tracking, fuel logs, and expense reports — all in one place.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { Icon: FaGithub, href: "https://github.com/fisal-dev/auto_flow" },
                { Icon: FaLinkedin, href: "https://www.linkedin.com/in/fisalkhan/" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/4 hover:bg-white/8 border border-white/5 hover:border-white/12 text-slate-500 hover:text-slate-300 transition-all"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-8 sm:gap-16 flex-wrap">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-4">Product</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Home",      path: "/" },
                  { label: "About",     path: "/about" },
                  { label: "Sign Up",   path: "/signup" },
                ].map((l) => (
                  <li key={l.path}>
                    <Link to={l.path} className="text-sm text-slate-500 hover:text-slate-200 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-4">Legal</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Privacy Policy", path: "/privacy-policy" },
                  { label: "Terms of Service", path: "/terms-of-service" },
                  { label: "Cookie Policy", path: "/cookie-policy" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link to={l.path} className="text-sm text-slate-500 hover:text-slate-200 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} AutoFlow. All rights reserved.
          </p>
          <p className="text-xs text-slate-700">
            Built with precision. Maintained with love.
          </p>
        </div>
      </div>
    </footer>
  );
}
