import React, { useState, useEffect } from "react";
import { User, Mail, Phone, CheckCircle2, ShieldCheck } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { api } from "../utils/api";

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

const UserProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    notifications: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get("/user/profile")
      .then(res => {
        setProfile({
          name: res.name || "",
          email: res.email || "",
          phone: res.phone || "",
          notifications: res.notifications !== undefined ? res.notifications : true,
        });
      })
      .catch(err => console.error("Error fetching profile:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const updated = await api.put("/user/profile", profile);
      setProfile({
        name: updated.name || "",
        email: updated.email || "",
        phone: updated.phone || "",
        notifications: updated.notifications !== undefined ? updated.notifications : true,
      });
      // Update cached user info
      const cached = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...cached, name: updated.name, email: updated.email }));
      setSuccess(true);
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile({
      ...profile,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <DashboardLayout>
      <div className="page-wrapper max-w-2xl mx-auto">
        
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="section-header">User Profile</h1>
            <p className="section-subheader">Manage your personal profile and account credentials</p>
          </div>
        </div>

        <Card variant="bordered" className="bg-surface/80 p-8 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20" />

          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 relative z-10 border-b border-white/5 pb-8">
             <div className="relative group">
               <div className="w-24 h-24 rounded-full bg-indigo-500/20 border-2 border-indigo-500/40 flex items-center justify-center text-indigo-400 text-3xl font-extrabold group-hover:border-indigo-400 transition-colors">
                 {getInitials(profile.name)}
               </div>
             </div>
             <div className="text-center sm:text-left">
               <h2 className="text-2xl font-extrabold text-foreground">{profile.name}</h2>
               <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-md w-max">
                 <ShieldCheck className="w-3.5 h-3.5" /> Verified Account
               </div>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="9854671230"
                  required
                />
              </div>
            </div>

            {/* Enable Notifications checkbox */}
            <label className="flex items-center gap-3 cursor-pointer group text-sm text-slate-400 mt-2 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <input
                type="checkbox"
                name="notifications"
                checked={profile.notifications}
                onChange={handleChange}
                className="w-5 h-5 rounded bg-background/70 border-white/10 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-background"
              />
              <span className="group-hover:text-foreground transition-colors font-semibold">Enable critical system alerts via SMS/Email</span>
            </label>

            {success && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold justify-center bg-emerald-500/10 border border-emerald-500/20 py-3 rounded-xl animate-scale-in">
                <CheckCircle2 className="w-5 h-5" /> Changes saved successfully!
              </div>
            )}

            {/* Action button */}
            <div className="pt-4 border-t border-white/5">
              <Button type="submit" variant="primary" className="w-full" size="lg" isLoading={saving}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
