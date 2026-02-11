import { supabase } from './supabase';

// ===================== ABOUT & TEAM =====================

export const aboutAPI = {
  // Get all active about content sections
  getAboutContent: async () => {
    const { data, error } = await supabase
      .from('about_content')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get single about section
  getAboutSection: async (section: string) => {
    const { data, error } = await supabase
      .from('about_content')
      .select('*')
      .eq('section', section)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Create about section
  createAboutSection: async (sectionData: any) => {
    const { data, error } = await supabase
      .from('about_content')
      .insert([sectionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update about section
  updateAboutSection: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('about_content')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete about section
  deleteAboutSection: async (id: string) => {
    const { error } = await supabase
      .from('about_content')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Team Members
  getTeamMembers: async () => {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  createTeamMember: async (memberData: any) => {
    const { data, error } = await supabase
      .from('team_members')
      .insert([memberData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateTeamMember: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('team_members')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deleteTeamMember: async (id: string) => {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ===================== EVENTS =====================

export const eventsAPI = {
  // Get all active events
  getEvents: async (filters?: { category?: string; status?: string }) => {
    let query = supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('start_date', { ascending: true });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.status === 'upcoming') {
      query = query.gte('start_date', new Date().toISOString());
    } else if (filters?.status === 'past') {
      query = query.lt('start_date', new Date().toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get featured events
  getFeaturedEvents: async (limit = 5) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('start_date', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Get single event
  getEvent: async (id: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create event
  createEvent: async (eventData: any) => {
    const { data, error } = await supabase
      .from('events')
      .insert([{ ...eventData, created_at: new Date().toISOString() }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update event
  updateEvent: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('events')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete event
  deleteEvent: async (id: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get event categories
  getCategories: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('category')
      .eq('is_active', true);
    
    if (error) throw error;
    return [...new Set(data.map(item => item.category))];
  }
};

// ===================== PRODUCTS (SOUQ) =====================

export const productsAPI = {
  // Get all active products
  getProducts: async (filters?: { category?: string; search?: string }) => {
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get featured products
  getFeaturedProducts: async (limit = 10) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Get single product
  getProduct: async (id: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create product
  createProduct: async (productData: any) => {
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...productData, created_at: new Date().toISOString() }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update product
  updateProduct: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete product
  deleteProduct: async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get product categories
  getCategories: async () => {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true);
    
    if (error) throw error;
    return [...new Set(data.map(item => item.category))];
  }
};

// ===================== RADIO & VIDEOS =====================

export const mediaAPI = {
  // Get all active media items
  getMediaItems: async (filters?: { category?: string; search?: string }) => {
    let query = supabase
      .from('media')
      .select('*')
      .eq('is_active', true)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get featured media
  getFeaturedMedia: async (limit = 5) => {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Get single media item
  getMediaItem: async (id: string) => {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create media item
  createMediaItem: async (mediaData: any) => {
    const { data, error } = await supabase
      .from('media')
      .insert([{ ...mediaData, created_at: new Date().toISOString() }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update media item
  updateMediaItem: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('media')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete media item
  deleteMediaItem: async (id: string) => {
    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get media categories
  getCategories: async () => {
    const { data, error } = await supabase
      .from('media')
      .select('category')
      .eq('is_active', true);
    
    if (error) throw error;
    return [...new Set(data.map(item => item.category))];
  }
};

export const videosAPI = {
  // Get all active videos
  getVideos: async (filters?: { category?: string }) => {
    let query = supabase
      .from('videos')
      .select('*')
      .eq('is_active', true)
      .order('published_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get featured videos
  getFeaturedVideos: async (limit = 4) => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Get single video
  getVideo: async (id: string) => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create video
  createVideo: async (videoData: any) => {
    const { data, error } = await supabase
      .from('videos')
      .insert([{ ...videoData, created_at: new Date().toISOString() }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update video
  updateVideo: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('videos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete video
  deleteVideo: async (id: string) => {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get video categories
  getCategories: async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('category')
      .eq('is_active', true);
    
    if (error) throw error;
    return [...new Set(data.map(item => item.category))];
  }
};

export const radioAPI = {
  // Get all active radio tracks
  getRadioTracks: async (filters?: { category?: string }) => {
    let query = supabase
      .from('radio')
      .select('*')
      .eq('is_active', true)
      .order('published_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get featured tracks
  getFeaturedTracks: async (limit = 5) => {
    const { data, error } = await supabase
      .from('radio')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Get single track
  getTrack: async (id: string) => {
    const { data, error } = await supabase
      .from('radio')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create track
  createTrack: async (trackData: any) => {
    const { data, error } = await supabase
      .from('radio')
      .insert([{ ...trackData, created_at: new Date().toISOString() }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update track
  updateTrack: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('radio')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete track
  deleteTrack: async (id: string) => {
    const { error } = await supabase
      .from('radio')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get radio categories
  getCategories: async () => {
    const { data, error } = await supabase
      .from('radio')
      .select('category')
      .eq('is_active', true);
    
    if (error) throw error;
    return [...new Set(data.map(item => item.category))];
  }
};

// ===================== TRANSACTIONS =====================

export const transactionsAPI = {
  // Get user transactions
  getUserTransactions: async (userId: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get all transactions (admin)
  getAllTransactions: async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create transaction
  createTransaction: async (transactionData: any) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transactionData, created_at: new Date().toISOString() }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update transaction status
  updateTransactionStatus: async (id: string, status: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ===================== SOCIAL LINKS =====================

export const socialLinksAPI = {
  // Get all active social links
  getSocialLinks: async () => {
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get single social link
  getSocialLink: async (id: string) => {
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create social link
  createSocialLink: async (linkData: any) => {
    const { data, error } = await supabase
      .from('social_links')
      .insert([{ ...linkData, created_at: new Date().toISOString() }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update social link
  updateSocialLink: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('social_links')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete social link
  deleteSocialLink: async (id: string) => {
    const { error } = await supabase
      .from('social_links')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Toggle active status
  toggleSocialLink: async (id: string, isActive: boolean) => {
    const { data, error } = await supabase
      .from('social_links')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
