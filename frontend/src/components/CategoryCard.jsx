import React from 'react'
import { ArrowUpRight } from 'lucide-react';

function CategoryCard({ category }) {
    return (
        <div className="group relative rounded-2xl overflow-hidden cursor-pointer h-64">
            {/* Background Image */}
            <img
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                src={category.image}
                alt={category.name}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-all duration-300 group-hover:from-black/90" />

            {/* Content */}
            <div className="relative h-full flex flex-col justify-end p-5">
                <div className="flex items-end justify-between">
                    <div>
                        <h3 className="font-bold text-xl text-white capitalize leading-tight">
                            {category.name}
                        </h3>
                        <p className="text-gray-300 text-sm mt-1 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            Explore →
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <ArrowUpRight className="h-4 w-4 text-white" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CategoryCard
