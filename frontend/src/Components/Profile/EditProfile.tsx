//React
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

//Hooks
import useStore from '@/hooks/useStore';

//3rd lib
import { Camera, Mail, User, AtSign } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

//UI
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  Input,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui';

const EditProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email'),
  photo: z.any().optional(),
});

type EditProfileData = z.infer<typeof EditProfileSchema>;

const EditProfile = () => {
  const { loggedInMember, isUpdatingProfile, editProfile, deleteMember } = useStore();
  const [showDelete, setShowDelete] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const imageSrc = previewImage
    ? previewImage
    : `${loggedInMember?.photo?.url}?tr=w-128,h-128,cm-round,cq-95,sh-10,q-95,f-auto}`;

  const form = useForm<EditProfileData>({
    resolver: zodResolver(EditProfileSchema),
    defaultValues: {
      firstName: loggedInMember?.firstName || '',
      lastName: loggedInMember?.lastName || '',
      username: loggedInMember?.username || '',
      email: loggedInMember?.email || '',
      photo: null,
    },
  });

  const { setValue } = form;

  useEffect(() => {
    if (!loggedInMember) return;
    setValue('firstName', loggedInMember.firstName || '');
    setValue('lastName', loggedInMember.lastName || '');
    setValue('username', loggedInMember.username || '');
    setValue('email', loggedInMember.email || '');
  }, [loggedInMember, setValue]);

  const handlePhotoChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(
        `File is too large! Maximum size is 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(
          2
        )}MB`
      );
      // Clear the file input
      e.target.value = '';
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, GIF, etc.)');
      e.target.value = '';
      return;
    }

    setValue('photo', file);

    const reader = new FileReader();
    reader.onload = () => setPreviewImage(reader.result as string);
    reader.onerror = () => {
      toast.error('Failed to read the image file');
    };
    reader.readAsDataURL(file);
  };

  // Submit - Only send fields that should be updated
  const onSubmit = form.handleSubmit(async (values) => {
    const formData = new FormData();

    // Append text fields
    if (values.firstName) formData.append('firstName', values.firstName);
    if (values.lastName) formData.append('lastName', values.lastName);
    if (values.username) formData.append('username', values.username);
    if (values.email) formData.append('email', values.email);

    if (values.photo && values.photo instanceof File) {
      formData.append('photo', values.photo);
    }

    const response = await editProfile(formData);

    if (response) {
      toast.success('Profile edited successfully!');

      setPreviewImage(null);
    } else {
      toast.error('Error while editing!');
    }
  });

  const handleConfirmDelete = async () => {
    try {
      await deleteMember(loggedInMember?._id);
      toast.success('Profile deleted successfully! Logging out!');
    } catch (err) {
      console.error('Delete error (but proceeding with logout):', err);
      toast.error('Profile deleted, but logout failed—please refresh.');
    } finally {
      setShowDelete(false);
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Edit Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={imageSrc}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />

              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? 'animate-pulse pointer-events-none' : ''}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUpdatingProfile}
                  onChange={handlePhotoChange}
                />
              </label>
            </div>

            <p className="text-sm text-zinc-400">
              {isUpdatingProfile
                ? 'Uploading...'
                : 'Click the camera icon to update your photo (Max 5MB)'}
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form className="space-y-6" onSubmit={onSubmit}>
              {/* First Name */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4" /> First Name
                    </FormLabel>
                    <FormControl>
                      <Input className="bg-base-200" placeholder="First Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4" /> Last Name
                    </FormLabel>
                    <FormControl>
                      <Input className="bg-base-200" placeholder="Last Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <AtSign className="w-4 h-4" /> Username
                    </FormLabel>
                    <FormControl>
                      <Input className="bg-base-200" placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email Address
                    </FormLabel>
                    <FormControl>
                      <Input className="bg-base-200" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Save button */}
              <Button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                Save Changes
              </Button>
            </form>
          </Form>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{loggedInMember?.createdAt?.split('T')[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowDelete(true)}
            disabled={isUpdatingProfile}
            className="w-full py-2 rounded-lg 
               border border-red-700 
               text-red-700 
               bg-transparent
               hover:bg-red-700
               hover:border-red-700 
               hover:text-white
               disabled:opacity-50"
          >
            Delete Profile
          </button>
        </div>
      </div>

      {showDelete && (
        <Dialog open={showDelete} onOpenChange={setShowDelete}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Delete Profile</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete your profile? This action cannot be undone and will
                remove all your posts, friends, and data.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <p className="text-sm text-destructive">Username: @{loggedInMember?.username}</p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => setShowDelete(false)}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                className=" 
               border border-red-700 
               text-red-700 
               bg-transparent
               hover:bg-red-700
               hover:border-red-700 
               hover:text-white
               disabled:opacity-50"
                onClick={handleConfirmDelete}
                disabled={isUpdatingProfile}
              >
                Delete Profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default EditProfile;
