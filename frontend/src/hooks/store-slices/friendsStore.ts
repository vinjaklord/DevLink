import type { IMember } from '../../models/member.model.ts';
import type { ApiResponse } from '@/models/helper.model.ts';
import fetchAPI from '../../utils/index.ts';
import { toast } from 'sonner';
import type { StateCreator } from 'zustand';
import type { StoreState } from '../useStore.ts';

export interface FriendsStore {
  friends: IMember[];
  friendsLoading: boolean;
  friendsError: string | null;
  fetchFriends: () => Promise<void>; // change later
  //   loggedInMember: IMember | null;
  //   token: string | null;
  //   decodedToken: DecodedToken | null;
  //   member: IMember;
  //   members: IMember[];
  //   loading: boolean;
}

const initialState = {
  friends: [],
  friendsLoading: false,
  friendsError: null,
};

export const createFriendsSlice: StateCreator<StoreState, [], [], FriendsStore> = (set, get): FriendsStore => ({
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
});
