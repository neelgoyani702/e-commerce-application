import React, { useState, useEffect } from "react";
import Slider from "../../components/Slider.jsx";
import HomeCategories from "../../components/HomeCategories.jsx";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Sparkles } from "lucide-react";
import ProductCard from "../../components/ProductCard.jsx";

function Home() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);

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
        setFeaturedProducts(data.products.slice(0, 8));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div className="md:mt-16 mt-32">
      {/* Hero Slider */}
      <Slider />

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
                <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5 text-yellow-600" />
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
              <p className="text-yellow-600 text-sm font-semibold tracking-widest uppercase mb-2">
                Handpicked
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Featured Products
              </h2>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-yellow-700 transition-colors group"
            >
              View All
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Mobile View All */}
          <div className="sm:hidden mt-6 text-center">
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-yellow-700"
            >
              View All Products
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-yellow-500/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />
          <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-10 md:p-16 gap-8">
            <div className="max-w-lg">
              <p className="text-yellow-400 text-sm font-semibold tracking-widest uppercase mb-3">
                Don't miss out
              </p>
              <h3 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
                New Arrivals<br />
                <span className="text-yellow-400">Every Week</span>
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Discover the latest trends and exclusive deals. Shop our curated collection today and elevate your style.
              </p>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white font-semibold px-10 py-4 rounded-full transition-all duration-300 shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 text-base whitespace-nowrap"
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
