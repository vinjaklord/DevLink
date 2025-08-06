import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMemberSlice } from './store-slices/memberStore.ts';
import { createFriendsSlice } from './store-slices/friendsStore.ts';
import {
  createMessageSlice,
  type MessagesStore,
} from './store-slices/messagesStore.ts';
import type { MemberStore } from './store-slices/memberStore.ts';
import type { FriendsStore } from './store-slices/friendsStore.ts';
import {
  createPostsSlice,
  type PostsStore,
} from './store-slices/postsStore.ts';

export type StoreState = MemberStore &
  FriendsStore &
  PostsStore &
  MessagesStore & {
    _hasHydrated: boolean;
    setHasHydrated: (hydrated: boolean) => void;
  };

const useStore = create<StoreState>()(
  persist(
    (set, get, ...args) => ({
      ...createMemberSlice(set, get, ...args),
      ...createFriendsSlice(set, get, ...args),
      ...createPostsSlice(set, get, ...args),
      ...createMessageSlice(set, get, ...args),
      _hasHydrated: false,
      setHasHydrated: (hydrated: boolean) => set({ _hasHydrated: hydrated }),
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
        if (!state) return;
        state.setHasHydrated(true);
        if (state.loggedInMember?._id) {
          if (!state.socket?.connected) {
            state.connectSocket();
          }
          if (state.selectedUser?._id) {
            state
              .getMessages(state.selectedUser._id)
              .then(() => {
                state.subscribeToMessages();
              })
              .catch((err) =>
                console.error('onRehydrateStorage: Fetch error:', err)
              );
          } else {
            console.log('onRehydrateStorage: No selectedUser');
          }
        } else {
          console.log(
            'onRehydrateStorage: No loggedInMember, checking session'
          );
          state.memberCheck();
        }
      },
    }
  )
);

export default useStore;
