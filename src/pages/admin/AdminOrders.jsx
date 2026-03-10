import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  ShoppingCart,
  Package,
  CheckCircle2,
  XCircle,
  Truck,
  Search,
  IndianRupee,
  X,
  User,
  Mail,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Calendar,
} from "lucide-react";

const PAGE_SIZES = [12, 25, 50];

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  // Date range filter
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  // Reset page on filter/search change
  useEffect(() => {
    setPage(1);
  }, [filter, search, dateFrom, dateTo, pageSize]);

  async function fetchOrders() {
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
      if (response.ok) {
        setOrders(data.orders || []);
      } else {
        toast.error(data.message || "Failed to load orders");
      }
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId, status) {
    try {
      const toastId = toast.loading(`Updating to ${status}...`);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );
      toast.dismiss(toastId);
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Status updated");
        setOrders(
          orders.map((o) => (o._id === orderId ? { ...o, status } : o))
        );
        if (selectedOrder?._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status });
        }
      } else {
        toast.error(data.message || "Failed to update");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  const statusConfig = {
    "order placed": {
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      icon: Package,
      dotColor: "bg-yellow-500",
    },
    delivered: {
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
      dotColor: "bg-emerald-500",
    },
    cancelled: {
      color: "bg-red-50 text-red-600 border-red-200",
      icon: XCircle,
      dotColor: "bg-red-500",
    },
  };

  // Filtered, sorted, paginated data
  const processed = useMemo(() => {
    let result = [...orders];

    // Status filter
    if (filter !== "all") {
      result = result.filter((o) => o.status === filter);
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o._id.toLowerCase().includes(q) ||
          (o.userId?.firstName + " " + o.userId?.lastName)
            .toLowerCase()
            .includes(q)
      );
    }

    // Date range filter
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter((o) => new Date(o.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((o) => new Date(o.createdAt) <= to);
    }

    // Sorting
    result.sort((a, b) => {
      let valA, valB;
      switch (sortField) {
        case "amount":
          valA = a.totalAmount || 0;
          valB = b.totalAmount || 0;
          break;
        case "items":
          valA = a.totalItems || 0;
          valB = b.totalItems || 0;
          break;
        case "status":
          valA = a.status || "";
          valB = b.status || "";
          return sortDir === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        case "customer":
          valA = (a.userId?.firstName || "") + (a.userId?.lastName || "");
          valB = (b.userId?.firstName || "") + (b.userId?.lastName || "");
          return sortDir === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        default:
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
      }
      return sortDir === "asc" ? valA - valB : valB - valA;
    });

    return result;
  }, [orders, filter, search, dateFrom, dateTo, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const paginated = processed.slice((page - 1) * pageSize, page * pageSize);

  const statusCounts = {
    all: orders.length,
    "order placed": orders.filter((o) => o.status === "order placed").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  function handleSort(field) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  function SortIcon({ field }) {
    if (sortField !== field)
      return <ArrowUpDown className="h-3 w-3 text-gray-300 ml-1" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3 text-indigo-500 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 text-indigo-500 ml-1" />
    );
  }

  function exportCSV() {
    if (processed.length === 0) return toast.error("No data to export");
    const headers = [
      "Order ID",
      "Customer",
      "Email",
      "Items",
      "Amount",
      "Status",
      "Date",
    ];
    const rows = processed.map((o) => [
      o._id,
      `${o.userId?.firstName || ""} ${o.userId?.lastName || ""}`.trim(),
      o.userId?.email || "",
      o.totalItems,
      o.totalAmount,
      o.status,
      new Date(o.createdAt).toLocaleDateString("en-IN"),
    ]);
    const csv =
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Orders exported");
  }

  if (loading) {
    return (
      <div className="max-w-6xl animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-gray-100" />
          <div className="h-6 w-24 bg-gray-100 rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
              <div className="h-3 w-16 bg-gray-100 rounded" />
              <div className="h-6 w-12 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex gap-4 px-5 py-3 border-b border-gray-100">
            {[...Array(6)].map((_, i) => <div key={i} className="h-3 bg-gray-100 rounded flex-1" />)}
          </div>
          {[...Array(5)].map((_, r) => (
            <div key={r} className="flex gap-4 px-5 py-4 border-b border-gray-50">
              {[...Array(6)].map((_, c) => <div key={c} className={`h-3 rounded flex-1 ${c === 0 ? 'bg-gray-100' : 'bg-gray-50'}`} />)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
            <ShoppingCart className="h-[18px] w-[18px] text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Orders</h2>
            <p className="text-[11px] text-gray-400">
              {orders.length} total orders
            </p>
          </div>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: statusCounts.all, color: "text-gray-900" },
          {
            label: "Active",
            value: statusCounts["order placed"],
            color: "text-yellow-600",
          },
          {
            label: "Delivered",
            value: statusCounts.delivered,
            color: "text-emerald-600",
          },
          {
            label: "Cancelled",
            value: statusCounts.cancelled,
            color: "text-red-500",
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

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "All" },
            { key: "order placed", label: "Active" },
            { key: "delivered", label: "Delivered" },
            { key: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === tab.key
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-100 text-gray-500 hover:bg-gray-50"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
          <input
            type="text"
            placeholder="Search by ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar className="h-3.5 w-3.5" />
          Date Range:
        </div>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <span className="text-xs text-gray-300">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        {(dateFrom || dateTo) && (
          <button
            onClick={() => {
              setDateFrom("");
              setDateTo("");
            }}
            className="text-[11px] text-gray-400 hover:text-gray-600 font-medium"
          >
            Clear dates
          </button>
        )}
      </div>

      {/* Orders Table */}
      {paginated.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ShoppingCart className="h-10 w-10 mx-auto mb-3 text-gray-200" />
          <p className="text-sm font-medium">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider bg-gray-50/50">
                  <th className="px-5 py-3">Order ID</th>
                  <th
                    className="px-5 py-3 cursor-pointer select-none hover:text-gray-600"
                    onClick={() => handleSort("customer")}
                  >
                    <span className="inline-flex items-center">
                      Customer
                      <SortIcon field="customer" />
                    </span>
                  </th>
                  <th
                    className="px-5 py-3 cursor-pointer select-none hover:text-gray-600"
                    onClick={() => handleSort("items")}
                  >
                    <span className="inline-flex items-center">
                      Items
                      <SortIcon field="items" />
                    </span>
                  </th>
                  <th
                    className="px-5 py-3 cursor-pointer select-none hover:text-gray-600"
                    onClick={() => handleSort("amount")}
                  >
                    <span className="inline-flex items-center">
                      Amount
                      <SortIcon field="amount" />
                    </span>
                  </th>
                  <th
                    className="px-5 py-3 cursor-pointer select-none hover:text-gray-600"
                    onClick={() => handleSort("status")}
                  >
                    <span className="inline-flex items-center">
                      Status
                      <SortIcon field="status" />
                    </span>
                  </th>
                  <th
                    className="px-5 py-3 cursor-pointer select-none hover:text-gray-600"
                    onClick={() => handleSort("createdAt")}
                  >
                    <span className="inline-flex items-center">
                      Date
                      <SortIcon field="createdAt" />
                    </span>
                  </th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((order) => {
                  const config =
                    statusConfig[order.status] || statusConfig["order placed"];
                  const StatusIcon = config.icon;
                  return (
                    <tr
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className={`hover:bg-indigo-50/30 transition-colors cursor-pointer ${order.status === "cancelled" ? "opacity-60" : ""
                        }`}
                    >
                      <td className="px-5 py-3 font-mono text-xs text-gray-400">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {order.userId?.image ? (
                            <img
                              src={order.userId.image}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                              <User className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                          <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]">
                            {order.userId?.firstName || "User"}{" "}
                            {order.userId?.lastName || ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">
                        {order.totalItems}
                      </td>
                      <td className="px-5 py-3 text-xs font-bold text-gray-900">
                        ₹{order.totalAmount?.toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${config.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[11px] text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {order.status === "order placed" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(order._id, "delivered");
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <Truck className="h-3 w-3" />
                            Deliver
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50 bg-gray-50/30">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-gray-400">
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, processed.length)} of{" "}
                {processed.length}
              </span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="text-[11px] text-gray-500 border border-gray-200 rounded-md px-2 py-1 focus:outline-none"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s} / page
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${page === pageNum
                      ? "bg-indigo-600 text-white"
                      : "text-gray-400 hover:bg-gray-100"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Order Details
                </h3>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                  #{selectedOrder._id.slice(-8).toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Status Section */}
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2">
                  Status
                </p>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold capitalize border ${(statusConfig[selectedOrder.status] ||
                      statusConfig["order placed"]
                    ).color
                      }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${(statusConfig[selectedOrder.status] ||
                        statusConfig["order placed"]
                      ).dotColor
                        }`}
                    />
                    {selectedOrder.status}
                  </span>

                  {selectedOrder.status === "order placed" && (
                    <div className="relative group">
                      <button className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors">
                        Change
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      <div className="absolute top-full left-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-10">
                        <button
                          onClick={() =>
                            updateStatus(selectedOrder._id, "delivered")
                          }
                          className="w-full text-left px-3 py-2 text-xs text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Mark Delivered
                        </button>
                        <button
                          onClick={() =>
                            updateStatus(selectedOrder._id, "cancelled")
                          }
                          className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                          <XCircle className="h-3 w-3" />
                          Cancel Order
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-3">
                  Customer
                </p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    {selectedOrder.userId?.image ? (
                      <img
                        src={selectedOrder.userId.image}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-indigo-500" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {selectedOrder.userId?.firstName || "User"}{" "}
                        {selectedOrder.userId?.lastName || ""}
                      </p>
                      <p className="text-[11px] text-gray-400">Customer</p>
                    </div>
                  </div>
                  {selectedOrder.userId?.email && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Mail className="h-3.5 w-3.5 text-gray-400" />
                      {selectedOrder.userId.email}
                    </div>
                  )}
                  {selectedOrder.shippingAddress && (
                    <div className="flex items-start gap-2 text-xs text-gray-500">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>
                        {selectedOrder.shippingAddress.street &&
                          `${selectedOrder.shippingAddress.street}, `}
                        {selectedOrder.shippingAddress.city &&
                          `${selectedOrder.shippingAddress.city}, `}
                        {selectedOrder.shippingAddress.state &&
                          `${selectedOrder.shippingAddress.state} `}
                        {selectedOrder.shippingAddress.pincode &&
                          `- ${selectedOrder.shippingAddress.pincode}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-3">
                  Items ({selectedOrder.totalItems})
                </p>
                <div className="space-y-3">
                  {selectedOrder.products?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
                    >
                      {item?.productId?.image ? (
                        <img
                          className="h-14 w-14 object-cover rounded-lg bg-white"
                          src={item.productId.image}
                          alt={item.productId.name || "Product"}
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-lg bg-white flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 capitalize truncate">
                          {item.productId?.name || "Product"}
                        </p>
                        {item.variantLabel && (
                          <p className="text-[10px] text-indigo-500 font-medium mt-0.5">{item.variantLabel}</p>
                        )}
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 flex items-center whitespace-nowrap">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {item.price?.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Timeline */}
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-3">
                  Timeline
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-700">
                        Order Placed
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(selectedOrder.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  {selectedOrder.status !== "order placed" && (
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${selectedOrder.status === "delivered"
                          ? "bg-emerald-500"
                          : "bg-red-500"
                          }`}
                      />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700 capitalize">
                          {selectedOrder.status}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(
                            selectedOrder.updatedAt
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Subtotal</span>
                <span className="text-xs text-gray-500">
                  ₹{((selectedOrder.totalAmount || 0) + (selectedOrder.couponDiscount || 0)).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Shipping</span>
                <span className="text-xs text-emerald-600 font-medium">
                  Free
                </span>
              </div>
              {selectedOrder.couponCode && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-green-600">
                    Coupon ({selectedOrder.couponCode})
                  </span>
                  <span className="text-xs text-green-600 font-medium">
                    −₹{selectedOrder.couponDiscount?.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-sm font-bold text-gray-900 flex items-center">
                  <IndianRupee className="h-3.5 w-3.5" />
                  {selectedOrder.totalAmount?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Drawer slide animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}

export default AdminOrders;
