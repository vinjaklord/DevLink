import useStore from '@/hooks/useStore';
import type { IMember } from '@/models/member.model';
import { useEffect } from 'react';

export default function FriendsBar() {
  const { friends, friendsLoading, friendsError, fetchFriends } = useStore(
    (state) => state
  );

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  return (
    <div className="p-1 h-full border-l border-[--sidebar-border]">
      {friendsLoading ? (
        <div className="text-center font-poppins">Loading...</div>
      ) : friendsError ? (
        <div className="text-[--destructive] text-center font-poppins">
          Error: {friendsError}
        </div>
      ) : friends.length === 0 ? (
        <div className="text-[--muted-foreground] text-center font-poppins">
          No friends yet
        </div>
      ) : (
        <div className="flex flex-col overflow-y-auto h-full">
          {friends.map((friend) => (
            <button
              key={friend._id}
              className="flex items-center gap-2 px-3 py-2 w-full text-left transition-colors duration-150 hover:bg-[#3a3b3c5f] rounded-sm"
            >
              <img
                src={friend.photo?.url}
                alt={`${friend.firstName} ${friend.lastName}`}
                className="w-9 h-9 rounded-full object-cover"
              />
              <span className="text-sm font-poppins">
                {friend.firstName} {friend.lastName}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
