import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import Card from "./ui/Card";
import Button from "./ui/Button";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSubmitted(true);
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[420px] relative z-10">

        {!submitted ? (
          <Card variant="bordered" className="p-8 sm:p-10 bg-surface/80 backdrop-blur-xl">
            <div className="text-center mb-8">
              <div className="mx-auto w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-5 glow-sm">
                <KeyRound className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-2">Reset Password</h1>
              <p className="text-slate-400 text-sm leading-relaxed">Enter the email address associated with your account and we'll send you a link to reset your password.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                Send Reset Link <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          </Card>
        ) : (
          <Card variant="bordered" className="p-8 sm:p-10 bg-surface/80 backdrop-blur-xl text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6 glow-emerald">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-3">Check your inbox</h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              We've sent a password reset link to <br />
              <span className="font-semibold text-slate-200">{email}</span>
            </p>
            <Button variant="secondary" size="lg" className="w-full" onClick={() => setSubmitted(false)}>
              Back to Sign In
            </Button>
          </Card>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
