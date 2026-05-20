import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, ShieldCheck, Car } from "lucide-react";
import Card from "./ui/Card";
import Button from "./ui/Button";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("isLoggedIn", "true");
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
      {/* Left Branding Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-surface relative overflow-hidden flex-col justify-between p-12 border-r border-white/5 transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/20 via-surface to-background pointer-events-none"></div>

        <Link to="/" className="relative z-10 flex items-center gap-2.5 group w-max">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center border border-indigo-500/20 group-hover:border-indigo-500/40 transition-all duration-200 shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)] bg-background">
            <img src="/autoflow_logo.png" alt="AutoFlow Logo" className="w-full h-full object-cover scale-[1.15]" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">
            Auto<span className="text-indigo-400">Flow</span>
          </span>
        </Link>

        <div className="relative z-10 max-w-md">
          <ShieldCheck className="w-12 h-12 text-indigo-400 mb-6 opacity-80" />
          <h2 className="text-4xl font-extrabold text-foreground leading-tight mb-4 tracking-tight">
            Manage your fleet <br /> with precision.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Sign in to access your telemetry, manage expenses, and predict maintenance before issues arise.
          </p>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-[420px] relative z-10">

          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center border border-indigo-500/20 shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)] bg-background">
              <img src="/autoflow_logo.png" alt="AutoFlow Logo" className="w-full h-full object-cover scale-[1.15]" />
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">
              Auto<span className="text-indigo-400">Flow</span>
            </span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">Welcome Back</h1>
            <p className="text-slate-400 text-sm">Enter your credentials to securely access your fleet</p>
          </div>

          <Card variant="bordered" className="p-8 sm:p-10 bg-surface/80 backdrop-blur-xl">
            <form onSubmit={handleLogin} className="space-y-6">

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-11 h-12 bg-white/5"
                    placeholder="manager@fleet.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-11 h-12 bg-white/5"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group mt-2">
                <input type="checkbox" className="w-4 h-4 rounded bg-white/5 border-white/10 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-0" />
                <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors">Remember my device</span>
              </label>

              <Button type="submit" variant="primary" size="lg" className="w-full mt-4" isLoading={loading}>
                Secure Sign In <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          </Card>

          <p className="mt-8 text-center text-sm font-medium text-slate-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Request access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
