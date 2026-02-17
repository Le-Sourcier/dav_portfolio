import { Request, Response, NextFunction } from 'express';
import { blogService } from '../services/blog.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';

export const getAllPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const published = req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined;
    const posts = await blogService.findAll(published);
    sendSuccess(res, posts, 'Blog posts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Public requests only see published posts; admin (with valid token) sees all
    const hasAuth = !!req.headers.authorization;
    const post = await blogService.findById(req.params.id, !hasAuth);
    sendSuccess(res, post, 'Blog post retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getPostBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

export const updatePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await blogService.update(req.params.id, req.body);
    sendSuccess(res, post, 'Blog post updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await blogService.delete(req.params.id);
    sendSuccess(res, null, 'Blog post deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comment = await blogService.addComment(req.params.id, req.body);
    sendCreated(res, comment, 'Comment added successfully');
  } catch (error) {
    next(error);
  }
};

export const trackView = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

export const trackShare = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

export default { getAllPosts, getPostById, getPostBySlug, createPost, updatePost, deletePost, addComment, trackView, trackShare, getBlogStats };
