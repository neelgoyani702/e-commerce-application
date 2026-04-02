import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  RotateCcw,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  User,
  Mail,
  X,
  Banknote,
} from "lucide-react";

function AdminReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [adminNote, setAdminNote] = useState("");

  async function fetchReturns() {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/returns`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        setReturns(data.returns || []);
      } else {
        toast.error(data.message || "Failed to load returns");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReturns();
  }, []);

  async function updateReturnStatus(id, status) {
    try {
      const toastId = toast.loading(`Updating to ${status}...`);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/returns/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status, adminNote }),
        }
      );
      toast.dismiss(toastId);
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Return updated");
        const updated = data.returnRequest;
        setReturns(returns.map((r) => (r._id === id ? updated : r)));
        if (selectedReturn?._id === id) setSelectedReturn(updated);
        setAdminNote("");
      } else {
        toast.error(data.message || "Failed to update");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  const statusConfig = {
    pending: {
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      icon: Clock,
      dotColor: "bg-yellow-500",
    },
    approved: {
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: CheckCircle2,
      dotColor: "bg-blue-500",
    },
    rejected: {
      color: "bg-red-50 text-red-600 border-red-200",
      icon: XCircle,
      dotColor: "bg-red-500",
    },
    refunded: {
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Banknote,
      dotColor: "bg-emerald-500",
    },
  };

  const filteredReturns =
    filter === "all" ? returns : returns.filter((r) => r.status === filter);

  const statusCounts = {
    all: returns.length,
    pending: returns.filter((r) => r.status === "pending").length,
    approved: returns.filter((r) => r.status === "approved").length,
    rejected: returns.filter((r) => r.status === "rejected").length,
    refunded: returns.filter((r) => r.status === "refunded").length,
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Return Requests</h2>
        <p className="text-xs text-gray-400 mt-1">
          Manage customer return and refund requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {[
          { label: "Total", value: statusCounts.all, color: "text-gray-900" },
          {
            label: "Pending",
            value: statusCounts.pending,
            color: "text-yellow-600",
          },
          {
            label: "Approved",
            value: statusCounts.approved,
            color: "text-blue-600",
          },
          {
            label: "Rejected",
            value: statusCounts.rejected,
            color: "text-red-500",
          },
          {
            label: "Refunded",
            value: statusCounts.refunded,
            color: "text-emerald-600",
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

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "approved", label: "Approved" },
          { key: "rejected", label: "Rejected" },
          { key: "refunded", label: "Refunded" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === tab.key
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-100 text-gray-500 hover:bg-gray-50"
            }`}
          >
            {tab.label} ({statusCounts[tab.key]})
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredReturns.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <RotateCcw className="h-7 w-7 text-gray-300" />
          </div>
          <p className="text-sm text-gray-400">
            {filter === "all" ? "No return requests yet" : `No ${filter} returns`}
          </p>
        </div>
      )}

      {/* Returns List */}
      {!loading && filteredReturns.length > 0 && (
        <div className="space-y-3">
          {filteredReturns.map((ret) => {
            const cfg = statusConfig[ret.status] || statusConfig.pending;
            return (
              <div
                key={ret._id}
                onClick={() => {
                  setSelectedReturn(ret);
                  setAdminNote(ret.adminNote || "");
                }}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <RotateCcw className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-mono">
                        #{ret._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {ret.userId?.firstName} {ret.userId?.lastName} •{" "}
                        {new Date(ret.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold capitalize border ${cfg.color}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                      {ret.status}
                    </span>
                    <div className="flex items-center gap-0.5 font-bold text-sm">
                      <IndianRupee className="h-3 w-3" />
                      {ret.refundAmount?.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-[11px] bg-gray-50 text-gray-600 px-2 py-1 rounded-md">
                    {ret.reason}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {ret.items?.length} item{ret.items?.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Drawer */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSelectedReturn(null)}
          />
          <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 font-mono">
                  Return #{selectedReturn._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  Return Details
                </p>
              </div>
              <button
                onClick={() => setSelectedReturn(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Status */}
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2">
                  Status
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold capitalize border ${
                      (
                        statusConfig[selectedReturn.status] ||
                        statusConfig.pending
                      ).color
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        (
                          statusConfig[selectedReturn.status] ||
                          statusConfig.pending
                        ).dotColor
                      }`}
                    />
                    {selectedReturn.status}
                  </span>

                  {selectedReturn.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          updateReturnStatus(selectedReturn._id, "approved")
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          updateReturnStatus(selectedReturn._id, "rejected")
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <XCircle className="h-3 w-3" />
                        Reject
                      </button>
                    </div>
                  )}

                  {selectedReturn.status === "approved" && (
                    <button
                      onClick={() =>
                        updateReturnStatus(selectedReturn._id, "refunded")
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <Banknote className="h-3 w-3" />
                      Mark Refunded
                    </button>
                  )}
                </div>

                {/* Admin Note */}
                {(selectedReturn.status === "pending" ||
                  selectedReturn.status === "approved") && (
                  <input
                    type="text"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Admin note (optional)..."
                    className="w-full mt-2 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                )}
                {selectedReturn.adminNote && selectedReturn.status !== "pending" && (
                  <p className="text-[11px] text-gray-500 mt-2 italic">
                    Admin note: "{selectedReturn.adminNote}"
                  </p>
                )}
              </div>

              {/* Customer */}
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2">
                  Customer
                </p>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  {selectedReturn.userId?.image ? (
                    <img
                      src={selectedReturn.userId.image}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-indigo-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-gray-700">
                      {selectedReturn.userId?.firstName}{" "}
                      {selectedReturn.userId?.lastName}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Mail className="h-3 w-3" />
                      {selectedReturn.userId?.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2">
                  Reason
                </p>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs font-semibold text-gray-700">
                    {selectedReturn.reason}
                  </p>
                  {selectedReturn.reasonDetail && (
                    <p className="text-[11px] text-gray-500 mt-1">
                      {selectedReturn.reasonDetail}
                    </p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2">
                  Items
                </p>
                <div className="space-y-2">
                  {selectedReturn.items?.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      {item.productId?.image ? (
                        <img
                          src={item.productId.image}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 truncate">
                          {item.productId?.name || "Product"}
                        </p>
                        {item.variantLabel && (
                          <p className="text-[10px] text-gray-400">
                            {item.variantLabel}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 text-xs font-bold">
                        <IndianRupee className="h-3 w-3" />
                        {Math.round(item.price)?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Info */}
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2">
                  Order
                </p>
                <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600">
                  <p>
                    Order #{selectedReturn.orderId?._id?.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Placed{" "}
                    {new Date(
                      selectedReturn.orderId?.createdAt
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Refund Amount</span>
                <div className="flex items-center gap-1 font-bold text-lg">
                  <IndianRupee className="h-4 w-4" />
                  {selectedReturn.refundAmount?.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReturns;
