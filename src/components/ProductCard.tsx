import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import type { ShopifyProduct } from "@/lib/shopify";
import { useWishlistStore } from "@/stores/wishlistStore";
import { Badge } from "@/components/ui/badge";
import QuickAddPopover from "@/components/QuickAddPopover";
import MobileQuickAdd from "@/components/MobileQuickAdd";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

export default function ProductCard({ product }: { product: ShopifyProduct }) {
  const [hovered, setHovered] = useState(false);
  const isMobile = useIsMobile();
  const node = product.node;
  const { toggleItem, isInWishlist } = useWishlistStore();
  const wishlisted = isInWishlist(node.id);

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
    <div
      className="group relative"
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
    >
      <Link to={`/product/${node.handle}`} className="block">
        <div className="aspect-square bg-muted rounded-sm overflow-hidden relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={node.images.edges[0]?.node.altText || node.title}
              className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
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

          {/* Mobile: always-visible wishlist */}
          {isMobile && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleItem(node.id); }}
              className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border/50"
            >
              <Heart className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500" : "text-foreground"}`} />
            </button>
          )}

          {/* Desktop: hover icons */}
          {!isMobile && (
            <AnimatePresence>
              {(hovered || wishlisted) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-2 right-2 flex flex-col gap-1.5 z-10"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                >
                  <button
                    onClick={() => toggleItem(node.id)}
                    className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border/50 hover:bg-background transition-colors"
                  >
                    <Heart className={`h-4 w-4 transition-colors ${wishlisted ? "fill-red-500 text-red-500" : "text-foreground"}`} />
                  </button>
                  {node.availableForSale && (
                    <QuickAddPopover product={product}>
                      <button className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border/50 hover:bg-background transition-colors">
                        <ShoppingBag className="h-4 w-4 text-foreground" />
                      </button>
                    </QuickAddPopover>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-sm font-medium">{node.title}</p>
          <div className="flex items-center gap-2">
            <p className="text-sm">{currencySymbol}{price.toFixed(2)}</p>
            {isOnSale && (
              <p className="text-xs text-muted-foreground line-through">{currencySymbol}{compareAt!.toFixed(2)}</p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
