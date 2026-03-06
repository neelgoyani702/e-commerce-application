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
  Package,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, inactive
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", image: null });
  const [saving, setSaving] = useState(false);

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

  function getProductCount(categoryId) {
    return products.filter(
      (p) =>
        p.category === categoryId ||
        p.category?._id === categoryId
    ).length;
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
        setForm({ name: "", image: null });
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

  async function handleDelete(id) {
    if (!window.confirm("Delete this category and all its products?")) return;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/category/delete-category/${id}`,
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
          `Category ${!cat.isActive ? "activated" : "deactivated"}`
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

  const filtered = categories
    .filter((cat) => {
      if (filter === "active") return cat.isActive !== false;
      if (filter === "inactive") return cat.isActive === false;
      return true;
    })
    .filter((cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
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
              {categories.length} categories
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ name: "", image: null });
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

      {/* Categories Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FolderOpen className="h-10 w-10 mx-auto mb-3 text-gray-200" />
          <p className="text-sm font-medium">No categories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cat) => {
            const count = getProductCount(cat._id);
            const isActive = cat.isActive !== false;
            return (
              <div
                key={cat._id}
                className={`bg-white rounded-xl border border-gray-100 overflow-hidden transition-all hover:shadow-md ${!isActive ? "opacity-50" : ""
                  }`}
              >
                {/* Image */}
                <div className="relative h-36 bg-gray-50">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderOpen className="h-10 w-10 text-gray-200" />
                    </div>
                  )}
                  {/* Inactive overlay */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
                      <span className="text-xs font-bold text-white bg-gray-900/60 px-3 py-1 rounded-full">
                        Inactive
                      </span>
                    </div>
                  )}
                  {/* Product count badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Package className="h-3 w-3 text-gray-500" />
                    {count}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 capitalize">
                        {cat.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {count} product{count !== 1 ? "s" : ""} ·{" "}
                        Created{" "}
                        {new Date(cat.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    {/* isActive toggle */}
                    <button
                      onClick={() => toggleActive(cat)}
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold py-1 px-2 rounded-md transition-colors ${isActive
                        ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                        : "text-gray-400 bg-gray-50 hover:bg-gray-100"
                        }`}
                    >
                      {isActive ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                      {isActive ? "Active" : "Inactive"}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditing(cat);
                          setForm({ name: cat.name, image: null });
                          setShowModal(true);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
                  {editing ? "Edit Category" : "New Category"}
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
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="e.g. Electronics"
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
