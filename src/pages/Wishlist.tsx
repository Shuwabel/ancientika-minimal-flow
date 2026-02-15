import { useWishlistStore } from "@/stores/wishlistStore";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Wishlist() {
  const { items: wishlistIds } = useWishlistStore();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(50),
  });

  const wishlisted = products.filter((p: ShopifyProduct) =>
    wishlistIds.includes(p.node.id)
  );

  return (
    <main className="container py-12 min-h-[60vh]">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Wishlist</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-muted rounded-sm animate-pulse" />
          ))}
        </div>
      ) : wishlisted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
          <Link
            to="/shop"
            className="text-sm uppercase tracking-[0.15em] underline underline-offset-4 hover:text-accent transition-colors"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {wishlisted.map((product: ShopifyProduct) => (
            <ProductCard key={product.node.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
