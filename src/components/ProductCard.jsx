import React, { useContext } from 'react'
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SettingsContext } from '../context/SettingsProvider';
import { AuthContext } from '../context/AuthProvider';
import { toast } from 'sonner';

function ProductCard({ product, wishlist = [], onWishlistToggle }) {

    const { settings } = useContext(SettingsContext);
    const { user } = useContext(AuthContext);
    const { _id, name, description, price, image, category, discount, stock } = product;

    const hasDiscount = discount > 0;
    const discountedPrice = hasDiscount ? Math.round(price - (price * discount / 100)) : price;
    const outOfStock = stock === 0;
    const lowStock = stock > 0 && stock <= 5;
    const isWishlisted = wishlist.includes(_id);

    const handleWishlistToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error("Please login to add to wishlist");
            return;
        }

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/user/wishlist/${_id}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                if (onWishlistToggle) {
                    onWishlistToggle(_id, data.action);
                }
            } else {
                toast.error(data.message || "Failed to update wishlist");
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    return (
        <Link to={`/product/${_id}`} className="group">
            <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer h-full flex flex-col">
                {/* Image */}
                <div className="relative overflow-hidden bg-gray-50">
                    <img
                        className={`w-full object-cover object-center h-60 transition-transform duration-700 ${outOfStock ? 'opacity-50 grayscale' : 'group-hover:scale-105'}`}
                        src={image}
                        alt={name}
                    />
                    {/* Category badge */}
                    {category && (
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[11px] font-semibold px-3 py-1 rounded-full capitalize text-gray-700 shadow-sm">
                            {category.name || category}
                        </span>
                    )}
                    {/* Discount badge */}
                    {hasDiscount && !outOfStock && (
                        <span className="absolute top-12 right-3 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                            {discount}% OFF
                        </span>
                    )}
                    {/* Wishlist heart */}
                    <button
                        onClick={handleWishlistToggle}
                        className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 z-10 ${isWishlisted
                            ? 'bg-red-50 text-red-500 shadow-md ring-1 ring-red-200'
                            : 'bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100'
                            }`}
                    >
                        <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 stroke-red-500' : ''}`} />
                    </button>
                    {/* Out of stock overlay */}
                    {outOfStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wide shadow">
                                Out of Stock
                            </span>
                        </div>
                    )}
                    {/* Low stock badge */}
                    {lowStock && (
                        <span className="absolute bottom-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                            Only {stock} left
                        </span>
                    )}
                    {/* Quick action overlay */}
                    {!outOfStock && (
                        <>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                            <div className="absolute bottom-3 right-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                <div
                                    className="w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg"
                                    style={{ backgroundColor: 'var(--store-primary, #eab308)', boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--store-primary, #eab308) 30%, transparent)' }}
                                >
                                    <ShoppingBag className="h-4 w-4" />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                    <h3
                        className="font-semibold text-[15px] capitalize text-gray-900 transition-colors duration-200 line-clamp-1 group-hover:text-[var(--store-primary)]"
                    >
                        {name}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1.5 line-clamp-2 flex-1 leading-relaxed">
                        {description}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            {hasDiscount ? (
                                <>
                                    <span className="font-bold text-lg text-gray-900">
                                        {settings?.currencySymbol || '₹'}{discountedPrice.toLocaleString()}
                                    </span>
                                    <span className="text-sm text-gray-400 line-through">
                                        {settings?.currencySymbol || '₹'}{price?.toLocaleString()}
                                    </span>
                                </>
                            ) : (
                                <span className="font-bold text-lg text-gray-900">
                                    {settings?.currencySymbol || '₹'}{price?.toLocaleString()}
                                </span>
                            )}
                        </div>
                        {outOfStock ? (
                            <span className="text-xs text-red-500 font-semibold">Unavailable</span>
                        ) : (
                            <span className="text-xs text-gray-400 font-medium">Free delivery</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default ProductCard
