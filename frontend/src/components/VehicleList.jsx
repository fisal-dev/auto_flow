import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Car, Plus, Wrench, ChevronRight, Search, Activity, CheckCircle2, AlertTriangle, Settings2, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

const vehicles = [
  { id: 1, make: "Tata", model: "Nexon", year: 2022, vin: "MAT543210NJ123456", registration: "MH-12-AB-1234", status: "success", label: "Healthy" },
  { id: 2, make: "Maruti Suzuki", model: "Swift", year: 2021, vin: "MA3456789NJ654321", registration: "DL-3C-XY-5678", status: "warning", label: "Service Due" },
  { id: 3, make: "Mahindra", model: "Thar", year: 2023, vin: "MAT789012NJ789012", registration: "KA-51-LM-9101", status: "success", label: "Healthy" },
  { id: 4, make: "Hyundai", model: "Creta", year: 2023, vin: "MAL202345NJ202345", registration: "HR-26-EV-0001", status: "success", label: "Healthy" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const VehicleList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = vehicles.filter(v => 
    (v.make + " " + v.model).toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.registration.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-wrapper">
        
        {/* Header Block */}
        <div className="page-header">
          <div>
            <h1 className="section-header">Active Fleet</h1>
            <p className="section-subheader">Manage and monitor your vehicle inventory</p>
          </div>

          <Link to="/add-vehicle">
            <Button variant="primary" icon={Plus}>
              Add New Vehicle
            </Button>
          </Link>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
           <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search by make, model, or registration..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 h-11"
              />
           </div>
           <Button variant="secondary" className="shrink-0 h-11 px-4" icon={SlidersHorizontal}>
              Filters
           </Button>
        </div>

        {/* Vehicles Grid */}
        <AnimatePresence>
          {filtered.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
            >
              {filtered.map((veh) => (
                <motion.div key={veh.id} variants={itemVariants} layout className="h-full">
                  <Card variant="bordered" className="flex flex-col h-full bg-surface/80 group relative overflow-hidden" glowingBorder={veh.status === 'warning'}>
                    
                    {/* Status ambient glow */}
                    {veh.status === 'warning' && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>
                    )}
                    {veh.status === 'success' && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    )}
                    
                    {/* Header */}
                    <div className="flex justify-between items-start relative z-10 mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl border flex items-center justify-center
                          ${veh.status === 'warning' 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' 
                            : 'bg-white/5 text-slate-300 border-white/10 group-hover:border-indigo-500/30 group-hover:text-indigo-400 transition-colors'}`}
                        >
                          <Car className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-extrabold text-foreground leading-tight flex items-center gap-1.5">
                            {veh.make} <span className="text-slate-400 font-semibold">{veh.model}</span>
                          </h3>
                          <p className="text-slate-500 text-xs mt-1 font-semibold tracking-wider uppercase">Year {veh.year}</p>
                        </div>
                      </div>

                      <Badge variant={veh.status} dot pulse={veh.status === 'warning'}>
                         {veh.label}
                      </Badge>
                    </div>

                    {/* Meta Specs */}
                    <div className="space-y-2 relative z-10 flex-grow">
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-slate-500 text-sm font-medium">Registration</span>
                        <span className="text-slate-200 text-sm font-mono font-bold bg-white/5 px-2 py-0.5 rounded">{veh.registration}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-500 text-sm font-medium">VIN Code</span>
                        <span className="text-slate-400 text-xs font-mono">{veh.vin.substring(0, 10)}...</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-6 relative z-10 pt-4 border-t border-white/5">
                      <Link to={`/vehicle/${veh.id}`} className="flex-grow">
                        <Button variant="secondary" className="w-full text-sm">
                          View Dashboard
                        </Button>
                      </Link>
                      <Link to="/maintenance-records">
                        <Button variant="outline" className="px-3" title="Log Service">
                          <Wrench className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
               <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-slate-500" />
               </div>
               <h3 className="text-lg font-bold text-foreground mb-2">No vehicles found</h3>
               <p className="text-slate-400 text-sm">Try adjusting your search terms or filters.</p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default VehicleList;
