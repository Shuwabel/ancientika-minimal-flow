import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";
import type { ShopifyProduct } from "@/lib/shopify";

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

interface QuickAddPopoverProps {
  product: ShopifyProduct;
  children: React.ReactNode;
}

export default function QuickAddPopover({ product, children }: QuickAddPopoverProps) {
  const [open, setOpen] = useState(false);
  const { addItem, isLoading } = useCartStore();
  const node = product.node;
  const firstVariant = node.variants.edges[0]?.node;

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

  const visibleOptions = node.options.filter(
    opt => !(opt.name === "Title" && opt.values.length === 1 && opt.values[0] === "Default Title")
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side="left"
        align="start"
        sideOffset={8}
        className="w-52 p-3"
        onClick={(e) => e.stopPropagation()}
      >
        {visibleOptions.length > 0 ? (
          visibleOptions.map(opt => (
            <div key={opt.name} className="mb-2.5">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1">
                {opt.name}
              </p>
              <div className="flex flex-wrap gap-1">
                {(opt.name.toLowerCase() === "size" ? sortSizes(opt.values) : opt.values).map(val => (
                  <button
                    key={val}
                    onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: val }))}
                    className={`h-6 min-w-[1.75rem] px-1.5 text-[10px] border rounded-sm transition-colors ${
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
          ))
        ) : null}
        <Button
          size="sm"
          className="w-full uppercase tracking-[0.1em] text-[10px] gap-1.5 h-7"
          disabled={isLoading}
          onClick={handleAdd}
        >
          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShoppingBag className="h-3 w-3" />}
          Add to Cart
        </Button>
      </PopoverContent>
    </Popover>
  );
}
