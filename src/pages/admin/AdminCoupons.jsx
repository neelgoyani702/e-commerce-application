import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Ticket,
  Plus,
  X,
  Trash2,
  Pencil,
  ToggleLeft,
  ToggleRight,
  IndianRupee,
  Calendar,
  Hash,
} from "lucide-react";

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxUses: "",
    expiresAt: "",
  });

  const fetchCoupons = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/coupons`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) setCoupons(data.coupons || []);
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  function openCreate() {
    setEditing(null);
    setForm({
      code: "",
      discountType: "percentage",
      discountValue: "",
      minOrderAmount: "",
      maxUses: "",
      expiresAt: "",
    });
    setShowModal(true);
  }

  function openEdit(coupon) {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue || "",
      minOrderAmount: coupon.minOrderAmount || "",
      maxUses: coupon.maxUses || "",
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().slice(0, 10)
        : "",
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.code.trim()) return toast.error("Coupon code is required");
    if (!form.discountValue || Number(form.discountValue) <= 0)
      return toast.error("Discount value is required");
    if (
      form.discountType === "percentage" &&
      Number(form.discountValue) > 100
    )
      return toast.error("Percentage cannot exceed 100");

    setSaving(true);
    try {
      const url = editing
        ? `${process.env.REACT_APP_API_URL}/admin/coupons/${editing._id}`
        : `${process.env.REACT_APP_API_URL}/admin/coupons`;

      const body = {
        code: form.code.trim(),
        discountType: form.discountType,
        discountValue: form.discountValue,
        minOrderAmount: form.minOrderAmount || 0,
        maxUses: form.maxUses || 0,
        expiresAt: form.expiresAt || null,
      };

      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Saved!");
        setShowModal(false);
        fetchCoupons();
      } else {
        toast.error(data.message || "Failed to save");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(coupon) {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/coupons/${coupon._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ isActive: !coupon.isActive }),
        }
      );
      if (response.ok) {
        setCoupons(
          coupons.map((c) =>
            c._id === coupon._id ? { ...c, isActive: !c.isActive } : c
          )
        );
        toast.success(
          `Coupon ${!coupon.isActive ? "activated" : "deactivated"}`
        );
      }
    } catch {
      toast.error("Failed to update");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/coupons/${id}`,
        { method: "DELETE", credentials: "include" }
      );
      if (response.ok) {
        toast.success("Coupon deleted");
        fetchCoupons();
      }
    } catch {
      toast.error("Failed to delete");
    }
  }

  function isExpired(coupon) {
    if (!coupon.expiresAt) return false;
    return new Date(coupon.expiresAt) < new Date();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
            <Ticket className="h-[18px] w-[18px] text-rose-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Coupons</h2>
            <p className="text-[11px] text-gray-400">
              {coupons.length} coupons
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New Coupon
        </button>
      </div>

      {/* Coupons Grid */}
      {coupons.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Ticket className="h-10 w-10 mx-auto mb-3 text-gray-200" />
          <p className="text-sm font-medium">No coupons yet</p>
          <p className="text-xs text-gray-300 mt-1">
            Create a coupon to offer discounts at checkout
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => {
            const expired = isExpired(coupon);
            return (
              <div
                key={coupon._id}
                className={`bg-white rounded-xl border border-gray-100 overflow-hidden transition-all ${!coupon.isActive || expired ? "opacity-60" : ""
                  }`}
              >
                {/* Coupon Header - dashed border like a ticket */}
                <div className="px-5 pt-5 pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-black text-gray-900 tracking-wider font-mono">
                      {coupon.code}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleActive(coupon)}
                        className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                        title={coupon.isActive ? "Deactivate" : "Activate"}
                      >
                        {coupon.isActive ? (
                          <ToggleRight className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-gray-300" />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(coupon)}
                        className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Discount display */}
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-3xl font-black text-indigo-600">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}%`
                        : `₹${coupon.discountValue}`}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold">
                      OFF
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="border-t border-dashed border-gray-200 px-5 py-3 space-y-2 bg-gray-50/50">
                  {coupon.minOrderAmount > 0 && (
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <IndianRupee className="h-3 w-3 text-gray-400" />
                      Min order: ₹{coupon.minOrderAmount.toLocaleString()}
                    </div>
                  )}
                  {coupon.maxUses > 0 && (
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <Hash className="h-3 w-3 text-gray-400" />
                      Used {coupon.usedCount || 0} / {coupon.maxUses}
                    </div>
                  )}
                  {coupon.expiresAt && (
                    <div
                      className={`flex items-center gap-2 text-[11px] ${expired ? "text-red-500" : "text-gray-500"
                        }`}
                    >
                      <Calendar className="h-3 w-3" />
                      {expired ? "Expired" : "Expires"}{" "}
                      {new Date(coupon.expiresAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${coupon.isActive && !expired
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-400"
                        }`}
                    >
                      {expired ? "Expired" : coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">
                  {editing ? "Edit Coupon" : "New Coupon"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value.toUpperCase() })
                    }
                    disabled={!!editing}
                    placeholder="e.g. SAVE20"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 disabled:bg-gray-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                      Discount Type *
                    </label>
                    <select
                      value={form.discountType}
                      onChange={(e) =>
                        setForm({ ...form, discountType: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                      Value *
                    </label>
                    <input
                      type="number"
                      value={form.discountValue}
                      onChange={(e) =>
                        setForm({ ...form, discountValue: e.target.value })
                      }
                      placeholder={
                        form.discountType === "percentage" ? "e.g. 20" : "e.g. 500"
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                      Min Order Amount
                    </label>
                    <input
                      type="number"
                      value={form.minOrderAmount}
                      onChange={(e) =>
                        setForm({ ...form, minOrderAmount: e.target.value })
                      }
                      placeholder="₹0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                      Max Uses
                    </label>
                    <input
                      type="number"
                      value={form.maxUses}
                      onChange={(e) =>
                        setForm({ ...form, maxUses: e.target.value })
                      }
                      placeholder="0 = unlimited"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) =>
                      setForm({ ...form, expiresAt: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
              <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : editing ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminCoupons;
