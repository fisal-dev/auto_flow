import React from "react";
import { Link } from "react-router-dom";
import { Car, Wrench, IndianRupee, Plus, Fuel, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardLayout from "./DashboardLayout";
import StatCard from "./ui/StatCard";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

const Dashboard = () => {
  const monthlyCostsData = [
    { name: "Sep", cost: 10000 },
    { name: "Oct", cost: 25000 },
    { name: "Nov", cost: 15000 },
    { name: "Dec", cost: 38000 },
    { name: "Jan", cost: 20000 },
    { name: "Feb", cost: 102450 },
  ];

  const recentRecords = [
    { vehicle: "Tata Nexon", service: "Oil Change", date: "Feb 10, 2025", cost: "₹4,200", status: "success", label: "Completed" },
    { vehicle: "Mahindra Thar", service: "Brake Pad Replacement", date: "Feb 08, 2025", cost: "₹12,500", status: "warning", label: "In Progress" },
    { vehicle: "Hyundai Creta", service: "Battery Health Check", date: "Feb 05, 2025", cost: "₹0", status: "success", label: "Completed" },
    { vehicle: "Maruti Suzuki Swift", service: "Tire Rotation", date: "Feb 02, 2025", cost: "₹3,500", status: "success", label: "Completed" },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card px-4 py-3 border-indigo-500/20 shadow-xl">
          <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">{label} 2024</p>
          <p className="text-white text-lg font-extrabold flex items-center">
             <span className="text-indigo-400 mr-1">₹</span>{payload[0].value}
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
            <h1 className="section-header">Fleet Overview</h1>
            <p className="section-subheader">Real-time status of your vehicle logistics</p>
          </div>

          <div className="flex gap-3">
            <Link to="/maintenance-records">
              <Button variant="secondary" icon={Wrench}>
                Log Service
              </Button>
            </Link>
            <Link to="/add-vehicle">
              <Button variant="primary" icon={Plus}>
                Add Vehicle
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Metrics row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title="Total Vehicles" value="12" subtitle="3 currently active" icon={Car} trend="2" trendType="up" color="indigo" delay={0.1} />
          <StatCard title="Pending Services" value="5" subtitle="2 require immediate attention" icon={Clock} trend="1" trendType="down" color="amber" delay={0.2} />
          <StatCard title="Total Upkeep Cost" value="₹1,02,450" subtitle="This month so far" icon={IndianRupee} trend="12%" trendType="up" color="rose" delay={0.3} />
          <StatCard title="Avg Efficiency" value="16.2" subtitle="Kilometres per Litre" icon={Fuel} trend="4%" trendType="up" color="emerald" delay={0.4} />
        </div>

        {/* Chart + Summary row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <Card variant="bordered" delay={0.5} className="lg:col-span-2 flex flex-col justify-between h-[420px] bg-surface/80">
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h2 className="text-lg font-extrabold text-foreground">Upkeep Cost History</h2>
                <p className="text-sm text-slate-400">Monthly breakdown of service and maintenance expenditures</p>
              </div>
              <div className="flex gap-2">
                 {['1M','3M','6M','1Y'].map((t,i) => (
                    <button key={i} className={`px-2.5 py-1 text-xs font-bold rounded-md ${i===2 ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-500 hover:text-slate-300'}`}>
                       {t}
                    </button>
                 ))}
              </div>
            </div>

            <div className="h-full w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyCostsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={(v)=>`₹${v}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card variant="bordered" delay={0.6} className="flex flex-col justify-between bg-surface/80">
            <div>
              <div className="flex justify-between items-start mb-6">
                 <div>
                   <h2 className="text-lg font-extrabold text-foreground">Action Center</h2>
                   <p className="text-sm text-slate-400">Critical tasks needing review</p>
                 </div>
                 <Badge variant="warning" dot pulse>2 Urgent</Badge>
              </div>
              
              <div className="space-y-3">
                {[
                  { title: "Tata Nexon — Oil Change", desc: "Overdue by 2 days", icon: Wrench, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                  { title: "Mahindra Thar — Registration", desc: "Expires in 5 days", icon: Clock, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
                  { title: "Maruti Suzuki Swift — Check Engine", desc: "Reported today", icon: AlertCircle, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
                ].map((task, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer group">
                    <div className={`p-2 rounded-lg ${task.bg} ${task.border} border shrink-0`}>
                      <task.icon className={`w-4 h-4 ${task.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">{task.title}</p>
                      <p className="text-xs text-slate-500 truncate">{task.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/upcoming-services" className="mt-6 block">
              <Button variant="ghost" className="w-full" icon={ArrowRight} iconPosition="right">
                View All Tasks
              </Button>
            </Link>
          </Card>
        </div>

        {/* Recent Maintenance Table */}
        <Card variant="bordered" delay={0.7} className="p-0 overflow-hidden bg-surface/80">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-extrabold text-foreground">Recent Service Logs</h2>
              <p className="text-sm text-slate-400">Chronological history of completed maintenance</p>
            </div>
            <Link to="/maintenance-records" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              View complete log &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead>
                <tr>
                  <th className="pl-6">Vehicle</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Cost</th>
                  <th className="pr-6">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((rec, idx) => (
                  <tr key={idx}>
                    <td className="pl-6">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                         <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                           <Car className="w-3 h-3 text-slate-400" />
                         </div>
                         {rec.vehicle}
                      </div>
                    </td>
                    <td>{rec.service}</td>
                    <td className="text-slate-400">{rec.date}</td>
                    <td className="font-bold text-slate-300">{rec.cost}</td>
                    <td className="pr-6">
                      <Badge variant={rec.status} dot size="sm">{rec.label}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

// Quick fix for missing icon above
import { AlertCircle } from "lucide-react";

export default Dashboard;
