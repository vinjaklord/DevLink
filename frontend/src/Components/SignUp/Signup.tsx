import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Input } from '../ui/input';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useStore from '../../hooks/useStore';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import useEnter from '@/hooks/useEnter';

import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from '../ui/form';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const SignupSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    username: z.string().min(1, 'Username is required'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    // photo can stay commented out / optional
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function Signup() {
  const { memberSignup } = useStore((state) => state);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () =>
    setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

  const form = useForm({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      // photo: null,
    },
  });

  const { setError } = form;

  const handleSignup = form.handleSubmit(async (values) => {
    try {
      const formData = new FormData();
      formData.append('firstName', values.firstName);
      formData.append('lastName', values.lastName);
      formData.append('username', values.username);
      formData.append('email', values.email);
      formData.append('password', values.password);
      formData.append('confirmPassword', values.confirmPassword);
      // formData.append('photo', values.photo);

      const response = await memberSignup(formData);

      if (response) {
        toast.success('Successfully signed up. Welcome!');
        navigate('/login');
      }
    } catch (error) {
      const { alert } = useStore.getState();
      console.log("alert is ", alert);
      const msg = alert?.description?.toLowerCase();
      console.log("msg is ", msg);
      if (msg?.includes('username')) {
        setError('username', { type: 'manual', message: alert?.description });
      } else if (msg?.includes('email')) {
        setError('email', { type: 'manual', message: alert?.description });
      } else {
        setError('root', { type: 'manual', message: alert?.description });
      }
      return;
    }
  });

  useEnter(handleSignup);

  return (
    <div className="flex justify-center items-center h-[80vh] relative overflow-hidden pt-5">
      {/* Background horizontal box */}
      <div className="bg-secondary w-[85%] h-[280px] rounded-md flex items-center justify-end px-12">
        <div className="max-w-md">
          <h2 className="text-2xl font-semibold mb-3">
            Already have an account?
          </h2>
          <p className="text-sm mb-8 leading-relaxed">
            Banjo tote bag bicycle rights, High Life sartorial cray craft beer
            whatever street art fap.
          </p>
          <Button asChild variant="outline" className="px-6">
            <Link to="/login">Log In</Link>
          </Button>
        </div>
      </div>

      {/* Floating signup card */}
      <Card className="absolute left-[10%] top-1/2 -translate-y-1/2 w-[450px] shadow-xl rounded-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg tracking-wide h-1">
            SIGN UP
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSignup} className="space-y-4">
              {/* First Name */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className='mt-6'>
                    <div className="flex items-center justify-between">
                      <FormLabel>First Name</FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Enter your first name"
                        className={`pr-10 ${form.formState.errors.firstName ? 'border-red-500 shake' : ''}`}
                        {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className='mt-6'>
                    <div className="flex items-center justify-between">
                      <FormLabel>Last Name</FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Enter your last name"
                        className={`pr-10 ${form.formState.errors.lastName ? 'border-red-500 shake' : ''}`}
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
                  <FormItem className='mt-6'>
                    <div className="flex items-center justify-between">
                      <FormLabel>Username</FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        className={`pr-10 ${form.formState.errors.username ? 'border-red-500 shake' : ''}`}
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
                  <FormItem className='mt-6'>
                    <div className="flex items-center justify-between">
                      <FormLabel>Email</FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        className={`pr-10 ${form.formState.errors.email ? 'border-red-500 shake' : ''}`}
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
                          className={
                            `pr-10 ${form.formState.errors.password ? 'border-red-500 shake' : ''}`}
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
                      <FormMessage className="text-xs" >
                        <span />
                      </FormMessage>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          className={`pr-10 ${form.formState.errors.confirmPassword ? 'border-red-500 shake' : ''}`}
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

              {/* Photo (commented out) */}
              {/*
              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo</FormLabel>
                    <FormControl>
                      <Input type="file" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              */}

              <Button
                type="submit"
                className="uppercase tracking-wide w-full mt-5"
              >
                Sign Up
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
