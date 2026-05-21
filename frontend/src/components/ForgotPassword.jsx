import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, KeyRound, CheckCircle2, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { api } from "../utils/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Request, 2: Verify Code, 3: Reset, 4: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/user/forgot-password", { email });
      if (res && res.demoCode) {
        setDemoCode(res.demoCode);
      }
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send verification code. Please check the email.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/user/verify-reset-code", { email, code });
      setStep(3);
    } catch (err) {
      setError(err.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/user/reset-password", { email, code, newPassword });
      setStep(4);
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <KeyRound className="w-12 h-12 text-indigo-400 mb-6 opacity-80" />
          <h2 className="text-4xl font-extrabold text-foreground leading-tight mb-4 tracking-tight">
            Recover your access <br /> securely.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Follow the automated 3-step secure verification process to update your credentials and return to your fleet dashboard.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-sm font-medium text-slate-500">
            © {new Date().getFullYear()} AutoFlow Technologies Inc.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile Logo Branding */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center border border-indigo-500/20 shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)] bg-background">
              <img src="/autoflow_logo.png" alt="AutoFlow Logo" className="w-full h-full object-cover scale-[1.15]" />
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">
              Auto<span className="text-indigo-400">Flow</span>
            </span>
          </div>

          {/* Context Header */}
          {step === 1 && (
            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">Reset Password</h1>
              <p className="text-slate-400 text-sm">Enter your registered email address to verify your account</p>
            </div>
          )}
          {step === 2 && (
            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">Verify Code</h1>
              <p className="text-slate-400 text-sm">Enter the secure 6-digit code sent to your email</p>
            </div>
          )}
          {step === 3 && (
            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">New Password</h1>
              <p className="text-slate-400 text-sm">Establish a new secure access credential</p>
            </div>
          )}
          {step === 4 && (
            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">Success</h1>
              <p className="text-slate-400 text-sm">Your credentials have been securely updated</p>
            </div>
          )}

          {step === 1 && (
            <Card variant="bordered" className="p-8 sm:p-10 bg-surface/80 backdrop-blur-xl">
              <form onSubmit={handleRequestCode} className="space-y-6">
                {error && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm font-semibold text-rose-400 text-center animate-scale-in">
                    {error}
                  </div>
                )}

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

                <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={loading}>
                  Send Verification Code <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
            </Card>
          )}

          {step === 2 && (
            <Card variant="bordered" className="p-8 sm:p-10 bg-surface/80 backdrop-blur-xl">
              <form onSubmit={handleVerifyCode} className="space-y-6">
                {error && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm font-semibold text-rose-400 text-center animate-scale-in">
                    {error}
                  </div>
                )}
                {demoCode && (
                  <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-sm font-medium text-slate-300 text-center animate-scale-in">
                    Demo Mode: Use verification code <span className="font-mono font-bold text-indigo-400">{demoCode}</span> to proceed.
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="input-field text-center font-mono text-xl tracking-widest h-12 bg-white/5"
                    placeholder="000000"
                    required
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={loading}>
                  Verify Code <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
            </Card>
          )}

          {step === 3 && (
            <Card variant="bordered" className="p-8 sm:p-10 bg-surface/80 backdrop-blur-xl">
              <form onSubmit={handleResetPassword} className="space-y-6">
                {error && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm font-semibold text-rose-400 text-center animate-scale-in">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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

                <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={loading}>
                  Reset Password <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
            </Card>
          )}

          {step === 4 && (
            <Card variant="bordered" className="p-8 sm:p-10 bg-surface/80 backdrop-blur-xl text-center animate-scale-in">
              <div className="mx-auto w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6 glow-emerald">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground mb-3">Password Updated</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Your password has been successfully updated in our database. You can now use your new credentials to securely log in.
              </p>
              <Button variant="primary" size="lg" className="w-full" onClick={() => navigate("/login")}>
                Proceed to Sign In
              </Button>
            </Card>
          )}

          {step < 4 && (
            <div className="mt-8 text-center">
              <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors group">
                <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" /> Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
