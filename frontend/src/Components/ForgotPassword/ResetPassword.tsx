import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { useState } from 'react';
import useStore from '../../hooks/useStore';
import { toast } from 'sonner';
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from '../ui/form';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const ResetSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
});

export function ResetPassword() {
  const { memberResetPassword } = useStore((state) => state);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: '',
    }
  });

  const handleReset = form.handleSubmit(async (values) => {

    try {
      await memberResetPassword({ email: values.email });
      toast.success('Password reset link sent! Check your email.');
      setEmailSent(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset link');
      form.setError('root', {
        type: 'manual',
        message: error.message || 'Something went wrong',
      })
    }
  });

  return (
    <div className="flex justify-center items-center h-[80vh] relative overflow-hidden pt-5">
      {!emailSent ? (
        <>
          <div className="background-box bg-secondary w-[85%] h-[280px] rounded-md flex items-center justify-between px-12 overflow-hidden">
            <div className="max-w-md">
              <h2 className="text-2xl font-semibold mb-3">Forgot your password?</h2>
              <p className="text-sm mb-8 leading-relaxed">
                No problem! Just enter your email, we will send you a link where you can reset your
                password!
              </p>
            </div>
          </div>

          <Card className="
          absolute right-[10%] top-1/2 -translate-y-1/2 w-[450px] h-[380px] shadow-xl rounded-md transition-all duration-700 ease-in-out 
          max-[1300px]:h-[300px] max-[700px]:w-full max-[1300px]:right-0 max-[1300px]:left-1/2 max-[1300px]:-translate-x-1/2"
          >
   <Form {...form}>
              <form onSubmit={handleReset} className="h-full flex flex-col justify-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg tracking-wide">Enter your Email Address</CardTitle>
                </CardHeader>

                <CardContent className="space-y-8">
                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Email</FormLabel>
                          <FormMessage className="text-xs">
                            <span>
                              {form.formState.errors.email?.message ||
                                form.formState.errors.root?.message}
                            </span>
                          </FormMessage>
                        </div>
                        <FormControl>
                          <Input
                            placeholder="Enter your email"
                            className={`${
                              form.formState.errors.email || form.formState.errors.root
                                ? 'border border-red-500 shake'
                                : ''
                            }`}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="uppercase tracking-wide w-full">
                    Send Reset Link
                  </Button>
                </CardContent>
              </form>
            </Form>
          </Card>
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Check your email</h2>
          <p className="text-sm text-gray-600">We’ve sent a link to reset your password.</p>
        </div>
      )}
    </div>
  );
}
