import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Car, Wrench, CalendarClock, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { api } from "../utils/api";
import { useToast } from "./ui/Toast";

const Report = () => {
  const toast = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [complaint, setComplaint] = useState({
    vehicleId: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fetchingVehicles, setFetchingVehicles] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setFetchingVehicles(true);
        const data = await api.get("/vehicles");
        setVehicles(data);
        if (data.length > 0) {
          setComplaint(prev => ({ ...prev, vehicleId: data[0]._id }));
        }
      } catch (err) {
        console.error("Error loading vehicles for complaints:", err);
      } finally {
        setFetchingVehicles(false);
      }
    };
    fetchVehicles();
  }, []);

  const handleChange = (e) => {
    setComplaint({
      ...complaint,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaint.vehicleId || !complaint.description) {
      toast.warning("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      setSuccess(false);
      await api.post("/complaints", complaint);
      setLoading(false);
      setSuccess(true);
      toast.success("Complaint registered successfully!");
      setTimeout(() => {
        navigate("/complaint-history");
      }, 1500);
    } catch (err) {
      setLoading(false);
      toast.error(err.message || "Failed to log complaint ticket.");
    }
  };

  return (
    <DashboardLayout>
      <div className="page-wrapper max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link to="/complaint-history">
              <Button variant="secondary" className="px-3" title="Back to History">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
                <AlertCircle className="text-rose-500 w-6 h-6" /> Log Complaint
              </h1>
              <p className="text-sm text-slate-400">Report an operational or mechanical issue</p>
            </div>
          </div>
        </div>

        <Card variant="bordered" className="bg-surface/80 p-8 sm:p-10 relative overflow-hidden">
          
          {/* Subtle danger glow */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none" />

          {success ? (
            <div className="text-center py-12 animate-scale-in">
              <div className="mx-auto w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6 glow-emerald">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-extrabold text-foreground mb-3">Complaint Registered</h2>
              <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                Your issue has been logged securely and added to the incident response queue. Redirecting...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              
              {/* Vehicle input select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Vehicle</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-rose-400 transition-colors pointer-events-none">
                    <Car className="w-4 h-4" />
                  </span>
                  <select
                    name="vehicleId"
                    value={complaint.vehicleId}
                    onChange={handleChange}
                    className="input-field pl-10 focus:border-rose-500/60 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.12)] cursor-pointer"
                    disabled={fetchingVehicles}
                    required
                  >
                    {fetchingVehicles && <option value="">Loading vehicles...</option>}
                    {vehicles.length === 0 && !fetchingVehicles && <option value="">No active vehicles found</option>}
                    {vehicles.map(v => (
                      <option key={v._id} value={v._id}>
                        {v.make} {v.model} ({v.registration})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Issue Description input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Issue Description</label>
                <div className="relative group">
                  <span className="absolute top-3 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-rose-400 transition-colors pointer-events-none">
                    <Wrench className="w-4 h-4" />
                  </span>
                  <textarea
                    name="description"
                    value={complaint.description}
                    onChange={handleChange}
                    className="input-field pl-10 min-h-[120px] py-3 focus:border-rose-500/60 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.12)] resize-y"
                    placeholder="Describe the problem (e.g. Engine overheating, unusual brake noise)..."
                    required
                  />
                </div>
              </div>

              {/* Action button */}
              <div className="pt-4 border-t border-white/5">
                 <Button type="submit" variant="danger" className="w-full" size="lg" isLoading={loading} disabled={fetchingVehicles || vehicles.length === 0}>
                   Submit Complaint Ticket <ArrowRight className="w-4 h-4 ml-1" />
                 </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Report;
