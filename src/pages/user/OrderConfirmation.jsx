import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2,
  IndianRupee,
  Package,
  ArrowRight,
  Clock,
  ShoppingBag,
  Check,
  PartyPopper,
} from "lucide-react";

function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="md:mt-16 mt-32 min-h-screen bg-gray-50/50 flex flex-col items-center justify-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
          <Package className="h-8 w-8 text-gray-300" />
        </div>
        <h2 className="text-lg font-semibold text-gray-600 mb-1">
          No order details found
        </h2>
        <p className="text-sm text-gray-400 mb-4">This page may have expired</p>
        <button
          onClick={() => navigate("/")}
          className="text-sm font-semibold text-yellow-700 hover:text-yellow-600 transition-colors"
        >
          Go Home →
        </button>
      </div>
    );
  }

  // Steps
  const steps = [
    { label: "Cart", done: true },
    { label: "Checkout", done: true },
    { label: "Confirmed", done: true },
  ];

  return (
    <div className="md:mt-16 mt-32 min-h-screen bg-gray-50/50">
      {/* Hero Section - Green */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-400/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-20">
          <nav className="flex items-center gap-2 text-sm text-emerald-300 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-emerald-500">/</span>
            <span className="text-emerald-100 font-medium">Order Confirmation</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Order Confirmed! 🎉</h1>
              <p className="text-emerald-300 mt-1">Thank you for your order. We'll send you a confirmation soon.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4">
        <div className="flex items-center justify-center gap-0">
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shadow-md ${i < 2
                    ? "bg-gradient-to-br from-yellow-500 to-amber-500 text-white shadow-yellow-500/20"
                    : "bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-emerald-500/20"
                  }`}>
                  <Check className="h-4 w-4" />
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${i === 2 ? "text-emerald-600" : "text-gray-600"
                  }`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-3 rounded-full ${i === 1 ? "bg-emerald-500" : "bg-yellow-500"
                  }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-12">
        {/* Order Details Card */}
        <div className="rounded-2xl border border-gray-100 p-6 bg-white shadow-sm mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                <Package className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Order Details</h2>
                <p className="text-xs text-gray-400 font-mono">
                  #{order._id?.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
            <span className="text-xs bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full font-semibold capitalize">
              {order.status}
            </span>
          </div>

          <div className="space-y-3 text-sm mb-5">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Order Date
              </span>
              <span className="font-medium text-gray-700">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                  : "Just now"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Items</span>
              <span className="font-medium text-gray-700">{order.totalItems}</span>
            </div>
            <div className="border-t border-dashed border-gray-200 my-3" />
            <div className="flex justify-between items-center font-bold text-base text-gray-900">
              <span>Total Amount</span>
              <div className="flex items-center">
                <IndianRupee className="h-4 w-4" />
                <span>{order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <h3 className="font-bold text-sm mb-4">Items Ordered</h3>
            <div className="space-y-3">
              {order.products?.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  {item.productId?.image ? (
                    <img
                      className="w-14 h-14 object-cover rounded-xl bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity"
                      src={item.productId.image}
                      alt={item.productId.name || "Product"}
                      onClick={() => navigate(`/product/${item.productId._id}`)}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <span
                      className="text-sm font-semibold capitalize cursor-pointer hover:text-yellow-700 transition-colors"
                      onClick={() => item.productId?._id && navigate(`/product/${item.productId._id}`)}
                    >
                      {item.productId?.name || "Product"}
                    </span>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <div className="flex items-center text-sm font-bold">
                    <IndianRupee className="h-3 w-3" />
                    <span>{item.price?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up animation-delay-100">
          <button
            className="flex-1 inline-flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 text-base"
            onClick={() => navigate("/products")}
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </button>
          <Link
            to="/profile/orders"
            className="flex-1 inline-flex items-center justify-center gap-2 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 transition-all duration-300 text-base"
          >
            <Package className="h-4 w-4" />
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;
