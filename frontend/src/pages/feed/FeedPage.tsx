import FriendsSidebar from '@/Components/Feed/FriendsSidebar/FriendsBar';
import type { FC } from 'react';
import { PostFeed } from '@/Components/Posts/PostsFeed';
import { useWindowWidth } from '@/hooks';
const LeftSidebar: FC = () => <div className="bg-card p-4">Left Sidebar</div>;
// const MainFeed: FC = () => <div className="bg-card p-4">Main Feed</div>;

export default function FeedPage() {
  const isWideEnough = useWindowWidth(1100);

  return (
    <div className="flex flex-col md:flex-row gap-1 p-1 pt-7 min-h-screen max-w-[75rem] mx-auto bg-[--background] text-[--foreground]">
      {isWideEnough && (
        <div className="flex-[0_0_16rem] bg-[--sidebar]">
          <LeftSidebar />
        </div>
      )}
      <div
        className={`w-[48rem] overflow-y-auto mx-auto ${
          !isWideEnough ? 'w-full max-w-[48rem]' : ''
        }`}
      >
        <PostFeed />
      </div>
      {isWideEnough && (
        <div className="flex-[0_0_16rem] bg-[--sidebar]">
          <FriendsSidebar />
        </div>
      )}
    </div>
  );
}
