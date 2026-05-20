import React from "react";
import { Shield, Lock, Eye, ScrollText } from "lucide-react";
import Card from "./ui/Card";

const PrivacyPolicy = () => {
  return (
    <div className="bg-background text-foreground min-h-screen relative overflow-hidden flex flex-col pt-24 pb-20 transition-colors duration-300">
      {/* Decorative Blur Background Glows */}
      <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 w-full flex-grow">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-slate-300 mb-6">
            <Shield className="w-3.5 h-3.5 text-emerald-400" /> Security & Trust
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Privacy <span className="text-emerald-400">Policy</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Your trust is our most valuable asset. Learn how AutoFlow collects, stores, and handles vehicle telemetry, service data, and user profile credentials.
          </p>
          <p className="text-slate-500 text-xs font-medium mt-4">Last Updated: May 20, 2026</p>
        </div>

        {/* Content Card */}
        <Card variant="bordered" className="p-8 md:p-10 bg-surface/60 backdrop-blur-xl mb-12">
          <div className="space-y-8 text-slate-300">
            
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4 text-emerald-400" />
                </span>
                1. Information We Collect
              </h2>
              <p className="text-sm leading-relaxed text-slate-400 pl-10">
                To provide predictive maintenance tracking and telemetry management, AutoFlow processes your profile coordinates (email addresses), physical vehicle descriptions (makes, models, production metrics), and log records (mileage, fuel inputs, repair invoices). All telemetry inputs are voluntarily submitted.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-indigo-400" />
                </span>
                2. Data Protection & Security
              </h2>
              <p className="text-sm leading-relaxed text-slate-400 pl-10">
                We employ standard industry security protocols to protect your files and data sets. Profile and login states are encrypted and stored in compliance with standard network safety regulations. Telemetry information is cached locally for swift dashboard operations.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <ScrollText className="w-4 h-4 text-amber-400" />
                </span>
                3. Sharing of Information
              </h2>
              <p className="text-sm leading-relaxed text-slate-400 pl-10">
                AutoFlow does not sell or distribute personal vehicle identifiers or logs. Maintenance information and expenses are strictly used to compute local performance analytics and cost structures for your private portal.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-rose-400" />
                </span>
                4. Your Rights
              </h2>
              <p className="text-sm leading-relaxed text-slate-400 pl-10">
                You hold direct access rights over your inputs. You may add, delete, or re-initialize any vehicles, fuel records, or repair tickets inside your dashboard at any time. To remove your entire profile registry, contact support or use the Settings tab.
              </p>
            </section>

          </div>
        </Card>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
