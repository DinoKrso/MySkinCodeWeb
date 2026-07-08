import { readEnv } from "../lib/env";

export const APP_STORE_URL = readEnv("APP_STORE_URL");
export const GOOGLE_PLAY_URL = readEnv("GOOGLE_PLAY_URL");

export const DOWNLOAD_HIGHLIGHTS = [
  {
    title: "iOS i Android",
    description: "Dostupno na App Store i Google Play — isti premium doživljaj na oba uređaja.",
  },
  {
    title: "Besplatan početak",
    description: "Započnite s Basic paketom i istražite osnovnu AI analizu bez obaveze.",
  },
  {
    title: "Personalizirana rutina",
    description: "Analiza kože, preporuke proizvoda i praćenje napretka u jednoj aplikaciji.",
  },
] as const;
