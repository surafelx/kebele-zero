// ── API mock ────────────────────────────────────────────────────────────────

const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../services/api', () => ({ __esModule: true, default: mockApi }));

import { forumAPI } from '../../services/forum';

// ── Helpers ────────────────────────────────────────────────────────────────

const makePost = (overrides = {}) => ({
  id: 'post-1',
  title: 'Test Post',
  content: 'Content here',
  category: 'general',
  tags: [],
  commentCount: 0,
  userId: 'u1',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  ...overrides,
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe('forumAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // getPosts ─────────────────────────────────────────────────────────────────

  describe('getPosts', () => {
    it('queries GET /forum/posts', async () => {
      mockApi.get.mockResolvedValueOnce({ data: { posts: [], total: 0, page: 1 } });
      await forumAPI.getPosts();
      expect(mockApi.get).toHaveBeenCalledWith('/forum/posts', { params: { page: 1, limit: 20 } });
    });

    it('applies category filter when provided', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [] });
      await forumAPI.getPosts('announcements');
      expect(mockApi.get).toHaveBeenCalledWith('/forum/posts', {
        params: { page: 1, limit: 20, category: 'announcements' },
      });
    });

    it('does not apply category filter when omitted', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [] });
      await forumAPI.getPosts();
      const [, options] = mockApi.get.mock.calls[0];
      expect(options.params).not.toHaveProperty('category');
    });

    it('uses custom page and limit', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [] });
      await forumAPI.getPosts(undefined, 3, 10);
      expect(mockApi.get).toHaveBeenCalledWith('/forum/posts', { params: { page: 3, limit: 10 } });
    });

    it('returns data from response', async () => {
      const data = { posts: [makePost()], total: 1 };
      mockApi.get.mockResolvedValueOnce({ data });
      const result = await forumAPI.getPosts();
      expect(result).toEqual(data);
    });

    it('throws on network error', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('network error'));
      await expect(forumAPI.getPosts()).rejects.toBeDefined();
    });
  });

  // getPost ──────────────────────────────────────────────────────────────────

  describe('getPost', () => {
    it('calls GET /forum/posts/:id', async () => {
      mockApi.get.mockResolvedValueOnce({ data: makePost() });
      const result = await forumAPI.getPost('post-1');
      expect(mockApi.get).toHaveBeenCalledWith('/forum/posts/post-1');
      expect(result).toMatchObject({ id: 'post-1' });
    });
  });

  // getUserPosts ─────────────────────────────────────────────────────────────

  describe('getUserPosts', () => {
    it('calls GET /forum/posts/user/:userId', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [makePost()] });
      await forumAPI.getUserPosts('u1');
      expect(mockApi.get).toHaveBeenCalledWith('/forum/posts/user/u1');
    });
  });

  // createPost ───────────────────────────────────────────────────────────────

  describe('createPost', () => {
    it('calls POST /forum/posts with post data', async () => {
      const newPost = { title: 'Hello', content: 'World', category: 'general', tags: [] };
      mockApi.post.mockResolvedValueOnce({ data: makePost() });
      await forumAPI.createPost(newPost);
      expect(mockApi.post).toHaveBeenCalledWith('/forum/posts', newPost);
    });

    it('returns created post', async () => {
      const post = makePost({ title: 'New Post' });
      mockApi.post.mockResolvedValueOnce({ data: post });
      const result = await forumAPI.createPost({ title: 'New Post', content: 'C', category: 'g' });
      expect(result).toMatchObject({ title: 'New Post' });
    });
  });

  // updatePost ───────────────────────────────────────────────────────────────

  describe('updatePost', () => {
    it('calls PUT /forum/posts/:id with updated fields', async () => {
      mockApi.put.mockResolvedValueOnce({ data: makePost({ title: 'Updated' }) });
      await forumAPI.updatePost('post-1', { title: 'Updated' });
      expect(mockApi.put).toHaveBeenCalledWith('/forum/posts/post-1', { title: 'Updated' });
    });
  });

  // deletePost ───────────────────────────────────────────────────────────────

  describe('deletePost', () => {
    it('calls DELETE /forum/posts/:id', async () => {
      mockApi.delete.mockResolvedValueOnce({});
      await forumAPI.deletePost('post-1');
      expect(mockApi.delete).toHaveBeenCalledWith('/forum/posts/post-1');
    });
  });

  // getCategories ────────────────────────────────────────────────────────────

  describe('getCategories', () => {
    it('calls GET /forum/categories', async () => {
      mockApi.get.mockResolvedValueOnce({ data: ['general', 'news'] });
      const result = await forumAPI.getCategories();
      expect(mockApi.get).toHaveBeenCalledWith('/forum/categories');
      expect(result).toEqual(['general', 'news']);
    });
  });

  // createComment ────────────────────────────────────────────────────────────

  describe('createComment', () => {
    it('calls POST /forum/posts/:postId/comments', async () => {
      mockApi.post.mockResolvedValueOnce({ data: { id: 'c1', content: 'hi' } });
      await forumAPI.createComment('post-1', 'hi');
      expect(mockApi.post).toHaveBeenCalledWith('/forum/posts/post-1/comments', { content: 'hi' });
    });

    it('returns created comment', async () => {
      mockApi.post.mockResolvedValueOnce({ data: { id: 'c1', content: 'hello' } });
      const result = await forumAPI.createComment('post-1', 'hello');
      expect(result).toMatchObject({ content: 'hello' });
    });
  });

  // getComments ──────────────────────────────────────────────────────────────

  describe('getComments', () => {
    it('calls GET /forum/posts/:postId/comments', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [] });
      await forumAPI.getComments('post-1');
      expect(mockApi.get).toHaveBeenCalledWith('/forum/posts/post-1/comments');
    });

    it('returns comments from response', async () => {
      const comments = [{ id: 'c1', content: 'hello' }];
      mockApi.get.mockResolvedValueOnce({ data: comments });
      const result = await forumAPI.getComments('post-1');
      expect(result).toEqual(comments);
    });
  });

  // deleteComment ────────────────────────────────────────────────────────────

  describe('deleteComment', () => {
    it('calls DELETE /forum/comments/:commentId', async () => {
      mockApi.delete.mockResolvedValueOnce({});
      await forumAPI.deleteComment('c1');
      expect(mockApi.delete).toHaveBeenCalledWith('/forum/comments/c1');
    });
  });

  // createCategory ───────────────────────────────────────────────────────────

  describe('createCategory', () => {
    it('calls POST /forum/categories', async () => {
      mockApi.post.mockResolvedValueOnce({ data: { id: 'cat1', name: 'Events' } });
      await forumAPI.createCategory({ name: 'Events', slug: 'events' });
      expect(mockApi.post).toHaveBeenCalledWith('/forum/categories', { name: 'Events', slug: 'events' });
    });

    it('returns created category', async () => {
      mockApi.post.mockResolvedValueOnce({ data: { id: 'cat2', name: 'Culture', slug: 'culture' } });
      const result = await forumAPI.createCategory({ name: 'Culture', slug: 'culture' });
      expect(result).toMatchObject({ name: 'Culture' });
    });
  });

  // getPosts — error handling ─────────────────────────────────────────────────

  describe('getPosts — additional', () => {
    it('returns empty array on API error gracefully if caught upstream', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Server error'));
      await expect(forumAPI.getPosts()).rejects.toThrow('Server error');
    });

    it('accepts a page parameter', async () => {
      mockApi.get.mockResolvedValueOnce({ data: { posts: [], total: 0 } });
      await forumAPI.getPosts('general', 2, 10);
      expect(mockApi.get).toHaveBeenCalledWith('/forum/posts', {
        params: { page: 2, limit: 10, category: 'general' },
      });
    });
  });
});
