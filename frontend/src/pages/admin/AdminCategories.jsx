import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  X,
  Upload,
  Pencil,
  Trash2,
  FolderOpen,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronRight,
  FolderTree,
} from "lucide-react";

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", image: null, parentId: null });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState({}); // track which categories are expanded

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/category/get-category`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }),
        fetch(`${process.env.REACT_APP_API_URL}/product/get-products`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }),
      ]);
      const catData = await catRes.json();
      const prodData = await prodRes.json();
      if (catRes.ok) setCategories(catData.categories || []);
      if (prodRes.ok) setProducts(prodData.products || []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  // Get top-level categories (no parent)
  const topLevel = categories.filter((c) => !c.parentId);

  // Get sub-categories for a parent
  function getSubCategories(parentId) {
    return categories.filter(
      (c) =>
        c.parentId === parentId ||
        c.parentId?._id === parentId
    );
  }

  function getProductCount(categoryId) {
    return products.filter(
      (p) =>
        p.category === categoryId ||
        p.category?._id === categoryId
    ).length;
  }

  // Total product count for a parent = own products + all sub-category products
  function getTotalProductCount(categoryId) {
    let count = getProductCount(categoryId);
    const subs = getSubCategories(categoryId);
    for (const sub of subs) {
      count += getProductCount(sub._id);
    }
    return count;
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (!editing && !form.image) {
      toast.error("Category image is required");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      if (form.image) formData.append("Image", form.image);
      if (form.parentId) formData.append("parentId", form.parentId);

      const url = editing
        ? `${process.env.REACT_APP_API_URL}/category/update-category/${editing._id}`
        : `${process.env.REACT_APP_API_URL}/category/create-category`;

      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Saved!");
        setShowModal(false);
        setEditing(null);
        setForm({ name: "", image: null, parentId: null });
        fetchData();
      } else {
        toast.error(data.message || "Failed to save");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cat) {
    const subs = getSubCategories(cat._id);
    const subCount = subs.length;
    const totalProducts = getTotalProductCount(cat._id);
    const isSub = !!cat.parentId;

    const message = isSub
      ? `Delete "${cat.name}" sub-category and its ${getProductCount(cat._id)} product(s)?`
      : subCount > 0
        ? `Delete "${cat.name}" category, ${subCount} sub-categor${subCount === 1 ? "y" : "ies"}, and ${totalProducts} product(s)?`
        : `Delete "${cat.name}" category and its ${totalProducts} product(s)?`;

    if (!window.confirm(message)) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/category/delete-category/${cat._id}`,
        { method: "DELETE", credentials: "include" }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Deleted!");
        fetchData();
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function toggleActive(cat) {
    try {
      const formData = new FormData();
      formData.append("isActive", !cat.isActive);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/category/update-category/${cat._id}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success(
          `${cat.parentId ? "Sub-category" : "Category"} ${!cat.isActive ? "activated" : "deactivated"}`
        );
        setCategories(
          categories.map((c) =>
            c._id === cat._id ? { ...c, isActive: !cat.isActive } : c
          )
        );
      } else {
        toast.error(data.message || "Failed to update");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  function toggleExpand(id) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  // Filter
  const filtered = topLevel
    .filter((cat) => {
      if (filter === "active") return cat.isActive !== false;
      if (filter === "inactive") return cat.isActive === false;
      return true;
    })
    .filter((cat) => {
      const searchLower = search.toLowerCase();
      // Search in parent name or any sub-category name
      if (cat.name.toLowerCase().includes(searchLower)) return true;
      const subs = getSubCategories(cat._id);
      return subs.some((s) => s.name.toLowerCase().includes(searchLower));
    });

  if (loading) {
    return (
      <div className="max-w-6xl animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-gray-100" />
          <div className="h-6 w-32 bg-gray-100 rounded" />
        </div>
        <div className="flex gap-3 mb-4">
          <div className="h-9 flex-1 bg-gray-100 rounded-lg" />
          <div className="h-9 w-28 bg-gray-100 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {[...Array(5)].map((_, r) => (
            <div key={r} className="flex gap-4 px-5 py-4 border-b border-gray-50 items-center">
              <div className="h-10 w-10 bg-gray-100 rounded-xl flex-shrink-0" />
              <div className="h-4 bg-gray-100 rounded flex-1" />
              <div className="h-3 w-16 bg-gray-50 rounded" />
              <div className="h-3 w-12 bg-gray-50 rounded" />
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
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
            <FolderOpen className="h-[18px] w-[18px] text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Categories</h2>
            <p className="text-[11px] text-gray-400">
              {topLevel.length} categories · {categories.length - topLevel.length} sub-categories
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ name: "", image: null, parentId: null });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Category
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "inactive", label: "Inactive" },
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
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
        </div>
      </div>

      {/* Categories Tree */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FolderOpen className="h-10 w-10 mx-auto mb-3 text-gray-200" />
          <p className="text-sm font-medium">No categories found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((cat) => {
            const subs = getSubCategories(cat._id);
            const totalCount = getTotalProductCount(cat._id);
            const isActive = cat.isActive !== false;
            const isExpanded = expanded[cat._id] || false;
            const hasSubs = subs.length > 0;

            return (
              <div key={cat._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Parent Category Row */}
                <div
                  className={`flex items-center gap-4 px-4 py-3 transition-all ${!isActive ? "opacity-50" : ""
                    }`}
                >
                  {/* Expand toggle */}
                  <button
                    onClick={() => hasSubs && toggleExpand(cat._id)}
                    className={`p-1 rounded-md transition-colors ${hasSubs
                      ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                      : "text-gray-200 cursor-default"
                      }`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {/* Image */}
                  <div className="h-12 w-12 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FolderOpen className="h-5 w-5 text-gray-200" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 capitalize truncate">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {totalCount} product{totalCount !== 1 ? "s" : ""}
                      {hasSubs && ` · ${subs.length} sub-categor${subs.length === 1 ? "y" : "ies"}`}
                    </p>
                  </div>

                  {/* Status badge */}
                  {!isActive && (
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                      Inactive
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {/* Add sub-category */}
                    <button
                      onClick={() => {
                        setEditing(null);
                        setForm({ name: "", image: null, parentId: cat._id });
                        setShowModal(true);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      title="Add sub-category"
                    >
                      <FolderTree className="h-3.5 w-3.5" />
                    </button>
                    {/* Toggle active */}
                    <button
                      onClick={() => toggleActive(cat)}
                      className={`p-1.5 rounded-lg transition-colors ${isActive
                        ? "text-emerald-500 hover:bg-emerald-50"
                        : "text-gray-300 hover:bg-gray-50"
                        }`}
                      title={isActive ? "Deactivate" : "Activate"}
                    >
                      {isActive ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => {
                        setEditing(cat);
                        setForm({ name: cat.name, image: null, parentId: cat.parentId || null });
                        setShowModal(true);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-categories */}
                {hasSubs && isExpanded && (
                  <div className="border-t border-gray-50 bg-gray-50/50">
                    {subs.map((sub) => {
                      const subCount = getProductCount(sub._id);
                      const subActive = sub.isActive !== false;
                      return (
                        <div
                          key={sub._id}
                          className={`flex items-center gap-4 px-4 py-2.5 pl-14 border-b border-gray-50 last:border-b-0 ${!subActive ? "opacity-50" : ""
                            }`}
                        >
                          {/* Image */}
                          <div className="h-9 w-9 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-gray-100">
                            {sub.image ? (
                              <img
                                src={sub.image}
                                alt={sub.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FolderOpen className="h-4 w-4 text-gray-200" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-gray-700 capitalize truncate">
                              {sub.name}
                            </h4>
                            <p className="text-[10px] text-gray-400">
                              {subCount} product{subCount !== 1 ? "s" : ""}
                            </p>
                          </div>

                          {/* Status badge */}
                          {!subActive && (
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              Inactive
                            </span>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleActive(sub)}
                              className={`p-1 rounded-md transition-colors ${subActive
                                ? "text-emerald-500 hover:bg-emerald-50"
                                : "text-gray-300 hover:bg-gray-50"
                                }`}
                            >
                              {subActive ? (
                                <ToggleRight className="h-3.5 w-3.5" />
                              ) : (
                                <ToggleLeft className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setEditing(sub);
                                setForm({
                                  name: sub.name,
                                  image: null,
                                  parentId: sub.parentId?._id || sub.parentId || cat._id,
                                });
                                setShowModal(true);
                              }}
                              className="p-1 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(sub)}
                              className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                  {editing
                    ? form.parentId
                      ? "Edit Sub-Category"
                      : "Edit Category"
                    : form.parentId
                      ? "New Sub-Category"
                      : "New Category"}
                </h3> 
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                {/* Parent category selector */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Parent Category
                  </label>
                  <select
                    value={form.parentId || ""}
                    onChange={(e) =>
                      setForm({ ...form, parentId: e.target.value || null })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
                  >
                    <option value="">None (Top-level category)</option>
                    {topLevel.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {form.parentId && (
                    <p className="text-[10px] text-amber-600 mt-1">
                      This will be a sub-category under "{topLevel.find((c) => c._id === form.parentId)?.name}"
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder={form.parentId ? "e.g. Smartphones" : "e.g. Electronics"}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Image
                  </label>
                  <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-colors">
                    <Upload className="h-5 w-5 text-gray-300 mb-1" />
                    <span className="text-xs text-gray-400">
                      {form.image
                        ? form.image.name
                        : editing
                          ? "Upload new image (optional)"
                          : "Click to upload"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setForm({ ...form, image: e.target.files[0] })
                      }
                    />
                  </label>
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
                  {saving
                    ? "Saving..."
                    : editing
                      ? "Update"
                      : "Create"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminCategories;
