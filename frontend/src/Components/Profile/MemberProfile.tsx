import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ImageOff, UserMinus, UserPlus, UserCheck } from 'lucide-react';

import useStore from '@/hooks/useStore.ts';

function MemberProfile() {
  const { username } = useParams<{ username: string }>();
  const {
    memberPosts,
    fetchMemberPosts,
    user,
    getMemberByUsername,
    friends,
    fetchFriends,
    deleteFriend,
    addFriend,
  } = useStore((state) => state);

  const [friendState, setFriendState] = useState('');

  useEffect(() => {
    fetchMemberPosts(username);
    getMemberByUsername(username);
    fetchFriends();
    friends;
  }, [username, fetchMemberPosts, getMemberByUsername, fetchFriends, friends]);

  const isFriend = friends.some((friend) => friend._id === user._id);

  const handleFriendAction = async () => {
    try {
      if (isFriend) {
        await deleteFriend(user._id);
        setFriendState(''); // Or another appropriate state
        console.log('Friend deleted!');
      } else {
        // Set state to 'pending' right before the API call

        setFriendState('pending');
        // Wait for the asynchronous API call to finish
        await addFriend(user._id);

        console.log('Request Sent');
      }
    } catch (error) {
      // Handle errors, maybe set an 'error' state
      console.error('An error occurred:', error);
      setFriendState('');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-22">
      <div className="container max-w-4xl mx-auto space-y-6 px-4">
        {/* Header */}
        <div className="bg-card shadow rounded-xl p-6 text-center relative">
          <button
            onClick={handleFriendAction}
            className={`absolute top-4 right-4 flex items-center gap-2 font-semibold text-sm transition-colors duration-200 ease-in-out ${
              !isFriend
                ? friendState === 'pending'
                  ? 'bg-green-800 text-white hover:bg-green-700'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-red-500 text-white hover:bg-red-600'
            } px-4 py-2 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50`}
          >
            {!isFriend ? (
              friendState === 'pending' ? (
                <>
                  <UserCheck size={16} /> Request Sent
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Add Friend
                </>
              )
            ) : (
              <>
                <UserMinus size={16} /> Remove Friend
              </>
            )}
          </button>
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
