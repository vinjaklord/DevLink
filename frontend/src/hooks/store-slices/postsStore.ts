import type { IPost } from '@/models/posts.model';
import fetchAPI from '@/utils';
import { toast } from 'sonner';
import type { StateCreator } from 'zustand';
import type { StoreState } from '../useStore';

export interface PostsStore {
  currentPost: IPost | null;
  loading: boolean;
  error: string | null;
  allPosts: IPost[];
  myPosts: IPost[];
  friendsPosts: IPost[];
  memberPosts: IPost[];
  showAddPost: boolean;
  showSharePost: boolean;
  sharePostId: string | null;

  setShowAddPost: (value: boolean) => void;
  setShowSharePost: (value: boolean) => void;
  setSharePostId: (postId: string | null) => void;
  fetchPostById: (id: string) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  fetchMyPosts: () => Promise<void>;
  fetchMemberPosts: (username: string) => Promise<void>;
  fetchAllPosts: () => Promise<void>;
  fetchFriendsPosts: () => Promise<void>;
  clearCurrentPost: () => Promise<void>;
  uploadPost: (data: IPost) => Promise<boolean>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (postId: string, data: { text: string }) => Promise<void>;
  sharePost: (memberIds: string[], postId: string) => Promise<void>;
}

const initialState = {
  currentPost: null,
  loading: false,
  error: null,
  allPosts: [],
  myPosts: [],
  friendsPosts: [],
  memberPosts: [],
};

const createPostsSlice: StateCreator<StoreState, [], [], PostsStore> = (set, get): PostsStore => ({
  showAddPost: false,
  showSharePost: false,
  sharePostId: null,
  setShowAddPost: (value) => set({ showAddPost: value }),
  clearCurrentPost: async () => set({ currentPost: null }),
  setShowSharePost: (value) => set({ showSharePost: value }),
  setSharePostId: (postId) => set({ sharePostId: postId }),

  ...initialState,

  fetchPostById: async (id: string) => {
    try {
      set({ loading: true });
      const response = await fetchAPI({ url: `/posts/${id}` });
      set({ currentPost: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      toast.error(error.response?.data?.message || 'Failed to fetch post');
    }
  },

  fetchMyPosts: async () => {
    try {
      set({ loading: true });
      const token = localStorage.getItem('lh_token');
      if (!token) throw new Error('User not authenticated');

      const response = await fetchAPI({
        url: '/posts/myPosts',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ myPosts: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      toast.error(error.response?.data?.message || 'Failed to fetch posts');
    }
  },

  fetchMemberPosts: async (username: string) => {
    try {
      set({ loading: true });

      const response = await fetchAPI({
        url: `/posts/memberPosts/${username}`,
      });

      set({ memberPosts: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      toast.error(error.response?.data?.message || 'Failed to fetch posts');
    }
  },

  fetchAllPosts: async () => {
    try {
      set({ loading: true });

      const response = await fetchAPI({ url: '/posts' });
      set({ allPosts: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      toast.error(error.response?.data?.message || 'Failed to fetch posts');
    }
  },

  fetchFriendsPosts: async () => {
    try {
      set({ loading: true });
      const token = localStorage.getItem('lh_token');
      if (!token) throw new Error('User not authenticated');

      const response = await fetchAPI({
        url: '/friends/friendsPosts',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      set({ friendsPosts: response.data, loading: false });
    } catch (error: any | unknown) {
      set({ error: error.message, loading: false });
      toast.error(error.response?.data?.message || 'Failed to fetch posts');
    }
  },

  deletePost: async (id) => {
    try {
      const token = localStorage.getItem('lh_token');
      await fetchAPI({
        method: 'delete',
        url: `posts/delete/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(`Post deleted!`);
    } catch (error) {
      console.error(error);
    }
  },

  uploadPost: async (data: IPost): Promise<boolean> => {
    try {
      const token = localStorage.getItem('lh_token');
      const response = await fetchAPI({
        method: 'post',
        url: 'posts/post',
        data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const newPost = response.data;

      set((state) => ({
        allPosts: [...state.allPosts, newPost],
      }));

      toast.success('Post added successfully!');
      return true;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
      return false;
    }
  },

  toggleLike: async (postId: string) => {
    try {
      const token = localStorage.getItem('lh_token');
      const state = get();
      const userId = state.loggedInMember?._id || '';

      // Optimistic toggle
      set((state) => {
        const toggleLikes = (post: IPost) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes?.includes(userId)
                  ? post.likes.filter((id) => id !== userId)
                  : [...(post.likes || []), userId],
              }
            : post;

        return {
          friendsPosts: state.friendsPosts.map(toggleLikes),
          currentPost: state.currentPost ? toggleLikes(state.currentPost) : state.currentPost,
        };
      });

      // Sync with backend
      const response = await fetchAPI({
        method: 'put',
        url: `/posts/${postId}/likes`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update with backend likes array
      set((state) => ({
        friendsPosts: state.friendsPosts.map((post) =>
          post._id === postId ? { ...post, likes: response.data.likes } : post
        ),
        currentPost:
          state.currentPost?._id === postId
            ? { ...state.currentPost, likes: response.data.likes }
            : state.currentPost,
      }));

      toast.success(response.data.liked ? 'Post liked!' : 'Post unliked!');
    } catch (error: any) {
      console.error('Like error:', error);
      toast.error(error.response?.data?.message || 'Failed to toggle like');
      // Revert optimistic update on error
      set((state) => {
        const revertLikes = (post: IPost) =>
          post._id === postId
            ? {
                ...post,
                likes: state.friendsPosts.find((p) => p._id === postId)?.likes || [],
              }
            : post;

        return {
          friendsPosts: state.friendsPosts.map(revertLikes),
          currentPost: state.currentPost ? revertLikes(state.currentPost) : state.currentPost,
        };
      });
    }
  },

  addComment: async (postId: string, data: { text: string }) => {
    try {
      const token = localStorage.getItem('lh_token');
      const response = await fetchAPI({
        method: 'post',
        url: `/posts/${postId}/comments`,
        data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set((state) => ({
        friendsPosts: state.friendsPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: [...post.comments, response.data.comment] }
            : post
        ),
        currentPost:
          state.currentPost?._id === postId
            ? {
                ...state.currentPost,
                comments: [...state.currentPost.comments, response.data.comment],
              }
            : state.currentPost,
      }));

      toast.success('Comment added!');
    } catch (error: any) {
      console.error('Comment error:', error);
      toast.error(error.response?.data?.message || 'Failed to add comment');
    }
  },
  sharePost: async (memberIds: string[], postId: string | null) => {
    const { messages } = get();
    try {
      const token = localStorage.getItem('lh_token');
      const FRONTEND_URL = `http://localhost:5173`;

      const link = `${FRONTEND_URL}/posts/${postId}`;

      const payload = { recipients: memberIds, text: link };

      const response = await fetchAPI({
        method: 'post',
        url: `/posts/share`,
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      set({ messages: [...messages, response.data] });
    } catch (error) {
      console.error(error);
    }
  },
});

export { createPostsSlice };
