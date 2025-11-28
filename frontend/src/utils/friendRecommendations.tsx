import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
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

interface FriendRecommendationsProps {
  onAddFriend: (friendId: string) => Promise<void>;
}

const FriendRecommendations = ({ onAddFriend }: FriendRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<RecommendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const VISIBLE_CARDS = 3; // Number of cards visible at once
  const CARD_WIDTH = 164; // Fixed width for smooth animation
  const GAP = 16; // Gap between cards

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
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const handleNext = () => {
    if (currentIndex + VISIBLE_CARDS < recommendations.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (loading) {
    return (
      <div className="bg-background rounded-2xl overflow-hidden border border-border/50">
        <div className="animate-pulse flex space-x-4 p-6">
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (dismissed || recommendations.length === 0) {
    return null;
  }

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex + VISIBLE_CARDS < recommendations.length;

  const totalWidth = recommendations.length * (CARD_WIDTH + GAP) - GAP;
  const visibleWidth = VISIBLE_CARDS * (CARD_WIDTH + GAP) - GAP;
  let offset = currentIndex * (CARD_WIDTH + GAP);

  if (offset + visibleWidth > totalWidth) {
    offset = totalWidth - visibleWidth;
    if (offset < 0) offset = 0;
  }

  return (
    <div className="bg-background rounded-2xl overflow-hidden border border-border/50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/20">
        <h3 className="font-semibold text-foreground">Suggested for you</h3>
        <div className="flex items-center gap-2">
          <Link to="/discover" className="text-primary text-sm hover:underline transition-colors">
            See all
          </Link>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors rounded-full p-1 hover:bg-muted/50"
            aria-label="Dismiss recommendations"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative px-5 py-6">
        <div className="relative w-full">
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full border border-border/20 transition-all opacity-80 hover:opacity-100 ${
              canGoPrev
                ? 'bg-background/60 hover:bg-muted/60 text-foreground shadow-sm hover:shadow-primary/10'
                : 'bg-muted/30 text-muted-foreground cursor-not-allowed opacity-30'
            }`}
            aria-label="Previous recommendations"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Cards Container */}
          <div className="overflow-hidden w-full">
            <div
              className="flex gap-4 transition-transform duration-300 ease-in-out"
              style={{
                width: `${recommendations.length * (CARD_WIDTH + GAP) - GAP}px`,
                transform: `translateX(-${offset}px)`,
              }}
            >
              {recommendations.map((user) => (
                <div
                  key={user._id}
                  className="flex-shrink-0 w-[164px] h-[220px] bg-card border border-border/50 rounded-xl p-4 flex flex-col items-center shadow-lg hover:shadow-primary/20 transition-all duration-200"
                >
                  <div className="flex-1 flex flex-col items-center space-y-2 mb-4">
                    <Link to={`/members/${user.username}`}>
                      <img
                        src={user.photo?.url || '/default-avatar.png'}
                        alt={user.username}
                        className="w-16 h-16 rounded-full object-cover hover:opacity-80 transition-opacity shadow-md"
                      />
                    </Link>
                    <Link
                      to={`/members/${user.username}`}
                      className="font-semibold text-foreground text-sm text-center hover:underline truncate w-full transition-colors"
                    >
                      {user.username}
                    </Link>
                    <p className="text-xs text-muted-foreground text-center truncate w-full">
                      {user.firstName} {user.lastName}
                    </p>
                    {user.location && (
                      <p className="text-xs text-muted-foreground text-center truncate w-full">
                        {user.location.city && user.location.country
                          ? `${user.location.city}, ${user.location.country}`
                          : user.location.city || user.location.country || ''}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleFollow(user._id)}
                    disabled={followingIds.has(user._id)}
                    className={`w-full px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      followingIds.has(user._id)
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-primary/20'
                    }`}
                  >
                    {followingIds.has(user._id) ? 'Pending' : 'Add Friend'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full border border-border/20 transition-all opacity-80 hover:opacity-100 ${
              canGoNext
                ? 'bg-background/60 hover:bg-muted/60 text-foreground shadow-sm hover:shadow-primary/10'
                : 'bg-muted/30 text-muted-foreground cursor-not-allowed opacity-30'
            }`}
            aria-label="Next recommendations"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Indicator */}
        {recommendations.length > VISIBLE_CARDS && (
          <div className="flex justify-center gap-1 mt-4">
            {Array.from({ length: Math.ceil(recommendations.length / VISIBLE_CARDS) }).map(
              (_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    Math.floor(currentIndex / VISIBLE_CARDS) === idx
                      ? 'w-6 bg-primary'
                      : 'w-1.5 bg-muted/50'
                  }`}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendRecommendations;
