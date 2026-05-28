import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';
import { INewsletter } from '../types/entities.types.js';

interface NewsletterCreationAttributes extends Optional<INewsletter, 'id' | 'locale' | 'active' | 'subscribedAt' | 'unsubscribedAt'> {}

class Newsletter extends Model<INewsletter, NewsletterCreationAttributes> implements INewsletter {
  declare id: string;
  declare email: string;
  declare locale: 'fr' | 'en';
  declare active: boolean;
  declare subscribedAt: Date;
  declare unsubscribedAt?: Date;
}

Newsletter.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    locale: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: 'fr',
      validate: { isIn: [['fr', 'en']] },
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    subscribedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    unsubscribedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Newsletter',
    tableName: 'newsletter_subscribers',
    timestamps: false,
  }
);

export default Newsletter;
