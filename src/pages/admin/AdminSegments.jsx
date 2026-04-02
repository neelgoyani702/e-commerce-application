import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Crown,
  Users,
  AlertTriangle,
  UserPlus,
  IndianRupee,
  ShoppingCart,
  Clock,
} from "lucide-react";

const SEGMENT_CONFIG = {
  vip: {
    label: "VIP",
    description: "Top spenders",
    icon: Crown,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
    iconColor: "text-amber-500",
  },
  regular: {
    label: "Regular",
    description: "Active within 90 days",
    icon: Users,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
    iconColor: "text-emerald-500",
  },
  atRisk: {
    label: "At-Risk",
    description: "Inactive 90+ days",
    icon: AlertTriangle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700",
    iconColor: "text-red-500",
  },
  new: {
    label: "New",
    description: "Never ordered",
    icon: UserPlus,
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    badge: "bg-sky-100 text-sky-700",
    iconColor: "text-sky-500",
  },
};

function AdminSegments() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("vip");

  const fetchSegments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/customers/segments`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const result = await response.json();
      if (response.ok) {
        setData(result);
      } else {
        toast.error(result.message || "Failed to load segments");
      }
    } catch {
      toast.error("Failed to fetch customer segments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  if (loading) {
    return (
      <div className="max-w-7xl animate-pulse space-y-6">
        <div className="h-8 w-56 bg-gray-100 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100" />
          ))}
        </div>
        <div className="h-96 bg-white rounded-2xl border border-gray-100" />
      </div>
    );
  }

  const segmentKeys = ["vip", "regular", "atRisk", "new"];
  const activeConfig = SEGMENT_CONFIG[activeTab];
  const activeCustomers = data?.segments?.[activeTab] || [];
  const Icon = activeConfig.icon;

  return (
    <div className="max-w-7xl space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-6 w-6 text-indigo-600" /> Customer Segments
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Automatically classify customers by spending and activity for targeted marketing.
        </p>
      </div>

      {/* Segment Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {segmentKeys.map((key) => {
          const config = SEGMENT_CONFIG[key];
          const SegIcon = config.icon;
          const count = data?.summary?.[key] || 0;
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`text-left rounded-2xl p-5 border-2 transition-all duration-200 ${
                isActive
                  ? `${config.bg} ${config.border} shadow-md scale-[1.02]`
                  : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isActive ? config.badge : "bg-gray-50"
                  }`}
                >
                  <SegIcon
                    className={`h-5 w-5 ${isActive ? config.iconColor : "text-gray-400"}`}
                  />
                </div>
                <span
                  className={`text-2xl font-extrabold ${
                    isActive ? config.text : "text-gray-900"
                  }`}
                >
                  {count}
                </span>
              </div>
              <p
                className={`text-sm font-bold ${
                  isActive ? config.text : "text-gray-700"
                }`}
              >
                {config.label}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {config.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Segment Detail */}
      <div className={`rounded-3xl border-2 ${activeConfig.border} ${activeConfig.bg} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-lg font-bold ${activeConfig.text} flex items-center gap-2`}>
            <Icon className="h-5 w-5" />
            {activeConfig.label} Customers ({activeCustomers.length})
          </h2>
          {activeTab === "vip" && data?.summary?.vipThreshold && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
              Threshold: ₹{data.summary.vipThreshold.toLocaleString()}+
            </span>
          )}
        </div>

        {activeCustomers.length === 0 ? (
          <div className="text-center py-12">
            <Icon className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm text-gray-400">
              No customers in this segment yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeCustomers.map((customer) => (
              <div
                key={customer._id}
                className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm"
              >
                {/* Avatar */}
                {customer.image ? (
                  <img
                    src={customer.image}
                    alt=""
                    className="w-11 h-11 rounded-full object-cover bg-gray-50 shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-gray-300" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {customer.firstName || "User"} {customer.lastName || ""}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {customer.email}
                  </p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 shrink-0">
                  {activeTab !== "new" && (
                    <>
                      <div className="text-center">
                        <p className="text-xs font-bold text-gray-900 flex items-center gap-0.5">
                          <IndianRupee className="h-3 w-3" />
                          {customer.totalSpent?.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400">Total Spent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-gray-900 flex items-center gap-0.5">
                          <ShoppingCart className="h-3 w-3" />
                          {customer.orderCount}
                        </p>
                        <p className="text-[10px] text-gray-400">Orders</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-gray-900 flex items-center gap-0.5">
                          <IndianRupee className="h-3 w-3" />
                          {customer.avgOrderValue?.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400">AOV</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-gray-600 flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {customer.lastOrderDate
                            ? new Date(customer.lastOrderDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })
                            : "—"}
                        </p>
                        <p className="text-[10px] text-gray-400">Last Order</p>
                      </div>
                    </>
                  )}
                  {activeTab === "new" && customer.createdAt && (
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-600">
                        {new Date(customer.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-[10px] text-gray-400">Joined</p>
                    </div>
                  )}
                </div>

                {/* Segment Badge */}
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${activeConfig.badge}`}
                >
                  {activeConfig.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSegments;
