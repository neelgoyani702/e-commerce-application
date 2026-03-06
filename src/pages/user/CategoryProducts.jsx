import React, { useState, useEffect, useContext } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { ArrowUpDown, Package, ArrowLeft } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { SkeletonCard } from '../../components/SkeletonCard';
import { AuthContext } from '../../context/AuthProvider';

function CategoryProducts() {

    const { categoryId } = useParams();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [sort, setSort] = useState("name-asc");
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
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

    async function getCategoryProducts() {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/category/${categoryId}/products`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }
            );
            const data = await response.json();

            if (response.ok) {
                setProducts(data.products.sort((a, b) => a.name.localeCompare(b.name)));
                setCategory(data.category);
            } else {
                toast.error(data.message || "Failed to fetch products");
            }
        } catch (error) {
            console.error("Error fetching category products:", error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getCategoryProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryId]);

    const handleValueChange = (value) => {
        setSort(value);
        if (value === "name-asc") {
            setProducts([...products].sort((a, b) => a.name.localeCompare(b.name)));
        } else if (value === "name-desc") {
            setProducts([...products].sort((a, b) => b.name.localeCompare(a.name)));
        } else if (value === "price-asc") {
            setProducts([...products].sort((a, b) => a.price - b.price));
        } else if (value === "price-desc") {
            setProducts([...products].sort((a, b) => b.price - a.price));
        }
    }

    return (
        <div className='md:mt-16 mt-32 min-h-screen bg-gray-50/50'>
            {/* Hero with category image */}
            {category && (
                <div className="relative h-72 md:h-96 overflow-hidden">
                    <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end">
                        <div className="max-w-7xl mx-auto w-full px-6 pb-10">
                            <nav className="flex items-center gap-2 text-sm text-gray-300 mb-4">
                                <Link to="/" className="hover:text-white transition-colors">Home</Link>
                                <span className="text-gray-500">/</span>
                                <Link to="/category" className="hover:text-white transition-colors">Categories</Link>
                                <span className="text-gray-500">/</span>
                                <span className="text-store-primary font-medium capitalize">{category.name}</span>
                            </nav>

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div>
                                    <p className="text-store-primary text-sm font-semibold tracking-widest uppercase mb-2">
                                        Collection
                                    </p>
                                    <h1 className="text-4xl md:text-5xl font-extrabold text-white capitalize tracking-tight">
                                        {category.name}
                                    </h1>
                                    <p className="text-gray-300 mt-2 text-lg">
                                        {products.length} {products.length === 1 ? 'product' : 'products'} available
                                    </p>
                                </div>

                                {/* Back button */}
                                <button
                                    onClick={() => navigate("/category")}
                                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/20 transition-all"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    All Categories
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading hero placeholder */}
            {!category && loading && (
                <div className="h-72 md:h-96 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="space-y-3 text-center">
                      <div className="h-8 w-48 bg-gray-700 rounded-lg mx-auto animate-pulse" />
                      <div className="h-4 w-32 bg-gray-700/60 rounded mx-auto animate-pulse" />
                    </div>
                </div>
            )}

            {/* Controls + Grid */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <p className="text-gray-400 text-sm font-medium">
                        Showing {products.length} {products.length === 1 ? 'product' : 'products'}
                    </p>
                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4 text-gray-400" />
                        <Select value={sort} onValueChange={handleValueChange}>
                            <SelectTrigger className="w-[200px] rounded-xl border-gray-200 bg-white">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Sort by</SelectLabel>
                                    <SelectItem value="name-asc">Name: A → Z</SelectItem>
                                    <SelectItem value="name-desc">Name: Z → A</SelectItem>
                                    <SelectItem value="price-asc">Price: Low → High</SelectItem>
                                    <SelectItem value="price-desc">Price: High → Low</SelectItem>
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
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 text-lg font-medium mb-1">No products found</p>
                        <p className="text-gray-400 text-sm mb-4">This category doesn't have any products yet</p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-store-primary-dark hover:text-store-primary transition-colors"
                        >
                            Browse all products →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CategoryProducts