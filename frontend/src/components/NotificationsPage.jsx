import React, { useState, useEffect } from "react";
import { AlertTriangle, Bell, Info, CalendarCheck, CheckCircle2, X } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import { api } from "../utils/api";
import { useToast } from "./ui/Toast";

const NotificationsPage = () => {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.get("/notifications");
      setNotifications(data);
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const colors = {
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)]",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]",
    success: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
  };

  const getIcon = (color, type) => {
    if (color === "amber" || type === "warning") return AlertTriangle;
    if (color === "rose" || type === "error" || type === "danger") return Bell;
    if (color === "indigo" || type === "info") return CalendarCheck;
    return Info;
  };

  const getColorClass = (color, type) => {
    if (color && colors[color]) return colors[color];
    if (type === "warning") return colors.amber;
    if (type === "error" || type === "danger") return colors.rose;
    if (type === "info") return colors.indigo;
    return colors.indigo;
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      try {
        await api.delete("/notifications");
        setNotifications([]);
        toast.success("Notifications cleared successfully.");
      } catch (err) {
        toast.error(err.message || "Failed to clear notifications.");
      }
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="page-wrapper max-w-3xl mx-auto">
        
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
              <Bell className="w-6 h-6 text-indigo-400" /> Notifications
            </h1>
            <p className="text-sm text-slate-400">System updates and preventative maintenance actions</p>
          </div>

          {notifications.length > 0 && (
            <Button variant="secondary" className="px-3 bg-white/5 border-white/10 text-rose-400 hover:bg-white/10 font-bold" onClick={handleClearAll} icon={CheckCircle2}>
              Clear All
            </Button>
          )}
        </div>

        {/* Notifications list */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <Card variant="bordered" className="text-center py-20 bg-surface/80">
            <div className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-500 mb-5 glow-sm">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Your inbox is clear</h3>
            <p className="text-slate-400 text-sm">No new system alerts or upkeep notifications.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif, i) => {
              const Icon = getIcon(notif.color, notif.type);
              const colorClass = getColorClass(notif.color, notif.type);
              return (
                <Card 
                  key={notif._id} 
                  variant="bordered" 
                  delay={i * 0.05} 
                  hoverEffect 
                  className={`p-5 flex gap-5 items-start bg-surface/80 group transition-all relative ${!notif.read ? "border-indigo-500/30 bg-indigo-500/5" : ""}`}
                  onClick={() => !notif.read && handleMarkRead(notif._id)}
                >
                  <div className={`p-3 rounded-2xl border flex-shrink-0 ${colorClass} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={notif.type === "error" ? "danger" : notif.type || "info"} size="sm" dot pulse={notif.type === "error" && !notif.read}>
                          {notif.type ? notif.type.toUpperCase() : "INFO"}
                        </Badge>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" title="Unread"></span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-500">{formatRelativeTime(notif.createdAt || notif.date)}</span>
                    </div>
                    <p className="text-slate-200 text-sm leading-relaxed font-medium">{notif.message}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
