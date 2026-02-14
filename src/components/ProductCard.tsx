import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2 } from "lucide-react";

export default function ProductCard({ product }: { product: ShopifyProduct }) {
  const [hovered, setHovered] = useState(false);
  const { addItem, isLoading } = useCartStore();
  const node = product.node;

  const price = parseFloat(node.priceRange.minVariantPrice.amount);
  const currency = node.priceRange.minVariantPrice.currencyCode;
  const compareAt = node.compareAtPriceRange?.minVariantPrice?.amount
    ? parseFloat(node.compareAtPriceRange.minVariantPrice.amount)
    : null;
  const isOnSale = compareAt != null && compareAt > price;
  const discount = isOnSale ? Math.round(((compareAt! - price) / compareAt!) * 100) : 0;
  const imageUrl = node.images.edges[0]?.node.url;
  const firstVariant = node.variants.edges[0]?.node;

  // Variant selection state for quick-view
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    node.options.forEach(opt => { defaults[opt.name] = opt.values[0]; });
    return defaults;
  });

  const getSelectedVariant = () => {
    return node.variants.edges.find(v =>
      v.node.selectedOptions.every(so => selectedOptions[so.name] === so.value)
    )?.node || firstVariant;
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    const variant = getSelectedVariant();
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions,
    });
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/product/${node.handle}`} className="block">
        <div className="aspect-[3/4] bg-muted rounded-sm overflow-hidden relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={node.images.edges[0]?.node.altText || node.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
          )}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isOnSale && (
              <Badge className="bg-accent text-accent-foreground text-[10px] rounded-sm">-{discount}%</Badge>
            )}
            {!node.availableForSale && (
              <Badge variant="secondary" className="text-[10px] rounded-sm">Sold Out</Badge>
            )}
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-sm font-medium">{node.title}</p>
          <div className="flex items-center gap-2">
            <p className="text-sm">{currency === 'USD' ? '$' : currency}{price.toFixed(2)}</p>
            {isOnSale && (
              <p className="text-xs text-muted-foreground line-through">${compareAt!.toFixed(2)}</p>
            )}
          </div>
        </div>
      </Link>

      {/* Quick-View Overlay */}
      <AnimatePresence>
        {hovered && node.availableForSale && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border border-border rounded-sm p-4 shadow-lg z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {node.options
              .filter(opt => !(opt.name === "Title" && opt.values.length === 1 && opt.values[0] === "Default Title"))
              .map(opt => (
                <div key={opt.name} className="mb-3">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
                    {opt.name} — {selectedOptions[opt.name]}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {opt.values.map(val => (
                      <button
                        key={val}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedOptions(prev => ({ ...prev, [opt.name]: val }));
                        }}
                        className={`h-7 min-w-[2rem] px-2 text-[11px] border rounded-sm transition-colors ${
                          selectedOptions[opt.name] === val
                            ? "border-foreground bg-primary text-primary-foreground"
                            : "border-border hover:border-foreground"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

            <Button
              size="sm"
              className="w-full uppercase tracking-[0.1em] text-xs gap-2"
              disabled={isLoading}
              onClick={handleAddToCart}
            >
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShoppingBag className="h-3.5 w-3.5" />}
              Add to Cart
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
