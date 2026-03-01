import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  X,
  Upload,
  Pencil,
  Trash2,
  Package,
  Star,
  Eye,
  CheckSquare,
  Square,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
} from "lucide-react";

const PAGE_SIZES = [10, 25, 50];

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  // Price range filter
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    bulletPoints: [""],
    image: null,
    stock: "",
    discount: "",
    featured: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, filterCategory, priceMin, priceMax, pageSize]);

  async function fetchData() {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/product/get-products`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }),
        fetch(`${process.env.REACT_APP_API_URL}/category/get-category`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      if (prodRes.ok) setProducts(prodData.products || []);
      if (catRes.ok) setCategories(catData.categories || []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      price: "",
      category: categories[0]?.name || "",
      bulletPoints: [""],
      image: null,
      stock: "",
      discount: "",
      featured: false,
    });
    setShowModal(true);
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      category: product.category?.name || product.category || "",
      bulletPoints:
        product.bulletPoints?.length > 0 ? product.bulletPoints : [""],
      image: null,
      stock: product.stock ?? "",
      discount: product.discount ?? "",
      featured: product.featured || false,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.price || Number(form.price) <= 0)
      return toast.error("Valid price is required");
    if (!form.category) return toast.error("Category is required");
    if (!editing && !form.image) return toast.error("Image is required");

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description?.trim() || "");
      formData.append("price", form.price);
      formData.append("category", form.category.toLowerCase());
      formData.append("stock", form.stock || 0);
      formData.append("discount", form.discount || 0);
      formData.append("featured", form.featured);
      const bp = form.bulletPoints.filter((b) => b.trim());
      if (bp.length) formData.append("bulletPoints", JSON.stringify(bp));
      if (form.image) formData.append("productImage", form.image);

      const url = editing
        ? `${process.env.REACT_APP_API_URL}/product/update-product/${editing._id}`
        : `${process.env.REACT_APP_API_URL}/product/create-product`;

      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
        credentials: "include",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Saved!");
        setShowModal(false);
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
    if (!window.confirm("Delete this product?")) return;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/product/delete-product/${id}`,
        { method: "DELETE", credentials: "include" }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Deleted!");
        setSelectedIds(selectedIds.filter((s) => s !== id));
        fetchData();
      } else {
        toast.error(data.message || "Failed");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected products?`))
      return;
    const toastId = toast.loading(`Deleting ${selectedIds.length} products...`);
    let success = 0;
    for (const id of selectedIds) {
      try {
        const r = await fetch(
          `${process.env.REACT_APP_API_URL}/product/delete-product/${id}`,
          { method: "DELETE", credentials: "include" }
        );
        if (r.ok) success++;
      } catch { }
    }
    toast.dismiss(toastId);
    toast.success(`Deleted ${success} of ${selectedIds.length} products`);
    setSelectedIds([]);
    fetchData();
  }

  async function handleBulkFeatured() {
    if (selectedIds.length === 0) return;
    const toastId = toast.loading("Updating featured status...");
    let success = 0;
    for (const id of selectedIds) {
      try {
        const formData = new FormData();
        formData.append("featured", "true");
        const r = await fetch(
          `${process.env.REACT_APP_API_URL}/product/update-product/${id}`,
          { method: "PUT", credentials: "include", body: formData }
        );
        if (r.ok) success++;
      } catch { }
    }
    toast.dismiss(toastId);
    toast.success(`Marked ${success} products as featured`);
    setSelectedIds([]);
    fetchData();
  }

  // Filtered, sorted, paginated
  const processed = useMemo(() => {
    let result = [...products];

    // Category filter
    if (filterCategory !== "all") {
      result = result.filter(
        (p) => (p.category?.name || p.category) === filterCategory
      );
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Price range
    if (priceMin !== "") {
      result = result.filter((p) => (p.price || 0) >= Number(priceMin));
    }
    if (priceMax !== "") {
      result = result.filter((p) => (p.price || 0) <= Number(priceMax));
    }

    // Sorting
    result.sort((a, b) => {
      let valA, valB;
      switch (sortField) {
        case "name":
          return sortDir === "asc"
            ? (a.name || "").localeCompare(b.name || "")
            : (b.name || "").localeCompare(a.name || "");
        case "price":
          valA = a.price || 0;
          valB = b.price || 0;
          break;
        case "stock":
          valA = a.stock ?? 0;
          valB = b.stock ?? 0;
          break;
        case "category":
          return sortDir === "asc"
            ? (a.category?.name || "").localeCompare(b.category?.name || "")
            : (b.category?.name || "").localeCompare(a.category?.name || "");
        default:
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
      }
      return sortDir === "asc" ? valA - valB : valB - valA;
    });

    return result;
  }, [products, filterCategory, search, priceMin, priceMax, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const paginated = processed.slice((page - 1) * pageSize, page * pageSize);

  function toggleSelect(id) {
    setSelectedIds(
      selectedIds.includes(id)
        ? selectedIds.filter((s) => s !== id)
        : [...selectedIds, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === paginated.length && paginated.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map((p) => p._id));
    }
  }

  function handleSort(field) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
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
      "Name",
      "Category",
      "Price",
      "Stock",
      "Discount (%)",
      "Featured",
    ];
    const rows = processed.map((p) => [
      `"${p.name}"`,
      p.category?.name || p.category || "",
      p.price,
      p.stock ?? 0,
      p.discount || 0,
      p.featured ? "Yes" : "No",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Products exported");
  }

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
          <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
            <Package className="h-[18px] w-[18px] text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Products</h2>
            <p className="text-[11px] text-gray-400">
              {products.length} products
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 mb-4 flex items-center justify-between animate-fade-in">
          <span className="text-xs font-semibold text-indigo-700">
            {selectedIds.length} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkFeatured}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Star className="h-3 w-3" />
              Set Featured
            </button>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-[11px] font-medium text-gray-400 hover:text-gray-600 px-2 py-1.5 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <IndianRupee className="h-3 w-3" />
          Price:
        </span>
        <input
          type="number"
          placeholder="Min"
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
          className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <span className="text-xs text-gray-300">–</span>
        <input
          type="number"
          placeholder="Max"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        {(priceMin || priceMax) && (
          <button
            onClick={() => {
              setPriceMin("");
              setPriceMax("");
            }}
            className="text-[11px] text-gray-400 hover:text-gray-600 font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {/* Products Table */}
      {paginated.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package className="h-10 w-10 mx-auto mb-3 text-gray-200" />
          <p className="text-sm font-medium">No products found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider bg-gray-50/50">
                  <th className="px-4 py-3 w-10">
                    <button onClick={toggleSelectAll}>
                      {selectedIds.length === paginated.length &&
                        paginated.length > 0 ? (
                        <CheckSquare className="h-4 w-4 text-indigo-600" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-300" />
                      )}
                    </button>
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer select-none hover:text-gray-600"
                    onClick={() => handleSort("name")}
                  >
                    <span className="inline-flex items-center">
                      Product
                      <SortIcon field="name" />
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer select-none hover:text-gray-600"
                    onClick={() => handleSort("category")}
                  >
                    <span className="inline-flex items-center">
                      Category
                      <SortIcon field="category" />
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer select-none hover:text-gray-600"
                    onClick={() => handleSort("price")}
                  >
                    <span className="inline-flex items-center">
                      Price
                      <SortIcon field="price" />
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer select-none hover:text-gray-600"
                    onClick={() => handleSort("stock")}
                  >
                    <span className="inline-flex items-center">
                      Stock
                      <SortIcon field="stock" />
                    </span>
                  </th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((product) => (
                  <tr
                    key={product._id}
                    className={`hover:bg-indigo-50/30 transition-colors ${selectedIds.includes(product._id)
                        ? "bg-indigo-50/20"
                        : ""
                      }`}
                  >
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(product._id)}>
                        {selectedIds.includes(product._id) ? (
                          <CheckSquare className="h-4 w-4 text-indigo-600" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-50"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                            <Package className="h-4 w-4 text-gray-300" />
                          </div>
                        )}
                        <span className="text-xs font-semibold text-gray-900 capitalize truncate max-w-[160px]">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 capitalize">
                      {product.category?.name || product.category || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-900">
                      ₹{product.price?.toLocaleString()}
                      {product.discount > 0 && (
                        <span className="ml-1 text-[10px] font-semibold text-emerald-600">
                          -{product.discount}%
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold ${product.stock === 0
                            ? "text-red-500"
                            : product.stock <= 5
                              ? "text-amber-500"
                              : "text-gray-900"
                          }`}
                      >
                        {product.stock ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {product.featured ? (
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      ) : (
                        <span className="text-gray-200">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* Product Detail Drawer */}
      {selectedProduct && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setSelectedProduct(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                Product Details
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    openEdit(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {selectedProduct.image && (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-52 object-cover rounded-xl bg-gray-50"
                />
              )}
              <div>
                <h4 className="text-lg font-bold text-gray-900 capitalize">
                  {selectedProduct.name}
                </h4>
                {selectedProduct.description && (
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">
                    Price
                  </p>
                  <p className="text-sm font-bold text-gray-900 flex items-center justify-center">
                    <IndianRupee className="h-3.5 w-3.5" />
                    {selectedProduct.price?.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">
                    Stock
                  </p>
                  <p
                    className={`text-sm font-bold ${(selectedProduct.stock ?? 0) === 0
                        ? "text-red-500"
                        : "text-gray-900"
                      }`}
                  >
                    {selectedProduct.stock ?? 0}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">
                    Discount
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedProduct.discount || 0}%
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Category</span>
                  <span className="font-medium text-gray-700 capitalize">
                    {selectedProduct.category?.name ||
                      selectedProduct.category ||
                      "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Featured</span>
                  <span className="font-medium text-gray-700">
                    {selectedProduct.featured ? (
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400 inline" />
                    ) : (
                      "No"
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Created</span>
                  <span className="font-medium text-gray-700">
                    {new Date(selectedProduct.createdAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>
              {selectedProduct.bulletPoints?.length > 0 && (
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2">
                    Highlights
                  </p>
                  <ul className="space-y-1.5">
                    {selectedProduct.bulletPoints.map((bp, i) => (
                      <li
                        key={i}
                        className="text-xs text-gray-600 flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 flex-shrink-0" />
                        {bp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">
                  {editing ? "Edit Product" : "New Product"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                      Price *
                    </label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) =>
                        setForm({ ...form, stock: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                      Discount %
                    </label>
                    <input
                      type="number"
                      value={form.discount}
                      onChange={(e) =>
                        setForm({ ...form, discount: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm({ ...form, featured: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="featured"
                    className="text-xs font-semibold text-gray-700"
                  >
                    Featured product
                  </label>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Image {!editing && "*"}
                  </label>
                  <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-colors">
                    <Upload className="h-5 w-5 text-gray-300 mb-1" />
                    <span className="text-xs text-gray-400">
                      {form.image
                        ? form.image.name
                        : editing
                          ? "Replace image (optional)"
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
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Bullet Points
                  </label>
                  {form.bulletPoints.map((bp, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={bp}
                        onChange={(e) => {
                          const updated = [...form.bulletPoints];
                          updated[i] = e.target.value;
                          setForm({ ...form, bulletPoints: updated });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                        placeholder={`Point ${i + 1}`}
                      />
                      {form.bulletPoints.length > 1 && (
                        <button
                          onClick={() =>
                            setForm({
                              ...form,
                              bulletPoints: form.bulletPoints.filter(
                                (_, j) => j !== i
                              ),
                            })
                          }
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setForm({
                        ...form,
                        bulletPoints: [...form.bulletPoints, ""],
                      })
                    }
                    className="text-[11px] text-indigo-600 font-semibold hover:text-indigo-500"
                  >
                    + Add point
                  </button>
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

      {/* Animations */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.25s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default AdminProducts;
