import { Op, type WhereOptions } from 'sequelize';

export function publicVisibilityWhere(): WhereOptions {
  const now = new Date();
  return {
    published: true,
    [Op.or]: [
      { publishedAt: null },
      { publishedAt: { [Op.lte]: now } },
    ],
  };
}

export function isPubliclyVisible(item: { published?: boolean; publishedAt?: Date | string | null }): boolean {
  if (!item.published) return false;
  if (!item.publishedAt) return true;
  return new Date(item.publishedAt).getTime() <= Date.now();
}
