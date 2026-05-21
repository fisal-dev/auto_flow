import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Wrench, Plus, CalendarClock, IndianRupee, MapPin, Search, Filter, Car, X, CreditCard } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import { api } from "../utils/api";
import { useToast } from "./ui/Toast";

const Maintenance = () => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentProcessingId, setPaymentProcessingId] = useState(null);

  const [newRecord, setNewRecord] = useState({
    vehicleId: "",
    date: new Date().toISOString().split("T")[0],
    service: "",
    cost: "",
    provider: "",
    status: "success",
    label: "Completed"
  });

  const queryParams = new URLSearchParams(window.location.search);
  const paySuccess = queryParams.get("success") === "true";
  const payCancel = queryParams.get("success") === "false";

  const loadData = async () => {
    try {
      setLoading(true);
      const [recordsData, vehiclesData] = await Promise.all([
        api.get("/maintenance"),
        api.get("/vehicles")
      ]);
      setRecords(recordsData);
      setVehicles(vehiclesData);
      if (vehiclesData.length > 0) {
        setNewRecord(prev => ({ ...prev, vehicleId: vehiclesData[0]._id }));
      }
    } catch (err) {
      console.error("Error loading maintenance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sessionId = queryParams.get("session_id");

    const runVerificationAndLoad = async () => {
      if (paySuccess && sessionId) {
        // Clear query parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        try {
          await api.post("/stripe/verify-session", { sessionId });
          toast.success("Payment verified and completed successfully!");
        } catch (err) {
          console.error("Error verifying payment session:", err);
          toast.error("Failed to verify payment session.");
        }
      }
      await loadData();
    };

    runVerificationAndLoad();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRecord.vehicleId || !newRecord.service || !newRecord.provider) {
      toast.warning("Please fill in all required fields.");
      return;
    }
    try {
      const res = await api.post("/maintenance", {
        ...newRecord,
        cost: newRecord.cost ? Number(newRecord.cost) : 0
      });
      setRecords(prev => [res, ...prev]);
      setIsModalOpen(false);
      setNewRecord({
        vehicleId: vehicles[0]?._id || "",
        date: new Date().toISOString().split("T")[0],
        service: "",
        cost: "",
        provider: "",
        status: "success",
        label: "Completed"
      });
      toast.success("Maintenance service logged successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to log maintenance record.");
    }
  };

  const handlePay = async (recordId) => {
    try {
      setPaymentProcessingId(recordId);
      const res = await api.post("/stripe/pay-service", { recordId });
      if (res.url) {
        window.location.href = res.url;
      } else {
        throw new Error("Payment session URL not returned");
      }
    } catch (err) {
      toast.error(err.message || "Failed to initiate payment");
    } finally {
      setPaymentProcessingId(null);
    }
  };

  const filtered = records.filter(r => {
    const vName = r.vehicleId ? `${r.vehicleId.make} ${r.vehicleId.model}` : "";
    return vName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           r.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
           r.provider.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <DashboardLayout>
      <div className="page-wrapper relative">
        
        {/* Payment Banner Alerts */}
        {paySuccess && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-between animate-fade-in glow-sm">
            <span className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Payment Successful! Your service invoice has been processed and marked as Paid.
            </span>
            <button onClick={() => window.history.replaceState({}, document.title, window.location.pathname)} className="p-1 hover:bg-white/10 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {payCancel && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 font-bold flex items-center justify-between animate-fade-in">
            <span className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Payment Cancelled. The invoice remains unpaid.
            </span>
            <button onClick={() => window.history.replaceState({}, document.title, window.location.pathname)} className="p-1 hover:bg-white/10 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header Block */}
        <div className="page-header">
          <div>
            <h1 className="section-header">Maintenance Log</h1>
            <p className="section-subheader">Historical service records and repairs</p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Log Service Action
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-2">
           <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search records by vehicle, service, or provider..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 h-11"
              />
           </div>
        </div>

        {/* Records Table Card */}
        <Card variant="bordered" className="p-0 overflow-hidden bg-surface/80">
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filtered.length === 0 ? (
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
                    <th>Payment</th>
                    <th className="pr-6">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((rec) => (
                    <tr key={rec._id}>
                      <td className="pl-6">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                            <Car className="w-3 h-3 text-slate-400" />
                          </div>
                          {rec.vehicleId ? (
                            <Link to={`/vehicle/${rec.vehicleId._id}`} className="hover:text-indigo-400 transition-colors">
                              {rec.vehicleId.make} {rec.vehicleId.model}
                            </Link>
                          ) : (
                            <span className="text-slate-400">Unknown Vehicle</span>
                          )}
                        </div>
                      </td>
                      <td className="text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <CalendarClock className="w-3.5 h-3.5 text-indigo-400" /> {new Date(rec.date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="font-bold text-slate-200">{rec.service}</td>
                      <td className="font-bold text-slate-300">
                        <span className="flex items-center gap-1">
                          <IndianRupee className="w-3.5 h-3.5 text-slate-400" /> {rec.cost.toLocaleString()}
                        </span>
                      </td>
                      <td className="text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" /> {rec.provider}
                        </span>
                      </td>
                      <td>
                        {rec.cost > 0 ? (
                          rec.paymentStatus === "paid" ? (
                            <Badge variant="success" size="sm">Paid</Badge>
                          ) : (
                            <Button 
                              variant="primary" 
                              size="sm" 
                              className="py-1 px-2.5 text-xs font-extrabold flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500" 
                              onClick={() => handlePay(rec._id)}
                              isLoading={paymentProcessingId === rec._id}
                            >
                              Pay via Stripe
                            </Button>
                          )
                        ) : (
                          <span className="text-slate-500 text-xs">Warranty/Free</span>
                        )}
                      </td>
                      <td className="pr-6">
                        <Badge variant={rec.status || "success"} dot size="sm">{rec.label || "Completed"}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Modal: Log Service Action */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <Card variant="bordered" className="w-full max-w-lg bg-surface/95 border-white/10 p-6 shadow-2xl relative animate-scale-up">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-extrabold text-foreground mb-6 flex items-center gap-2">
                <Wrench className="text-indigo-400 w-5 h-5" />
                Log Service Action
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Vehicle *</label>
                  <select
                    name="vehicleId"
                    value={newRecord.vehicleId}
                    onChange={handleChange}
                    className="input-field cursor-pointer"
                    required
                  >
                    {vehicles.map(v => (
                      <option key={v._id} value={v._id}>
                        {v.make} {v.model} ({v.registration})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={newRecord.date}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Cost (₹)</label>
                    <input
                      type="number"
                      name="cost"
                      placeholder="e.g. 5000"
                      value={newRecord.cost}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Description *</label>
                  <input
                    type="text"
                    name="service"
                    placeholder="e.g. Synthetic Oil Change, Brake Replacement"
                    value={newRecord.service}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Provider / Workshop *</label>
                  <input
                    type="text"
                    name="provider"
                    placeholder="e.g. Maruti Suzuki Service Center, QuickFix Garage"
                    value={newRecord.provider}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visual Badge Type</label>
                    <select
                      name="status"
                      value={newRecord.status}
                      onChange={handleChange}
                      className="input-field cursor-pointer"
                    >
                      <option value="success">Success (Completed)</option>
                      <option value="warning">Warning (Pending/Alert)</option>
                      <option value="info">Info (Warranty/Consult)</option>
                      <option value="danger">Danger (Failed/Critical)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Badge Label Text</label>
                    <input
                      type="text"
                      name="label"
                      placeholder="e.g. Completed, Pending"
                      value={newRecord.label}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" icon={Plus}>
                    Save Record
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

export default Maintenance;
