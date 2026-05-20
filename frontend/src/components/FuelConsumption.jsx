import React, { useState } from "react";
import { Fuel, Plus, CalendarClock, IndianRupee, Gauge, Car, ArrowRight, Droplet } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Button from "./ui/Button";

const FuelConsumption = () => {
  const [fuelLogs, setFuelLogs] = useState([
    { vehicle: "Tata Nexon", date: "Feb 01, 2024", liters: 40, cost: 4200, mileage: 45000 },
    { vehicle: "Maruti Suzuki Swift", date: "Feb 05, 2024", liters: 35, cost: 3675, mileage: 52000 }
  ]);

  const [newLog, setNewLog] = useState({
    vehicle: "",
    date: "",
    liters: "",
    cost: "",
    mileage: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewLog({ ...newLog, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newLog.vehicle && newLog.date && newLog.liters && newLog.cost && newLog.mileage) {
      setLoading(true);
      setTimeout(() => {
        setFuelLogs([
          {
            vehicle: newLog.vehicle,
            date: newLog.date,
            liters: parseFloat(newLog.liters),
            cost: parseFloat(newLog.cost),
            mileage: parseInt(newLog.mileage)
          },
          ...fuelLogs
        ]);
        setNewLog({ vehicle: "", date: "", liters: "", cost: "", mileage: "" });
        setLoading(false);
      }, 1000);
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
          <Card variant="bordered" delay={0.1} className="lg:col-span-1 p-6 bg-surface/80 flex flex-col justify-between relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none -mr-10 -mt-10" />

            <div className="relative z-10">
              <h2 className="text-xl font-extrabold text-foreground mb-6 flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                   <Plus className="text-indigo-400 w-4 h-4" />
                </div>
                Log Refueling
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Vehicle name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                      <Car className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      name="vehicle"
                      placeholder="e.g. Tata Nexon"
                      value={newLog.vehicle}
                      onChange={handleChange}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Date entry */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
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
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Liters (L)</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                        <Droplet className="w-4 h-4" />
                      </span>
                      <input
                        type="number"
                        name="liters"
                        placeholder="40"
                        value={newLog.liters}
                        onChange={handleChange}
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Price Cost */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cost (₹)</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                        <IndianRupee className="w-4 h-4" />
                      </span>
                      <input
                        type="number"
                        name="cost"
                        placeholder="45"
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
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mileage (km)</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-amber-400 transition-colors">
                      <Gauge className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      name="mileage"
                      placeholder="45000"
                      value={newLog.mileage}
                      onChange={handleChange}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading} icon={ArrowRight} iconPosition="right">
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

            {fuelLogs.length === 0 ? (
              <div className="text-center py-20">
                 <Fuel className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                 <p className="text-slate-400 text-sm">No refueling events logged yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th className="pl-6">Vehicle</th>
                      <th>Date</th>
                      <th>Liters</th>
                      <th>Mileage</th>
                      <th className="pr-6 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fuelLogs.map((log, index) => (
                      <tr key={index}>
                        <td className="pl-6">
                           <div className="font-bold text-foreground flex items-center gap-2">
                             <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                               <Car className="w-3 h-3 text-slate-400" />
                             </div>
                             {log.vehicle}
                           </div>
                        </td>
                        <td className="text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <CalendarClock className="w-3.5 h-3.5 text-indigo-400" />
                            {log.date}
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
                            {log.mileage} km
                          </span>
                        </td>
                        <td className="pr-6 font-extrabold text-emerald-400 text-right">
                          <span className="flex items-center justify-end gap-0.5">
                            <IndianRupee className="w-3.5 h-3.5" />
                            {log.cost}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default FuelConsumption;
