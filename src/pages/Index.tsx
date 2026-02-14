import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import mainLogo from "@/assets/ANCIENTIKA_MAIN_LOGO.png";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { mockProducts, collections } from "@/lib/mock-data";
import { useState } from "react";

const discountedProducts = mockProducts.filter((p) => p.compareAtPrice);
const featuredProducts = mockProducts.slice(0, 4);

export default function Index() {
  const [email, setEmail] = useState("");

  return (
    <div>
      {/* Hero + Featured */}
      <section className="relative min-h-[85vh] flex flex-col items-start justify-start pt-20 md:pt-28 bg-card overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/30" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative text-center px-6 max-w-2xl mx-auto"
        >
          <img src={mainLogo} alt="Ancientika" className="h-20 md:h-28 mx-auto mb-4" />
          <h1 className="font-display text-5xl md:text-7xl mb-4">Ancientika</h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-8 tracking-wide">
            Premium, defined by less.
          </p>
          <Button asChild size="lg" className="uppercase tracking-[0.15em]">
            <Link to="/shop">
              Explore Collection <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Featured inside hero */}
        <div className="relative container mt-12 md:mt-16 pb-12">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8 text-center">
            Featured
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Sticky Newsletter Banner */}
      <div className="sticky top-16 z-30 bg-accent text-accent-foreground py-2 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="mx-8 text-xs uppercase tracking-[0.2em]">
              Join our newsletter — First access to new drops and exclusive offers
              <span className="mx-8">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Collections Grid */}
      <section className="container py-20">
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8 text-center">
          Collections
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {collections.map((col, i) => (
            <motion.div
              key={col.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/shop?category=${col.slug}`}
                className="block aspect-[3/4] bg-muted rounded-sm relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-medium">{col.name}</p>
                  <p className="text-xs text-muted-foreground">{col.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* On Sale */}
      {discountedProducts.length > 0 && (
        <section className="container py-20 border-t border-border">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8 text-center">
            On Sale
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {discountedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Philosophy */}
      <section className="bg-card">
        <div className="container py-24 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-12 text-center">
              Philosophy
            </h2>
            <div className="grid md:grid-cols-3 gap-10 text-center">
              <div>
                <h3 className="text-sm uppercase tracking-[0.15em] mb-3 font-medium">Craftsmanship</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Every piece is constructed by skilled artisans using time-honoured techniques. We believe in making fewer things, better — garments that reward attention to detail.
                </p>
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-[0.15em] mb-3 font-medium">Sustainability</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Responsibly sourced materials, low-impact processes, and a commitment to reducing waste at every stage. Quality over quantity means less ends up discarded.
                </p>
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-[0.15em] mb-3 font-medium">Timelessness</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Designed to transcend seasons and trends. Where Scandinavian restraint meets Japanese reverence for craft — true luxury isn't loud, it endures.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary text-primary-foreground">
        <div className="container py-16 text-center max-w-md mx-auto">
          <h2 className="text-xs uppercase tracking-[0.2em] opacity-70 mb-4">Newsletter</h2>
          <p className="text-sm opacity-80 mb-6">
            First access to new drops and exclusive offers.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setEmail("");
            }}
            className="flex gap-2"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-primary-foreground/10 border border-primary-foreground/20 rounded-sm px-4 py-2.5 text-sm placeholder:text-primary-foreground/40 focus:outline-none focus:border-primary-foreground/50"
            />
            <Button
              type="submit"
              variant="secondary"
              className="uppercase tracking-[0.1em] text-xs"
            >
              Join
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
