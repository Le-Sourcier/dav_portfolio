/**
 * Format an ISO date as a relative time string (e.g. "il y a 3 minutes",
 * "il y a 2 jours"). Falls back to an absolute date once older than `cutoffDays`.
 */
const UNITS: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
  { unit: "year", seconds: 60 * 60 * 24 * 365 },
  { unit: "month", seconds: 60 * 60 * 24 * 30 },
  { unit: "week", seconds: 60 * 60 * 24 * 7 },
  { unit: "day", seconds: 60 * 60 * 24 },
  { unit: "hour", seconds: 60 * 60 },
  { unit: "minute", seconds: 60 },
];

const localeOf = (language?: string) => (language === "en" ? "en-US" : "fr-FR");

export function formatRelativeTime(iso: string, language?: string, cutoffDays = 30): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diffSeconds = (date.getTime() - Date.now()) / 1000;
  const absSeconds = Math.abs(diffSeconds);
  const locale = localeOf(language);

  if (absSeconds < 30) {
    return language === "en" ? "just now" : "à l'instant";
  }

  if (absSeconds >= cutoffDays * 86400) {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const { unit, seconds } of UNITS) {
    if (absSeconds >= seconds) {
      const value = Math.round(diffSeconds / seconds);
      return formatter.format(value, unit);
    }
  }
  return formatter.format(Math.round(diffSeconds), "second");
}
