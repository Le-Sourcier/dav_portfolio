export type PublishFilter = 'all' | 'published' | 'draft' | 'scheduled';

export function normalizeSearch(value: unknown) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function isScheduled(item: { published?: boolean; publishedAt?: string | null }) {
  if (!item.published || !item.publishedAt) return false;
  const date = new Date(item.publishedAt);
  return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
}

export function matchesPublishFilter(
  item: { published?: boolean; publishedAt?: string | null },
  filter: PublishFilter,
) {
  if (filter === 'all') return true;
  if (filter === 'scheduled') return isScheduled(item);
  if (filter === 'published') return Boolean(item.published) && !isScheduled(item);
  return !item.published;
}

export function formatAdminMonth(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}
