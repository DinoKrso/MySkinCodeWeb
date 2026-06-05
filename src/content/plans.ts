import { readEnv } from "../lib/env";

export type BillingInterval = "monthly" | "yearly";

export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string | null;
  /** Godišnja cijena (Plus, Premium). */
  annualPrice?: string | null;
  /** 12 × mjesečna cijena — prikaz prekriženo kod godišnjeg plana. */
  annualOriginalPrice?: string | null;
  /** Iznos uštede (npr. "24 KM"). */
  annualSavings?: string | null;
  featured: boolean;
  features: readonly string[];
  /** Paid plans redirect here; basic may be empty until configured. */
  requiresCheckout: boolean;
};

export const PRICING_PLANS: readonly PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Besplatan ulaz u MySkin — osnovna analiza i dnevnik",
    price: "Besplatno",
    period: null,
    featured: false,
    requiresCheckout: false,
    features: [
      "1 mjesečna analiza lica",
      "Barkod skener proizvoda",
      "Osnovni uvid (tip kože, uočeni problemi)",
      "Dnevnik analiza",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    description: "Napredna analiza kože i ključne metrike",
    price: "11,99 KM",
    period: "/ mjesec",
    annualPrice: "119,99 KM",
    annualOriginalPrice: "143,88 KM",
    annualSavings: "24 KM",
    featured: true,
    requiresCheckout: true,
    features: [
      "5 mjesečnih analiza lica",
      "Barkod skener proizvoda",
      "Ključne metrike kože",
      "Detaljna analiza",
      "Dnevnik analiza",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Personalizirana rutina, praćenje napretka i preporučeni proizvodi",
    price: "23,99 KM",
    period: "/ mjesec",
    annualPrice: "239,99 KM",
    annualOriginalPrice: "287,88 KM",
    annualSavings: "48 KM",
    featured: false,
    requiresCheckout: true,
    features: [
      "Neograničena skeniranja lica",
      "Preporučeni proizvodi",
      "Ključne metrike kože",
      "Detaljna analiza",
      "Preporučena rutina",
      "Pokretanje personalizirane rutine",
      "Dnevno praćenje rutine",
      "Kalendar i graf napretka",
      "Prilagodba rutine na osnovu tretmana",
      "Barkod skener proizvoda",
      "Dnevnik analiza",
    ],
  },
] as const;

export function getPlanPriceDisplay(
  plan: PricingPlan,
  interval: BillingInterval,
): {
  price: string;
  period: string | null;
  compareOriginal: string | null;
  compareSavings: string | null;
} {
  if (interval === "yearly" && plan.annualPrice) {
    return {
      price: plan.annualPrice,
      period: "/ godina",
      compareOriginal: plan.annualOriginalPrice ?? null,
      compareSavings: plan.annualSavings ?? null,
    };
  }
  return {
    price: plan.price,
    period: plan.period,
    compareOriginal: null,
    compareSavings: null,
  };
}

export function parseBillingInterval(
  value: string | null | undefined,
): BillingInterval {
  return value?.toLowerCase() === "yearly" ? "yearly" : "monthly";
}

export function normalizePlanId(plan: string | null | undefined): string | null {
  if (!plan) return null;
  return plan.trim().toLowerCase();
}

export function findPlanById(planId: string | null | undefined): PricingPlan | undefined {
  const id = normalizePlanId(planId);
  if (!id) return undefined;
  return PRICING_PLANS.find((p) => p.id === id);
}

type SubscriptionProfile = {
  subscriptionPlan?: string | null;
  subscriptionExpiresAt?: string | null;
};

/** Pretplata je aktivna ako postoji prepoznatljiv plan i (ako postoji) nije istekao. */
export function isSubscriptionActive(
  profile: SubscriptionProfile | null | undefined,
): boolean {
  const planId = normalizePlanId(profile?.subscriptionPlan);
  if (!planId || !findPlanById(planId)) return false;

  const expires = profile?.subscriptionExpiresAt?.trim();
  if (!expires) return true;

  const expMs = Date.parse(expires);
  if (Number.isNaN(expMs)) return true;

  return expMs >= Date.now();
}

export function isUsersCurrentPlan(
  planId: string,
  profile: SubscriptionProfile | null | undefined,
): boolean {
  if (!isSubscriptionActive(profile)) return false;
  return normalizePlanId(planId) === normalizePlanId(profile?.subscriptionPlan);
}

const CHECKOUT_ENV_KEYS: Record<
  string,
  Partial<Record<BillingInterval, string>>
> = {
  basic: {
    monthly: "CHECKOUT_URL_BASIC",
    yearly: "CHECKOUT_URL_BASIC",
  },
  plus: {
    monthly: "CHECKOUT_URL_PLUS",
    yearly: "CHECKOUT_URL_PLUS_YEARLY",
  },
  premium: {
    monthly: "CHECKOUT_URL_PREMIUM",
    yearly: "CHECKOUT_URL_PREMIUM_YEARLY",
  },
};

/** Stripe ili payment link — postavi VITE_CHECKOUT_URL_* u env. */
export function getCheckoutUrl(
  planId: string,
  interval: BillingInterval = "monthly",
): string | null {
  const id = normalizePlanId(planId);
  if (!id) return null;
  const keys = CHECKOUT_ENV_KEYS[id];
  if (!keys) return null;

  const envKey =
    interval === "yearly"
      ? keys.yearly ?? keys.monthly
      : keys.monthly;
  if (!envKey) return null;

  return readEnv(envKey) ?? null;
}
