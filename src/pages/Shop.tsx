import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import { fetchProducts, fetchCollections } from "@/lib/shopify";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const [search, setSearch] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['shopify-products'],
    queryFn: () => fetchProducts(50),
  });

  const { data: collections = [] } = useQuery({
    queryKey: ['shopify-collections'],
    queryFn: () => fetchCollections(10),
  });

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.node.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryParam !== "all") {
        const productType = (p.node.productType || "").toLowerCase();
        if (productType !== categoryParam.toLowerCase()) return false;
      }
      return true;
    });
  }, [products, search, categoryParam]);

  const categoryTitle = categoryParam === "all"
    ? "All Products"
    : collections.find((c) => c.node.handle === categoryParam)?.node.title || categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);

  return (
    <div className="container py-10">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl md:text-4xl font-light text-center mb-10"
      >
        {categoryTitle}
      </motion.h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
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

        <Select
          value={categoryParam}
          onValueChange={(value) => {
            if (value === "all") setSearchParams({});
            else setSearchParams({ category: value });
          }}
        >
          <SelectTrigger className="w-[180px] text-xs uppercase tracking-[0.1em]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {collections.map((col) => (
              <SelectItem key={col.node.handle} value={col.node.handle}>{col.node.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full rounded-sm" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">No products found</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((product, i) => (
            <motion.div
              key={product.node.id}
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
