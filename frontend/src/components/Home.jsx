import React from "react";
import { Link } from "react-router-dom";
import { Wrench, CalendarClock, LineChart, ChevronRight, Activity, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Card from "./ui/Card";
import Button from "./ui/Button";

const HomePage = () => {
  return (
    <div className="bg-background text-foreground min-h-screen relative overflow-hidden flex flex-col pt-16">
      {/* Immersive background glows */}
      <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[20%] right-[10%] w-[700px] h-[700px] bg-emerald-600/5 rounded-full blur-[150px] pointer-events-none animate-pulse-slow delay-1000"></div>

      {/* Hero Section */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center py-24 lg:py-36 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl text-center mx-auto"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 glass-card border border-indigo-500/30 text-indigo-300 rounded-full text-sm font-semibold mb-8 shadow-[0_0_20px_rgba(var(--accent-rgb),0.15)]"
          >
            <Activity className="w-4 h-4" /> Next-Gen Fleet Intelligence
          </motion.div>

          <h1 className="text-5xl lg:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 mb-8 tracking-tight leading-[1.05]">
            Master Your Vehicle's <br className="hidden lg:block"/> True Potential
          </h1>
          
          <p className="text-lg lg:text-2xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            Stay ahead of breakdowns, orchestrate service histories, and master fuel economy with our state-of-the-art telemetry dashboard.
          </p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <Link to="/signup" className="w-full sm:w-auto">
              <Button variant="primary" size="xl" className="w-full sm:w-auto px-10 rounded-2xl">
                Get Started <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link to="/about" className="w-full sm:w-auto">
              <Button variant="secondary" size="xl" className="w-full sm:w-auto px-10 rounded-2xl glass-panel">
                Explore Features
              </Button>
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Animated Stats Ticker (Mockup) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-20 flex flex-wrap justify-center gap-8 text-slate-500 text-sm font-medium"
        >
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> 10k+ Vehicles Tracked</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400"/> 99.9% Uptime</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400"/> ₹15 Crore+ Maintenance Saved</div>
        </motion.div>
      </div>

      {/* Key Features Section */}
      <div className="container mx-auto px-6 py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-white tracking-tight">
            Engineered for Precision
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A comprehensive suite of tools designed to optimize performance, minimize downtime, and reduce operational costs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { icon: Wrench, title: "Predictive Maintenance", desc: "Maintain robust, detailed service records with smart forecasting and visual timelines.", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
            { icon: CalendarClock, title: "Intelligent Reminders", desc: "Never miss an oil change or tire rotation. Get proactive smart alerts before services are overdue.", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
            { icon: LineChart, title: "Advanced Analytics", desc: "Gain deep visual insights into fuel spend, expense patterns, and critical operating parameters.", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" }
          ].map((feat, i) => (
            <Card key={i} delay={i * 0.1} glowingBorder className="text-center p-10 h-full flex flex-col items-center group">
              <div className={`p-5 rounded-2xl ${feat.bg} ${feat.border} border mb-8 group-hover:scale-110 transition-transform duration-300`}>
                <feat.icon className={`w-10 h-10 ${feat.color}`} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{feat.title}</h3>
              <p className="text-slate-400 text-base leading-relaxed flex-grow">
                {feat.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="py-24 bg-[#0A0F1C]/50 border-y border-white/5 relative z-10">
         <div className="container mx-auto px-6 max-w-5xl">
            <h2 className="text-3xl lg:text-4xl font-bold mb-16 text-center text-white tracking-tight">
              Streamlined Workflow
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
               {/* Connecting line (desktop) */}
               <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0"></div>
               
               {[
                 { step: "01", title: "Add Your Fleet", desc: "Input vehicle details, VINs, and initial metrics into our secure vault." },
                 { step: "02", title: "Log Activities", desc: "Record fuel-ups, expenses, and maintenance as they happen." },
                 { step: "03", title: "Gain Insights", desc: "Let our algorithms generate cost analyses and predictive alerts." },
               ].map((s, i) => (
                 <div key={i} className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full glass-card flex items-center justify-center text-3xl font-bold text-indigo-400 mb-6 border-indigo-500/30 glow-sm">
                      {s.step}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Premium CTA Band */}
      <div className="relative py-32 z-10 mt-10">
        <div className="absolute inset-0 glass-panel border-y border-white/5 skew-y-2 transform origin-bottom-left"></div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <ShieldCheck className="w-16 h-16 mx-auto text-emerald-400 mb-8" />
          <h2 className="text-4xl lg:text-6xl font-extrabold mb-6 text-white tracking-tight">
            Elevate Your Standards
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Join the smart fleet movement. Manage individual vehicles or entire enterprise fleets with unparalleled ease and security.
          </p>
          <Link to="/signup">
            <Button variant="primary" size="xl" className="px-12 rounded-full shadow-[0_0_40px_rgba(var(--accent-rgb),0.3)] hover:shadow-[0_0_60px_rgba(var(--accent-rgb),0.5)]">
              Initialize Dashboard <Zap className="w-5 h-5 ml-2 text-yellow-300" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
