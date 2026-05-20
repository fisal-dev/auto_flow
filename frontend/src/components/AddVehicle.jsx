import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Car, ArrowLeft, ArrowRight, Save, CalendarClock, Hash, ScanBarcode, AlignLeft, CheckCircle2 } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Button from "./ui/Button";

const AddVehicle = () => {
  const [vehicle, setVehicle] = useState({
    make: "",
    model: "",
    year: "",
    vin: "",
    registrationNumber: "",
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setVehicle({ ...vehicle, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3); // Success step
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="page-wrapper max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link to="/vehicles">
              <Button variant="secondary" className="px-3">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">Add New Vehicle</h1>
              <p className="text-sm text-slate-400">Register a new asset into your fleet</p>
            </div>
          </div>
        </div>

        {/* Wizard Progress */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/5 z-0" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-500 transition-all duration-500 z-0" style={{ width: `${(step - 1) * 50}%` }} />
          
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                step >= s ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(var(--accent-rgb),0.4)]" : "bg-surface border-2 border-white/10 text-slate-500"
              }`}>
                {s === 3 && step === 3 ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              <span className={`text-xs font-semibold ${step >= s ? "text-indigo-400" : "text-slate-500"}`}>
                {s === 1 ? "Basic Info" : s === 2 ? "Identifiers" : "Done"}
              </span>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <Card variant="bordered" className="bg-surface/80 p-8 sm:p-12 relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

          {step === 1 && (
            <div className="animate-slide-left">
              <h2 className="text-xl font-bold text-foreground mb-6">Vehicle Details</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Manufacturer (Make)</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                        <Car className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="make"
                        value={vehicle.make}
                        onChange={handleChange}
                        className="input-field pl-11"
                        placeholder="e.g. Tata"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Model</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                        <AlignLeft className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="model"
                        value={vehicle.model}
                        onChange={handleChange}
                        className="input-field pl-11"
                        placeholder="e.g. Nexon"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Production Year</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                      <CalendarClock className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      name="year"
                      value={vehicle.year}
                      onChange={handleChange}
                      className="input-field pl-11"
                      placeholder="2023"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <Button onClick={handleNext} icon={ArrowRight} iconPosition="right">
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-slide-left">
              <h2 className="text-xl font-bold text-foreground mb-6">Identifiers</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">VIN (Vehicle Identification Number)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                      <ScanBarcode className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="vin"
                      value={vehicle.vin}
                      onChange={handleChange}
                      className="input-field pl-11 uppercase font-mono"
                      placeholder="MAT543210NJ123456"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">License Plate / Registration</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                      <Hash className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={vehicle.registrationNumber}
                      onChange={handleChange}
                      className="input-field pl-11 uppercase font-mono"
                      placeholder="MH-12-AB-1234"
                      required
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={handleBack} icon={ArrowLeft} iconPosition="left">
                    Back
                  </Button>
                  <Button type="submit" variant="primary" icon={Save} isLoading={loading}>
                    Save Vehicle
                  </Button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8 animate-scale-in">
              <div className="mx-auto w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6 glow-emerald">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-extrabold text-foreground mb-3">Vehicle Added</h2>
              <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                {vehicle.make} {vehicle.model} has been successfully registered to your fleet.
              </p>
              <div className="flex justify-center gap-4">
                <Link to="/vehicles">
                  <Button variant="secondary">Go to Fleet</Button>
                </Link>
                <Link to={`/vehicle/1`}>
                  <Button variant="primary">View Profile</Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddVehicle;
