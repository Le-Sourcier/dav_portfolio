import BlogPost, { Comment, BlogView } from '../models/BlogPost.js';
import { IBlogPost, IBlogComment } from '../types/entities.types.js';
import { AppError } from '../middlewares/error.middleware.js';
import { ErrorCode, HttpStatus } from '../types/response.types.js';
import { generateSlug, calculateReadTime } from '../utils/helpers.js';
import { Op } from 'sequelize';

type CommentListFilters = {
  page?: number;
  limit?: number;
  postId?: string;
  search?: string;
  mentioned?: string;
  parentOnly?: boolean;
  sort?: 'recent' | 'oldest';
};

type CommentListResult = {
  comments: IBlogComment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

class BlogService {
  async findAll(published?: boolean): Promise<IBlogPost[]> {
    const where = published !== undefined ? { published } : {};
    const posts = await BlogPost.findAll({
      where,
      include: [
        {
          model: Comment,
          as: 'comments',
          where: { parentId: null },
          required: false,
          include: [{ model: Comment, as: 'replies' }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    return posts;
  }

  async findById(id: string, publishedOnly = false): Promise<IBlogPost> {
    const where: Record<string, unknown> = { id };
    if (publishedOnly) where.published = true;
    const post = await BlogPost.findOne({
      where,
      include: [
        {
          model: Comment,
          as: 'comments',
          where: { parentId: null },
          required: false,
          include: [{ model: Comment, as: 'replies' }],
        },
      ],
    });
    if (!post) {
      throw new AppError('Blog post not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return post;
  }

  async findBySlug(slug: string): Promise<IBlogPost> {
    const post = await BlogPost.findOne({
      where: { slug, published: true },
      include: [
        {
          model: Comment,
          as: "comments",
          where: { parentId: null },
          required: false,
          include: [{ model: Comment, as: "replies" }],
          order: [["createdAt", "ASC"]],
        },
      ],
    });
    if (!post) {
      throw new AppError("Blog post not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return post;
  }

  async create(data: Omit<IBlogPost, 'id' | 'slug' | 'readTime' | 'createdAt' | 'updatedAt'>): Promise<IBlogPost> {
    const slug = generateSlug(data.title);
    const readTime = calculateReadTime(data.content);

    // Check for slug collision
    const existing = await BlogPost.findOne({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const post = await BlogPost.create({
      ...data,
      slug: finalSlug,
      readTime,
    });
    return post;
  }

  async update(id: string, data: Partial<IBlogPost>): Promise<IBlogPost> {
    const post = await BlogPost.findByPk(id);
    if (!post) {
      throw new AppError('Blog post not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // Update slug if title changes
    const updateData: Partial<IBlogPost> = { ...data };
    if (data.title && data.title !== post.title) {
      updateData.slug = generateSlug(data.title);
    }

    // Update read time if content changes
    if (data.content) {
      updateData.readTime = calculateReadTime(data.content);
    }

    await post.update(updateData);
    return post;
  }

  async delete(id: string): Promise<void> {
    const post = await BlogPost.findByPk(id);
    if (!post) {
      throw new AppError('Blog post not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    await post.destroy();
  }

  async addComment(
    postId: string,
    data: { author: string; email: string; content: string; parentId?: string | null },
  ): Promise<IBlogComment> {
    const post = await BlogPost.findByPk(postId);
    if (!post) {
      throw new AppError('Blog post not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // Extract @mentions from content (e.g. @David, @Marie)
    const mentionRegex = /@([A-Za-zÀ-ÿ][\wÀ-]*)/g;
    const mentions: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = mentionRegex.exec(data.content)) !== null) {
      mentions.push(match[1]!);
    }

    const comment = await Comment.create({
      author: data.author,
      email: data.email,
      content: data.content,
      postId,
      parentId: data.parentId ?? null,
      mentions,
    });

    return comment;
  }

  async addAdminReply(
    parentId: string,
    data: { author: string; email: string; content: string; mentions?: string[] },
  ): Promise<IBlogComment> {
    const parent = await Comment.findByPk(parentId);
    if (!parent) {
      throw new AppError('Comment not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const extractedMentions = this.extractMentions(data.content);
    const explicitMentions = data.mentions?.map((mention) => mention.trim()).filter(Boolean) || [];
    const mentions = Array.from(new Set([...explicitMentions, ...extractedMentions]));

    return Comment.create({
      author: data.author,
      email: data.email,
      content: data.content,
      postId: parent.postId,
      parentId: parent.id,
      mentions,
    });
  }

  async findComments(filters: CommentListFilters = {}): Promise<CommentListResult> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const offset = (page - 1) * limit;
    const where: any = {};

    if (filters.postId) where.postId = filters.postId;
    if (filters.parentOnly) where.parentId = null;
    if (filters.mentioned) {
      where.mentions = { [Op.contains]: [filters.mentioned] };
    }
    if (filters.search) {
      const like = { [Op.iLike]: `%${filters.search}%` };
      where[Op.or] = [
        { author: like },
        { email: like },
        { content: like },
      ];
    }

    const { rows, count } = await Comment.findAndCountAll({
      where,
      include: [
        { model: Comment, as: 'replies' },
        { model: BlogPost, attributes: ['id', 'title', 'slug'], required: false },
      ],
      order: [['createdAt', filters.sort === 'oldest' ? 'ASC' : 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return {
      comments: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.max(1, Math.ceil(count / limit)),
      },
    };
  }

  async findCommentThread(commentId: string): Promise<IBlogComment> {
    const comment = await Comment.findByPk(commentId, {
      include: [{ model: Comment, as: 'replies' }],
    });
    if (!comment) {
      throw new AppError('Comment not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return comment;
  }

  async deleteComment(commentId: string): Promise<void> {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      throw new AppError('Comment not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    await comment.destroy();
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@([A-Za-zÀ-ÿ][\wÀ-]*)/g;
    const mentions: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]!);
    }
    return Array.from(new Set(mentions));
  }

  async findByCategory(category: string): Promise<IBlogPost[]> {
    const posts = await BlogPost.findAll({
      where: { category, published: true },
      include: [{ model: Comment, as: 'comments' }],
      order: [['createdAt', 'DESC']],
    });
    return posts;
  }

  async incrementView(id: string, ip: string, userAgent: string): Promise<{ unique: boolean }> {
    const post = await BlogPost.findByPk(id);
    if (!post) {
      throw new AppError('Blog post not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const isNew = await BlogView.recordView(id, ip, userAgent);
    if (isNew) {
      await post.increment('viewCount');
    }
    return { unique: isNew };
  }

  async incrementShare(id: string): Promise<void> {
    const post = await BlogPost.findByPk(id);
    if (!post) {
      throw new AppError('Blog post not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    await post.increment('shareCount');
  }

  async getStats(): Promise<{
    totalViews: number;
    totalShares: number;
    totalComments: number;
    totalPosts: number;
    publishedPosts: number;
    topPosts: Pick<IBlogPost, 'id' | 'title' | 'slug' | 'viewCount' | 'shareCount'>[];
  }> {
    const [viewsResult, sharesResult] = await Promise.all([
      BlogPost.sum('viewCount'),
      BlogPost.sum('shareCount'),
    ]);
    const totalComments = await Comment.count();
    const totalPosts = await BlogPost.count();
    const publishedPosts = await BlogPost.count({ where: { published: true } });

    const topPosts = await BlogPost.findAll({
      attributes: ['id', 'title', 'slug', 'viewCount', 'shareCount'],
      where: { published: true },
      order: [['viewCount', 'DESC']],
      limit: 5,
      raw: true,
    });

    return {
      totalViews: viewsResult || 0,
      totalShares: sharesResult || 0,
      totalComments,
      totalPosts,
      publishedPosts,
      topPosts: topPosts as Pick<IBlogPost, 'id' | 'title' | 'slug' | 'viewCount' | 'shareCount'>[],
    };
  }
}

export const blogService = new BlogService();
export default blogService;
