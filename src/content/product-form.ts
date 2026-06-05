/** Vrijednosti u DynamoDB — usklađeno s postojećim zapisima. */
export const PRODUCT_STEP_TYPES = [
  "Čistač",
  "Hidratantna krema",
  "Krema za područje oko očiju",
  "Tretman",
  "Tonik",
  "SPF",
  "Serum",
] as const;

export type ProductStepType = (typeof PRODUCT_STEP_TYPES)[number];

export const PRODUCT_PRICE_RANGES = [
  { value: "budget", label: "Budget" },
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" },
] as const;

export const PRODUCT_SKIN_TYPES = [
  "normal",
  "dry",
  "oily",
  "combination",
  "sensitive",
] as const;

export type ProductFormInput = {
  brand: string;
  name: string;
  line: string;
  category: string;
  country: string;
  description: string;
  image: string;
  step_type: ProductStepType;
  price_range: string;
  concerns: string[];
  highlights: string[];
  ingredients: string[];
  key_ingredients: string[];
  skin_types: string[];
  isSponsored: boolean;
  sponsorWeight: number;
};

export function buildProductPk(brand: string, name: string): string {
  const slug = `${brand}${name}`
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-zA-Z0-9]/g, "");
  return `PRODUCT#${slug}`;
}

export function parseListInput(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export const EMPTY_PRODUCT_FORM: ProductFormInput = {
  brand: "",
  name: "",
  line: "",
  category: "",
  country: "",
  description: "",
  image: "",
  step_type: "Hidratantna krema",
  price_range: "budget",
  concerns: [],
  highlights: [],
  ingredients: [],
  key_ingredients: [],
  skin_types: [],
  isSponsored: false,
  sponsorWeight: 0,
};
