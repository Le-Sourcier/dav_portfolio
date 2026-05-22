import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { blogService } from '../services/blog.service.js';
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
      : true; // Force published=true for unauthenticated requests
    const posts = await blogService.findAll(published);
    sendSuccess(res, posts, 'Blog posts retrieved successfully');
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
    sendCreated(res, post, 'Blog post created successfully');
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await blogService.update(req.params.id, req.body);
    sendSuccess(res, post, 'Blog post updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await blogService.delete(req.params.id);
    sendSuccess(res, null, 'Blog post deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comment = await blogService.addComment(req.params.id, req.body);
    sendCreated(res, comment, 'Comment added successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req: Request<{ commentId: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await blogService.deleteComment(req.params.commentId);
    sendSuccess(res, null, 'Comment deleted successfully');
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

export default { getAllPosts, getPostById, getPostBySlug, createPost, updatePost, deletePost, addComment, deleteComment, trackView, trackShare, getBlogStats };
