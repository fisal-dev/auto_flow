import React, { useState, useEffect } from "react";
import { CheckCircle2, Settings2, Sliders, BellRing, Briefcase, RefreshCcw, Save } from "lucide-react";
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

        {/* Billing / Plan Card */}
        <Card variant="bordered" className="p-6 bg-surface/80 border-indigo-500/20 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[50px] pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Account Plan</span>
              <h2 className="text-xl font-extrabold text-white mt-1">
                AutoFlow {subscriptionStatus === "premium" ? "Premium 🚀" : "Basic (Free)"}
              </h2>
              <p className="text-slate-400 text-xs mt-1.5 max-w-md">
                {subscriptionStatus === "premium" 
                  ? "Thank you for supporting AutoFlow! You have unlocked all premium metrics, reports, and unlimited fleet logs." 
                  : "Unlock premium analytics, priority notifications, and automatic scheduling features."
                }
              </p>
            </div>
            {subscriptionStatus !== "premium" && (
              <Button 
                onClick={handleUpgrade} 
                variant="primary" 
                size="md" 
                isLoading={upgrading}
                className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-indigo-500 to-purple-500 border-none hover:opacity-90 shadow-lg shadow-indigo-500/25"
              >
                Upgrade to Premium
              </Button>
            )}
          </div>
        </Card>

        <Card variant="bordered" className="bg-[#0D1424]/80 p-8 relative overflow-hidden">
          
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />

          <div className="flex items-center gap-3 border-b border-white/5 pb-5 mb-8 relative z-10">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Application Preferences</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-8 relative z-10">
            
            {/* Enable Notifications checkbox */}
            <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] flex items-start gap-4">
               <div className="mt-1">
                  <BellRing className="w-5 h-5 text-indigo-400" />
               </div>
               <div className="flex-grow">
                  <label className="flex items-start justify-between cursor-pointer group">
                     <div>
                        <span className="text-white font-bold block mb-1">Email Notifications</span>
                        <span className="text-slate-400 text-sm">Receive updates regarding oil status and rotations</span>
                     </div>
                     <div className="relative inline-flex items-center cursor-pointer">
                        <input
                           type="checkbox"
                           name="notifications"
                           checked={settings.notifications}
                           onChange={handleChange}
                           className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#0D121F] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border border-white/10 peer-checked:bg-indigo-500"></div>
                     </div>
                  </label>
               </div>
            </div>

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
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
