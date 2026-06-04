const ForumPost = require('../models/ForumPost');
const ForumComment = require('../models/ForumComment');
const ForumCategory = require('../models/ForumCategory');

// ── Posts ──────────────────────────────────────────────────────────────────

// GET /api/forum/posts
async function getPosts(req, res, next) {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(parseInt(limit), 50);
    const [posts, total] = await Promise.all([
      ForumPost.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Math.min(parseInt(limit), 50))
        .populate('userId', 'username avatarUrl')
        .lean(),
      ForumPost.countDocuments(filter),
    ]);

    res.json({ posts, total, page: parseInt(page) });
  } catch (err) {
    next(err);
  }
}

// GET /api/forum/posts/:id
async function getPost(req, res, next) {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('userId', 'username avatarUrl')
      .lean();
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    next(err);
  }
}

// GET /api/forum/posts/user/:userId
async function getUserPosts(req, res, next) {
  try {
    const posts = await ForumPost.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

// POST /api/forum/posts
async function createPost(req, res, next) {
  try {
    const { title, content, category, tags } = req.body;
    const post = await ForumPost.create({
      userId: req.user._id,
      title,
      content,
      category: category || 'general',
      tags: tags || [],
    });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
}

// PUT /api/forum/posts/:id
async function updatePost(req, res, next) {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isOwner = String(post.userId) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { title, content, category, tags } = req.body;
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (category !== undefined) post.category = category;
    if (tags !== undefined) post.tags = tags;

    await post.save();
    res.json(post);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/forum/posts/:id
async function deletePost(req, res, next) {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isOwner = String(post.userId) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Promise.all([
      post.deleteOne(),
      ForumComment.deleteMany({ postId: post._id }),
    ]);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
}

// ── Comments ───────────────────────────────────────────────────────────────

// GET /api/forum/posts/:id/comments
async function getComments(req, res, next) {
  try {
    const post = await ForumPost.findById(req.params.id).lean();
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comments = await ForumComment.find({ postId: req.params.id })
      .sort({ createdAt: 1 })
      .populate('userId', 'username avatarUrl')
      .lean();
    res.json(comments);
  } catch (err) {
    next(err);
  }
}

// POST /api/forum/posts/:id/comments
async function createComment(req, res, next) {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await ForumComment.create({
      postId: post._id,
      userId: req.user._id,
      content: req.body.content,
    });

    // Increment denormalized counter
    await ForumPost.findByIdAndUpdate(post._id, { $inc: { commentCount: 1 } });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

// ── Categories ─────────────────────────────────────────────────────────────

// GET /api/forum/categories
async function getCategories(req, res, next) {
  try {
    const categories = await ForumCategory.find().sort({ name: 1 }).lean();
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

// POST /api/forum/categories  (admin only)
async function createCategory(req, res, next) {
  try {
    const { name, slug, description } = req.body;
    const category = await ForumCategory.create({ name, slug, description });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPosts, getPost, getUserPosts, createPost, updatePost, deletePost,
  getComments, createComment,
  getCategories, createCategory,
};
