import BlogPost, { Comment, BlogView, BlogTag, BlogPostTag } from '../models/BlogPost.js';
import { IBlogPost, IBlogComment, IBlogTag } from '../types/entities.types.js';
import { AppError } from '../middlewares/error.middleware.js';
import { ErrorCode, HttpStatus } from '../types/response.types.js';
import { generateSlug, calculateReadTime } from '../utils/helpers.js';
import { publicVisibilityWhere } from '../utils/publication.js';
import newsletterService from './newsletter.service.js';
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
  private postIncludes() {
    return [
      {
        model: BlogTag,
        as: 'blogTags',
        through: { attributes: [] },
      },
      {
        model: Comment,
        as: 'comments',
        where: { parentId: null },
        required: false,
        include: [{ model: Comment, as: 'replies' }],
      },
    ];
  }

  private visibleWhere() {
    return publicVisibilityWhere();
  }

  async findAll(published?: boolean, publicOnly = false): Promise<IBlogPost[]> {
    const where = publicOnly
      ? this.visibleWhere()
      : published !== undefined
        ? { published }
        : {};
    const posts = await BlogPost.findAll({
      where,
      include: this.postIncludes(),
      order: [['createdAt', 'DESC']],
    });
    return posts;
  }

  async findById(id: string, publishedOnly = false): Promise<IBlogPost> {
    const where: Record<string, unknown> = { id };
    if (publishedOnly) Object.assign(where, this.visibleWhere());
    const post = await BlogPost.findOne({
      where,
      include: this.postIncludes(),
    });
    if (!post) {
      throw new AppError('Blog post not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return post;
  }

  async findBySlug(slug: string): Promise<IBlogPost> {
    const post = await BlogPost.findOne({
      where: { slug, ...this.visibleWhere() },
      include: this.postIncludes(),
    });
    if (!post) {
      throw new AppError("Blog post not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return post;
  }

  async create(data: Omit<IBlogPost, 'id' | 'slug' | 'readTime' | 'createdAt' | 'updatedAt'>): Promise<IBlogPost> {
    const { tagIds, tags, ...postData } = data;
    const slug = generateSlug(data.title);
    const readTime = calculateReadTime(data.content);

    // Check for slug collision
    const existing = await BlogPost.findOne({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const post = await BlogPost.create({
      ...postData,
      tags,
      slug: finalSlug,
      readTime,
    });
    await this.syncPostTags(post, tagIds, tags);
    await this.sendPublicationNewsletterIfDue(post.id);
    return this.findById(post.id);
  }

  async update(id: string, data: Partial<IBlogPost>): Promise<IBlogPost> {
    const post = await BlogPost.findOne({ where: { id, ...this.visibleWhere() } });
    if (!post) {
      throw new AppError('Blog post not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // Update slug if title changes
    const { tagIds, tags, ...rest } = data;
    const updateData: Partial<IBlogPost> = { ...rest, ...(tags ? { tags } : {}) };
    if (data.title && data.title !== post.title) {
      updateData.slug = generateSlug(data.title);
    }

    // Update read time if content changes
    if (data.content) {
      updateData.readTime = calculateReadTime(data.content);
    }

    await post.update(updateData);
    await this.syncPostTags(post, tagIds, tags);
    await this.sendPublicationNewsletterIfDue(id);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const post = await BlogPost.findOne({ where: { id, ...this.visibleWhere() } });
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
      where: { category, ...this.visibleWhere() },
      include: this.postIncludes(),
      order: [['createdAt', 'DESC']],
    });
    return posts;
  }

  async findTags(includeHidden = false): Promise<IBlogTag[]> {
    const tags = await BlogTag.findAll({
      where: includeHidden ? {} : { isVisible: true },
      order: [['name', 'ASC']],
    });
    return Promise.all(tags.map((tag) => this.withTagStats(tag, !includeHidden)));
  }

  async findTagBySlug(slug: string): Promise<IBlogTag & { posts: IBlogPost[] }> {
    const tag = await BlogTag.findOne({
      where: { slug, isVisible: true },
      include: [{
        model: BlogPost,
        as: 'posts',
        where: this.visibleWhere(),
        required: false,
        through: { attributes: [] },
        include: [{ model: BlogTag, as: 'blogTags', through: { attributes: [] } }],
      }],
    });
    if (!tag) {
      throw new AppError('Blog tag not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    const withStats = await this.withTagStats(tag, true);
    return { ...withStats, posts: ((tag as any).posts || []) as IBlogPost[] };
  }

  async createTag(data: Partial<IBlogTag>): Promise<IBlogTag> {
    if (!data.name?.trim()) {
      throw new AppError('Tag name is required', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
    const slug = data.slug?.trim() || generateSlug(data.name);
    const tag = await BlogTag.create({
      name: data.name.trim(),
      slug,
      description: data.description?.trim() || null,
      color: data.color?.trim() || null,
      isVisible: data.isVisible ?? true,
    });
    return this.withTagStats(tag, false);
  }

  async updateTag(id: string, data: Partial<IBlogTag>): Promise<IBlogTag> {
    const tag = await BlogTag.findByPk(id);
    if (!tag) {
      throw new AppError('Blog tag not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    await tag.update({
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.slug !== undefined ? { slug: data.slug.trim() || generateSlug(data.name || tag.name) } : {}),
      ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
      ...(data.color !== undefined ? { color: data.color?.trim() || null } : {}),
      ...(data.isVisible !== undefined ? { isVisible: data.isVisible } : {}),
    });
    return this.withTagStats(tag, false);
  }

  async deleteTag(id: string): Promise<void> {
    const tag = await BlogTag.findByPk(id);
    if (!tag) {
      throw new AppError('Blog tag not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    await BlogPostTag.destroy({ where: { tagId: id } });
    await tag.destroy();
  }

  async getTagStats(): Promise<IBlogTag[]> {
    const tags = await BlogTag.findAll({ order: [['name', 'ASC']] });
    return Promise.all(tags.map((tag) => this.withTagStats(tag, false)));
  }

  private async syncPostTags(post: BlogPost, tagIds?: string[], tagNames?: string[]): Promise<void> {
    if (!tagIds && !tagNames) return;
    const ids = new Set<string>(tagIds?.filter(Boolean) || []);

    for (const name of tagNames || []) {
      const cleanName = name.trim();
      if (!cleanName) continue;
      const slug = generateSlug(cleanName);
      const [tag] = await BlogTag.findOrCreate({
        where: { slug },
        defaults: { name: cleanName, slug, isVisible: true },
      });
      ids.add(tag.id);
    }

    await (post as any).setBlogTags(Array.from(ids));
  }

  private async withTagStats(tag: BlogTag, publicOnly: boolean): Promise<IBlogTag> {
    const posts = await (tag as any).getPosts({
      joinTableAttributes: [],
      ...(publicOnly ? { where: this.visibleWhere() } : {}),
    }) as BlogPost[];
    const postIds = posts.map((post) => post.id);
    const commentsCount = postIds.length ? await Comment.count({ where: { postId: postIds } }) : 0;
    return {
      ...tag.toJSON(),
      postsCount: posts.length,
      viewsCount: posts.reduce((sum, post) => sum + (post.viewCount || 0), 0),
      sharesCount: posts.reduce((sum, post) => sum + (post.shareCount || 0), 0),
      commentsCount,
    } as IBlogTag;
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
    const publishedPosts = await BlogPost.count({ where: this.visibleWhere() });

    const topPosts = await BlogPost.findAll({
      attributes: ['id', 'title', 'slug', 'viewCount', 'shareCount'],
      where: this.visibleWhere(),
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

  async sendPublicationNewsletterIfDue(id: string): Promise<{ sent: number; failed: number } | null> {
    const post = await BlogPost.findOne({
      where: {
        id,
        newsletterSentAt: null,
        ...this.visibleWhere(),
      },
    });

    if (!post) return null;

    const result = await newsletterService.sendBlogPostToSubscribers(post);
    if (result.sent > 0 || result.failed === 0) {
      await post.update({ newsletterSentAt: new Date() });
    }
    return result;
  }

  async sendDuePublicationNewsletters(): Promise<{ posts: number; sent: number; failed: number }> {
    const posts = await BlogPost.findAll({
      where: {
        newsletterSentAt: null,
        ...this.visibleWhere(),
      },
      order: [['publishedAt', 'ASC'], ['createdAt', 'ASC']],
    });

    let sent = 0;
    let failed = 0;
    for (const post of posts) {
      const result = await this.sendPublicationNewsletterIfDue(post.id);
      if (result) {
        sent += result.sent;
        failed += result.failed;
      }
    }

    return { posts: posts.length, sent, failed };
  }
}

export const blogService = new BlogService();
export default blogService;
