import { readEnv } from "../lib/env";
import { FAQ_SUPPORT_EMAIL } from "./faq";

export const MERCHANT = {
  brandName: "MySkin Code",
  legalName: readEnv("MERCHANT_LEGAL_NAME") ?? "TMV d.o.o",
  taxId: readEnv("MERCHANT_TAX_ID") ?? "4281275700006",
  companyNumber: readEnv("MERCHANT_COMPANY_NUMBER") ?? "68-01-0025-17",
  court: readEnv("MERCHANT_COURT") ?? "Općinski sud u Livnu",
  address: readEnv("MERCHANT_ADDRESS") ?? "Splitska 15",
  city: readEnv("MERCHANT_CITY") ?? "80101 Livno",
  country: readEnv("MERCHANT_COUNTRY") ?? "Bosna i Hercegovina",
  phone: readEnv("MERCHANT_PHONE") ?? "+38763371252",
  email: readEnv("MERCHANT_EMAIL") ?? "info@myskincodeapp.com",
  supportEmail: readEnv("MERCHANT_SUPPORT_EMAIL") ?? FAQ_SUPPORT_EMAIL,
  domain: "www.myskincodeapp.com",
} as const;

export function isMonriTestMode(): boolean {
  return readEnv("MONRI_TEST_MODE") !== "false";
}

export function merchantLines(): string[] {
  const lines: string[] = [MERCHANT.legalName];
  if (MERCHANT.address) {
    lines.push(
      [MERCHANT.address, MERCHANT.city].filter(Boolean).join(", "),
    );
  } else if (MERCHANT.city) {
    lines.push(MERCHANT.city);
  }
  if (MERCHANT.country) lines.push(MERCHANT.country);
  if (MERCHANT.taxId) lines.push(`PDV / JIB: ${MERCHANT.taxId}`);
  if (MERCHANT.companyNumber) {
    lines.push(`Matični broj: ${MERCHANT.companyNumber}`);
  }
  if (MERCHANT.court) lines.push(MERCHANT.court);
  if (MERCHANT.phone) lines.push(`Tel: ${MERCHANT.phone}`);
  return lines;
}
