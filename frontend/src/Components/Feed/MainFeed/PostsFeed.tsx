import useStore from '@/hooks/useStore';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare } from 'lucide-react';

const PostFeed = () => {
  const {
    allPosts,
    loading,
    error,
    fetchAllPosts,
    toggleLike,
    addComment,
    loggedInMember,
  } = useStore((state) => state);

  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>(
    {}
  );

  useEffect(() => {
    fetchAllPosts();
  }, [fetchAllPosts]);

  const handleCommentChange = (postId: string, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const handleCommentSubmit = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    try {
      await addComment(postId, { text });
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  if (loading) return <p className="text-center text-foreground">Loading...</p>;
  if (error)
    return (
      <p className="text-destructive text-center">
        An error has occurred: {error}
      </p>
    );

  return (
    <div className="max-w-[37.5rem] mx-auto space-y-6 px-4">
      {[...allPosts].reverse().map((post) => (
        <div
          key={post._id}
          className="bg-card dark:bg-card shadow-lg rounded-lg border border-border overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center p-3 border-b border-border">
            <img
              src={post.author?.photo?.url || '/default-avatar.png'}
              alt="Author"
              className="w-8 h-8 rounded-full mr-2 object-cover"
            />
            <span className="font-semibold text-foreground text-sm">
              {post.author?.username || 'Unknown'}
            </span>
          </div>

          {/* Image */}
          <div className="relative w-full aspect-square">
            <img
              src={post.imageUrl}
              alt="Post"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Like and Coment */}
          <div className="p-3 border-b border-border">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => toggleLike(post._id)}
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
                <span className="ml-1 text-sm">
                  {post.comments?.length || 0}
                </span>
              </Link>
            </div>
          </div>

          {/* Caption */}
          <div className="px-3 py-2">
            <p className="text-foreground text-sm text-left flex items-start pb-2.5">
              <span className="font-bold mr-2">
                {post.author?.username || 'Unknown'}
              </span>
              <span className="flex-1">{post.caption}</span>
            </p>
          </div>

          {/* Comments */}
          <div className="px-3 pb-2 max-h-60 overflow-y-auto">
            {post?.comments?.length > 0 ? (
              post?.comments?.map((comment, index) => (
                <div
                  key={index}
                  className="text-sm text-muted-foreground mb-2 flex items-start text-left "
                >
                  <span className="font-bold mr-2">
                    {comment.author?.username || 'Unknown'}
                  </span>
                  <span className="flex-1">{comment.text}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            )}
          </div>

          {/* Comment Input */}
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
                className="text-primary font-semibold text-sm hoverunderline"
              >
                Post
              </button>
            </form>
          </div>

          {/* View Post Link */}
          <div className="px-3 pb-3">
            <Link
              to={`/posts/${post._id}`}
              className="text-primary text-sm hover:underline"
            >
              View Post
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export { PostFeed };
