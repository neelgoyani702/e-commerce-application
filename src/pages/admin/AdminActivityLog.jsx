import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Activity,
  Package,
  FolderOpen,
  ShoppingCart,
  User,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";

const actionLabels = {
  product_created: { label: "Created product", color: "text-emerald-600 bg-emerald-50" },
  product_updated: { label: "Updated product", color: "text-blue-600 bg-blue-50" },
  product_deleted: { label: "Deleted product", color: "text-red-500 bg-red-50" },
  category_created: { label: "Created category", color: "text-emerald-600 bg-emerald-50" },
  category_updated: { label: "Updated category", color: "text-blue-600 bg-blue-50" },
  category_deleted: { label: "Deleted category", color: "text-red-500 bg-red-50" },
  order_status_updated: { label: "Updated order", color: "text-amber-600 bg-amber-50" },
  user_role_updated: { label: "Updated user role", color: "text-violet-600 bg-violet-50" },
};

const typeIcons = {
  product: Package,
  category: FolderOpen,
  order: ShoppingCart,
  user: User,
};

function AdminActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("all");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (filter !== "all") params.append("type", filter);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/activity-log?${params}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        setLogs(data.logs || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } else {
        toast.error(data.message || "Failed to load activity log");
      }
    } catch {
      toast.error("Failed to load activity log");
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  function formatTime(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center">
            <Activity className="h-[18px] w-[18px] text-cyan-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Activity Log</h2>
            <p className="text-[11px] text-gray-400">
              {total} activities recorded
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { key: "all", label: "All" },
          { key: "product", label: "Products" },
          { key: "category", label: "Categories" },
          { key: "order", label: "Orders" },
          { key: "user", label: "Users" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setFilter(tab.key);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === tab.key
              ? "bg-indigo-600 text-white"
              : "bg-white border border-gray-100 text-gray-500 hover:bg-gray-50"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Activity List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Activity className="h-10 w-10 mx-auto mb-3 text-gray-200" />
          <p className="text-sm font-medium">No activities yet</p>
          <p className="text-xs text-gray-300 mt-1">
            Activities will appear here as you manage the store
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {logs.map((log, i) => {
            const config = actionLabels[log.action] || {
              label: log.action,
              color: "text-gray-600 bg-gray-50",
            };
            const Icon = typeIcons[log.targetType] || Activity;
            return (
              <div
                key={log._id}
                className="flex items-start gap-4 bg-white rounded-xl border border-gray-100 px-5 py-4 hover:shadow-sm transition-shadow"
              >
                {/* Icon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-900">
                      {config.label}
                    </span>
                    {log.targetName && (
                      <span className="text-xs font-medium text-indigo-600 truncate max-w-[200px]">
                        {log.targetName}
                      </span>
                    )}
                  </div>
                  {log.details && (
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                      {log.details}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-gray-300 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(log.createdAt)}
                    </span>
                    {log.userId && (
                      <span className="text-[10px] text-gray-300">
                        by{" "}
                        <span className="text-gray-500">
                          {log.userId.firstName} {log.userId.lastName}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <span className="text-[11px] text-gray-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminActivityLog;
