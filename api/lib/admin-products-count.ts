import { fetchCountFromUpstream, type CountResult } from "./admin-count.js";

const DEFAULT_PRODUCTS_COUNT_URL =
  "https://rdwp2lazqa.execute-api.eu-central-1.amazonaws.com/dev/admin/products/count";

export type ProductsCountResult = CountResult;

export function getProductsCountUpstreamUrl(): string {
  return (
    process.env.ADMIN_PRODUCTS_COUNT_URL?.trim() ||
    process.env.VITE_ADMIN_PRODUCTS_COUNT_URL?.trim() ||
    DEFAULT_PRODUCTS_COUNT_URL
  );
}

export async function fetchProductsCountFromUpstream(): Promise<ProductsCountResult> {
  return fetchCountFromUpstream(getProductsCountUpstreamUrl(), "proizvoda");
}
