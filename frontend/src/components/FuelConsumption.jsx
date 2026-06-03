import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Fuel, Plus, CalendarClock, IndianRupee, Gauge, Car, ArrowRight, Droplet, X, Trash2 } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { api } from "../utils/api";
import { useToast } from "./ui/Toast";
import { useConfirm } from "./ui/Confirm";

const FuelConsumption = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [fuelLogs, setFuelLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [newLog, setNewLog] = useState({
    vehicleId: "",
    date: new Date().toISOString().split("T")[0],
    liters: "",
    cost: "",
    mileage: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsData, vehiclesData] = await Promise.all([
        api.get("/fuel"),
        api.get("/vehicles")
      ]);
      setFuelLogs(logsData);
      setVehicles(vehiclesData);
      if (vehiclesData.length > 0) {
        setNewLog(prev => ({ ...prev, vehicleId: vehiclesData[0]._id }));
      }
    } catch (err) {
      console.error("Error loading fuel consumption data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewLog(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newLog.vehicleId || !newLog.date || !newLog.liters || !newLog.cost || !newLog.mileage) {
      toast.warning("Please fill in all fields.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.post("/fuel", {
        ...newLog,
        liters: Number(newLog.liters),
        cost: Number(newLog.cost),
        mileage: Number(newLog.mileage)
      });
      // Populate vehicleId inside local state
      const selectedVehicle = vehicles.find(v => v._id === newLog.vehicleId);
      const enrichedLog = {
        ...res,
        vehicleId: selectedVehicle ? { _id: selectedVehicle._id, make: selectedVehicle.make, model: selectedVehicle.model, registration: selectedVehicle.registration } : null
      };
      setFuelLogs(prev => [enrichedLog, ...prev]);
      setNewLog({
        vehicleId: vehicles[0]?._id || "",
        date: new Date().toISOString().split("T")[0],
        liters: "",
        cost: "",
        mileage: ""
      });
      toast.success("Refueling details logged successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to log refueling details.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLog = async (logId) => {
    const isConfirmed = await confirm({
      title: "Delete Refueling Entry",
      message: "Are you sure you want to delete this refueling entry? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger"
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/fuel/${logId}`);
      setFuelLogs(prev => prev.filter(log => log._id !== logId));
      toast.success("Fuel record deleted successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to delete fuel record.");
    }
  };

  return (
    <DashboardLayout>
      <div className="page-wrapper">
        
        {/* Header Block */}
        <div className="page-header">
          <div>
            <h1 className="section-header">Fuel Consumption</h1>
            <p className="section-subheader">Monitor fleet efficiency and logging metrics</p>
          </div>
        </div>

        {/* Dynamic Forms + History columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form Entry Card */}
          <Card variant="bordered" delay={0.1} className="lg:col-span-1 p-6 bg-surface/80 flex flex-col justify-between relative overflow-hidden h-max">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none -mr-10 -mt-10" />

            <div className="relative z-10">
              <h2 className="text-xl font-extrabold text-foreground mb-6 flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                   <Plus className="text-indigo-400 w-4 h-4" />
                </div>
                Log Refueling
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Vehicle Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Vehicle *</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none">
                      <Car className="w-4 h-4" />
                    </span>
                    <select
                      name="vehicleId"
                      value={newLog.vehicleId}
                      onChange={handleChange}
                      className="input-field pl-10 cursor-pointer"
                      required
                    >
                      {vehicles.length === 0 && (
                        <option value="">No vehicles found</option>
                      )}
                      {vehicles.map(v => (
                        <option key={v._id} value={v._id}>
                          {v.make} {v.model} ({v.registration})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date entry */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date *</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none">
                      <CalendarClock className="w-4 h-4" />
                    </span>
                    <input
                      type="date"
                      name="date"
                      value={newLog.date}
                      onChange={handleChange}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Liters Purchased */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Liters (L) *</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none">
                        <Droplet className="w-4 h-4" />
                      </span>
                      <input
                        type="number"
                        name="liters"
                        placeholder="e.g. 40"
                        step="any"
                        value={newLog.liters}
                        onChange={handleChange}
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Price Cost */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cost (₹) *</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-emerald-400 transition-colors pointer-events-none">
                        <IndianRupee className="w-4 h-4" />
                      </span>
                      <input
                        type="number"
                        name="cost"
                        placeholder="e.g. 4200"
                        value={newLog.cost}
                        onChange={handleChange}
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Current Mileage */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Odometer Mileage (km) *</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-amber-400 transition-colors pointer-events-none">
                      <Gauge className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      name="mileage"
                      placeholder="e.g. 45000"
                      value={newLog.mileage}
                      onChange={handleChange}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" className="w-full mt-2" isLoading={submitting} icon={ArrowRight} iconPosition="right">
                  Save Fuel Entry
                </Button>
              </form>
            </div>
          </Card>

          {/* History logs Card */}
          <Card variant="bordered" delay={0.2} className="lg:col-span-2 p-0 overflow-hidden bg-surface/80">
            <div className="p-6 border-b border-white/5">
               <h2 className="text-lg font-extrabold text-foreground">Refueling Timeline</h2>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-24">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : fuelLogs.length === 0 ? (
              <div className="text-center py-20">
                 <Fuel className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                 <p className="text-slate-400 text-sm">No refueling events logged yet.</p>
              </div>
            ) : (() => {
              // Group and sort fuel logs to compute fuel economy on the fly
              const efficiencyMap = {};
              const costPerKmMap = {};
              const logsByVehicle = {};
              
              fuelLogs.forEach(log => {
                if (!log.vehicleId) return;
                const vId = log.vehicleId._id || log.vehicleId;
                if (!logsByVehicle[vId]) logsByVehicle[vId] = [];
                logsByVehicle[vId].push(log);
              });

              Object.keys(logsByVehicle).forEach(vId => {
                // Sort ascending by date first, and mileage (odometer) second to calculate chronologically
                logsByVehicle[vId].sort((a, b) => {
                  const dateDiff = new Date(a.date) - new Date(b.date);
                  if (dateDiff !== 0) return dateDiff;
                  return Number(a.mileage) - Number(b.mileage);
                });
                const list = logsByVehicle[vId];
                for (let i = 0; i < list.length; i++) {
                  if (i === 0) {
                    efficiencyMap[list[i]._id] = null;
                    costPerKmMap[list[i]._id] = null;
                  } else {
                    const diff = Number(list[i].mileage) - Number(list[i-1].mileage);
                    const liters = Number(list[i].liters);
                    const cost = Number(list[i].cost);
                    if (diff > 0) {
                      if (liters > 0) {
                        efficiencyMap[list[i]._id] = (diff / liters).toFixed(2);
                      }
                      if (cost > 0) {
                        costPerKmMap[list[i]._id] = (cost / diff).toFixed(2);
                      }
                    }
                  }
                }
              });

              // Sort timeline logs descending by date and mileage for correct UI display
              const sortedLogs = [...fuelLogs].sort((a, b) => {
                const dateDiff = new Date(b.date) - new Date(a.date);
                if (dateDiff !== 0) return dateDiff;
                return Number(b.mileage) - Number(a.mileage);
              });

              return (
                <div className="overflow-x-auto">
                  <table className="premium-table min-w-[750px]">
                    <thead>
                      <tr>
                        <th className="pl-6">Vehicle</th>
                        <th>Date</th>
                        <th>Liters</th>
                        <th>Odometer</th>
                        <th>Economy</th>
                        <th>Cost</th>
                        <th className="pr-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedLogs.map((log) => (
                        <tr key={log._id}>
                          <td className="pl-6">
                             <div className="font-bold text-foreground flex items-center gap-2">
                               <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                                 <Car className="w-3 h-3 text-slate-400" />
                               </div>
                               {log.vehicleId ? (
                                 <Link to={`/vehicle/${log.vehicleId._id}`} className="hover:text-indigo-400 transition-colors">
                                   {log.vehicleId.make} {log.vehicleId.model}
                                 </Link>
                               ) : (
                                 <span className="text-slate-400">Unknown Vehicle</span>
                                )}
                             </div>
                          </td>
                          <td className="text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <CalendarClock className="w-3.5 h-3.5 text-indigo-400" />
                              {new Date(log.date).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="font-semibold text-slate-300">
                             <div className="flex items-center gap-1">
                               <Droplet className="w-3.5 h-3.5 text-slate-500" /> {log.liters}L
                             </div>
                          </td>
                          <td className="text-slate-400 font-mono text-xs">
                            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded w-max">
                              <Gauge className="w-3.5 h-3.5 text-amber-400" />
                              {log.mileage.toLocaleString()} km
                            </span>
                          </td>
                          <td>
                            {costPerKmMap[log._id] ? (
                              <div className="flex flex-col gap-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg w-max">
                                  ₹{costPerKmMap[log._id]}/km
                                </span>
                                {efficiencyMap[log._id] && (
                                  <span className="text-[10px] text-slate-500 font-semibold pl-1">
                                    ({efficiencyMap[log._id]} kmpl)
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-white/5 text-slate-400 border border-white/10 rounded-lg">
                                Initial Fill-up
                              </span>
                            )}
                          </td>
                          <td className="font-extrabold text-emerald-400">
                            <span className="flex items-center gap-0.5">
                              <IndianRupee className="w-3.5 h-3.5" />
                              {log.cost.toLocaleString()}
                            </span>
                          </td>
                          <td className="pr-6 text-center">
                            <button
                              onClick={() => handleDeleteLog(log._id)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                              title="Delete Refuel Log"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default FuelConsumption;
