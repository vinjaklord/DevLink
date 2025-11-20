import SidebarFriendRecommendations from '@/utils/sidebarRecommendations';
import { Home, Compass, Bell, User, Settings, TrendingUp } from 'lucide-react';
import type { FC } from 'react';

interface RecommendationBarProps {
  onAddFriend: (friendId: string) => Promise<void>;
}

const RecommendationBar: FC<RecommendationBarProps> = ({ onAddFriend }) => {
  return (
    <div className="space-y-4 sticky max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
      {/* Trending Section */}
      <div className="bg-card rounded-xl border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground text-sm">Trending News</h3>
        </div>
        <div className="space-y-2">
          <a
            href="/trending/tech"
            className="block text-sm text-foreground hover:text-primary transition-colors"
          >
            #TechNews
          </a>
          <a
            href="/trending/design"
            className="block text-sm text-foreground hover:text-primary transition-colors"
          >
            #WebDesign
          </a>
          <a
            href="/trending/coding"
            className="block text-sm text-foreground hover:text-primary transition-colors"
          >
            #100DaysOfCode
          </a>
        </div>
      </div>

      {/* Friend Recommendations */}
      <SidebarFriendRecommendations onAddFriend={onAddFriend} />
    </div>
  );
};

export default RecommendationBar;
