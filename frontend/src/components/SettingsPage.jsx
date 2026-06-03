import React, { useState, useEffect } from "react";
import { CheckCircle2, Settings2, Sliders, BellRing, Briefcase, RefreshCcw, Save, Lock, Key, AlertCircle, Eye, EyeOff } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { api } from "../utils/api";
import { useToast } from "./ui/Toast";

const SettingsPage = () => {
  const toast = useToast();
  const [settings, setSettings] = useState({
    notifications: true,
    reminderFrequency: "Weekly",
    preferredServiceProvider: "",
  });
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Change password states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long!");
      return;
    }

    setPasswordSaving(true);
    try {
      await api.put("/user/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordSuccess(true);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully!");
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 5000);
    } catch (err) {
      setPasswordError(err.message || "Failed to update password.");
      toast.error(err.message || "Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const paySuccess = queryParams.get("success") === "true";
    const sessionId = queryParams.get("session_id");

    const loadSettings = async () => {
      try {
        const [settingsRes, profileRes] = await Promise.all([
          api.get("/user/settings"),
          api.get("/user/profile")
        ]);
        setSettings({
          notifications: settingsRes.notifications !== undefined ? settingsRes.notifications : true,
          reminderFrequency: settingsRes.reminderFrequency || "Weekly",
          preferredServiceProvider: settingsRes.preferredServiceProvider || "",
        });
        setSubscriptionStatus(profileRes.subscriptionStatus || "free");
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    };

    if (paySuccess && sessionId) {
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      setLoading(true);
      api.post("/stripe/verify-session", { sessionId })
        .then(res => {
          if (res.success) {
            setSubscriptionStatus("premium");
            toast.success("Upgrade successful! Welcome to AutoFlow Premium.");
          } else {
            toast.warning("Payment verification pending or failed.");
          }
        })
        .catch(err => {
          console.error("Error verifying payment session:", err);
          toast.error("Error verifying payment session.");
        })
        .finally(() => {
          loadSettings();
        });
    } else {
      loadSettings();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const res = await api.put("/user/settings", settings);
      setSettings({
        notifications: res.notifications !== undefined ? res.notifications : true,
        reminderFrequency: res.reminderFrequency || "Weekly",
        preferredServiceProvider: res.preferredServiceProvider || "",
      });
      setSuccess(true);
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const res = await api.post("/stripe/create-checkout-session");
      if (res.url) {
        window.location.href = res.url;
      } else {
        toast.error("Failed to create Stripe payment session.");
      }
    } catch (err) {
      console.error("Error upgrading:", err);
      toast.error(err.message || "Error creating Stripe session.");
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-wrapper max-w-2xl mx-auto">
        
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="section-header flex items-center gap-3">
               <Settings2 className="w-8 h-8 text-indigo-400" /> System Settings
            </h1>
            <p className="section-subheader">Configure your personal preferences and notification rules</p>
          </div>
        </div>



        <Card variant="bordered" className="bg-[#0D1424]/80 p-8 relative overflow-hidden">
          
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />

          <div className="flex items-center gap-3 border-b border-white/5 pb-5 mb-8 relative z-10">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Application Preferences</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-8 relative z-10">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {/* Reminder Frequency */}
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reminder Frequency</label>
                 <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                       <RefreshCcw className="w-4 h-4" />
                    </span>
                    <select
                      name="reminderFrequency"
                      value={settings.reminderFrequency}
                      onChange={handleChange}
                      className="input-field pl-10 appearance-none bg-no-repeat bg-[position:right_10px_center]"
                      style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="%2364748b" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')` }}
                    >
                      <option value="Daily">Daily Sync</option>
                      <option value="Weekly">Weekly Summary</option>
                      <option value="Monthly">Monthly Digest</option>
                    </select>
                 </div>
               </div>

               {/* Preferred Service Provider */}
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preferred Provider</label>
                 <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                       <Briefcase className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      name="preferredServiceProvider"
                      value={settings.preferredServiceProvider}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="Toyota Certified Service"
                    />
                 </div>
               </div>
            </div>

            {success && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold justify-center bg-emerald-500/10 border border-emerald-500/20 py-3 rounded-xl animate-scale-in">
                <CheckCircle2 className="w-5 h-5" /> Settings updated successfully!
              </div>
            )}

            {/* Save button */}
            <div className="pt-4 border-t border-white/5">
               <Button type="submit" variant="primary" className="w-full" size="lg" isLoading={saving} icon={Save}>
                 Save Preferences
               </Button>
            </div>
          </form>

          {/* Collapsible Change Password Section */}
          <form onSubmit={handlePasswordSubmit} className="pt-8 mt-8 border-t border-white/10 space-y-6 relative z-10">
             <label className="flex items-center justify-between cursor-pointer select-none group">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:bg-rose-500/20 transition-all">
                   <Lock className="w-4 h-4" />
                 </div>
                 <div>
                   <span className="text-white font-bold block text-sm group-hover:text-rose-300 transition-colors">Update Account Password</span>
                   <span className="text-slate-400 text-xs">Reveal fields to update your security credentials</span>
                 </div>
               </div>
               <div className="relative inline-flex items-center">
                 <input
                   type="checkbox"
                   checked={showChangePassword}
                   onChange={(e) => setShowChangePassword(e.target.checked)}
                   className="sr-only peer"
                 />
                 <div className="w-11 h-6 bg-[#0D121F] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-rose-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border border-white/10 peer-checked:bg-rose-500"></div>
               </div>
             </label>

            {showChangePassword && (
              <div className="pt-6 border-t border-white/5 space-y-4 animate-scale-up">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Password</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 group-focus-within:text-rose-400 transition-colors">
                        <Key className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="input-field pl-9 pr-9 text-xs focus:border-rose-500/40 focus:ring-rose-500/10"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 group-focus-within:text-rose-400 transition-colors">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="input-field pl-9 pr-9 text-xs focus:border-rose-500/40 focus:ring-rose-500/10"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 group-focus-within:text-rose-400 transition-colors">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="input-field pl-9 pr-9 text-xs focus:border-rose-500/40 focus:ring-rose-500/10"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {passwordError && (
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold justify-center bg-rose-500/10 border border-rose-500/20 py-2 rounded-xl">
                    <AlertCircle className="w-4 h-4" /> {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold justify-center bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" /> Password updated successfully!
                  </div>
                )}

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="sm" 
                    isLoading={passwordSaving}
                    className="bg-rose-600 hover:bg-rose-500 text-xs py-2 px-4 shadow-lg shadow-rose-500/15 border-none font-bold"
                  >
                    Update Password
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
