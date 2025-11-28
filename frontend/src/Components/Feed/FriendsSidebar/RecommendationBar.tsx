import { useState, useEffect } from 'react';
import SidebarFriendRecommendations from '@/utils/sidebarRecommendations';
import { Newspaper, ExternalLink, Globe } from 'lucide-react';
import fetchAPI from '@/utils';
import type { FC } from 'react';

interface RecommendationBarProps {
  onAddFriend: (friendId: string) => Promise<void>;
}

interface NewsItem {
  _id: string;
  title: string;
  url: string;
  source?: string | { id: string; name: string };
}

const RecommendationBar: FC<RecommendationBarProps> = ({ onAddFriend }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetchAPI({ url: 'members/news', method: 'GET' });
        setNews(response.data.slice(0, 6)); // Show more since no internal scroll
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const getSourceName = (item: NewsItem) => {
    if (item.source) {
      if (typeof item.source === 'string') return item.source;
      if (typeof item.source === 'object' && 'name' in item.source) {
        return (item.source as any).name;
      }
    }
    try {
      return new URL(item.url).hostname.replace('www.', '');
    } catch {
      return 'Source';
    }
  };

  return (
    <aside className="w-80 flex-shrink-0 space-y-6">
      <div className="sticky space-y-6">
        {/* Latest News */}
        <div className="bg-card rounded-xl border border-border/60 shadow-sm">
          <div className="flex items-center gap-2.5 px-5 pt-4 pb-3">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Newspaper className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-bold text-foreground">Latest News</h3>
          </div>

          <div className="px-4 pb-4 space-y-3">
            {loading ? (
              <>
                {' '}
                {/* Simple skeleton */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-2.5 animate-pulse">
                    <div className="w-5 h-5 bg-muted rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-2 bg-muted rounded w-24" />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              news.map((item, index) => (
                <a
                  key={item._id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2.5 py-2.5 px-3 -mx-3 rounded-xl transition-all hover:bg-accent/70"
                >
                  {/* Favicon / Number — perfectly aligned */}
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                    {getFaviconUrl(item.url) ? (
                      <img
                        src={getFaviconUrl(item.url)!}
                        alt=""
                        className="w-full h-full object-contain rounded"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">{index + 1}</span>
                      </div>
                    )}
                  </div>

                  {/* Text Content — now perfectly aligned with padding */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground/95 line-clamp-2 leading-tight group-hover:text-primary transition-colors pr-6">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                      <Globe className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{getSourceName(item)}</span>
                    </div>
                  </div>

                  {/* External link icon — aligned to the right */}
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                </a>
              ))
            )}
          </div>
        </div>

        {/* Friend Recommendations */}
        <div className="bg-card rounded-xl border shadow-sm p-1">
          <SidebarFriendRecommendations onAddFriend={onAddFriend} />
        </div>
      </div>
    </aside>
  );
};

export default RecommendationBar;
