import useStore from '@/hooks/useStore';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, SendIcon } from 'lucide-react';
import FriendRecommendations from '@/utils/friendRecommendations';

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

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
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

  const handleCommentChange = (postId: string, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const handleCommentSubmit = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    // Optimistic update: Add temp comment to local displayedPosts
    const tempComment = {
      _id: `temp-${Date.now()}`,
      author: loggedInMember, // Assumes shape matches { _id, username }
      text,
      createdAt: new Date().toISOString(),
    };

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
      // Store updates; local stays in sync via optimistic add (real data syncs on next fetch)
    } catch (err) {
      console.error('Error adding comment:', err);
      // Revert on error
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
    }

    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  // Add this useCallback near your other handlers (e.g., after handleCommentSubmit)
  const handleToggleLike = useCallback(
    (postId: string) => {
      // Optimistic update: Toggle like in local displayedPosts
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

      // Call store action
      toggleLike(postId);
    },
    [loggedInMember?._id, toggleLike]
  );

  if (loading && displayedPosts.length === 0) {
    return <p className="text-center text-foreground">Loading...</p>;
  }

  if (error) return <p className="text-destructive text-center">An error has occurred: {error}</p>;

  if (friendsPosts.length === 0) {
    return (
      <div className="max-w-[37.5rem] mx-auto p-6 text-center bg-card shadow-lg rounded-lg border border-border">
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
        <>
          <div
            key={post._id}
            className="bg-card dark:bg-card shadow-lg rounded-lg border border-border overflow-hidden"
          >
            <div className="flex items-center p-3 border-b border-border">
              <img
                src={post.author?.photo?.url || '/default-avatar.png'}
                alt="Author"
                className="w-8 h-8 rounded-full mr-2 object-cover"
              />
              <Link
                to={`/members/${post.author?.username}`}
                className="font-semibold text-foreground text-sm"
              >
                {post.author?.username || 'Unknown'}
              </Link>
            </div>
            <div className="relative w-full aspect-square">
              <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
            </div>
            <div className="p-3 border-b border-border">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleToggleLike(post._id)}
                  className="flex items-center text-foreground hover:text-primary transition-colors"
                >
                  {post.likes?.includes(loggedInMember?._id) ? (
                    <Heart className="w-6 h-6 text-destructive fill-destructive" />
                  ) : (
                    <Heart className="w-6 h-6" />
                  )}
                  <span className="ml-1 text-sm">{post.likes?.length || 0}</span>
                </button>
                <Link
                  to={`/posts/${post._id}`}
                  className="flex items-center text-foreground hover:text-primary transition-colors"
                >
                  <MessageSquare className="w-6 h-6" />
                  <span className="ml-1 text-sm">{post.comments?.length || 0}</span>
                </Link>
                <button
                  className="flex items-center text-foreground hover:text-primary transition-colors"
                  onClick={() => {
                    setSharePostId(post._id);
                    setShowSharePost(true);
                  }}
                >
                  <SendIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="px-3 py-2">
              <p className="text-foreground text-sm text-left flex items-start pb-2.5">
                <Link to={`/members/${post.author?.username}`} className="font-bold mr-2">
                  {post.author?.username || 'Unknown'}
                </Link>
                <span className="flex-1">{post.caption}</span>
              </p>
            </div>
            <div className="px-3 pb-2 max-h-60 overflow-y-auto">
              {post?.comments?.length > 0 ? (
                [...post.comments]
                  .slice(-3)
                  .reverse()
                  .map((comment: any, commentIndex: number) => (
                    <div
                      key={commentIndex}
                      className="text-sm text-muted-foreground mb-2 flex items-start text-left"
                    >
                      <Link to={`/members/${comment.author?.username}`} className="font-bold mr-2">
                        {comment.author?.username || 'Unknown'}
                      </Link>
                      <span className="flex-1">{comment.text}</span>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              )}
            </div>
            {post.comments && post.comments.length > 3 && (
              <div className="px-3">
                <Link
                  to={`/posts/${post._id}`}
                  className="text-primary font-extralight text-sm hover:underline flex items-start text-left mb-3"
                >
                  See all {post?.comments?.length} comments...
                </Link>
              </div>
            )}
            <div className="p-3 border-t border-border">
              <form
                onSubmit={(e) => handleCommentSubmit(post._id, e)}
                className="flex items-center"
              >
                <input
                  type="text"
                  value={commentInputs[post._id] || ''}
                  onChange={(e) => handleCommentChange(post._id, e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-foreground text-sm placeholder-muted-foreground"
                />
                <button
                  type="submit"
                  className="text-primary font-semibold text-sm hover:underline"
                >
                  Post
                </button>
              </form>
            </div>
          </div>

          {index === RECOMMENDATION_INSERT_INDEX - 1 && (
            <FriendRecommendations key="recommendations" onAddFriend={addFriend} />
          )}
        </>
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
