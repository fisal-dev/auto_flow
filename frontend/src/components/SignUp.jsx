import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, ShieldCheck, Car, Check, Eye, EyeOff } from "lucide-react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { api } from "../utils/api";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Reset all fields when page is opened/reloaded (mounted)
  React.useEffect(() => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setLoading(false);
    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/user/register", { email, password });
      navigate("/login", { state: { successMessage: "Account created successfully! Please sign in." } });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Simple password strength calculator
  const strength = Math.min(100, (password.length / 12) * 100);
  const getStrengthColor = () => {
    if (strength < 33) return "bg-rose-500";
    if (strength < 66) return "bg-amber-500";
    return "bg-emerald-500";
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
          <ShieldCheck className="w-12 h-12 text-emerald-400 mb-6 opacity-80" />
          <h2 className="text-4xl font-extrabold text-foreground leading-tight mb-4 tracking-tight">
            Join the new standard <br /> in fleet management.
          </h2>
          <ul className="space-y-4 mt-8">
            {[
              "Real-time vehicle telemetry tracking",
              "Automated maintenance forecasting",
              "Comprehensive expense analytics"
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10">
          <p className="text-sm font-medium text-slate-500">
            © {new Date().getFullYear()} AutoFlow Technologies Inc.
          </p>
        </div>
      </div>

      {/* Right Sign Up Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-[420px] relative z-10 py-12">

          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center border border-indigo-500/20 shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)] bg-background">
              <img src="/autoflow_logo.png" alt="AutoFlow Logo" className="w-full h-full object-cover scale-[1.15]" />
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">
              Auto<span className="text-indigo-400">Flow</span>
            </span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">Create Account</h1>
            <p className="text-slate-400 text-sm">Step 1 of 1: Configure your access credentials</p>
          </div>

          <Card variant="bordered" className="p-8 sm:p-10 bg-surface/80 backdrop-blur-xl">
            <form onSubmit={handleSignUp} className="space-y-6">

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
                    placeholder="user@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-11 pr-10 h-12 bg-white/5"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div className={`h-full ${getStrengthColor()} transition-all duration-300`} style={{ width: `${strength}%` }}></div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-11 pr-10 h-12 bg-white/5"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group mt-4">
                <input type="checkbox" required className="w-4 h-4 mt-0.5 rounded bg-white/5 border-white/10 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-0" />
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
                  I agree to the <Link to="/terms-of-service" onClick={(e) => e.stopPropagation()} className="text-indigo-400 hover:text-indigo-300 transition-colors">Terms of Service</Link> and <Link to="/privacy-policy" onClick={(e) => e.stopPropagation()} className="text-indigo-400 hover:text-indigo-300 transition-colors">Privacy Policy</Link>.
                </span>
              </label>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-bold text-rose-400 text-center">
                  {error}
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" className="w-full mt-4" isLoading={loading}>
                Initialize Account <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          </Card>

          <p className="mt-8 text-center text-sm font-medium text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
