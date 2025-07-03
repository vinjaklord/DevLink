import useStore from '@/hooks/useStore';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const PostFeed = () => {
  const { allPosts, loading, error, fetchAllPosts } = useStore(
    (state) => state
  );

  useEffect(() => {
    fetchAllPosts();
  }, []);

  if (loading) return <p className="text-center">Loading ...</p>;
  if (error)
    return (
      <p className="text-red-500 text-center">An error has occured {error}</p>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {[...allPosts].reverse().map((post) => (
        <div key={post._id} className="bg-white dark:bg-gray-900 shadow border">
          <img src={post.imageUrl} alt="Post" className="w-full h-auto mb-4" />
          <h2 className="text-lg mb-2">{post.caption}</h2>

          <p className="mb-1">{post.comments?.length || 0} Comments</p>

          <Link
            to={`/posts/${post._id}`}
            className="text-blue-500 text-sm hover:underline"
          >
            View Post
          </Link>
        </div>
      ))}
    </div>
  );
};

export { PostFeed };
