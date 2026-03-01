import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ShoppingCart,
  Package,
  FolderOpen,
  Users,
  IndianRupee,
  TrendingUp,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#eab308", "#22c55e", "#ef4444"];

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/stats`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
      } else {
        toast.error(data.message || "Failed to load stats");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <Package className="h-12 w-12 mb-3" />
        <p className="text-lg font-medium">Failed to load dashboard</p>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      link: "/admin/orders",
    },
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-violet-600",
      bg: "bg-violet-50",
      link: "/admin/products",
    },
    {
      label: "Total Categories",
      value: stats.totalCategories,
      icon: FolderOpen,
      color: "text-amber-600",
      bg: "bg-amber-50",
      link: "/admin/categories",
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      link: "/admin/users",
    },
    {
      label: "Total Revenue",
      value: `₹${stats.totalRevenue?.toLocaleString() || 0}`,
      icon: IndianRupee,
      color: "text-rose-600",
      bg: "bg-rose-50",
      link: null,
    },
  ];

  const orderDistData = [
    { name: "Active", value: stats.orderDistribution?.orderPlaced || 0 },
    { name: "Delivered", value: stats.orderDistribution?.delivered || 0 },
    { name: "Cancelled", value: stats.orderDistribution?.cancelled || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              onClick={() => card.link && navigate(card.link)}
              className={`bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all duration-200 ${card.link ? "cursor-pointer" : ""
                }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}
                >
                  <Icon className={`h-[18px] w-[18px] ${card.color}`} />
                </div>
                {card.link && (
                  <ArrowUpRight className="h-3.5 w-3.5 text-gray-300" />
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                {card.value}
              </p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                {card.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-gray-900">
                Monthly Revenue
              </h2>
            </div>
            <span className="text-[11px] text-gray-400 font-medium">
              Last 12 months
            </span>
          </div>
          {stats.monthlyRevenue?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={stats.monthlyRevenue}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                  }
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [
                    `₹${value.toLocaleString()}`,
                    "Revenue",
                  ]}
                />
                <Bar
                  dataKey="revenue"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-gray-300">
              <p className="text-sm">No revenue data yet</p>
            </div>
          )}
        </div>

        {/* Order Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-5">
            <ShoppingCart className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-gray-900">
              Order Status
            </h2>
          </div>
          {orderDistData.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={orderDistData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {orderDistData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {orderDistData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[i] }}
                    />
                    <span className="text-[11px] text-gray-500 font-medium">
                      {d.name} ({d.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-gray-300">
              <p className="text-sm">No order data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-gray-900">Recent Orders</h2>
          </div>
          <button
            onClick={() => navigate("/admin/orders")}
            className="text-[11px] text-indigo-600 font-semibold hover:text-indigo-500 transition-colors"
          >
            View All →
          </button>
        </div>

        {stats.recentOrders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pr-4">Order ID</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Items</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs text-gray-400">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={order.userId?.image}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]">
                          {order.userId?.firstName} {order.userId?.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-500">
                      {order.totalItems}
                    </td>
                    <td className="py-3 pr-4 text-xs font-bold text-gray-900">
                      ₹{order.totalAmount?.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${order.status === "delivered"
                            ? "bg-emerald-50 text-emerald-700"
                            : order.status === "cancelled"
                              ? "bg-red-50 text-red-600"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-[11px] text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-10 text-gray-300">
            <p className="text-sm">No orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
