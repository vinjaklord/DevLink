import useStore from '@/hooks/useStore';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, SendIcon, MoreVertical, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/Components/ui/dropdown-menu';

const Post = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentPost,
    loading,
    error,
    fetchPostById,
    toggleLike,
    addComment,
    deletePost,
    loggedInMember,
    setShowSharePost,
    setSharePostId,
  } = useStore((state) => state);

  const [commentText, setCommentText] = useState('');
  const [commentsToShow, setCommentsToShow] = useState(10);

  const isAuthor = loggedInMember?._id === currentPost?.author?._id;

  const handleShowMore = () => {
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

  const handleDelete = async () => {
    try {
      if (id) {
        await deletePost(id);
        navigate(-1); // Or to feed: navigate('/feed')
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  if (error)
    return <p className="text-destructive mt-10 text-center">An error has occurred: {error}</p>;
  if (!currentPost) return <p className="text-destructive text-center">Post Not Found</p>;

  return (
    <div className="max-w-[37.5rem] mx-auto space-y-6 px-4 mt-7">
      <div className="bg-card dark:bg-card shadow-lg rounded-lg border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center">
            <img
              src={currentPost.author?.photo?.url || '/default-avatar.png'}
              alt="Author"
              className="w-8 h-8 rounded-full mr-2 object-cover"
            />
            <button>
              <Link
                to={`/members/${currentPost.author?.username}`}
                className="font-semibold text-foreground text-sm"
              >
                {currentPost.author?.username || 'Unknown'}
              </Link>
            </button>
          </div>
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  asChild
                  className="focus:bg-muted focus:text-destructive-foreground"
                >
                  <Link to={`/posts/edit/${id}`}>Edit Post</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="focus:bg-destructive focus:text-destructive-foreground"
                >
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Image */}
        <div className="relative w-full aspect-square">
          <img src={currentPost.imageUrl} alt="Post" className="w-full h-full object-cover" />
        </div>

        {/* Like, Comment, Share */}
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
            <button
              className="flex items-center text-foreground hover:text-primary transition-colors"
              onClick={() => {
                setSharePostId(id!);
                setShowSharePost(true);
              }}
            >
              <SendIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Caption */}
        <div className="px-3 py-2">
          <p className="text-foreground text-sm text-left flex items-start pb-2.5">
            <button>
              <Link to={`/members/${currentPost.author?.username}`} className="font-bold mr-2">
                {currentPost.author?.username || 'Unknown'}
              </Link>
            </button>
            <span className="flex-1">{currentPost.caption}</span>
          </p>
        </div>

        {/* Comments */}
        <div className="px-3 pb-2 max-h-60 overflow-y-auto">
          {currentPost?.comments?.length > 0 ? (
            [...currentPost.comments]
              .reverse()
              .slice(0, commentsToShow)
              .map((comment, index) => (
                <div
                  key={index}
                  className="text-sm text-muted-foreground mb-2 flex items-start text-left"
                >
                  <button>
                    <Link to={`/members/${comment.author?.username}`} className="font-bold mr-2">
                      {comment.author?.username || 'Unknown'}
                    </Link>
                  </button>
                  <span className="flex-1">{comment.text}</span>
                </div>
              ))
          ) : (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          )}
        </div>

        {/* Show More Comments */}
        {currentPost.comments.length > commentsToShow && (
          <div className="px-3 pb-2">
            <button
              onClick={handleShowMore}
              className="text-primary font-extralight text-sm hover:underline flex items-start text-left mb-3"
            >
              Show more comments...
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
    </div>
  );
};

export { Post };
