import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, X } from "lucide-react";
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import mainLogo from "@/assets/Ancientika_logo_mocha_brown.png";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { fetchProducts, fetchCollections } from "@/lib/shopify";
import { Skeleton } from "@/components/ui/skeleton";
import collectionsBg from "@/assets/collections-bg.jpg";
import { useState } from "react";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

function FeaturedCarousel({ products, isLoading }: { products: any[]; isLoading: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="flex items-baseline justify-between mb-6 px-4 md:px-[max(2rem,calc((100vw-1280px)/2+2rem))]">
        <h2
          className="uppercase font-medium tracking-[0.15em]"
          style={{ fontSize: "clamp(14px, 1.2vw, 18px)" }}
        >
          Featured
        </h2>
        <Link to="/shop" className="text-sm underline underline-offset-4 hover:text-foreground/80 transition-colors">
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="flex gap-3 px-4 md:px-[max(2rem,calc((100vw-1280px)/2+2rem))]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2 shrink-0" style={{ width: "clamp(150px, 20vw, 240px)" }}>
              <Skeleton className="aspect-square w-full rounded-sm" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 no-scrollbar px-4 md:px-[max(2rem,calc((100vw-1280px)/2+2rem))]"
        >
          {products.map((product) => (
            <div
              key={product.node.id}
              className="snap-start shrink-0 grow-0"
              style={{ width: "clamp(150px, 20vw, 240px)" }}
            >
              <ProductCard product={product} aspectRatio="1/1" />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground text-sm py-10 px-4">No products yet</p>
      )}
    </section>
  );
}

export default function Index() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubscribing(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/subscribe-newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409 || data?.error === "already_subscribed") {
          toast.info("You're already subscribed!");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
        setSubscribing(false);
        return;
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSubscribing(false);
      return;
    }
    setSubscribing(false);
    toast.success("You're subscribed! 🎉");
    setEmail("");
    setShowPopup(false);
  };

  const { data: shopifyCollections = [], isLoading: isCollectionsLoading } = useQuery({
    queryKey: ['shopify-collections'],
    queryFn: () => fetchCollections(10),
  });

  const { data: featuredProducts = [], isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['shopify-featured-products'],
    queryFn: () => fetchProducts(4, 'tag:featured'),
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['shopify-products'],
    queryFn: () => fetchProducts(50),
  });

  const discountedProducts = products.filter((p) => {
    const compareAt = p.node.compareAtPriceRange?.minVariantPrice?.amount;
    const price = p.node.priceRange.minVariantPrice.amount;
    return compareAt && parseFloat(compareAt) > parseFloat(price);
  });

  return (
    <div>
      {/* Sticky Newsletter Banner */}
      <div className="sticky top-16 z-30 bg-accent text-accent-foreground py-2 overflow-hidden">
        <button onClick={() => setShowPopup(true)} className="w-full animate-marquee whitespace-nowrap flex cursor-pointer">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="mx-8 text-xs uppercase tracking-[0.2em]">
              Join our newsletter — First access to new drops and exclusive offers
              <span className="mx-8">✦</span>
            </span>
          ))}
        </button>
      </div>

      {/* Newsletter Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-primary text-primary-foreground rounded-lg p-8 mx-4 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-3 right-3 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-xs uppercase tracking-[0.2em] opacity-70 mb-2">Newsletter</h3>
              <p className="font-display text-2xl mb-2">Stay in the loop</p>
              <p className="text-sm opacity-70 mb-6">First access to new drops, exclusive offers, and behind‑the‑scenes stories.</p>
              <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-primary-foreground/10 border border-primary-foreground/20 rounded-sm px-4 py-3 text-sm placeholder:text-primary-foreground/40 focus:outline-none focus:border-primary-foreground/50 transition-colors"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full uppercase tracking-[0.1em] text-xs py-3"
                  disabled={subscribing}
                >
                  {subscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join the list"}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative flex items-center justify-center overflow-hidden h-[calc(100svh-4rem)]">
        <img src={collectionsBg} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden="true" />
        <div className="absolute inset-0 bg-background/60" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative text-center px-6 max-w-2xl mx-auto"
        >
          <img src={mainLogo} alt="Ancientika" className="h-20 md:h-28 mx-auto mb-4" />
          <h1 className="font-display text-5xl md:text-7xl mb-4">ancientika</h1>
          <p className="text-base md:text-lg mb-8 tracking-wide">
            Your presence, refined.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white/15 backdrop-blur-xl border border-white/30 text-white uppercase tracking-[0.15em] text-sm font-medium shadow-lg shadow-white/10 hover:bg-white/25 hover:shadow-xl hover:shadow-white/15 transition-all duration-300"
          >
            Explore Collection <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* Featured */}
      <FeaturedCarousel products={featuredProducts} isLoading={isFeaturedLoading} />

      {/* Collections Grid - center aligned */}
      <section className="relative py-20 overflow-hidden bg-white">
        <div className="container relative">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8 text-center">Collections</h2>
          {isCollectionsLoading ? (
            <div className="flex justify-center flex-wrap gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square w-[clamp(100px,15vw,160px)] rounded-sm" />
              ))}
            </div>
          ) : shopifyCollections.length > 0 ? (
            <div className="flex justify-center flex-wrap gap-2 md:gap-3">
              {shopifyCollections.map((col, i) => (
                <motion.div
                  key={col.node.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="w-[clamp(100px,15vw,160px)]"
                >
                  <Link to={`/shop?category=${col.node.handle}`} className="block group">
                    <div className="aspect-square rounded-sm overflow-hidden border border-border/50 bg-muted">
                      {col.node.image ? (
                        <img src={col.node.image.url} alt={col.node.image.altText || col.node.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-card/80" />
                      )}
                    </div>
                    <p className="text-xs md:text-sm font-medium mt-1.5 text-center truncate">{col.node.title}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm py-10">No collections yet</p>
          )}
        </div>
      </section>

      {/* On Sale */}
      {!isLoading && discountedProducts.length > 0 && (
        <section className="container py-20 border-t border-border">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8 text-center">On Sale</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {discountedProducts.map((product) => (
              <ProductCard key={product.node.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Philosophy */}
      <section className="bg-card">
        <div className="container py-24 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-12 text-center">Philosophy</h2>
            <div className="grid md:grid-cols-3 gap-10 text-center">
              <div>
                <h3 className="text-sm uppercase tracking-[0.15em] mb-3 font-medium">Craftsmanship</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Every piece is constructed by skilled artisans using time-honoured techniques. We believe in making fewer things, better — garments that reward attention to detail.</p>
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-[0.15em] mb-3 font-medium">Sustainability</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Responsibly sourced materials, low-impact processes, and a commitment to reducing waste at every stage. Quality over quantity means less ends up discarded.</p>
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-[0.15em] mb-3 font-medium">Timelessness</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Designed to transcend seasons and trends. Where Scandinavian restraint meets Japanese reverence for craft — true luxury isn't loud, it endures.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section id="newsletter" className="bg-primary text-primary-foreground">
        <div className="container py-16 text-center max-w-md mx-auto">
          <h2 className="text-xs uppercase tracking-[0.2em] opacity-70 mb-4">Newsletter</h2>
          <p className="text-sm opacity-80 mb-6">First access to new drops and exclusive offers.</p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="flex-1 bg-primary-foreground/10 border border-primary-foreground/20 rounded-sm px-4 py-2.5 text-sm placeholder:text-primary-foreground/40 focus:outline-none focus:border-primary-foreground/50" />
            <Button type="submit" variant="secondary" className="uppercase tracking-[0.1em] text-xs" disabled={subscribing}>
              {subscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join"}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
