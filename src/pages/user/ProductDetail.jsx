import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { IndianRupee, Heart, Star, ShoppingCart, ChevronRight, Truck, ShieldCheck, RotateCcw, Check } from "lucide-react";
import AddToCart from "../../components/AddToCart";

function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);

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

  if (loading) {
    return (
      <div className="md:mt-16 mt-32 min-h-screen bg-gray-50/50 flex justify-center items-center py-32">
        <div className="h-10 w-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
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
          className="inline-flex items-center gap-2 text-sm font-semibold text-yellow-700 hover:text-yellow-600 transition-colors"
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
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
                <img
                  className="w-full h-[400px] sm:h-[500px] lg:h-[600px] object-cover object-center"
                  src={product.image}
                  alt={product.name}
                />
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
                  className="inline-flex self-start bg-yellow-50 text-yellow-800 text-xs font-semibold px-3.5 py-1.5 rounded-full capitalize hover:bg-yellow-100 transition-colors"
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
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-400 font-medium">5.0 (128 reviews)</span>
              </div>

              {/* Price */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-baseline gap-1">
                  <IndianRupee className="h-6 w-6 text-gray-900" />
                  <span className="text-4xl font-extrabold text-gray-900">{product.price?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" />
                    In Stock
                  </span>
                  <span className="text-sm text-gray-400">Inclusive of all taxes</span>
                </div>
              </div>

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
                        <div className="h-5 w-5 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-yellow-600" />
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
                            ? "border-yellow-500 bg-yellow-50 text-yellow-800 shadow-sm"
                            : "border-gray-200 bg-white text-gray-600 hover:border-yellow-400 hover:text-yellow-700"
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
                <AddToCart product={product} quantity={1} ATC={true}>
                  <button className="flex-1 inline-flex items-center justify-center gap-2 py-4 text-base font-semibold bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 hover:scale-[1.02]">
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </button>
                </AddToCart>
                <button
                  onClick={() => setWishlisted(!wishlisted)}
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
                    <item.icon className="h-5 w-5 text-yellow-600 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-gray-900">{item.title}</p>
                    <p className="text-[11px] text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
