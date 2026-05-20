import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Plus, CalendarClock, Car, MessageSquareWarning } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

const ComplaintHistory = () => {
  const [complaints] = useState([
    { id: 1, vehicle: "Tata Nexon", complaint: "Engine overheating after 50 km", date: "Feb 10, 2025", status: "danger", label: "Open" },
    { id: 2, vehicle: "Maruti Suzuki Swift", complaint: "Brake squealing at low speeds", date: "Jan 25, 2025", status: "success", label: "Resolved" },
    { id: 3, vehicle: "Mahindra Thar", complaint: "Transmission slipping in 3rd gear", date: "Jan 12, 2025", status: "warning", label: "Investigating" },
  ]);

  return (
    <DashboardLayout>
      <div className="page-wrapper">
        
        {/* Header Block */}
        <div className="page-header">
          <div>
            <h1 className="section-header">Complaint Logs</h1>
            <p className="section-subheader">Review active reports and resolved fleet issue tickets</p>
          </div>
          <Link to="/report-complaint">
            <Button variant="danger" icon={Plus}>
              Report Issue
            </Button>
          </Link>
        </div>

        {/* Complaints history list card */}
        <Card variant="bordered" className="p-0 overflow-hidden bg-surface/80">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
              <MessageSquareWarning className="w-5 h-5 text-indigo-400" /> Ticket History
            </h2>
          </div>

          {complaints.length === 0 ? (
            <div className="text-center py-20">
              <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">Your fleet is running perfectly without logged exceptions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th className="pl-6">Vehicle</th>
                    <th>Complaint Detail</th>
                    <th>Discovery Date</th>
                    <th className="pr-6">Ticket Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((item) => (
                    <tr key={item.id}>
                      <td className="pl-6">
                        <div className="font-bold text-foreground flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                            <Car className="w-3 h-3 text-slate-400" />
                          </div>
                          {item.vehicle}
                        </div>
                      </td>
                      <td className="font-semibold text-slate-300 max-w-md truncate" title={item.complaint}>
                        {item.complaint}
                      </td>
                      <td className="text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <CalendarClock className="w-3.5 h-3.5 text-indigo-400" />
                          {item.date}
                        </span>
                      </td>
                      <td className="pr-6">
                        <Badge variant={item.status} dot size="sm">{item.label}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ComplaintHistory;
