import {
  DataTypes,
  Model,
  Optional,
  HasManyGetAssociationsMixin,
} from "sequelize";
import crypto from "crypto";
import { sequelize } from "../config/database.js";
import { config } from "../config/index.js";
import { IBlogPost, IBlogComment } from "../types/entities.types.js";

// Comment model
interface CommentCreationAttributes extends Optional<
  IBlogComment,
  "id" | "createdAt" | "parentId" | "mentions"
> {}

export class Comment
  extends Model<IBlogComment, CommentCreationAttributes>
  implements IBlogComment
{
  declare id: string;
  declare author: string;
  declare email: string;
  declare content: string;
  declare postId: string;
  declare parentId: string | null;
  declare mentions: string[];
  declare readonly createdAt: Date;
}

Comment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    author: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { isEmail: true },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    mentions: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Comment",
    tableName: "comments",
    updatedAt: false,
    indexes: [{ fields: ["post_id"] }, { fields: ["parent_id"] }],
  },
);

// BlogPost model
interface BlogPostCreationAttributes extends Optional<
  IBlogPost,
  "id" | "viewCount" | "shareCount" | "createdAt" | "updatedAt" | "comments"
> {}

class BlogPost
  extends Model<IBlogPost, BlogPostCreationAttributes>
  implements IBlogPost
{
  declare id: string;
  declare title: string;
  declare slug: string;
  declare excerpt: string;
  declare content: string;
  declare category: string;
  declare imageUrl: string;
  declare readTime: string;
  declare author: string;
  declare published: boolean;
  declare viewCount: number;
  declare shareCount: number;
  declare tags?: string[];
  declare comments?: IBlogComment[];
  declare title_en?: string;
  declare excerpt_en?: string;
  declare content_en?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare getComments: HasManyGetAssociationsMixin<Comment>;
}

BlogPost.init(
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
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    readTime: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: config.owner.name,
    },
    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    shareCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    title_en: { type: DataTypes.STRING(255), allowNull: true },
    excerpt_en: { type: DataTypes.TEXT, allowNull: true },
    content_en: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: "BlogPost",
    tableName: "blog_posts",
  },
);

// ======================== BlogView model (dedup unique views) ========================

export class BlogView extends Model {
  declare id: string;
  declare postId: string;
  declare visitorHash: string;
  declare readonly createdAt: Date;

  /**
   * Generate a stable visitor fingerprint hash from IP + User-Agent.
   * Not PII — just a SHA-256 hash for deduplication.
   */
  static hashVisitor(ip: string, userAgent: string): string {
    return crypto
      .createHash("sha256")
      .update(`${ip}::${userAgent}`)
      .digest("hex");
  }

  /**
   * Record a unique view. Returns true if new view, false if this visitor already viewed this post.
   */
  static async recordView(
    postId: string,
    ip: string,
    userAgent: string,
  ): Promise<boolean> {
    const hash = BlogView.hashVisitor(ip, userAgent);

    const existing = await BlogView.findOne({
      where: { postId, visitorHash: hash },
    });

    if (existing) return false;

    await BlogView.create({ postId, visitorHash: hash });
    return true;
  }
}

BlogView.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    visitorHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "BlogView",
    tableName: "blog_views",
    updatedAt: false,
    indexes: [{ fields: ["post_id", "visitor_hash"] }],
  },
);

// Associations
Comment.hasMany(Comment, { foreignKey: "parentId", as: "replies" });
Comment.belongsTo(Comment, { foreignKey: "parentId", as: "parent" });
BlogPost.hasMany(Comment, { foreignKey: "postId", as: "comments" });
Comment.belongsTo(BlogPost, { foreignKey: "postId" });
BlogPost.hasMany(BlogView, { foreignKey: "postId", as: "views" });
BlogView.belongsTo(BlogPost, { foreignKey: "postId" });

export default BlogPost;
