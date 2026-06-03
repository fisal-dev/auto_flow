import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Car, ArrowLeft, ArrowRight, Save, CalendarClock, Hash, ScanBarcode, AlignLeft, CheckCircle2 } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { api } from "../utils/api";

const AddVehicle = () => {
  const [vehicle, setVehicle] = useState({
    make: "",
    model: "",
    year: "",
    vin: "",
    registrationNumber: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState("");
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let errorMsg = "";
    if (name === "make") {
      if (!value.trim()) {
        errorMsg = "Manufacturer is required";
      }
    }
    if (name === "model") {
      if (!value.trim()) {
        errorMsg = "Model name is required";
      }
    }
    if (name === "year") {
      const yearNum = Number(value);
      const currentYear = new Date().getFullYear();
      if (!value) {
        errorMsg = "Production year is required";
      } else if (isNaN(yearNum) || yearNum < 1886 || yearNum > currentYear + 2) {
        errorMsg = `Enter a valid year (1886 - ${currentYear + 2})`;
      }
    }
    if (name === "vin") {
      const cleaned = value.trim();
      if (!cleaned) {
        errorMsg = "VIN is required";
      } else if (cleaned.length !== 17) {
        errorMsg = `VIN must be exactly 17 characters (currently ${cleaned.length})`;
      }
    }
    if (name === "registrationNumber") {
      if (!value.trim()) {
        errorMsg = "Registration number is required";
      }
    }
    setFormErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return errorMsg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicle({ ...vehicle, [name]: value });
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setError("");
    try {
      // Find API base url or fall back
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
      const res = await fetch(`${apiBase}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setImageUrl(data.url);
      } else {
        setError(data.message || "Failed to upload image");
      }
    } catch (err) {
      setError("Failed to upload image. Server connection error.");
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    // Touch all step 1 fields
    const step1Touched = { ...touched, make: true, model: true, year: true };
    setTouched(step1Touched);

    const e1 = validateField("make", vehicle.make);
    const e2 = validateField("model", vehicle.model);
    const e3 = validateField("year", vehicle.year);

    if (!e1 && !e2 && !e3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Touch all step 2 fields
    const step2Touched = { ...touched, vin: true, registrationNumber: true };
    setTouched(step2Touched);

    const e4 = validateField("vin", vehicle.vin);
    const e5 = validateField("registrationNumber", vehicle.registrationNumber);

    if (e4 || e5) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await api.post("/vehicles", {
        make: vehicle.make,
        model: vehicle.model,
        year: Number(vehicle.year),
        vin: vehicle.vin,
        registration: vehicle.registrationNumber,
        image: imageUrl
      });
      setCreatedId(res._id);
      setStep(3); // Success step
    } catch (err) {
      setError(err.message || "Failed to add vehicle. Please try again.");
    } finally {
      setLoading(false);
    }
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
                        onBlur={handleBlur}
                        className={`input-field pl-11 ${touched.make && formErrors.make ? "border-rose-500/50 focus:ring-rose-500/20" : ""}`}
                        placeholder="e.g. Tata"
                      />
                    </div>
                    {touched.make && formErrors.make && (
                      <p className="text-xs text-rose-400 font-semibold mt-1 transition-all duration-300">{formErrors.make}</p>
                    )}
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
                        onBlur={handleBlur}
                        className={`input-field pl-11 ${touched.model && formErrors.model ? "border-rose-500/50 focus:ring-rose-500/20" : ""}`}
                        placeholder="e.g. Nexon"
                      />
                    </div>
                    {touched.model && formErrors.model && (
                      <p className="text-xs text-rose-400 font-semibold mt-1 transition-all duration-300">{formErrors.model}</p>
                    )}
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
                      onBlur={handleBlur}
                      className={`input-field pl-11 ${touched.year && formErrors.year ? "border-rose-500/50 focus:ring-rose-500/20" : ""}`}
                      placeholder="2023"
                    />
                  </div>
                  {touched.year && formErrors.year && (
                    <p className="text-xs text-rose-400 font-semibold mt-1 transition-all duration-300">{formErrors.year}</p>
                  )}
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
                      onBlur={handleBlur}
                      className={`input-field pl-11 uppercase font-mono ${touched.vin && formErrors.vin ? "border-rose-500/50 focus:ring-rose-500/20" : ""}`}
                      placeholder="MAT543210NJ123456"
                    />
                  </div>
                  {touched.vin && formErrors.vin && (
                    <p className="text-xs text-rose-400 font-semibold mt-1 transition-all duration-300">{formErrors.vin}</p>
                  )}
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
                      onBlur={handleBlur}
                      className={`input-field pl-11 uppercase font-mono ${touched.registrationNumber && formErrors.registrationNumber ? "border-rose-500/50 focus:ring-rose-500/20" : ""}`}
                      placeholder="MH-12-AB-1234"
                    />
                  </div>
                  {touched.registrationNumber && formErrors.registrationNumber && (
                    <p className="text-xs text-rose-400 font-semibold mt-1 transition-all duration-300">{formErrors.registrationNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle Photo (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="input-field py-2 bg-white/5"
                  />
                  {uploading && <p className="text-xs text-indigo-400 font-semibold animate-pulse">Uploading photo to Supabase...</p>}
                  {imageUrl && (
                    <div className="mt-2 w-32 h-20 rounded-lg overflow-hidden border border-white/10 relative">
                      <img src={imageUrl} alt="Uploaded Vehicle" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setImageUrl("")}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] hover:bg-rose-500 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-bold text-rose-400 text-center">
                    {error}
                  </div>
                )}

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
                <Link to={`/vehicle/${createdId}`}>
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
