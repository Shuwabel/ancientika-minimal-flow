export interface Product {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  category: "tops" | "bottoms" | "outerwear" | "accessories";
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  description: string;
  inStock: boolean;
  stockCount: number;
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Wabi-Sabi Linen Tee",
    price: 89,
    compareAtPrice: 120,
    category: "tops",
    images: ["/placeholder.svg"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Sand", hex: "#C2B280" },
      { name: "Charcoal", hex: "#36454F" },
      { name: "Bone", hex: "#E3DAC9" },
    ],
    description: "Hand-dyed linen tee with raw edges and irregular texture. Each piece is unique.",
    inStock: true,
    stockCount: 14,
  },
  {
    id: "2",
    name: "Kuro Wide Trousers",
    price: 145,
    category: "bottoms",
    images: ["/placeholder.svg"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#1A1A1A" },
      { name: "Mocha", hex: "#967969" },
    ],
    description: "Relaxed wide-leg trousers in heavyweight organic cotton. Unisex silhouette.",
    inStock: true,
    stockCount: 8,
  },
  {
    id: "3",
    name: "Norr Wool Overcoat",
    price: 320,
    compareAtPrice: 420,
    category: "outerwear",
    images: ["/placeholder.svg"],
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Camel", hex: "#C19A6B" },
      { name: "Black", hex: "#1A1A1A" },
    ],
    description: "Minimalist wool overcoat with clean lines and hidden closures. Scandinavian tailoring.",
    inStock: true,
    stockCount: 3,
  },
  {
    id: "4",
    name: "Sashiko Canvas Tote",
    price: 65,
    category: "accessories",
    images: ["/placeholder.svg"],
    sizes: ["One Size"],
    colors: [
      { name: "Natural", hex: "#F5F0E1" },
      { name: "Indigo", hex: "#3F4B6C" },
    ],
    description: "Hand-stitched canvas tote with traditional sashiko embroidery patterns.",
    inStock: true,
    stockCount: 22,
  },
  {
    id: "5",
    name: "Mono Ribbed Tank",
    price: 55,
    category: "tops",
    images: ["/placeholder.svg"],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Bone", hex: "#E3DAC9" },
      { name: "Black", hex: "#1A1A1A" },
    ],
    description: "Fitted ribbed tank in organic cotton. Minimalist essential.",
    inStock: false,
    stockCount: 0,
  },
  {
    id: "6",
    name: "Tabi Split-Toe Socks",
    price: 28,
    compareAtPrice: 38,
    category: "accessories",
    images: ["/placeholder.svg"],
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Mocha", hex: "#967969" },
      { name: "Charcoal", hex: "#36454F" },
      { name: "Sand", hex: "#C2B280" },
    ],
    description: "Traditional split-toe socks in merino wool blend. Pack of two.",
    inStock: true,
    stockCount: 45,
  },
  {
    id: "7",
    name: "Zen Cargo Pants",
    price: 165,
    category: "bottoms",
    images: ["/placeholder.svg"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Olive", hex: "#6B7B3A" },
      { name: "Black", hex: "#1A1A1A" },
    ],
    description: "Utility cargo pants with concealed pockets and tapered leg. Washed cotton.",
    inStock: true,
    stockCount: 11,
  },
  {
    id: "8",
    name: "Haori Kimono Jacket",
    price: 280,
    category: "outerwear",
    images: ["/placeholder.svg"],
    sizes: ["S/M", "L/XL"],
    colors: [
      { name: "Indigo", hex: "#3F4B6C" },
      { name: "Natural", hex: "#F5F0E1" },
    ],
    description: "Unstructured kimono-style jacket in slubby linen. One-of-a-kind texture.",
    inStock: true,
    stockCount: 5,
  },
];

export const collections = [
  { name: "Tops", slug: "tops", description: "Essential layers" },
  { name: "Bottoms", slug: "bottoms", description: "Foundation pieces" },
  { name: "Outerwear", slug: "outerwear", description: "Outer shells" },
  { name: "Accessories", slug: "accessories", description: "Finishing details" },
];
