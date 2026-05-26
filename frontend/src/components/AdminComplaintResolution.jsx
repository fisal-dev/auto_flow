import React, { useState, useEffect } from "react";
import { AlertCircle, Wrench, HelpCircle, MessageSquare, CheckSquare, Sparkles, Navigation, X } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import { api } from "../utils/api";
import { useToast } from "./ui/Toast";

const AdminComplaintResolution = () => {
  const toast = useToast();
  const [complaints, setComplaints] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal response and assignment states
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [assignStoreId, setAssignStoreId] = useState("");
  
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isManager = currentUser.role === 'manager';
  const isAdmin = currentUser.role === 'admin';
  const isOwner = currentUser.role === 'owner';

  const loadData = async () => {
    try {
      const cmpData = await api.get("/complaint");
      setComplaints(cmpData);

      if (isAdmin || isOwner) {
        const storeData = await api.get("/store");
        setStores(storeData);
        if (storeData.length > 0) setAssignStoreId(storeData[0]._id);
      }
    } catch (err) {
      toast.error("Failed to load complaint logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignStoreId) return;
    try {
      await api.put(`/complaint/${activeComplaint._id}/assign`, { storeId: assignStoreId });
      toast.success("Complaint assigned to service center!");
      setActiveComplaint(null);
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to assign complaint");
    }
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!responseText.trim()) return;
    try {
      await api.put(`/complaint/${activeComplaint._id}/respond`, {
        response: responseText,
        status: "success",
        label: "Resolved"
      });
      toast.success("Response dispatched! Complaint marked as Resolved.");
      setActiveComplaint(null);
      setResponseText("");
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to submit response");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Complaints Resolution Board</h1>
          <p className="text-sm text-slate-400">Review vehicle issues, allocate servicing workshops, and post solutions</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {complaints.map((c) => (
              <Card key={c._id} variant="bordered" className="p-6 bg-surface/80">
                <div className="flex justify-between items-start flex-col sm:flex-row gap-4 border-b border-white/5 pb-4 mb-4">
                  <div className="flex gap-3">
                    <div className={`p-2.5 rounded-xl border ${
                      c.status === 'danger' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                      c.status === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-200">
                        {c.vehicleId ? `${c.vehicleId.make} ${c.vehicleId.model}` : "Unknown Vehicle"}
                      </h3>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{c.vehicleId?.registration}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Badge variant={c.status}>{c.label}</Badge>
                    {c.assignedToStore && (
                      <Badge variant="indigo">
                        Workshop: {c.assignedToStore.name}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Reported Problem:</span>
                    <p className="text-sm text-slate-300 font-semibold">{c.description}</p>
                  </div>

                  {c.response && (
                    <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Resolution response:
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">{c.response}</p>
                    </div>
                  )}

                  {!c.response && (
                    <div className="flex gap-2 pt-2 border-t border-white/5">
                      {(isAdmin || isOwner) && !c.assignedToStore && (
                        <Button variant="secondary" icon={Wrench} onClick={() => setActiveComplaint(c)}>
                          Assign to Store
                        </Button>
                      )}
                      {(isManager || isAdmin || isOwner) && (
                        <Button variant="primary" icon={CheckSquare} onClick={() => {
                          setActiveComplaint(c);
                          setResponseText("");
                        }}>
                          Resolve & Respond
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {complaints.length === 0 && (
              <Card variant="bordered" className="p-8 text-center bg-surface/50 text-slate-500 font-bold">
                No active complaints logged in system.
              </Card>
            )}
          </div>
        )}

        {/* Modal for assign/response actions */}
        {activeComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <Card variant="bordered" className="w-full max-w-md bg-surface/95 p-6 relative animate-scale-up">
              <button 
                onClick={() => setActiveComplaint(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Decide if action is Assign or Respond */}
              {!activeComplaint.assignedToStore && (isAdmin || isOwner) && !responseText ? (
                <div>
                  <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-indigo-400" />
                    Assign Workshop
                  </h2>
                  <p className="text-xs text-slate-400 mb-4">Choose a store to inspect and repair the vehicle</p>
                  <form onSubmit={handleAssign} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400">Servicing Station</label>
                      <select
                        className="input-field cursor-pointer"
                        value={assignStoreId}
                        onChange={(e) => setAssignStoreId(e.target.value)}
                        required
                      >
                        {stores.map(s => (
                          <option key={s._id} value={s._id}>{s.name} ({s.address})</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-3">
                      <Button variant="secondary" onClick={() => setActiveComplaint(null)}>Cancel</Button>
                      <Button type="submit" variant="primary">Assign Store</Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    Resolve Issue
                  </h2>
                  <p className="text-xs text-slate-400 mb-4">Submit the solution to notify the vehicle owner</p>
                  <form onSubmit={handleRespond} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400">Response / Troubleshooting *</label>
                      <textarea
                        className="input-field min-h-[100px] py-2"
                        placeholder="e.g. Brake calipers serviced, pad replacement complete under warranty."
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-3">
                      <Button variant="secondary" onClick={() => setActiveComplaint(null)}>Cancel</Button>
                      <Button type="submit" variant="primary">Submit Resolution</Button>
                    </div>
                  </form>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminComplaintResolution;
