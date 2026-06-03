import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Car, Wrench, IndianRupee, Plus, Fuel, ArrowRight, Clock, CheckCircle2, AlertCircle, Users, ReceiptText } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardLayout from "./DashboardLayout";
import StatCard from "./ui/StatCard";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import { api } from "../utils/api";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role || 'customer';

  useEffect(() => {
    api.get("/dashboard")
      .then(res => {
        setData(res);
      })
      .catch(err => console.error("Error loading dashboard:", err))
      .finally(() => setLoading(false));
  }, []);

  const formatCost = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card px-4 py-3 border-indigo-500/20 shadow-xl bg-surface/90 rounded-xl border">
          <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">{label}</p>
          <p className="text-white text-lg font-extrabold flex items-center">
             <span className="text-indigo-400 mr-1">₹</span>{payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBusinessTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card px-4 py-3 border-indigo-500/20 shadow-xl bg-surface/90 rounded-xl border">
          <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1.5">{label}</p>
          <div className="space-y-1">
            {payload.map((item, idx) => (
              <p key={idx} className="text-xs font-semibold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.stroke || item.color }} />
                <span className="text-slate-400">{item.name}:</span>
                <span className="text-white font-extrabold">₹{Number(item.value).toLocaleString('en-IN')}</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  const isBusiness = data?.isBusiness;
  const stats = data?.stats || {};
  const chartData = data?.chartData || [];
  const actionCenter = data?.actionCenter || [];
  const recentRecords = data?.recentRecords || [];

  const getActionIcon = (urgency) => {
    if (urgency === 'danger') return AlertCircle;
    return Clock;
  };

  const getActionColors = (urgency) => {
    if (urgency === 'danger') return { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" };
    if (urgency === 'warning') return { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    return { color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" };
  };

  if (isBusiness) {
    return (
      <DashboardLayout>
        <div className="page-wrapper">
          {/* Header Block */}
          <div className="page-header">
            <div>
              <h1 className="section-header">Business Analytics</h1>
              <p className="section-subheader">Performance metrics across registered Service Centers</p>
            </div>

            <div className="flex gap-3">
              {role === 'owner' && (
                <Link to="/team-management">
                  <Button variant="secondary" icon={Users}>
                    Manage Team
                  </Button>
                </Link>
              )}
              <Link to="/garage-console">
                <Button variant="primary" icon={Car}>
                  Garage Console
                </Button>
              </Link>
            </div>
          </div>

          {/* KPI Metrics row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard title="Total Revenue" value={formatCost(stats.totalRevenue || 0)} subtitle="Completed paid services" icon={IndianRupee} color="emerald" delay={0.1} />
            <StatCard title="Pending Invoices" value={formatCost(stats.pendingInvoices || 0)} subtitle="Awaiting customer checkouts" icon={Clock} color="amber" delay={0.2} />
            <StatCard title="Serviced Vehicles" value={String(stats.servicedVehicles || 0)} subtitle="Unique logistics check-ins" icon={Car} color="indigo" delay={0.3} />
            {role === 'owner' ? (
              <StatCard title="Active Managers" value={String(stats.activeManagers || 0)} subtitle="Garage operators under fleet" icon={Users} color="purple" delay={0.4} />
            ) : (
              <StatCard title="Assigned Garages" value={String(user.assignedGarages?.length || 0)} subtitle="Active stations" icon={Wrench} color="purple" delay={0.4} />
            )}
          </div>

          {/* Chart + Summary row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card variant="bordered" delay={0.5} className="lg:col-span-2 flex flex-col justify-between h-[420px] bg-surface/80">
              <div className="mb-8 flex justify-between items-end">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">Revenue Flow</h2>
                  <p className="text-sm text-slate-400">Paid revenues vs pending billing statements</p>
                </div>
              </div>

              <div className="h-full w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={(v)=>`₹${v}`} />
                    <Tooltip content={<CustomBusinessTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                    <Area type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorPending)" name="Pending Billing" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card variant="bordered" delay={0.6} className="flex flex-col justify-between bg-surface/80">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-lg font-extrabold text-foreground">Action Center</h2>
                    <p className="text-sm text-slate-400">Logistics tasks & payment reminders</p>
                  </div>
                  {actionCenter.length > 0 && (
                    <Badge variant="warning" dot pulse>{actionCenter.length} Alerts</Badge>
                  )}
                </div>
                
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {actionCenter.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      No business action items pending. Everything looks optimal.
                    </div>
                  ) : (
                    actionCenter.map((task, i) => {
                      const Icon = getActionIcon(task.urgency);
                      const colors = getActionColors(task.urgency);
                      return (
                        <Link to={task.action} key={task.id || i} className="flex gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer group">
                          <div className={`p-2 rounded-lg ${colors.bg} ${colors.border} border shrink-0`}>
                            <Icon className={`w-4 h-4 ${colors.color}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">{task.title}</p>
                            <p className="text-xs text-slate-500 truncate">{task.desc}</p>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>

              <Link to="/garage-console" className="mt-6 block">
                <Button variant="ghost" className="w-full" icon={ArrowRight} iconPosition="right">
                  Open Garage Console
                </Button>
              </Link>
            </Card>
          </div>

          {/* Recent Services Table */}
          <Card variant="bordered" delay={0.7} className="p-0 overflow-hidden bg-surface/80">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-extrabold text-foreground">Recent Serviced Vehicles</h2>
                <p className="text-sm text-slate-400">Latest completed and pending tickets logged at Service Centers</p>
              </div>
              <Link to="/garage-console" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                Log New Ticket &rarr;
              </Link>
            </div>

            <div className="table-scroll">
              <table className="premium-table min-w-[600px]">
                <thead>
                  <tr>
                    <th className="pl-6">Vehicle</th>
                    <th>Customer</th>
                    <th>Service Center</th>
                    <th>Service details</th>
                    <th>Date</th>
                    <th>Cost</th>
                    <th className="pr-6">Billing</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRecords.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-slate-500">
                        No service tickets registered yet. Search vehicles inside Garage Console to log tickets.
                      </td>
                    </tr>
                  ) : (
                    recentRecords.map((rec, idx) => (
                      <tr key={rec._id || idx}>
                        <td className="pl-6">
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                              <Car className="w-3 h-3 text-slate-400" />
                            </div>
                            {rec.vehicleId ? `${rec.vehicleId.make} ${rec.vehicleId.model} (${rec.vehicleId.registration})` : 'Unknown Vehicle'}
                          </div>
                        </td>
                        <td className="text-slate-300">
                          {rec.vehicleId?.userId ? (
                            <div>
                              <p className="font-medium">{rec.vehicleId.userId.name}</p>
                              <p className="text-[10px] text-slate-500">{rec.vehicleId.userId.email}</p>
                            </div>
                          ) : 'Guest/Unknown'}
                        </td>
                        <td className="text-slate-300 font-semibold">{rec.provider}</td>
                        <td className="text-slate-300">{rec.service}</td>
                        <td className="text-slate-400">{new Date(rec.date).toLocaleDateString()}</td>
                        <td className="font-bold text-slate-300">{formatCost(rec.cost)}</td>
                        <td className="pr-6">
                          <Badge 
                            variant={rec.paymentStatus === 'paid' ? 'success' : 'warning'} 
                            dot 
                            size="sm"
                          >
                            {rec.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Customer Dashboard (standard layout)
  const totalVehicles = stats.totalVehicles || 0;
  const pendingServices = stats.pendingServices || 0;
  const totalUpkeepCost = stats.totalUpkeepCost || 0;
  const avgFuelCost = stats.avgFuelCost || "₹0.00/km";
  const avgEfficiency = stats.avgEfficiency || "0.00 km/L";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Vehicles" value={String(totalVehicles)} subtitle="Registered fleet total" icon={Car} color="indigo" delay={0.1} />
          <StatCard title="Pending Services" value={String(pendingServices)} subtitle="Require attention" icon={Clock} color="amber" delay={0.2} />
          <StatCard title="Total Upkeep Cost" value={formatCost(totalUpkeepCost)} subtitle="Accumulated total" icon={IndianRupee} color="rose" delay={0.3} />
          <StatCard title="Avg Fuel Economy" value={avgEfficiency} subtitle="Fleet average mileage" icon={Fuel} color="purple" delay={0.5} />
        </div>

        {/* Chart + Summary row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <Card variant="bordered" delay={0.5} className="lg:col-span-2 flex flex-col justify-between h-[420px] bg-surface/80">
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h2 className="text-lg font-extrabold text-foreground">Upkeep Cost History</h2>
                <p className="text-sm text-slate-400">Monthly breakdown of service and maintenance expenditures</p>
              </div>
            </div>

            <div className="h-full w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
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
                 {actionCenter.length > 0 && (
                   <Badge variant="warning" dot pulse>{actionCenter.length} Alerts</Badge>
                 )}
              </div>
              
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {actionCenter.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                     No action items currently pending. All set!
                  </div>
                ) : (
                  actionCenter.map((task, i) => {
                    const Icon = getActionIcon(task.urgency);
                    const colors = getActionColors(task.urgency);
                    return (
                      <Link to={task.action} key={task.id || i} className="flex gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer group">
                        <div className={`p-2 rounded-lg ${colors.bg} ${colors.border} border shrink-0`}>
                          <Icon className={`w-4 h-4 ${colors.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">{task.title}</p>
                          <p className="text-xs text-slate-500 truncate">{task.desc}</p>
                        </div>
                      </Link>
                    );
                  })
                )}
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

          <div className="table-scroll">
            <table className="premium-table min-w-[500px]">
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
                {recentRecords.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-500">
                      No service logs recorded. Click "Log Service" above to record maintenance.
                    </td>
                  </tr>
                ) : (
                  recentRecords.map((rec, idx) => (
                    <tr key={rec._id || idx}>
                      <td className="pl-6">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                           <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                             <Car className="w-3 h-3 text-slate-400" />
                           </div>
                           {rec.vehicleId ? `${rec.vehicleId.make} ${rec.vehicleId.model}` : 'Unknown Vehicle'}
                        </div>
                      </td>
                      <td>{rec.service}</td>
                      <td className="text-slate-400">{new Date(rec.date).toLocaleDateString()}</td>
                      <td className="font-bold text-slate-300">{formatCost(rec.cost)}</td>
                      <td className="pr-6">
                        <Badge 
                          variant={rec.paymentStatus === 'paid' ? 'success' : 'warning'} 
                          dot 
                          size="sm"
                        >
                          {rec.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
