import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import {
  IndianRupee,
  Package,
  Clock,
  Shield,
  CheckCircle2,
  XCircle,
  Truck,
  Users,
} from "lucide-react";
import { Button } from "../../components/ui/button";

function AdminOrders() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  async function getAllOrders() {
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
      if (response.ok && data.orders) {
        setOrders(data.orders);
      } else {
        toast.error(data.message || "Failed to load orders");
      }
    } catch (error) {
      console.error("Error fetching all orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function markAsDelivered(orderId) {
    try {
      const toastId = toast.loading("Marking as delivered...");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/order/${orderId}/deliver`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      toast.dismiss(toastId);
      const data = await response.json();
      if (response.ok) {
        toast.success("Order marked as delivered");
        setOrders(
          orders.map((order) =>
            order._id === orderId
              ? { ...order, status: "delivered" }
              : order
          )
        );
      } else {
        toast.error(data.message || "Failed to update order");
      }
    } catch (error) {
      console.error("Error delivering order:", error);
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "admin") {
      toast.error("Admin access required");
      navigate("/");
      return;
    }
    getAllOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  if (!user || user.role !== "admin") return null;

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => o.status === filter);

  const statusConfig = {
    "order placed": {
      color: "bg-yellow-100 text-yellow-800",
      icon: Package,
    },
    delivered: {
      color: "bg-green-100 text-green-800",
      icon: CheckCircle2,
    },
    cancelled: {
      color: "bg-red-100 text-red-800",
      icon: XCircle,
    },
  };

  const statusCounts = {
    all: orders.length,
    "order placed": orders.filter((o) => o.status === "order placed").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div className="md:mt-24 mt-36">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <nav className="flex items-center gap-2 text-sm text-indigo-300 mb-6">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-indigo-200">Admin</span>
            <span>/</span>
            <span className="text-yellow-400">Manage Orders</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Shield className="h-7 w-7 text-indigo-300" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Manage Orders
              </h1>
              <p className="text-indigo-300 mt-1">
                {loading
                  ? "Loading..."
                  : `${orders.length} total order${orders.length !== 1 ? "s" : ""} across all users`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="border rounded-xl p-4 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Total</span>
              </div>
              <p className="text-2xl font-bold">{statusCounts.all}</p>
            </div>
            <div className="border rounded-xl p-4 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-gray-500">Active</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                {statusCounts["order placed"]}
              </p>
            </div>
            <div className="border rounded-xl p-4 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-500">Delivered</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {statusCounts.delivered}
              </p>
            </div>
            <div className="border rounded-xl p-4 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-500">Cancelled</span>
              </div>
              <p className="text-2xl font-bold text-red-500">
                {statusCounts.cancelled}
              </p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        {!loading && orders.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
            {[
              { key: "all", label: "All Orders" },
              { key: "order placed", label: "Active" },
              { key: "delivered", label: "Delivered" },
              { key: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === tab.key
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs opacity-80">
                  ({statusCounts[tab.key]})
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Package className="h-20 w-20 text-gray-200 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              {filter === "all" ? "No orders yet" : `No ${filter} orders`}
            </h2>
            <p className="text-gray-400">
              {filter === "all"
                ? "Orders will appear here when customers place them."
                : "Try a different filter."}
            </p>
          </div>
        )}

        {/* Orders List */}
        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-5">
            {filteredOrders.map((order) => {
              const config =
                statusConfig[order.status] || statusConfig["order placed"];
              const StatusIcon = config.icon;
              return (
                <div
                  key={order._id}
                  className={`border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow ${order.status === "cancelled" ? "opacity-60" : ""
                    }`}
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-indigo-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-mono">
                          #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium capitalize ${config.color}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {order.status}
                      </span>
                      {order.status === "order placed" && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-500 text-white gap-1.5"
                          onClick={() => markAsDelivered(order._id)}
                        >
                          <Truck className="h-3.5 w-3.5" />
                          Mark Delivered
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y">
                    {order.products?.map((item, index) => (
                      <div key={index} className="flex gap-4 py-3">
                        {item?.productId?.image ? (
                          <img
                            className="h-14 w-14 object-cover rounded-lg border"
                            src={item.productId.image}
                            alt={item.productId.name || "Product"}
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium capitalize text-sm">
                            {item.productId?.name || "Product"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center text-sm">
                          <IndianRupee className="h-3.5 w-3.5" />
                          <span className="font-medium">
                            {item.price?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="flex justify-between items-center pt-3 border-t mt-3">
                    <span className="text-sm text-gray-500">
                      {order.totalItems}{" "}
                      {order.totalItems === 1 ? "item" : "items"}
                      <span className="mx-2">·</span>
                      <span className="text-xs font-mono text-gray-400">
                        User: {order.userId?.toString().slice(-6).toUpperCase() || "N/A"}
                      </span>
                    </span>
                    <div className="flex items-center gap-1 font-semibold">
                      <span className="text-gray-500 text-sm mr-2">
                        Total:
                      </span>
                      <IndianRupee className="h-4 w-4" />
                      <span className="text-lg">
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
    </div>
  );
}

export default AdminOrders;
