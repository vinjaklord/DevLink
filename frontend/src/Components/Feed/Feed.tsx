import FriendsBar from './FriendsBar/FriendsBar';
import type { FC } from 'react';
import { useState, useEffect } from 'react';
const LeftSidebar: FC = () => <div className="bg-card p-4">Left Sidebar</div>;
const MainFeed: FC = () => <div className="bg-card p-4">Main Feed</div>;

export default function Feed() {
  const [isWideEnough, setIsWideEnough] = useState(window.innerWidth >= 850);

  useEffect(() => {
    const handleResize = () => setIsWideEnough(window.innerWidth >= 850);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className="flex flex-col md:flex-row gap-4 p-4 min-h-screen max-w-7xl mx-auto bg-[--background] text-[--foreground] relative"
      style={{ paddingRight: isWideEnough ? '256px' : '0' }}
    >
      <div className="flex-1">
        <LeftSidebar />
      </div>
      <div className={`flex-${isWideEnough ? '3' : '4'} overflow-y-auto`}>
        <MainFeed />
      </div>
      {isWideEnough && <FriendsBar />}
    </div>
  );
}
