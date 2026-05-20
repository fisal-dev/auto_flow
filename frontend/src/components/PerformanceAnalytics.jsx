import React from "react";
import { GaugeCircle, IndianRupee, Droplet, TrendingUp } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";

const PerformanceAnalytics = () => {
  const maintenanceData = [
    { month: "Jan", cost: 20000 },
    { month: "Feb", cost: 15000 },
    { month: "Mar", cost: 30000 },
    { month: "Apr", cost: 25000 },
    { month: "May", cost: 40000 },
    { month: "Jun", cost: 35000 },
  ];

  const fuelConsumptionData = [
    { month: "Jan", liters: 50 },
    { month: "Feb", liters: 45 },
    { month: "Mar", liters: 55 },
    { month: "Apr", liters: 60 },
    { month: "May", liters: 65 },
    { month: "Jun", liters: 70 },
  ];

  const CustomTooltip = ({ active, payload, label, prefix = "", suffix = "" }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card px-4 py-3 border-white/10 shadow-xl">
          <p className="text-slate-400 text-xs font-bold tracking-wider mb-1">{label} 2024</p>
          <p className="text-foreground text-lg font-extrabold flex items-center">
             <span className="text-indigo-400 mr-1">{prefix}</span>
             {payload[0].value}
             <span className="text-slate-400 ml-1 text-sm">{suffix}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="page-wrapper">
        
        {/* Header Block */}
        <div className="page-header">
          <div>
            <h1 className="section-header">Performance Analytics</h1>
            <p className="section-subheader">Visualize operational costs and fleet metrics</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Maintenance Chart Card */}
          <Card variant="bordered" delay={0.1} className="p-6 bg-surface/80 flex flex-col justify-between h-[450px]">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-md">
                      <IndianRupee className="text-indigo-400 w-4 h-4" />
                  </div>
                  Upkeep Expenditures
                </h2>
                <p className="text-xs text-slate-400">Monthly progression of maintenance expenses</p>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">
                 <TrendingUp className="w-4 h-4" /> +12%
              </div>
            </div>

            <div className="flex-grow min-h-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={maintenanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCostPerf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={(v)=>`₹${v}`} />
                  <Tooltip content={<CustomTooltip prefix="₹" />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCostPerf)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Fuel Consumption Chart Card */}
          <Card variant="bordered" delay={0.2} className="p-6 bg-surface/80 flex flex-col justify-between h-[450px]">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                     <Droplet className="text-emerald-400 w-4 h-4" />
                  </div>
                  Refueling Volumes
                </h2>
                <p className="text-xs text-slate-400">Monthly totals of fuel consumption liters</p>
              </div>
              <div className="flex items-center gap-2 text-rose-400 text-sm font-bold bg-rose-500/10 px-2 py-1 rounded-lg">
                 <TrendingUp className="w-4 h-4" /> +8%
              </div>
            </div>

            <div className="flex-grow min-h-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fuelConsumptionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip content={<CustomTooltip suffix="L" />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="liters" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default PerformanceAnalytics;
