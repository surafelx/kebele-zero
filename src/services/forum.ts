import api from './api';

export interface ForumPost {
  id: string; _id?: string;
  title: string; content: string; category: string;
  tags: string[]; commentCount: number;
  userId: any; createdAt: string; updatedAt: string;
}
export interface ForumComment {
  id: string; _id?: string;
  postId: string; content: string;
  userId: any; createdAt: string;
}

export const forumAPI = {
  getPosts: async (category?: string, page = 1, limit = 20) => {
    const params: any = { page, limit };
    if (category) params.category = category;
    const r = await api.get('/forum/posts', { params });
    return r.data; // { posts, total, page }
  },
  getPost: async (id: string) => {
    const r = await api.get(`/forum/posts/${id}`);
    return r.data;
  },
  getUserPosts: async (userId: string) => {
    const r = await api.get(`/forum/posts/user/${userId}`);
    return r.data;
  },
  createPost: async (data: { title: string; content: string; category?: string; tags?: string[] }) => {
    const r = await api.post('/forum/posts', data);
    return r.data;
  },
  updatePost: async (id: string, data: Partial<ForumPost>) => {
    const r = await api.put(`/forum/posts/${id}`, data);
    return r.data;
  },
  deletePost: async (id: string) => {
    await api.delete(`/forum/posts/${id}`);
  },
  getComments: async (postId: string) => {
    const r = await api.get(`/forum/posts/${postId}/comments`);
    return r.data;
  },
  createComment: async (postId: string, content: string) => {
    const r = await api.post(`/forum/posts/${postId}/comments`, { content });
    return r.data;
  },
  deleteComment: async (commentId: string) => {
    await api.delete(`/forum/comments/${commentId}`);
  },
  getCategories: async () => {
    const r = await api.get('/forum/categories');
    return r.data;
  },
  createCategory: async (data: { name: string; slug: string; description?: string }) => {
    const r = await api.post('/forum/categories', data);
    return r.data;
  },
};
