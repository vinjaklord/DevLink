import useStore from '@/hooks/useStore';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import FriendRecommendations from '@/utils/friendRecommendations';
import PostCardItem from './PostCardItem/PostCardItem';

const PostFeed = () => {
  const {
    friendsPosts,
    loading,
    error,
    fetchFriendsPosts,
    toggleLike,
    addComment,
    loggedInMember,
    setShowSharePost,
    setSharePostId,
    addFriend,
  } = useStore((state) => state);

  const [displayedPosts, setDisplayedPosts] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  const POSTS_PER_PAGE = 10;
  const RECOMMENDATION_INSERT_INDEX = 5;

  useEffect(() => {
    fetchFriendsPosts();
  }, [fetchFriendsPosts]);

  const dedupePosts = useCallback((posts: any[]) => {
    const seen = new Set();
    return posts.filter((post) => {
      if (seen.has(post._id)) return false;
      seen.add(post._id);
      return true;
    });
  }, []);

  const loadMorePosts = useCallback(() => {
    if (!friendsPosts || friendsPosts.length === 0) return;

    let reversedPosts = [...friendsPosts].reverse();
    reversedPosts = dedupePosts(reversedPosts);

    const startIndex = page * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const newPosts = reversedPosts.slice(startIndex, endIndex);

    if (newPosts.length > 0) {
      setDisplayedPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));
        const filteredNewPosts = newPosts.filter((p) => !existingIds.has(p._id));
        return [...prev, ...filteredNewPosts];
      });
      setPage((prev) => prev + 1);
    }

    if (endIndex >= reversedPosts.length) {
      setHasMore(false);
    }
  }, [friendsPosts, page, dedupePosts]);

  useEffect(() => {
    if (friendsPosts && friendsPosts.length > 0 && displayedPosts.length === 0) {
      loadMorePosts();
    }
  }, [friendsPosts, loadMorePosts, displayedPosts.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMorePosts();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadMorePosts]);

  useEffect(() => {
    setDisplayedPosts([]);
    setPage(0);
    setHasMore(true);
  }, [friendsPosts.length]);

  const handleToggleLike = useCallback(
    (postId: string) => {
      // optimistic update
      setDisplayedPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes?.includes(loggedInMember?._id)
                  ? post.likes.filter((id: string) => id !== loggedInMember?._id)
                  : [...(post.likes || []), loggedInMember?._id],
              }
            : post
        )
      );

      toggleLike(postId);
    },
    [loggedInMember?._id, toggleLike]
  );

  const handleCommentSubmit = async (postId: string, text: string) => {
    const tempComment = {
      _id: `temp-${Date.now()}`,
      author: loggedInMember,
      text,
      createdAt: new Date().toISOString(),
    };

    // optimistic update
    setDisplayedPosts((prev) =>
      prev.map((post) =>
        post._id === postId
          ? {
              ...post,
              comments: [...(post.comments || []), tempComment],
            }
          : post
      )
    );

    try {
      await addComment(postId, { text });
    } catch (err) {
      console.error('Error adding comment:', err);

      setDisplayedPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments?.filter((c: any) => c._id !== tempComment._id) || [],
              }
            : post
        )
      );
      throw err;
    }
  };

  const handleShare = (postId: string) => {
    setSharePostId(postId);
    setShowSharePost(true);
  };

  if (loading && displayedPosts.length === 0) {
    return <p className="text-center text-foreground">Loading...</p>;
  }

  if (error) return <p className="text-destructive text-center">An error has occurred: {error}</p>;

  if (friendsPosts.length === 0) {
    return (
      <div className="max-w-[37.5rem] mx-auto p-6 text-center bg-card rounded-xl border border-border">
        <h2 className="text-xl font-semibold text-foreground mb-3">Your feed is empty! 😔</h2>
        <p className="text-muted-foreground mb-4">
          It looks like you haven't made any friends yet, or they haven't posted anything.
        </p>
        <p className="text-primary hover:underline">
          <Link to="/discover">Go to the Discover page to find and follow new members!</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[37.5rem] mx-auto space-y-6 px-4">
      {displayedPosts.map((post, index) => (
        <div key={post._id}>
          <PostCardItem
            post={post}
            loggedInMember={loggedInMember}
            onToggleLike={handleToggleLike}
            onCommentSubmit={handleCommentSubmit}
            onShare={handleShare}
            showAllComments={false}
            commentsToShow={3}
            clickable={true}
          />

          {index === RECOMMENDATION_INSERT_INDEX - 1 && (
            <FriendRecommendations key="recommendations" onAddFriend={addFriend} />
          )}
        </div>
      ))}

      {hasMore && (
        <div ref={loaderRef} className="py-8 text-center text-muted-foreground">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2">Loading more posts...</p>
        </div>
      )}

      {!hasMore && displayedPosts.length > 0 && (
        <div className="py-8 text-center text-muted-foreground">
          <p>You've reached the end! 🎉</p>
        </div>
      )}
    </div>
  );
};

export { PostFeed };
