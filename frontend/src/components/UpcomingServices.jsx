import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Car, Clock, Plus, Check, X, MapPin } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import { api } from "../utils/api";
import { useToast } from "./ui/Toast";

const UpcomingServices = () => {
  const toast = useToast();
  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [serviceCenters, setServiceCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newService, setNewService] = useState({
    vehicleId: "",
    date: "",
    description: "",
    urgency: "info",
    provider: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesData, vehiclesData, serviceCentersData] = await Promise.all([
        api.get("/upcoming"),
        api.get("/vehicles"),
        api.get("/service-centers")
      ]);
      // Filter out already completed ones
      setServices(servicesData.filter(s => s.status !== "completed"));
      setVehicles(vehiclesData);
      setServiceCenters(serviceCentersData);
      if (vehiclesData.length > 0) {
        setNewService(prev => ({ 
          ...prev, 
          vehicleId: vehiclesData[0]._id,
          provider: serviceCentersData[0]?.name || ""
        }));
      }
    } catch (err) {
      console.error("Error loading upcoming services:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewService(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newService.vehicleId || !newService.description || !newService.date) {
      toast.warning("Please fill in all fields.");
      return;
    }
    try {
      const res = await api.post("/upcoming", newService);
      // Populate vehicleId detail in state locally
      const selectedVehicle = vehicles.find(v => v._id === newService.vehicleId);
      const enrichedService = {
        ...res,
        vehicleId: selectedVehicle ? { _id: selectedVehicle._id, make: selectedVehicle.make, model: selectedVehicle.model, registration: selectedVehicle.registration } : null
      };
      setServices(prev => [...prev, enrichedService]);
      setIsModalOpen(false);
      setNewService({
        vehicleId: vehicles[0]?._id || "",
        date: "",
        description: "",
        urgency: "info",
        provider: serviceCenters[0]?.name || ""
      });
      toast.success("Service scheduled successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to schedule service task.");
    }
  };

  const handleComplete = async (serviceId) => {
    try {
      await api.put(`/upcoming/${serviceId}/complete`);
      setServices(prev => prev.filter(s => s._id !== serviceId));
      toast.success("Service marked as completed!");
    } catch (err) {
      toast.error(err.message || "Failed to mark service as completed.");
    }
  };

  const getDaysLeft = (targetDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <DashboardLayout>
      <div className="page-wrapper">
        
        {/* Header Block */}
        <div className="page-header">
          <div>
            <h1 className="section-header">Upcoming Services</h1>
            <p className="section-subheader">Preventative service calendar and scheduling</p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Schedule Action
          </Button>
        </div>

        {/* Schedule Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : services.length === 0 ? (
          <Card variant="bordered" className="text-center py-24 bg-surface/80">
            <div className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-500 mb-5 glow-sm">
              <CalendarClock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No tasks scheduled</h3>
            <p className="text-slate-400 text-sm">All fleet vehicles are running in healthy condition.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((item, i) => {
              const daysLeft = getDaysLeft(item.date);
              const isOverdue = daysLeft < 0;
              const isDueToday = daysLeft === 0;

              return (
                <Card 
                  key={item._id} 
                  variant="bordered" 
                  delay={i * 0.05} 
                  glowingBorder={item.urgency === "warning" || isOverdue} 
                  className="p-6 flex flex-col justify-between min-h-[220px] bg-surface/80 group relative overflow-hidden"
                >
                  {(item.urgency === "warning" || isOverdue) && (
                     <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-[30px] -mr-5 -mt-5 pointer-events-none"></div>
                  )}

                  <div className="flex justify-between items-start relative z-10 mb-4">
                    <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-slate-300">
                      <Car className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-bold">
                        {item.vehicleId ? `${item.vehicleId.make} ${item.vehicleId.model}` : "Unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="my-2 relative z-10 flex-grow">
                    <h3 className="text-xl font-extrabold text-slate-100 leading-tight mb-3 group-hover:text-indigo-300 transition-colors">
                      {item.description}
                    </h3>
                    
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center justify-between text-xs font-medium">
                         <span className="flex items-center gap-1.5 text-slate-400">
                           <CalendarClock className="w-3.5 h-3.5 text-slate-500" /> Target Date
                         </span>
                         <span className="text-slate-200 font-mono">{new Date(item.date).toLocaleDateString()}</span>
                       </div>
                       <div className="flex items-center justify-between text-xs font-medium">
                         <span className="flex items-center gap-1.5 text-slate-400">
                           <Clock className="w-3.5 h-3.5 text-slate-500" /> Remaining Time
                         </span>
                         <span className={isOverdue ? "text-rose-400 font-bold" : isDueToday ? "text-amber-400 font-bold" : daysLeft <= 7 ? "text-amber-400 font-medium" : "text-indigo-400 font-medium"}>
                            {isOverdue ? `Overdue by ${Math.abs(daysLeft)} days` : isDueToday ? "Due Today" : `In ${daysLeft} days`}
                         </span>
                       </div>
                       {item.provider && (
                         <div className="flex items-center justify-between text-xs font-medium">
                           <span className="flex items-center gap-1.5 text-slate-400">
                             <MapPin className="w-3.5 h-3.5 text-slate-500" /> Workshop
                           </span>
                           <span className="text-slate-200 truncate max-w-[150px] text-right font-semibold">{item.provider}</span>
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                     <Badge variant={isOverdue ? "danger" : item.urgency === "warning" ? "warning" : "info"} size="sm" dot>
                       {isOverdue ? "Overdue" : item.urgency === "warning" ? "Impending" : "Scheduled"}
                     </Badge>
                     <Button 
                       variant="ghost" 
                       className="h-8 px-3 text-xs bg-white/5 hover:bg-white/10 text-emerald-400 hover:text-emerald-300 font-extrabold" 
                       icon={Check} 
                       iconPosition="left"
                       onClick={() => handleComplete(item._id)}
                     >
                       Done
                     </Button>
                  </div>

                </Card>
              );
            })}
          </div>
        )}

        {/* Modal: Schedule Action */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <Card variant="bordered" className="w-full max-w-md bg-surface/95 border-white/10 p-6 shadow-2xl relative animate-scale-up">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-extrabold text-foreground mb-6 flex items-center gap-2">
                <CalendarClock className="text-indigo-400 w-5 h-5" />
                Schedule Maintenance
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Vehicle *</label>
                  <select
                    name="vehicleId"
                    value={newService.vehicleId}
                    onChange={handleChange}
                    className="input-field cursor-pointer"
                    required
                  >
                    {vehicles.map(v => (
                      <option key={v._id} value={v._id}>
                        {v.make} {v.model} ({v.registration})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={newService.date}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Task Description *</label>
                  <input
                    type="text"
                    name="description"
                    placeholder="e.g. Brake Replacement, Spark Plugs check"
                    value={newService.description}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Task Priority</label>
                    <select
                      name="urgency"
                      value={newService.urgency}
                      onChange={handleChange}
                      className="input-field cursor-pointer"
                    >
                      <option value="info">Normal (Scheduled)</option>
                      <option value="warning">High (Impending/Urgent)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Workshop Center</label>
                    <select
                      name="provider"
                      value={newService.provider}
                      onChange={handleChange}
                      className="input-field cursor-pointer"
                    >
                      <option value="">None (Self-service)</option>
                      {serviceCenters.map(center => (
                        <option key={center._id} value={center.name}>{center.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" icon={Plus}>
                    Schedule Task
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default UpcomingServices;
