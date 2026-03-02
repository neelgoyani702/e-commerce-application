import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Heart, Trash2, ArrowRight } from "lucide-react";
import ProductCard from "../../components/ProductCard";

function Wishlist() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  async function getWishlist() {
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

      if (response.ok) {
        setWishlist(data.wishlist || []);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  }

  const removeFromWishlist = async (productId) => {
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
        setWishlist((prev) => prev.filter((p) => p._id !== productId));
        toast.success("Removed from wishlist");
      } else {
        toast.error(data.message || "Failed to remove");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    getWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="h-8 w-8 border-4 border-store-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
          <Heart className="h-8 w-8 text-red-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Your wishlist is empty
        </h2>
        <p className="text-gray-400 text-sm mb-6 max-w-sm">
          Start adding items you love by tapping the heart icon on any product.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-store-primary-dark hover:text-store-primary transition-colors"
        >
          Browse Products
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-sm text-gray-500 mt-1">
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlist.map((product) => (
          <div key={product._id} className="relative group/card">
            <ProductCard product={product} />
            {/* Remove button overlay */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeFromWishlist(product._id);
              }}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover/card:opacity-100"
              title="Remove from wishlist"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Wishlist;
