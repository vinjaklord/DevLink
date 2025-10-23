import { useEffect } from 'react';
import useStore from '@/hooks/useStore';
import SidebarSkeleton from './SidebarLoading';
import { Users } from 'lucide-react';
import { formatSidebarMessage } from '@/utils/messageFormat';

const Sidebar = () => {
  const { friends, fetchFriends, selectedUser, setSelectedUser, isUsersLoading } = useStore();

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {friends.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
               transition-colors rounded-l-xl hover:bg-[#3a3b3c5f]
              ${selectedUser?._id === user._id ? 'bg-gray-300 dark:bg-[oklch(0.22_0.015_285)]' : ''}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.photo?.url}
                alt={user.firstName[0]}
                className="size-12 object-cover rounded-full"
              />
            </div>

            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{`${user.firstName} ${user.lastName}`}</div>
              <div className="text-sm text-zinc-400">
                {formatSidebarMessage(user.lastMessage?.text)}
              </div>
            </div>
          </button>
        ))}

        {friends.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
