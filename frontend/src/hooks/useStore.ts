import { create } from 'zustand';

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
  MessagesStore;

const useStore = create<StoreState>((...args) => ({
  ...createMemberSlice(...args),
  ...createFriendsSlice(...args),
  ...createPostsSlice(...args),
  ...createMessageSlice(...args),
}));

export default useStore;
