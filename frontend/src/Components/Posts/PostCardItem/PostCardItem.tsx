import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Send, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/Components/ui';

interface PostCardProps {
  post: any;
  loggedInMember: any;
  onToggleLike: (postId: string) => void;
  onCommentSubmit: (postId: string, text: string) => Promise<void>;
  onDelete?: (postId: string) => void;
  onShare: (postId: string) => void;
  showAllComments?: boolean;
  onShowMoreComments?: () => void;
  commentsToShow?: number;
  clickable?: boolean; // New prop to control if card is clickable
}

const PostCardItem = ({
  post,
  loggedInMember,
  onToggleLike,
  onCommentSubmit,
  onDelete,
  onShare,
  showAllComments = false,
  onShowMoreComments,
  commentsToShow = 3,
  clickable = false, // Default to false (single post view not clickable)
}: PostCardProps) => {
  const [commentText, setCommentText] = useState('');
  const navigate = useNavigate();
  const isAuthor = loggedInMember?._id === post?.author?._id;
  const userId = loggedInMember?._id;
  const isTextOnly = !post.imageUrl;

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await onCommentSubmit(post._id, commentText);
    setCommentText('');
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, a, input');
    
    if (!isInteractive && clickable) {
      navigate(`/posts/${post._id}`);
    }
  };

  const displayedComments = showAllComments
    ? post.comments || []
    : [...(post.comments || [])].slice(-commentsToShow).reverse();

  return (
    <div 
      className={`bg-card dark:bg-card shadow-lg rounded-lg border border-border overflow-hidden ${clickable ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''}`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center">
          <img
            src={post.author?.photo?.url || '/default-avatar.png'}
            alt="Author"
            className="w-8 h-8 rounded-full mr-2 object-cover"
          />
          <Link
            to={`/members/${post.author?.username}`}
            className="font-semibold text-foreground text-sm hover:underline"
          >
            {post.author?.username || 'Unknown'}
          </Link>
        </div>
        {isAuthor && onDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 w-8 p-0 hover:bg-muted rounded-full flex items-center justify-center">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                asChild
                className="focus:bg-muted focus:text-destructive-foreground cursor-pointer"
              >
                <Link to={`/posts/edit/${post._id}`}>Edit Post</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(post._id)}
                className="focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
              >
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Image - Only show if post has an image */}
      {!isTextOnly && (
        <>
          <div className="relative w-full aspect-square">
            <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
          </div>
          {/* Caption for image posts - with username */}
          <div className="px-4 py-2">
            <p className="text-foreground text-left flex items-start text-sm">
              <Link 
                to={`/members/${post.author?.username}`} 
                className="font-bold mr-2 hover:underline flex-shrink-0"
              >
                {post.author?.username || 'Unknown'}
              </Link>
              <span className="flex-1 whitespace-pre-wrap break-words">{post.caption}</span>
            </p>
          </div>
        </>
      )}

      {/* Text-only posts - no username in caption, no border */}
      {isTextOnly && (
        <div className="px-4 py-4">
          <p className="text-foreground text-left text-base leading-relaxed whitespace-pre-wrap break-words">
            {post.caption}
          </p>
        </div>
      )}

      {/* Like, Comment, Share */}
      <div className={`px-3 py-2 ${!isTextOnly ? 'border-t border-border' : ''}`}>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onToggleLike(post._id)}
            className="flex items-center text-foreground hover:text-primary transition-colors"
          >
            {userId && post.likes?.includes(userId) ? (
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
            onClick={() => onShare(post._id)}
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className="px-3 pb-2 max-h-60 overflow-y-auto">
        {displayedComments.length > 0 ? (
          displayedComments.map((comment: any, index: number) => (
            <div
              key={comment._id || index}
              className="text-sm text-muted-foreground mb-2 flex items-start text-left"
            >
              <Link
                to={`/members/${comment.author?.username}`}
                className="font-bold mr-2 hover:underline flex-shrink-0"
              >
                {comment.author?.username || 'Unknown'}
              </Link>
              <span className="flex-1 break-words">{comment.text}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        )}
      </div>

      {/* Show More Comments Link */}
      {!showAllComments && post.comments && post.comments.length > commentsToShow && (
        <div className="px-3">
          <Link
            to={`/posts/${post._id}`}
            className="text-primary font-extralight text-sm hover:underline flex items-start text-left mb-3"
          >
            See all {post.comments.length} comments...
          </Link>
        </div>
      )}

      {/* Show More Button for Single Post View */}
      {showAllComments && 
       post.comments && 
       post.comments.length > commentsToShow && 
       onShowMoreComments && (
        <div className="px-3 pb-2">
          <button
            onClick={onShowMoreComments}
            className="text-primary font-extralight text-sm hover:underline flex items-start text-left mb-3"
          >
            Show more comments...
          </button>
        </div>
      )}

      {/* Comment Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleCommentSubmit(e);
              }
            }}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-foreground text-sm placeholder-muted-foreground outline-none"
          />
          <button 
            onClick={handleCommentSubmit}
            className="text-primary font-semibold text-sm hover:underline"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCardItem;