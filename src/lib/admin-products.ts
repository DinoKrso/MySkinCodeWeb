import {
  buildProductPk,
  type ProductFormInput,
} from "../content/product-form";
import { endpoints } from "./config";

export type CreateProductResponse = {
  message: string;
  product: Record<string, unknown>;
};

export function formToApiPayload(form: ProductFormInput) {
  return {
    PK: buildProductPk(form.brand, form.name),
    SK: "META",
    brand: form.brand.trim(),
    name: form.name.trim(),
    line: form.line.trim(),
    category: form.category,
    country: form.country.trim(),
    description: form.description.trim(),
    image: form.image.trim(),
    step_type: form.step_type,
    price_range: form.price_range,
    concerns: form.concerns,
    highlights: form.highlights,
    ingredients: form.ingredients,
    key_ingredients: form.key_ingredients,
    skin_types: form.skin_types,
    isSponsored: form.isSponsored,
    sponsorWeight: form.sponsorWeight,
  };
}

export async function createProduct(
  form: ProductFormInput,
): Promise<CreateProductResponse> {
  const response = await fetch(endpoints.adminCreateProduct, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formToApiPayload(form)),
  });

  const raw: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      raw &&
      typeof raw === "object" &&
      "error" in raw &&
      typeof (raw as { error: unknown }).error === "string"
        ? (raw as { error: string }).error
        : `HTTP ${response.status}`;
    throw new Error(message);
  }

  return raw as CreateProductResponse;
}
