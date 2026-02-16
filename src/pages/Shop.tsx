import { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SlidersHorizontal, LayoutGrid, Grid2x2, Grid3x3, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import { fetchProducts, fetchCollections } from "@/lib/shopify";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

type SortOption = "featured" | "price-asc" | "price-desc" | "newest" | "title-asc";
type GridCols = 2 | 3 | 4;

const GRID_OPTIONS: { cols: GridCols; icon: React.ReactNode; label: string }[] = [
  { cols: 2, icon: <Grid2x2 className="h-4 w-4" />, label: "2 columns" },
  { cols: 3, icon: <Grid3x3 className="h-4 w-4" />, label: "3 columns" },
  { cols: 4, icon: <LayoutGrid className="h-4 w-4" />, label: "4 columns" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "newest", label: "Newest" },
  { value: "title-asc", label: "Alphabetical" },
];

function getGridClass(cols: GridCols, isMobile: boolean) {
  if (isMobile) {
    return cols === 2 ? "grid-cols-2" : "grid-cols-1";
  }
  switch (cols) {
    case 2: return "grid-cols-2";
    case 3: return "grid-cols-3";
    case 4: return "grid-cols-4";
  }
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const isMobile = useIsMobile();

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [gridCols, setGridCols] = useState<GridCols>(isMobile ? 2 : 4);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['shopify-products'],
    queryFn: () => fetchProducts(50),
  });

  const { data: collections = [] } = useQuery({
    queryKey: ['shopify-collections'],
    queryFn: () => fetchCollections(10),
  });

  // Derive available sizes from products
  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach(p => {
      p.node.options.forEach(opt => {
        if (opt.name.toLowerCase() === "size") {
          opt.values.forEach(v => sizes.add(v));
        }
      });
    });
    return Array.from(sizes);
  }, [products]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const activeFilterCount = selectedSizes.length + (inStockOnly ? 1 : 0) + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

  const clearFilters = () => {
    setSelectedSizes([]);
    setInStockOnly(false);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("featured");
  };

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (search && !p.node.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryParam !== "all") {
        const productType = (p.node.productType || "").toLowerCase();
        if (productType !== categoryParam.toLowerCase()) return false;
      }
      if (inStockOnly && !p.node.availableForSale) return false;
      if (selectedSizes.length > 0) {
        const productSizes = p.node.options.find(o => o.name.toLowerCase() === "size")?.values || [];
        if (!selectedSizes.some(s => productSizes.includes(s))) return false;
      }
      const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
      if (minPrice && price < parseFloat(minPrice)) return false;
      if (maxPrice && price > parseFloat(maxPrice)) return false;
      return true;
    });

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => parseFloat(a.node.priceRange.minVariantPrice.amount) - parseFloat(b.node.priceRange.minVariantPrice.amount));
        break;
      case "price-desc":
        result.sort((a, b) => parseFloat(b.node.priceRange.minVariantPrice.amount) - parseFloat(a.node.priceRange.minVariantPrice.amount));
        break;
      case "title-asc":
        result.sort((a, b) => a.node.title.localeCompare(b.node.title));
        break;
      case "newest":
        result.reverse();
        break;
    }

    return result;
  }, [products, search, categoryParam, sortBy, selectedSizes, inStockOnly, minPrice, maxPrice]);

  const categoryTitle = categoryParam === "all"
    ? "All Products"
    : collections.find((c) => c.node.handle === categoryParam)?.node.title || categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);

  const FilterContent = () => (
    <div className="space-y-5">
      {/* Sort */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Sort by</p>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Category</p>
        <Select
          value={categoryParam}
          onValueChange={(value) => {
            if (value === "all") setSearchParams({});
            else setSearchParams({ category: value });
          }}
        >
          <SelectTrigger className="w-full text-xs">
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

      {/* Size */}
      {availableSizes.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Size</p>
          <div className="flex flex-wrap gap-1.5">
            {availableSizes.map(size => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`h-7 min-w-[2rem] px-2 text-[11px] border rounded-sm transition-colors ${
                  selectedSizes.includes(size)
                    ? "border-foreground bg-primary text-primary-foreground"
                    : "border-border hover:border-foreground"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price range */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Price range</p>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="w-full py-1.5 px-2 bg-card border border-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <span className="text-muted-foreground text-xs">–</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-full py-1.5 px-2 bg-card border border-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="in-stock"
          checked={inStockOnly}
          onCheckedChange={(checked) => setInStockOnly(checked === true)}
        />
        <label htmlFor="in-stock" className="text-xs cursor-pointer">In stock only</label>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" className="w-full text-xs" onClick={clearFilters}>
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="container py-10">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl md:text-4xl font-light text-center mb-10"
      >
        {categoryTitle}
      </motion.h1>

      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border -mx-4 px-4 md:-mx-0 md:px-0 pb-3 pt-1 mb-6 space-y-2">
        {/* Main bar: search icon, sort, filter toggle, grid toggle */}
        <div className="flex items-center gap-2">
          {/* Search: icon or expanded input */}
          <AnimatePresence mode="wait">
            {searchOpen ? (
              <motion.div
                key="search-input"
                initial={{ width: 32 }}
                animate={{ width: isMobile ? "100%" : 220 }}
                exit={{ width: 32 }}
                className="relative flex-shrink-0"
              >
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-7 py-1.5 bg-card border border-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  onClick={() => { setSearch(""); setSearchOpen(false); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              </motion.div>
            ) : (
              <button
                key="search-icon"
                onClick={() => setSearchOpen(true)}
                className="h-8 w-8 flex items-center justify-center border border-border rounded-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <Search className="h-4 w-4" />
              </button>
            )}
          </AnimatePresence>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[140px] md:w-[160px] text-xs uppercase tracking-[0.1em] shrink-0 h-8">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50">
              {SORT_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filter toggle (desktop dropdown / mobile sheet) */}
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative shrink-0 h-8 w-8">
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle className="text-sm uppercase tracking-[0.1em]">Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs uppercase tracking-[0.1em] gap-1.5 shrink-0"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={`h-3 w-3 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
            </Button>
          )}

          <div className="flex-1" />

          {/* Grid toggle */}
          {!isMobile ? (
            <div className="flex items-center border border-border rounded-sm overflow-hidden shrink-0">
              {GRID_OPTIONS.map(opt => (
                <button
                  key={opt.cols}
                  onClick={() => setGridCols(opt.cols)}
                  title={opt.label}
                  className={`p-1.5 transition-colors ${
                    gridCols === opt.cols ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.icon}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center border border-border rounded-sm overflow-hidden shrink-0">
              <button
                onClick={() => setGridCols(2)}
                title="2 columns"
                className={`p-1.5 transition-colors ${gridCols === 2 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Grid2x2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setGridCols(4)}
                title="1 column"
                className={`p-1.5 transition-colors ${gridCols === 4 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Desktop filter dropdown */}
        {!isMobile && (
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
                  {/* Category */}
                  <Select
                    value={categoryParam}
                    onValueChange={(value) => {
                      if (value === "all") setSearchParams({});
                      else setSearchParams({ category: value });
                    }}
                  >
                    <SelectTrigger className="w-[140px] text-xs uppercase tracking-[0.1em] h-7">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      <SelectItem value="all">All</SelectItem>
                      {collections.map((col) => (
                        <SelectItem key={col.node.handle} value={col.node.handle}>{col.node.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Size pills */}
                  {availableSizes.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mr-1">Size:</span>
                      {availableSizes.map(size => (
                        <button
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`h-6 min-w-[1.75rem] px-1.5 text-[10px] border rounded-sm transition-colors ${
                            selectedSizes.includes(size)
                              ? "border-foreground bg-primary text-primary-foreground"
                              : "border-border hover:border-foreground"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* In-stock toggle */}
                  <div className="flex items-center gap-1.5">
                    <Checkbox
                      id="desktop-in-stock"
                      checked={inStockOnly}
                      onCheckedChange={(checked) => setInStockOnly(checked === true)}
                      className="h-3.5 w-3.5"
                    />
                    <label htmlFor="desktop-in-stock" className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground cursor-pointer">In stock</label>
                  </div>

                  {/* Price range */}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min ₦"
                      className="w-20 py-1 px-2 bg-card border border-border rounded-sm text-[11px] focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <span className="text-muted-foreground text-[10px]">–</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max ₦"
                      className="w-20 py-1 px-2 bg-card border border-border rounded-sm text-[11px] focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 uppercase tracking-[0.1em]" onClick={clearFilters}>
                      Clear ({activeFilterCount})
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className={`grid ${getGridClass(gridCols, isMobile)} gap-4`}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-sm" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">No products found</p>
      ) : (
        <div className={`grid ${getGridClass(gridCols, isMobile)} gap-4`}>
          {filtered.map((product, i) => (
            <motion.div
              key={product.node.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
