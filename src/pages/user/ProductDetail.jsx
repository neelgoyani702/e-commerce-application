import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Heart, Star, ShoppingCart, ChevronRight, Truck, ShieldCheck, RotateCcw, Check, AlertTriangle, XCircle } from "lucide-react";
import AddToCart from "../../components/AddToCart";
import { SettingsContext } from "../../context/SettingsProvider";
import { AuthContext } from "../../context/AuthProvider";
import ProductCard from "../../components/ProductCard";
import { SkeletonProductDetail } from "../../components/SkeletonCard";
import { addToRecentlyViewed, getRecentlyViewedIds } from "../../hooks/useRecentlyViewed";

function ProductDetail() {
  const { productId } = useParams();
  const { settings } = useContext(SettingsContext);
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [userWishlist, setUserWishlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [reviewDistribution, setReviewDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [showAllReviews, setShowAllReviews] = useState(false);

  const currencySymbol = settings?.currencySymbol || '₹';

  // Check if product is in user's wishlist
  useEffect(() => {
    if (!user || !productId) return;
    async function checkWishlist() {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/user/wishlist`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const data = await response.json();
        if (response.ok && data.wishlist) {
          const ids = data.wishlist.map(p => p._id || p);
          setUserWishlist(ids);
          setWishlisted(ids.includes(productId));
        }
      } catch (error) {
        // Silent fail for wishlist check
      }
    }
    checkWishlist();
  }, [user, productId]);

  const toggleWishlist = async () => {
    if (!user) {
      toast.error("Please login to add to wishlist");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/user/wishlist/${productId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        setWishlisted(data.action === "added");
        setUserWishlist(prev =>
          data.action === "added"
            ? [...prev, productId]
            : prev.filter(id => id !== productId)
        );
        toast.success(data.message);
      } else {
        toast.error(data.message || "Failed to update wishlist");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  // Fetch reviews for this product
  async function fetchReviews() {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/review/${productId}`
      );
      const data = await response.json();
      if (response.ok) {
        setReviews(data.reviews || []);
        setReviewStats(data.stats || { averageRating: 0, totalReviews: 0 });
        setReviewDistribution(data.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
      }
    } catch (error) {
      // silent
    }
  }

  async function getProduct() {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/product/get-product/${productId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to fetch product");
        return;
      }
      if (data.product) {
        setProduct(data.product);
        setSelectedImageIndex(0);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getProduct();
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Fetch related products + track recently viewed
  useEffect(() => {
    if (!productId) return;

    // Track recently viewed
    addToRecentlyViewed(productId);

    // Fetch related products
    async function fetchRelated() {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/product/get-product/${productId}/related`
        );
        const data = await response.json();
        if (response.ok) {
          setRelatedProducts(data.products || []);
        }
      } catch (error) {
        // Silent fail
      }
    }

    // Fetch recently viewed products
    async function fetchRecentlyViewed() {
      const ids = getRecentlyViewedIds().filter(id => id !== productId);
      if (ids.length === 0) {
        setRecentlyViewed([]);
        return;
      }
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/product/get-products`
        );
        const data = await response.json();
        if (response.ok && data.products) {
          const recentProducts = ids
            .map(id => data.products.find(p => p._id === id))
            .filter(Boolean)
            .slice(0, 4);
          setRecentlyViewed(recentProducts);
        }
      } catch (error) {
        // Silent fail
      }
    }

    fetchRelated();
    fetchRecentlyViewed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  if (loading) {
    return <SkeletonProductDetail />;
  }

  if (!product) {
    return (
      <div className="md:mt-16 mt-32 min-h-screen bg-gray-50/50 flex flex-col items-center justify-center py-32">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
          <ShoppingCart className="h-8 w-8 text-gray-300" />
        </div>
        <h2 className="text-lg font-semibold text-gray-600 mb-1">Product not found</h2>
        <p className="text-gray-400 text-sm mb-4">This product may have been removed</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-store-primary-dark hover:text-store-primary transition-colors"
        >
          Browse all products →
        </Link>
      </div>
    );
  }

  const hasVariants = product.variants?.length > 0;
  const uniqueColors = hasVariants ? [...new Map(product.variants.filter(v => v.color).map(v => [v.color, v])).values()] : [];
  const uniqueSizes = hasVariants ? [...new Set(product.variants.filter(v => v.size).map(v => v.size))] : [];

  return (
    <div className="md:mt-16 mt-32 min-h-screen bg-gray-50/50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center gap-1.5 text-sm text-gray-400">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/products" className="hover:text-gray-900 transition-colors">Products</Link>
            {product.category && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link
                  to={`/category/${product.category._id}/products`}
                  className="hover:text-gray-900 transition-colors capitalize"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-900 font-medium capitalize line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Image Gallery */}
          <div className="lg:w-1/2">
            <div className="sticky top-28">
              {(() => {
                const productImages = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
                return (
                  <>
                    {/* Main Image */}
                    <div className="relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm group">
                      <img
                        className={`w-full h-[400px] sm:h-[500px] lg:h-[600px] object-cover object-center transition-transform duration-500 group-hover:scale-105 ${product.stock === 0 ? 'opacity-50 grayscale' : ''}`}
                        src={productImages[selectedImageIndex] || product.image}
                        alt={product.name}
                      />
                      {product.discount > 0 && product.stock !== 0 && (
                        <span className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3.5 py-1.5 rounded-full shadow-md z-10">
                          {product.discount}% OFF
                        </span>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                          <span className="bg-white/95 backdrop-blur-sm text-gray-900 text-sm font-bold px-6 py-3 rounded-full uppercase tracking-wide shadow-lg">
                            Out of Stock
                          </span>
                        </div>
                      )}

                      {/* Navigation Arrows */}
                      {productImages.length > 1 && (
                        <>
                          <button
                            onClick={() => setSelectedImageIndex(prev => prev === 0 ? productImages.length - 1 : prev - 1)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
                          >
                            <ChevronRight className="h-5 w-5 text-gray-700 rotate-180" />
                          </button>
                          <button
                            onClick={() => setSelectedImageIndex(prev => prev === productImages.length - 1 ? 0 : prev + 1)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
                          >
                            <ChevronRight className="h-5 w-5 text-gray-700" />
                          </button>
                        </>
                      )}

                      {/* Image counter */}
                      {productImages.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full z-10">
                          {selectedImageIndex + 1} / {productImages.length}
                        </div>
                      )}
                    </div>

                    {/* Thumbnail Strip */}
                    {productImages.length > 1 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                        {productImages.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedImageIndex(i)}
                            className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${i === selectedImageIndex ? 'border-store-primary ring-2 ring-store-primary/20 scale-105' : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'}`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Details */}
          <div className="lg:w-1/2">
            <div className="flex flex-col gap-5">
              {/* Category Badge */}
              {product.category && (
                <Link
                  to={`/category/${product.category._id}/products`}
                  className="inline-flex self-start bg-store-primary-light text-store-primary-dark text-xs font-semibold px-3.5 py-1.5 rounded-full capitalize hover:bg-store-primary-light transition-colors"
                >
                  {product.category.name}
                </Link>
              )}

              {/* Name */}
              <h1 className="text-3xl lg:text-4xl capitalize font-extrabold tracking-tight leading-tight text-gray-900">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-4 w-4 ${s <= Math.round(reviewStats.averageRating) ? 'fill-store-primary text-store-primary' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-400 font-medium">
                  {reviewStats.totalReviews > 0
                    ? `${reviewStats.averageRating.toFixed(1)} (${reviewStats.totalReviews} ${reviewStats.totalReviews === 1 ? 'review' : 'reviews'})`
                    : 'No reviews yet'}
                </span>
              </div>

              {/* Price */}
              {(() => {
                const hasDiscount = product.discount > 0;
                const discountedPrice = hasDiscount
                  ? Math.round(product.price - (product.price * product.discount / 100))
                  : product.price;
                const savings = product.price - discountedPrice;
                const outOfStock = product.stock === 0;
                const lowStock = product.stock > 0 && product.stock <= 5;

                return (
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-extrabold text-gray-900">
                        {currencySymbol}{discountedPrice.toLocaleString()}
                      </span>
                      {hasDiscount && (
                        <span className="text-xl text-gray-400 line-through">
                          {currencySymbol}{product.price?.toLocaleString()}
                        </span>
                      )}
                      {hasDiscount && (
                        <span className="text-sm font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                          Save {currencySymbol}{savings.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      {outOfStock ? (
                        <span className="text-sm text-red-600 font-medium flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" />
                          Out of Stock
                        </span>
                      ) : lowStock ? (
                        <span className="text-sm text-amber-600 font-medium flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Only {product.stock} left — hurry!
                        </span>
                      ) : (
                        <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" />
                          In Stock
                        </span>
                      )}
                      <span className="text-sm text-gray-400">Inclusive of all taxes</span>
                    </div>
                  </div>
                );
              })()}

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">About this product</h3>
                  <p className="text-gray-500 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Bullet Points */}
              {product.bulletPoints && product.bulletPoints.length > 0 && (() => {
                // Normalize corrupted bulletPoints
                const normalized = product.bulletPoints.flatMap((bp) => {
                  if (typeof bp === "string") {
                    const t = bp.trim();
                    if (t.startsWith("[") && t.endsWith("]")) {
                      try { const p = JSON.parse(t); if (Array.isArray(p)) return p.map(s => String(s).trim()).filter(Boolean); } catch { }
                    }
                    if (t.includes(",") && !t.includes('"')) return t.split(",").map(s => s.trim()).filter(Boolean);
                    return t ? [t] : [];
                  }
                  return [String(bp)];
                }).filter(Boolean);
                return normalized.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Highlights</h3>
                    <ul className="space-y-2.5">
                      {normalized.map((point, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-500 text-sm">
                          <div className="h-5 w-5 rounded-full bg-store-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="h-3 w-3 text-store-primary" />
                          </div>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null;
              })()}

              {/* Variant Selector */}
              {hasVariants && (
                <div className="space-y-4">
                  {/* Color Swatches */}
                  {uniqueColors.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        Color: <span className="font-normal text-gray-500">{selectedColor || 'Select a color'}</span>
                      </h3>
                      <div className="flex flex-row flex-wrap gap-2">
                        {uniqueColors.map((cv, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setSelectedColor(cv.color);
                              // Auto-select variant if only one size for this color
                              const colorVariants = product.variants.filter(v => v.color === cv.color);
                              if (colorVariants.length === 1) {
                                setSelectedVariant(colorVariants[0]);
                                setSelectedSize(colorVariants[0].size);
                              } else {
                                // If previously selected size exists for this color, keep it
                                const match = colorVariants.find(v => v.size === selectedSize);
                                setSelectedVariant(match || null);
                              }
                            }}
                            className={`relative w-10 h-10 rounded-full border-2 transition-all duration-200 ${selectedColor === cv.color ? 'border-store-primary ring-2 ring-store-primary/30 scale-110' : 'border-gray-200 hover:border-gray-400'}`}
                            title={cv.color}
                          >
                            <span
                              className="block w-7 h-7 rounded-full mx-auto"
                              style={{ backgroundColor: cv.colorCode || '#ccc' }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Buttons */}
                  {uniqueSizes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        Size: <span className="font-normal text-gray-500">{selectedSize || 'Select a size'}</span>
                      </h3>
                      <div className="flex flex-row flex-wrap gap-2">
                        {uniqueSizes.map((size, index) => {
                          // Check if this size is available for the selected color
                          const variant = selectedColor
                            ? product.variants.find(v => v.size === size && v.color === selectedColor)
                            : product.variants.find(v => v.size === size);
                          const isAvailable = variant && variant.stock > 0;
                          const isSelected = selectedSize === size;

                          return (
                            <button
                              key={index}
                              onClick={() => {
                                setSelectedSize(size);
                                if (variant) setSelectedVariant(variant);
                              }}
                              disabled={!variant}
                              className={`rounded-xl px-5 py-2.5 text-sm font-medium border transition-all duration-200 ${isSelected
                                  ? 'border-store-primary bg-store-primary-light text-store-primary-dark shadow-sm'
                                  : !variant
                                    ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                                    : !isAvailable
                                      ? 'border-gray-200 bg-white text-gray-400 line-through'
                                      : 'border-gray-200 bg-white text-gray-600 hover:border-store-primary hover:text-store-primary-dark'
                                }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Selected Variant Info */}
                  {selectedVariant && (
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`font-semibold ${selectedVariant.stock === 0 ? 'text-red-500' : selectedVariant.stock <= 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {selectedVariant.stock === 0 ? 'Out of stock' : selectedVariant.stock <= 5 ? `Only ${selectedVariant.stock} left` : `${selectedVariant.stock} in stock`}
                      </span>
                      {selectedVariant.sku && (
                        <span className="text-gray-400">SKU: {selectedVariant.sku}</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-row gap-3 mt-2">
                {(() => {
                  const variantOutOfStock = hasVariants && selectedVariant && selectedVariant.stock === 0;
                  const productOutOfStock = product.stock === 0;
                  const needsVariantSelection = hasVariants && !selectedVariant;
                  const isOutOfStock = variantOutOfStock || productOutOfStock;

                  if (isOutOfStock) {
                    return (
                      <button
                        disabled
                        className="flex-1 inline-flex items-center justify-center gap-2 py-4 text-base font-semibold bg-gray-200 text-gray-500 rounded-xl cursor-not-allowed"
                      >
                        <XCircle className="h-5 w-5" />
                        Out of Stock
                      </button>
                    );
                  }

                  if (needsVariantSelection) {
                    return (
                      <button
                        onClick={() => toast.error('Please select a size/color variant')}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-4 text-base font-semibold bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        Select Options
                      </button>
                    );
                  }

                  return (
                    <AddToCart product={product} quantity={1} ATC={true} variantId={selectedVariant?._id}>
                      <button className="flex-1 inline-flex items-center justify-center gap-2 py-4 text-base font-semibold bg-store-gradient hover:bg-store-gradient-light text-white rounded-xl transition-all duration-300 shadow-lg shadow-store-primary hover:shadow-store-primary-lg hover:scale-[1.02]">
                        <ShoppingCart className="h-5 w-5" />
                        Add to Cart
                      </button>
                    </AddToCart>
                  );
                })()}
                <button
                  onClick={toggleWishlist}
                  className={`px-5 py-4 rounded-xl border-2 transition-all duration-300 ${wishlisted
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-gray-200 bg-white text-gray-400 hover:text-red-500 hover:border-red-200"
                    }`}
                >
                  <Heart className={`h-5 w-5 ${wishlisted ? "fill-red-500" : ""}`} />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 mt-2">
                {[
                  { icon: Truck, title: "Free Delivery", desc: "On all orders" },
                  { icon: ShieldCheck, title: "Secure", desc: "100% safe" },
                  { icon: RotateCcw, title: "Easy Returns", desc: "30-day policy" },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                    <item.icon className="h-5 w-5 text-store-primary mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-gray-900">{item.title}</p>
                    <p className="text-[11px] text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 border-t">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Reviews & Ratings</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rating Summary */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="text-center mb-4">
              <p className="text-5xl font-extrabold text-gray-900">
                {reviewStats.averageRating ? reviewStats.averageRating.toFixed(1) : "0.0"}
              </p>
              <div className="flex justify-center gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-5 w-5 ${s <= Math.round(reviewStats.averageRating) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>
            {/* Distribution bars */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviewDistribution[star] || 0;
                const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 w-3">{star}</span>
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review List */}
          <div className="lg:col-span-2 space-y-6">

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {(showAllReviews ? reviews : reviews.slice(0, 2)).map((review) => (
                  <div key={review._id} className="bg-white border border-gray-100 rounded-xl p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3.5 w-3.5 ${s <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                            />
                          ))}
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {review.userId?.firstName} {review.userId?.lastName}
                        </p>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-500 mt-2 leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                ))}
                {reviews.length > 2 && (
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="w-full py-2.5 text-xs font-semibold text-store-primary hover:text-store-primary-dark bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    {showAllReviews ? "Show Less" : `View All ${reviews.length} Reviews`}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No reviews yet. Be the first to review!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12 border-t">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} wishlist={userWishlist} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12 border-t">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Viewed</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentlyViewed.map((p) => (
              <ProductCard key={p._id} product={p} wishlist={userWishlist} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetail;
