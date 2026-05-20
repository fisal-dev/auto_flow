import React from "react";
import { FaCalendarCheck, FaGasPump, FaFileInvoiceDollar, FaRegBell } from "react-icons/fa";
import { Activity, Shield, Users, Zap, CheckCircle2 } from "lucide-react";
import Card from "./ui/Card";
import Button from "./ui/Button";

const About = () => {
  const highlights = [
    {
      title: "Maintenance Reminders",
      desc: "Never miss an oil change or tire rotation. Smart date timers remind you beforehand.",
      icon: FaCalendarCheck,
      color: "emerald"
    },
    {
      title: "Fuel Efficiency Log",
      desc: "Monitor fuel consumption trends and mileage logs to maximize operating economics.",
      icon: FaGasPump,
      color: "amber"
    },
    {
      title: "Expense Analytics",
      desc: "Track purchase invoices and upkeep costs to generate helpful operational reports.",
      icon: FaFileInvoiceDollar,
      color: "indigo"
    },
    {
      title: "Smart Notifications",
      desc: "Custom priority alert center warns you about impending schedules or vehicle issues.",
      icon: FaRegBell,
      color: "rose"
    }
  ];

  const colors = {
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
  };

  return (
    <div className="bg-background text-foreground min-h-screen relative overflow-hidden flex flex-col pt-24 pb-20 transition-colors duration-300">
      {/* Decorative Blur Background Glows */}
      <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 w-full flex-grow">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-slate-300 mb-6">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Empowering Fleets Worldwide
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Built for those who value <span className="gradient-text-indigo">performance</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            We engineered AutoFlow to act as a proactive, high-efficiency operations hub for individual drivers and professional fleet managers alike. We believe maintenance shouldn't be a guessing game.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} glowingBorder={false} hoverEffect={true} className="p-8 flex gap-5 items-start bg-surface/60">
                <div className={`p-4 rounded-2xl border flex-shrink-0 ${colors[item.color]}`}>
                  <Icon className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{item.title}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
        
        {/* Built For Section */}
        <div className="mb-20">
           <h3 className="text-3xl font-bold text-center text-white mb-12">Who is this for?</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Individuals", icon: Activity, desc: "Keep track of your personal car's history, expenses, and service dates easily." },
                { title: "Small Business", icon: Shield, desc: "Manage a handful of delivery or service vehicles without complex enterprise software." },
                { title: "Fleet Managers", icon: Users, desc: "Monitor dozens of vehicles, track fuel efficiency across the board, and handle team reports." },
              ].map((persona, i) => (
                <Card key={i} variant="bordered" className="text-center p-8">
                  <div className="mx-auto w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                     <persona.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-3">{persona.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{persona.desc}</p>
                </Card>
              ))}
           </div>
        </div>

        {/* Core Values / Stats */}
        <div className="glass-panel p-10 md:p-16 rounded-3xl text-center">
           <h3 className="text-2xl font-bold text-white mb-8">Our Commitment to Quality</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                 { label: "Uptime", val: "99.9%" },
                 { label: "Support", val: "24/7" },
                 { label: "Updates", val: "Weekly" },
                 { label: "Security", val: "AES-256" },
              ].map((stat, i) => (
                 <div key={i}>
                    <p className="text-4xl font-extrabold text-white mb-2">{stat.val}</p>
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
                 </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default About;
