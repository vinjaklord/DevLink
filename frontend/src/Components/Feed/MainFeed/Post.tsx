import useStore from '@/hooks/useStore';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, MessageSquare } from 'lucide-react';

const Post = () => {
  const { id } = useParams();
  const { currentPost, loading, error, fetchPostById, toggleLike, addComment, loggedInMember } =
    useStore((state) => state);
  const [commentText, setCommentText] = useState('');
  const [commentsToShow, setCommentsToShow] = useState(10);

  const handleShowMore = async () => {
    setCommentsToShow((prevCount) => prevCount + 10);
  };

  useEffect(() => {
    if (id) fetchPostById(id);
  }, [id, fetchPostById]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !commentText.trim()) return;
    try {
      await addComment(id, { text: commentText });
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  if (loading) return <p className="text-center text-foreground">Loading...</p>;
  if (error) return <p className="text-destructive text-center">An error has occurred: {error}</p>;
  if (!currentPost) return <p className="text-destructive text-center">Post Not Found</p>;

  return (
    <div className="max-w-[37.5rem] mx-auto mt-15 p-4 bg-card dark:bg-card shadow-lg rounded-lg border border-border">
      {/* Header */}
      <div className="flex items-center p-3 border-b border-border">
        <img
          src={currentPost.author?.photo?.url}
          alt="Author"
          className="w-8 h-8 rounded-full mr-2 object-cover"
        />
        <span className="font-semibold text-foreground text-sm">
          {currentPost.author?.username || 'Unknown'}
        </span>
      </div>

      {/* Image */}
      <div className="relative w-full aspect-square">
        <img src={currentPost.imageUrl} alt="Post" className="w-full h-full object-cover" />
      </div>

      {/* Like and Comment */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => toggleLike(id!)}
            className="flex items-center text-foreground hover:text-primary transition-colors"
          >
            {currentPost.likes?.includes(loggedInMember?._id) ? (
              <Heart className="w-6 h-6 text-destructive fill-destructive" />
            ) : (
              <Heart className="w-6 h-6" />
            )}
            <span className="ml-1 text-sm">{currentPost.likes?.length || 0}</span>
          </button>
          <div className="flex items-center text-foreground">
            <MessageSquare className="w-6 h-6" />
            <span className="ml-1 text-sm">{currentPost.comments?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="px-3 py-2">
        <p className="text-foreground text-sm text-left flex items-start pb-2.5">
          <span className="font-bold mr-2">{currentPost.author?.username || 'Unknown'}</span>
          <span className="flex-1">{currentPost.caption}</span>
        </p>
      </div>

      {/* Comments */}
      <div className="px-3 pb-2 max-h-60 overflow-y-auto">
        {currentPost?.comments?.length > 0 ? (
          [...currentPost.comments]
            .reverse()
            .slice(0, commentsToShow) // Use .slice() with the new state
            .map((comment, index) => (
              <div
                key={index}
                className="text-sm text-muted-foreground mb-2 flex items-start text-left"
              >
                <span className="font-bold mr-2">{comment.author?.username || 'Unknown'}</span>
                <span className="flex-1">{comment.text}</span>
              </div>
            ))
        ) : (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        )}
      </div>
      {/* "Show More" Button */}
      {currentPost.comments.length > commentsToShow && (
        <div className="px-3 pb-2">
          <button
            onClick={handleShowMore}
            className="text-primary font-semibold text-sm hover:underline"
          >
            Show more...
          </button>
        </div>
      )}

      {/* Comment Input */}
      <div className="p-3 border-t border-border">
        <form onSubmit={handleCommentSubmit} className="flex items-center">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-foreground text-sm placeholder-muted-foreground"
          />
          <button type="submit" className="text-primary font-semibold text-sm hover:underline">
            Post
          </button>
        </form>
      </div>
    </div>
  );
};

export { Post };
