import React, { useState, useEffect } from "react";
import { Users, Plus, Edit2, Trash2, Mail, Shield, CheckSquare, Square, X, MapPin, Building2 } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import { api } from "../utils/api";
import { useToast } from "./ui/Toast";

const ManagerManagement = () => {
  const toast = useToast();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = currentUser.role === "owner" || currentUser.role === "admin";

  const [managers, setManagers] = useState([]);
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    assignedGarages: []
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [managersData, serviceCentersData] = await Promise.all([
        api.get("/user/managers"),
        api.get("/service-centers")
      ]);
      setManagers(managersData);
      setGarages(serviceCentersData);
    } catch (err) {
      console.error("Error loading team manager data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGarageToggle = (garageName) => {
    setFormData(prev => {
      const already = prev.assignedGarages.includes(garageName);
      return {
        ...prev,
        assignedGarages: already
          ? prev.assignedGarages.filter(n => n !== garageName)
          : [...prev.assignedGarages, garageName]
      };
    });
  };

  const handleOpenAddModal = () => {
    setFormData({ name: "", email: "", password: "", assignedGarages: [] });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (manager) => {
    setSelectedManager(manager);
    setFormData({ name: manager.name, email: manager.email, password: "", assignedGarages: manager.assignedGarages || [] });
    setIsEditModalOpen(true);
  };

  const handleCreateManager = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) { toast.warning("Name, email and password are required."); return; }
    try {
      const res = await api.post("/user/managers", formData);
      setManagers(prev => [res, ...prev]);
      setIsAddModalOpen(false);
      toast.success("Manager account registered successfully!");
    } catch (err) { toast.error(err.message || "Failed to create manager account."); }
  };

  const handleUpdateManager = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) { toast.warning("Name and email are required."); return; }
    try {
      const payload = { name: formData.name, email: formData.email, assignedGarages: formData.assignedGarages };
      if (formData.password) payload.password = formData.password;
      const res = await api.put(`/user/managers/${selectedManager._id}`, payload);
      setManagers(prev => prev.map(m => m._id === selectedManager._id ? res : m));
      setIsEditModalOpen(false);
      toast.success("Manager updated successfully!");
    } catch (err) { toast.error(err.message || "Failed to update manager account."); }
  };

  const handleDeleteManager = async (managerId) => {
    if (!window.confirm("Are you sure you want to terminate this manager's account?")) return;
    try {
      await api.delete(`/user/managers/${managerId}`);
      setManagers(prev => prev.filter(m => m._id !== managerId));
      toast.success("Manager terminated successfully.");
    } catch (err) { toast.error(err.message || "Failed to terminate manager account."); }
  };

  // ── Reusable garage checkbox list used in both modals ───────────────────────
  const GarageSelector = () => (
    <div className="space-y-2 border-t border-white/5 pt-4">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Assign Workshop Locations</label>
      {garages.length === 0 ? (
        <p className="text-xs text-amber-400">No Service Centers registered yet. Please create service centers first.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
          {garages.map((garage) => {
            const isChecked = formData.assignedGarages.includes(garage.name);
            return (
              <div
                key={garage._id}
                onClick={() => handleGarageToggle(garage.name)}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer ${isChecked ? "border-indigo-500/40 bg-indigo-500/[0.02]" : ""}`}
              >
                {isChecked
                  ? <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                  : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${isChecked ? "text-indigo-300" : "text-slate-300"}`}>{garage.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{garage.location}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── Read-only view for managers — shows only their own card + assigned garages
  const ManagerSelfView = () => {
    const me = managers[0];
    if (!me) return (
      <Card variant="bordered" className="py-16 text-center bg-surface/80">
        <Shield className="w-8 h-8 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 text-sm font-semibold">No assignment data found</p>
      </Card>
    );

    const myGarages = garages.filter(g => (me.assignedGarages || []).includes(g.name));

    return (
      <div className="space-y-6">
        {/* Profile summary card */}
        <Card variant="bordered" className="p-6 bg-surface/80">
          <div className="flex items-start gap-5">
            <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <Shield className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h2 className="text-2xl font-extrabold text-foreground">{me.name}</h2>
                <Badge variant="info">Garage Manager</Badge>
              </div>
              <p className="text-sm text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {me.email}
              </p>
            </div>
          </div>
        </Card>

        {/* Assigned garages */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Your Assigned Workshops
          </h3>
          {myGarages.length === 0 ? (
            <Card variant="bordered" className="py-16 text-center bg-surface/80">
              <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-semibold">No garage locations assigned yet</p>
              <p className="text-xs text-slate-600 mt-1">Contact your owner to be assigned a workspace.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGarages.map((garage, idx) => (
                <Card key={garage._id || idx} variant="bordered" delay={idx * 0.05} hoverEffect className="p-5 bg-surface/80 group">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 group-hover:scale-110 transition-transform">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-foreground text-sm truncate group-hover:text-indigo-300 transition-colors">{garage.name}</h4>
                      {garage.location && (
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{garage.location}</span>
                        </p>
                      )}
                      {garage.phone && <p className="text-xs text-slate-600 mt-0.5">{garage.phone}</p>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="page-wrapper">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="section-header">Team Portal</h1>
            <p className="section-subheader">
              {isOwner
                ? "Manage garage operators and allocate workspace assignments"
                : "Your assignment details and garage workspace"}
            </p>
          </div>
          {isOwner && (
            <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
              Add Manager
            </Button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !isOwner ? (
          // Manager → read-only self-view
          <ManagerSelfView />
        ) : managers.length === 0 ? (
          // Owner → empty state
          <Card variant="bordered" className="text-center py-24 bg-surface/80">
            <div className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-500 mb-5">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No team managers registered</h3>
            <p className="text-slate-400 text-sm">Spawn manager accounts to operate your garage franchise.</p>
          </Card>
        ) : (
          // Owner → full manager grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managers.map((manager, index) => (
              <Card key={manager._id || index} variant="bordered" delay={index * 0.05} hoverEffect className="p-6 flex flex-col justify-between h-full bg-surface/80 group">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                      <Shield className="w-5 h-5" />
                    </div>
                    <Badge variant="info">Garage Manager</Badge>
                  </div>
                  <h3 className="text-xl font-extrabold text-foreground mb-1 leading-tight group-hover:text-indigo-300 transition-colors">{manager.name}</h3>
                  <p className="text-xs text-slate-500 font-semibold mb-4 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-600" /> {manager.email}
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assigned Workspace Garages</p>
                    {(!manager.assignedGarages || manager.assignedGarages.length === 0) ? (
                      <span className="text-xs text-rose-400 font-semibold block">No assigned workshops</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {manager.assignedGarages.map((gName, idx) => (
                          <Badge key={idx} variant="violet" size="sm">{gName}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-white/5 flex gap-2">
                  <Button variant="secondary" className="flex-1 font-bold text-xs" icon={Edit2} onClick={() => handleOpenEditModal(manager)}>Edit Info</Button>
                  <Button variant="danger" className="font-bold text-xs shrink-0" icon={Trash2} onClick={() => handleDeleteManager(manager._id)}>Terminate</Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal: Add Manager — Owner only */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <Card variant="bordered" className="w-full max-w-lg bg-surface/95 border-white/10 p-6 shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-extrabold text-foreground mb-6 flex items-center gap-2">
                <Users className="text-indigo-400 w-5 h-5" /> Add Team Manager
              </h2>
              <form onSubmit={handleCreateManager} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Manager Full Name *</label>
                  <input type="text" name="name" placeholder="e.g. Rahul Sharma" value={formData.name} onChange={handleInputChange} className="input-field" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address *</label>
                  <input type="email" name="email" placeholder="e.g. rahul@garage.com" value={formData.email} onChange={handleInputChange} className="input-field" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Default Password *</label>
                  <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} className="input-field" required />
                </div>
                <GarageSelector />
                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                  <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" icon={Plus}>Register Manager</Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal: Edit Manager — Owner only */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <Card variant="bordered" className="w-full max-w-lg bg-surface/95 border-white/10 p-6 shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-extrabold text-foreground mb-6 flex items-center gap-2">
                <Users className="text-indigo-400 w-5 h-5" /> Edit Team Manager
              </h2>
              <form onSubmit={handleUpdateManager} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Manager Full Name *</label>
                  <input type="text" name="name" placeholder="e.g. Rahul Sharma" value={formData.name} onChange={handleInputChange} className="input-field" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address *</label>
                  <input type="email" name="email" placeholder="e.g. rahul@garage.com" value={formData.email} onChange={handleInputChange} className="input-field" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Change Password (leave blank to keep current)</label>
                  <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} className="input-field" />
                </div>
                <GarageSelector />
                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                  <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" icon={Plus}>Save Changes</Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManagerManagement;
