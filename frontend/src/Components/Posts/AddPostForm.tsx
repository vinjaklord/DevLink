// Components/AddPostForm.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image, X } from 'lucide-react';

import { useStore } from '@/hooks';
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
  Textarea,
  Button,
} from '@/Components/ui';

const AddPostSchema = z.object({
  caption: z.string().min(1, 'Caption is required'),
  photo: z.any().optional(),
});

type AddPostData = z.infer<typeof AddPostSchema>;

export default function AddPostForm({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { uploadPost, setShowAddPost, memberRefreshMe } = useStore((state) => state);
  const navigate = useNavigate();
  const [isPosting, setIsPosting] = useState(false);
  const [captionText, setCaptionText] = useState('');

  const form = useForm<AddPostData>({
    resolver: zodResolver(AddPostSchema),
    defaultValues: {
      caption: '',
      photo: null,
    },
  });

  const handlePosting = form.handleSubmit(async (values) => {
    setIsPosting(true);
    onClose();

    try {
      const formData = new FormData();
      if (values.photo) formData.append('photo', values.photo);
      formData.append('caption', values.caption || '');

      const response = await uploadPost(formData);

      if (response) {
        navigate('/');
        setShowAddPost(false);
        memberRefreshMe();
        toast.success('Successfully posted!');
        form.reset();
        setCaptionText('');
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

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCaptionText(value);
    form.setValue('caption', value, { shouldValidate: true });
  };

  const handleCaptionPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');

    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = captionText.slice(0, start) + pastedText + captionText.slice(end);

    setCaptionText(newValue);
    form.setValue('caption', newValue, { shouldValidate: true });

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + pastedText.length;
    }, 0);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files[0]) {
      form.setValue('photo', files[0], { shouldValidate: true });
    }
  };

  const handleRemoveImage = () => {
    form.setValue('photo', null, { shouldValidate: true });
  };

  const photoValue = form.watch('photo');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col bg-card/80 backdrop-blur-sm border-border/50 shadow-2xl rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="border-b border-border/20 pb-4 px-6 pt-6">
          <DialogTitle className="text-2xl font-semibold">Create Post</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm mt-1">
            Share your moment with the community
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handlePosting} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex overflow-hidden">
              <div className="flex flex-col overflow-y-auto px-6 py-4 space-y-4 w-full">
                {/* Caption */}
                <FormField
                  control={form.control}
                  name="caption"
                  render={() => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Textarea
                          id="caption"
                          placeholder="What's on your mind?"
                          disabled={isPosting}
                          value={captionText}
                          onChange={handleCaptionChange}
                          onPaste={handleCaptionPaste}
                          className="w-full min-h-[280px] max-h-[400px] resize-none px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 rounded-xl"
                        />
                      </FormControl>
                      {form.formState.errors.caption && (
                        <FormMessage className="text-xs mt-2 text-red-500">
                          {form.formState.errors.caption.message}
                        </FormMessage>
                      )}
                    </FormItem>
                  )}
                />

                {/* Image Uploader */}
                <FormField
                  control={form.control}
                  name="photo"
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <div className="relative group">
                          {photoValue ? (
                            <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border/50 bg-background/50">
                              <img
                                src={
                                  typeof photoValue === 'string'
                                    ? photoValue
                                    : URL.createObjectURL(photoValue)
                                }
                                alt="Upload preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 rounded-full transition-all"
                              >
                                <X className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                              <Image className="w-8 h-8 text-muted-foreground mb-2" />
                              <span className="text-xs text-muted-foreground">
                                Click to upload image
                              </span>
                              <span className="text-xs text-muted-foreground/60 mt-1">
                                (optional)
                              </span>
                              <input
                                type="file"
                                name="photo"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFormChange}
                              />
                            </label>
                          )}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="pt-4 pb-6 px-6 border-t border-border/20 flex justify-end gap-2">
              <Button
                type="button"
                onClick={onClose}
                disabled={isPosting}
                className="px-4 py-2 bg-background hover:bg-background/80 text-foreground border border-border/50 rounded-lg transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPosting || !captionText.trim()}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/20 transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPosting ? 'Posting...' : 'Post!'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
