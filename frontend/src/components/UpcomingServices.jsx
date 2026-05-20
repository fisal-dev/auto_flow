import React, { useState } from "react";
import { CalendarClock, Car, Clock, Plus, Check, MoreHorizontal } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

const UpcomingServices = () => {
  const [services] = useState([
    { id: 1, vehicle: "Toyota Corolla", service: "Oil Change", date: "Mar 10, 2025", status: "warning", label: "Impending", daysLeft: 2 },
    { id: 2, vehicle: "Honda Civic", service: "Brake Inspection", date: "Mar 15, 2025", status: "warning", label: "Impending", daysLeft: 7 },
    { id: 3, vehicle: "Ford Focus", service: "Tire Rotation", date: "Mar 20, 2025", status: "info", label: "Scheduled", daysLeft: 12 },
    { id: 4, vehicle: "Tesla Model 3", service: "Annual Checkup", date: "Apr 05, 2025", status: "info", label: "Scheduled", daysLeft: 28 },
  ]);

  return (
    <DashboardLayout>
      <div className="page-wrapper">
        
        {/* Header Block */}
        <div className="page-header">
          <div>
            <h1 className="section-header">Upcoming Services</h1>
            <p className="section-subheader">Preventative service calendar and scheduling</p>
          </div>
          <Button variant="primary" icon={Plus}>
            Schedule Action
          </Button>
        </div>

        {/* Schedule Grid */}
        {services.length === 0 ? (
          <Card variant="bordered" className="text-center py-24 bg-surface/80">
            <div className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-500 mb-5 glow-sm">
              <CalendarClock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No tasks scheduled</h3>
            <p className="text-slate-400 text-sm">All systems are currently running within healthy parameters.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((item, i) => (
              <Card key={item.id} variant="bordered" delay={i * 0.1} glowingBorder={item.status === 'warning'} className="p-6 flex flex-col justify-between min-h-[220px] bg-surface/80 group relative overflow-hidden">
                
                {item.status === 'warning' && (
                   <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-[30px] -mr-5 -mt-5 pointer-events-none"></div>
                )}

                <div className="flex justify-between items-start relative z-10 mb-4">
                  <div className="flex items-center gap-2 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-slate-300">
                    <Car className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{item.vehicle}</span>
                  </div>
                  <button className="text-slate-500 hover:text-white transition-colors">
                     <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                <div className="my-2 relative z-10 flex-grow">
                  <h3 className="text-xl font-extrabold text-foreground leading-tight mb-3 group-hover:text-indigo-300 transition-colors">
                    {item.service}
                  </h3>
                  
                  <div className="flex flex-col gap-2">
                     <div className="flex items-center justify-between text-xs font-medium">
                       <span className="flex items-center gap-1.5 text-slate-400">
                         <CalendarClock className="w-3.5 h-3.5" /> Date
                       </span>
                       <span className="text-slate-200">{item.date}</span>
                     </div>
                     <div className="flex items-center justify-between text-xs font-medium">
                       <span className="flex items-center gap-1.5 text-slate-400">
                         <Clock className="w-3.5 h-3.5" /> Timeline
                       </span>
                       <span className={item.daysLeft <= 7 ? "text-amber-400" : "text-indigo-400"}>
                          In {item.daysLeft} days
                       </span>
                     </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                   <Badge variant={item.status} size="sm" dot>{item.label}</Badge>
                   <Button variant="ghost" className="h-8 px-3 text-xs" icon={Check} iconPosition="left">
                     Done
                   </Button>
                </div>

              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UpcomingServices;
