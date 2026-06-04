const express = require('express');
const { body } = require('express-validator');
const {
  getPosts, getPost, getUserPosts, createPost, updatePost, deletePost,
  getComments, createComment,
  getCategories, createCategory,
} = require('../controllers/forumController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Categories
router.get('/categories', getCategories);
router.post(
  '/categories',
  requireAuth, requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('slug').trim().notEmpty().withMessage('Slug is required'),
  ],
  validate,
  createCategory
);

// User posts
router.get('/posts/user/:userId', getUserPosts);

// Posts CRUD
router.get('/posts', getPosts);
router.get('/posts/:id', getPost);

router.post(
  '/posts',
  requireAuth,
  [
    body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('content').trim().isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  ],
  validate,
  createPost
);

router.put('/posts/:id', requireAuth, updatePost);
router.delete('/posts/:id', requireAuth, deletePost);

// Comments
router.get('/posts/:id/comments', getComments);
router.post(
  '/posts/:id/comments',
  requireAuth,
  [body('content').trim().notEmpty().withMessage('Comment content is required')],
  validate,
  createComment
);

module.exports = router;
