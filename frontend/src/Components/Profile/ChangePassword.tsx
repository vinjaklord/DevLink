import useStore from '@/hooks/useStore';
import useForm from '@/hooks/useForm';
import { KeyRound, Lock } from 'lucide-react';
import { toast } from 'sonner';

import type { PasswordData } from '@/models/member.model';

const ChangePassword = () => {
  const { loggedInMember, isUpdatingProfile, memberChangePassword, memberLogout } = useStore();

  const { formState, handleFormChange, previewImage } = useForm<PasswordData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChangePassword = async () => {
    if (!formState.oldPassword || !formState.newPassword || !formState.confirmPassword) {
      toast.warning('All password fields are required.');
      return;
    }

    if (formState.newPassword !== formState.confirmPassword) {
      toast.warning('Passwords do not match!');
      return;
    }
    const passwordData = {
      oldPassword: formState.oldPassword,
      newPassword: formState.newPassword,
      confirmPassword: formState.confirmPassword,
    };

    // Pass the simple object to the store action
    const response = await memberChangePassword(passwordData);

    if (!response) {
      toast.error('Error while editing!');
    }
  };

  return (
    <div className="h-screen ">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Change Password</h1>
          </div>

          {/* avatar upload section */}

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={previewImage || loggedInMember?.photo?.url}
                alt="Profile Picture? Where?"
                className="size-32 rounded-full object-cover border-4 "
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Old Password
              </div>

              <input
                type="password"
                name="oldPassword"
                value={formState.oldPassword}
                onChange={handleFormChange}
                className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                placeholder="Old Password"
              />
            </div>
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                New Password
              </div>

              <input
                type="password"
                name="newPassword"
                value={formState.newPassword}
                onChange={handleFormChange}
                className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                placeholder="New Password"
              />
            </div>
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                Confirm Password
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={formState.confirmPassword}
                onChange={handleFormChange}
                className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                placeholder="Confirm Password"
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
            onClick={() => {
              handleChangePassword();
              memberLogout();
            }}
            disabled={isUpdatingProfile}
            className="w-full  bg-primary text-white py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            Update Password and Log Out
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChangePassword;
