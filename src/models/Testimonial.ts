import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';
import { ITestimonial } from '../types/entities.types.js';

interface TestimonialCreationAttributes extends Optional<ITestimonial, 'id' | 'visible' | 'createdAt'> {}

class Testimonial extends Model<ITestimonial, TestimonialCreationAttributes> implements ITestimonial {
  declare id: string;
  declare name: string;
  declare role: string;
  declare company?: string;
  declare avatar?: string;
  declare content: string;
  declare rating?: number;
  declare visible: boolean;
  declare content_en?: string;
  declare role_en?: string;
  declare readonly createdAt: Date;
}

Testimonial.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    content_en: { type: DataTypes.TEXT, allowNull: true },
    role_en: { type: DataTypes.STRING(100), allowNull: true },
  },
  {
    sequelize,
    modelName: 'Testimonial',
    tableName: 'testimonials',
    updatedAt: false,
  }
);

export default Testimonial;
