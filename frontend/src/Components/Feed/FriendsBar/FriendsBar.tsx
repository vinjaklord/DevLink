import useStore from '@/hooks/useStore';
import { useState, useEffect } from 'react';

export default function FriendsBar() {
  const { friends, friendsLoading, friendsError, fetchFriends } = useStore();

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  return (
    <div className="bg-[--sidebar] text-[--sidebar-foreground] p-2 fixed top-32 right-0 h-[calc(100vh-128px)] w-64 border-l border-[--sidebar-border] z-20">
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
        <div className="flex flex-col gap-1 overflow-y-auto h-full">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center p-1 font-poppins text-sm"
            >
              <span>
                {friend.firstName} {friend.lastName}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
