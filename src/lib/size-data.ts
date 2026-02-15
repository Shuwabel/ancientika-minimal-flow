// Size chart measurement data per category
// Measurements in centimeters

export interface SizeChart {
  category: string;
  sizes: string[];
  measurements: {
    label: string;
    values: Record<string, string>;
  }[];
  howToMeasure: { label: string; instruction: string }[];
}

export const sizeCharts: Record<string, SizeChart> = {
  tops: {
    category: "Tops",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    measurements: [
      { label: "Chest (cm)", values: { XS: "82-86", S: "87-91", M: "92-96", L: "97-102", XL: "103-108", XXL: "109-114" } },
      { label: "Waist (cm)", values: { XS: "62-66", S: "67-71", M: "72-76", L: "77-82", XL: "83-88", XXL: "89-94" } },
      { label: "Length (cm)", values: { XS: "64", S: "66", M: "68", L: "70", XL: "72", XXL: "74" } },
      { label: "Shoulder (cm)", values: { XS: "38", S: "40", M: "42", L: "44", XL: "46", XXL: "48" } },
    ],
    howToMeasure: [
      { label: "Chest", instruction: "Measure around the fullest part of your chest, keeping the tape level under your arms." },
      { label: "Waist", instruction: "Measure around your natural waistline, the narrowest part of your torso." },
      { label: "Length", instruction: "Measure from the highest point of the shoulder down to the desired hem." },
    ],
  },
  bottoms: {
    category: "Bottoms",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    measurements: [
      { label: "Waist (cm)", values: { XS: "62-66", S: "67-71", M: "72-76", L: "77-82", XL: "83-88", XXL: "89-94" } },
      { label: "Hip (cm)", values: { XS: "86-90", S: "91-95", M: "96-100", L: "101-106", XL: "107-112", XXL: "113-118" } },
      { label: "Inseam (cm)", values: { XS: "76", S: "78", M: "80", L: "80", XL: "80", XXL: "80" } },
      { label: "Thigh (cm)", values: { XS: "52", S: "54", M: "56", L: "58", XL: "60", XXL: "62" } },
    ],
    howToMeasure: [
      { label: "Waist", instruction: "Measure around your natural waistline, the narrowest part of your torso." },
      { label: "Hip", instruction: "Stand with feet together and measure around the fullest part of your hips." },
      { label: "Inseam", instruction: "Measure from the crotch seam to the bottom of the leg along the inner seam." },
    ],
  },
  outerwear: {
    category: "Outerwear",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    measurements: [
      { label: "Chest (cm)", values: { XS: "86-90", S: "91-95", M: "96-100", L: "101-106", XL: "107-112", XXL: "113-118" } },
      { label: "Shoulder (cm)", values: { XS: "40", S: "42", M: "44", L: "46", XL: "48", XXL: "50" } },
      { label: "Sleeve (cm)", values: { XS: "60", S: "62", M: "64", L: "66", XL: "68", XXL: "70" } },
      { label: "Length (cm)", values: { XS: "68", S: "70", M: "72", L: "74", XL: "76", XXL: "78" } },
    ],
    howToMeasure: [
      { label: "Chest", instruction: "Measure over a light layer. Wrap tape around the fullest part, keeping it level." },
      { label: "Sleeve", instruction: "Measure from the shoulder seam down to your wrist with arm slightly bent." },
      { label: "Shoulder", instruction: "Measure from one shoulder point to the other across the back." },
    ],
  },
};

/** Map a Shopify productType to our size chart category key */
export function getCategoryFromProductType(productType: string): string | null {
  const type = productType.toLowerCase().trim();
  const categories = ["tops", "bottoms", "outerwear"];
  if (categories.includes(type)) return type;
  // Handle singular forms: "top" → "tops", "bottom" → "bottoms"
  const withS = type + "s";
  if (categories.includes(withS)) return withS;
  return null;
}
