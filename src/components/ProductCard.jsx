import React from 'react'
import { IndianRupee, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

function ProductCard({ product }) {

    const { _id, name, description, price, image, category } = product;

    return (
        <Link to={`/product/${_id}`} className="group">
            <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer h-full flex flex-col">
                {/* Image */}
                <div className="relative overflow-hidden bg-gray-50">
                    <img
                        className="w-full object-cover object-center h-60 group-hover:scale-105 transition-transform duration-700"
                        src={image}
                        alt={name}
                    />
                    {category && (
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[11px] font-semibold px-3 py-1 rounded-full capitalize text-gray-700 shadow-sm">
                            {category.name || category}
                        </span>
                    )}
                    {/* Quick action overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                    <div className="absolute bottom-3 right-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <div className="w-10 h-10 rounded-full bg-yellow-500 text-white flex items-center justify-center shadow-lg shadow-yellow-500/30">
                            <ShoppingBag className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-[15px] capitalize text-gray-900 group-hover:text-yellow-700 transition-colors duration-200 line-clamp-1">
                        {name}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1.5 line-clamp-2 flex-1 leading-relaxed">
                        {description}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center">
                            <IndianRupee className="h-4 w-4 text-gray-900" />
                            <span className="font-bold text-lg text-gray-900">{price?.toLocaleString()}</span>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">Free delivery</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default ProductCard
