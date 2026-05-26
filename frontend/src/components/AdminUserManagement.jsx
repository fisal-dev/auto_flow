import React, { useState, useEffect } from "react";
import { Users, Mail, Plus, ShieldCheck, Trash2, Key, Search, UserCheck, X } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import { api } from "../utils/api";
import { useToast } from "./ui/Toast";

const AdminUserManagement = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Registration Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await api.get("/admin/users");
      setUsers(data);
    } catch (err) {
      toast.error("Failed to load user directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRegisterAdmin = async (e) => {
    e.preventDefault();
    if (!adminForm.email || !adminForm.password) {
      toast.warning("Email and Password are required");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/admin/users/register-admin", adminForm);
      toast.success("Admin registered successfully!");
      setShowAddForm(false);
      setAdminForm({ name: "", email: "", password: "" });
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Failed to register admin user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success("User role updated successfully!");
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Failed to update user role");
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">System User Directory</h1>
            <p className="text-sm text-slate-400">View registered accounts and configure administrative credentials</p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setShowAddForm(!showAddForm)}>
            Register Admin
          </Button>
        </div>

        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <Card variant="bordered" className="w-full max-w-lg bg-surface/95 border-white/10 p-6 shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button
                onClick={() => setShowAddForm(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-extrabold text-foreground mb-6 flex items-center gap-2">
                <ShieldCheck className="text-indigo-400 w-5 h-5" />
                New Admin Account
              </h2>
              <form onSubmit={handleRegisterAdmin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Display Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Operations Head"
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Email Address *</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="admin@autoflow.com"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Secure Password *</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setShowAddForm(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" isLoading={submitting}>Save Admin</Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        <Card variant="bordered" className="p-6 bg-surface/80">
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search directory by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Subscription</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-bold text-slate-200">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={u.role === 'admin' ? 'owner' : u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="bg-surface text-foreground border border-white/10 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer transition-all hover:bg-white/5"
                        >
                          <option value="customer" className="bg-surface text-foreground">customer</option>
                          <option value="manager" className="bg-surface text-foreground">manager</option>
                          <option value="owner" className="bg-surface text-foreground">owner</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-semibold">{u.phone || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={u.subscriptionStatus === 'premium' ? 'success' : 'secondary'}>
                          {u.subscriptionStatus || 'free'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-500 font-bold">No accounts found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminUserManagement;
