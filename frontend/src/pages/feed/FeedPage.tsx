import FriendsSidebar from '@/Components/Feed/FriendsSidebar/FriendsBar';
import { PostFeed } from '@/Components/Posts/PostsFeed';
import { useWindowWidth } from '@/hooks';
import RecommendationBar from '@/Components/Feed/FriendsSidebar/RecommendationBar';
import fetchAPI from '@/utils';

export default function FeedPage() {
  const isWideEnough = useWindowWidth(1100);

  const handleAddFriend = async (friendId: string) => {
    const token = localStorage.getItem('lh_token');
    await fetchAPI({
      url: `friends/add-friend/${friendId}`,
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  return (
    <div className="flex gap-4 pt-7 min-h-screen">
      {' '}
      {/* Reduced gap from gap-8 → gap-4 */}
      {/* Left Sidebar - Pulls closer to center */}
      {isWideEnough && (
        <div className="w-64 md:w-72 lg:w-80 flex-shrink-0">
          <div className="sticky">
            <RecommendationBar onAddFriend={handleAddFriend} />
          </div>
        </div>
      )}
      {/* Center Feed - Full original width, no max-width limit */}
      <div className="flex-1 min-w-0 max-w-none">
        <div className="mx-auto w-full max-w-[48rem] px-4">
          <PostFeed />
        </div>
      </div>
      {/* Right Sidebar - Pulls closer */}
      {isWideEnough && (
        <div className="w-64 md:w-72 lg:w-80 flex-shrink-0">
          <div className="sticky">
            <FriendsSidebar />
          </div>
        </div>
      )}
    </div>
  );
}
