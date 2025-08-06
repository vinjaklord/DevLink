import { X } from 'lucide-react';
import useStore from '@/hooks/useStore';

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useStore();

  return (
    <div className="p-3 border-b border-border bg-card">
      <div className="flex items-center justify-between">
        {/* Left: Avatar + User Info */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden border border-border">
            <img
              src={selectedUser?.photo?.url || '/default-avatar.png'}
              alt={selectedUser?.firstName || 'User'}
              className="w-full h-full object-cover"
            />
          </div>

          {/* User Info */}
          <div className="text-left">
            <h3 className="text-sm font-semibold text-foreground">
              {selectedUser?.firstName} {selectedUser?.lastName}
            </h3>
            {/* Status placeholder */}
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => setSelectedUser(null)}
          className="p-1 rounded-full hover:bg-muted transition"
          aria-label="Close chat"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
