import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import fetchAPI from '.';

interface RecommendedUser {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  photo?: {
    url: string;
  };
  location?: {
    city?: string;
    country?: string;
  };
}

interface SidebarFriendRecommendationsProps {
  onAddFriend: (friendId: string) => Promise<void>;
}

const SidebarFriendRecommendations = ({ onAddFriend }: SidebarFriendRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<RecommendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const INITIAL_DISPLAY = 4;

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('lh_token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      const response = await fetchAPI({
        url: 'location/recommended',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await onAddFriend(userId);

      setFollowingIds((prev) => new Set(prev).add(userId));

      setRecommendations((prev) => prev.filter((u) => u._id !== userId));
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-2/3"></div>
                <div className="h-2 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!loading && recommendations.length === 0) {
    return null;
  }

  const displayedUsers = showAll ? recommendations : recommendations.slice(0, INITIAL_DISPLAY);

  return (
    <div className="bg-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/20">
        <h3 className="font-semibold text-foreground text-sm">Suggested friends</h3>
      </div>

      {/* User List */}
      <div className="p-3 space-y-3 max-h-[400px] overflow-y-auto">
        {displayedUsers.map((user) => (
          <div
            key={user._id}
            className="flex items-center gap-3 hover:bg-muted/30 p-2 rounded-lg transition-colors"
          >
            <a href={`/members/${user.username}`}>
              <img
                src={`${user.photo?.url}?tr=w-128,h-128,cm-round,cq-95,sh-20,q-95,f-auto`}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition-opacity"
              />
            </a>

            <div className="flex-1 min-w-0">
              <a
                href={`/members/${user.username}`}
                className="font-medium text-foreground text-sm hover:underline truncate block"
              >
                {user.username}
              </a>
              <p className="text-xs text-muted-foreground truncate">
                {user.firstName} {user.lastName}
              </p>
              {user.location && (
                <p className="text-xs text-muted-foreground truncate">
                  {user.location.city && user.location.country
                    ? `${user.location.city}, ${user.location.country}`
                    : user.location.city || user.location.country || ''}
                </p>
              )}
            </div>

            <button
              onClick={() => handleFollow(user._id)}
              disabled={followingIds.has(user._id)}
              className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
                followingIds.has(user._id)
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {followingIds.has(user._id) ? 'Pending' : <UserPlus className="w-4 h-4" />}
            </button>
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {recommendations.length > INITIAL_DISPLAY && (
        <div className="p-3 pt-0">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-primary text-sm font-medium hover:underline transition-colors"
          >
            {showAll ? 'Show less' : `Show ${recommendations.length - INITIAL_DISPLAY} more`}
          </button>
        </div>
      )}
    </div>
  );
};

export default SidebarFriendRecommendations;
