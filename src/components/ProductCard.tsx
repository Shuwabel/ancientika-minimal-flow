import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Eye, Zap, Loader2 } from "lucide-react";
import type { ShopifyProduct } from "@/lib/shopify";
import { Badge } from "@/components/ui/badge";
import MobileQuickAdd from "@/components/MobileQuickAdd";
import QuickViewModal from "@/components/QuickViewModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { buyNow } from "@/lib/shopify";

export default function ProductCard({ product, aspectRatio }: { product: ShopifyProduct; aspectRatio?: string }) {
  const [hovered, setHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const isMobile = useIsMobile();
  const { addItem, isLoading: cartLoading } = useCartStore();
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

  const firstVariant = node.variants.edges[0]?.node;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant) return;
    await addItem({
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions,
    });
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant || !node.availableForSale) return;
    setBuyingNow(true);
    try {
      const checkoutUrl = await buyNow({
        product,
        variantId: firstVariant.id,
        variantTitle: firstVariant.title,
        price: firstVariant.price,
        quantity: 1,
        selectedOptions: firstVariant.selectedOptions,
      });
      if (checkoutUrl) window.open(checkoutUrl, '_blank');
    } finally {
      setBuyingNow(false);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const resolvedAspect = aspectRatio || "1/1";

  return (
    <>
      <div
        className="group relative"
        onMouseEnter={() => !isMobile && setHovered(true)}
        onMouseLeave={() => !isMobile && setHovered(false)}
      >
        <Link to={`/product/${node.handle}`} className="block">
          <div
            className="rounded-sm overflow-hidden relative"
            style={{ aspectRatio: resolvedAspect }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={node.images.edges[0]?.node.altText || node.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
            )}

            {/* Badges */}
            <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
              {isOnSale && (
                <Badge className="bg-accent text-accent-foreground text-[10px] rounded-sm">-{discount}%</Badge>
              )}
              {!node.availableForSale && (
                <Badge variant="secondary" className="text-[10px] rounded-sm">Sold Out</Badge>
              )}
            </div>

            {/* Mobile: always-visible quick-add button */}
            {isMobile && node.availableForSale && (
              <MobileQuickAdd product={product} />
            )}

            {/* Desktop: hover overlay with Add to Cart, Buy Now, Quick View */}
            {!isMobile && node.availableForSale && (
              <AnimatePresence>
                {hovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute inset-0 z-10 bg-black/40 flex flex-col items-center justify-center gap-2"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  >
                    {/* Quick View eye icon - top right */}
                    <button
                      onClick={handleQuickView}
                      className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background flex items-center justify-center shadow-sm hover:bg-background/90 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5 text-foreground" />
                    </button>

                    {/* Center buttons */}
                    <button
                      onClick={handleQuickAdd}
                      disabled={cartLoading}
                      className="flex items-center gap-1.5 bg-background text-foreground px-4 py-2 rounded-sm text-[11px] uppercase tracking-[0.1em] font-medium hover:bg-background/90 transition-colors shadow-sm"
                    >
                      {cartLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShoppingBag className="h-3 w-3" />}
                      Add to Cart
                    </button>
                    <button
                      onClick={handleBuyNow}
                      disabled={buyingNow}
                      className="flex items-center gap-1.5 bg-background text-foreground px-4 py-2 rounded-sm text-[11px] uppercase tracking-[0.1em] font-medium hover:bg-background/90 transition-colors shadow-sm"
                    >
                      {buyingNow ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                      Buy Now
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          <div className="mt-2 space-y-0.5">
            <p className="text-xs font-medium truncate">{node.title}</p>
            <div className="flex items-center gap-1.5">
              <p className="text-xs">{currencySymbol}{price.toFixed(2)}</p>
              {isOnSale && (
                <p className="text-[10px] text-muted-foreground line-through">{currencySymbol}{compareAt!.toFixed(2)}</p>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal product={product} open={quickViewOpen} onOpenChange={setQuickViewOpen} />
    </>
  );
}
