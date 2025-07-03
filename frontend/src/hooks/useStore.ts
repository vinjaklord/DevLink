import { create } from 'zustand';

import { createMemberSlice } from './store-slices/memberStore.ts';
import { createFriendsSlice } from './store-slices/friendsStore.ts';
import type { MemberStore } from './store-slices/memberStore.ts';
import type { FriendsStore } from './store-slices/friendsStore.ts';
import { createPostsSlice, type PostsStore } from './store-slices/postsStore.ts';

export type StoreState = MemberStore & FriendsStore & PostsStore;

const useStore = create<StoreState>((...args) => ({
  ...createMemberSlice(...args),
  ...createFriendsSlice(...args),
  ...createPostsSlice(...args),
}));

export default useStore;
