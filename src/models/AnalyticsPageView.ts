import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

export interface IAnalyticsPageView {
  id: string;
  path: string;
  title?: string | null;
  referrer?: string | null;
  locale?: string | null;
  visitorHash: string;
  userAgent?: string | null;
  consent: 'analytics';
  createdAt: Date;
}

type AnalyticsPageViewCreationAttributes = Optional<IAnalyticsPageView, 'id' | 'title' | 'referrer' | 'locale' | 'userAgent' | 'consent' | 'createdAt'>;

class AnalyticsPageView
  extends Model<IAnalyticsPageView, AnalyticsPageViewCreationAttributes>
  implements IAnalyticsPageView
{
  declare id: string;
  declare path: string;
  declare title?: string | null;
  declare referrer?: string | null;
  declare locale?: string | null;
  declare visitorHash: string;
  declare userAgent?: string | null;
  declare consent: 'analytics';
  declare readonly createdAt: Date;
}

AnalyticsPageView.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    referrer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    locale: {
      type: DataTypes.STRING(12),
      allowNull: true,
    },
    visitorHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    consent: {
      type: DataTypes.ENUM('analytics'),
      allowNull: false,
      defaultValue: 'analytics',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'AnalyticsPageView',
    tableName: 'analytics_page_views',
    updatedAt: false,
    indexes: [
      { fields: ['created_at'] },
      { fields: ['path'] },
      { fields: ['visitor_hash'] },
    ],
  }
);

export default AnalyticsPageView;
