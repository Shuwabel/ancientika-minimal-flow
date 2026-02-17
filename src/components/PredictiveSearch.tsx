import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { fetchProducts, fetchCollections, type ShopifyProduct, type ShopifyCollection } from "@/lib/shopify";
import { useIsMobile } from "@/hooks/use-mobile";

interface PredictiveSearchProps {
  open: boolean;
  query: string;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export default function PredictiveSearch({ open, query, onClose, onNavigate }: PredictiveSearchProps) {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [collections, setCollections] = useState<ShopifyCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const panelRef = useRef<HTMLDivElement>(null);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setProducts([]);
      setCollections([]);
    }
  }, [open]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to avoid immediate close from the same click
    const timer = setTimeout(() => document.addEventListener("mousedown", handler), 100);
    return () => { clearTimeout(timer); document.removeEventListener("mousedown", handler); };
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

  const handleShowAll = () => {
    if (query.length >= 2) {
      onNavigate(`/shop?q=${encodeURIComponent(query)}`);
    }
  };

  const suggestions = query.length >= 2
    ? [
        ...products.map(p => p.node.title),
        ...collections.map(c => c.node.title),
      ]
        .filter((t, i, arr) => arr.indexOf(t) === i)
        .slice(0, 3)
    : [];

  const hasResults = query.length >= 2 && (products.length > 0 || collections.length > 0 || loading);

  if (!open || !hasResults) return null;

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
          {isMobile ? (
            <MobileResults
              suggestions={suggestions}
              collections={collections}
              products={products}
              loading={loading}
              onSetQuery={() => {}}
              onNavigate={onNavigate}
            />
          ) : (
            <DesktopResults
              suggestions={suggestions}
              collections={collections}
              products={products}
              loading={loading}
              onSetQuery={() => {}}
              onNavigate={onNavigate}
            />
          )}
        </div>

        {(products.length > 0 || collections.length > 0) && (
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

// --- Sub-components ---

function MobileResults({ suggestions, collections, products, loading, onNavigate }: {
  suggestions: string[];
  collections: ShopifyCollection[];
  products: ShopifyProduct[];
  loading: boolean;
  onSetQuery: (q: string) => void;
  onNavigate: (path: string) => void;
}) {
  return (
    <>
      {suggestions.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Suggestions</p>
          <div className="space-y-1">
            {suggestions.map((s) => (
              <button key={s} className="flex items-center gap-2 w-full text-left text-sm py-1.5 hover:text-accent transition-colors">
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
              <button key={col.node.handle} onClick={() => onNavigate(`/shop?category=${col.node.handle}`)} className="block w-full text-left text-sm py-1.5 hover:text-accent transition-colors">
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
              <ProductRow key={p.node.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}
      {!loading && products.length === 0 && collections.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No results found</p>
      )}
    </>
  );
}

function DesktopResults({ suggestions, collections, products, loading, onNavigate }: {
  suggestions: string[];
  collections: ShopifyCollection[];
  products: ShopifyProduct[];
  loading: boolean;
  onSetQuery: (q: string) => void;
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_1.5fr] gap-8">
      <div className="space-y-6">
        {suggestions.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Suggestions</p>
            <div className="space-y-1">
              {suggestions.map((s) => (
                <button key={s} className="flex items-center gap-2 w-full text-left text-sm py-1.5 hover:text-accent transition-colors">
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
                <button key={col.node.handle} onClick={() => onNavigate(`/shop?category=${col.node.handle}`)} className="block w-full text-left text-sm py-1.5 hover:text-accent transition-colors">
                  {col.node.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Products</p>
        {products.length > 0 ? (
          <div className="space-y-3">
            {products.map((p) => (
              <ProductRow key={p.node.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        ) : !loading ? (
          <p className="text-sm text-muted-foreground py-4">No products found</p>
        ) : null}
      </div>
    </div>
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
