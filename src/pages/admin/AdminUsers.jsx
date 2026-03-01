import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Users, Search, Shield, ShieldOff } from "lucide-react";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/users`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        toast.error(data.message || "Failed to load users");
      }
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function toggleRole(userId, currentRole) {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (
      !window.confirm(
        `Change this user's role to "${newRole}"?`
      )
    )
      return;

    try {
      const toastId = toast.loading("Updating role...");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/users/${userId}/role`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ role: newRole }),
        }
      );
      toast.dismiss(toastId);
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Role updated");
        setUsers(
          users.map((u) =>
            u._id === userId ? { ...u, role: newRole } : u
          )
        );
      } else {
        toast.error(data.message || "Failed to update role");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  const filtered = users.filter(
    (u) =>
      u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
          <Users className="h-[18px] w-[18px] text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Users</h2>
          <p className="text-[11px] text-gray-400">{users.length} registered users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users className="h-10 w-10 mx-auto mb-3 text-gray-200" />
          <p className="text-sm font-medium">No users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider bg-gray-50/50">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.image}
                          alt={u.firstName}
                          className="w-8 h-8 rounded-full object-cover bg-gray-100"
                        />
                        <span className="text-xs font-bold text-gray-900">
                          {u.firstName} {u.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {u.email}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${u.role === "admin"
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {u.role === "admin" ? (
                          <Shield className="h-3 w-3" />
                        ) : (
                          <ShieldOff className="h-3 w-3" />
                        )}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[11px] text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => toggleRole(u._id, u.role)}
                        className={`text-[11px] font-semibold px-3 py-1 rounded-lg transition-colors ${u.role === "admin"
                            ? "text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100"
                            : "text-indigo-600 hover:text-indigo-500 bg-indigo-50 hover:bg-indigo-100"
                          }`}
                      >
                        {u.role === "admin" ? "Make User" : "Make Admin"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
