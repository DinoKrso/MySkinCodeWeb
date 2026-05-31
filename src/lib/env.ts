/** Reads VITE_* or EXPO_PUBLIC_* (same keys as mobile app). */
export function readEnv(name: string): string | undefined {
  const env = import.meta.env as Record<string, string | undefined>;

  for (const prefix of ["VITE_", "EXPO_PUBLIC_"]) {
    const value = env[`${prefix}${name}`];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}
