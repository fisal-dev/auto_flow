import React, { useState, useEffect } from "react";
import { MapPin, Plus, Phone, Navigation, Star, Clock, X } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { api } from "../utils/api";
import { useToast } from "./ui/Toast";

const ServiceCenters = () => {
  const toast = useToast();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newCenter, setNewCenter] = useState({
    name: "",
    location: "",
    contact: "",
    rating: "4.5",
    status: "Open"
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isManager = user.role === "manager" || user.role === "owner" || user.role === "admin";

  const loadCenters = async () => {
    try {
      setLoading(true);
      const data = await api.get("/service-centers");
      setCenters(data);
    } catch (err) {
      console.error("Error loading service centers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCenters();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCenter(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCenter.name || !newCenter.location || !newCenter.contact) {
      toast.warning("Please fill in all required fields.");
      return;
    }
    try {
      const res = await api.post("/service-centers", {
        ...newCenter,
        rating: Number(newCenter.rating)
      });
      setCenters(prev => [res, ...prev].sort((a, b) => b.rating - a.rating));
      setIsModalOpen(false);
      setNewCenter({
        name: "",
        location: "",
        contact: "",
        rating: "4.5",
        status: "Open"
      });
      toast.success("Service center registered successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to register service center.");
    }
  };

  return (
    <DashboardLayout>
      <div className="page-wrapper">
        
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="section-header">Service Centers</h1>
            <p className="section-subheader">Find and contact authorized fleet servicing vendors</p>
          </div>
          {isManager && (
            <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
              Register Center
            </Button>
          )}
        </div>

        {/* Center Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : centers.length === 0 ? (
          <Card variant="bordered" className="text-center py-24 bg-surface/80">
            <div className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-500 mb-5 glow-sm">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No service hubs registered</h3>
            <p className="text-slate-400 text-sm">
              {isManager 
                ? "Start by registering your first servicing vendor." 
                : "Authorized vendors will appear here once registered."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {centers.map((center, index) => (
              <Card key={center._id || index} variant="bordered" delay={index * 0.05} hoverEffect className="p-6 flex flex-col justify-between h-full bg-surface/80 group">
                
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                       <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                       <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                       <span className="text-xs font-bold text-foreground">{center.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-extrabold text-foreground mb-2 leading-tight group-hover:text-indigo-300 transition-colors">
                    {center.name}
                  </h3>
                  
                  <div className="space-y-2 mt-4 text-sm font-medium text-slate-400">
                     <div className="flex items-center gap-2">
                       <Navigation className="w-4 h-4 text-slate-500 shrink-0" />
                       {center.location}
                     </div>
                     <div className="flex items-center gap-2">
                       <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                       <span className={center.status === "Open" ? "text-emerald-400" : "text-rose-400"}>
                         {center.status}
                       </span>
                     </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/5">
                  <a href={`tel:${center.contact}`} className="block">
                    <Button variant="secondary" className="w-full font-bold" icon={Phone} iconPosition="left">
                      Call {center.contact}
                    </Button>
                  </a>
                </div>

              </Card>
            ))}
          </div>
        )}

        {/* Modal: Register Center */}
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
                <MapPin className="text-indigo-400 w-5 h-5" />
                Register Service Center
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Workshop Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Mumbai Auto Care Garage"
                    value={newCenter.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location Address *</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Andheri East, Mumbai"
                    value={newCenter.location}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Phone Number *</label>
                  <input
                    type="text"
                    name="contact"
                    placeholder="e.g. +91 98765 43210"
                    value={newCenter.contact}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Initial Rating (1-5)</label>
                    <input
                      type="number"
                      name="rating"
                      min="1"
                      max="5"
                      step="0.1"
                      placeholder="4.5"
                      value={newCenter.rating}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                    <select
                      name="status"
                      value={newCenter.status}
                      onChange={handleChange}
                      className="input-field cursor-pointer"
                    >
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" icon={Plus}>
                    Register Hub
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

export default ServiceCenters;
