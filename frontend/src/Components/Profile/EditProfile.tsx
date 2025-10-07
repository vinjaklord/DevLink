import useStore from '@/hooks/useStore';
import { useState, useEffect } from 'react';
import useForm from '@/hooks/useForm';
import { Camera, Mail, User, AtSign } from 'lucide-react';
import { toast } from 'sonner';
import type { UserData } from '../SignUp/Signup';

const EditProfile = () => {
  const { loggedInMember, isUpdatingProfile, editProfile } = useStore();

  const { formState, handleFormChange, previewImage, updateFormField } = useForm<UserData>({
    username: loggedInMember?.username || '',
    password: '',
    confirmPassword: '',
    firstName: loggedInMember?.firstName || '',
    lastName: loggedInMember?.lastName || '',
    email: loggedInMember?.email || '',
    photo: null,
  });

  useEffect(() => {
    if (loggedInMember) {
      updateFormField('firstName', loggedInMember.firstName || '');
      updateFormField('lastName', loggedInMember.lastName || '');
      updateFormField('username', loggedInMember.username || '');
      updateFormField('email', loggedInMember.email || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInMember]);

  const handleEditProfile = async () => {
    if (formState.password !== formState.confirmPassword) {
      toast.warning('Passwords do not match!');
      return;
    }
    if (!formState.photo) {
      toast.warning('Please select a photo!');
      return;
    }

    const formData = new FormData();
    if (formState.username) formData.append('username', formState.username);
    if (formState.password) formData.append('password', formState.password);
    if (formState.confirmPassword) formData.append('confirmPassword', formState.confirmPassword);
    if (formState.email) formData.append('email', formState.email);
    if (formState.firstName) formData.append('firstName', formState.firstName);
    if (formState.lastName) formData.append('lastName', formState.lastName);
    if (formState.photo) formData.append('photo', formState.photo);

    const response = await editProfile(formData);

    if (response) {
      toast.success('Profile edited successfully!');
    } else {
      toast.error('Error while editing!');
    }
  };

  return (
    <div className="h-screen ">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Edit Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={previewImage || loggedInMember?.photo?.url}
                alt="Profile Picture? Where?"
                className="size-32 rounded-full object-cover border-4 "
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
                  type="file"
                  id="avatar-upload"
                  name="photo" // must match useForm logic
                  className="hidden"
                  accept="image/*"
                  disabled={isUpdatingProfile}
                  onChange={handleFormChange}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? 'Uploading...' : 'Click the camera icon to update your photo'}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                First Name
              </div>

              <input
                type="text"
                name="firstName"
                value={formState.firstName}
                onChange={handleFormChange}
                className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                placeholder="First Name"
              />
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Last Name
              </div>

              <input
                type="text"
                name="lastName"
                value={formState.lastName}
                onChange={handleFormChange}
                className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                placeholder="Last Name"
              />
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <AtSign className="w-4 h-4" />
                Username
              </div>

              <input
                type="text"
                name="username"
                value={formState.username}
                onChange={handleFormChange}
                className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                placeholder="Username"
              />
            </div>
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <input
                type="text"
                name="lastName"
                value={formState.email}
                onChange={handleFormChange}
                className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                placeholder="Email"
              />
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium  mb-4">Account Information</h2>
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
            onClick={handleEditProfile}
            disabled={isUpdatingProfile}
            className="w-full  bg-primary text-white py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
export default EditProfile;
