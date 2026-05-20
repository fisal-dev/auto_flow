import React, { useState } from "react";
import { MapPin, Plus, Phone, Navigation, Star, Clock } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Button from "./ui/Button";

const ServiceCenters = () => {
  const [centers] = useState([
    { name: "Mumbai Auto Care Garage", location: "Andheri East, Mumbai", contact: "+91 98765 43210", rating: 4.8, status: "Open" },
    { name: "Delhi Elite Mechanics", location: "Connaught Place, New Delhi", contact: "+91 98123 45678", rating: 4.5, status: "Open" },
    { name: "Bangalore Speedy Tires", location: "Indiranagar, Bengaluru", contact: "+91 80555 12345", rating: 4.2, status: "Closed" },
  ]);

  return (
    <DashboardLayout>
      <div className="page-wrapper">
        
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="section-header">Service Centers</h1>
            <p className="section-subheader">Find and contact authorized fleet servicing vendors</p>
          </div>
          <Button variant="primary" icon={Plus}>
            Register Center
          </Button>
        </div>

        {/* Center Grid */}
        {centers.length === 0 ? (
          <Card variant="bordered" className="text-center py-24 bg-surface/80">
            <div className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-500 mb-5 glow-sm">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No service hubs registered</h3>
            <p className="text-slate-400 text-sm">Start by registering your first servicing vendor.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {centers.map((center, index) => (
              <Card key={index} variant="bordered" delay={index * 0.1} hoverEffect className="p-6 flex flex-col justify-between h-full bg-surface/80 group">
                
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                       <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                       <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                       <span className="text-xs font-bold text-foreground">{center.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-extrabold text-foreground mb-2 leading-tight group-hover:text-indigo-300 transition-colors">
                    {center.name}
                  </h3>
                  
                  <div className="space-y-2 mt-4 text-sm font-medium text-slate-400">
                     <div className="flex items-center gap-2">
                       <Navigation className="w-4 h-4 text-slate-500" />
                       {center.location}
                     </div>
                     <div className="flex items-center gap-2">
                       <Clock className="w-4 h-4 text-slate-500" />
                       <span className={center.status === "Open" ? "text-emerald-400" : "text-rose-400"}>
                         {center.status}
                       </span>
                     </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/5">
                  <a href={`tel:${center.contact}`} className="block">
                    <Button variant="secondary" className="w-full" icon={Phone} iconPosition="left">
                      Call {center.contact}
                    </Button>
                  </a>
                </div>

              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ServiceCenters;
