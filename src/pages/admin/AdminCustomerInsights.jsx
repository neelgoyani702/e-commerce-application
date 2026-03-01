import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  User,
  Package,
  IndianRupee,
  ShoppingCart,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Search,
  ArrowLeft,
} from "lucide-react";

function AdminCustomerInsights() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

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
      if (response.ok) setUsers(data.users || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  const fetchInsights = useCallback(async (userId) => {
    setInsightsLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/users/${userId}/insights`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        setInsights(data);
      } else {
        toast.error(data.message || "Failed to load insights");
      }
    } catch {
      toast.error("Failed to load insights");
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  function selectUser(user) {
    setSelectedUser(user);
    fetchInsights(user._id);
  }

  const filtered = users.filter(
    (u) =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Insights Detail View
  if (selectedUser && insights) {
    const { customer, stats, topProducts, recentOrders } = insights;
    return (
      <div className="max-w-5xl">
        {/* Back button */}
        <button
          onClick={() => {
            setSelectedUser(null);
            setInsights(null);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 mb-5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to customers
        </button>

        {/* Customer Header */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            {customer?.image ? (
              <img
                src={customer.image}
                alt=""
                className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="h-7 w-7 text-indigo-500" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {customer?.firstName} {customer?.lastName}
              </h2>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {customer?.email}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined{" "}
                  {new Date(customer?.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            {
              label: "Lifetime Spend",
              value: `₹${stats?.totalSpent?.toLocaleString() || 0}`,
              color: "text-emerald-600",
              icon: IndianRupee,
            },
            {
              label: "Total Orders",
              value: stats?.totalOrders || 0,
              color: "text-indigo-600",
              icon: ShoppingCart,
            },
            {
              label: "Avg. Order",
              value: `₹${stats?.avgOrderValue?.toLocaleString() || 0}`,
              color: "text-amber-600",
              icon: TrendingUp,
            },
            {
              label: "Delivered",
              value: stats?.deliveredOrders || 0,
              color: "text-emerald-600",
              icon: CheckCircle2,
            },
            {
              label: "Cancelled",
              value: stats?.cancelledOrders || 0,
              color: "text-red-500",
              icon: XCircle,
            },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-3.5 w-3.5 ${s.color}`} />
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">
                    {s.label}
                  </span>
                </div>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">
              Most Ordered Products
            </h3>
            {topProducts?.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt=""
                        className="w-9 h-9 rounded-lg object-cover bg-gray-50"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                        <Package className="h-4 w-4 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 capitalize truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {p.count} orders · ₹{p.totalSpent?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No orders yet</p>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">
              Recent Orders
            </h3>
            {recentOrders?.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.slice(0, 6).map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-medium text-gray-700 font-mono">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-900">
                        ₹{order.totalAmount?.toLocaleString()}
                      </p>
                      <span
                        className={`text-[10px] font-semibold capitalize ${order.status === "delivered"
                          ? "text-emerald-600"
                          : order.status === "cancelled"
                            ? "text-red-500"
                            : "text-amber-600"
                          }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No orders yet</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Loading insights
  if (selectedUser && insightsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Customers List View
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center">
          <TrendingUp className="h-[18px] w-[18px] text-sky-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Customer Insights
          </h2>
          <p className="text-[11px] text-gray-400">
            Click any customer to view detailed analytics
          </p>
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
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
        />
      </div>

      {/* Customer Cards */}
      <div className="space-y-2">
        {filtered.map((user) => (
          <div
            key={user._id}
            onClick={() => selectUser(user)}
            className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4 hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer"
          >
            {user.image ? (
              <img
                src={user.image}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="h-5 w-5 text-indigo-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[11px] text-gray-400 truncate">
                {user.email}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.role === "admin"
                  ? "bg-violet-50 text-violet-600"
                  : "bg-gray-50 text-gray-500"
                  }`}
              >
                {user.role}
              </span>
              <p className="text-[10px] text-gray-300 mt-1">
                Joined{" "}
                {new Date(user.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminCustomerInsights;
