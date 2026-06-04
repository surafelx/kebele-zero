const request = require('supertest');
const app = require('../src/app');
const { createUser, createAdmin } = require('./helpers');

// Helper: create a post as the given user
async function makePost(token, overrides = {}) {
  const res = await request(app)
    .post('/api/forum/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: overrides.title || 'Test Post Title',
      content: overrides.content || 'This is the post content body.',
      category: overrides.category || 'general',
    });
  if (res.status !== 201) throw new Error(`makePost failed: ${JSON.stringify(res.body)}`);
  return res.body;
}

describe('Forum API', () => {
  // ── GET /api/forum/posts ────────────────────────────────────────────────

  describe('GET /api/forum/posts', () => {
    it('returns an empty array when there are no posts', async () => {
      const res = await request(app).get('/api/forum/posts');
      expect(res.status).toBe(200);
      expect(res.body.posts).toEqual([]);
      expect(res.body.total).toBe(0);
    });

    it('returns all posts sorted newest first', async () => {
      const { token } = await createUser({ username: 'fu1', email: 'f1@e.com' });
      await makePost(token, { title: 'First Post Title Here' });
      await makePost(token, { title: 'Second Post Title Here' });

      const res = await request(app).get('/api/forum/posts');
      expect(res.status).toBe(200);
      expect(res.body.posts.length).toBe(2);
      // Newest first
      expect(res.body.posts[0].title).toBe('Second Post Title Here');
    });

    it('filters posts by category', async () => {
      const { token } = await createUser({ username: 'fu2', email: 'f2@e.com' });
      await makePost(token, { title: 'A General Post Title', category: 'general' });
      await makePost(token, { title: 'An Announcement Post', category: 'announcements' });

      const res = await request(app).get('/api/forum/posts?category=announcements');
      expect(res.body.posts.length).toBe(1);
      expect(res.body.posts[0].category).toBe('announcements');
    });

    it('paginates results', async () => {
      const { token } = await createUser({ username: 'fu3', email: 'f3@e.com' });
      for (let i = 0; i < 5; i++) {
        await makePost(token, { title: `Paginated Post Number ${i}` });
      }
      const res = await request(app).get('/api/forum/posts?limit=2&page=1');
      expect(res.body.posts.length).toBe(2);
      expect(res.body.total).toBe(5);
    });
  });

  // ── GET /api/forum/posts/:id ────────────────────────────────────────────

  describe('GET /api/forum/posts/:id', () => {
    it('returns a single post by id', async () => {
      const { token } = await createUser({ username: 'fu4', email: 'f4@e.com' });
      const post = await makePost(token, { title: 'My Single Post Title' });

      const res = await request(app).get(`/api/forum/posts/${post._id}`);
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('My Single Post Title');
    });

    it('returns 404 for a non-existent post', async () => {
      const res = await request(app).get('/api/forum/posts/64f1234567890abcdef12345');
      expect(res.status).toBe(404);
    });
  });

  // ── POST /api/forum/posts ───────────────────────────────────────────────

  describe('POST /api/forum/posts', () => {
    it('creates a post when authenticated', async () => {
      const { token } = await createUser({ username: 'fu5', email: 'f5@e.com' });
      const res = await request(app)
        .post('/api/forum/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'New Forum Post Title', content: 'Content goes in here now.' });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('New Forum Post Title');
      expect(res.body.commentCount).toBe(0);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app)
        .post('/api/forum/posts')
        .send({ title: 'Unauthorized Post', content: 'Should fail immediately.' });
      expect(res.status).toBe(401);
    });

    it('returns 422 when title is too short', async () => {
      const { token } = await createUser({ username: 'fu6', email: 'f6@e.com' });
      const res = await request(app)
        .post('/api/forum/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Hi', content: 'Content is long enough here.' });
      expect(res.status).toBe(422);
    });

    it('returns 422 when content is too short', async () => {
      const { token } = await createUser({ username: 'fu7', email: 'f7@e.com' });
      const res = await request(app)
        .post('/api/forum/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Valid Title Here', content: 'Short' });
      expect(res.status).toBe(422);
    });
  });

  // ── PUT /api/forum/posts/:id ────────────────────────────────────────────

  describe('PUT /api/forum/posts/:id', () => {
    it('allows owner to update their post', async () => {
      const { token } = await createUser({ username: 'fu8', email: 'f8@e.com' });
      const post = await makePost(token, { title: 'Original Post Title' });

      const res = await request(app)
        .put(`/api/forum/posts/${post._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Post Title' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Post Title');
    });

    it('returns 403 when a different user tries to update', async () => {
      const { token: ownerToken } = await createUser({ username: 'fu9', email: 'f9@e.com' });
      const { token: otherToken } = await createUser({ username: 'f10', email: 'f10@e.com' });
      const post = await makePost(ownerToken, { title: 'Protected Post Title' });

      const res = await request(app)
        .put(`/api/forum/posts/${post._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hijacked Title' });

      expect(res.status).toBe(403);
    });

    it('allows admin to update any post', async () => {
      const { token: userToken } = await createUser({ username: 'f11', email: 'f11@e.com' });
      const { token: adminToken } = await createAdmin();
      const post = await makePost(userToken, { title: 'User Post Title Here' });

      const res = await request(app)
        .put(`/api/forum/posts/${post._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Admin Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Admin Updated Title');
    });
  });

  // ── DELETE /api/forum/posts/:id ─────────────────────────────────────────

  describe('DELETE /api/forum/posts/:id', () => {
    it('allows owner to delete their post', async () => {
      const { token } = await createUser({ username: 'f12', email: 'f12@e.com' });
      const post = await makePost(token, { title: 'Deletable Post Title' });

      const res = await request(app)
        .delete(`/api/forum/posts/${post._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted/i);
    });

    it('also deletes all comments on the post', async () => {
      const ForumComment = require('../src/models/ForumComment');
      const { token } = await createUser({ username: 'f13', email: 'f13@e.com' });
      const post = await makePost(token, { title: 'Post With Comments Title' });

      // Add a comment
      await request(app)
        .post(`/api/forum/posts/${post._id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'A comment' });

      await request(app)
        .delete(`/api/forum/posts/${post._id}`)
        .set('Authorization', `Bearer ${token}`);

      const remaining = await ForumComment.countDocuments({ postId: post._id });
      expect(remaining).toBe(0);
    });

    it('returns 403 when a different user tries to delete', async () => {
      const { token: ownerToken } = await createUser({ username: 'f14', email: 'f14@e.com' });
      const { token: otherToken } = await createUser({ username: 'f15', email: 'f15@e.com' });
      const post = await makePost(ownerToken, { title: 'Protected Delete Post' });

      const res = await request(app)
        .delete(`/api/forum/posts/${post._id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ── Comments ───────────────────────────────────────────────────────────

  describe('POST /api/forum/posts/:id/comments', () => {
    it('creates a comment and increments commentCount', async () => {
      const { token } = await createUser({ username: 'f16', email: 'f16@e.com' });
      const post = await makePost(token, { title: 'Commentable Post Title' });

      const res = await request(app)
        .post(`/api/forum/posts/${post._id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Great post!' });

      expect(res.status).toBe(201);
      expect(res.body.content).toBe('Great post!');

      const postRes = await request(app).get(`/api/forum/posts/${post._id}`);
      expect(postRes.body.commentCount).toBe(1);
    });

    it('returns 404 when commenting on non-existent post', async () => {
      const { token } = await createUser({ username: 'f17', email: 'f17@e.com' });
      const res = await request(app)
        .post('/api/forum/posts/64f1234567890abcdef12345/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Ghost comment' });
      expect(res.status).toBe(404);
    });

    it('returns 422 for empty comment content', async () => {
      const { token } = await createUser({ username: 'f18', email: 'f18@e.com' });
      const post = await makePost(token, { title: 'Empty Comment Test Post' });

      const res = await request(app)
        .post(`/api/forum/posts/${post._id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: '' });
      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/forum/posts/:id/comments', () => {
    it('returns comments for a post in chronological order', async () => {
      const { token } = await createUser({ username: 'f19', email: 'f19@e.com' });
      const post = await makePost(token, { title: 'Multi Comment Post Title' });

      await request(app)
        .post(`/api/forum/posts/${post._id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'First comment here' });
      await request(app)
        .post(`/api/forum/posts/${post._id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Second comment here' });

      const res = await request(app).get(`/api/forum/posts/${post._id}/comments`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].content).toBe('First comment here');
    });
  });

  // ── Categories ─────────────────────────────────────────────────────────

  describe('GET /api/forum/categories', () => {
    it('returns all categories', async () => {
      const { token } = await createAdmin();
      await request(app)
        .post('/api/forum/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'General', slug: 'general', description: 'General discussion' });

      const res = await request(app).get('/api/forum/categories');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('General');
    });
  });

  describe('POST /api/forum/categories', () => {
    it('allows admin to create a category', async () => {
      const { token } = await createAdmin();
      const res = await request(app)
        .post('/api/forum/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Announcements', slug: 'announcements' });
      expect(res.status).toBe(201);
    });

    it('returns 403 for non-admin users', async () => {
      const { token } = await createUser({ username: 'notadmin', email: 'na@e.com' });
      const res = await request(app)
        .post('/api/forum/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Sneaky', slug: 'sneaky' });
      expect(res.status).toBe(403);
    });
  });
});
