import { useEffect } from "react";
import { readEnv } from "./env";

export const SITE_NAME = "MySkin Code";

export function getSiteOrigin(): string {
  const fromEnv = readEnv("SITE_URL");
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location.origin.includes("localhost")) {
    return window.location.origin;
  }
  return "https://www.myskincodeapp.com";
}

export const DEFAULT_SEO = {
  title: "MySkin Code | Personalizirana njega kože uz AI",
  description:
    "Analizirajte stanje kože, dobijte personaliziranu rutinu, pratite napredak i razumijte sastojke proizvoda — sve u jednoj aplikaciji MySkin Code.",
  imagePath: "/images/landing-hero.png",
} as const;

export type PageSeo = {
  title: string;
  description: string;
  /** Path relative to origin, e.g. `/faq`. Defaults to current pathname. */
  path?: string;
  imagePath?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

function upsertMeta(
  attr: "name" | "property",
  key: string,
  content: string,
): void {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string): void {
  let el = document.head.querySelector(
    `link[rel="${rel}"]`,
  ) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

const JSON_LD_ID = "msc-page-json-ld";

function upsertJsonLd(
  data: Record<string, unknown> | Record<string, unknown>[],
): void {
  let el = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = JSON_LD_ID;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd(): void {
  document.getElementById(JSON_LD_ID)?.remove();
}

export function absoluteUrl(path = "/"): string {
  const origin = getSiteOrigin();
  if (!path || path === "/") return `${origin}/`;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function applyPageSeo(seo: PageSeo): void {
  const origin = getSiteOrigin();
  const path =
    seo.path ??
    (typeof window !== "undefined" ? window.location.pathname : "/");
  const url = absoluteUrl(path);
  const image = absoluteUrl(seo.imagePath ?? DEFAULT_SEO.imagePath);
  const robots = seo.noindex ? "noindex,nofollow" : "index,follow";

  document.title = seo.title;

  upsertMeta("name", "description", seo.description);
  upsertMeta("name", "robots", robots);
  upsertMeta("name", "theme-color", "#FAF9F7");

  upsertLink("canonical", url);

  upsertMeta("property", "og:type", "website");
  upsertMeta("property", "og:locale", "hr_BA");
  upsertMeta("property", "og:site_name", SITE_NAME);
  upsertMeta("property", "og:title", seo.title);
  upsertMeta("property", "og:description", seo.description);
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:image", image);

  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", seo.title);
  upsertMeta("name", "twitter:description", seo.description);
  upsertMeta("name", "twitter:image", image);

  if (seo.jsonLd) {
    upsertJsonLd(seo.jsonLd);
  } else {
    removeJsonLd();
  }

  // Keep a stable absolute reference for crawlers that ignore JS path changes
  void origin;
}

/** Apply title/description/OG/canonical for the current route. */
export function usePageSeo(seo: PageSeo): void {
  const { title, description, path, imagePath, noindex, jsonLd } = seo;
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    applyPageSeo({
      title,
      description,
      path,
      imagePath,
      noindex,
      jsonLd: jsonLdKey ? (JSON.parse(jsonLdKey) as PageSeo["jsonLd"]) : undefined,
    });

    return () => {
      if (jsonLdKey) removeJsonLd();
    };
  }, [title, description, path, imagePath, noindex, jsonLdKey]);
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/favicon.svg"),
    email: "info@myskincodeapp.com",
    sameAs: [
      "https://play.google.com/store/apps/details?id=com.konsalsis.skincode",
    ],
  };
}

export function buildSoftwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "HealthApplication",
    operatingSystem: "iOS, Android",
    description: DEFAULT_SEO.description,
    url: absoluteUrl("/"),
    image: absoluteUrl(DEFAULT_SEO.imagePath),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BAM",
    },
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: DEFAULT_SEO.description,
    inLanguage: "hr",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
  };
}
