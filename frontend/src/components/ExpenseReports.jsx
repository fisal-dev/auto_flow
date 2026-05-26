import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ReceiptText, Filter, Search, IndianRupee, CalendarClock, Car, ArrowDownToLine } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import { api } from "../utils/api";

const ExpenseReports = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ vehicle: "", category: "", startDate: "", endDate: "" });

  const loadData = async () => {
    try {
      setLoading(true);
      const [maintenance, fuel] = await Promise.all([
        api.get("/maintenance"),
        api.get("/fuel")
      ]);

      const maintExpenses = maintenance.map(m => ({
        id: m._id,
        vehicleId: m.vehicleId?._id || "",
        vehicle: m.vehicleId ? `${m.vehicleId.make} ${m.vehicleId.model}` : "Unknown Vehicle",
        date: m.date,
        category: m.service,
        cost: m.cost,
        type: "Maintenance"
      }));

      const fuelExpenses = fuel.map(f => ({
        id: f._id,
        vehicleId: f.vehicleId?._id || "",
        vehicle: f.vehicleId ? `${f.vehicleId.make} ${f.vehicleId.model}` : "Unknown Vehicle",
        date: f.date,
        category: `Fuel Refuel (${f.liters} L)`,
        cost: f.cost,
        type: "Fuel"
      }));

      // Combine and sort by date descending
      const combined = [...maintExpenses, ...fuelExpenses].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setExpenses(combined);
    } catch (err) {
      console.error("Error loading expense reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const filteredExpenses = expenses.filter((expense) => {
    return (
      (filters.vehicle ? expense.vehicle.toLowerCase().includes(filters.vehicle.toLowerCase()) : true) &&
      (filters.category ? expense.category.toLowerCase().includes(filters.category.toLowerCase()) : true) &&
      (filters.startDate ? new Date(expense.date) >= new Date(filters.startDate) : true) &&
      (filters.endDate ? new Date(expense.date) <= new Date(filters.endDate) : true)
    );
  });

  const totalCost = filteredExpenses.reduce((sum, item) => sum + item.cost, 0);

  const exportCSV = () => {
    const headers = "Vehicle,Category,Date,Cost (INR),Type\n";
    const rows = filteredExpenses.map(e => 
      `"${e.vehicle}","${e.category.replace(/"/g, '""')}","${new Date(e.date).toLocaleDateString()}",${e.cost},"${e.type}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `fleet_expense_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="page-wrapper">
        
        {/* Header Block */}
        <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="section-header">Expense Reports</h1>
            <p className="section-subheader">Track, audit, and analyze vehicle expenditures</p>
          </div>

          <div className="flex gap-4 items-center self-stretch md:self-auto justify-between md:justify-end">
            <div className="px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-3 shadow-[0_0_20px_rgba(99,102,241,0.05)]">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Filtered:</span>
              <span className="text-xl font-extrabold text-foreground flex items-center">
                <span className="text-indigo-400 mr-0.5">₹</span>{totalCost.toLocaleString()}
              </span>
            </div>
            <Button variant="secondary" icon={ArrowDownToLine} onClick={exportCSV} disabled={filteredExpenses.length === 0}>
               Export CSV
            </Button>
          </div>
        </div>

        {/* Filters Form Card */}
        <Card variant="bordered" className="p-6 bg-surface/80">
          <div className="flex items-center gap-2 text-indigo-400 font-bold mb-4 uppercase tracking-widest text-xs">
            <Filter className="w-4 h-4" /> Filter Parameters
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                name="vehicle"
                placeholder="Search Vehicle Name..."
                value={filters.vehicle}
                onChange={handleFilterChange}
                className="input-field pl-10"
              />
            </div>

            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                name="category"
                placeholder="Search Category..."
                value={filters.category}
                onChange={handleFilterChange}
                className="input-field pl-10"
              />
            </div>

            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="input-field"
            />

            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>
        </Card>

        {/* Expenses List Card */}
        <Card variant="bordered" className="p-0 overflow-hidden bg-surface/80">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-extrabold text-foreground">Expenditure Log</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-20">
               <ReceiptText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
               <p className="text-slate-400 text-sm">No expenditures matching criteria found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="premium-table min-w-[650px]">
                <thead>
                  <tr>
                    <th className="pl-6">Vehicle</th>
                    <th>Category / Description</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th className="pr-6 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="pl-6">
                        <div className="font-bold text-foreground flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                            <Car className="w-3 h-3 text-slate-400" />
                          </div>
                          {expense.vehicleId ? (
                            <Link to={`/vehicle/${expense.vehicleId}`} className="hover:text-indigo-400 transition-colors">
                              {expense.vehicle}
                            </Link>
                          ) : (
                            <span>{expense.vehicle}</span>
                          )}
                        </div>
                      </td>
                      <td className="font-semibold text-slate-300">{expense.category}</td>
                      <td className="text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <CalendarClock className="w-3.5 h-3.5 text-indigo-400" />
                          {new Date(expense.date).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <Badge variant={expense.type === "Fuel" ? "info" : "success"} size="sm">
                          {expense.type}
                        </Badge>
                      </td>
                      <td className="pr-6 font-extrabold text-emerald-400 text-right">
                        ₹{expense.cost.toLocaleString()}
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

export default ExpenseReports;
