import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Eye } from "lucide-react";
import type { ShopifyProduct } from "@/lib/shopify";
import { Badge } from "@/components/ui/badge";
import MobileQuickAdd from "@/components/MobileQuickAdd";
import QuickViewModal from "@/components/QuickViewModal";
import DesktopQuickAdd from "@/components/DesktopQuickAdd";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

export default function ProductCard({ product, aspectRatio }: { product: ShopifyProduct; aspectRatio?: string }) {
  const [hovered, setHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const isMobile = useIsMobile();
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

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickAddOpen(true);
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

            {/* Mobile: cart icon trigger */}
            {isMobile && node.availableForSale && (
              <MobileQuickAdd product={product} />
            )}

            {/* Desktop: two small hover icons, top-right, vertically stacked */}
            {!isMobile && node.availableForSale && (
              <AnimatePresence>
                {hovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-2 right-2 z-10 flex flex-col gap-1.5"
                  >
                    <button
                      onClick={handleQuickView}
                      className="h-7 w-7 flex items-center justify-center transition-transform hover:scale-110"
                    >
                      <Eye className="h-4 w-4 text-foreground fill-foreground" />
                    </button>
                    <button
                      onClick={handleQuickAdd}
                      className="h-7 w-7 flex items-center justify-center transition-transform hover:scale-110"
                    >
                      <ShoppingBag className="h-4 w-4 text-foreground fill-foreground" />
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
      {/* Desktop Quick Add Dialog */}
      <DesktopQuickAdd product={product} open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </>
  );
}
