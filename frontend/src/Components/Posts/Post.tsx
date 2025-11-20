import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useStore from '@/hooks/useStore';
import PostCardItem from './PostCardItem/PostCardItem';

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

  const [commentsToShow, setCommentsToShow] = useState(10);

  useEffect(() => {
    if (id) fetchPostById(id);
  }, [id, fetchPostById]);

  const handleCommentSubmit = async (postId: string, text: string) => {
    try {
      await addComment(postId, { text });
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await deletePost(postId);
      navigate(-1);
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleShare = (postId: string) => {
    setSharePostId(postId);
    setShowSharePost(true);
  };

  const handleShowMore = () => {
    setCommentsToShow((prevCount) => prevCount + 10);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );

  if (error)
    return <p className="text-destructive mt-10 text-center">An error has occurred: {error}</p>;

  if (!currentPost) return <p className="text-destructive text-center">Post Not Found</p>;

  return (
    <div className="max-w-[37.5rem] mx-auto space-y-6 px-4 mt-7">
      <PostCardItem
        post={currentPost}
        loggedInMember={loggedInMember}
        onToggleLike={toggleLike}
        onCommentSubmit={handleCommentSubmit}
        onDelete={handleDelete}
        onShare={handleShare}
        showAllComments={true}
        commentsToShow={commentsToShow}
        onShowMoreComments={handleShowMore}
      />
    </div>
  );
};

export { Post };