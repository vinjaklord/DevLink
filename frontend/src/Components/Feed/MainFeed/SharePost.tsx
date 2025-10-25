import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import useStore from '@/hooks/useStore';

import { toast } from 'sonner';

export default function SharePost({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { setShowSharePost, memberRefreshMe, friends, showSharePost } = useStore((state) => state);

  const handleShare = async () => {
    setShowSharePost(false);
    console.log('share true');
    toast.success('Share request logic pending. Dialog closed!'); //
  };

  return (
    <Dialog open={showSharePost} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
        </DialogHeader>
        <div>
          {friends.map((friend) => (
            <button>{friend.firstName}</button>
          ))}
        </div>

        <DialogFooter>
          <Button
            onClick={() => {
              handleShare();
              memberRefreshMe();
            }}
          >
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
