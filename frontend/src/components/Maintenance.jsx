import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Wrench, Plus, CalendarClock, IndianRupee, MapPin, Search, Filter, Car } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

const Maintenance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const records = [
    { id: 1, vehicle: "Tata Nexon", date: "Feb 10, 2025", service: "Synthetic Oil Change", cost: "₹7,100", provider: "QuickFix Auto Mumbai", status: "success", label: "Completed" },
    { id: 2, vehicle: "Maruti Suzuki Swift", date: "Jan 15, 2025", service: "Brake Pad Replacement", cost: "₹12,500", provider: "AutoCare Center Delhi", status: "success", label: "Completed" },
    { id: 3, vehicle: "Mahindra Thar", date: "Jan 05, 2025", service: "Tire Rotation & Balance", cost: "₹3,700", provider: "Tire World Bangalore", status: "success", label: "Completed" },
    { id: 4, vehicle: "Hyundai Creta", date: "Dec 12, 2024", service: "Battery Diagnostic", cost: "₹0", provider: "Hyundai Service Center", status: "info", label: "Warranty" },
  ];

  const filtered = records.filter(r => 
    r.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-wrapper">
        
        {/* Header Block */}
        <div className="page-header">
          <div>
            <h1 className="section-header">Maintenance Log</h1>
            <p className="section-subheader">Historical service records and repairs</p>
          </div>
          <Button variant="primary" icon={Plus}>
            Log Service Action
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-2">
           <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search records by vehicle or service..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 h-11"
              />
           </div>
           <Button variant="secondary" className="shrink-0 h-11 px-4" icon={Filter}>
              Filter Records
           </Button>
        </div>

        {/* Records Table Card */}
        <Card variant="bordered" className="p-0 overflow-hidden bg-surface/80">
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-500 mb-5 glow-sm">
                <Wrench className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No records found</h3>
              <p className="text-slate-400 text-sm">Start by logging your first maintenance activity.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th className="pl-6">Vehicle</th>
                    <th>Date</th>
                    <th>Service Type</th>
                    <th>Cost</th>
                    <th>Provider</th>
                    <th className="pr-6">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((rec) => (
                    <tr key={rec.id}>
                      <td className="pl-6">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                            <Car className="w-3 h-3 text-slate-400" />
                          </div>
                          {rec.vehicle}
                        </div>
                      </td>
                      <td className="text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <CalendarClock className="w-3.5 h-3.5 text-indigo-400" /> {rec.date}
                        </span>
                      </td>
                      <td className="font-bold text-slate-200">{rec.service}</td>
                      <td className="font-bold text-emerald-400">
                        <span className="flex items-center gap-1">
                          <IndianRupee className="w-3.5 h-3.5" /> {rec.cost.replace("₹", "")}
                        </span>
                      </td>
                      <td className="text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" /> {rec.provider}
                        </span>
                      </td>
                      <td className="pr-6">
                        <Badge variant={rec.status} dot size="sm">{rec.label}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Maintenance;
