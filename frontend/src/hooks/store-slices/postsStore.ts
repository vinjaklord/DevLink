import type { Post } from '@/models/posts.model';
import fetchAPI from '@/utils';
import { toast } from 'sonner';

export interface PostsStore {
  currentPost: Post | null;
  loading: boolean;
  error: string | null;
  allPosts: Post[];
  showAddPost: boolean;

  setShowAddPost: (value: boolean) => void;
  fetchPostById: (id: string) => Promise<void>;
  fetchAllPosts: () => Promise<void>;
  uploadPost: (data: Post) => Promise<boolean>;
}

const initialState = {
  currentPost: null,
  loading: false,
  error: null,
  allPosts: [],
};

const createPostsSlice = (set: any, get: any): PostsStore => ({
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
    }
  },

  fetchAllPosts: async () => {
    try {
      set({ loading: true });
      const response = await fetchAPI({ url: '/posts' });
      set({ allPosts: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  uploadPost: async (data: Post): Promise<boolean> => {
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
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
      return false;
    }
  },
});

export { createPostsSlice };
