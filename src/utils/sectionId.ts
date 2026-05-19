/**
 * Convert a section title to a URL-safe anchor id (no diacritics, kebab-case).
 */
export const sectionId = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
