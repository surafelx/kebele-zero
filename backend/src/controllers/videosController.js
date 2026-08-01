const Media = require('../models/Media');
const Channel = require('../models/Channel');

// ── YouTube helpers (no API key — uses public pages + RSS feed) ─────────────

// Extract an 11-char YouTube video ID from a full link or a bare ID.
// Supports watch?v=, youtu.be/, /embed/, /shorts/, /live/ forms.
function parseYouTubeId(input) {
  if (!input || typeof input !== 'string') return null;
  const s = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s; // already a bare ID
  const m = s.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/|\/v\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

const CHANNEL_ID_RE = /(UC[A-Za-z0-9_-]{22})/;

// Turn a channel URL (handle, /channel/…, /c/…, /user/…) into a channel ID.
// For /channel/UC… it's read straight from the URL; otherwise we fetch the
// page HTML and pull the channel ID out of the embedded metadata.
async function resolveChannelId(url) {
  if (!url || typeof url !== 'string') return null;
  const direct = url.match(/\/channel\/(UC[A-Za-z0-9_-]{22})/);
  if (direct) return direct[1];

  // A bare channel ID pasted on its own.
  const bare = url.trim().match(/^(UC[A-Za-z0-9_-]{22})$/);
  if (bare) return bare[1];

  // Normalise handles like "@name" or "name" into a full URL to fetch.
  let fetchUrl = url.trim();
  if (fetchUrl.startsWith('@')) fetchUrl = `https://www.youtube.com/${fetchUrl}`;
  else if (!/^https?:\/\//i.test(fetchUrl)) fetchUrl = `https://www.youtube.com/@${fetchUrl.replace(/^\/+/, '')}`;

  try {
    const res = await fetch(fetchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KebeleZeroBot/1.0)' },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const byExternal = html.match(/"externalId":"(UC[A-Za-z0-9_-]{22})"/);
    if (byExternal) return byExternal[1];
    const byCanonical = html.match(/\/channel\/(UC[A-Za-z0-9_-]{22})/);
    if (byCanonical) return byCanonical[1];
    const anyMatch = html.match(CHANNEL_ID_RE);
    return anyMatch ? anyMatch[1] : null;
  } catch (_e) {
    return null;
  }
}

function firstMatch(str, re) {
  const m = str.match(re);
  return m ? m[1] : '';
}

// Fetch a channel's RSS feed and parse the channel title + recent videos.
async function fetchChannelFeed(channelId) {
  const res = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KebeleZeroBot/1.0)' } }
  );
  if (!res.ok) {
    const err = new Error('Could not read the channel feed — check the link is a valid YouTube channel.');
    err.status = 400;
    throw err;
  }
  const xml = await res.text();

  // Channel title is the first <title> before the first <entry>.
  const headXml = xml.split('<entry>')[0];
  const channelTitle = decodeXml(firstMatch(headXml, /<title>([\s\S]*?)<\/title>/));

  const videos = [];
  const entries = xml.split('<entry>').slice(1);
  for (const entry of entries) {
    const youtubeId = firstMatch(entry, /<yt:videoId>([^<]+)<\/yt:videoId>/);
    if (!youtubeId) continue;
    videos.push({
      youtubeId,
      title: decodeXml(firstMatch(entry, /<title>([\s\S]*?)<\/title>/)) || 'Untitled video',
      description: decodeXml(firstMatch(entry, /<media:description>([\s\S]*?)<\/media:description>/)),
      publishedAt: firstMatch(entry, /<published>([^<]+)<\/published>/) || null,
    });
  }
  return { channelTitle, videos };
}

function decodeXml(s) {
  return (s || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

const watchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;

// ── Video endpoints (admin) ─────────────────────────────────────────────────

// GET /api/media/admin/videos — every video, including hidden ones.
async function listAdminVideos(req, res, next) {
  try {
    const videos = await Media.find({ type: 'video' })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();
    res.json(videos);
  } catch (err) { next(err); }
}

// POST /api/media/admin/videos — add one video from a link (or bare ID).
async function createVideoFromLink(req, res, next) {
  try {
    const { link, title, description, category } = req.body;
    const youtubeId = parseYouTubeId(link);
    if (!youtubeId) {
      return res.status(422).json({ message: 'Enter a valid YouTube video link or ID.' });
    }
    const existing = await Media.findOne({ type: 'video', youtubeId });
    if (existing) {
      return res.status(409).json({ message: 'That video has already been added.' });
    }
    const video = await Media.create({
      userId: req.user._id,
      title: (title && title.trim()) || 'Untitled video',
      description: description || '',
      type: 'video',
      url: watchUrl(youtubeId),
      youtubeId,
      category: category || 'other',
      isPublic: true, // manually added videos are shown by default
      publishedAt: new Date(),
    });
    res.status(201).json(video);
  } catch (err) { next(err); }
}

// PUT /api/media/admin/videos/:id — edit fields and/or toggle visibility.
async function updateVideo(req, res, next) {
  try {
    const video = await Media.findOne({ _id: req.params.id, type: 'video' });
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const { title, description, category, isPublic, link } = req.body;
    if (title !== undefined) video.title = title;
    if (description !== undefined) video.description = description;
    if (category !== undefined) video.category = category;
    if (isPublic !== undefined) video.isPublic = !!isPublic;
    if (link !== undefined) {
      const youtubeId = parseYouTubeId(link);
      if (!youtubeId) return res.status(422).json({ message: 'Enter a valid YouTube video link or ID.' });
      video.youtubeId = youtubeId;
      video.url = watchUrl(youtubeId);
    }
    await video.save();
    res.json(video);
  } catch (err) { next(err); }
}

// ── Channel endpoints (admin) ───────────────────────────────────────────────

// Pull the channel's recent uploads into Media. Synced videos arrive hidden
// (isPublic: false) so the admin can choose which ones to show. Returns the
// number of new videos added (duplicates are skipped).
async function syncChannelVideos(userId, channel) {
  const { channelTitle, videos } = await fetchChannelFeed(channel.channelId);
  if (channelTitle && channelTitle !== channel.title) {
    channel.title = channelTitle;
  }

  let added = 0;
  for (const v of videos) {
    const exists = await Media.findOne({ type: 'video', youtubeId: v.youtubeId });
    if (exists) continue;
    await Media.create({
      userId,
      title: v.title,
      description: v.description || '',
      type: 'video',
      url: watchUrl(v.youtubeId),
      youtubeId: v.youtubeId,
      category: 'other',
      isPublic: false, // hidden until the admin chooses to show it
      publishedAt: v.publishedAt ? new Date(v.publishedAt) : null,
      sourceChannelId: channel.channelId,
    });
    added += 1;
  }
  channel.lastSyncedAt = new Date();
  await channel.save();
  return added;
}

// GET /api/channels
async function listChannels(req, res, next) {
  try {
    const channels = await Channel.find().sort({ createdAt: -1 }).lean();
    res.json(channels);
  } catch (err) { next(err); }
}

// POST /api/channels — register a channel by link and do an initial sync.
async function addChannel(req, res, next) {
  try {
    const { url } = req.body;
    const channelId = await resolveChannelId(url);
    if (!channelId) {
      return res.status(422).json({ message: "Couldn't find a YouTube channel at that link." });
    }
    let channel = await Channel.findOne({ channelId });
    if (channel) {
      return res.status(409).json({ message: 'That channel is already added.' });
    }
    channel = await Channel.create({ userId: req.user._id, channelId, url });
    const added = await syncChannelVideos(req.user._id, channel);
    res.status(201).json({ channel, added });
  } catch (err) { next(err); }
}

// POST /api/channels/:id/sync — re-pull recent videos for one channel.
async function syncChannel(req, res, next) {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    const added = await syncChannelVideos(req.user._id, channel);
    res.json({ channel, added });
  } catch (err) { next(err); }
}

// DELETE /api/channels/:id — remove the channel (keeps videos already synced).
async function deleteChannel(req, res, next) {
  try {
    const channel = await Channel.findByIdAndDelete(req.params.id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    res.json({ message: 'Channel removed' });
  } catch (err) { next(err); }
}

module.exports = {
  // helpers (exported for testing)
  parseYouTubeId,
  resolveChannelId,
  fetchChannelFeed,
  // video endpoints
  listAdminVideos,
  createVideoFromLink,
  updateVideo,
  // channel endpoints
  listChannels,
  addChannel,
  syncChannel,
  deleteChannel,
};
