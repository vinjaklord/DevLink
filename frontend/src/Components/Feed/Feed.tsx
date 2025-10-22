import FriendsBar from './FriendsBar/FriendsBar';
import type { FC } from 'react';
import { PostFeed } from './MainFeed/PostsFeed';
import { useWindowWidth } from '@/hooks/useWindowWidth';
const LeftSidebar: FC = () => <div className="bg-card p-4">Left Sidebar</div>;
// const MainFeed: FC = () => <div className="bg-card p-4">Main Feed</div>;

export default function Feed() {
<<<<<<< HEAD
  const [isWideEnough, setIsWideEnough] = useState(window.innerWidth >= 1100);

  useEffect(() => {
    const handleResize = () => setIsWideEnough(window.innerWidth >= 1100);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
=======
  const isWideEnough = useWindowWidth(1100);
>>>>>>> 759c50c4e60e340bdd1028d9bb6b71320692cb8e

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
