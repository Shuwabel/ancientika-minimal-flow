import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/lib/mock-data";
import { useCart } from "@/lib/cart-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const { addItem } = useCart();
  const isOnSale = !!product.compareAtPrice;
  const discount = isOnSale
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  return (
    <div
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Base Card */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-[3/4] bg-muted rounded-sm overflow-hidden relative">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isOnSale && (
              <Badge className="bg-accent text-accent-foreground text-[10px] rounded-sm">
                -{discount}%
              </Badge>
            )}
            {!product.inStock && (
              <Badge variant="secondary" className="text-[10px] rounded-sm">
                Sold Out
              </Badge>
            )}
            {product.inStock && product.stockCount <= 5 && (
              <Badge variant="outline" className="text-[10px] rounded-sm bg-background/80">
                Only {product.stockCount} left
              </Badge>
            )}
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-sm font-medium">{product.name}</p>
          <div className="flex items-center gap-2">
            <p className="text-sm">${product.price}</p>
            {isOnSale && (
              <p className="text-xs text-muted-foreground line-through">${product.compareAtPrice}</p>
            )}
          </div>
        </div>
      </Link>

      {/* Quick-View Overlay on Hover */}
      <AnimatePresence>
        {hovered && product.inStock && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border border-border rounded-sm p-4 shadow-lg z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Size Selector */}
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
                Size
              </p>
              <div className="flex flex-wrap gap-1">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedSize(size);
                    }}
                    className={`h-7 min-w-[2rem] px-2 text-[11px] border rounded-sm transition-colors ${
                      selectedSize === size
                        ? "border-foreground bg-primary text-primary-foreground"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
                Color — {selectedColor.name}
              </p>
              <div className="flex gap-1.5">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedColor(color);
                    }}
                    className={`h-5 w-5 rounded-full border-2 transition-all ${
                      selectedColor.name === color.name
                        ? "border-foreground scale-110"
                        : "border-transparent hover:border-muted-foreground"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              size="sm"
              className="w-full uppercase tracking-[0.1em] text-xs gap-2"
              onClick={(e) => {
                e.preventDefault();
                addItem(product, selectedSize, selectedColor.name);
              }}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Add to Cart
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
