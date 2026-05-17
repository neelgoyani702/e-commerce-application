import React, { useEffect, useState } from "react";
import CategoryCard from "./CategoryCard";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function HomeCategories() {
  const [category, setCategory] = useState([]);

  async function getCategory() {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/category/get-category?active=true`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.ok) {
        setCategory(data.categories.slice(0, 4));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  useEffect(() => {
    getCategory();
  }, []);

  if (category.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      {/* Section Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <p className="text-store-primary text-sm font-semibold tracking-widest uppercase mb-2">
            Browse
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Popular Categories
          </h2>
        </div>
        <Link
          to="/category"
          className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-store-primary-dark transition-colors group"
        >
          View All
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {category.map((cat) => (
          <Link to={`/category/${cat._id}/products`} key={cat._id}>
            <CategoryCard category={cat} />
          </Link>
        ))}
      </div>

      {/* Mobile View All */}
      <div className="sm:hidden mt-6 text-center">
        <Link
          to="/category"
          className="inline-flex items-center gap-2 text-sm font-semibold text-store-primary-dark hover:text-store-primary"
        >
          View All Categories
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

export default HomeCategories;
