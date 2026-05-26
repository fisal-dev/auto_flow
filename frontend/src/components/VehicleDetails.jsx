import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Car, Wrench, Fuel, DollarSign, ArrowLeft, CalendarClock, Settings2, ReceiptText, MapPin, GaugeCircle, Trash2 } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import { api } from "../utils/api";
import { useToast } from "./ui/Toast";

const VehicleDetails = () => {
  const toast = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const [vehicle, setVehicle] = useState(null);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [upcomingMaintenance, setUpcomingMaintenance] = useState([]);
  const [fuelLog, setFuelLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/vehicles/${id}`),
      api.get("/maintenance"),
      api.get("/upcoming"),
      api.get("/fuel")
    ]).then(([vehRes, maintRes, upcomingRes, fuelRes]) => {
      setVehicle(vehRes);
      // Filter by vehicle ID
      setServiceHistory(maintRes.filter(m => m.vehicleId && (m.vehicleId._id === id || m.vehicleId === id)));
      setUpcomingMaintenance(upcomingRes.filter(u => u.vehicleId && (u.vehicleId._id === id || u.vehicleId === id)));
      setFuelLog(fuelRes.filter(f => f.vehicleId && (f.vehicleId._id === id || f.vehicleId === id)));
    }).catch(err => {
      console.error("Error loading vehicle details:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to remove this vehicle from your fleet?")) {
      try {
        await api.delete(`/vehicles/${id}`);
        toast.success("Vehicle successfully removed.");
        navigate("/vehicles");
      } catch (err) {
        toast.error(err.message || "Failed to delete vehicle.");
      }
    }
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

  if (!vehicle) {
    return (
      <DashboardLayout>
        <div className="page-wrapper text-center py-20">
          <h2 className="text-xl font-bold text-rose-400 mb-2">Vehicle Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">The requested vehicle record could not be retrieved.</p>
          <Link to="/vehicles">
            <Button variant="secondary" icon={ArrowLeft}>Back to Fleet</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const totalMaintCost = serviceHistory.reduce((sum, item) => sum + (item.cost || 0), 0);
  const totalFuelCost = fuelLog.reduce((sum, item) => sum + (item.cost || 0), 0);
  const totalSpent = totalMaintCost + totalFuelCost;

  return (
    <DashboardLayout>
      <div className="page-wrapper">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link to="/vehicles">
              <Button variant="secondary" className="px-3" title="Back to Fleet">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                 <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                   {vehicle.year} {vehicle.make} {vehicle.model}
                 </h1>
                 <Badge variant="success" dot size="sm">Active</Badge>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                 <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-slate-400 border border-white/10">{vehicle.registration}</span>
                 <span>•</span>
                 <span>{vehicle.mileage}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
             <Button variant="danger" icon={Trash2} onClick={handleDelete}>Delete</Button>
             <Link to="/maintenance-records">
                <Button variant="primary" icon={Wrench}>Log Service</Button>
             </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-white/10 pb-px overflow-x-auto custom-scrollbar">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "maintenance", label: "Maintenance", icon: Wrench },
            { id: "fuel", label: "Fuel Log", icon: Fuel },
            { id: "docs", label: "Documents", icon: ReceiptText },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-bold transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? "border-indigo-400 text-indigo-400" 
                  : "border-transparent text-slate-500 hover:text-slate-300 hover:border-white/10"}
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content: Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            
            {/* Specs Panel */}
            <Card variant="bordered" className="bg-surface/80 flex flex-col h-full">
              <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <Car className="text-indigo-400 w-5 h-5" /> Vehicle Profile
              </h2>
              <div className="space-y-1 text-sm flex-grow">
                {[
                  { label: "Make", val: vehicle.make },
                  { label: "Model", val: vehicle.model },
                  { label: "Year", val: vehicle.year },
                  { label: "VIN", val: <span className="font-mono text-xs">{vehicle.vin}</span> },
                  { label: "License Plate", val: <span className="font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">{vehicle.registration}</span> },
                  { label: "Current Mileage", val: vehicle.mileage },
                  { label: "Total Spent", val: <span className="text-emerald-400 font-bold">₹{totalSpent.toLocaleString()}</span> },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between py-3 border-b border-white/5 last:border-0">
                    <span className="text-slate-500 font-medium">{row.label}</span>
                    <span className="text-slate-200">{row.val}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Upcoming Alerts */}
              <Card variant="bordered" className="bg-surface/80">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <CalendarClock className="text-amber-400 w-5 h-5" /> Upcoming Tasks
                  </h2>
                </div>
                <div className="space-y-3">
                  {upcomingMaintenance.length === 0 ? (
                    <p className="text-slate-500 text-sm py-4">No upcoming tasks scheduled.</p>
                  ) : (
                    upcomingMaintenance.slice(0, 3).map((m, i) => (
                      <div key={i} className="flex justify-between items-center bg-white/5 border border-white/5 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-${m.urgency === 'warning' ? 'amber' : 'slate'}-500/10 border border-${m.urgency === 'warning' ? 'amber' : 'slate'}-500/20 text-${m.urgency === 'warning' ? 'amber' : 'slate'}-400`}>
                            <CalendarClock className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{m.description}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Due: {new Date(m.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge variant={m.urgency}>{m.urgency === 'warning' ? 'Urgent' : 'Scheduled'}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Recent History */}
              <Card variant="bordered" className="bg-surface/80 p-0 overflow-hidden">
                <div className="p-6 border-b border-white/5">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Wrench className="text-indigo-400 w-5 h-5" /> Recent Service
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  {serviceHistory.length === 0 ? (
                    <p className="text-slate-500 text-sm p-6">No service history records logged yet.</p>
                  ) : (
                    <table className="premium-table min-w-[500px]">
                      <thead>
                        <tr>
                          <th className="pl-6">Service</th>
                          <th>Date</th>
                          <th className="pr-6 text-right">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {serviceHistory.slice(0, 3).map((s, i) => (
                          <tr key={i}>
                            <td className="pl-6 font-bold text-foreground">{s.service}</td>
                            <td className="text-slate-400">{new Date(s.date).toLocaleDateString()}</td>
                            <td className="pr-6 text-right font-bold text-emerald-400">₹{s.cost.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </Card>

            </div>
          </div>
        )}

        {/* Tab Content: Maintenance */}
        {activeTab === "maintenance" && (
          <div className="space-y-6 animate-fade-in">
            {/* Upcoming Maintenance Cards */}
            <Card variant="bordered" className="bg-surface/80">
              <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <CalendarClock className="text-amber-400 w-5 h-5" /> Upcoming Maintenance Tasks
              </h2>
              {upcomingMaintenance.length === 0 ? (
                <p className="text-slate-500 text-sm py-4">No upcoming tasks scheduled.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingMaintenance.map((m, i) => (
                    <div key={i} className="flex justify-between items-center bg-white/5 border border-white/5 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${m.urgency === 'warning' ? 'amber' : 'slate'}-500/10 border border-${m.urgency === 'warning' ? 'amber' : 'slate'}-500/20 text-${m.urgency === 'warning' ? 'amber' : 'slate'}-400`}>
                          <CalendarClock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{m.description}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Due: {new Date(m.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge variant={m.urgency}>{m.urgency === 'warning' ? 'Urgent' : 'Scheduled'}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Complete Service History */}
            <Card variant="bordered" className="bg-surface/80 p-0 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Wrench className="text-indigo-400 w-5 h-5" /> Service History Logs
                </h2>
                <Link to="/maintenance-records">
                  <Button variant="secondary" size="sm" icon={Wrench}>Log Service</Button>
                </Link>
              </div>
              <div className="overflow-x-auto">
                {serviceHistory.length === 0 ? (
                  <p className="text-slate-500 text-sm p-6">No service history records logged yet.</p>
                ) : (
                  <table className="premium-table min-w-[600px]">
                    <thead>
                      <tr>
                        <th className="pl-6">Service</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th className="pr-6 text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceHistory.map((s, i) => (
                        <tr key={i}>
                          <td className="pl-6 font-bold text-foreground">{s.service}</td>
                          <td className="text-slate-400">{new Date(s.date).toLocaleDateString()}</td>
                          <td>
                            <Badge variant={s.status || 'success'}>{s.label || 'Completed'}</Badge>
                          </td>
                          <td className="pr-6 text-right font-bold text-emerald-400">₹{s.cost.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Tab Content: Fuel Log */}
        {activeTab === "fuel" && (
          <div className="space-y-6 animate-fade-in">
            <Card variant="bordered" className="bg-surface/80 p-0 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Fuel className="text-indigo-400 w-5 h-5" /> Fuel Consumption Logs
                </h2>
                <Link to="/fuel-consumption">
                  <Button variant="secondary" size="sm" icon={Fuel}>Log Fuel</Button>
                </Link>
              </div>
              <div className="overflow-x-auto">
                {fuelLog.length === 0 ? (
                  <p className="text-slate-500 text-sm p-6">No fuel logs logged yet.</p>
                ) : (
                  <table className="premium-table min-w-[600px]">
                    <thead>
                      <tr>
                        <th className="pl-6">Refuel Date</th>
                        <th>Fuel Volume</th>
                        <th>Total Cost</th>
                        <th className="pr-6">Odometer Mileage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fuelLog.map((log, i) => (
                        <tr key={i}>
                          <td className="pl-6 text-slate-400">{new Date(log.date).toLocaleDateString()}</td>
                          <td className="font-semibold text-slate-300">{log.liters} L</td>
                          <td className="font-bold text-emerald-400">₹{log.cost.toLocaleString()}</td>
                          <td className="pr-6 font-mono text-indigo-400">{log.mileage.toLocaleString()} km</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Tab Content: Documents */}
        {activeTab === "docs" && (
          <div className="space-y-6 animate-fade-in">
            <Card variant="bordered" className="bg-surface/80">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ReceiptText className="text-indigo-400 w-5 h-5" /> Vehicle Documentation
                </h2>
                <Button variant="secondary" size="sm">Upload Document</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Insurance Card.pdf", size: "1.2 MB", type: "PDF Document", date: "Jan 01, 2024" },
                  { name: "Vehicle Registration.pdf", size: "840 KB", type: "PDF Document", date: "Nov 15, 2023" },
                  { name: "Sales Contract.pdf", size: "4.5 MB", type: "PDF Document", date: "Oct 10, 2020" },
                  { name: "Annual Inspection.pdf", size: "2.1 MB", type: "PDF Document", date: "Dec 12, 2023" },
                ].map((doc, i) => (
                  <div key={i} className="flex justify-between items-center bg-white/5 border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <ReceiptText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{doc.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{doc.type} • {doc.size} • Uploaded: {doc.date}</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" className="h-8 py-0">Download</Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

// Fix missing import
import { LayoutDashboard } from "lucide-react";

export default VehicleDetails;
