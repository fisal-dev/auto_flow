import React from "react";
import { ScrollText, CheckCircle2, AlertTriangle, Scale } from "lucide-react";
import Card from "./ui/Card";

const TermsOfService = () => {
  return (
    <div className="bg-background text-foreground min-h-screen relative overflow-hidden flex flex-col pt-24 pb-20 transition-colors duration-300">
      {/* Decorative Blur Background Glows */}
      <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 w-full flex-grow">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-slate-300 mb-6">
            <Scale className="w-3.5 h-3.5 text-indigo-400" /> Compliance & Rules
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Terms of <span className="text-indigo-400">Service</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Please read these terms carefully before utilizing our telemetry logging systems or planning vehicle upkeep cycles.
          </p>
          <p className="text-slate-500 text-xs font-medium mt-4">Last Updated: May 20, 2026</p>
        </div>

        {/* Content Card */}
        <Card variant="bordered" className="p-8 md:p-10 bg-surface/60 backdrop-blur-xl mb-12">
          <div className="space-y-8 text-slate-300">
            
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                </span>
                1. Acceptance of Terms
              </h2>
              <p className="text-sm leading-relaxed text-slate-400 pl-10">
                By setting up an account and accessing AutoFlow, you signify your compliance with these Terms of Service. If you do not accept these rules, you may terminate your account or refrain from using our interface.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <ScrollText className="w-4 h-4 text-emerald-400" />
                </span>
                2. User Account Obligations
              </h2>
              <p className="text-sm leading-relaxed text-slate-400 pl-10">
                You are responsible for maintaining the confidentiality of your sign-in credentials. You agree to submit accurate, up-to-date fleet and maintenance figures to allow our analytics modules to operate correctly.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </span>
                3. Telemetry & Forecast Disclaimer
              </h2>
              <p className="text-sm leading-relaxed text-slate-400 pl-10">
                AutoFlow is a maintenance scheduling tool, not a physical mechanical diagnostic device. Predictive alerts and fuel calculations represent estimates derived from your logs. Always consult a certified automotive mechanic for direct safety decisions.
              </p>
            </section>

          </div>
        </Card>

      </div>
    </div>
  );
};

export default TermsOfService;
