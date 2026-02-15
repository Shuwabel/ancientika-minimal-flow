import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Minus, Plus, Loader2, Ruler, Sparkles, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProductByHandle, fetchProducts, buyNow } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useSizeStore } from "@/stores/sizeStore";
import { getCategoryFromProductType } from "@/lib/size-data";
import ProductCard from "@/components/ProductCard";
import SizeGuideModal from "@/components/SizeGuideModal";
import SizeRecommenderModal from "@/components/SizeRecommenderModal";

const SIZE_ORDER: Record<string, number> = {
  XXS: 0, XS: 1, S: 2, M: 3, L: 4, XL: 5, XXL: 6, XXXL: 7,
  "2XL": 6, "3XL": 7, "4XL": 8,
};

function sortSizes(values: string[]): string[] {
  return [...values].sort((a, b) => {
    const aOrder = SIZE_ORDER[a.toUpperCase()];
    const bOrder = SIZE_ORDER[b.toUpperCase()];
    if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
    if (aOrder !== undefined) return -1;
    if (bOrder !== undefined) return 1;
    const aNum = parseFloat(a), bNum = parseFloat(b);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return a.localeCompare(b);
  });
}

export default function ProductDetail() {
  const { handle } = useParams();
  const { addItem, isLoading: cartLoading } = useCartStore();
  const { getRecommendation } = useSizeStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [optionsInitialized, setOptionsInitialized] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['shopify-product', handle],
    queryFn: () => fetchProductByHandle(handle!),
    enabled: !!handle,
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ['shopify-products'],
    queryFn: () => fetchProducts(50),
  });

  const productCategory = product ? getCategoryFromProductType(product.productType || "") : null;
  const recommendedSize = productCategory ? getRecommendation(productCategory) : null;

  // Initialize selected options when product loads, using recommended size if available
  useEffect(() => {
    if (product && !optionsInitialized && product.options.length > 0) {
      const defaults: Record<string, string> = {};
      product.options.forEach(opt => {
        if (opt.name.toLowerCase() === "size" && recommendedSize && opt.values.includes(recommendedSize)) {
          defaults[opt.name] = recommendedSize;
        } else {
          defaults[opt.name] = opt.values[0];
        }
      });
      setSelectedOptions(defaults);
      setOptionsInitialized(true);
    }
  }, [product, optionsInitialized, recommendedSize]);

  // Reset initialization when handle changes
  useEffect(() => {
    setOptionsInitialized(false);
    setSelectedOptions({});
    setQuantity(1);
  }, [handle]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-4 w-32 mb-8" />
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          <Skeleton className="aspect-[3/4] w-full rounded-sm" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Product not found</p>
        <Link to="/shop" className="text-sm underline mt-4 inline-block">Back to shop</Link>
      </div>
    );
  }

  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const compareAt = product.compareAtPriceRange?.minVariantPrice?.amount
    ? parseFloat(product.compareAtPriceRange.minVariantPrice.amount) : null;
  const isOnSale = compareAt != null && compareAt > price;
  const currency = product.priceRange.minVariantPrice.currencyCode;
  const imageUrl = product.images.edges[0]?.node.url;
  const currencySymbol = currency === 'USD' ? '$' : currency === 'NGN' ? '₦' : currency;

  const selectedVariant = product.variants.edges.find(v =>
    v.node.selectedOptions.every(so => selectedOptions[so.name] === so.value)
  )?.node || product.variants.edges[0]?.node;

  const related = allProducts
    .filter(p => p.node.handle !== product.handle)
    .slice(0, 4);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions,
    });
  };

  const handleBuyNow = async () => {
    if (!selectedVariant || !product.availableForSale) return;
    setBuyingNow(true);
    try {
      const checkoutUrl = await buyNow({
        product: { node: product },
        variantId: selectedVariant.id,
        variantTitle: selectedVariant.title,
        price: selectedVariant.price,
        quantity,
        selectedOptions: selectedVariant.selectedOptions,
      });
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
      }
    } finally {
      setBuyingNow(false);
    }
  };

  const hasSizeOption = product.options.some(opt => opt.name.toLowerCase() === "size");

  return (
    <div className="container py-8">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-[3/4] bg-muted rounded-sm overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex flex-col">
          <div className="flex items-start gap-2 mb-2">
            {isOnSale && <Badge className="bg-accent text-accent-foreground text-[10px] rounded-sm">Sale</Badge>}
            {!product.availableForSale && <Badge variant="secondary" className="text-[10px] rounded-sm">Sold Out</Badge>}
          </div>

          <h1 className="text-2xl md:text-3xl font-light mb-2">{product.title}</h1>
          <div className="flex items-center gap-3 mb-6">
            <p className="text-xl">{currencySymbol}{price.toFixed(2)}</p>
            {isOnSale && <p className="text-sm text-muted-foreground line-through">{currencySymbol}{compareAt!.toFixed(2)}</p>}
          </div>

          {/* Options */}
          {product.options
            .filter(opt => !(opt.name === "Title" && opt.values.length === 1 && opt.values[0] === "Default Title"))
            .map(opt => {
              const isSizeOpt = opt.name.toLowerCase() === "size";
              return (
                <div key={opt.name} className="mb-6">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
                    {opt.name}{selectedOptions[opt.name] ? ` — ${selectedOptions[opt.name]}` : ''}
                    {isSizeOpt && recommendedSize && selectedOptions[opt.name] === recommendedSize && (
                      <span className="ml-2 text-accent normal-case tracking-normal">✓ Recommended</span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(isSizeOpt ? sortSizes(opt.values) : opt.values).map(val => (
                      <button
                        key={val}
                        onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: val }))}
                        className={`relative h-9 min-w-[2.5rem] px-3 text-xs border rounded-sm transition-colors ${
                          selectedOptions[opt.name] === val
                            ? "border-foreground bg-primary text-primary-foreground"
                            : "border-border hover:border-foreground"
                        }`}
                      >
                        {val}
                        {isSizeOpt && recommendedSize === val && (
                          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-accent" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Size Guide + Recommender links */}
                  {isSizeOpt && productCategory && (
                    <div className="flex items-center gap-4 mt-2.5">
                      <SizeGuideModal category={productCategory}>
                        <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
                          <Ruler className="h-3 w-3" /> Size Guide
                        </button>
                      </SizeGuideModal>
                      <SizeRecommenderModal
                        category={productCategory}
                        onRecommendation={(size) => setSelectedOptions(prev => ({ ...prev, [opt.name]: size }))}
                      >
                        <button className="inline-flex items-center gap-1 text-xs text-accent hover:text-foreground transition-colors underline underline-offset-2">
                          <Sparkles className="h-3 w-3" /> {recommendedSize ? "Retake Size Quiz" : "What's My Size?"}
                        </button>
                      </SizeRecommenderModal>
                    </div>
                  )}
                </div>
              );
            })}

          {/* If product has sizing but no Size option in Shopify variants, still show guide */}
          {!hasSizeOption && productCategory && (
            <div className="flex items-center gap-4 mb-6">
              <SizeGuideModal category={productCategory}>
                <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
                  <Ruler className="h-3 w-3" /> Size Guide
                </button>
              </SizeGuideModal>
              <SizeRecommenderModal category={productCategory}>
                <button className="inline-flex items-center gap-1 text-xs text-accent hover:text-foreground transition-colors underline underline-offset-2">
                  <Sparkles className="h-3 w-3" /> What's My Size?
                </button>
              </SizeRecommenderModal>
            </div>
          )}

          {/* Quantity + Add to cart + Buy Now */}
          <div className="flex flex-col gap-2 mt-auto">
            <div className="flex gap-3">
              <div className="flex items-center border border-border rounded-sm">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-10 w-10 flex items-center justify-center hover:bg-muted transition-colors">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center text-sm">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="h-10 w-10 flex items-center justify-center hover:bg-muted transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <Button
                size="lg"
                className="flex-1 uppercase tracking-[0.1em] gap-2"
                disabled={!product.availableForSale || cartLoading}
                onClick={handleAddToCart}
              >
                {cartLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    {product.availableForSale ? "Add to Cart" : "Sold Out"}
                  </>
                )}
              </Button>
            </div>
            {product.availableForSale && (
              <Button
                size="lg"
                variant="outline"
                className="w-full uppercase tracking-[0.1em] gap-2"
                disabled={buyingNow}
                onClick={handleBuyNow}
              >
                {buyingNow ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Buy Now
                  </>
                )}
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mt-8">{product.description}</p>
        </motion.div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 pt-10 border-t border-border">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8 text-center">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => <ProductCard key={p.node.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
