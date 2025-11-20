//React
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

//Hooks
import { useStore } from '@/hooks';

//3rd lib
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

//Components
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  Input,
  Button,
} from '@/Components/ui';
import ImageUploader from '../../constant/ImageUploader';

const AddPostSchema = z.object({
  caption: z.string().min(1, "Description is required"),
  photo: z.any().optional()
});

type AddPostData = z.infer<typeof AddPostSchema>;

export default function AddPostForm({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { uploadPost, setShowAddPost, memberRefreshMe } = useStore((state) => state);
  const navigate = useNavigate();
  const [isPosting, setIsPosting] = useState(false);

  const form = useForm<AddPostData>({
    resolver: zodResolver(AddPostSchema),
    defaultValues: {
      caption: '',
      photo: null,
    },
  });

  const handlePosting = form.handleSubmit(async (values) => {
    setIsPosting(true);
    onClose(); // Close dialog immediately to prevent multiple clicks

    try {
      const formData = new FormData();
      formData.append('photo', values.photo);
      formData.append('caption', values.caption || '');

      const response = await uploadPost(formData);

      if (response) {
        navigate('/');
        setShowAddPost(false);
        memberRefreshMe();
        toast.success('Successfully posted!');
        form.reset(); // Reset form after successful post
      } else {
        toast.error('Error while posting!');
      }
    } catch (error) {
      console.error('Error posting:', error);
      toast.error('Error while posting!');
    } finally {
      setIsPosting(false);
    }
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    
    if (name === 'photo' && files && files[0]) {
      form.setValue('photo', files[0], { shouldValidate: true });
    } else {
      form.setValue(name as keyof AddPostData, value, { shouldValidate: true });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col bg-card/80 backdrop-blur-sm border-border/50 shadow-2xl rounded-2xl">
        <DialogHeader className="border-b border-border/20 pb-4">
          <DialogTitle className="text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Create Post
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm mt-1">
            Share your moment with the community
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handlePosting} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Image Uploader */}
              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem className="flex justify-center items-center p-4">
                    <FormControl>
                      <ImageUploader
                        handleFormChange={handleFormChange}
                        photo={field.value}
                      />
                    </FormControl>
                    {form.formState.errors.photo && (
                      <FormMessage className="text-xs mt-2 text-center" />
                    )}
                  </FormItem>
                )}
              />

              {/* Caption Input */}
              <FormField
                control={form.control}
                name="caption"
                render={({ field }) => (
                  <FormItem className="p-4 flex-1">
                    <FormControl>
                      <Input
                        id="caption"
                        placeholder="Caption goes here..."
                        disabled={isPosting}
                        className="bg-background/50 border border-border/50 rounded-xl outline-none text-sm"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4 border-t border-border/20">
              <div className="w-full flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {form.formState.errors.root && (
                    <span className="text-red-500">
                      {form.formState.errors.root.message}
                    </span>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isPosting}
                  className="ml-auto bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/20 transition-all duration-300 px-6"
                >
                  {isPosting ? 'Posting...' : 'Post!'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}