import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';

import useStore from '@/hooks/useStore.ts';

function MemberProfile() {
  const { username } = useParams<{ username: string }>();
  const {
    memberPosts,
    fetchMemberPosts,
    loggedInMember,
    user,
    getMemberByUsername,
  } = useStore((state) => state);

  useEffect(() => {
    fetchMemberPosts(username);
    getMemberByUsername(username);
  }, [username, fetchMemberPosts, getMemberByUsername]);

  return (
    <div className="min-h-screen bg-background text-foreground pt-22">
      <div className="container max-w-4xl mx-auto space-y-6 px-4">
        {/* Header */}
        <div className="bg-card shadow rounded-xl p-6 text-center relative">
          {/* Profile Picture */}
          <div className="flex justify-center -mt-16">
            <img
              src={user?.photo?.url}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-background object-cover"
            />
          </div>

          {/* Name & Email */}
          <h1 className="mt-4 text-2xl font-semibold">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-muted-foreground text-sm">
            {`@${user?.username}`}
          </p>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
        </div>

        {/* Posts */}
        <div className="max-w-[37.5rem] min-h-[10rem] grid grid-cols-3 bg-card mx-auto px-4 py-4">
          {memberPosts?.length > 0 ? (
            [...memberPosts].reverse().map((post) => (
              <div
                key={post._id}
                className="relative w-full p-0.5 aspect-square"
              >
                <Link to={`/posts/${post._id}`}>
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-3 flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
              <ImageOff className="w-8 h-8 mb-2" />
              <p>No posts yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemberProfile;
