import React, { useState } from "react";
import { AlertTriangle, Bell, Info, CalendarCheck, CheckCircle2 } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Oil change due for Toyota Corolla on 20th Feb 2025.", type: "warning", date: "2 hours ago", icon: AlertTriangle, color: "amber" },
    { id: 2, message: "Your vehicle insurance expires in 5 days!", type: "error", date: "1 day ago", icon: Bell, color: "rose" },
    { id: 3, message: "Tire rotation scheduled for Honda Civic next week.", type: "info", date: "3 days ago", icon: CalendarCheck, color: "indigo" }
  ]);

  const colors = {
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
  };

  const handleClearAll = () => {
    setNotifications([]);
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
            <Button variant="secondary" className="px-3" onClick={handleClearAll} icon={CheckCircle2}>
              Clear All
            </Button>
          )}
        </div>

        {/* Notifications list */}
        {notifications.length === 0 ? (
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
              const Icon = notif.icon;
              return (
                <Card key={notif.id} variant="bordered" delay={i * 0.1} hoverEffect className="p-5 flex gap-5 items-start bg-surface/80 group">
                  <div className={`p-3 rounded-2xl border flex-shrink-0 ${colors[notif.color]} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                      <Badge variant={notif.type} size="sm" dot pulse={notif.type === 'error'}>
                        {notif.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs font-semibold text-slate-500">{notif.date}</span>
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
