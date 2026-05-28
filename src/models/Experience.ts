import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';
import {
  IExperience,
  ExperienceAchievement,
  ExperienceLink,
  SolutionDiagram,
  ImpactData,
} from '../types/entities.types.js';

interface ExperienceCreationAttributes extends Optional<IExperience, 'id' | 'published' | 'publishedAt' | 'createdAt' | 'updatedAt'> {}

class Experience extends Model<IExperience, ExperienceCreationAttributes> implements IExperience {
  declare id: string;
  declare title: string;
  declare company: string;
  declare location?: string;
  declare dates: string;
  declare description: string;
  declare details?: string[];
  declare links?: ExperienceLink[];
  declare coverImage?: string;
  declare illustrativeImages?: string[];
  declare stack?: string[];
  declare challenges?: string[];
  declare achievements?: ExperienceAchievement[];
  declare solutionDiagram?: SolutionDiagram;
  declare impactGraph?: ImpactData[];
  declare title_en?: string;
  declare description_en?: string;
  declare published: boolean;
  declare publishedAt?: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Experience.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    dates: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    links: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    coverImage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    illustrativeImages: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    stack: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    challenges: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    achievements: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    solutionDiagram: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    impactGraph: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    title_en: { type: DataTypes.STRING(255), allowNull: true },
    description_en: { type: DataTypes.TEXT, allowNull: true },
    published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Experience',
    tableName: 'experiences',
  }
);

export default Experience;
