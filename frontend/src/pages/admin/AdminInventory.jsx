import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Package,
  Search,
  RefreshCw,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Save,
  X,
} from "lucide-react";

function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("stock-asc");
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const fetchLowStock = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/low-stock?threshold=${threshold}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products || []);
      } else {
        toast.error(data.message || "Failed to fetch inventory");
      }
    } catch {
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  }, [threshold]);

  useEffect(() => {
    fetchLowStock();
  }, [fetchLowStock]);

  const handleUpdateStock = async (productId) => {
    const newStock = parseInt(editStock);
    if (isNaN(newStock) || newStock < 0) {
      toast.error("Please enter a valid stock number");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/product/${productId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ stock: newStock }),
        }
      );
      if (response.ok) {
        toast.success("Stock updated successfully!");
        setEditingId(null);
        setEditStock("");
        fetchLowStock();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to update stock");
      }
    } catch {
      toast.error("Error updating stock");
    }
  };

  const filtered = products
    .filter((p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "stock-asc") return a.stock - b.stock;
      if (sortBy === "stock-desc") return b.stock - a.stock;
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });

  const outOfStock = products.filter((p) => p.stock === 0).length;
  const criticalStock = products.filter(
    (p) => p.stock > 0 && p.stock <= 2
  ).length;
  const lowStock = products.filter(
    (p) => p.stock > 2 && p.stock <= threshold
  ).length;

  return (
    <div className="max-w-7xl space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" /> Inventory
            Alerts
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor stock levels and restock products before they run out.
          </p>
        </div>
        <button
          onClick={fetchLowStock}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />{" "}
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <X className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-red-700">
                {outOfStock}
              </p>
              <p className="text-xs text-red-500 font-medium">Out of Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-amber-700">
                {criticalStock}
              </p>
              <p className="text-xs text-amber-500 font-medium">
                Critical (1-2)
              </p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-yellow-700">
                {lowStock}
              </p>
              <p className="text-xs text-yellow-500 font-medium">
                Low (3-{threshold})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Row */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
        </div>

        {/* Threshold */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-semibold text-gray-500">
            Threshold:
          </label>
          <select
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {[3, 5, 10, 15, 20, 50].map((t) => (
              <option key={t} value={t}>
                ≤ {t}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 shrink-0">
          <ArrowUpDown className="h-4 w-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="stock-asc">Stock: Low → High</option>
            <option value="stock-desc">Stock: High → Low</option>
            <option value="name-asc">Name: A → Z</option>
            <option value="name-desc">Name: Z → A</option>
          </select>
        </div>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse flex items-center gap-4"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-gray-100 rounded" />
                <div className="h-3 w-24 bg-gray-50 rounded" />
              </div>
              <div className="h-8 w-16 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">
            {searchTerm
              ? "No products match your search"
              : "All products are well-stocked! 🎉"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div className="flex items-center gap-4 p-4">
                {/* Image */}
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-14 h-14 rounded-lg object-cover bg-gray-50 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    <Package className="h-6 w-6 text-gray-300" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 capitalize truncate">
                    {product.name}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {product.category?.name || "Uncategorized"} ·{" "}
                    ₹{product.price?.toLocaleString()}
                  </p>
                </div>

                {/* Stock Badge + Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {editingId === product._id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editStock}
                        onChange={(e) => setEditStock(e.target.value)}
                        className="w-20 px-3 py-1.5 text-sm rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        min="0"
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdateStock(product._id)}
                        className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Save className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditStock("");
                        }}
                        className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span
                        className={`text-sm font-black px-3 py-1.5 rounded-lg cursor-pointer hover:scale-105 transition-transform ${
                          product.stock === 0
                            ? "bg-red-50 text-red-600"
                            : product.stock <= 2
                            ? "bg-amber-50 text-amber-600"
                            : "bg-yellow-50 text-yellow-600"
                        }`}
                        onClick={() => {
                          setEditingId(product._id);
                          setEditStock(String(product.stock));
                        }}
                        title="Click to edit stock"
                      >
                        {product.stock === 0 ? "OUT" : product.stock}
                      </span>
                    </>
                  )}

                  {/* Expand for variants */}
                  {product.variants?.length > 0 && (
                    <button
                      onClick={() =>
                        setExpandedId(
                          expandedId === product._id ? null : product._id
                        )
                      }
                      className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {expandedId === product._id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Variant Stock Breakdown */}
              {expandedId === product._id &&
                product.variants?.length > 0 && (
                  <div className="border-t border-gray-50 px-4 py-3 bg-gray-50/50">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">
                      Variant Stock
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {product.variants.map((v) => (
                        <div
                          key={v._id}
                          className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100"
                        >
                          <span className="text-xs text-gray-600 truncate">
                            {v.color || v.size || "Variant"}
                            {v.size && v.color
                              ? ` — ${v.size}`
                              : ""}
                          </span>
                          <span
                            className={`text-xs font-bold ml-2 ${
                              v.stock === 0
                                ? "text-red-500"
                                : v.stock <= 2
                                ? "text-amber-500"
                                : "text-gray-700"
                            }`}
                          >
                            {v.stock}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminInventory;
