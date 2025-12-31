import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMemberSlice } from './store-slices/memberStore.ts';
import { createFriendsSlice } from './store-slices/friendsStore.ts';
import { createMessageSlice, type MessagesStore } from './store-slices/messagesStore.ts';
import type { MemberStore } from './store-slices/memberStore.ts';
import type { FriendsStore } from './store-slices/friendsStore.ts';
import { createPostsSlice, type PostsStore } from './store-slices/postsStore.ts';
import { jwtDecode } from 'jwt-decode';
import { createNotificationSlice, type NotificationsStore } from './store-slices/notificationsStore.ts';

export type StoreState = 
  MemberStore &
  FriendsStore &
  PostsStore &
  NotificationsStore &
  MessagesStore & {
    _hasHydrated: boolean;
    setHasHydrated: (hydrated: boolean) => void;
    token: string | null;
    setToken: (token: string | null) => void;
    validateToken: () => Promise<boolean>;
  };

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

const initialState = {
  loggedInMember: null,
  selectedUser: null,
  friends: [],
  pending: [],
  token: null,
  decodedToken: null,
};

const useStore = create<StoreState>()(
  persist(
    (set, get, ...args) => ({
      ...createMemberSlice(set, get, ...args),
      ...createFriendsSlice(set, get, ...args),
      ...createPostsSlice(set, get, ...args),
      ...createMessageSlice(set, get, ...args),
      ...createNotificationSlice(set, get, ...args),
      _hasHydrated: false,
      setHasHydrated: (hydrated: boolean) => set({ _hasHydrated: hydrated }),
      token: null,
      setToken: (token: string | null) => set({ token }),
      validateToken: async () => {
        const token = get().token;
        if (!token) {
          set({
            ...initialState,
          });
          return false;
        }
        try {
          const decoded: DecodedToken = jwtDecode(token);
          if (decoded.exp < Math.floor(Date.now() / 1000)) {
            set({
              ...initialState,
            });
            return false;
          }
          return true;
        } catch {
          set({
            ...initialState,
          });
          return false;
        }
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedUser: state.selectedUser,
        loggedInMember: state.loggedInMember,
        token: state.token,
        decodedToken: state.decodedToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (state?.loggedInMember?._id) {
          if (!state?.socket?.connected) {
            state?.connectSocket();
          }
          if (state?.selectedUser?._id) {
            state
              .getMessages(state?.selectedUser._id)
              .then(() => {
                state?.subscribeToMessages();
              })
              .catch();
          } 
        } 
      },
    }
  )
);

export default useStore;
