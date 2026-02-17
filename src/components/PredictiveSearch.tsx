import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProducts, fetchCollections, type ShopifyProduct, type ShopifyCollection } from "@/lib/shopify";
import { useIsMobile } from "@/hooks/use-mobile";

interface PredictiveSearchProps {
  open: boolean;
  onClose: () => void;
}

export default function PredictiveSearch({ open, onClose }: PredictiveSearchProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [collections, setCollections] = useState<ShopifyCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Auto-focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setProducts([]);
      setCollections([]);
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setProducts([]);
      setCollections([]);
      return;
    }
    setLoading(true);
    try {
      const [prods, cols] = await Promise.all([
        fetchProducts(4, q),
        fetchCollections(10),
      ]);
      setProducts(prods.slice(0, 4));
      // Filter collections by query match
      const filtered = cols.filter(c =>
        c.node.title.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 3);
      setCollections(filtered);
    } catch {
      setProducts([]);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleShowAll = () => {
    if (query.length >= 2) {
      handleNavigate(`/shop?q=${encodeURIComponent(query)}`);
    }
  };

  // Build suggestions from real Shopify data (product + collection titles)
  const suggestions = query.length >= 2
    ? [
        ...products.map(p => p.node.title),
        ...collections.map(c => c.node.title),
      ]
        .filter((t, i, arr) => arr.indexOf(t) === i) // dedupe
        .slice(0, 3)
    : [];

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-start justify-center"
          onClick={onClose}
        >
          {/* Panel — stop clicks from closing */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className={`mt-16 bg-background border border-border shadow-2xl overflow-hidden ${
              isMobile ? "w-full mx-2 rounded-lg" : "w-full max-w-[1000px] rounded-lg"
            }`}
          >
            {/* Search input */}
            <div className="flex items-center border-b border-border px-4 py-3">
              <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, collections..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleShowAll();
                }}
              />
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />}
              <button onClick={onClose} className="p-1 hover:text-accent transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Results */}
            {query.length >= 2 && (
              <div className={`max-h-[70vh] overflow-y-auto ${isMobile ? "p-4 space-y-5" : "p-6"}`}>
                {isMobile ? (
                  // MOBILE: stacked layout
                  <>
                    {suggestions.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Suggestions</p>
                        <div className="space-y-1">
                          {suggestions.map((s) => (
                            <button
                              key={s}
                              onClick={() => setQuery(s)}
                              className="flex items-center gap-2 w-full text-left text-sm py-1.5 hover:text-accent transition-colors"
                            >
                              <Search className="h-3.5 w-3.5 text-muted-foreground" />
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {collections.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Collections</p>
                        <div className="space-y-1">
                          {collections.map((col) => (
                            <button
                              key={col.node.handle}
                              onClick={() => handleNavigate(`/shop?category=${col.node.handle}`)}
                              className="block w-full text-left text-sm py-1.5 hover:text-accent transition-colors"
                            >
                              {col.node.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {products.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Products</p>
                        <div className="space-y-3">
                          {products.map((p) => (
                            <ProductRow key={p.node.id} product={p} onNavigate={handleNavigate} />
                          ))}
                        </div>
                      </div>
                    )}

                    {!loading && products.length === 0 && collections.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-6">No results found</p>
                    )}
                  </>
                ) : (
                  // DESKTOP: two-column layout
                  <div className="grid grid-cols-[1fr_1.5fr] gap-8">
                    {/* Left column: suggestions + collections */}
                    <div className="space-y-6">
                      {suggestions.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Suggestions</p>
                          <div className="space-y-1">
                            {suggestions.map((s) => (
                              <button
                                key={s}
                                onClick={() => setQuery(s)}
                                className="flex items-center gap-2 w-full text-left text-sm py-1.5 hover:text-accent transition-colors"
                              >
                                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {collections.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Collections</p>
                          <div className="space-y-1">
                            {collections.map((col) => (
                              <button
                                key={col.node.handle}
                                onClick={() => handleNavigate(`/shop?category=${col.node.handle}`)}
                                className="block w-full text-left text-sm py-1.5 hover:text-accent transition-colors"
                              >
                                {col.node.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right column: products */}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Products</p>
                      {products.length > 0 ? (
                        <div className="space-y-3">
                          {products.map((p) => (
                            <ProductRow key={p.node.id} product={p} onNavigate={handleNavigate} />
                          ))}
                        </div>
                      ) : !loading ? (
                        <p className="text-sm text-muted-foreground py-4">No products found</p>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Show all results footer */}
            {query.length >= 2 && (products.length > 0 || collections.length > 0) && (
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProductRow({ product, onNavigate }: { product: ShopifyProduct; onNavigate: (path: string) => void }) {
  const node = product.node;
  const price = parseFloat(node.priceRange.minVariantPrice.amount);
  const currency = node.priceRange.minVariantPrice.currencyCode;
  const currencySymbol = currency === 'USD' ? '$' : currency === 'NGN' ? '₦' : currency;
  const imageUrl = node.images.edges[0]?.node.url;

  return (
    <button
      onClick={() => onNavigate(`/product/${node.handle}`)}
      className="flex items-center gap-3 w-full text-left hover:bg-muted/50 rounded-sm p-1.5 transition-colors"
    >
      {imageUrl ? (
        <img src={imageUrl} alt={node.title} className="h-14 w-14 object-cover rounded-sm shrink-0" />
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
