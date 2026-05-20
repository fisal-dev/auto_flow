import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";
import Button from "../components/ui/Button";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Gradient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-1000"></div>

      {/* Glassmorphic Panel */}
      <div className="relative z-10 w-full max-w-lg bg-surface/80 backdrop-blur-xl border border-white/5 rounded-3xl p-10 sm:p-12 text-center shadow-2xl transition-transform">
        
        {/* Glowing Alert Icon */}
        <div className="inline-flex p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 mb-8 shadow-[0_0_30px_rgba(244,63,94,0.15)] glow-rose">
          <AlertTriangle className="w-16 h-16 animate-bounce" strokeWidth={1.5} />
        </div>

        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-foreground to-slate-500 mb-2 tracking-tighter drop-shadow-sm">404</h1>
        <h2 className="text-2xl font-extrabold text-foreground mb-4">Page Not Found</h2>
        
        <p className="text-slate-400 mb-10 text-sm leading-relaxed max-w-xs mx-auto">
          The routing endpoint you are looking for might have been removed or is temporarily unavailable.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="secondary" onClick={() => window.history.back()} icon={ArrowLeft} iconPosition="left" className="w-full sm:w-auto">
             Go Back
          </Button>
          <Link to="/" className="w-full sm:w-auto">
             <Button variant="primary" icon={Home} className="w-full">
               Return Home
             </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
