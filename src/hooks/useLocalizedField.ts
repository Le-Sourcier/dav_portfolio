import { useTranslation } from 'react-i18next';

/**
 * Returns the localized version of a field.
 * If lang=en and the _en field exists and is non-empty, returns it.
 * Otherwise falls back to the FR field.
 */
export function useLocalizedField() {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  function localize(fr: string, en?: string | null): string {
    if (isEn && en && en.trim()) return en;
    return fr;
  }

  return localize;
}
