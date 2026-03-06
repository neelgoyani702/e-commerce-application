import React, { useEffect, useState } from "react";
import CategoryCard from '../../components/CategoryCard.jsx';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { LayoutGrid, ArrowUpDown, Search } from "lucide-react";
import { SkeletonCategoryCard } from "../../components/SkeletonCard";

function Category() {
    const [categories, setCategories] = useState([]);
    const [sort, setSort] = useState("name-asc");
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    async function getCategory() {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/category/get-category?active=true`,
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
                setCategories(data.categories.sort((a, b) => a.name.localeCompare(b.name)));
            } else {
                toast.error(data.message || "Failed to fetch categories");
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getCategory();
    }, []);

    const handleValueChange = (value) => {
        setSort(value);
        if (value === "name-asc") {
            setCategories([...categories].sort((a, b) => a.name.localeCompare(b.name)));
        } else if (value === "name-des") {
            setCategories([...categories].sort((a, b) => b.name.localeCompare(a.name)));
        }
    }

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="md:mt-16 mt-32 min-h-screen bg-gray-50/50">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-store-primary/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-store-primary/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-20">
                    <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                        <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        <span className="text-gray-600">/</span>
                        <span className="text-store-primary font-medium">Categories</span>
                    </nav>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-store-gradient flex items-center justify-center shadow-lg shadow-store-primary">
                                <LayoutGrid className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">All Categories</h1>
                                <p className="text-gray-400 mt-1">
                                    Browse {categories.length > 0 ? `${categories.length} categories` : "our collection"}
                                </p>
                            </div>
                        </div>

                        {/* Hero Search */}
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-store-primary focus:border-store-primary/50 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <p className="text-gray-400 text-sm font-medium">
                        {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} found
                    </p>
                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4 text-gray-400" />
                        <Select value={sort} onValueChange={handleValueChange}>
                            <SelectTrigger className="w-[180px] rounded-xl border-gray-200 bg-white">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Sort by</SelectLabel>
                                    <SelectItem value="name-asc">Name: A → Z</SelectItem>
                                    <SelectItem value="name-des">Name: Z → A</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-12">
                        {[...Array(8)].map((_, i) => (
                            <SkeletonCategoryCard key={i} />
                        ))}
                    </div>
                )}

                {/* Categories Grid */}
                {!loading && filteredCategories.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-12">
                        {filteredCategories.map((cat, i) => (
                            <Link to={`/category/${cat._id}/products`} key={cat._id} className={`animate-fade-in-up animation-delay-${(i % 4) * 100}`}>
                                <CategoryCard category={cat} />
                            </Link>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredCategories.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                            <LayoutGrid className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 text-lg font-medium mb-1">No categories found</p>
                        <p className="text-gray-400 text-sm">
                            {search ? "Try a different search term" : "Categories will appear here once added"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Category