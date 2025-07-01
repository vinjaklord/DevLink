import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
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

export default function AddPost({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { uploadPost, setShowAddPost } = useStore((state) => state);
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center items-center">
          <ImageUploader
            handleFormChange={handleFormChange}
            photo={formState.photo}
          />
        </div>
        <Input
          id="caption"
          name="caption"
          value={formState.caption}
          placeholder="Caption goes here..."
          onChange={handleFormChange}
        ></Input>
        <DialogFooter>
          <Button
            onClick={() => {
              handlePosting();
            }}
          >
            Post!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
