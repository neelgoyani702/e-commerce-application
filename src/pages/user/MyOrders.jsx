import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  IndianRupee,
  Package,
  XCircle,
  ShoppingBag,
  ArrowRight,
  Clock,
} from "lucide-react";

function MyOrders() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function getOrders() {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/order`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok && data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function cancelOrder(orderId) {
    try {
      const toastId = toast.loading("Cancelling order...");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/order/${orderId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      toast.dismiss(toastId);
      const data = await response.json();
      if (response.ok) {
        toast.success("Order cancelled successfully");
        setOrders(orders.filter((order) => order._id !== orderId));
      } else {
        toast.error(data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    getOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-yellow-50 flex items-center justify-center">
            <ShoppingBag size={20} className="text-yellow-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Active Orders</h1>
            <p className="text-xs text-gray-400">
              {loading ? "Loading..." : `${orders.length} active order${orders.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gray-50 flex items-center justify-center">
            <Package className="h-8 w-8 text-gray-300" />
          </div>
          <h2 className="text-lg font-bold text-gray-700 mb-1">
            No active orders
          </h2>
          <p className="text-sm text-gray-400 mb-6 text-center max-w-xs">
            Looks like you haven't placed any orders yet.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 text-sm"
          >
            Browse Products
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Orders List */}
      {!loading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <div
              key={order._id}
              className={`rounded-2xl border border-gray-100 p-5 bg-white hover:shadow-md transition-all duration-300 animate-fade-in-up animation-delay-${(i % 4) * 100}`}
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center">
                    <Package className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-mono">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-semibold capitalize">
                    {order.status}
                  </span>
                  <button
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all"
                    onClick={() => cancelOrder(order._id)}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                </div>
              </div>

              {/* Order Items */}
              <div className="divide-y divide-gray-50">
                {order.products?.map((item, index) => (
                  <div key={index} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <img
                      className="h-14 w-14 object-cover rounded-xl bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity"
                      src={item?.productId?.image}
                      alt={item?.productId?.name || "Product"}
                      onClick={() =>
                        navigate(`/product/${item?.productId?._id}`)
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-sm font-semibold capitalize cursor-pointer hover:text-yellow-700 transition-colors truncate"
                        onClick={() =>
                          navigate(`/product/${item?.productId?._id}`)
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
                      <span>{item.price?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-100 mt-3">
                <span className="text-xs text-gray-400">
                  {order.totalItems} {order.totalItems === 1 ? "item" : "items"}
                </span>
                <div className="flex items-center gap-1 font-bold">
                  <span className="text-gray-400 text-xs mr-1">Total:</span>
                  <IndianRupee className="h-3.5 w-3.5" />
                  <span className="text-base">{order.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders;
