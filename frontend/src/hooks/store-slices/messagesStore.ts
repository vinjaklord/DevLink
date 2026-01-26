import type { IMember } from '../../models/member.model.ts';
import type { IMessage } from '../../models/messages.model.ts';
import { fetchAPI } from '@/utils/index.ts';
import { toast } from 'sonner';
import type { StateCreator } from 'zustand';
import type { StoreState } from '../useStore.ts';

export interface MessagesStore {
  messages: IMessage[];
  users: IMember[];
  selectedUser: IMember | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  lastMessages: Record<string, IMessage | null>;

  updateLastMessages: (updates: Record<string, IMessage | null>) => void;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
  setSelectedUser: (userId: IMember | null) => void;
  getMessages: (userId: string | null) => Promise<void>;
  sendMessage: (messageData: IMessage | FormData | null) => void;
}

const initialState = {
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  lastMessages: {},
};

export const createMessageSlice: StateCreator<StoreState, [], [], MessagesStore> = (
  set,
  get,
): MessagesStore => ({
  ...initialState,

  updateLastMessages: (updates) => {
    set((state) => ({
      lastMessages: { ...state.lastMessages, ...updates },
    }));
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

      const lastMessage = response.data[response.data.length - 1];
      if (lastMessage) {
        set((state) => ({
          lastMessages: {
            ...state.lastMessages,
            [userId]: lastMessage,
          },
        }));
      }
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
      // Update open chat messages
      set({ messages: [...messages, response.data] });
      // update lastMessages for sender (real-time sidebar update)
      set((state) => ({
        lastMessages: {
          ...state.lastMessages,
          [selectedUser._id]: response.data,
        },
      }));
    } catch (error: any) {
      console.error('sendMessage error:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  },

  subscribeToMessages: () => {
    const { loggedInMember, socket } = get();
    if (!loggedInMember || !socket) {
      return;
    }

    socket.off('newMessage');

    socket.on('newMessage', (newMessage: IMessage) => {
      const { loggedInMember, messages, lastMessages, selectedUser } = get();

      // always update lastMessages for sidebar
      const friendId =
        newMessage.senderId === loggedInMember?._id ? newMessage.recipientId : newMessage.senderId;

      set({
        lastMessages: {
          ...lastMessages,
          [friendId]: newMessage,
        },
      });

      if (
        selectedUser &&
        ((newMessage.senderId === selectedUser._id &&
          newMessage.recipientId === loggedInMember?._id) ||
          (newMessage.senderId === loggedInMember?._id &&
            newMessage.recipientId === selectedUser._id))
      ) {
        set({ messages: [...messages, newMessage] });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const { socket } = get();
    if (socket) {
      socket.off('newMessage');
    }
  },
});
