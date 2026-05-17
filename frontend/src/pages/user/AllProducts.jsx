import React, { useState, useEffect, useContext } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowUpDown,
  SlidersHorizontal,
  Package,
  X,
  ShoppingBag,
  Search,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import ProductCard from "../../components/ProductCard";
import { SkeletonCard } from "../../components/SkeletonCard";
import { AuthContext } from "../../context/AuthProvider";

function AllProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userWishlist, setUserWishlist] = useState([]);

  // Fetch wishlist
  useEffect(() => {
    if (!user) return;
    async function fetchWishlist() {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/user/wishlist`,
          { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" }
        );
        const data = await response.json();
        if (response.ok && data.wishlist) {
          setUserWishlist(data.wishlist.map(p => p._id || p));
        }
      } catch (error) { /* silent */ }
    }
    fetchWishlist();
  }, [user]);

  const handleWishlistToggle = (productId, action) => {
    setUserWishlist(prev =>
      action === "added" ? [...prev, productId] : prev.filter(id => id !== productId)
    );
  };

  // Filters from URL params
  const selectedCategory = searchParams.get("category") || "all";
  const sortBy = searchParams.get("sort") || "newest";
  const searchQuery = searchParams.get("q") || "";

  // Fetch all products
  async function getProducts() {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/product/get-products`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (response.ok && data.products) {
        setAllProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  }

  // Fetch categories for filter
  async function getCategories() {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/category/get-category?active=true`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (response.ok && data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  // Apply filters & sorting
  useEffect(() => {
    let filtered = [...allProducts];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(
        (p) => p.category?._id === selectedCategory || p.category?.name === selectedCategory
      );
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    setProducts(filtered);
    setLoading(false);
  }, [allProducts, selectedCategory, sortBy, searchQuery]);

  // Initial fetch
  useEffect(() => {
    getProducts();
    getCategories();
  }, []);

  // Update URL params
  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all" && value !== "newest" && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = selectedCategory !== "all" || sortBy !== "newest" || searchQuery;

  // Find selected category name for display
  const selectedCategoryName = categories.find(c => c._id === selectedCategory)?.name;

  return (
    <div className="md:mt-16 mt-32 min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-store-primary/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-store-primary/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-20">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-gray-600">/</span>
            <span className="text-store-primary font-medium">
              {searchQuery ? `Search: "${searchQuery}"` : "All Products"}
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-store-gradient flex items-center justify-center shadow-lg shadow-store-primary">
                <ShoppingBag className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  {searchQuery ? `Results for "${searchQuery}"` : "All Products"}
                </h1>
                <p className="text-gray-400 mt-1">
                  {loading
                    ? "Loading..."
                    : `${products.length} product${products.length !== 1 ? "s" : ""} found`}
                </p>
              </div>
            </div>

            {/* Search in hero */}
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                defaultValue={searchQuery}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateFilter("q", e.target.value);
                  }
                }}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-store-primary focus:border-store-primary/50 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Controls + Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <p className="text-gray-400 text-sm font-medium">
              {selectedCategoryName
                ? `Filtered by: ${selectedCategoryName}`
                : `Showing ${products.length} product${products.length !== 1 ? "s" : ""}`}
            </p>
            {/* Active filter chips */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-store-primary-light text-store-primary-dark px-3 py-1 rounded-full hover:bg-store-primary-light transition-colors"
              >
                <X className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>

          <div className="flex gap-3 items-center flex-wrap">
            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={(val) => updateFilter("category", val)}
            >
              <SelectTrigger className="w-[160px] rounded-xl border-gray-200 bg-white">
                <SlidersHorizontal className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Category</SelectLabel>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      <span className="capitalize">{cat.name}</span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={sortBy}
              onValueChange={(val) => updateFilter("sort", val)}
            >
              <SelectTrigger className="w-[170px] rounded-xl border-gray-200 bg-white">
                <ArrowUpDown className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sort By</SelectLabel>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low → High</SelectItem>
                  <SelectItem value="price-high">Price: High → Low</SelectItem>
                  <SelectItem value="name-asc">Name: A → Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z → A</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-12">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-12">
            {products.map((product, i) => (
              <div key={product._id} className={`animate-fade-in-up animation-delay-${(i % 4) * 100}`}>
                <ProductCard product={product} wishlist={userWishlist} onWishlistToggle={handleWishlistToggle} />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-300" />
            </div>
            <h2 className="text-lg font-semibold text-gray-600 mb-1">No products found</h2>
            <p className="text-gray-400 text-sm mb-6">
              {searchQuery
                ? `No products match "${searchQuery}"`
                : "Try adjusting your filters"}
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 text-sm font-semibold text-store-primary-dark hover:text-store-primary transition-colors"
            >
              Clear Filters →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllProducts;
