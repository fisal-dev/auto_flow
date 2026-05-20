import React from "react";
import { Cookie, Settings, ShieldAlert, FileCode } from "lucide-react";
import Card from "./ui/Card";

const CookiePolicy = () => {
  return (
    <div className="bg-background text-foreground min-h-screen relative overflow-hidden flex flex-col pt-24 pb-20 transition-colors duration-300">
      {/* Decorative Blur Background Glows */}
      <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 w-full flex-grow">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-slate-300 mb-6">
            <Cookie className="w-3.5 h-3.5 text-amber-400" /> Web Storage & Preferences
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Cookie <span className="text-amber-400">Policy</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            AutoFlow uses minimal local storage metrics and browser keys to keep your sessions secure and persist dashboard preferences.
          </p>
          <p className="text-slate-500 text-xs font-medium mt-4">Last Updated: May 20, 2026</p>
        </div>

        {/* Content Card */}
        <Card variant="bordered" className="p-8 md:p-10 bg-surface/60 backdrop-blur-xl mb-12">
          <div className="space-y-8 text-slate-300">
            
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <FileCode className="w-4 h-4 text-amber-400" />
                </span>
                1. What are Cookies and Local Storage?
              </h2>
              <p className="text-sm leading-relaxed text-slate-400 pl-10">
                Cookies and local storage data sets are minor text configurations stored directly inside your browser. They enable web applications to preserve variables and remember your access status securely without requiring re-authentication on every view.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Cookie className="w-4 h-4 text-emerald-400" />
                </span>
                2. How We Use Them
              </h2>
              <p className="text-sm leading-relaxed text-slate-400 pl-10">
                AutoFlow only utilizes necessary functional storage parameters. We save security session tokens (like your login state keys) to prevent unauthenticated access. We do not place advertising or tracking cookies on your device.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4 text-indigo-400" />
                </span>
                3. Managing Preferences
              </h2>
              <p className="text-sm leading-relaxed text-slate-400 pl-10">
                You can manage or fully purge local cookies using your browser settings panel. Disabling key local storage components will, however, prevent the dashboard authentication functions from working as designed.
              </p>
            </section>

          </div>
        </Card>

      </div>
    </div>
  );
};

export default CookiePolicy;
