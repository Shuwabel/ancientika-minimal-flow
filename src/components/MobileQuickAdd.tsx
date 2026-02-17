import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2, Zap, Plus } from "lucide-react";
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

interface MobileQuickAddProps {
  product: ShopifyProduct;
}

export default function MobileQuickAdd({ product }: MobileQuickAddProps) {
  const [open, setOpen] = useState(false);
  const { addItem, isLoading } = useCartStore();
  const { getRecommendation } = useSizeStore();
  const [buyingNow, setBuyingNow] = useState(false);
  const node = product.node;
  const firstVariant = node.variants.edges[0]?.node;

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
    )?.node || firstVariant;
  };

  const handleAdd = async () => {
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
    setOpen(false);
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
        quantity: 1,
        selectedOptions: variant.selectedOptions,
      });
      if (checkoutUrl) window.open(checkoutUrl, '_blank');
      setOpen(false);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
          className="absolute bottom-2 right-2 z-10 h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center border border-border/50 shadow-sm active:scale-95 transition-transform"
        >
          <Plus className="h-4 w-4 text-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] rounded-lg p-5">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium text-left">{node.title}</DialogTitle>
          <p className="text-sm text-muted-foreground text-left">{currencySymbol}{price.toFixed(2)}</p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {visibleOptions.map(opt => {
            const isSizeOpt = opt.name.toLowerCase() === "size";
            return (
              <div key={opt.name}>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
                  {opt.name}
                  {isSizeOpt && recommendedSize && selectedOptions[opt.name] === recommendedSize && (
                    <span className="ml-1 text-accent normal-case tracking-normal">✓ recommended</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(isSizeOpt ? sortSizes(opt.values) : opt.values).map(val => (
                    <button
                      key={val}
                      onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: val }))}
                      className={`relative h-8 min-w-[2.25rem] px-2 text-xs border rounded-sm transition-colors ${
                        selectedOptions[opt.name] === val
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

          <div className="flex flex-col gap-2 pt-1">
            <Button
              className="w-full uppercase tracking-[0.1em] text-xs gap-2"
              disabled={isLoading}
              onClick={handleAdd}
            >
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShoppingBag className="h-3.5 w-3.5" />}
              Add to Cart
            </Button>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
