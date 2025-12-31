// Components/PostCardItem.tsx
import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Send, MoreVertical, Code2, Copy, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/Components/ui';
import { useCodeDetection } from '@/hooks';

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
  clickable?: boolean;
}

// Utility to decode HTML entities
const decodeHTMLEntities = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

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
  clickable = false,
}: PostCardProps) => {
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const isAuthor = loggedInMember?._id === post?.author?._id;
  const userId = loggedInMember?._id;
  const isTextOnly = !post.imageUrl;

  const decodedCaption = useMemo(() => {
    return post.caption ? decodeHTMLEntities(post.caption) : '';
  }, [post.caption]);


  const { isCode, segments } = useCodeDetection(decodedCaption, {
    minMatches: 2,
    minLength: 10,
  });

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await onCommentSubmit(post._id, commentText);
    setCommentText('');
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, a, input');

    if (!isInteractive && clickable) {
      navigate(`/posts/${post._id}`);
    }
  };

  const handleCopyCode = async (textToCopy?: string) => {
    const copyText = textToCopy || decodedCaption;
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayedComments = showAllComments
    ? post.comments || []
    : [...(post.comments || [])].slice(-commentsToShow).reverse();

  // Render caption with SMART SEGMENTATION
  const renderCaption = () => {
    if (!decodedCaption) return null;

    if (isCode && segments.length > 1) {
      return (
        <div className="space-y-3">
          {segments.map((segment, index) => {
            if (segment.type === 'code' && segment.content.trim()) {
              return (
                <div
                  key={index}
                  className="relative bg-slate-950 border-2 border-blue-500/30 rounded-lg p-4 "
                >
                  {index === 0 && (
                    <div className="absolute top-2 right-2 flex items-center gap-2 z-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCode(segment.content);
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md transition-colors"
                        title="Copy code"
                      >
                        {copied ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400" />
                        )}
                      </button>
                    </div>
                  )}
                  <pre className="font-mono text-sm text-slate-100 whitespace-pre-wrap break-words overflow-x-auto text-left pt-8">
                    <code>{segment.content}</code>
                  </pre>
                </div>
              );
            } else if (segment.content.trim()) {
              return (
                <p
                  key={index}
                  className="text-foreground text-left text-sm leading-relaxed whitespace-pre-wrap break-words"
                >
                  {segment.content}
                </p>
              );
            }
            return null;
          })}
        </div>
      );
    }

    if (isCode) {
      return (
        <div className="relative bg-slate-950 border-2 border-blue-500/30 rounded-lg p-4 ">
          <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
            <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 px-2 py-1 rounded-md">
              <Code2 className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-blue-400 font-medium">Code</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopyCode();
              }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md transition-colors"
              title="Copy code"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3 text-slate-400" />
              )}
            </button>
          </div>

          <pre className="font-mono text-sm text-slate-100 whitespace-pre-wrap break-words overflow-x-auto pr-20 text-left">
            <code>{decodedCaption}</code>
          </pre>
        </div>
      );
    }

    return (
      <p className="text-foreground text-left text-sm leading-relaxed whitespace-pre-wrap break-words">
        {decodedCaption}
      </p>
    );
  };

  return (
    <div
      className={`bg-card dark:bg-card  rounded-lg border border-border overflow-hidden ${
        clickable ? 'cursor-pointer hover:shadow-sm transition-shadow' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center">
          <img
            src={`${post?.author?.photo?.url}?tr=w-128,h-128,cm-round,cq-95,sh-20,q-95,f-auto`}
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

      {!isTextOnly && (
        <>
          <div className="relative w-full aspect-square">
            <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
          </div>

          <div className={`px-3 py-2 border-t border-border`}>
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

          <div className="px-3 py-2">
            <div className="flex items-center text-sm space-x-2">
              <Link
                to={`/members/${post.author?.username}`}
                className="font-bold text-foreground flex-shrink-0"
              >
                {post.author?.username || 'Unknown'}
              </Link>
              <div className="flex-1">{renderCaption()}</div>
            </div>
          </div>
        </>
      )}

      {isTextOnly && (
        <>
          <div className="px-3 py-4">{renderCaption()}</div>

          <div className={`px-3 py-2 border-t border-border`}>
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
        </>
      )}

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
