export default function ProductCare() {
  const sections = [
    {
      title: "General Care",
      items: [
        "Always check the care label before washing.",
        "Turn garments inside out to preserve color and print.",
        "Use a mesh laundry bag for delicate items.",
      ],
    },
    {
      title: "Cotton & Linen",
      items: [
        "Machine wash cold with similar colors.",
        "Tumble dry on low heat or hang to dry.",
        "Iron on medium heat while slightly damp for best results.",
      ],
    },
    {
      title: "Knits & Wool",
      items: [
        "Hand wash in cool water with mild detergent.",
        "Do not wring — gently press out excess water.",
        "Lay flat to dry on a clean towel to maintain shape.",
      ],
    },
    {
      title: "Storage",
      items: [
        "Store in a cool, dry place away from direct sunlight.",
        "Use padded hangers for structured garments.",
        "Fold knits to avoid stretching on hangers.",
        "Keep garments in breathable covers, not plastic.",
      ],
    },
  ];

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="text-3xl md:text-4xl font-light text-center mb-3">Product Care</h1>
      <p className="text-sm text-muted-foreground text-center mb-10 max-w-md mx-auto">
        Proper care helps your pieces last longer and look their best.
      </p>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">{section.title}</h2>
            <ul className="space-y-2">
              {section.items.map((item, i) => (
                <li key={i} className="text-sm leading-relaxed pl-4 border-l-2 border-border">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
