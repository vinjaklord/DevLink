import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Input,
  Button,
} from '@/Components/ui';
import { useState } from 'react';
import useForm from '../../hooks/useForm';
import useStore from '../../hooks/useStore';
import { useSearchParams } from 'react-router-dom';

type UserData = {
  password: string;
};

export function SetNewPassword() {
  const { memberSetNewPassword } = useStore((state) => state);
  const [emailSent, setEmailSent] = useState(false);
  const { formState, handleFormChange } = useForm<UserData>({ password: '' });
  const [searchParams] = useSearchParams();

  const token = searchParams.get('t');

  const handleSetNewPassword = async () => {
    // A crucial debugging step:
    console.log('Token extracted from URL:', token);

    // This is the call on line 37 that ultimately leads to memberSetNewPassword
    if (token) {
      await memberSetNewPassword({
        password: formState.password,
        t: token, // Pass the actual token string
      });
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh] relative overflow-hidden pt-5">
      {!emailSent ? (
        <>
          <div className="bg-secondary w-[85%] h-[280px] rounded-md flex items-center justify-between px-12">
            <div className="max-w-md">
              <h2 className="text-2xl font-semibold mb-3">Set your new password!</h2>
              <p className="text-sm mb-8 leading-relaxed">
                Don't worry, you won't lose your account now!
              </p>
            </div>
          </div>

          <Card className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[450px] shadow-xl rounded-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg tracking-wide">Enter new password</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="password" className="text-sm text-gray-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    value={formState.password}
                    onChange={handleFormChange}
                    placeholder="Enter your password"
                    className="border-gray-300 focus-visible:ring-red-300"
                  />
                </div>

                <Button
                  onClick={async () => {
                    setEmailSent(true); // always show success UI
                    try {
                      await handleSetNewPassword(); // still perform request
                    } catch (err) {
                      console.error(err); // never expose error to user
                    }
                  }}
                  className="uppercase tracking-wide w-full"
                >
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Password changed!</h2>
          <p className="text-sm text-gray-600">Log in with your new password!</p>
        </div>
      )}
    </div>
  );
}
