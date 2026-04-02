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
  Truck,
  CheckCircle2,
  Clipboard,
  PackageCheck,
  CircleDot,
  Download,
} from "lucide-react";
import { SkeletonOrderCard } from "../../components/SkeletonCard";

function MyOrders() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const ORDER_STEPS = [
    { key: "order placed", label: "Placed", icon: Package },
    { key: "confirmed", label: "Confirmed", icon: Clipboard },
    { key: "packed", label: "Packed", icon: PackageCheck },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "out for delivery", label: "Out for Delivery", icon: CircleDot },
    { key: "delivered", label: "Delivered", icon: CheckCircle2 },
  ];

  const statusColors = {
    "order placed": "bg-yellow-50 text-yellow-700",
    confirmed: "bg-blue-50 text-blue-700",
    packed: "bg-violet-50 text-violet-700",
    shipped: "bg-indigo-50 text-indigo-700",
    "out for delivery": "bg-orange-50 text-orange-700",
    delivered: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-600",
  };

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
          <div className="h-11 w-11 rounded-xl bg-store-primary-light flex items-center justify-center">
            <ShoppingBag size={20} className="text-store-primary" />
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
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <SkeletonOrderCard key={i} />
          ))}
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
            className="inline-flex items-center gap-2 bg-store-gradient hover:bg-store-gradient-light text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-store-primary hover:shadow-store-primary-lg text-sm"
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
                  <div className="w-9 h-9 rounded-xl bg-store-primary-light flex items-center justify-center">
                    <Package className="h-4 w-4 text-store-primary" />
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
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold capitalize ${statusColors[order.status] || statusColors["order placed"]}`}>
                    {order.status}
                  </span>
                  {!["shipped", "out for delivery", "delivered", "cancelled"].includes(order.status) && (
                    <button
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all"
                      onClick={() => cancelOrder(order._id)}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Step Tracker */}
              {order.status !== "cancelled" && (
                <div className="mb-4 px-1">
                  <div className="flex items-center justify-between">
                    {ORDER_STEPS.map((step, idx) => {
                      const stepIdx = ORDER_STEPS.findIndex(s => s.key === order.status);
                      const isCompleted = idx <= stepIdx;
                      const isCurrent = idx === stepIdx;
                      const Icon = step.icon;
                      return (
                        <React.Fragment key={step.key}>
                          <div className="flex flex-col items-center gap-1" title={step.label}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                              isCompleted
                                ? isCurrent ? "bg-store-primary text-white shadow-md" : "bg-store-primary text-white opacity-80"
                                : "bg-gray-100 text-gray-300"
                            }`}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <span className={`text-[9px] font-medium hidden sm:block ${
                              isCompleted ? "text-gray-700" : "text-gray-300"
                            }`}>{step.label}</span>
                          </div>
                          {idx < ORDER_STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${
                              idx < stepIdx ? "bg-store-primary/50" : "bg-gray-100"
                            }`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                  {order.estimatedDelivery && order.status !== "delivered" && (
                    <p className="text-[10px] text-gray-400 text-center mt-2">
                      Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
              )}

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
                        className="text-sm font-semibold capitalize cursor-pointer hover:text-store-primary-dark transition-colors truncate"
                        onClick={() =>
                          navigate(`/product/${item?.productId?._id}`)
                        }
                      >
                        {item.productId?.name || "Product"}
                      </h3>
                      {item.variantLabel && (
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">{item.variantLabel}</p>
                      )}
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

              {/* Order Footer - Detailed Price Breakdown */}
              <div className="flex flex-col gap-1.5 pt-4 border-t border-dashed border-gray-100 mt-3 text-xs text-gray-500">
                <div className="flex justify-between items-center">
                  <span>Subtotal ({order.totalItems} {order.totalItems === 1 ? "item" : "items"})</span>
                  <span className="font-semibold text-gray-700">
                    <IndianRupee className="h-3 w-3 inline -mt-0.5" />
                    {(order.subTotal || (order.totalAmount + (order.couponDiscount || 0) + (order.regularDiscount || 0) + (order.flashSaleDiscount || 0) + (order.bundleDiscount || 0))).toLocaleString()}
                  </span>
                </div>
                {order.regularDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Product Discount</span>
                    <span className="font-semibold">− <IndianRupee className="h-3 w-3 inline -mt-0.5" />{order.regularDiscount.toLocaleString()}</span>
                  </div>
                )}
                {order.flashSaleDiscount > 0 && (
                  <div className="flex justify-between items-center text-red-600 font-medium">
                    <span>Flash Sale Savings</span>
                    <span className="font-semibold">− <IndianRupee className="h-3 w-3 inline -mt-0.5" />{order.flashSaleDiscount.toLocaleString()}</span>
                  </div>
                )}
                {order.bundleDiscount > 0 && (
                  <div className="flex justify-between items-center text-indigo-600 font-medium">
                    <span>Bundle Offer Savings</span>
                    <span className="font-semibold">− <IndianRupee className="h-3 w-3 inline -mt-0.5" />{order.bundleDiscount.toLocaleString()}</span>
                  </div>
                )}
                {order.couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Coupon Applied {order.couponCode && `(${order.couponCode})`}</span>
                    <span className="font-semibold">− <IndianRupee className="h-3 w-3 inline -mt-0.5" />{order.couponDiscount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Final Actions & Total */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-3">
                <div className="flex items-center gap-2">
                  {/* Left placeholder if needed */}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(
                          `${process.env.REACT_APP_API_URL}/order/${order._id}/invoice`,
                          { credentials: "include" }
                        );
                        if (!res.ok) throw new Error();
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `INV-${order._id.slice(-8).toUpperCase()}.pdf`;
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch {
                        toast.error("Failed to download invoice");
                      }
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-all"
                    title="Download Invoice"
                  >
                    <Download className="h-3 w-3" />
                    Invoice
                  </button>
                  <div className="flex items-center gap-1 font-bold">
                    <span className="text-gray-400 text-xs mr-1">Total:</span>
                    <IndianRupee className="h-3.5 w-3.5" />
                    <span className="text-base">{order.totalAmount?.toLocaleString()}</span>
                  </div>
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
