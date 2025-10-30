import { Link, useParams } from 'react-router-dom';
import { useEffect, useLayoutEffect, useState } from 'react';
import { ImageOff, UserMinus, UserPlus, UserCheck, UserX } from 'lucide-react';
import { Loader2 } from 'lucide-react'; // Assuming you have this for a spinner; add if needed

import useStore from '@/hooks/useStore.ts';

function MemberProfile() {
  const { username } = useParams<{ username: string }>();
  const {
    memberPosts,
    fetchMemberPosts,
    user,
    getMemberByUsername,
    friends,
    pending,
    fetchFriends,
    fetchPending,
    deleteFriend,
    addFriend,
    loggedInMember,
    acceptFriendRequest,
    rejectFriendRequest,
    fetchRelationshipStatus,
    fetchMyPosts,
    relationshipStatus,
    clearProfileData, // Add this to your store extraction
  } = useStore((state) => state);

  const [isAddingFriend, setIsAddingFriend] = useState(false); // Optimistic UI state
  const [profileLoading, setProfileLoading] = useState(false);

  // Load global data once on mount
  useEffect(() => {
    fetchFriends();
    fetchPending();
    fetchMyPosts();
  }, [fetchFriends, fetchPending, fetchMyPosts]);

  // Handle profile load with useLayoutEffect for sync clear/loading to prevent flash
  useLayoutEffect(() => {
    if (!username) return;

    setProfileLoading(true);
    clearProfileData();

    // Kick off async load (non-blocking for layout)
    (async () => {
      try {
        const [_, userRes] = await Promise.all([
          fetchMemberPosts(username),
          getMemberByUsername(username),
        ]);

        if (userRes?._id) {
          await fetchRelationshipStatus(userRes._id);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Optionally handle error state here
      } finally {
        setProfileLoading(false);
      }
    })().catch(console.error);
  }, [username, clearProfileData, fetchMemberPosts, getMemberByUsername, fetchRelationshipStatus]);

  const isFriend = user?._id ? friends.some((friend) => friend._id === user._id) : false;
  const isPending = user?._id ? pending.some((pending) => pending._id === user._id) : false;
  const isMe = loggedInMember?._id && user?._id ? loggedInMember._id === user._id : false;

  if (profileLoading || !user) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-22 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-22">
      <div className="container max-w-4xl mx-auto space-y-6 px-4">
        {/* Header */}
        <div className="bg-card shadow-md rounded-xl p-6 text-center relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {isMe ? (
              <div className="mt-4">
                <Link
                  to="/edit-profile"
                  className="inline-block bg-muted text-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-muted/80 transition"
                >
                  Edit Profile
                </Link>
              </div>
            ) : isPending ? (
              <>
                <button
                  onClick={async () => {
                    await acceptFriendRequest(user._id);
                    fetchFriends();
                    fetchPending();
                  }}
                  className="bg-green-500 text-white hover:bg-green-600 flex items-center gap-2 px-4 py-2 rounded-full shadow-md transition-colors"
                >
                  <UserPlus size={16} /> Accept
                </button>
                <button
                  onClick={async () => {
                    await rejectFriendRequest(user._id);
                    fetchFriends();
                    fetchPending();
                  }}
                  className="bg-red-500 text-white hover:bg-red-600 flex items-center gap-2 px-4 py-2 rounded-full shadow-md transition-colors"
                >
                  <UserX size={16} /> Reject
                </button>
              </>
            ) : isFriend ? (
              <button
                onClick={async () => {
                  await deleteFriend(user._id);
                  fetchFriends();
                  fetchPending();
                }}
                className="bg-red-500 text-white hover:bg-red-600 flex items-center gap-2 font-semibold px-4 py-2 rounded-full shadow-md transition-colors"
              >
                <UserMinus size={16} /> Remove Friend
              </button>
            ) : isAddingFriend || relationshipStatus === 'pending' ? (
              <button className="bg-green-800 text-white hover:bg-green-700 flex items-center gap-2 font-semibold px-4 py-2 rounded-full shadow-md">
                <UserCheck size={16} /> Request Sent
              </button>
            ) : (
              <button
                onClick={async () => {
                  setIsAddingFriend(true); // Optimistic UI update
                  await addFriend(user._id);
                  setIsAddingFriend(false); // Reset after API call
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 font-semibold px-4 py-2 rounded-full shadow-md transition-colors"
              >
                <UserPlus size={16} /> Add Friend
              </button>
            )}
          </div>
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
          <p className="text-muted-foreground text-sm">{`@${user?.username}`}</p>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
        </div>

        {/* Posts */}
        <div className="max-w-[37.5rem] min-h-[10rem] rounded-xl grid grid-cols-3 shadow-md bg-card mx-auto px-4 py-4">
          {memberPosts?.length > 0 ? (
            [...memberPosts].reverse().map((post) => (
              <div key={post._id} className="relative w-full p-0.5 aspect-square">
                <Link to={`/posts/${post._id}`}>
                  <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
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
