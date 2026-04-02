import React, { useState, useEffect, useContext } from "react";
import Slider from "../../components/Slider.jsx";
import HomeCategories from "../../components/HomeCategories.jsx";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Sparkles, Zap } from "lucide-react";
import ProductCard from "../../components/ProductCard.jsx";
import CountdownTimer from "../../components/CountdownTimer.jsx";
import { AuthContext } from "../../context/AuthProvider";
import { FlashSaleContext } from "../../context/FlashSaleProvider";
import { getRecentlyViewedIds } from "../../hooks/useRecentlyViewed";

function Home() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { activeFlashSales } = useContext(FlashSaleContext) || { activeFlashSales: [] };
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [userWishlist, setUserWishlist] = useState([]);

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
        // Show featured products, fallback to newest 8
        const featured = data.products.filter(p => p.featured);
        setFeaturedProducts(featured.length > 0 ? featured.slice(0, 8) : data.products.slice(0, 8));

        // Load recently viewed
        const recentIds = getRecentlyViewedIds();
        if (recentIds.length > 0) {
          const recentProducts = recentIds
            .map(id => data.products.find(p => p._id === id))
            .filter(Boolean)
            .slice(0, 4);
          setRecentlyViewed(recentProducts);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  // Fetch wishlist for logged-in users
  useEffect(() => {
    if (!user) return;
    async function fetchWishlist() {
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
          setUserWishlist(data.wishlist.map(p => p._id || p));
        }
      } catch (error) {
        // Silent fail
      }
    }
    fetchWishlist();
  }, [user]);

  const handleWishlistToggle = (productId, action) => {
    setUserWishlist(prev =>
      action === "added"
        ? [...prev, productId]
        : prev.filter(id => id !== productId)
    );
  };

  useEffect(() => {
    getProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="md:mt-16 mt-32">
      {/* Hero Slider */}
      <Slider />

      {/* Active Flash Sale Banner */}
      {activeFlashSales && activeFlashSales.length > 0 && (
        <section className="bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 py-6 md:py-8 shadow-inner overflow-hidden relative">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/30 hidden sm:block">
                <Zap className="h-8 w-8 text-white fill-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm flex items-center gap-2">
                  <span className="sm:hidden"><Zap className="h-5 w-5 fill-white" /></span>
                  {activeFlashSales[0].name}
                </h2>
                <p className="text-white/90 text-sm md:text-base font-medium mt-1">
                  Limited time offer! Grab these deals before they're gone.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-3 z-10">
              <CountdownTimer targetDate={activeFlashSales[0].endDate} />
              <button
                onClick={() => navigate("/products")}
                className="text-xs md:text-sm font-bold bg-white text-rose-600 px-5 py-2 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 w-full md:w-auto mt-2"
              >
                SHOP DEALS NOW →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Trust Bar */}
      <section className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Free Delivery", desc: "On all orders" },
              { icon: ShieldCheck, title: "Secure Payment", desc: "100% protected" },
              { icon: RotateCcw, title: "Easy Returns", desc: "30-day policy" },
              { icon: Sparkles, title: "Premium Quality", desc: "Curated selection" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 justify-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--store-primary, #eab308) 12%, transparent)' }}
                >
                  <item.icon className="h-5 w-5" style={{ color: 'var(--store-primary, #eab308)' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <HomeCategories />

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          {/* Section Header */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <p
                className="text-sm font-semibold tracking-widest uppercase mb-2"
                style={{ color: 'var(--store-primary, #eab308)' }}
              >
                Handpicked
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Featured Products
              </h2>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors group hover:opacity-80"
              style={{ '--tw-text-opacity': 1 }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--store-primary, #ca8a04)'}
              onMouseLeave={(e) => e.currentTarget.style.color = ''}
            >
              View All
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} wishlist={userWishlist} onWishlistToggle={handleWishlistToggle} />
            ))}
          </div>

          {/* Mobile View All */}
          <div className="sm:hidden mt-6 text-center">
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: 'var(--store-primary, #ca8a04)' }}
            >
              View All Products
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12 border-t">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p
                className="text-sm font-semibold tracking-widest uppercase mb-2"
                style={{ color: 'var(--store-primary, #eab308)' }}
              >
                Your History
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Recently Viewed
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {recentlyViewed.map((product) => (
              <ProductCard key={product._id} product={product} wishlist={userWishlist} onWishlistToggle={handleWishlistToggle} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          {/* Decorative elements */}
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"
            style={{ backgroundColor: 'color-mix(in srgb, var(--store-primary, #eab308) 10%, transparent)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-72 h-72 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl"
            style={{ backgroundColor: 'color-mix(in srgb, var(--store-primary, #eab308) 5%, transparent)' }}
          />
          <div
            className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full blur-2xl"
            style={{ backgroundColor: 'color-mix(in srgb, var(--store-accent, #f59e0b) 5%, transparent)' }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-10 md:p-16 gap-8">
            <div className="max-w-lg">
              <p
                className="text-sm font-semibold tracking-widest uppercase mb-3"
                style={{ color: 'var(--store-primary, #facc15)' }}
              >
                Don't miss out
              </p>
              <h3 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
                New Arrivals<br />
                <span style={{ color: 'var(--store-primary, #facc15)' }}>Every Week</span>
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Discover the latest trends and exclusive deals. Shop our curated collection today and elevate your style.
              </p>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 text-white font-semibold px-10 py-4 rounded-full transition-all duration-300 hover:scale-105 text-base whitespace-nowrap"
              style={{
                background: `linear-gradient(to right, var(--store-primary, #eab308), var(--store-accent, #f59e0b))`,
                boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--store-primary, #eab308) 30%, transparent)',
              }}
            >
              Explore Collection
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
