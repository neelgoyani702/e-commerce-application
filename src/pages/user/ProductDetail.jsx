import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Heart, Star, ShoppingCart, ChevronRight, Truck, ShieldCheck, RotateCcw, Check, AlertTriangle, XCircle, Share2, Copy, ExternalLink, Bell, MessageCircle, HelpCircle, CornerDownRight, Zap, Gift } from "lucide-react";
import AddToCart from "../../components/AddToCart";
import CountdownTimer from "../../components/CountdownTimer";
import { SettingsContext } from "../../context/SettingsProvider";
import { AuthContext } from "../../context/AuthProvider";
import { FlashSaleContext } from "../../context/FlashSaleProvider";
import ProductCard from "../../components/ProductCard";
import { SkeletonProductDetail } from "../../components/SkeletonCard";
import { addToRecentlyViewed, getRecentlyViewedIds } from "../../hooks/useRecentlyViewed";

function ProductDetail() {
  const { productId } = useParams();
  const { settings } = useContext(SettingsContext);
  const { user } = useContext(AuthContext);
  const flashContext = useContext(FlashSaleContext);
  const getFlashSaleData = flashContext?.getFlashSaleData;
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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [stockAlertSubscribed, setStockAlertSubscribed] = useState(false);
  const [stockAlertId, setStockAlertId] = useState(null);

  // Q&A State
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  // Bundle Offers State
  const [bundles, setBundles] = useState([]);

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

  async function fetchQuestions() {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/questions/product/${productId}?limit=50`);
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }

  async function handlePostQuestion(e) {
    e.preventDefault();
    if (!user) return toast.error("Please login to ask a question");
    if (!newQuestion.trim()) return toast.error("Question cannot be empty");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, questionText: newQuestion })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Question posted successfully");
        setNewQuestion("");
        fetchQuestions();
      } else {
        toast.error(data.message || "Failed to post question");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  async function handlePostAnswer(e, questionId) {
    e.preventDefault();
    if (!user) return toast.error("Please login to answer");
    if (!replyText.trim()) return toast.error("Answer cannot be empty");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/questions/${questionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answerText: replyText })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Answer posted successfully");
        setReplyText("");
        setReplyingTo(null);
        fetchQuestions();
      } else {
        toast.error(data.message || "Failed to post answer");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    getProduct();
    fetchReviews();
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Check stock alert subscription
  useEffect(() => {
    if (!user || !product || product.stock > 0) return;
    
    // Calculate variants safely without relying on outer scope var before definition
    const hasVariants = product.variants?.length > 0;
    const isOutOfStock = (hasVariants && selectedVariant && selectedVariant.stock === 0) || product.stock === 0;
    if (!isOutOfStock) return;

    async function checkAlert() {
      try {
        const url = new URL(`${process.env.REACT_APP_API_URL}/stock-alerts/check`);
        url.searchParams.append("productId", product._id);
        if (selectedVariant?._id) {
          url.searchParams.append("variantId", selectedVariant._id);
        }
        
        const res = await fetch(url.toString(), {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setStockAlertSubscribed(data.subscribed);
          setStockAlertId(data.alertId);
        }
      } catch (error) {
        // silent
      }
    }
    checkAlert();
  }, [user, product, selectedVariant]);

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

    // Fetch active bundles
    async function fetchBundles() {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/bundle/active/${productId}`);
        const data = await response.json();
        if (response.ok) {
          setBundles(data.bundles || []);
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
    fetchBundles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleAddBundleToCart = async (bundle) => {
    if (!user) {
      toast.error("Please login to add bundles to your cart");
      return;
    }

    const toastId = toast.loading(`Adding ${bundle.name} to cart...`);
    try {
      const getPayload = (prod) => {
        let variantId = undefined;
        if (prod.variants?.length > 0) {
          const v = prod.variants.find((v) => v.stock > 0);
          if (v) variantId = v._id;
        }
        return { productId: prod._id, quantity: 1, ATC: true, variantId };
      };

      const payloads = [
        getPayload(bundle.mainProduct),
        ...bundle.additionalProducts.map(ap => getPayload(ap))
      ];

      for (const payload of payloads) {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed");
      }

      toast.dismiss(toastId);
      toast.success("Bundle added to cart!");
    } catch {
      toast.dismiss(toastId);
      toast.error("Failed to add bundle to cart");
    }
  };

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
                const flashSaleData = getFlashSaleData ? getFlashSaleData(product._id) : null;
                const isFlashSale = !!flashSaleData;
                const flashSalePrice = flashSaleData?.salePrice;

                const hasDiscount = product.discount > 0;
                const discountedPrice = hasDiscount
                  ? Math.round(product.price - (product.price * product.discount / 100))
                  : product.price;

                const finalPrice = isFlashSale ? flashSalePrice : discountedPrice;
                const savings = product.price - finalPrice;
                
                const outOfStock = product.stock === 0;
                const lowStock = product.stock > 0 && product.stock <= 5;

                return (
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 relative overflow-hidden">
                    {isFlashSale && !outOfStock && (
                      <div className="absolute top-0 right-0 bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-white" />
                        FLASH SALE
                      </div>
                    )}
                    
                    {isFlashSale && !outOfStock && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Deal ends in</p>
                        <CountdownTimer targetDate={flashSaleData.flashSale.endDate} />
                      </div>
                    )}

                    <div className="flex items-baseline gap-3">
                      <span className={`text-4xl font-extrabold ${isFlashSale ? 'text-red-600' : 'text-gray-900'}`}>
                        {currencySymbol}{finalPrice.toLocaleString()}
                      </span>
                      {(hasDiscount || isFlashSale) && (
                        <span className="text-xl text-gray-400 line-through">
                          {currencySymbol}{product.price?.toLocaleString()}
                        </span>
                      )}
                      {(hasDiscount || isFlashSale) && (
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
                        onClick={async () => {
                          if (!user) {
                            toast.error("Please login to subscribe");
                            return;
                          }
                          try {
                            if (stockAlertSubscribed && stockAlertId) {
                              // Unsubscribe
                              const res = await fetch(
                                `${process.env.REACT_APP_API_URL}/stock-alerts/${stockAlertId}`,
                                { method: "DELETE", credentials: "include" }
                              );
                              if (res.ok) {
                                setStockAlertSubscribed(false);
                                setStockAlertId(null);
                                toast.success("Alert removed");
                              }
                            } else {
                              // Subscribe
                              const res = await fetch(
                                `${process.env.REACT_APP_API_URL}/stock-alerts`,
                                {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  credentials: "include",
                                  body: JSON.stringify({
                                    productId: product._id,
                                    variantId: selectedVariant?._id || null,
                                  }),
                                }
                              );
                              const data = await res.json();
                              if (res.ok) {
                                setStockAlertSubscribed(true);
                                setStockAlertId(data.alert?._id);
                                toast.success("We'll notify you when back in stock!");
                              } else {
                                toast.error(data.message || "Failed to subscribe");
                              }
                            }
                          } catch {
                            toast.error("Something went wrong");
                          }
                        }}
                        className={`flex-1 inline-flex items-center justify-center gap-2 py-4 text-base font-semibold rounded-xl transition-all duration-300 ${
                          stockAlertSubscribed
                            ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-200 hover:bg-emerald-100"
                            : "bg-gray-900 text-white hover:bg-gray-800 shadow-lg"
                        }`}
                      >
                        {stockAlertSubscribed ? (
                          <>
                            <Check className="h-5 w-5" />
                            Subscribed — Notify Me
                          </>
                        ) : (
                          <>
                            <Bell className="h-5 w-5" />
                            Notify When Available
                          </>
                        )}
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
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu((v) => !v)}
                    className="px-5 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-400 hover:text-store-primary hover:border-store-primary/30 transition-all duration-300"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  {showShareMenu && (
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-xl border border-gray-200 shadow-xl p-2 z-50 w-52 animate-fade-in-up">
                      {typeof navigator.share === "function" && (
                        <button
                          onClick={() => {
                            navigator.share({
                              title: product.name,
                              text: `Check out ${product.name}!`,
                              url: window.location.href,
                            }).catch(() => {});
                            setShowShareMenu(false);
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                          Share via...
                        </button>
                      )}
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Check out ${product.name}! ${window.location.href}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShowShareMenu(false)}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success("Link copied to clipboard!");
                          setShowShareMenu(false);
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Copy className="h-4 w-4 text-gray-400" />
                        Copy Link
                      </button>
                    </div>
                  )}
                </div>
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

      {/* Frequently Bought Together (Bundles) */}
      {bundles.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-100 bg-gray-50/30">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <Gift className="h-6 w-6 text-store-primary" />
            Frequently Bought Together
          </h2>
          
          <div className="flex justify-start overflow-x-auto pb-6 gap-6 custom-scrollbar">
            {bundles.map(bundle => {
               // Calculate display prices
               const allProducts = [bundle.mainProduct, ...bundle.additionalProducts];
               const totalMSRP = allProducts.reduce((sum, p) => sum + (p.price || 0), 0);
               
               const finalCartTotal = allProducts.reduce((sum, p) => {
                  let currentBestPrice = p.price || 0;
                  
                  const flashData = getFlashSaleData ? getFlashSaleData(p._id) : null;
                  if (flashData) {
                     currentBestPrice = flashData.salePrice;
                  } else if (p.discount && p.discount > 0) {
                     currentBestPrice = Math.round(currentBestPrice - (currentBestPrice * p.discount / 100));
                  }

                  if (bundle.discountPercentage > 0) {
                     currentBestPrice = Math.round(currentBestPrice - (currentBestPrice * bundle.discountPercentage / 100));
                  }
                  
                  return sum + currentBestPrice;
               }, 0);

               const actualSavings = totalMSRP - finalCartTotal;
               const savingsPercentage = Math.round((actualSavings / totalMSRP) * 100);

               return (
                  <div key={bundle._id} className="min-w-[700px] lg:w-full bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-6 shrink-0">
                     {/* Items Row */}
                     <div className="flex items-center gap-4 flex-1">
                        {allProducts.map((p, idx) => {
                           const flashData = getFlashSaleData ? getFlashSaleData(p._id) : null;
                           let currentBestPrice = p.price || 0;
                           let isBaseDiscounted = false;

                           if (flashData) {
                              currentBestPrice = flashData.salePrice;
                              isBaseDiscounted = true;
                           } else if (p.discount && p.discount > 0) {
                              currentBestPrice = Math.round(currentBestPrice - (currentBestPrice * p.discount / 100));
                              isBaseDiscounted = true;
                           }

                           const finalItemPrice = Math.round(currentBestPrice - (currentBestPrice * bundle.discountPercentage / 100));

                           return (
                              <React.Fragment key={p._id}>
                                 {idx > 0 && <span className="text-2xl font-bold text-gray-300">+</span>}
                                 <Link to={`/product/${p._id}`} className="group w-32 shrink-0 flex flex-col items-center">
                                    <div className="w-full aspect-square rounded-2xl bg-gray-50 mb-3 overflow-hidden border border-gray-100 relative">
                                       <img src={p.image || p.images?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                       {flashData && (
                                          <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shadow-sm z-10">
                                             Flash
                                          </span>
                                       )}
                                    </div>
                                    <p className="text-[11px] font-medium text-gray-900 text-center line-clamp-2 leading-tight group-hover:text-store-primary transition-colors mb-1">{p.name}</p>
                                    <div className="flex flex-col items-center gap-0.5">
                                       {(isBaseDiscounted || bundle.discountPercentage > 0) && (
                                          <span className="text-[10px] text-gray-400 line-through">₹{p.price?.toLocaleString()}</span>
                                       )}
                                       <span className="text-xs font-bold text-gray-800">₹{finalItemPrice.toLocaleString()}</span>
                                    </div>
                                 </Link>
                              </React.Fragment>
                           );
                        })}
                     </div>

                     {/* Price & Action */}
                     <div className="w-[1px] h-32 bg-gray-100 shrink-0 hidden md:block" />
                     <div className="flex flex-col items-center min-w-[200px] shrink-0">
                        {savingsPercentage > 0 && (
                          <span className="text-xs font-bold uppercase tracking-wider text-store-primary bg-store-primary/10 px-3 py-1 rounded-full mb-3">
                             Save ~{savingsPercentage}% Total
                          </span>
                        )}
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-xs text-gray-400 line-through">₹{totalMSRP.toLocaleString()}</span>
                           <span className="text-2xl font-extrabold text-gray-900">₹{finalCartTotal.toLocaleString()}</span>
                        </div>
                        <p className="text-[11px] text-emerald-600 font-semibold mb-4">For {allProducts.length} items</p>
                        <button
                           onClick={() => handleAddBundleToCart(bundle)}
                           className="w-full py-3 bg-store-primary text-white font-bold rounded-xl shadow-lg shadow-store-primary/20 hover:bg-store-primary-dark transition-all flex items-center justify-center gap-2"
                        >
                           <ShoppingCart className="h-4 w-4" />
                           Add Bundle to Cart
                        </button>
                     </div>
                  </div>
               );
            })}
          </div>
        </section>
      )}

      {/* Product Q&A Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-store-primary" />
          Customer Questions & Answers
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Ask a Question Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Have a question?</h3>
              <p className="text-sm text-gray-400 mb-6">Ask the community or the seller directly.</p>
              
              <form onSubmit={handlePostQuestion}>
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Type your question here..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-store-primary focus:border-transparent transition-all resize-none min-h-[120px] mb-4 text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={!newQuestion.trim()}
                  className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Post Question
                </button>
              </form>
            </div>
          </div>

          {/* Questions List */}
          <div className="lg:col-span-2 space-y-6">
            {questions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                <MessageCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 mb-1">No questions yet</h3>
                <p className="text-sm text-gray-400">Be the first to ask a question about this product.</p>
              </div>
            ) : (
              // Show sliced or all questions
              (showAllQuestions ? questions : questions.slice(0, 5)).map((q) => (
                <div key={q._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {q.user?.image ? (
                        <img src={q.user.image} alt={q.user.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-gray-600">
                          {q.user?.firstName ? q.user.firstName.charAt(0).toUpperCase() : "U"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900 capitalize">
                          {q.user?.firstName ? `${q.user.firstName} ${q.user.lastName || ''}` : "User"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(q.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm font-medium mb-4">{q.question}</p>
                      
                      {/* Answers */}
                      {q.answers && q.answers.length > 0 && (
                        <div className="space-y-4 mt-4 pt-4 border-t border-gray-50">
                          {q.answers.map((ans, idx) => (
                            <div key={idx} className="flex gap-3 bg-gray-50 p-4 rounded-xl">
                              <CornerDownRight className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-xs text-gray-900 capitalize flex items-center gap-1.5">
                                    {ans.user?.firstName ? `${ans.user.firstName} ${ans.user.lastName || ''}` : "User"}
                                    {ans.user?.role === "admin" && (
                                      <span className="bg-store-primary text-white text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                                        Seller
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-[11px] text-gray-400">
                                    {new Date(ans.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm">{ans.answer}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Form Trigger */}
                      <div className="mt-4 pt-4 border-t border-gray-50 line-clamp-1">
                        {replyingTo === q._id ? (
                          <form onSubmit={(e) => handlePostAnswer(e, q._id)} className="flex gap-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your answer..."
                              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-store-primary transition-colors"
                              autoFocus
                            />
                            <button
                              type="submit"
                              disabled={!replyText.trim()}
                              className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                            >
                              Post
                            </button>
                            <button
                              type="button"
                              onClick={() => { setReplyingTo(null); setReplyText(""); }}
                              className="px-3 py-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <button
                            onClick={() => { setReplyingTo(q._id); setReplyText(""); }}
                            className="text-xs font-semibold text-store-primary hover:text-store-primary-dark transition-colors inline-flex items-center gap-1"
                          >
                            <MessageCircle className="h-3 w-3" /> Answer this question
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              ))
            )}

            {/* View More Button */}
            {questions.length > 5 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setShowAllQuestions(!showAllQuestions)}
                  className="px-8 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                >
                  {showAllQuestions ? "Show Less" : `View All ${questions.length} Questions`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
