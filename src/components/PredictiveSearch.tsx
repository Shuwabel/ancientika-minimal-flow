import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { fetchProducts, fetchCollections, type ShopifyProduct, type ShopifyCollection } from "@/lib/shopify";
import { useIsMobile } from "@/hooks/use-mobile";

type SearchState = "idle" | "loading" | "results" | "empty";

interface PredictiveSearchProps {
  open: boolean;
  query: string;
  onClose: () => void;
  onNavigate: (path: string) => void;
  headerRef?: React.RefObject<HTMLElement>;
}

function normalizeArray<T>(val: unknown): T[] {
  return Array.isArray(val) ? val : [];
}

export default function PredictiveSearch({ open, query, onClose, onNavigate, headerRef }: PredictiveSearchProps) {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [collections, setCollections] = useState<ShopifyCollection[]>([]);
  const [fallbackCollections, setFallbackCollections] = useState<ShopifyCollection[]>([]);
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const isMobile = useIsMobile();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const panelRef = useRef<HTMLDivElement>(null);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setProducts([]);
      setCollections([]);
      setSearchState("idle");
    }
  }, [open]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(target) &&
        (!headerRef?.current || !headerRef.current.contains(target))
      ) {
        onClose();
      }
    };
    const timer = setTimeout(() => document.addEventListener("mousedown", handler), 100);
    return () => { clearTimeout(timer); document.removeEventListener("mousedown", handler); };
  }, [open, onClose]);

  // Load fallback collections once
  useEffect(() => {
    if (fallbackCollections.length > 0) return;
    fetchCollections(10)
      .then(cols => setFallbackCollections(normalizeArray(cols)))
      .catch(() => setFallbackCollections([]));
  }, [fallbackCollections.length]);

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setProducts([]);
      setCollections([]);
      setSearchState("idle");
      return;
    }
    setSearchState("loading");
    try {
      const [rawProds, rawCols] = await Promise.all([
        fetchProducts(4, q).catch(() => []),
        fetchCollections(10).catch(() => []),
      ]);
      const prods = normalizeArray<ShopifyProduct>(rawProds).slice(0, 4);
      const filtered = normalizeArray<ShopifyCollection>(rawCols)
        .filter(c => c?.node?.title?.toLowerCase().includes(q.toLowerCase()))
        .slice(0, 3);

      setProducts(prods);
      setCollections(filtered);
      setSearchState(prods.length > 0 || filtered.length > 0 ? "results" : "empty");
    } catch {
      setProducts([]);
      setCollections([]);
      setSearchState("empty");
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);

  const handleShowAll = () => {
    if (query.length >= 2) {
      onNavigate(`/shop?q=${encodeURIComponent(query)}`);
    }
  };

  const suggestions = searchState === "results"
    ? [
        ...products.map(p => p?.node?.title).filter(Boolean),
        ...collections.map(c => c?.node?.title).filter(Boolean),
      ]
        .filter((t, i, arr) => arr.indexOf(t) === i)
        .slice(0, 3)
    : [];

  // Show panel when query is long enough and not idle
  const showPanel = open && query.length >= 2 && searchState !== "idle";

  if (!showPanel) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.15 }}
        className={`fixed left-0 right-0 top-16 z-30 bg-background shadow-xl ${
          isMobile ? "" : "max-w-[1000px] mx-auto"
        }`}
      >
        <div className={`max-h-[70vh] overflow-y-auto ${isMobile ? "p-4 space-y-5" : "p-6"}`}>
          {searchState === "loading" && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Searching…</span>
            </div>
          )}

          {searchState === "empty" && (
            <EmptyState
              query={query}
              fallbackCollections={fallbackCollections}
              onNavigate={onNavigate}
            />
          )}

          {searchState === "results" && (
            <>
              {isMobile ? (
                <MobileResults
                  suggestions={suggestions}
                  collections={collections}
                  products={products}
                  onNavigate={onNavigate}
                />
              ) : (
                <DesktopResults
                  suggestions={suggestions}
                  collections={collections}
                  products={products}
                  onNavigate={onNavigate}
                />
              )}
            </>
          )}
        </div>

        {searchState === "results" && (products.length > 0 || collections.length > 0) && (
          <div className="border-t border-border px-4 py-3">
            <button
              onClick={handleShowAll}
              className="flex items-center gap-1.5 text-sm text-accent hover:underline transition-colors"
            >
              Show all results for &lsquo;{query}&rsquo;
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// --- Empty State ---

function EmptyState({ query, fallbackCollections, onNavigate }: {
  query: string;
  fallbackCollections: ShopifyCollection[];
  onNavigate: (path: string) => void;
}) {
  const safeCollections = normalizeArray<ShopifyCollection>(fallbackCollections).slice(0, 3);

  return (
    <div className="py-6 text-center space-y-4">
      <div>
        <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
        <p className="text-xs text-muted-foreground mt-1">Try a different keyword or browse our collections.</p>
      </div>
      {safeCollections.length > 0 && (
        <div className="text-left">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Browse Collections</p>
          <div className="space-y-1">
            {safeCollections.map((col) => (
              <button
                key={col.node?.handle || col.node?.id}
                onClick={() => onNavigate(`/shop?category=${col.node?.handle}`)}
                className="block w-full text-left text-sm py-1.5 hover:text-accent transition-colors"
              >
                {col.node?.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---

function MobileResults({ suggestions, collections, products, onNavigate }: {
  suggestions: string[];
  collections: ShopifyCollection[];
  products: ShopifyProduct[];
  onNavigate: (path: string) => void;
}) {
  const safeProducts = normalizeArray<ShopifyProduct>(products);
  const safeCollections = normalizeArray<ShopifyCollection>(collections);
  const safeSuggestions = normalizeArray<string>(suggestions);

  return (
    <>
      {safeSuggestions.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Suggestions</p>
          <div className="space-y-1">
            {safeSuggestions.map((s) => (
              <button key={s} className="flex items-center gap-2 w-full text-left text-sm py-1.5 hover:text-accent transition-colors">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      {safeCollections.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Collections</p>
          <div className="space-y-1">
            {safeCollections.map((col) => (
              <button key={col.node?.handle} onClick={() => onNavigate(`/shop?category=${col.node?.handle}`)} className="block w-full text-left text-sm py-1.5 hover:text-accent transition-colors">
                {col.node?.title}
              </button>
            ))}
          </div>
        </div>
      )}
      {safeProducts.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Products</p>
          <div className="space-y-3">
            {safeProducts.map((p) => (
              <ProductRow key={p.node?.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function DesktopResults({ suggestions, collections, products, onNavigate }: {
  suggestions: string[];
  collections: ShopifyCollection[];
  products: ShopifyProduct[];
  onNavigate: (path: string) => void;
}) {
  const safeProducts = normalizeArray<ShopifyProduct>(products);
  const safeCollections = normalizeArray<ShopifyCollection>(collections);
  const safeSuggestions = normalizeArray<string>(suggestions);

  return (
    <div className="grid grid-cols-[1fr_1.5fr] gap-8">
      <div className="space-y-6">
        {safeSuggestions.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Suggestions</p>
            <div className="space-y-1">
              {safeSuggestions.map((s) => (
                <button key={s} className="flex items-center gap-2 w-full text-left text-sm py-1.5 hover:text-accent transition-colors">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {safeCollections.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Collections</p>
            <div className="space-y-1">
              {safeCollections.map((col) => (
                <button key={col.node?.handle} onClick={() => onNavigate(`/shop?category=${col.node?.handle}`)} className="block w-full text-left text-sm py-1.5 hover:text-accent transition-colors">
                  {col.node?.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Products</p>
        {safeProducts.length > 0 ? (
          <div className="space-y-3">
            {safeProducts.map((p) => (
              <ProductRow key={p.node?.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">No products found</p>
        )}
      </div>
    </div>
  );
}

function ProductRow({ product, onNavigate }: { product: ShopifyProduct; onNavigate: (path: string) => void }) {
  if (!product?.node) return null;
  const node = product.node;
  const amount = node.priceRange?.minVariantPrice?.amount;
  const price = amount ? parseFloat(amount) : 0;
  const currency = node.priceRange?.minVariantPrice?.currencyCode || "USD";
  const currencySymbol = currency === 'USD' ? '$' : currency === 'NGN' ? '₦' : currency;
  const imageUrl = node.images?.edges?.[0]?.node?.url;

  return (
    <button
      onClick={() => onNavigate(`/product/${node.handle}`)}
      className="flex items-center gap-3 w-full text-left hover:bg-muted/50 rounded-sm p-1.5 transition-colors"
    >
      {imageUrl ? (
        <img src={imageUrl} alt={node.title || ""} className="h-14 w-14 object-cover rounded-sm shrink-0" />
      ) : (
        <div className="h-14 w-14 bg-muted rounded-sm shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{node.title}</p>
        {node.productType && (
          <p className="text-[11px] text-muted-foreground truncate">{node.productType}</p>
        )}
        <p className="text-sm">{currencySymbol}{price.toFixed(2)}</p>
      </div>
    </button>
  );
}
