import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Heart, Star, ShoppingCart, ChevronRight, Truck, ShieldCheck, RotateCcw, Check, AlertTriangle, XCircle } from "lucide-react";
import AddToCart from "../../components/AddToCart";
import { SettingsContext } from "../../context/SettingsProvider";
import { AuthContext } from "../../context/AuthProvider";
import ProductCard from "../../components/ProductCard";
import { addToRecentlyViewed, getRecentlyViewedIds } from "../../hooks/useRecentlyViewed";

function ProductDetail() {
  const { productId } = useParams();
  const { settings } = useContext(SettingsContext);
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [userWishlist, setUserWishlist] = useState([]);

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
    return (
      <div className="md:mt-16 mt-32 min-h-screen bg-gray-50/50 flex justify-center items-center py-32">
        <div className="h-10 w-10 border-4 border-store-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
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

  const sizes = product.size
    ? Array.isArray(product.size) ? product.size : [product.size]
    : [];

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
          {/* Image */}
          <div className="lg:w-1/2">
            <div className="sticky top-28">
              <div className="relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
                <img
                  className={`w-full h-[400px] sm:h-[500px] lg:h-[600px] object-cover object-center ${product.stock === 0 ? 'opacity-50 grayscale' : ''}`}
                  src={product.image}
                  alt={product.name}
                />
                {product.discount > 0 && product.stock !== 0 && (
                  <span className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3.5 py-1.5 rounded-full shadow-md">
                    {product.discount}% OFF
                  </span>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="bg-white/95 backdrop-blur-sm text-gray-900 text-sm font-bold px-6 py-3 rounded-full uppercase tracking-wide shadow-lg">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
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
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-store-primary text-store-primary" />
                  ))}
                </div>
                <span className="text-sm text-gray-400 font-medium">5.0 (128 reviews)</span>
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
              {product.bulletPoints && product.bulletPoints.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Highlights</h3>
                  <ul className="space-y-2.5">
                    {product.bulletPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-500 text-sm">
                        <div className="h-5 w-5 rounded-full bg-store-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-store-primary" />
                        </div>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Size */}
              {sizes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Size</h3>
                  <div className="flex flex-row flex-wrap gap-2">
                    {sizes.map((size, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(size)}
                        className={`rounded-xl px-5 py-2.5 text-sm font-medium border transition-all duration-200 ${selectedSize === size
                          ? "border-store-primary bg-store-primary-light text-store-primary-dark shadow-sm"
                          : "border-gray-200 bg-white text-gray-600 hover:border-store-primary hover:text-store-primary-dark"
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-row gap-3 mt-2">
                {product.stock === 0 ? (
                  <button
                    disabled
                    className="flex-1 inline-flex items-center justify-center gap-2 py-4 text-base font-semibold bg-gray-200 text-gray-500 rounded-xl cursor-not-allowed"
                  >
                    <XCircle className="h-5 w-5" />
                    Out of Stock
                  </button>
                ) : (
                  <AddToCart product={product} quantity={1} ATC={true}>
                    <button className="flex-1 inline-flex items-center justify-center gap-2 py-4 text-base font-semibold bg-store-gradient hover:bg-store-gradient-light text-white rounded-xl transition-all duration-300 shadow-lg shadow-store-primary hover:shadow-store-primary-lg hover:scale-[1.02]">
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </button>
                  </AddToCart>
                )}
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
