export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string | null;
  featured: boolean;
  features: readonly string[];
};

export const PRICING_PLANS: readonly PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Osnovne funkcije za svakodnevnu njegu kože",
    price: "Besplatno",
    period: null,
    featured: false,
    features: [
      "1 analiza kože mjesečno",
      "Osnovna rutina njege",
      "Praćenje dnevne rutine",
      "Osnovni skin metrics",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    description: "Napredno praćenje kože i rutina",
    price: "€9.99",
    period: "/ mjesec",
    featured: true,
    features: [
      "5 analiza kože mjesečno",
      "Napredna personalizirana rutina",
      "Napredni skin metrics",
      "Napredne analize teksture i tona",
      "Detaljni ingredient analysis",
      "Recovery mode za tretmane",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Potpuni pristup i AI personalizacija",
    price: "€19.99",
    period: "/ mjesec",
    featured: false,
    features: [
      "Unlimited skeniranja",
      "AI-powered personalizacija",
      "Premium skin metrics",
      "Napredne analize svih parametara",
      "Eksportiranje svih podataka",
      "Prioritetna 24/7 podrška",
    ],
  },
] as const;

export function normalizePlanId(plan: string | null | undefined): string | null {
  if (!plan) return null;
  return plan.trim().toLowerCase();
}

export function findPlanById(planId: string | null | undefined): PricingPlan | undefined {
  const id = normalizePlanId(planId);
  if (!id) return undefined;
  return PRICING_PLANS.find((p) => p.id === id);
}
