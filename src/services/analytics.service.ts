import crypto from 'crypto';
import { Op } from 'sequelize';
import AnalyticsPageView from '../models/AnalyticsPageView.js';
import Contact from '../models/Contact.js';
import Appointment from '../models/Appointment.js';
import Newsletter from '../models/Newsletter.js';
import { Comment } from '../models/BlogPost.js';

export type AnalyticsPeriod = '7d' | '30d' | '12m';

export interface TrackPageViewInput {
  path: string;
  title?: string;
  referrer?: string;
  locale?: string;
  visitorId?: string;
  ip?: string;
  userAgent?: string;
}

const dayFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });
const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'short' });

function normalizePath(path: string): string {
  const value = path.trim();
  if (!value || value.length > 700) return '/';
  return value.startsWith('/') ? value : `/${value}`;
}

function hashVisitor(seed: string): string {
  return crypto.createHash('sha256').update(seed).digest('hex');
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function addMonths(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
}

function createBuckets(period: AnalyticsPeriod) {
  const now = new Date();
  if (period === '12m') {
    const first = startOfMonth(addMonths(now, -11));
    return Array.from({ length: 12 }, (_, index) => {
      const start = addMonths(first, index);
      const end = addMonths(start, 1);
      return {
        key: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
        label: monthFormatter.format(start).replace('.', ''),
        start,
        end,
      };
    });
  }

  const days = period === '30d' ? 30 : 7;
  const first = startOfDay(addDays(now, -(days - 1)));
  return Array.from({ length: days }, (_, index) => {
    const start = addDays(first, index);
    const end = addDays(start, 1);
    return {
      key: start.toISOString().slice(0, 10),
      label: period === '7d' ? dayFormatter.format(start).replace('.', '') : `${start.getDate()}/${start.getMonth() + 1}`,
      start,
      end,
    };
  });
}

function bucketForDate(date: Date, buckets: ReturnType<typeof createBuckets>): string | null {
  const found = buckets.find((bucket) => date >= bucket.start && date < bucket.end);
  return found?.key ?? null;
}

async function countByCreatedAt<T extends { createdAt?: Date; subscribedAt?: Date }>(
  rows: T[],
  buckets: ReturnType<typeof createBuckets>,
  field: 'createdAt' | 'subscribedAt' = 'createdAt'
): Promise<Record<string, number>> {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const value = row[field];
    if (!value) return acc;
    const key = bucketForDate(new Date(value), buckets);
    if (key) acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

class AnalyticsService {
  async trackPageView(input: TrackPageViewInput) {
    const visitorSeed = input.visitorId || `${input.ip || 'unknown'}:${input.userAgent || 'unknown'}`;
    return AnalyticsPageView.create({
      path: normalizePath(input.path),
      title: input.title?.slice(0, 255) || null,
      referrer: input.referrer?.slice(0, 1000) || null,
      locale: input.locale?.slice(0, 12) || null,
      visitorHash: hashVisitor(visitorSeed),
      userAgent: input.userAgent?.slice(0, 1000) || null,
      consent: 'analytics',
    });
  }

  async getTraffic(period: AnalyticsPeriod) {
    const buckets = createBuckets(period);
    const start = buckets[0]!.start;
    const views = await AnalyticsPageView.findAll({
      where: { createdAt: { [Op.gte]: start } },
      attributes: ['createdAt', 'visitorHash'],
      order: [['createdAt', 'ASC']],
    });

    const grouped = new Map<string, { pageViews: number; visitors: Set<string> }>();
    buckets.forEach((bucket) => grouped.set(bucket.key, { pageViews: 0, visitors: new Set() }));

    views.forEach((view) => {
      const key = bucketForDate(view.createdAt, buckets);
      if (!key) return;
      const row = grouped.get(key);
      if (!row) return;
      row.pageViews += 1;
      row.visitors.add(view.visitorHash);
    });

    return buckets.map((bucket) => {
      const row = grouped.get(bucket.key)!;
      return {
        key: bucket.key,
        label: bucket.label,
        pageViews: row.pageViews,
        visitors: row.visitors.size,
      };
    });
  }

  async getWeeklyActivity() {
    const buckets = createBuckets('7d');
    const start = buckets[0]!.start;
    const [views, contacts, appointments, comments, subscribers] = await Promise.all([
      AnalyticsPageView.findAll({ where: { createdAt: { [Op.gte]: start } }, attributes: ['createdAt'] }),
      Contact.findAll({ where: { createdAt: { [Op.gte]: start } }, attributes: ['createdAt'] }),
      Appointment.findAll({ where: { createdAt: { [Op.gte]: start } }, attributes: ['createdAt'] }),
      Comment.findAll({ where: { createdAt: { [Op.gte]: start } }, attributes: ['createdAt'] }),
      Newsletter.findAll({ where: { subscribedAt: { [Op.gte]: start } }, attributes: ['subscribedAt'] }),
    ]);

    const pageViews = await countByCreatedAt(views, buckets);
    const messages = await countByCreatedAt(contacts, buckets);
    const rdv = await countByCreatedAt(appointments, buckets);
    const blogComments = await countByCreatedAt(comments, buckets);
    const newsletter = await countByCreatedAt(subscribers, buckets, 'subscribedAt');

    return buckets.map((bucket) => ({
      key: bucket.key,
      label: bucket.label,
      pageViews: pageViews[bucket.key] || 0,
      messages: messages[bucket.key] || 0,
      appointments: rdv[bucket.key] || 0,
      comments: blogComments[bucket.key] || 0,
      subscribers: newsletter[bucket.key] || 0,
    }));
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
