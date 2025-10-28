import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import ImageUploader from '../../constant/ImageUploader';
import useForm from '@/hooks/useForm';
import useStore from '@/hooks/useStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type PostData = {
  caption: string;
  photo: unknown;
};

export default function AddPost({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { uploadPost, setShowAddPost, memberRefreshMe } = useStore((state) => state);
  const { formState, handleFormChange } = useForm<PostData>({
    caption: '',
    photo: null,
  });
  const navigate = useNavigate();

  const handlePosting = async () => {
    if (!formState.photo) {
      toast.warning('Please select a photo!');
      return;
    }

    const formData = new FormData();
    formData.append('photo', formState.photo);
    formData.append('caption', formState.caption);

    const response = await uploadPost(formData);

    if (response) {
      navigate('/');
      setShowAddPost(false);
      toast.success('Successfully posted!');
    } else {
      toast.error('Error while posting!');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col bg-card/80 backdrop-blur-sm border-border/50 shadow-2xl rounded-2xl">
        <DialogHeader className="border-b border-border/20 pb-4">
          <DialogTitle className="text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Create Post
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm mt-1"></DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-center items-center p-4">
            <ImageUploader handleFormChange={handleFormChange} photo={formState.photo} />
          </div>
          <div className="p-4 flex-1">
            <Input
              id="caption"
              name="caption"
              value={formState.caption}
              placeholder="Caption goes here..."
              onChange={handleFormChange}
              className="bg-background/50 border border-border/50 rounded-xl outline-none text-sm"
            />
          </div>
        </div>
        <DialogFooter className="pt-4 border-t border-border/20">
          <div className="w-full flex items-center justify-between">
            <div className="text-sm text-muted-foreground"></div>
            <Button
              onClick={() => {
                handlePosting();
                memberRefreshMe();
              }}
              className="ml-auto bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/20 transition-all duration-300 px-6"
            >
              Post!
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
