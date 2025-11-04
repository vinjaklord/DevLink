//React
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

//Hooks n Models
import useStore from '@/hooks/useStore';
import type { IMember } from '@/models/member.model';

export default function FriendsSidebar() {
  const { friends, friendsLoading, friendsError, fetchFriends, setSelectedUser } = useStore(
    (state) => state
  );

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const handleFriendClick = (friend: IMember) => {
    setSelectedUser(friend);
  };

  if (friendsLoading) {
    return (
      <div className="flex items-center justify-center h-full border-l border-[--sidebar-border]">
        <div className="text-center font-poppins text-[--muted-foreground]">Loading...</div>
      </div>
    );
  }

  if (friendsError) {
    return (
      <div className="flex items-center justify-center h-full border-l border-[--sidebar-border]">
        <div className="text-center font-poppins text-[--destructive]">Error: {friendsError}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-fit border-l border-[--sidebar-border] bg-[--background] fixed">
      <div className="p-4 border-b border-[--sidebar-border]">
        <h3 className="text-pretty font-poppins text-[--muted-foreground] tracking-wide">
          Chat with friends
        </h3>
      </div>
      {friends.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[--muted-foreground] font-poppins text-sm">No friends yet</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-y-auto ">
          <ul className="flex-1 p-2 space-y-1">
            {friends.map((friend) => (
              <li key={friend._id}>
                <Link
                  to="/messages"
                  onClick={() => handleFriendClick(friend)}
                  className="flex items-center gap-3 px-3 py-2.5 w-full text-left transition-colors duration-150 hover:bg-[#3a3b3c5f] rounded-lg group"
                >
                  <div className="flex-shrink-0">
                    <img
                      src={friend.photo?.url}
                      alt={`${friend.firstName} ${friend.lastName}`}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-[--accent]/20 group-hover:ring-[--accent]"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-sm font-poppins text-[--foreground] truncate">
                    {friend.firstName} {friend.lastName}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
