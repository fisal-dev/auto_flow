import React, { useState, useEffect } from "react";
import { MapPin, Plus, Navigation, Phone, Search, Trash2, X } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import { api } from "../utils/api";
import { useToast } from "./ui/Toast";

const AdminStoreManagement = () => {
  const toast = useToast();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchStores = async () => {
    try {
      const data = await api.get("/admin/stores");
      setStores(data);
    } catch (err) {
      toast.error("Failed to load store list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.address) {
      toast.warning("Name and Address are required");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/admin/stores", form);
      toast.success("Service Station registered successfully!");
      setShowAddForm(false);
      setForm({ name: "", address: "", phone: "" });
      fetchStores();
    } catch (err) {
      toast.error(err.message || "Failed to register store");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = stores.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Servicing Stations</h1>
            <p className="text-sm text-slate-400">Configure and inspect system-registered mechanics and warehouses</p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setShowAddForm(!showAddForm)}>
            Register Station
          </Button>
        </div>

        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <Card variant="bordered" className="w-full max-w-lg bg-surface/95 border-white/10 p-6 shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button
                onClick={() => setShowAddForm(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-extrabold text-foreground mb-6 flex items-center gap-2">
                <MapPin className="text-indigo-400 w-5 h-5" />
                New Service Station
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Station Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Apex Collision Center"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Street Address *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 102 Industrial Parkway"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Phone Number</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. +91 99999 88888"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setShowAddForm(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" isLoading={submitting}>Save Station</Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        <Card variant="bordered" className="p-6 bg-surface/80">
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Filter stations by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(s => (
                <div key={s._id} className="p-4 bg-white/2 border border-white/5 rounded-xl hover:border-indigo-500/20 transition-all flex gap-3 items-start">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-200">{s.name}</h3>
                    <p className="text-xs text-slate-400">{s.address}</p>
                    {s.phone && (
                      <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 pt-1">
                        <Phone className="w-3.5 h-3.5" />
                        {s.phone}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-2 py-8 text-center text-slate-500 font-bold">No registered locations found.</div>
              )}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminStoreManagement;
