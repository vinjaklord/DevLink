import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
  Button,
} from '@/Components/ui';
import { Search } from 'lucide-react';
import useStore from '@/hooks/useStore';
import { toast } from 'sonner';
import { useState } from 'react';

export default function SharePost({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    setShowSharePost,
    memberRefreshMe,
    friends,
    showSharePost,
    sharePost,
    sharePostId,
    setSharePostId,
  } = useStore((state) => state);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  const filteredFriends = friends.filter((friend) =>
    `${friend.firstName} ${friend.lastName} ${friend.username}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const toggleFriend = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    );
  };

  const handleShare = async () => {
    if (selectedFriends.length === 0) {
      toast.error('Please select at least one friend to share with.');
      return;
    }

    if (!sharePostId) {
      toast.error('Error: The post link is missing.');
      setShowSharePost(false);
      setSelectedFriends([]);
      return;
    }
    sharePost(selectedFriends, sharePostId);
    setShowSharePost(false);
    setSelectedFriends([]);
    setSharePostId(null);
    memberRefreshMe();
  };

  return (
    <Dialog
      open={showSharePost}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setSelectedFriends([]);
          setSharePostId(null);
          setSearchQuery('');
        }
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col bg-card/80 backdrop-blur-sm border-border/50 shadow-2xl rounded-2xl">
        <DialogHeader className="border-b border-border/20 pb-4">
          <DialogTitle className="text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Share Post
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm mt-1">
            Select friends to share with:
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background/50 border border-border/50 rounded-xl  outline-none text-sm"
              />
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-4 gap-4">
              {filteredFriends.map((friend) => {
                const isSelected = selectedFriends.includes(friend._id);
                return (
                  <button
                    key={friend._id}
                    onClick={() => toggleFriend(friend._id)}
                    className={`
                      relative flex flex-col items-center p-3 rounded-xl group
                      w-full min-h-[140px] overflow-hidden
                      ${
                        isSelected
                          ? 'border-2 border-primary bg-primary/10 shadow-lg shadow-primary/20 ring-2 ring-primary/30'
                          : 'border-0 hover:border-2 hover:border-accent/50 hover:bg-accent/10 hover:shadow-md hover:shadow-accent/10'
                      }
                      
                    `}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 rounded-lg opacity-0" />
                    )}
                    <div className="relative z-10 flex flex-col items-center justify-center flex-1">
                      <div className="relative mb-2">
                        <img
                          src={friend?.photo?.url}
                          alt={`${friend.firstName} ${friend.lastName}`}
                          className="w-14 h-14 rounded-full object-cover border-2 border-background shadow-md group-hover:scale-105 transition-transform duration-300"
                        />
                        {isSelected && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-card flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                      <div className="text-center space-y-0.5">
                        <div className="font-semibold text-xs text-foreground max-w-full">
                          {friend.username}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredFriends.length === 0 && (
                <div className="col-span-4 text-center py-8 text-muted-foreground">
                  No friends found matching your search.
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="pt-4 border-t border-border/20">
          <div className="w-full flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{selectedFriends.length} selected</div>
            <Button
              onClick={() => {
                handleShare();
                setSelectedFriends([]);
              }}
              className="ml-auto bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/20 transition-all duration-300 px-6"
              disabled={selectedFriends.length === 0}
            >
              Share with {selectedFriends.length > 0 ? selectedFriends.length : 'Friends'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
