import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  IndianRupee,
  Package,
  Clock,
  History,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";

function OrderHistory() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  async function getOrderHistory() {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/order/history`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok && data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching order history:", error);
      toast.error("Failed to load order history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    getOrderHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  if (!user) return null;

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => o.status === filter);

  const statusConfig = {
    "order placed": {
      color: "bg-store-primary-light text-store-primary-dark",
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

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-store-primary-light flex items-center justify-center">
            <History size={20} className="text-store-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Order History</h1>
            <p className="text-xs text-gray-400">
              {loading ? "Loading..." : `${orders.length} total order${orders.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      {!loading && orders.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "all", label: "All" },
            { key: "order placed", label: "Active" },
            { key: "delivered", label: "Delivered" },
            { key: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${filter === tab.key
                  ? "bg-store-gradient text-white shadow-sm shadow-store-primary"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100"
                }`}
            >
              {tab.label}
              <span className="ml-1 opacity-80">
                ({statusCounts[tab.key]})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 border-4 border-store-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gray-50 flex items-center justify-center">
            <Package className="h-8 w-8 text-gray-300" />
          </div>
          <h2 className="text-lg font-bold text-gray-700 mb-1">
            {filter === "all" ? "No orders yet" : `No ${filter} orders`}
          </h2>
          <p className="text-sm text-gray-400 mb-6 text-center max-w-xs">
            {filter === "all"
              ? "Start shopping to see your orders here."
              : "Try a different filter."}
          </p>
          {filter === "all" ? (
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 bg-store-gradient hover:bg-store-gradient-light text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-store-primary text-sm"
            >
              Browse Products
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => setFilter("all")}
              className="text-sm font-semibold text-store-primary-dark hover:text-store-primary transition-colors"
            >
              Show All Orders →
            </button>
          )}
        </div>
      )}

      {/* Orders List */}
      {!loading && filteredOrders.length > 0 && (
        <div className="space-y-4">
          {filteredOrders.map((order, i) => {
            const config = statusConfig[order.status] || statusConfig["order placed"];
            const StatusIcon = config.icon;
            return (
              <div
                key={order._id}
                className={`rounded-2xl border border-gray-100 p-5 bg-white hover:shadow-md transition-all duration-300 animate-fade-in-up animation-delay-${(i % 4) * 100} ${order.status === "cancelled" ? "opacity-60" : ""
                  }`}
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-store-primary-light flex items-center justify-center">
                      <Package className="h-4 w-4 text-store-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-mono">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold capitalize ${config.color}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {order.status}
                  </span>
                </div>

                {/* Order Items */}
                <div className="divide-y divide-gray-50">
                  {order.products?.map((item, index) => (
                    <div key={index} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                      {item?.productId?.image ? (
                        <img
                          className="h-14 w-14 object-cover rounded-xl bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity"
                          src={item.productId.image}
                          alt={item.productId.name || "Product"}
                          onClick={() =>
                            navigate(`/product/${item.productId._id}`)
                          }
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-xl bg-gray-50 flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-sm font-semibold capitalize cursor-pointer hover:text-store-primary-dark transition-colors truncate"
                          onClick={() =>
                            item.productId?._id &&
                            navigate(`/product/${item.productId._id}`)
                          }
                        >
                          {item.productId?.name || "Product"}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center text-sm font-bold">
                        <IndianRupee className="h-3 w-3" />
                        <span>
                          {item.price?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-100 mt-3">
                  <span className="text-xs text-gray-400">
                    {order.totalItems}{" "}
                    {order.totalItems === 1 ? "item" : "items"}
                  </span>
                  <div className="flex items-center gap-1 font-bold">
                    <span className="text-gray-400 text-xs mr-1">
                      Total:
                    </span>
                    <IndianRupee className="h-3.5 w-3.5" />
                    <span className="text-base">
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

export default OrderHistory;
