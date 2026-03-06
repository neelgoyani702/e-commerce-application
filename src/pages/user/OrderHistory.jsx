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

                {/* Order Footer */}
                <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-100 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {order.totalItems}{" "}
                      {order.totalItems === 1 ? "item" : "items"}
                    </span>
                    {order.couponCode && (
                      <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-md font-semibold">
                        {order.couponCode} (−₹{order.couponDiscount?.toLocaleString()})
                      </span>
                    )}
                  </div>
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
