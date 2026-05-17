import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { CompareContext } from "../../context/CompareProvider";
import { SettingsContext } from "../../context/SettingsProvider";
import {
  GitCompareArrows,
  X,
  Star,
  Package,
  ShoppingBag,
  ArrowRight,
  Trash2,
} from "lucide-react";

function CompareProducts() {
  const { compareList, removeFromCompare, clearCompare } = useContext(CompareContext);
  const { settings } = useContext(SettingsContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      if (compareList.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/product/get-products`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );
        const data = await response.json();
        if (response.ok && data.products) {
          const filtered = data.products.filter((p) =>
            compareList.includes(p._id)
          );
          setProducts(filtered);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [compareList]);

  const currency = settings?.currencySymbol || "₹";

  const getDiscountedPrice = (p) =>
    p.discount > 0 ? Math.round(p.price - (p.price * p.discount) / 100) : p.price;

  const lowestPrice =
    products.length > 0
      ? Math.min(...products.map(getDiscountedPrice))
      : 0;

  const rows = [
    {
      label: "Image",
      render: (p) => (
        <img
          src={p.images?.[0] || p.image}
          alt={p.name}
          className="w-28 h-28 object-cover rounded-xl mx-auto"
        />
      ),
    },
    {
      label: "Name",
      render: (p) => (
        <Link
          to={`/product/${p._id}`}
          className="text-sm font-semibold text-gray-900 hover:text-store-primary transition-colors capitalize"
        >
          {p.name}
        </Link>
      ),
    },
    {
      label: "Price",
      render: (p) => {
        const discounted = getDiscountedPrice(p);
        const isBest = discounted === lowestPrice && products.length > 1;
        return (
          <div className="flex flex-col items-center gap-1">
            <span className={`font-bold text-lg ${isBest ? "text-emerald-600" : "text-gray-900"}`}>
              {currency}{discounted.toLocaleString()}
            </span>
            {p.discount > 0 && (
              <span className="text-xs text-gray-400 line-through">
                {currency}{p.price.toLocaleString()}
              </span>
            )}
            {isBest && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Best Price
              </span>
            )}
          </div>
        );
      },
    },
    {
      label: "Discount",
      render: (p) =>
        p.discount > 0 ? (
          <span className="text-sm font-semibold text-red-500">{p.discount}% OFF</span>
        ) : (
          <span className="text-sm text-gray-300">—</span>
        ),
    },
    {
      label: "Category",
      render: (p) => (
        <span className="text-sm text-gray-600 capitalize">
          {p.category?.name || "—"}
        </span>
      ),
    },
    {
      label: "Rating",
      render: (p) =>
        p.reviewCount > 0 ? (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3.5 w-3.5 ${
                    s <= Math.round(p.avgRating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">
              {p.avgRating?.toFixed(1)} ({p.reviewCount})
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-300">No reviews</span>
        ),
    },
    {
      label: "Stock",
      render: (p) =>
        p.stock > 0 ? (
          <span className={`text-sm font-medium ${p.stock <= 5 ? "text-amber-500" : "text-emerald-600"}`}>
            {p.stock <= 5 ? `Only ${p.stock} left` : "In Stock"}
          </span>
        ) : (
          <span className="text-sm font-medium text-red-500">Out of Stock</span>
        ),
    },
    {
      label: "Description",
      render: (p) => (
        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
          {p.description}
        </p>
      ),
    },
    {
      label: "Actions",
      render: (p) => (
        <div className="flex flex-col items-center gap-2">
          <Link
            to={`/product/${p._id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-lg bg-store-gradient hover:opacity-90 transition-all"
          >
            <ShoppingBag className="h-3 w-3" />
            View Product
          </Link>
          <button
            onClick={() => removeFromCompare(p._id)}
            className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
          >
            <X className="h-3 w-3" />
            Remove
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="md:mt-16 mt-32 min-h-screen bg-gray-50/50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-store-primary/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-14 md:py-18">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-gray-600">/</span>
            <Link to="/products" className="hover:text-white transition-colors">Products</Link>
            <span className="text-gray-600">/</span>
            <span className="text-store-primary font-medium">Compare</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-store-gradient flex items-center justify-center shadow-lg">
              <GitCompareArrows className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Compare Products
              </h1>
              <p className="text-gray-400 mt-1">
                {products.length} product{products.length !== 1 ? "s" : ""} selected (max 4)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-store-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-300" />
            </div>
            <h2 className="text-lg font-semibold text-gray-600 mb-1">No products to compare</h2>
            <p className="text-gray-400 text-sm mb-6">
              Add products to compare by clicking the compare icon on product cards
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-store-primary hover:opacity-80 transition-all"
            >
              Browse Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Clear All */}
            <div className="flex justify-end mb-4">
              <button
                onClick={clearCompare}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all"
              >
                <Trash2 className="h-3 w-3" />
                Clear All
              </button>
            </div>

            {/* Compare Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full">
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={row.label}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                    >
                      <td className="py-4 px-5 text-xs font-bold text-gray-400 uppercase tracking-wider w-28 border-r border-gray-100 align-middle">
                        {row.label}
                      </td>
                      {products.map((p) => (
                        <td
                          key={p._id}
                          className="py-4 px-5 text-center align-middle border-r border-gray-50 last:border-r-0"
                          style={{ minWidth: "180px" }}
                        >
                          {row.render(p)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CompareProducts;
