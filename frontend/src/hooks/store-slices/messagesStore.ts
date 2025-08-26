import type { IMember } from '../../models/member.model.ts';
import type { IMessage } from '../../models/messages.model.ts';
import fetchAPI from '../../utils/index.ts';
import { toast } from 'sonner';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import type { StoreState } from '../useStore.ts';
import useStore from '../useStore.ts';

export interface MessagesStore {
  messages: IMessage[];
  users: IMember[];
  selectedUser: IMember | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  getUsers: () => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
  setSelectedUser: (userId: IMember | null) => void;
  getMessages: (userId: string | null) => Promise<void>;
  sendMessage: (messageData: IMessage | null) => void;
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
    } catch (error: any) {
      console.error('getUsers error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      set({ isUsersLoading: false });
    }
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user, messages: [] });
    if (user?._id) {
      get().getMessages(user._id);
      get().subscribeToMessages();
    } else {
      get().unsubscribeFromMessages();
    }
  },
  getMessages: async (userId) => {
    if (!userId) {
      return;
    }
    set({ isMessagesLoading: true });
    try {
      const token = localStorage.getItem('lh_token');
      if (!token) throw new Error('No token found');

      const response = await fetchAPI({
        url: `messages/${userId}`,
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ messages: response.data });
    } catch (error: any) {
      console.error(`getMessages error for ${userId}:`, error);
      toast.error(error.response?.data?.message || 'Failed to fetch messages');
      if (error.message === 'No token found') get().memberLogout();
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser?._id) {
      console.error('sendMessage: No selected user');
      toast.error('No user selected to send message');
      return;
    }

    try {
      const token = localStorage.getItem('lh_token');
      if (!token) throw new Error('No token found');

      const response = await fetchAPI({
        method: 'post',
        url: `messages/send/${selectedUser._id}`,
        data: messageData,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      set({ messages: [...messages, response.data] });
    } catch (error: any) {
      console.error('sendMessage error:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, loggedInMember } = get();
    if (!selectedUser || !loggedInMember) {
      return;
    }

    const socket = useStore.getState().socket;
    if (!socket) {
      return;
    }

    socket.off('newMessage');
    socket.on('newMessage', (newMessage: IMessage) => {
      if (
        (newMessage.senderId === selectedUser._id &&
          newMessage.recipientId === loggedInMember._id) ||
        (newMessage.senderId === loggedInMember._id &&
          newMessage.recipientId === selectedUser._id)
      ) {
        set({ messages: [...get().messages, newMessage] });
      } else {
        console.log(
          `Message ignored: Not part of conversation with ${selectedUser._id}`
        );
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useStore.getState().socket;
    if (socket) {
      socket.off('newMessage');
    }
  },
});
