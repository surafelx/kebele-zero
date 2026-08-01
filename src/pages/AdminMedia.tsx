import React, { useState, useEffect } from 'react';
import {
  Youtube, Plus, Trash2, Search, Play, Eye, EyeOff, Edit3, Folder,
  RefreshCw, Link2, Rss,
} from 'lucide-react';
import { videosAPI, channelsAPI } from '../services/content';
import Modal from '../components/Modal';

// A synced/added video can arrive with either camelCase (fresh from the API)
// or snake_case (aliased by the axios interceptor) — read both shapes safely.
const vidId = (v: any) => v?.youtubeId || v?.youtube_id || '';
const isShown = (v: any) => (v?.isPublic ?? v?.is_public) !== false;
const recId = (v: any) => v?._id || v?.id;

const AdminMedia = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const emptyForm = { title: '', description: '', link: '', category: 'cultural' };
  const [videoFormData, setVideoFormData] = useState(emptyForm);

  // Channel sync UI state
  const [channelUrl, setChannelUrl] = useState('');
  const [addingChannel, setAddingChannel] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [vids, chans] = await Promise.all([
        videosAPI.getAdminVideos().catch(() => []),
        channelsAPI.getChannels().catch(() => []),
      ]);
      setVideos(vids || []);
      setChannels(chans || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos([]);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  const closeForm = () => {
    setShowVideoForm(false);
    setEditingVideo(null);
    setVideoFormData(emptyForm);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVideo) {
        await videosAPI.updateVideo(recId(editingVideo), {
          title: videoFormData.title,
          description: videoFormData.description,
          category: videoFormData.category,
          link: videoFormData.link,
        });
      } else {
        await videosAPI.addVideo(videoFormData);
      }
      closeForm();
      fetchAll();
    } catch (error: any) {
      console.error('Error saving video:', error);
      alert(error?.response?.data?.message || 'Error saving video');
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await videosAPI.deleteVideo(id);
      setVideos(videos.filter((video) => recId(video) !== id));
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Error deleting video');
    }
  };

  const handleToggleVisibility = async (video: any) => {
    const id = recId(video);
    const next = !isShown(video);
    // Optimistic update
    setVideos((prev) => prev.map((v) => (recId(v) === id ? { ...v, isPublic: next, is_public: next } : v)));
    try {
      await videosAPI.setVisibility(id, next);
    } catch (error) {
      console.error('Error updating visibility:', error);
      alert('Error updating visibility');
      fetchAll(); // revert to server truth
    }
  };

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelUrl.trim()) return;
    setAddingChannel(true);
    try {
      const res = await channelsAPI.addChannel(channelUrl.trim());
      setChannelUrl('');
      await fetchAll();
      alert(`Channel added — synced ${res?.added ?? 0} video(s). They're hidden until you choose to show them.`);
    } catch (error: any) {
      console.error('Error adding channel:', error);
      alert(error?.response?.data?.message || 'Error adding channel');
    } finally {
      setAddingChannel(false);
    }
  };

  const handleSyncChannel = async (id: string) => {
    setSyncingId(id);
    try {
      const res = await channelsAPI.syncChannel(id);
      await fetchAll();
      alert(`Synced ${res?.added ?? 0} new video(s).`);
    } catch (error: any) {
      console.error('Error syncing channel:', error);
      alert(error?.response?.data?.message || 'Error syncing channel');
    } finally {
      setSyncingId(null);
    }
  };

  const handleDeleteChannel = async (id: string) => {
    if (!confirm('Remove this channel? Videos already synced will be kept.')) return;
    try {
      await channelsAPI.deleteChannel(id);
      setChannels(channels.filter((c) => recId(c) !== id));
    } catch (error) {
      console.error('Error deleting channel:', error);
      alert('Error deleting channel');
    }
  };

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      !searchTerm ||
      video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || video.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const paginatedVideos = filteredVideos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory]);

  const categories = ['music', 'interview', 'documentary', 'performance', 'educational', 'cultural', 'other'];
  const getYouTubeThumbnail = (id: string) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`;

  const shownCount = videos.filter(isShown).length;
  const hiddenCount = videos.length - shownCount;

  const channelName = (channelId: string) =>
    channels.find((c) => c.channelId === channelId || c.channel_id === channelId)?.title || 'Channel';

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-2 border-black shadow-lg">
              <Youtube className="w-7 h-7 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Video Management</h1>
              <p className="text-sm text-blue-100 font-bold uppercase">Add videos by link &amp; sync from channels</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingVideo(null); setVideoFormData(emptyForm); setShowVideoForm(true); }}
            className="retro-btn px-4 py-2 bg-white text-black"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Video
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Play, value: videos.length, label: 'Total Videos' },
          { icon: Eye, value: shownCount, label: 'Shown' },
          { icon: EyeOff, value: hiddenCount, label: 'Hidden' },
          { icon: Rss, value: channels.length, label: 'Channels' },
        ].map((s) => (
          <div key={s.label} className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-5 text-center">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
                <s.icon className="w-6 h-6 text-black" />
              </div>
              <p className="text-3xl font-black text-gray-900 retro-title">{s.value}</p>
              <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Channel Sync Panel */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center space-x-3 px-6 py-3 border-b-4 border-black bg-gradient-to-r from-red-500 to-rose-600">
          <Rss className="w-5 h-5 text-white" />
          <h2 className="text-lg font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Sync from YouTube Channels</h2>
        </div>
        <div className="p-4 space-y-4">
          <form onSubmit={handleAddChannel} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Paste a channel link (e.g. youtube.com/@channel or /channel/UC…)"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                className="retro-input pl-10 w-full"
              />
            </div>
            <button type="submit" disabled={addingChannel} className="retro-btn bg-red-500 border-red-600 px-5 disabled:opacity-50">
              {addingChannel ? 'Adding…' : 'Add & Sync'}
            </button>
          </form>

          {channels.length === 0 ? (
            <p className="retro-text text-sm text-gray-500">No channels yet. Add one above to pull in its latest videos automatically.</p>
          ) : (
            <div className="space-y-2">
              {channels.map((c) => {
                const id = recId(c);
                const cid = c.channelId || c.channel_id;
                const count = videos.filter((v) => (v.sourceChannelId || v.source_channel_id) === cid).length;
                const last = c.lastSyncedAt || c.last_synced_at;
                return (
                  <div key={id} className="flex items-center justify-between gap-3 border-2 border-black p-3 bg-gray-50">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 truncate">{c.title || 'Channel'}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {count} video(s) · {last ? `synced ${new Date(last).toLocaleDateString()}` : 'not synced yet'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleSyncChannel(id)}
                        disabled={syncingId === id}
                        className="p-2 bg-white border-2 border-black hover:bg-blue-100 transition-colors disabled:opacity-50"
                        title="Sync now"
                      >
                        <RefreshCw className={`w-4 h-4 ${syncingId === id ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleDeleteChannel(id)}
                        className="p-2 bg-white border-2 border-black hover:bg-red-100 transition-colors"
                        title="Remove channel"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="retro-input pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="retro-input"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
          <Youtube className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="retro-title text-xl">No videos found</p>
          <p className="retro-text text-sm mt-1">Add a video by link, or sync a channel above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedVideos.map((video) => {
            const id = recId(video);
            const shown = isShown(video);
            const src = video.sourceChannelId || video.source_channel_id;
            return (
              <div key={id} className={`bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow ${shown ? '' : 'opacity-70'}`}>
                {/* Video Thumbnail */}
                <div className="relative h-48 bg-gray-900">
                  <img
                    src={vidId(video) ? getYouTubeThumbnail(vidId(video)) : ''}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center">
                      <Play className="w-8 h-8 text-gray-800 ml-1" />
                    </div>
                  </div>
                  {/* Shown / Hidden badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center px-2.5 py-1 border-2 border-black text-xs font-bold uppercase ${shown ? 'bg-green-200' : 'bg-gray-300'}`}>
                      {shown ? 'Shown' : 'Hidden'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingVideo(video);
                        setVideoFormData({
                          title: video.title || '',
                          description: video.description || '',
                          link: video.url || (vidId(video) ? `https://www.youtube.com/watch?v=${vidId(video)}` : ''),
                          category: video.category || 'cultural',
                        });
                        setShowVideoForm(true);
                      }}
                      className="p-2 bg-white border-2 border-black hover:bg-yellow-100 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(id)}
                      className="p-2 bg-white border-2 border-black hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-800 text-lg flex-1 pr-4 uppercase tracking-wide line-clamp-2">{video.title}</h3>
                    <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 border-2 border-black text-xs font-bold uppercase shrink-0">
                      {video.category || 'Other'}
                    </span>
                  </div>

                  <p className="retro-text text-sm mb-4 line-clamp-2">{video.description}</p>

                  <div className="flex items-center justify-between text-xs retro-text mb-4">
                    <span className="truncate">{src ? `📡 ${channelName(src)}` : '✋ Added manually'}</span>
                    <span>{video.publishedAt || video.published_at ? new Date(video.publishedAt || video.published_at).toLocaleDateString() : ''}</span>
                  </div>

                  {/* Show / Hide toggle */}
                  <button
                    onClick={() => handleToggleVisibility(video)}
                    className={`w-full retro-btn flex items-center justify-center gap-2 ${shown ? 'bg-gray-200' : 'bg-green-400 border-green-600'}`}
                  >
                    {shown ? <><EyeOff className="w-4 h-4" /> Hide from site</> : <><Eye className="w-4 h-4" /> Show on site</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="retro-btn px-4 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="retro-text text-sm font-bold px-2">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="retro-btn px-4 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Add / Edit Video Modal */}
      <Modal
        isOpen={showVideoForm}
        onClose={closeForm}
        title={editingVideo ? 'Edit Video' : 'Add Video by Link'}
        size="md"
        icon={<Youtube className="w-5 h-5 text-blue-500" />}
        titleColor="from-blue-500 to-indigo-500"
      >
        <form onSubmit={handleSaveVideo} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">YouTube Link</label>
            <input
              type="text"
              required
              value={videoFormData.link}
              onChange={(e) => setVideoFormData({ ...videoFormData, link: e.target.value })}
              className="retro-input"
              placeholder="https://www.youtube.com/watch?v=…"
            />
            <p className="text-xs text-gray-500">Paste any YouTube video link — we'll pull the video from it automatically.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Title</label>
              <input
                type="text"
                value={videoFormData.title}
                onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                className="retro-input"
                placeholder="Optional — a name for this video"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Category</label>
              <select
                value={videoFormData.category}
                onChange={(e) => setVideoFormData({ ...videoFormData, category: e.target.value })}
                className="retro-input"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Description</label>
            <textarea
              rows={3}
              value={videoFormData.description}
              onChange={(e) => setVideoFormData({ ...videoFormData, description: e.target.value })}
              className="retro-input resize-none"
              placeholder="Optional description"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="submit" className="flex-1 retro-btn bg-blue-500 border-blue-600">
              {editingVideo ? 'Save Changes' : 'Add Video'}
            </button>
            <button type="button" onClick={closeForm} className="px-5 py-3 retro-btn">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminMedia;
