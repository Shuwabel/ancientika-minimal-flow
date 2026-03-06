import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2, Zap, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useSizeStore } from "@/stores/sizeStore";
import { getCategoryFromProductType } from "@/lib/size-data";
import type { ShopifyProduct } from "@/lib/shopify";
import { buyNow } from "@/lib/shopify";

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

interface QuickViewModalProps {
  product: ShopifyProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
  const { addItem, isLoading } = useCartStore();
  const { getRecommendation } = useSizeStore();
  const [buyingNow, setBuyingNow] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const node = product.node;

  const productCategory = getCategoryFromProductType(node.productType || "");
  const recommendedSize = productCategory ? getRecommendation(productCategory) : null;

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    node.options.forEach(opt => {
      if (opt.name.toLowerCase() === "size" && recommendedSize && opt.values.includes(recommendedSize)) {
        defaults[opt.name] = recommendedSize;
      } else {
        defaults[opt.name] = opt.values[0];
      }
    });
    return defaults;
  });

  const getSelectedVariant = () => {
    return node.variants.edges.find(v =>
      v.node.selectedOptions.every(so => selectedOptions[so.name] === so.value)
    )?.node || node.variants.edges[0]?.node;
  };

  const handleAdd = async () => {
    const variant = getSelectedVariant();
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity,
      selectedOptions: variant.selectedOptions,
    });
    onOpenChange(false);
  };

  const handleBuyNow = async () => {
    const variant = getSelectedVariant();
    if (!variant || !node.availableForSale) return;
    setBuyingNow(true);
    try {
      const checkoutUrl = await buyNow({
        product,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity,
        selectedOptions: variant.selectedOptions,
      });
      if (checkoutUrl) window.open(checkoutUrl, '_blank');
      onOpenChange(false);
    } finally {
      setBuyingNow(false);
    }
  };

  const visibleOptions = node.options.filter(
    opt => !(opt.name === "Title" && opt.values.length === 1 && opt.values[0] === "Default Title")
  );

  const price = parseFloat(node.priceRange.minVariantPrice.amount);
  const currency = node.priceRange.minVariantPrice.currencyCode;
  const currencySymbol = currency === 'USD' ? '$' : currency === 'NGN' ? '₦' : currency;
  const compareAt = node.compareAtPriceRange?.minVariantPrice?.amount
    ? parseFloat(node.compareAtPriceRange.minVariantPrice.amount) : null;
  const isOnSale = compareAt != null && compareAt > price;
  const images = node.images.edges;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl glass-heavy bg-background/80">
        <div className="grid md:grid-cols-2">
          {/* Image gallery */}
          <div className="relative bg-muted">
            <div className="aspect-square">
              {images.length > 0 ? (
                <img
                  src={images[activeImage]?.node.url}
                  alt={images[activeImage]?.node.altText || node.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-1 p-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-12 h-12 rounded-sm overflow-hidden border-2 transition-colors ${i === activeImage ? "border-foreground" : "border-transparent"
                      }`}
                  >
                    <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-5 flex flex-col">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-lg font-medium text-left">{node.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-base">{currencySymbol}{price.toFixed(2)}</p>
                {isOnSale && (
                  <p className="text-sm text-muted-foreground line-through">{currencySymbol}{compareAt!.toFixed(2)}</p>
                )}
              </div>
            </DialogHeader>

            <div className="flex-1 space-y-4 overflow-y-auto">
              {visibleOptions.map(opt => {
                const isSizeOpt = opt.name.toLowerCase() === "size";
                return (
                  <div key={opt.name}>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
                      {opt.name}{selectedOptions[opt.name] ? ` — ${selectedOptions[opt.name]}` : ''}
                      {isSizeOpt && recommendedSize && selectedOptions[opt.name] === recommendedSize && (
                        <span className="ml-1 text-accent normal-case tracking-normal">✓ recommended</span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(isSizeOpt ? sortSizes(opt.values) : opt.values).map(val => (
                        <button
                          key={val}
                          onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: val }))}
                          className={`relative h-8 min-w-[2.25rem] px-2.5 text-xs border rounded-sm transition-colors ${selectedOptions[opt.name] === val
                              ? "border-foreground bg-primary text-primary-foreground"
                              : "border-border hover:border-foreground"
                            }`}
                        >
                          {val}
                          {isSizeOpt && recommendedSize === val && (
                            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quantity + Actions */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-sm">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors">
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <Button
                  className="flex-1 uppercase tracking-[0.1em] text-xs gap-2"
                  disabled={!node.availableForSale || isLoading}
                  onClick={handleAdd}
                >
                  {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShoppingBag className="h-3.5 w-3.5" />}
                  {node.availableForSale ? "Add to Cart" : "Sold Out"}
                </Button>
              </div>
              {node.availableForSale && (
                <Button
                  variant="outline"
                  className="w-full uppercase tracking-[0.1em] text-xs gap-2"
                  disabled={buyingNow}
                  onClick={handleBuyNow}
                >
                  {buyingNow ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                  Buy Now
                </Button>
              )}
            </div>

            {node.description && (
              <p className="text-xs text-muted-foreground mt-4 leading-relaxed line-clamp-4">{node.description}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
