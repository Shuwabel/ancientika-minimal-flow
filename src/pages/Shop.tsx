import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { mockProducts, collections } from "@/lib/mock-data";

const priceRanges = [
  { label: "All", min: 0, max: Infinity },
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50–$150", min: 50, max: 150 },
  { label: "$150+", min: 150, max: Infinity },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState(priceRanges[0]);

  const filtered = useMemo(() => {
    return mockProducts.filter((p) => {
      if (categoryParam !== "all" && p.category !== categoryParam) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (p.price < priceRange.min || p.price >= priceRange.max) return false;
      return true;
    });
  }, [categoryParam, search, priceRange]);

  return (
    <div className="container py-10">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl md:text-4xl font-light text-center mb-10"
      >
        {categoryParam === "all"
          ? "All Products"
          : collections.find((c) => c.slug === categoryParam)?.name || "Shop"}
      </motion.h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-8 py-2 bg-card border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSearchParams({})}
            className={`px-3 py-1.5 text-xs uppercase tracking-[0.1em] rounded-sm border transition-colors ${
              categoryParam === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-foreground"
            }`}
          >
            All
          </button>
          {collections.map((col) => (
            <button
              key={col.slug}
              onClick={() => setSearchParams({ category: col.slug })}
              className={`px-3 py-1.5 text-xs uppercase tracking-[0.1em] rounded-sm border transition-colors ${
                categoryParam === col.slug
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-foreground"
              }`}
            >
              {col.name}
            </button>
          ))}
        </div>

        {/* Price filter */}
        <div className="flex gap-2 flex-wrap">
          {priceRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => setPriceRange(range)}
              className={`px-3 py-1.5 text-xs rounded-sm border transition-colors ${
                priceRange.label === range.label
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-foreground"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">No products found</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
