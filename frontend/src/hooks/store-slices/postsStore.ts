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
  memberPosts: IPost[];
  showAddPost: boolean;

  setShowAddPost: (value: boolean) => void;
  fetchPostById: (id: string) => Promise<void>;
  fetchMyPosts: () => Promise<void>;
  fetchMemberPosts: (username: string) => Promise<void>;
  fetchAllPosts: () => Promise<void>;
  uploadPost: (data: IPost) => Promise<boolean>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (postId: string, data: { text: string }) => Promise<void>;
}

const initialState = {
  currentPost: null,
  loading: false,
  error: null,
  allPosts: [],
  myPosts: [],
  memberPosts: [],
};

const createPostsSlice: StateCreator<StoreState, [], [], PostsStore> = (
  set,
  get
): PostsStore => ({
  showAddPost: false,
  setShowAddPost: (value) => set({ showAddPost: value }),
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
        const toggleLikes = (post) =>
          post._id === posId
            ? {
                ...post,
                likes: post.likes?.includes(userId)
                  ? post.likes.filter((id) => id !== userId)
                  : [...(post.likes || []), userId],
              }
            : post;

        return {
          allPosts: state.allPosts.map(toggleLikes),
          currentPost: state.currentPost
            ? toggleLikes(state.currentPost)
            : state.currentPost,
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
        allPosts: state.allPosts.map((post) =>
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
        const revertLikes = (post) =>
          post._id === postId
            ? {
                ...post,
                likes:
                  state.allPosts.find((p) => p._id === postId)?.likes || [],
              }
            : post;

        return {
          allPosts: state.allPosts.map(revertLikes),
          currentPost: state.currentPost
            ? revertLikes(state.currentPost)
            : state.currentPost,
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
        allPosts: state.allPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: [...post.comments, response.data.comment] }
            : post
        ),
        currentPost:
          state.currentPost?._id === postId
            ? {
                ...state.currentPost,
                comments: [
                  ...state.currentPost.comments,
                  response.data.comment,
                ],
              }
            : state.currentPost,
      }));

      toast.success('Comment added!');
    } catch (error: any) {
      console.error('Comment error:', error);
      toast.error(error.response?.data?.message || 'Failed to add comment');
    }
  },
});

export { createPostsSlice };
