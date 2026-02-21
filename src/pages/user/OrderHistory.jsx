import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import {
  IndianRupee,
  Package,
  Clock,
  History,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "../../components/ui/button";

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
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-yellow-400">Order History</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <History className="h-7 w-7 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Order History</h1>
              <p className="text-gray-400 mt-1">
                {loading
                  ? "Loading..."
                  : `${orders.length} total order${orders.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
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
                    ? "bg-yellow-500 text-white"
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
            <div className="h-10 w-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Package className="h-20 w-20 text-gray-200 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              {filter === "all"
                ? "No orders yet"
                : `No ${filter} orders`}
            </h2>
            <p className="text-gray-400 mb-8">
              {filter === "all"
                ? "Start shopping to see your orders here."
                : "Try a different filter."}
            </p>
            {filter === "all" ? (
              <Button
                onClick={() => navigate("/products")}
                className="bg-yellow-600 hover:bg-yellow-500 py-6 px-8 text-base gap-2"
              >
                Browse Products
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setFilter("all")}
              >
                Show All Orders
              </Button>
            )}
          </div>
        )}

        {/* Orders List */}
        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-5">
            {filteredOrders.map((order) => {
              const config = statusConfig[order.status] || statusConfig["order placed"];
              const StatusIcon = config.icon;
              return (
                <div
                  key={order._id}
                  className={`border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow ${order.status === "cancelled" ? "opacity-70" : ""
                    }`}
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-yellow-700" />
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
                            }
                          )}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium capitalize ${config.color}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {order.status}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y">
                    {order.products?.map((item, index) => (
                      <div key={index} className="flex gap-4 py-3">
                        {item?.productId?.image ? (
                          <img
                            className="h-16 w-16 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                            src={item.productId.image}
                            alt={item.productId.name || "Product"}
                            onClick={() =>
                              navigate(`/product/${item.productId._id}`)
                            }
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3
                            className="font-medium capitalize cursor-pointer hover:text-yellow-700 transition-colors"
                            onClick={() =>
                              item.productId?._id &&
                              navigate(`/product/${item.productId._id}`)
                            }
                          >
                            {item.productId?.name || "Product"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center">
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

export default OrderHistory;
