import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Car, Wrench, CalendarClock, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Button from "./ui/Button";

const Report = () => {
  const [complaint, setComplaint] = useState({
    vehicle: "",
    issue: "",
    date: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setComplaint({
      ...complaint,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate("/complaint-history");
      }, 1500);
    }, 1500);
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
              
              {/* Vehicle input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Vehicle</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-rose-400 transition-colors">
                    <Car className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="vehicle"
                    value={complaint.vehicle}
                    onChange={handleChange}
                    className="input-field pl-10 focus:border-rose-500/60 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.12)]"
                    placeholder="e.g. Tata Nexon"
                    required
                  />
                </div>
              </div>

              {/* Issue Description input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Issue Description</label>
                <div className="relative group">
                  <span className="absolute top-3 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-rose-400 transition-colors">
                    <Wrench className="w-4 h-4" />
                  </span>
                  <textarea
                    name="issue"
                    value={complaint.issue}
                    onChange={handleChange}
                    className="input-field pl-10 min-h-[120px] py-3 focus:border-rose-500/60 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.12)] resize-y"
                    placeholder="Describe the problem (e.g. Engine overheating, unusual brake noise)..."
                    required
                  />
                </div>
              </div>

              {/* Date input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Discovery Date</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-rose-400 transition-colors">
                    <CalendarClock className="w-4 h-4" />
                  </span>
                  <input
                    type="date"
                    name="date"
                    value={complaint.date}
                    onChange={handleChange}
                    className="input-field pl-10 focus:border-rose-500/60 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.12)]"
                    required
                  />
                </div>
              </div>

              {/* Action button */}
              <div className="pt-4 border-t border-white/5">
                 <Button type="submit" variant="danger" className="w-full" size="lg" isLoading={loading}>
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
