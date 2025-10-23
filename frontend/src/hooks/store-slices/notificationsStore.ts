
import fetchAPI from '../../utils/index.ts';
import { toast } from 'sonner';
import type { StateCreator } from 'zustand';
import type { StoreState } from '../useStore.ts';
import type { INotification } from '@/models/notification.model.ts';
import useStore from '../useStore.ts';

export interface NotificationsStore {
  notifications: INotification[];
  unreadCount: number;
  isLoading: boolean;
  getNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribeToNotifications: () => void;
  unsubscribeFromNotifications: () => void;
}

const initialState = {
  notifications: [] as INotification[],
  unreadCount: 0,
  isLoading: false,
};

export const createNotificationSlice: StateCreator<StoreState, [], [], NotificationsStore> = (
  set,
  get
) => ({
  ...initialState,

  getNotifications: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('lh_token');
      if (!token) throw new Error('No token found');

      const response = await fetchAPI({
        url: '/notifications',
        headers: { Authorization: `Bearer ${token}` },
      });

      const notifications: INotification[] = response.data;
      const unreadCount = notifications.filter((n) => !n.isRead).length;

      set({ notifications, unreadCount });
    } catch (error: any) {
      console.error('getNotifications error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      const token = localStorage.getItem('lh_token');
      if (!token) throw new Error('No token found');

      await fetchAPI({
        method: 'patch',
        url: `/notifications/${id}/read`,
        headers: { Authorization: `Bearer ${token}` },
      });

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: state.notifications.filter((n) => n._id !== id && !n.isRead).length,
      }));
    } catch (error: any) {
      console.error('markAsRead error:', error);
      toast.error(error.response?.data?.message || 'Failed to mark as read');
    }
  },

  markAllAsRead: async () => {
    try {
      const token = localStorage.getItem('lh_token');
      if (!token) throw new Error('No token found');

      await fetchAPI({
        method: 'patch',
        url: 'notifications/read/all',
        headers: { Authorization: `Bearer ${token}` },
      });

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error: any) {
      console.error('markAllAsRead error:', error);
      toast.error(error.response?.data?.message || 'Failed to mark all as read');
    }
  },

  subscribeToNotifications: () => {
    const { loggedInMember } = get();
    if (!loggedInMember) return;

    const socket = useStore.getState().socket;
    if (!socket) return;

    socket.off('notification');
    socket.on('notification', (newNotification: INotification) => {
      set((state) => ({
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));
    });
  },

  unsubscribeFromNotifications: () => {
    const socket = useStore.getState().socket;
    if (socket) {
      socket.off('notification');
    }
  },
});
