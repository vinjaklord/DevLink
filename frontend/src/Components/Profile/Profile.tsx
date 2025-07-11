import { Link } from 'react-router-dom';
import ProfileHeader from './ProfileHeader';
import { useEffect } from 'react';

import useStore from '@/hooks/useStore.ts';

function Profile() {
  const { myPosts, fetchMyPosts } = useStore((state) => state);

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  return (
    <div className="min-h-screen bg-background text-foreground pt-22">
      <div className="container max-w-4xl mx-auto space-y-6 px-4">
        {/* Header */}
        <ProfileHeader />

        {/* Posts */}
        <div className=" max-w-[37.5rem] grid grid-cols-3 bg-card mx-auto space-y-4 px-4 py-4 ">
          {[...myPosts].reverse().map((post) => (
            <div className="relative w-full p-0.5 aspect-square">
              <Link to={`/posts/${post._id}`}>
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="w-full h-full object-cover"
                />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;
