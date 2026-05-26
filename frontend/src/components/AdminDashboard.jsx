import React, { useState, useEffect } from "react";
import { Users, Car, AlertTriangle, ShieldCheck, Plus, Settings, TrendingUp, MapPin } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import StatCard from "./ui/StatCard";
import { api } from "../utils/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    totalComplaints: 0,
    totalStores: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const data = await api.get("/admin/dashboard");
        
        const relativeTime = (dateString) => {
          if (!dateString) return "";
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

        setStats({
          totalUsers: data.totalUsers || 0,
          totalVehicles: data.totalVehicles || 0,
          totalComplaints: data.totalComplaints || 0,
          totalStores: data.totalStores || 0,
          recentActivity: (data.recentActivity || []).map(act => ({
            ...act,
            time: relativeTime(act.time)
          }))
        });
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Admin Operations Center</h1>
          <p className="text-sm text-slate-400">System-wide health indicators and metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toString()}
            icon={Users}
            subtitle="Active accounts in database"
          />
          <StatCard
            title="Registered Stores"
            value={stats.totalStores.toString()}
            icon={MapPin}
            subtitle="Active servicing hubs"
          />
          <StatCard
            title="Active Complaints"
            value={stats.totalComplaints.toString()}
            icon={AlertTriangle}
            subtitle="Pending assignment or response"
          />
          <StatCard
            title="System Security"
            value="Optimal"
            icon={ShieldCheck}
            subtitle="Helmet & rate limits active"
          />
        </div>

        {/* Details & Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card variant="bordered" className="lg:col-span-2 p-6 bg-surface/80">
            <h2 className="text-lg font-bold mb-4">System Overview</h2>
            <p className="text-sm text-slate-400 mb-6">
              Use the sidebar to manage specific areas of the application:
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <strong>User Directory:</strong> View, verify, and terminate customer/manager profiles.
              </li>
              <li className="flex items-center gap-3 text-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <strong>Complaints Support:</strong> Read customer reported failures and assign them to specific workshops.
              </li>
              <li className="flex items-center gap-3 text-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <strong>Service Stations:</strong> Register new service station addresses and manage repair capacities.
              </li>
            </ul>
          </Card>

          <Card variant="bordered" className="p-6 bg-surface/80">
            <h2 className="text-lg font-bold mb-4">System Alerts</h2>
            <div className="space-y-4">
              {stats.recentActivity.map((act) => (
                <div key={act.id} className="flex justify-between items-start text-xs border-b border-white/5 pb-2.5">
                  <div>
                    <p className="font-semibold text-slate-200">{act.text}</p>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{act.type}</span>
                  </div>
                  <span className="text-slate-500 font-semibold">{act.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
