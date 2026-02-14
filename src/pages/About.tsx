import { motion } from "framer-motion";

export default function About() {
  return (
    <div>
      <section className="container py-20 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-4xl md:text-5xl text-center mb-12">Our Story</h1>

          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Ancientika was born from a simple conviction: the most beautiful objects are those that
              carry the quiet confidence of restraint. We draw from two cultures that perfected this
              art — Scandinavian minimalism and Japanese craftsmanship.
            </p>
            <p>
              Every piece in our collection is designed to transcend seasons. We work with natural
              fibers — linen, organic cotton, merino wool — chosen for how they age, soften, and
              develop character with each wear.
            </p>
            <p>
              Our production is intentionally small. We partner with artisan workshops across Japan
              and Northern Europe, where techniques have been refined over generations. No mass
              production, no overstock, no waste.
            </p>
            <p>
              We believe luxury isn't about logos or trend cycles. It's about materials that feel
              alive, construction that endures, and design so considered it becomes invisible. This is
              clothing that doesn't demand attention — it earns it.
            </p>
          </div>
        </motion.div>
      </section>

      <section className="bg-card py-20">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-10 mt-10">
            {[
              {
                title: "Craft",
                desc: "Each garment is made in small batches by skilled artisans using time-honored techniques.",
              },
              {
                title: "Material",
                desc: "We source only natural, traceable fibers that improve with age and wear.",
              },
              {
                title: "Intention",
                desc: "Less but better. Every design decision serves function, beauty, or both.",
              },
            ].map((value) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-medium mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
