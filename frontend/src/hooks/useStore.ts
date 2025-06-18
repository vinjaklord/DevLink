import { create } from 'zustand';

import { createMemberSlice } from './store-slices/memberStore.ts';
import { createFriendsSlice } from './store-slices/friendsStore.ts';
import type { MemberStore } from './store-slices/memberStore.ts';
import type { FriendsStore } from './store-slices/friendsStore.ts';

type StoreState = MemberStore & FriendsStore;

const useStore = create<StoreState>((set, get) => ({
  ...createMemberSlice(set, get),
  ...createFriendsSlice(set, get),
}));

export default useStore;
