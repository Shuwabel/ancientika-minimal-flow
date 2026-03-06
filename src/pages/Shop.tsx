import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, SlidersHorizontal, LayoutGrid, Grid3x3, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import { fetchProducts, fetchCollections } from "@/lib/shopify";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { useIsMobile } from "@/hooks/use-mobile";

type SortOption = "featured" | "price-asc" | "price-desc" | "newest";

const SORT_OPTIONS: {value: SortOption;label: string;}[] = [
{ value: "featured", label: "Best selling" },
{ value: "newest", label: "Newest" },
{ value: "price-asc", label: "Price: Low to High" },
{ value: "price-desc", label: "Price: High to Low" }];


export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const isMobile = useIsMobile();

  const searchQuery = searchParams.get("q") || "";
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [showInStock, setShowInStock] = useState(false);
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [priceInitialized, setPriceInitialized] = useState(false);
  const [gridView, setGridView] = useState<"small" | "large" | "list">("small");

  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['shopify-products'],
    queryFn: () => fetchProducts(50)
  });

  const { data: collections = [] } = useQuery({
    queryKey: ['shopify-collections'],
    queryFn: () => fetchCollections(10)
  });

  const activeCollection = useMemo(() => {
    if (categoryParam === "all") return null;
    return collections.find((c) => c.node.handle === categoryParam) || null;
  }, [collections, categoryParam]);

  // Max price in current category
  const maxPriceInCollection = useMemo(() => {
    const categoryProducts = categoryParam === "all" ?
    products :
    products.filter((p) => (p.node.productType || "").toLowerCase() === categoryParam.toLowerCase());
    if (categoryProducts.length === 0) return 100000;
    return Math.ceil(Math.max(...categoryProducts.map((p) => parseFloat(p.node.priceRange.minVariantPrice.amount))));
  }, [products, categoryParam]);

  // Initialize price range when products load
  useMemo(() => {
    if (maxPriceInCollection > 0 && !priceInitialized) {
      setPriceRange([0, maxPriceInCollection]);
      setPriceInitialized(true);
    }
  }, [maxPriceInCollection, priceInitialized]);

  // Available sizes for current category
  const availableSizes = useMemo(() => {
    const categoryProducts = categoryParam === "all" ?
    products :
    products.filter((p) => (p.node.productType || "").toLowerCase() === categoryParam.toLowerCase());
    const sizes = new Set<string>();
    categoryProducts.forEach((p) => {
      p.node.options.forEach((opt) => {
        if (opt.name.toLowerCase() === "size") {
          opt.values.forEach((v) => sizes.add(v));
        }
      });
    });
    return Array.from(sizes);
  }, [products, categoryParam]);

  // Stock counts for availability filter
  const { inStockCount, outOfStockCount } = useMemo(() => {
    const categoryProducts = categoryParam === "all" ?
    products :
    products.filter((p) => (p.node.productType || "").toLowerCase() === categoryParam.toLowerCase());
    return {
      inStockCount: categoryProducts.filter((p) => p.node.availableForSale).length,
      outOfStockCount: categoryProducts.filter((p) => !p.node.availableForSale).length
    };
  }, [products, categoryParam]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
    prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const activeFilterCount = selectedSizes.length + (showInStock ? 1 : 0) + (showOutOfStock ? 1 : 0) + (
  priceInitialized && (priceRange[0] > 0 || priceRange[1] < maxPriceInCollection) ? 1 : 0);

  const clearFilters = () => {
    setSelectedSizes([]);
    setShowInStock(false);
    setShowOutOfStock(false);
    setPriceRange([0, maxPriceInCollection]);
    setSortBy("featured");
  };

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (searchQuery && !p.node.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (categoryParam !== "all") {
        const productType = (p.node.productType || "").toLowerCase();
        if (productType !== categoryParam.toLowerCase()) return false;
      }
      // Availability
      if (showInStock && !showOutOfStock && !p.node.availableForSale) return false;
      if (showOutOfStock && !showInStock && p.node.availableForSale) return false;
      // Size
      if (selectedSizes.length > 0) {
        const productSizes = p.node.options.find((o) => o.name.toLowerCase() === "size")?.values || [];
        if (!selectedSizes.some((s) => productSizes.includes(s))) return false;
      }
      // Price
      const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
      if (priceInitialized && price < priceRange[0]) return false;
      if (priceInitialized && price > priceRange[1]) return false;
      return true;
    });

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => parseFloat(a.node.priceRange.minVariantPrice.amount) - parseFloat(b.node.priceRange.minVariantPrice.amount));
        break;
      case "price-desc":
        result.sort((a, b) => parseFloat(b.node.priceRange.minVariantPrice.amount) - parseFloat(a.node.priceRange.minVariantPrice.amount));
        break;
      case "newest":
        result.reverse();
        break;
    }

    return result;
  }, [products, searchQuery, categoryParam, sortBy, selectedSizes, showInStock, showOutOfStock, priceRange, priceInitialized]);

  const categoryTitle = categoryParam === "all" ?
  "All Products" :
  activeCollection?.node.title || categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);

  const formatPrice = (val: number) => `₦${val.toLocaleString()}`;

  // Sidebar filter content (shared between desktop sidebar and mobile sheet)
  const FilterSidebar = () =>
  <div className="space-y-1">
      


      {/* Availability */}
      <Collapsible open={availabilityOpen} onOpenChange={setAvailabilityOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-xs uppercase tracking-[0.15em] font-medium text-foreground border-b border-border">
          Availability
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${availabilityOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-4 space-y-2.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={showInStock} onCheckedChange={(c) => setShowInStock(c === true)} className="h-3.5 w-3.5" />
            <span className="text-xs text-foreground">In stock ({inStockCount})</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={showOutOfStock} onCheckedChange={(c) => setShowOutOfStock(c === true)} className="h-3.5 w-3.5" />
            <span className="text-xs text-foreground">Out of stock ({outOfStockCount})</span>
          </label>
        </CollapsibleContent>
      </Collapsible>

      {/* Price */}
      <Collapsible open={priceOpen} onOpenChange={setPriceOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-xs uppercase tracking-[0.15em] font-medium text-foreground border-b border-border">
          Price
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${priceOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 pb-4 space-y-3">
          <Slider
          min={0}
          max={maxPriceInCollection || 100000}
          step={100}
          value={priceRange}
          onValueChange={(val) => setPriceRange(val as [number, number])}
          className="w-full" />

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Size */}
      {availableSizes.length > 0 &&
    <Collapsible open={sizeOpen} onOpenChange={setSizeOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-xs uppercase tracking-[0.15em] font-medium text-foreground border-b border-border">
            Size
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${sizeOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 pb-4">
            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map((size) =>
          <button
            key={size}
            onClick={() => toggleSize(size)}
            className={`h-7 min-w-[2rem] px-2 text-[11px] border rounded-sm transition-colors ${
            selectedSizes.includes(size) ?
            "border-foreground bg-primary text-primary-foreground" :
            "border-border hover:border-foreground"}`
            }>

                  {size}
                </button>
          )}
            </div>
          </CollapsibleContent>
        </Collapsible>
    }

      {activeFilterCount > 0 &&
    <Button variant="ghost" size="sm" className="w-full text-xs mt-4 uppercase tracking-[0.1em]" onClick={clearFilters}>
          Clear all filters
        </Button>
    }
    </div>;


  return (
    <div>
      {/* Hero Banner — 50% reduced height */}
      {activeCollection?.node.image ?
      <div className="relative w-full overflow-hidden" style={{ height: 'clamp(150px, 22vh, 300px)' }}>
          <img
          src={activeCollection.node.image.url}
          alt={activeCollection.node.image.altText || categoryTitle}
          className="w-full h-full object-cover" />

          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-end p-4 md:p-8">
            <h1 className="text-2xl md:text-4xl font-light text-white uppercase tracking-wider">
              {categoryTitle}
            </h1>
          </div>
        </div> :

      <div className="container pt-10">
          <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl md:text-4xl font-light text-center mb-6">

            {categoryTitle}
          </motion.h1>
        </div>
      }

      {/* Main Content: Sidebar + Grid */}
      <div className="container py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
<<<<<<< HEAD
          <aside className="hidden md:block w-[200px] shrink-0 sticky top-24 self-start">
=======
          <aside className="hidden md:block w-[200px] shrink-0 sticky top-24 self-start glass-card rounded-xl p-4">
>>>>>>> 722201c4b3fa35ca7224fe56def0f89732a240df
            <FilterSidebar />
          </aside>

          {/* Right Content */}
          <div className="flex-1 min-w-0">
            {/* Header: mobile filter + count + sort */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {/* Mobile filter trigger */}
                {isMobile &&
                <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs uppercase tracking-[0.1em]">
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        Filter
                        {activeFilterCount > 0 &&
                      <span className="ml-1 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center">
                            {activeFilterCount}
                          </span>
                      }
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[280px]">
                      <SheetHeader>
                        <SheetTitle className="text-sm uppercase tracking-[0.1em]">Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterSidebar />
                      </div>
                    </SheetContent>
                  </Sheet>
                }
                <span className="text-xs text-muted-foreground">
                  {filtered.length} product{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-[160px] text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
<<<<<<< HEAD
                  <SelectContent className="bg-popover border border-border z-50">
=======
                  <SelectContent className="glass-heavy bg-background/80 border border-white/10 z-50">
>>>>>>> 722201c4b3fa35ca7224fe56def0f89732a240df
                    {SORT_OPTIONS.map((opt) =>
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    )}
                  </SelectContent>
                </Select>

                <div className="hidden md:flex items-center gap-1 border-l border-border pl-2 ml-1">
                  <button
                    onClick={() => setGridView("large")}
                    className={`h-8 w-8 flex items-center justify-center rounded-sm transition-colors ${gridView === "large" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                    aria-label="Large grid">

                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setGridView("small")}
                    className={`h-8 w-8 flex items-center justify-center rounded-sm transition-colors ${gridView === "small" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                    aria-label="Small grid">

                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setGridView("list")}
                    className={`h-8 w-8 flex items-center justify-center rounded-sm transition-colors ${gridView === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                    aria-label="List view">

                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ?
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) =>
              <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-sm" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
              )}
              </div> :
            filtered.length === 0 ?
            <p className="text-center text-muted-foreground py-20">No products found</p> :

            <div className={`grid gap-4 ${
            gridView === "large" ? "grid-cols-1 md:grid-cols-2" :
            gridView === "list" ? "grid-cols-1" :
            "grid-cols-2 md:grid-cols-3"}`
            }>
                {filtered.map((product, i) =>
              <motion.div
                key={product.node.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}>

                    {gridView === "list" ?
                <Link to={`/product/${product.node.handle}`} state={{ fromCategory: categoryParam, fromCategoryTitle: categoryTitle }} className="flex items-center gap-4 border-b border-border pb-4">
<<<<<<< HEAD
                        <div className="w-20 h-20 shrink-0 rounded-sm overflow-hidden">
=======
                        <div className="w-44 h-44 shrink-0 rounded-sm overflow-hidden">
>>>>>>> 722201c4b3fa35ca7224fe56def0f89732a240df
                          {product.node.images.edges[0]?.node.url ?
                    <img src={product.node.images.edges[0].node.url} alt={product.node.title} className="w-full h-full object-cover" loading="lazy" /> :
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-[10px]">No image</div>
                    }
                        </div>
                        <p className="text-sm font-medium truncate flex-1">{product.node.title}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          <p className="text-sm font-semibold">₦{parseFloat(product.node.priceRange.minVariantPrice.amount).toLocaleString()}</p>
                          {!product.node.availableForSale && <span className="text-[10px] text-muted-foreground">Sold out</span>}
                        </div>
                      </Link> :

                <ProductCard product={product} linkState={{ fromCategory: categoryParam, fromCategoryTitle: categoryTitle }} />
                }
                  </motion.div>
              )}
              </div>
            }
          </div>
        </div>
      </div>
    </div>);

}