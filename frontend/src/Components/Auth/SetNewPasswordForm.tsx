//React
import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';

//Hooks
import { useStore } from '@/hooks';
import { useEnter } from '@/hooks';

//3rd lib
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
  Input,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/Components/ui';

const SetNewPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SetNewPasswordData = z.infer<typeof SetNewPasswordSchema>;

export function SetNewPasswordForm() {
  const { memberSetNewPassword } = useStore((state) => state);
  const [emailSent, setEmailSent] = useState(false);
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get('t');

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

  const form = useForm<SetNewPasswordData>({
    resolver: zodResolver(SetNewPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const { setError } = form;

  const handleSetNewPassword = form.handleSubmit(async (values) => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }

    try {
      const response = await memberSetNewPassword({
        password: values.password,
        t: token,
      });

      if (response) {
        toast.success('Password changed successfully!');
        setEmailSent(true);
      }
    } catch (error) {
      const { alert } = useStore.getState();
      
      setError('root', {
        type: 'manual',
        message: alert?.description || 'Failed to change password',
      });
    }
  });

  useEnter(handleSetNewPassword);

  return (
    <div className="flex justify-center items-center h-[80vh] relative overflow-hidden pt-5">
      {!emailSent ? (
        <>
          {/* Background horizontal box */}
          <div className="signup-background-box bg-secondary w-[85%] h-[280px] rounded-md flex items-center justify-end px-12 overflow-hidden">
            <div className="max-w-md">
              <h2 className="text-2xl font-semibold mb-3">
                Set your new password!
              </h2>
              <p className="text-sm mb-8 leading-relaxed">
                Don't worry, you won't lose your account now!
              </p>
              <Button asChild variant="outline" className="px-6">
                <Link to="/login">Back to Login</Link>
              </Button>
            </div>
          </div>

          {/* Floating password reset card */}
          <Card
            className={clsx(
              'absolute top-1/2 -translate-y-1/2 w-[450px] shadow-xl rounded-md transition-all duration-700 ease-in-out',
              'left-[10%] max-[1300px]:left-1/2 max-[1300px]:-translate-x-1/2 max-[1300px]:w-[550px] max-[700px]:w-full'
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg tracking-wide">
                Enter new password
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={handleSetNewPassword} className="space-y-4">
                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="relative mt-6">
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          <FormMessage className="text-xs" />
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your new password"
                              className={`pr-10 ${
                                form.formState.errors.password
                                  ? 'border-red-500 shake'
                                  : ''
                              }`}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={togglePasswordVisibility}
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                            >
                              {showPassword ? (
                                <EyeSlashIcon className="h-5 w-5" />
                              ) : (
                                <EyeIcon className="h-5 w-5" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="relative mt-6">
                        <div className="flex items-center justify-between">
                          <FormLabel>Confirm Password</FormLabel>
                          <FormMessage className="text-xs">
                            <span />
                          </FormMessage>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirm your new password"
                              className={`pr-10 ${
                                form.formState.errors.confirmPassword
                                  ? 'border-red-500 shake'
                                  : ''
                              }`}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={toggleConfirmPasswordVisibility}
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                            >
                              {showConfirmPassword ? (
                                <EyeSlashIcon className="h-5 w-5" />
                              ) : (
                                <EyeIcon className="h-5 w-5" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Root error message */}
                  {form.formState.errors.root && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.root.message}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="uppercase tracking-wide w-full mt-5"
                  >
                    Change Password
                  </Button>

                  {/* Back to Login button shown only under 1300px */}
                  <Button
                    asChild
                    variant="outline"
                    className="px-6 w-full hidden max-[1300px]:flex animate-dropIn"
                  >
                    <Link to="/login">Back to Login</Link>
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Password changed!</h2>
          <p className="text-sm text-gray-600 mb-4">
            Log in with your new password!
          </p>
          <Button asChild>
            <Link to="/login">Go to Login</Link>
          </Button>
        </div>
      )}
    </div>
  );
}