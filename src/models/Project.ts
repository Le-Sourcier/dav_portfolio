import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database.js";
import {
  IProject,
  ProjectCategory,
  ProjectLink,
  ProjectMetric,
  ChartData,
  SolutionDiagram,
  ImpactData,
} from "../types/entities.types.js";

interface ProjectCreationAttributes extends Optional<
  IProject,
  "id" | "createdAt" | "updatedAt" | "featured" | "tech" | "links"
> {}

class Project
  extends Model<IProject, ProjectCreationAttributes>
  implements IProject
{
  declare id: string;
  declare slug: string;
  declare title: string;
  declare name: string;
  declare category: ProjectCategory;
  declare image: string;
  declare description: string;
  declare headline?: string;
  declare problem: string;
  declare solution: string;
  declare result?: string;
  declare metric?: string;
  declare role?: string;
  declare tech: string[];
  declare links: ProjectLink[];
  declare featured: boolean;
  declare results: string[];
  declare metrics: ProjectMetric[];
  declare chartData: ChartData[];
  declare url?: string;
  declare solutionDiagram?: SolutionDiagram;
  declare impactGraph?: ImpactData[];
  declare title_en?: string;
  declare description_en?: string;
  declare problem_en?: string;
  declare solution_en?: string;
  declare headline_en?: string;
  declare result_en?: string;
  declare metric_en?: string;
  declare role_en?: string;
  declare results_en?: string[];
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Project.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(120),
      allowNull: false,
      defaultValue: "Fullstack",
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    headline: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    problem: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    solution: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    result: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metric: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tech: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    links: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    results: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    metrics: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    chartData: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    problem_en: { type: DataTypes.TEXT, allowNull: true },
    solution_en: { type: DataTypes.TEXT, allowNull: true },
    headline_en: { type: DataTypes.TEXT, allowNull: true },
    result_en: { type: DataTypes.TEXT, allowNull: true },
    metric_en: { type: DataTypes.STRING(255), allowNull: true },
    role_en: { type: DataTypes.STRING(255), allowNull: true },
    results_en: { type: DataTypes.JSONB, allowNull: true, defaultValue: [] },
  },
  {
    sequelize,
    modelName: "Project",
    tableName: "projects",
    indexes: [{ unique: true, fields: ["slug"] }],
  },
);

export default Project;
