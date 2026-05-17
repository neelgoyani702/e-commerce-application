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
  Star,
  X,
  Truck,
  Clipboard,
  PackageCheck,
  CircleDot,
  RefreshCcw,
  RotateCcw,
  Download,
} from "lucide-react";
import { SkeletonOrderCard } from "../../components/SkeletonCard";

function OrderHistory() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Review state
  const [reviewingProduct, setReviewingProduct] = useState(null); // { productId, orderId }
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [existingReviews, setExistingReviews] = useState({}); // productId -> review
  const [reordering, setReordering] = useState(null); // orderId being reordered

  // Return state
  const [returningOrder, setReturningOrder] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnDetail, setReturnDetail] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnStatusMap, setReturnStatusMap] = useState({}); // orderId -> { status, returnId }

  const RETURN_REASONS = [
    "Damaged product",
    "Wrong item received",
    "Item not as described",
    "Quality not satisfactory",
    "Size/fit issue",
    "Changed my mind",
    "Other",
  ];

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

        // Fetch existing reviews for all delivered order products
        const deliveredOrders = data.orders.filter((o) => o.status === "delivered");
        const productIds = new Set();
        deliveredOrders.forEach((order) => {
          order.products?.forEach((item) => {
            if (item.productId?._id) productIds.add(item.productId._id);
          });
        });

        // Fetch reviews for each product to see if user already reviewed
        const reviewMap = {};
        await Promise.all(
          [...productIds].map(async (pid) => {
            try {
              const res = await fetch(`${process.env.REACT_APP_API_URL}/review/${pid}`);
              const rData = await res.json();
              if (res.ok && rData.reviews) {
                const userReview = rData.reviews.find(
                  (r) => r.userId?._id === user._id
                );
                if (userReview) {
                  reviewMap[pid] = userReview;
                }
              }
            } catch {
              // silent
            }
          })
        );
        setExistingReviews(reviewMap);
      }
    } catch (error) {
      console.error("Error fetching order history:", error);
      toast.error("Failed to load order history");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitReview(productId) {
    if (!reviewForm.rating) {
      toast.error("Please select a rating");
      return;
    }
    setSubmittingReview(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/review/${productId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(reviewForm),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Review submitted!");
        // Update local state
        setExistingReviews((prev) => ({
          ...prev,
          [productId]: { ...data.review, userId: { _id: user._id, firstName: user.firstName, lastName: user.lastName } },
        }));
        setReviewingProduct(null);
        setReviewForm({ rating: 0, comment: "" });
        setHoverRating(0);
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSubmittingReview(false);
    }
  }

  function openReviewForm(productId, orderId) {
    const existing = existingReviews[productId];
    setReviewingProduct({ productId, orderId });
    if (existing) {
      setReviewForm({ rating: existing.rating, comment: existing.comment || "" });
    } else {
      setReviewForm({ rating: 0, comment: "" });
    }
    setHoverRating(0);
  }

  async function handleReorder(orderId) {
    try {
      setReordering(orderId);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/cart/reorder/${orderId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok && data.addedCount > 0) {
        const warnings = data.results?.filter(r => r.status !== "added") || [];
        if (warnings.length > 0) {
          toast.success(data.message, {
            description: warnings.map(w => `${w.name}: ${w.status}`).join(", "),
          });
        } else {
          toast.success(data.message);
        }
        navigate("/checkout/cart");
      } else {
        toast.error(data.message || "Could not reorder");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setReordering(null);
    }
  }

  async function handleReturnSubmit() {
    if (!returningOrder || !returnReason) {
      toast.error("Please select a reason");
      return;
    }
    try {
      setSubmittingReturn(true);
      const items = returningOrder.products.map((p) => ({
        productId: (p.productId._id || p.productId).toString(),
        variantId: p.variantId?.toString() || undefined,
        quantity: p.quantity,
      }));
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/returns`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            orderId: returningOrder._id,
            reason: returnReason,
            reasonDetail: returnDetail,
            items,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Return request submitted");
        setReturningOrder(null);
        setReturnReason("");
        setReturnDetail("");
        setReturnStatusMap((prev) => ({ ...prev, [returningOrder._id]: { status: "pending", returnId: data.returnRequest._id } }));
      } else {
        toast.error(data.message || "Failed to submit return");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmittingReturn(false);
    }
  }

  async function fetchReturnStatuses() {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/returns`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok && data.returns) {
        const map = {};
        for (const ret of data.returns) {
          const oid = ret.orderId?._id || ret.orderId;
          map[oid] = { status: ret.status, returnId: ret._id };
        }
        setReturnStatusMap(map);
      }
    } catch {
      // silent
    }
  }

  async function handleCancelReturn(orderId, returnId) {
    try {
      const toastId = toast.loading("Cancelling return...");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/returns/${returnId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      toast.dismiss(toastId);
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Return cancelled");
        setReturnStatusMap((prev) => {
          const copy = { ...prev };
          delete copy[orderId];
          return copy;
        });
      } else {
        toast.error(data.message || "Failed to cancel return");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    getOrderHistory();
    fetchReturnStatuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  if (!user) return null;

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => o.status === filter);

  const ORDER_STEPS = [
    { key: "order placed", label: "Placed", icon: Package },
    { key: "confirmed", label: "Confirmed", icon: Clipboard },
    { key: "packed", label: "Packed", icon: PackageCheck },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "out for delivery", label: "Out for Delivery", icon: CircleDot },
    { key: "delivered", label: "Delivered", icon: CheckCircle2 },
    { key: "returned", label: "Returned", icon: RotateCcw },
  ];

  const statusConfig = {
    "order placed": {
      color: "bg-yellow-50 text-yellow-700",
      icon: Package,
    },
    confirmed: {
      color: "bg-blue-50 text-blue-700",
      icon: Clipboard,
    },
    packed: {
      color: "bg-violet-50 text-violet-700",
      icon: PackageCheck,
    },
    shipped: {
      color: "bg-indigo-50 text-indigo-700",
      icon: Truck,
    },
    "out for delivery": {
      color: "bg-orange-50 text-orange-700",
      icon: CircleDot,
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
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    packed: orders.filter((o) => o.status === "packed").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    "out for delivery": orders.filter((o) => o.status === "out for delivery").length,
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
            { key: "order placed", label: "Placed" },
            { key: "confirmed", label: "Confirmed" },
            { key: "packed", label: "Packed" },
            { key: "shipped", label: "Shipped" },
            { key: "out for delivery", label: "Out for Delivery" },
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
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <SkeletonOrderCard key={i} />
          ))}
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
            const isDelivered = order.status === "delivered";
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

                {/* Step Tracker */}
                {order.status !== "cancelled" && (
                  <div className="mb-4 px-1">
                    <div className="flex items-center justify-between">
                      {(() => {
                        const retInfo = returnStatusMap[order._id];
                        const isReturned = retInfo && (retInfo.status === "approved" || retInfo.status === "refunded");
                        const stepsToShow = isReturned ? ORDER_STEPS : ORDER_STEPS.filter(s => s.key !== "returned");
                        const effectiveStatus = isReturned ? "returned" : order.status;

                        return stepsToShow.map((step, idx) => {
                          const stepIdx = stepsToShow.findIndex(s => s.key === effectiveStatus);
                          const isCompleted = idx <= stepIdx;
                          const isCurrent = idx === stepIdx;
                          const StepIcon = step.icon;
                          return (
                            <React.Fragment key={step.key}>
                              <div className="flex flex-col items-center gap-1" title={step.label}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                  isCompleted
                                    ? isCurrent ? "bg-store-primary text-white shadow-md" : "bg-store-primary text-white opacity-80"
                                    : "bg-gray-100 text-gray-300"
                                }`}>
                                  <StepIcon className="h-3.5 w-3.5" />
                                </div>
                                <span className={`text-[9px] font-medium hidden sm:block ${
                                  isCompleted ? "text-gray-700" : "text-gray-300"
                                }`}>{step.label}</span>
                              </div>
                              {idx < stepsToShow.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${
                                  idx < stepIdx ? "bg-store-primary/50" : "bg-gray-100"
                                }`} />
                              )}
                            </React.Fragment>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="divide-y divide-gray-50">
                  {order.products?.map((item, index) => {
                    const pid = item?.productId?._id;
                    const hasReview = pid && existingReviews[pid];
                    const isReviewing = reviewingProduct?.productId === pid && reviewingProduct?.orderId === order._id;

                    return (
                      <div key={index} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex gap-3">
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
                            {item.variantLabel && (
                              <p className="text-[11px] text-gray-500 font-medium mt-0.5">{item.variantLabel}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-0.5">
                              Qty: {item.quantity}
                            </p>
                            {/* Show existing review stars inline */}
                            {hasReview && !isReviewing && (
                              <div className="flex items-center gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`h-3 w-3 ${s <= existingReviews[pid].rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                                  />
                                ))}
                                <span className="text-[10px] text-gray-400 ml-0.5">Your review</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <div className="flex items-center text-sm font-bold">
                              <IndianRupee className="h-3 w-3" />
                              <span>
                                {item.price?.toLocaleString()}
                              </span>
                            </div>
                            {/* Rate & Review button for delivered orders */}
                            {isDelivered && pid && !isReviewing && (
                              <button
                                onClick={() => openReviewForm(pid, order._id)}
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all ${hasReview
                                  ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                                  : "text-store-primary bg-store-primary-light hover:bg-store-primary/10"
                                  }`}
                              >
                                <Star className={`h-3 w-3 ${hasReview ? "fill-amber-400" : ""}`} />
                                {hasReview ? "Edit Review" : "Rate & Review"}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Inline Review Form */}
                        {isReviewing && (
                          <div className="mt-3 ml-[68px] bg-gray-50 rounded-xl p-4 animate-fade-in">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs font-bold text-gray-700">
                                {hasReview ? "Update Your Review" : "Rate this Product"}
                              </h4>
                              <button
                                onClick={() => {
                                  setReviewingProduct(null);
                                  setReviewForm({ rating: 0, comment: "" });
                                  setHoverRating(0);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            {/* Star Picker */}
                            <div className="flex items-center gap-1 mb-3">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onMouseEnter={() => setHoverRating(s)}
                                  onMouseLeave={() => setHoverRating(0)}
                                  onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                                  className="transition-transform hover:scale-110"
                                >
                                  <Star
                                    className={`h-6 w-6 transition-colors ${s <= (hoverRating || reviewForm.rating)
                                      ? "text-amber-400 fill-amber-400"
                                      : "text-gray-200"
                                      }`}
                                  />
                                </button>
                              ))}
                              {reviewForm.rating > 0 && (
                                <span className="text-[11px] text-gray-400 ml-2">
                                  {["Terrible", "Poor", "Average", "Good", "Excellent"][reviewForm.rating - 1]}
                                </span>
                              )}
                            </div>
                            <textarea
                              value={reviewForm.comment}
                              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                              placeholder="Share your experience (optional)..."
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-store-primary/20 focus:border-store-primary bg-white resize-none"
                            />
                            <div className="flex justify-end mt-2">
                              <button
                                onClick={() => handleSubmitReview(pid)}
                                disabled={!reviewForm.rating || submittingReview}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                  background: `linear-gradient(to right, var(--store-primary, #eab308), var(--store-accent, #f59e0b))`,
                                }}
                              >
                                {submittingReview ? (
                                  <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Star className="h-3 w-3" />
                                )}
                                {hasReview ? "Update" : "Submit"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                    {/* Placeholder for left side if needed */}
                  </div>
                  <div className="flex items-center gap-3">
                    {isDelivered && (
                      <button
                        onClick={() => handleReorder(order._id)}
                        disabled={reordering === order._id}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-store-primary bg-store-primary-light hover:bg-store-primary/10 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                      >
                        <RefreshCcw className={`h-3 w-3 ${reordering === order._id ? "animate-spin" : ""}`} />
                        {reordering === order._id ? "Adding..." : "Buy Again"}
                      </button>
                    )}
                    {isDelivered && (() => {
                      const retInfo = returnStatusMap[order._id];
                      if (retInfo) {
                        const statusColors = {
                          pending: "text-yellow-600 bg-yellow-50",
                          approved: "text-blue-600 bg-blue-50",
                          rejected: "text-red-500 bg-red-50",
                          refunded: "text-emerald-600 bg-emerald-50",
                        };
                        return (
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg capitalize ${statusColors[retInfo.status] || "text-gray-500 bg-gray-50"}`}>
                              <RotateCcw className="h-3 w-3" />
                              Return {retInfo.status}
                            </span>
                            {retInfo.status === "pending" && (
                              <button
                                onClick={() => handleCancelReturn(order._id, retInfo.returnId)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-all"
                              >
                                <X className="h-3 w-3" />
                                Cancel
                              </button>
                            )}
                          </div>
                        );
                      }
                      return (
                        <button
                          onClick={() => {
                            setReturningOrder(order);
                            setReturnReason("");
                            setReturnDetail("");
                          }}
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-all"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Return
                        </button>
                      );
                    })()}
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
              </div>
            );
          })}
        </div>
      )}

      {/* Return Request Modal */}
      {returningOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setReturningOrder(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <RotateCcw className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Request Return</h3>
                  <p className="text-[11px] text-gray-400">Order #{returningOrder._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setReturningOrder(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Reason *</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-store-primary focus:border-store-primary"
                >
                  <option value="">Select a reason...</option>
                  {RETURN_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Additional Details</label>
                <textarea
                  value={returnDetail}
                  onChange={(e) => setReturnDetail(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-store-primary focus:border-store-primary"
                />
              </div>

              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Items to Return</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {returningOrder.products?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                      <img
                        className="h-10 w-10 rounded-lg object-cover"
                        src={item.productId?.image}
                        alt={item.productId?.name || ""}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{item.productId?.name}</p>
                        {item.variantLabel && <p className="text-[10px] text-gray-400">{item.variantLabel}</p>}
                        <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleReturnSubmit}
                disabled={!returnReason || submittingReturn}
                className="w-full py-3 bg-store-gradient text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReturn ? "Submitting..." : "Submit Return Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderHistory;
