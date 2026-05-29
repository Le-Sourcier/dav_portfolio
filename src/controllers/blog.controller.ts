import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { blogService } from '../services/blog.service.js';
import { revalidationService } from '../services/revalidation.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';

/**
 * Verify the Authorization header contains a valid admin JWT.
 * Returns true only if the token is cryptographically valid.
 */
function isValidAdminToken(req: Request): boolean {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return false;
  try {
    jwt.verify(header.slice(7), config.jwt.secret);
    return true;
  } catch {
    return false;
  }
}

export const getAllPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Only admins with a valid JWT can see unpublished posts
    const isAdmin = isValidAdminToken(req);
    const published = isAdmin
      ? (req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined)
      : undefined;
    const posts = await blogService.findAll(published, !isAdmin);
    sendSuccess(res, posts, 'Blog posts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getAllAdminPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const published = req.query.published === 'true'
      ? true
      : req.query.published === 'false'
        ? false
        : undefined;
    const posts = await blogService.findAll(published, false);
    sendSuccess(res, posts, 'Blog posts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getAdminPostById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await blogService.findById(req.params.id, false);
    sendSuccess(res, post, 'Blog post retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Public requests only see published posts; admin (with valid JWT) sees all
    const isAdmin = isValidAdminToken(req);
    const post = await blogService.findById(req.params.id, !isAdmin);
    sendSuccess(res, post, 'Blog post retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getPostBySlug = async (req: Request<{ slug: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await blogService.findBySlug(req.params.slug);
    sendSuccess(res, post, 'Blog post retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await blogService.create(req.body);
    void revalidationService.revalidate({ tags: ['blog', `blog:${post.slug}`] });
    sendCreated(res, post, 'Blog post created successfully');
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const previousPost = await blogService.findById(req.params.id);
    const post = await blogService.update(req.params.id, req.body);
    void revalidationService.revalidate({
      tags: ['blog', `blog:${previousPost.slug}`, `blog:${post.slug}`],
    });
    sendSuccess(res, post, 'Blog post updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await blogService.findById(req.params.id);
    await blogService.delete(req.params.id);
    void revalidationService.revalidate({ tags: ['blog', `blog:${post.slug}`] });
    sendSuccess(res, null, 'Blog post deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comment = await blogService.addComment(req.params.id, req.body);
    const post = await blogService.findById(req.params.id);
    void revalidationService.revalidate({ tags: ['blog', `blog:${post.slug}`] });
    sendCreated(res, comment, 'Comment added successfully');
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await blogService.findComments({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      postId: typeof req.query.postId === 'string' ? req.query.postId : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      mentioned: typeof req.query.mentioned === 'string' ? req.query.mentioned : undefined,
      parentOnly: req.query.parentOnly === 'true',
      sort: req.query.sort === 'oldest' ? 'oldest' : 'recent',
    });
    sendSuccess(res, result, 'Comments retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getCommentThread = async (req: Request<{ commentId: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comment = await blogService.findCommentThread(req.params.commentId);
    sendSuccess(res, comment, 'Comment thread retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const replyToComment = async (req: Request<{ commentId: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comment = await blogService.addAdminReply(req.params.commentId, req.body);
    const postId = comment.postId;
    if (postId) {
      const post = await blogService.findById(postId);
      void revalidationService.revalidate({ tags: ['blog', `blog:${post.slug}`] });
    }
    sendCreated(res, comment, 'Reply added successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req: Request<{ commentId: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comment = await blogService.findCommentThread(req.params.commentId);
    await blogService.deleteComment(req.params.commentId);
    const postId = comment.postId;
    if (postId) {
      const post = await blogService.findById(postId);
      void revalidationService.revalidate({ tags: ['blog', `blog:${post.slug}`] });
    }
    sendSuccess(res, null, 'Comment deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getTags = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const isAdmin = isValidAdminToken(req);
    const tags = await blogService.findTags(isAdmin);
    sendSuccess(res, tags, 'Blog tags retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getTagBySlug = async (req: Request<{ slug: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tag = await blogService.findTagBySlug(req.params.slug);
    sendSuccess(res, tag, 'Blog tag retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tag = await blogService.createTag(req.body);
    void revalidationService.revalidate({ tags: ['blog'] });
    sendCreated(res, tag, 'Blog tag created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateTag = async (req: Request<{ tagId: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tag = await blogService.updateTag(req.params.tagId, req.body);
    void revalidationService.revalidate({ tags: ['blog'] });
    sendSuccess(res, tag, 'Blog tag updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteTag = async (req: Request<{ tagId: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await blogService.deleteTag(req.params.tagId);
    void revalidationService.revalidate({ tags: ['blog'] });
    sendSuccess(res, null, 'Blog tag deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getTagStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await blogService.getTagStats();
    sendSuccess(res, stats, 'Blog tag stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const trackView = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || req.socket.remoteAddress
      || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const result = await blogService.incrementView(req.params.id, ip, userAgent);
    sendSuccess(res, result, 'View tracked');
  } catch (error) {
    next(error);
  }
};

export const trackShare = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await blogService.incrementShare(req.params.id);
    sendSuccess(res, null, 'Share tracked');
  } catch (error) {
    next(error);
  }
};

export const getBlogStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await blogService.getStats();
    sendSuccess(res, stats, 'Blog stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export default {
  getAllPosts,
  getAllAdminPosts,
  getAdminPostById,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  addComment,
  getComments,
  getCommentThread,
  replyToComment,
  deleteComment,
  getTags,
  getTagBySlug,
  createTag,
  updateTag,
  deleteTag,
  getTagStats,
  trackView,
  trackShare,
  getBlogStats,
};
