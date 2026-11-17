/** Períodos de análise. Vive fora de lib/stats.ts porque o seletor é client. */

export type RangeKey = "7d" | "30d" | "90d" | "12m";

export const RANGES: { value: RangeKey; label: string; days: number }[] = [
  { value: "7d", label: "Últimos 7 dias", days: 7 },
  { value: "30d", label: "Últimos 30 dias", days: 30 },
  { value: "90d", label: "Últimos 90 dias", days: 90 },
  { value: "12m", label: "Últimos 12 meses", days: 365 },
];

export function rangeDays(range: string): number {
  return RANGES.find((r) => r.value === range)?.days ?? 30;
}
