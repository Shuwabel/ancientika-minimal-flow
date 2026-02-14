import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockProducts } from "@/lib/mock-data";
import { useCart } from "@/lib/cart-context";
import ProductCard from "@/components/ProductCard";

export default function ProductDetail() {
  const { id } = useParams();
  const product = mockProducts.find((p) => p.id === id);
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(product?.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Product not found</p>
        <Link to="/shop" className="text-sm underline mt-4 inline-block">
          Back to shop
        </Link>
      </div>
    );
  }

  const related = mockProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  const isOnSale = !!product.compareAtPrice;

  const handleAddToCart = () => {
    setLoading(true);
    setTimeout(() => {
      for (let i = 0; i < quantity; i++) {
        addItem(product, selectedSize, selectedColor?.name || "");
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="container py-8">
      <Link
        to="/shop"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="aspect-[3/4] bg-muted rounded-sm overflow-hidden"
        >
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col"
        >
          <div className="flex items-start gap-2 mb-2">
            {isOnSale && (
              <Badge className="bg-accent text-accent-foreground text-[10px] rounded-sm">
                Sale
              </Badge>
            )}
            {!product.inStock && (
              <Badge variant="secondary" className="text-[10px] rounded-sm">
                Sold Out
              </Badge>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-light mb-2">{product.name}</h1>
          <div className="flex items-center gap-3 mb-6">
            <p className="text-xl">${product.price}</p>
            {isOnSale && (
              <p className="text-sm text-muted-foreground line-through">
                ${product.compareAtPrice}
              </p>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Stock indicator */}
          {product.inStock && product.stockCount <= 10 && (
            <p className="text-xs text-accent mb-4">Only {product.stockCount} left in stock</p>
          )}

          {/* Size */}
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`h-9 min-w-[2.5rem] px-3 text-xs border rounded-sm transition-colors ${
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

          {/* Color */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
              Color — {selectedColor?.name}
            </p>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${
                    selectedColor?.name === color.name
                      ? "border-foreground scale-110"
                      : "border-transparent hover:border-muted-foreground"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex gap-3 mt-auto">
            <div className="flex items-center border border-border rounded-sm">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10 flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-10 flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button
              size="lg"
              className="flex-1 uppercase tracking-[0.1em] gap-2"
              disabled={!product.inStock || loading}
              onClick={handleAddToCart}
            >
              {loading ? (
                <span className="animate-pulse">Adding...</span>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  {product.inStock ? "Add to Cart" : "Sold Out"}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-20 pt-10 border-t border-border">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8 text-center">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
