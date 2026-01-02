import { supabase } from './supabase';

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  is_pinned: boolean;
  is_locked: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ForumComment {
  id: string;
  post_id: string;
  content: string;
  parent_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const forumAPI = {
  // Posts
  getPosts: async (category?: string, limit = 20, offset = 0) => {
    let query = supabase
      .from('forum_posts')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  getPost: async (id: string) => {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  getUserPosts: async (userId: string, limit = 10) => {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  createPost: async (post: Omit<ForumPost, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('forum_posts')
      .insert([{ ...post, created_by: session.user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updatePost: async (id: string, updates: Partial<ForumPost>) => {
    const { data, error } = await supabase
      .from('forum_posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deletePost: async (id: string) => {
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Comments
  getComments: async (postId: string) => {
    const { data, error } = await supabase
      .from('forum_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  createComment: async (comment: Omit<ForumComment, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('forum_comments')
      .insert([{ ...comment, created_by: session.user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateComment: async (id: string, content: string) => {
    const { data, error } = await supabase
      .from('forum_comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteComment: async (id: string) => {
    const { error } = await supabase
      .from('forum_comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Categories
  getCategories: async () => {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('category')
      .order('category');

    if (error) throw error;

    // Get unique categories
    const categories = [...new Set(data.map(item => item.category))];
    return categories;
  },

  // Notifications/Activity - Optimized for speed
  getUserNotifications: async (userId: string) => {
    try {
      // Get recent comments on user's posts (simplified)
      const { data: postComments, error: commentsError } = await supabase
        .from('forum_comments')
        .select(`
          id,
          content,
          created_at,
          created_by,
          forum_posts!inner(title)
        `)
        .eq('forum_posts.created_by', userId)
        .neq('created_by', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (commentsError) console.warn('Error fetching post comments:', commentsError);

      // Get recent replies to user's comments (simplified)
      const { data: commentReplies, error: repliesError } = await supabase
        .from('forum_comments')
        .select(`
          id,
          content,
          created_at,
          created_by,
          forum_posts!inner(title),
          parent_comment:forum_comments!parent_id(created_by)
        `)
        .eq('parent_comment.created_by', userId)
        .neq('created_by', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (repliesError) console.warn('Error fetching comment replies:', repliesError);

      // For now, skip likes as they require complex joins - can add back later if needed
      return {
        likes: [], // Temporarily disabled for performance
        comments: postComments || [],
        replies: commentReplies || []
      };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return { likes: [], comments: [], replies: [] };
    }
  }
};