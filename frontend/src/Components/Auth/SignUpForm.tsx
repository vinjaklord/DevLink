//React
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import Logo from '@/assets/react.svg'

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
} from '@/Components/ui';
import { Loader2 } from 'lucide-react';

const SignupSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    username: z.string().min(1, 'Username is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    photo: z.any().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type UserData = z.infer<typeof SignupSchema>;

export function SignUpForm() {
  const { memberSignup } = useStore((state) => state);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

  const form = useForm({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { setError } = form;

  const handleSignup = form.handleSubmit(async (values) => {
    // Prevent double submission
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Show optimistic loading toast
      const loadingToast = toast.loading('Creating your account...');

      const response = await memberSignup(values);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (response === true) {
        // Success!
        toast.success('Successfully signed up. Welcome!', {
          duration: 3000,
        });

        // Small delay to let user see success message
        setTimeout(() => {
          navigate('/welcome-test');
        }, 500);
      } else {
        // Signup returned false but didn't throw
        throw new Error('Signup failed');
      }
    } catch (error: any) {
      console.error('Signup error:', error);

      // Get error message from various possible sources
      const errorMsg =
        error?.response?.data?.message || error?.message || 'An error occurred during signup';

      const lowerMsg = errorMsg.toLowerCase();

      // Set specific field errors based on message content
      if (lowerMsg.includes('username')) {
        setError('username', {
          type: 'manual',
          message: errorMsg,
        });
        toast.error('Username is already taken');
      } else if (lowerMsg.includes('email')) {
        setError('email', {
          type: 'manual',
          message: errorMsg,
        });
        toast.error('Email is already registered');
      } else if (lowerMsg.includes('transaction') || lowerMsg.includes('retry')) {
        // Database transaction error - likely transient
        toast.error('Server is busy. Please try again in a moment.', {
          duration: 5000,
        });
      } else {
        // Generic error
        setError('root', {
          type: 'manual',
          message: errorMsg,
        });
        toast.error(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  useEnter(handleSignup);

  return (
    <div className="flex justify-center items-center h-[80vh] relative overflow-hidden pt-5">
      {/* Background horizontal box */}
      <div className="signup-background-box bg-secondary w-[85%] h-[280px] rounded-md flex items-center justify-end px-12 overflow-hidden">
        <div className="max-w-md">
          <div className="flex justify-center mb-6">
            <div className="font-poppins flex items-center gap-2">
              {/* Logo with Link */}
              <div className="flex justify-center items-center">
                <img src={Logo} alt="Logo" className="h-6 w-6" />
              </div>
              {/* Container for the name */}
              <div className="flex gap-1 items-center text-xl">
                <span>
                  Dev<strong>Link</strong>
                </span>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-3">Already have an account?</h2>
          <p className="text-sm mb-8 leading-relaxed">
            Banjo tote bag bicycle rights, High Life sartorial cray craft beer whatever street art
            fap.
          </p>
          <Button asChild variant="outline" className="px-6">
            <Link to="/login">Log In</Link>
          </Button>
        </div>
      </div>

      {/* Floating signup card */}
      <Card
        className={clsx(
          'absolute top-1/2 -translate-y-1/2 w-[450px] shadow-xl rounded-md transition-all duration-700 ease-in-out',
          'left-[10%] max-[1300px]:left-1/2 max-[1300px]:-translate-x-1/2 max-[1300px]:w-[550px] max-[700px]:w-full'
        )}
      >
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSignup} className="space-y-4">
              {/* First Name */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <div className="flex items-center justify-between">
                      <FormLabel>First Name</FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Enter your first name"
                        disabled={isSubmitting}
                        className={`pr-10 ${
                          form.formState.errors.firstName ? 'border-red-500 shake' : ''
                        }`}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <div className="flex items-center justify-between">
                      <FormLabel>Last Name</FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Enter your last name"
                        disabled={isSubmitting}
                        className={`pr-10 ${
                          form.formState.errors.lastName ? 'border-red-500 shake' : ''
                        }`}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <div className="flex items-center justify-between">
                      <FormLabel>Username</FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        disabled={isSubmitting}
                        className={`pr-10 ${
                          form.formState.errors.username ? 'border-red-500 shake' : ''
                        }`}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <div className="flex items-center justify-between">
                      <FormLabel>Email</FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        disabled={isSubmitting}
                        className={`pr-10 ${
                          form.formState.errors.email ? 'border-red-500 shake' : ''
                        }`}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

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
                          placeholder="Enter your password"
                          disabled={isSubmitting}
                          className={`pr-10 ${
                            form.formState.errors.password ? 'border-red-500 shake' : ''
                          }`}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={togglePasswordVisibility}
                          disabled={isSubmitting}
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
                          placeholder="Confirm your password"
                          disabled={isSubmitting}
                          className={`pr-10 ${
                            form.formState.errors.confirmPassword ? 'border-red-500 shake' : ''
                          }`}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={toggleConfirmPasswordVisibility}
                          disabled={isSubmitting}
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

              <Button
                type="submit"
                disabled={isSubmitting}
                className="uppercase tracking-wide w-full mt-5 relative"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>

              {/* Login button shown only under 1300px */}
              <Button
                asChild
                variant="outline"
                className="px-6 w-full hidden max-[1300px]:flex animate-dropIn"
              >
                <Link to="/login">Login</Link>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
