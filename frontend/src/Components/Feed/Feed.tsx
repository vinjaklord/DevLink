import FriendsBar from './FriendsBar/FriendsBar';
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { PostFeed } from './MainFeed/PostsFeed';
const LeftSidebar: FC = () => <div className="bg-card p-4">Left Sidebar</div>;
// const MainFeed: FC = () => <div className="bg-card p-4">Main Feed</div>;

export default function Feed() {
  const [isWideEnough, setIsWideEnough] = useState(window.innerWidth >= 800);

  useEffect(() => {
    const handleResize = () => setIsWideEnough(window.innerWidth >= 800);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-1 p-1 pt-14 min-h-screen max-w-[75rem] mx-auto bg-[--background] text-[--foreground]">
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
          <FriendsBar />
        </div>
      )}
    </div>
  );
}
