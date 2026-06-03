import React, { useState, useEffect } from "react";
import { Search, Car, Wrench, Plus, User, FileText, CheckCircle2, AlertCircle, ShieldAlert, Sparkles, Navigation, Phone, Mail, Calendar, HelpCircle, X, IndianRupee, ClipboardCheck } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import { api } from "../utils/api";
import { useToast } from "./ui/Toast";

const GarageConsole = () => {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allGarages, setAllGarages] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [tasks, setTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState("all");

  // Modals state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState(false);
  const [submittingLog, setSubmittingLog] = useState(false);
  const [submittingRegister, setSubmittingRegister] = useState(false);

  // Complete Task modal
  const [completeModal, setCompleteModal] = useState({ open: false, task: null });
  const [completeForm, setCompleteForm] = useState({ cost: "", notes: "" });
  const [submittingComplete, setSubmittingComplete] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
  const isOwner = currentUser.role === 'owner';
  const isManager = currentUser.role === 'manager';
  const canSearch = currentUser.role === 'manager';

  // Sync user profile from server to retrieve fresh assignedGarages
  useEffect(() => {
    const syncProfile = async () => {
      try {
        const profile = await api.get("/user/profile");
        const cached = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { ...cached, ...profile };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      } catch (err) {
        console.error("Failed to sync user profile:", err);
      }
    };
    syncProfile();
  }, []);

  // Form states
  const [logForm, setLogForm] = useState({
    date: new Date().toISOString().split('T')[0],
    service: "",
    cost: "",
    provider: "",
    status: "success",
    label: "Completed"
  });

  const [registerForm, setRegisterForm] = useState({
    make: "",
    model: "",
    year: "",
    vin: "",
    registration: "",
    mileage: "",
    customerName: "",
    customerEmail: "",
    customerPhone: ""
  });

  const fetchTasks = async () => {
    try {
      const data = await api.get("/maintenance-task/upcoming");
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/maintenance-task/upcoming/${taskId}/complete`, { status: newStatus });
      toast.success(`Task marked as ${newStatus}`);
      fetchTasks();
    } catch (err) {
      toast.error(err.message || "Failed to update task");
    }
  };

  const openCompleteModal = (task) => {
    setCompleteModal({ open: true, task });
    setCompleteForm({ cost: "", notes: "" });
  };

  const submitCompleteTask = async (e) => {
    e.preventDefault();
    const cost = Number(completeForm.cost);
    if (!completeForm.cost || isNaN(cost) || cost < 0) {
      toast.warning("Please enter a valid service cost (0 or more).");
      return;
    }
    setSubmittingComplete(true);
    try {
      // 1. Mark task as completed
      await api.put(`/maintenance-task/upcoming/${completeModal.task._id}/complete`, {
        status: 'completed',
        cost,
        notes: completeForm.notes
      });
      toast.success("✅ Task completed! Invoice sent to customer.");
      setCompleteModal({ open: false, task: null });
      fetchTasks();
    } catch (err) {
      toast.error(err.message || "Failed to complete task.");
    } finally {
      setSubmittingComplete(false);
    }
  };

  // Load available garages/workshops and tasks
  useEffect(() => {
    const fetchGarages = async () => {
      try {
        const centers = await api.get("/service-centers");
        setAllGarages(centers);
      } catch (err) {
        console.error("Failed to load service centers:", err);
      }
    };
    fetchGarages();
    fetchTasks();
  }, []);

  // Determine selectable provider names
  const selectableProviders = isManager
    ? (currentUser.assignedGarages || [])
    : allGarages.map(g => g.name);

  // Set default provider when selectable list changes
  useEffect(() => {
    if (selectableProviders.length > 0 && !logForm.provider) {
      setLogForm(prev => ({ ...prev, provider: selectableProviders[0] }));
    }
  }, [selectableProviders]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setVehicle(null);
    setSearched(true);

    try {
      const data = await api.get(`/vehicles/search?q=${encodeURIComponent(searchQuery)}`);
      setVehicle(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "No matching vehicle found in database.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogFormChange = (e) => {
    const { name, value } = e.target;
    setLogForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterFormChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenLogModal = () => {
    setLogForm({
      date: new Date().toISOString().split('T')[0],
      service: "",
      cost: "",
      provider: selectableProviders[0] || "",
      status: "success",
      label: "Completed"
    });
    setIsLogModalOpen(true);
  };

  const handleOpenRegisterModal = () => {
    setRegisterForm({
      make: "",
      model: "",
      year: "",
      vin: "",
      registration: searchQuery, // Pre-fill with the searched plate/VIN
      mileage: "",
      customerName: "",
      customerEmail: "",
      customerPhone: ""
    });
    setIsQuickRegisterOpen(true);
  };

  const submitLogService = async (e) => {
    e.preventDefault();
    if (!logForm.service || !logForm.provider) {
      toast.warning("Service description and Service Center location are required.");
      return;
    }

    setSubmittingLog(true);
    try {
      await api.post("/maintenance-task", {
        vehicleId: vehicle._id,
        date: logForm.date,
        service: logForm.service,
        cost: Number(logForm.cost) || 0,
        provider: logForm.provider,
        status: logForm.status,
        label: logForm.label
      });
      toast.success("Maintenance record logged successfully! Customer has been notified.");
      setIsLogModalOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to log service ticket.");
    } finally {
      setSubmittingLog(false);
    }
  };

  const submitQuickRegister = async (e) => {
    e.preventDefault();
    const { make, model, year, vin, registration, customerEmail } = registerForm;
    if (!make || !model || !year || !vin || !registration || !customerEmail) {
      toast.warning("Make, model, year, VIN, registration, and customer email are required.");
      return;
    }

    setSubmittingRegister(true);
    try {
      const createdVehicle = await api.post("/vehicles/quick-register", registerForm);
      setVehicle(createdVehicle);
      setIsQuickRegisterOpen(false);

      // Auto-open log service modal for convenience
      setLogForm(prev => ({ ...prev, provider: selectableProviders[0] || "" }));
      setTimeout(() => {
        setIsLogModalOpen(true);
      }, 300);
    } catch (err) {
      toast.error(err.message || "Failed to quick register vehicle/customer.");
    } finally {
      setSubmittingRegister(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-wrapper">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="section-header">Garage Console</h1>
            <p className="section-subheader">Check-in customer vehicles, inspect status, and log service records</p>
          </div>
        </div>

        {/* Dashboard Search Card */}
        {canSearch && (
          <Card variant="bordered" className="bg-surface/80 max-w-3xl mx-auto p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4 glow-sm">
                <Search className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Find Customer Fleet Vehicle</h2>
              <p className="text-slate-400 text-xs mt-1">Search the database using either the **Registration Plate** or the **VIN**</p>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. MH-12-PQ-1234 or 17-digit VIN number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field flex-grow py-3 px-4 font-semibold uppercase tracking-wider"
                required
              />
              <Button type="submit" variant="primary" icon={Search} isLoading={loading} className="py-3 sm:w-auto w-full">
                Search Vehicle
              </Button>
            </form>
          </Card>
        )}

        {/* Results Area */}
        {canSearch && (
          <div className="max-w-3xl mx-auto mt-4">
            {loading && (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {!loading && searched && vehicle && (
              <Card variant="bordered" className="bg-surface/80 border-indigo-500/20 p-6 shadow-xl animate-scale-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-foreground">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">{vehicle.registration}</p>
                    </div>
                  </div>
                  <Button variant="primary" icon={Wrench} onClick={handleOpenLogModal}>
                    Log Service Ticket
                  </Button>
                </div>

                {/* Grid detail summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Vehicle Specs</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">VIN Number:</span>
                        <span className="text-slate-200 uppercase font-mono">{vehicle.vin}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Odometer Reading:</span>
                        <span className="text-slate-200">{vehicle.mileage || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Overall Health Status:</span>
                        <Badge variant="success" dot>Normal</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Registered Owner Information</h4>
                    {vehicle.userId ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          {vehicle.userId.name || "Unnamed Customer"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          {vehicle.userId.email}
                        </div>
                        {vehicle.userId.phone && (
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            {vehicle.userId.phone}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-rose-400 font-semibold">No registered customer account linked.</p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {!loading && searched && !vehicle && (
              <Card variant="bordered" className="bg-surface/80 border-rose-500/10 p-6 md:p-8 text-center animate-scale-in">
                <div className="inline-flex p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4 glow-emerald">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Vehicle Unregistered</h3>
                <p className="text-slate-400 text-xs max-w-md mx-auto mt-2 mb-6">
                  This vehicle is not in our system. You can quick-register the vehicle and auto-spawn a customer account using the button below.
                </p>
                <Button variant="primary" icon={Plus} onClick={handleOpenRegisterModal}>
                  Quick-Register & Check-in
                </Button>
              </Card>
            )}
          </div>
        )}

        {/* Active/Upcoming Service Tasks */}
        <div className="max-w-3xl mx-auto mt-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Wrench className="w-5 h-5 text-indigo-400" /> Active Maintenance Tasks
            </h2>
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'in-progress', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setTaskFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${taskFilter === status
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/10'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {tasks
              .filter(t => taskFilter === 'all' || t.status === taskFilter)
              .map(t => (
                <Card key={t._id} variant="bordered" className="bg-surface/80 p-4 flex justify-between items-center gap-4">
                  <div>
                    <h3 className="font-bold text-slate-200">{t.description}</h3>
                    <p className="text-xs text-slate-400">
                      Vehicle: <span className="font-semibold text-slate-300">{t.vehicleId ? `${t.vehicleId.make} ${t.vehicleId.model} (${t.vehicleId.registration})` : 'N/A'}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Scheduled Date: {new Date(t.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={t.status === 'completed' ? 'success' : t.status === 'in-progress' ? 'warning' : 'secondary'}>
                      {t.status}
                    </Badge>
                    {t.status === 'pending' && (
                      <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus(t._id, 'in-progress')}>
                        Start Task
                      </Button>
                    )}
                    {t.status === 'in-progress' && (
                      <Button variant="primary" size="sm" icon={ClipboardCheck} iconPosition="left" onClick={() => openCompleteModal(t)}>
                        Complete &amp; Bill
                      </Button>
                    )}
                  </div>
                </Card>
              ))}

            {tasks.filter(t => taskFilter === 'all' || t.status === taskFilter).length === 0 && (
              <Card variant="bordered" className="p-6 text-center text-slate-500 bg-surface/50 font-bold">
                No tasks match current filter.
              </Card>
            )}
          </div>
        </div>

        {/* Modal: Complete Task & Bill */}
        {completeModal.open && completeModal.task && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <Card variant="bordered" className="w-full max-w-md bg-surface/95 border-white/10 p-6 shadow-2xl relative animate-scale-up">
              <button
                onClick={() => setCompleteModal({ open: false, task: null })}
                className="absolute top-4 right-4 w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-extrabold text-foreground mb-1 flex items-center gap-2">
                <ClipboardCheck className="text-emerald-400 w-5 h-5" />
                Complete Task &amp; Generate Bill
              </h2>
              <p className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">
                {completeModal.task.description}
              </p>
              {completeModal.task.vehicleId && (
                <p className="text-xs text-slate-500 mb-5 font-semibold">
                  Vehicle: {completeModal.task.vehicleId.make} {completeModal.task.vehicleId.model} ({completeModal.task.vehicleId.registration})
                </p>
              )}

              <form onSubmit={submitCompleteTask} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5" /> Service Cost (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 2500"
                    value={completeForm.cost}
                    onChange={e => setCompleteForm(p => ({ ...p, cost: e.target.value }))}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notes / Work Done</label>
                  <textarea
                    rows={3}
                    placeholder="Describe what was done, parts replaced, etc."
                    value={completeForm.notes}
                    onChange={e => setCompleteForm(p => ({ ...p, notes: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 resize-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>This will mark the task <strong>completed</strong>, log it to maintenance history, and send the customer a <strong>payable invoice</strong> for ₹{completeForm.cost || '—'}.</span>
                </div>

                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setCompleteModal({ open: false, task: null })}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1" disabled={submittingComplete}>
                    {submittingComplete ? "Processing..." : "Complete & Send Bill"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal: Log Service Ticket */}
        {isLogModalOpen && vehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <Card variant="bordered" className="w-full max-w-md bg-surface/95 border-white/10 p-6 shadow-2xl relative animate-scale-up">
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-extrabold text-foreground mb-1 flex items-center gap-2">
                <Wrench className="text-indigo-400 w-5 h-5" />
                Log Service Ticket
              </h2>
              <p className="text-xs text-slate-400 mb-6 font-semibold uppercase tracking-wider">{vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.registration})</p>

              <form onSubmit={submitLogService} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Provider / Workshop *</label>
                  {selectableProviders.length === 0 ? (
                    <p className="text-xs text-rose-400 font-semibold">You have no assigned garages or workshop centers.</p>
                  ) : (
                    <select
                      name="provider"
                      value={logForm.provider}
                      onChange={handleLogFormChange}
                      className="input-field cursor-pointer"
                      required
                    >
                      {selectableProviders.map((name, i) => (
                        <option key={i} value={name}>{name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Job Description *</label>
                  <input
                    type="text"
                    name="service"
                    placeholder="e.g. Periodic Engine Oil & Filter Change"
                    value={logForm.service}
                    onChange={handleLogFormChange}
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={logForm.date}
                      onChange={handleLogFormChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Billing (INR)</label>
                    <input
                      type="number"
                      name="cost"
                      placeholder="0"
                      min="0"
                      value={logForm.cost}
                      onChange={handleLogFormChange}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category Status</label>
                    <select
                      name="status"
                      value={logForm.status}
                      onChange={handleLogFormChange}
                      className="input-field cursor-pointer"
                    >
                      <option value="success">Success / Normal</option>
                      <option value="info">Info / Notice</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Label Tag</label>
                    <select
                      name="label"
                      value={logForm.label}
                      onChange={handleLogFormChange}
                      className="input-field cursor-pointer"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Warranty">Warranty</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <Button variant="secondary" onClick={() => setIsLogModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" icon={CheckCircle2} isLoading={submittingLog} disabled={selectableProviders.length === 0}>
                    Log Maintenance
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal: Quick Register */}
        {isQuickRegisterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <Card variant="bordered" className="w-full max-w-lg bg-surface/95 border-white/10 p-6 shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button
                onClick={() => setIsQuickRegisterOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-extrabold text-foreground mb-1 flex items-center gap-2">
                <Sparkles className="text-indigo-400 w-5 h-5" />
                Quick-Register Fleet
              </h2>
              <p className="text-xs text-slate-400 mb-5 font-semibold">Instantly create customer profile and vehicle tags</p>

              <form onSubmit={submitQuickRegister} className="space-y-4">

                {/* Section: Customer info */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 border-b border-white/5 pb-1">Customer Account</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address *</label>
                      <input
                        type="email"
                        name="customerEmail"
                        placeholder="e.g. guest@client.com"
                        value={registerForm.customerEmail}
                        onChange={handleRegisterFormChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Name</label>
                      <input
                        type="text"
                        name="customerName"
                        placeholder="e.g. John Doe"
                        value={registerForm.customerName}
                        onChange={handleRegisterFormChange}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                    <input
                      type="text"
                      name="customerPhone"
                      placeholder="e.g. +91 98765 43210"
                      value={registerForm.customerPhone}
                      onChange={handleRegisterFormChange}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Section: Vehicle specs */}
                <div className="space-y-3 border-t border-white/5 pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 border-b border-white/5 pb-1">Vehicle Specifications</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Make / Brand *</label>
                      <input
                        type="text"
                        name="make"
                        placeholder="e.g. Hyundai"
                        value={registerForm.make}
                        onChange={handleRegisterFormChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model *</label>
                      <input
                        type="text"
                        name="model"
                        placeholder="e.g. Creta"
                        value={registerForm.model}
                        onChange={handleRegisterFormChange}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Year *</label>
                      <input
                        type="number"
                        name="year"
                        placeholder="2023"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        value={registerForm.year}
                        onChange={handleRegisterFormChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VIN *</label>
                      <input
                        type="text"
                        name="vin"
                        placeholder="17-character alpha-numeric"
                        value={registerForm.vin}
                        onChange={handleRegisterFormChange}
                        className="input-field font-mono uppercase"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registration Plate *</label>
                      <input
                        type="text"
                        name="registration"
                        placeholder="e.g. MH-12-PQ-1234"
                        value={registerForm.registration}
                        onChange={handleRegisterFormChange}
                        className="input-field font-semibold uppercase"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Mileage</label>
                      <input
                        type="text"
                        name="mileage"
                        placeholder="e.g. 15,200 km"
                        value={registerForm.mileage}
                        onChange={handleRegisterFormChange}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                  <Button variant="secondary" onClick={() => setIsQuickRegisterOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" icon={CheckCircle2} isLoading={submittingRegister}>
                    Register & Check-In
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

export default GarageConsole;
