import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, SlidersHorizontal, LayoutGrid, Grid2x2, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import { fetchProducts, fetchCollections, type ShopifyProduct } from "@/lib/shopify";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

type SortOption = "featured" | "price-asc" | "price-desc" | "newest";
type ViewMode = "large" | "small" | "list";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Best selling" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

function getGridClass(viewMode: ViewMode) {
  switch (viewMode) {
    case "large": return "grid-cols-1 md:grid-cols-2";
    case "small": return "grid-cols-2 md:grid-cols-3";
    case "list": return "grid-cols-1";
  }
}

export default function Shop() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const isMobile = useIsMobile();
  const searchQuery = searchParams.get("q") || "";

  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [viewMode, setViewMode] = useState<ViewMode>("small");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [showInStock, setShowInStock] = useState(false);
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [priceInitialized, setPriceInitialized] = useState(false);

  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['shopify-products'],
    queryFn: () => fetchProducts(50),
  });

  const { data: collections = [] } = useQuery({
    queryKey: ['shopify-collections'],
    queryFn: () => fetchCollections(10),
  });

  const activeCollection = useMemo(() => {
    if (categoryParam === "all") return null;
    return collections.find((c) => c.node.handle === categoryParam) || null;
  }, [collections, categoryParam]);

  // Products in current category (before user filters)
  const categoryProducts = useMemo(() => {
    if (categoryParam === "all") return products;
    return products.filter(p => (p.node.productType || "").toLowerCase() === categoryParam.toLowerCase());
  }, [products, categoryParam]);

  // Dynamic counts
  const inStockCount = useMemo(() => categoryProducts.filter(p => p.node.availableForSale).length, [categoryProducts]);
  const outOfStockCount = useMemo(() => categoryProducts.filter(p => !p.node.availableForSale).length, [categoryProducts]);

  const maxPriceInCollection = useMemo(() => {
    if (categoryProducts.length === 0) return 100000;
    return Math.ceil(Math.max(...categoryProducts.map(p => parseFloat(p.node.priceRange.minVariantPrice.amount))));
  }, [categoryProducts]);

  useMemo(() => {
    if (maxPriceInCollection > 0 && !priceInitialized) {
      setPriceRange([0, maxPriceInCollection]);
      setPriceInitialized(true);
    }
  }, [maxPriceInCollection, priceInitialized]);

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    categoryProducts.forEach(p => {
      p.node.options.forEach(opt => {
        if (opt.name.toLowerCase() === "size") {
          opt.values.forEach(v => sizes.add(v));
        }
      });
    });
    return Array.from(sizes);
  }, [categoryProducts]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const activeFilterCount = selectedSizes.length + (showInStock ? 1 : 0) + (showOutOfStock ? 1 : 0) +
    (priceInitialized && (priceRange[0] > 0 || priceRange[1] < maxPriceInCollection) ? 1 : 0);

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
      if (showInStock && !showOutOfStock && !p.node.availableForSale) return false;
      if (showOutOfStock && !showInStock && p.node.availableForSale) return false;
      if (selectedSizes.length > 0) {
        const productSizes = p.node.options.find(o => o.name.toLowerCase() === "size")?.values || [];
        if (!selectedSizes.some(s => productSizes.includes(s))) return false;
      }
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

  const categoryTitle = categoryParam === "all"
    ? "All Products"
    : activeCollection?.node.title || categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);

  const formatPrice = (val: number) => `₦${val.toLocaleString()}`;

  const FilterSidebar = () => (
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
            className="w-full"
          />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Size */}
      {availableSizes.length > 0 && (
        <Collapsible open={sizeOpen} onOpenChange={setSizeOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-xs uppercase tracking-[0.15em] font-medium text-foreground border-b border-border">
            Size
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${sizeOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 pb-4">
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
          </CollapsibleContent>
        </Collapsible>
      )}

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" className="w-full text-xs mt-4 uppercase tracking-[0.1em]" onClick={clearFilters}>
          Clear all filters
        </Button>
      )}
    </div>
  );

  // List view product row
  const ListProductRow = ({ product }: { product: ShopifyProduct }) => {
    const node = product.node;
    const price = parseFloat(node.priceRange.minVariantPrice.amount);
    const currency = node.priceRange.minVariantPrice.currencyCode;
    const compareAt = node.compareAtPriceRange?.minVariantPrice?.amount
      ? parseFloat(node.compareAtPriceRange.minVariantPrice.amount)
      : null;
    const isOnSale = compareAt != null && compareAt > price;
    const discount = isOnSale ? Math.round(((compareAt! - price) / compareAt!) * 100) : 0;
    const imageUrl = node.images.edges[0]?.node.url;
    const currencySymbol = currency === 'USD' ? '$' : currency === 'NGN' ? '₦' : currency;

    return (
      <Link to={`/product/${node.handle}`} className="flex gap-4 border-b border-border py-3 group hover:bg-muted/30 transition-colors">
        <div className="w-[140px] md:w-[200px] shrink-0 aspect-[3/4] rounded-sm overflow-hidden relative">
          {imageUrl ? (
            <img src={imageUrl} alt={node.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs bg-muted">No image</div>
          )}
          {isOnSale && (
            <Badge className="absolute top-1.5 left-1.5 bg-accent text-accent-foreground text-[10px] rounded-sm">-{discount}%</Badge>
          )}
          {!node.availableForSale && (
            <Badge variant="secondary" className="absolute top-1.5 left-1.5 text-[10px] rounded-sm">Sold Out</Badge>
          )}
        </div>
        <div className="flex-1 min-w-0 py-1">
          <p className="text-sm font-medium truncate">{node.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm">{currencySymbol}{price.toFixed(2)}</p>
            {isOnSale && (
              <p className="text-xs text-muted-foreground line-through">{currencySymbol}{compareAt!.toFixed(2)}</p>
            )}
          </div>
          {node.productType && (
            <p className="text-xs text-muted-foreground mt-2">{node.productType}</p>
          )}
          {!node.availableForSale && (
            <p className="text-xs text-muted-foreground mt-1">Out of stock</p>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div>
      {/* Hero Banner */}
      {activeCollection?.node.image ? (
        <div className="relative w-full overflow-hidden" style={{ height: 'clamp(150px, 22vh, 300px)' }}>
          <img
            src={activeCollection.node.image.url}
            alt={activeCollection.node.image.altText || categoryTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-end p-4 md:p-8">
            <h1 className="text-2xl md:text-4xl font-light text-white uppercase tracking-wider">
              {categoryTitle}
            </h1>
          </div>
        </div>
      ) : (
        <div className="container pt-10">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl md:text-4xl font-light text-center mb-6"
          >
            {categoryTitle}
          </motion.h1>
        </div>
      )}

      {/* Sticky Collection Control Bar */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-12">
          {/* Left: mobile filter + title + count */}
          <div className="flex items-center gap-3">
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs uppercase tracking-[0.1em]">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filter
                    {activeFilterCount > 0 && (
                      <span className="ml-1 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center">
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
                    <FilterSidebar />
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <span className="text-xs text-muted-foreground">
              {categoryTitle} — {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Right: view mode + sort */}
          <div className="flex items-center gap-2 ml-auto">
            {/* View mode buttons */}
            <div className="hidden md:flex items-center gap-1 border border-border rounded-sm">
              <button
                onClick={() => setViewMode("large")}
                className={`p-1.5 transition-colors ${viewMode === "large" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                title="Large view"
              >
                <Grid2x2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("small")}
                className={`p-1.5 transition-colors ${viewMode === "small" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                title="Small view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 transition-colors ${viewMode === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                title="List view"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[160px] text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                {SORT_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content: Sidebar + Grid */}
      <div className="container py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-[200px] shrink-0 sticky top-28 self-start">
            <FilterSidebar />
          </aside>

          {/* Product Area */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className={`grid ${getGridClass(viewMode)} gap-4`}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-sm" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-20">No products found</p>
            ) : viewMode === "list" ? (
              <div className="space-y-0">
                {filtered.map((product, i) => (
                  <motion.div
                    key={product.node.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <ListProductRow product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className={`grid ${getGridClass(viewMode)} gap-4`}>
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
        </div>
      </div>
    </div>
  );
}
