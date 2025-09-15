import type { IMember } from '../../models/member.model.ts';
import type { ApiResponse } from '@/models/helper.model.ts';
import fetchAPI from '../../utils/index.ts';
import { toast } from 'sonner';
import type { StateCreator } from 'zustand';
import type { StoreState } from '../useStore.ts';

export interface FriendsStore {
  friends: IMember[];
  pending: IMember[];

  friendsLoading: boolean;
  friendsError: string | null;
  relationshipStatus: string;
  isSender: boolean;
  fetchFriends: () => Promise<void>; // change later
  fetchPending: () => Promise<void>; // change later
  deleteFriend: (friend: string) => Promise<void>; // change later
  addFriend: (friendId: string) => Promise<void>; // change later
  acceptFriendRequest: (senderId: string) => Promise<void>;
  rejectFriendRequest: (senderId: string) => Promise<void>;
  fetchRelationshipStatus: (userId: string) => Promise<void>;
  //   loggedInMember: IMember | null;
  //   token: string | null;
  //   decodedToken: DecodedToken | null;
  //   member: IMember;
  //   members: IMember[];
  //   loading: boolean;
}

const initialState = {
  friends: [],
  pending: [],
  friendsLoading: false,
  friendsError: null,

  relationshipStatus: 'none',
  isSender: false,
};

export const createFriendsSlice: StateCreator<StoreState, [], [], FriendsStore> = (
  set,
  get
): FriendsStore => ({
  ...initialState,

  fetchFriends: async () => {
    try {
      set({ friendsLoading: true });

      const token = localStorage.getItem('lh_token');
      if (!token) {
        set({ friendsError: 'Not logged in!' });
      }

      const response: ApiResponse<IMember[]> = await fetchAPI({
        url: 'friends/all-friends',
        headers: { Authorization: `Bearer ${token}` },
      });
      set({
        friends: response.data,
        friendsLoading: false,
        friendsError: null,
      });
    } catch (error: any) {
      set({
        friendsError: error.message || 'Failed to fetch friends!',
        friendsLoading: false,
      });
      toast.error(error.message);
    }
  },

  fetchPending: async () => {
    try {
      const token = localStorage.getItem('lh_token');
      if (!token) {
        set({ friendsError: 'Not logged in!' });
      }

      const response: ApiResponse<IMember[]> = await fetchAPI({
        url: 'friends/pending',
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ pending: response.data });
    } catch (error) {
      toast.error(error.message);
    }
  },

  deleteFriend: async (friend) => {
    try {
      const token = localStorage.getItem('lh_token');
      if (!token) {
        set({ friendsError: 'Not logged in!' });
      }

      const response: ApiResponse<IMember[]> = await fetchAPI({
        url: `friends/deleteFriend/${friend}`,
        method: 'delete',
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Friend removed');
      console.log('Friend removed');
      get().fetchFriends();
      get().fetchPending();
    } catch (error) {
      console.error(`Error while deleting, ${error}`);
      toast.error(`Error while deleting a friend!`);
    }
  },

  addFriend: async (friendId) => {
    try {
      const token = localStorage.getItem('lh_token');
      if (!token) {
        set({ friendsError: 'Not logged in!' });
        return;
      }

      await fetchAPI({
        url: `friends/add-friend/${friendId}`,
        method: 'post',
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Friend request sent!');

      await get().fetchPending();

      await get().fetchRelationshipStatus(friendId);
    } catch (error) {
      console.error(`Error while adding, ${error}`);
      toast.error(`Error while adding a friend!`);
    }
  },

  acceptFriendRequest: async (senderId) => {
    try {
      const token = localStorage.getItem('lh_token');
      if (!token) throw new Error('Not logged in!');

      await fetchAPI({
        url: `friends/${senderId}`,
        method: 'put',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { action: 'accept' }, // <-- Send the object directly
      });

      toast.success('Friend request accepted!');
    } catch (error) {
      toast.error(error.message);
    }
  },

  rejectFriendRequest: async (senderId) => {
    try {
      const token = localStorage.getItem('lh_token');
      if (!token) throw new Error('Not logged in!');

      await fetchAPI({
        url: `friends/${senderId}`,
        method: 'put',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { action: 'decline' },
      });

      toast.success('Friend request rejected!');
    } catch (error) {
      toast.error(error.message);
    }
  },

  fetchRelationshipStatus: async (userId) => {
    try {
      const token = localStorage.getItem('lh_token');
      if (!token) throw new Error('Not logged in!');

      const response = await fetchAPI({
        url: `friends/status/${userId}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      set({
        relationshipStatus: response.data.status,
        isSender: response.data.isSender,
      });
    } catch (error) {
      toast.error(error.message);
    }
  },
});
