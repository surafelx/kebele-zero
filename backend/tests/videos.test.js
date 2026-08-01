const request = require('supertest');
const app = require('../src/app');
const { createUser, createAdmin } = require('./helpers');
const { parseYouTubeId } = require('../src/controllers/videosController');

const TEST_CHANNEL_ID = 'UCabcdefghijklmnopqrstuv'; // UC + 22 chars
const RSS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/">
  <title>Test Channel</title>
  <entry>
    <yt:videoId>aaaaaaaaaaa</yt:videoId>
    <title>First Video</title>
    <published>2024-01-01T00:00:00+00:00</published>
    <media:description>Description A</media:description>
  </entry>
  <entry>
    <yt:videoId>bbbbbbbbbbb</yt:videoId>
    <title>Second Video</title>
    <published>2024-01-02T00:00:00+00:00</published>
  </entry>
</feed>`;

describe('Videos API', () => {
  // ── ID parsing (unit) ─────────────────────────────────────────────────────
  describe('parseYouTubeId', () => {
    it('extracts the ID from watch, youtu.be, embed, shorts links and bare IDs', () => {
      expect(parseYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(parseYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(parseYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0')).toBe('dQw4w9WgXcQ');
      expect(parseYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(parseYouTubeId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(parseYouTubeId('not a youtube link')).toBeNull();
    });
  });

  // ── Add video by link ─────────────────────────────────────────────────────
  describe('POST /api/media/admin/videos', () => {
    it('admin can add a video from a link (shown by default)', async () => {
      const { token } = await createAdmin({ email: 'vadmin1@e.com' });
      const res = await request(app)
        .post('/api/media/admin/videos')
        .set('Authorization', `Bearer ${token}`)
        .send({ link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Hello', category: 'music' });
      expect(res.status).toBe(201);
      expect(res.body.youtubeId).toBe('dQw4w9WgXcQ');
      expect(res.body.type).toBe('video');
      expect(res.body.isPublic).toBe(true);
    });

    it('rejects an invalid link with 422', async () => {
      const { token } = await createAdmin({ email: 'vadmin2@e.com' });
      const res = await request(app)
        .post('/api/media/admin/videos')
        .set('Authorization', `Bearer ${token}`)
        .send({ link: 'https://example.com/not-youtube' });
      expect(res.status).toBe(422);
    });

    it('rejects a duplicate video with 409', async () => {
      const { token } = await createAdmin({ email: 'vadmin3@e.com' });
      const body = { link: 'https://youtu.be/dQw4w9WgXcQ' };
      await request(app).post('/api/media/admin/videos').set('Authorization', `Bearer ${token}`).send(body);
      const res = await request(app).post('/api/media/admin/videos').set('Authorization', `Bearer ${token}`).send(body);
      expect(res.status).toBe(409);
    });

    it('rejects a non-admin', async () => {
      const { token } = await createUser({ username: 'vu1', email: 'vu1@e.com' });
      const res = await request(app)
        .post('/api/media/admin/videos')
        .set('Authorization', `Bearer ${token}`)
        .send({ link: 'https://youtu.be/dQw4w9WgXcQ' });
      expect(res.status).toBe(403);
    });
  });

  // ── Visibility + admin list + public exclusion ────────────────────────────
  describe('visibility and listing', () => {
    it('admin list includes videos; public feed excludes them; toggle hides/shows', async () => {
      const { token } = await createAdmin({ email: 'vadmin4@e.com' });
      const created = await request(app)
        .post('/api/media/admin/videos')
        .set('Authorization', `Bearer ${token}`)
        .send({ link: 'https://youtu.be/dQw4w9WgXcQ', title: 'Vid' });
      const id = created.body._id;

      // admin sees it
      const adminList = await request(app)
        .get('/api/media/admin/videos')
        .set('Authorization', `Bearer ${token}`);
      expect(adminList.body.some((v) => v._id === id)).toBe(true);

      // public /media does NOT include videos
      const pub = await request(app).get('/api/media');
      expect(pub.body.some((m) => m.type === 'video')).toBe(false);

      // hide it, then show it again
      const hide = await request(app)
        .put(`/api/media/admin/videos/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ isPublic: false });
      expect(hide.body.isPublic).toBe(false);

      const show = await request(app)
        .put(`/api/media/admin/videos/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ isPublic: true });
      expect(show.body.isPublic).toBe(true);
    });
  });

  // ── Channel sync (RSS mocked) ─────────────────────────────────────────────
  describe('Channels', () => {
    let realFetch;
    beforeEach(() => {
      realFetch = global.fetch;
      global.fetch = jest.fn(async () => ({ ok: true, text: async () => RSS_XML }));
    });
    afterEach(() => {
      global.fetch = realFetch;
    });

    it('adds a channel by link and syncs its videos as hidden', async () => {
      const { token } = await createAdmin({ email: 'chadmin1@e.com' });
      const res = await request(app)
        .post('/api/channels')
        .set('Authorization', `Bearer ${token}`)
        .send({ url: `https://www.youtube.com/channel/${TEST_CHANNEL_ID}` });

      expect(res.status).toBe(201);
      expect(res.body.added).toBe(2);
      expect(res.body.channel.channelId).toBe(TEST_CHANNEL_ID);
      expect(res.body.channel.title).toBe('Test Channel');

      // synced videos exist and are hidden
      const adminList = await request(app)
        .get('/api/media/admin/videos')
        .set('Authorization', `Bearer ${token}`);
      const synced = adminList.body.filter((v) => v.sourceChannelId === TEST_CHANNEL_ID);
      expect(synced.length).toBe(2);
      expect(synced.every((v) => v.isPublic === false)).toBe(true);

      // and they don't leak into the public feed
      const pub = await request(app).get('/api/media');
      expect(pub.body.some((m) => m.type === 'video')).toBe(false);
    });

    it('re-syncing the same channel adds no duplicates', async () => {
      const { token } = await createAdmin({ email: 'chadmin2@e.com' });
      const add = await request(app)
        .post('/api/channels')
        .set('Authorization', `Bearer ${token}`)
        .send({ url: `https://www.youtube.com/channel/${TEST_CHANNEL_ID}` });
      const channelId = add.body.channel._id;

      const resync = await request(app)
        .post(`/api/channels/${channelId}/sync`)
        .set('Authorization', `Bearer ${token}`);
      expect(resync.status).toBe(200);
      expect(resync.body.added).toBe(0);
    });

    it('rejects a non-admin adding a channel', async () => {
      const { token } = await createUser({ username: 'chu1', email: 'chu1@e.com' });
      const res = await request(app)
        .post('/api/channels')
        .set('Authorization', `Bearer ${token}`)
        .send({ url: `https://www.youtube.com/channel/${TEST_CHANNEL_ID}` });
      expect(res.status).toBe(403);
    });
  });
});
