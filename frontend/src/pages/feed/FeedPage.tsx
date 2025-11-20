import FriendsSidebar from '@/Components/Feed/FriendsSidebar/FriendsBar';
import { PostFeed } from '@/Components/Posts/PostsFeed';
import { useWindowWidth } from '@/hooks';
import RecommendationBar from '@/Components/Feed/FriendsSidebar/RecommendationBar';
import fetchAPI from '@/utils';

export default function FeedPage() {
  const isWideEnough = useWindowWidth(1100);

  const handleAddFriend = async (friendId: string) => {
    // Your friend request logic here
    const token = localStorage.getItem('lh_token');
    await fetchAPI({
      url: `friends/request/${friendId}`,
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-1 pt-7 min-h-screen max-w-[75rem] mx-auto bg-[--background] text-[--foreground]">
      {isWideEnough && (
        <div className="flex-[0_0_16rem] bg-[--sidebar]">
          <RecommendationBar onAddFriend={handleAddFriend} />
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
