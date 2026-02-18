import { Router } from 'express';
import {
  getAllPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  addComment,
  trackView,
  trackShare,
  getBlogStats,
} from '../controllers/blog.controller.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  createBlogPostValidator,
  updateBlogPostValidator,
  blogPostIdValidator,
  blogSlugValidator,
  createCommentValidator,
} from '../validators/blog.validator.js';
import { commentLimiter, trackingLimiter } from '../middlewares/rateLimit.middleware.js';
import { requireVisitorAuth, matchVisitorEmail } from '../middlewares/visitorAuth.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/blog:
 *   get:
 *     summary: Get all blog posts
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 *         description: Filter by published status
 *     responses:
 *       200:
 *         description: List of blog posts
 */
router.get('/', getAllPosts);

/**
 * @swagger
 * /api/blog/slug/{slug}:
 *   get:
 *     summary: Get blog post by slug
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog post details
 *       404:
 *         description: Post not found
 */
router.get('/slug/:slug', validate(blogSlugValidator), getPostBySlug);

/**
 * @swagger
 * /api/blog/{id}:
 *   get:
 *     summary: Get blog post by ID
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Blog post details
 *       404:
 *         description: Post not found
 */
router.get('/:id', validate(blogPostIdValidator), getPostById);

/**
 * @swagger
 * /api/blog:
 *   post:
 *     summary: Create a new blog post
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlogPost'
 *     responses:
 *       201:
 *         description: Blog post created
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, adminMiddleware, validate(createBlogPostValidator), createPost);

/**
 * @swagger
 * /api/blog/{id}:
 *   put:
 *     summary: Update a blog post
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Blog post updated
 *       404:
 *         description: Post not found
 */
router.put('/:id', authMiddleware, adminMiddleware, validate(updateBlogPostValidator), updatePost);

/**
 * @swagger
 * /api/blog/{id}:
 *   delete:
 *     summary: Delete a blog post
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Blog post deleted
 *       404:
 *         description: Post not found
 */
router.delete('/:id', authMiddleware, adminMiddleware, validate(blogPostIdValidator), deletePost);

/**
 * @swagger
 * /api/blog/{id}/comments:
 *   post:
 *     summary: Add a comment to a blog post
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [author, email, content]
 *             properties:
 *               author:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 *       404:
 *         description: Post not found
 */
router.post('/:id/comments', commentLimiter, requireVisitorAuth, matchVisitorEmail(), validate(createCommentValidator), addComment);

// POST /api/blog/:id/view   -- track a view (public)
router.post('/:id/view', trackingLimiter, validate(blogPostIdValidator), trackView);

// POST /api/blog/:id/share  -- track a share (public)
router.post('/:id/share', trackingLimiter, validate(blogPostIdValidator), trackShare);

// GET /api/blog/stats        -- blog analytics (admin)
router.get('/stats/overview', authMiddleware, adminMiddleware, getBlogStats);

export default router;
