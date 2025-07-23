import type { IMember } from '../../models/member.model.ts';
import type { IMessage } from '../../models/messages.model.ts';
import fetchAPI from '../../utils/index.ts';
import { toast } from 'sonner';
import type { StateCreator } from 'zustand';
import type { StoreState } from '../useStore.ts';

export interface MessagesStore {
  messages: IMessage[];
  users: IMember[];
  selectedUser: string | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  getUsers: () => Promise<void>;
  setSelectedUser: (userId: string | null) => void;
  getMessages: (userId: string | null) => void;
}

const initialState = {
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
};

export const createMessageSlice: StateCreator<
  StoreState,
  [],
  [],
  MessagesStore
> = (set, get): MessagesStore => ({
  ...initialState,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const token = localStorage.getItem('lh_token');
      if (!token) throw new Error('No token found');

      const response = await fetchAPI({
        url: 'messages/users',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      set({ users: response.data });
      set({ isUsersLoading: false });
    } catch (error) {
      toast.error(error.response.data.message, error);
    }
  },
  setSelectedUser: (userId) => set({ selectedUser: userId }),

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await fetchAPI({ url: `messages/${userId}` });
      set({ messages: response.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
});
