import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ShoppingCart,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Search,
  IndianRupee,
} from "lucide-react";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/order/all`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders || []);
      } else {
        toast.error(data.message || "Failed to load orders");
      }
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId, status) {
    try {
      const toastId = toast.loading(`Updating to ${status}...`);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );
      toast.dismiss(toastId);
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Status updated");
        setOrders(
          orders.map((o) => (o._id === orderId ? { ...o, status } : o))
        );
      } else {
        toast.error(data.message || "Failed to update");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  const statusConfig = {
    "order placed": {
      color: "bg-yellow-50 text-yellow-700",
      icon: Package,
    },
    delivered: {
      color: "bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    },
    cancelled: {
      color: "bg-red-50 text-red-600",
      icon: XCircle,
    },
  };

  const statusCounts = {
    all: orders.length,
    "order placed": orders.filter((o) => o.status === "order placed").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const filtered = orders
    .filter((o) => (filter === "all" ? true : o.status === filter))
    .filter((o) =>
      search
        ? o._id.toLowerCase().includes(search.toLowerCase())
        : true
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
          <ShoppingCart className="h-[18px] w-[18px] text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Orders</h2>
          <p className="text-[11px] text-gray-400">
            {orders.length} total orders
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: statusCounts.all, color: "text-gray-900" },
          {
            label: "Active",
            value: statusCounts["order placed"],
            color: "text-yellow-600",
          },
          {
            label: "Delivered",
            value: statusCounts.delivered,
            color: "text-emerald-600",
          },
          {
            label: "Cancelled",
            value: statusCounts.cancelled,
            color: "text-red-500",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 p-4"
          >
            <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "All" },
            { key: "order placed", label: "Active" },
            { key: "delivered", label: "Delivered" },
            { key: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === tab.key
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-100 text-gray-500 hover:bg-gray-50"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
          <input
            type="text"
            placeholder="Search by order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
        </div>
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ShoppingCart className="h-10 w-10 mx-auto mb-3 text-gray-200" />
          <p className="text-sm font-medium">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const config =
              statusConfig[order.status] || statusConfig["order placed"];
            const StatusIcon = config.icon;
            return (
              <div
                key={order._id}
                className={`bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-all ${order.status === "cancelled" ? "opacity-60" : ""
                  }`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                      <Package className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-mono">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${config.color}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {order.status}
                    </span>
                    {order.status === "order placed" && (
                      <button
                        onClick={() => updateStatus(order._id, "delivered")}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-500 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Truck className="h-3 w-3" />
                        Deliver
                      </button>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-50">
                  {order.products?.map((item, index) => (
                    <div key={index} className="flex gap-3 py-2">
                      {item?.productId?.image ? (
                        <img
                          className="h-10 w-10 object-cover rounded-lg bg-gray-50"
                          src={item.productId.image}
                          alt={item.productId.name || "Product"}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center">
                          <Package className="h-4 w-4 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 capitalize truncate">
                          {item.productId?.name || "Product"}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-xs font-bold text-gray-900 flex items-center">
                        <IndianRupee className="h-3 w-3" />
                        {item.price?.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-100 mt-2">
                  <span className="text-[10px] text-gray-400">
                    {order.totalItems}{" "}
                    {order.totalItems === 1 ? "item" : "items"}
                    <span className="mx-1.5">·</span>
                    <span className="font-mono">
                      User: {order.userId?.toString().slice(-6).toUpperCase() || "N/A"}
                    </span>
                  </span>
                  <div className="flex items-center gap-0.5 font-bold text-gray-900">
                    <IndianRupee className="h-3.5 w-3.5" />
                    <span className="text-sm">
                      {order.totalAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
