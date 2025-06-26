import { Dialog, DialogContent, DialogTitle, DialogHeader } from '../ui/dialog';

export default function AddPost({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        {/* Add form or content here */}
      </DialogContent>
    </Dialog>
  );
}
