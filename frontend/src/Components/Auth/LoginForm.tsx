//React
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Logo from '@/assets/react.svg';

//Hooks
import { useStore } from '@/hooks';
import { useEnter } from '@/hooks';

//3rd lib
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from '@/Components/ui';

const FormSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export function LoginForm() {
  const { memberLogin } = useStore((state) => state);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const { setError } = form;

  const handleLogin = form.handleSubmit(async (values) => {
    setIsLoading(true);

    const result = await memberLogin(values);

    setIsLoading(false);

    if (result) {
      toast.success('Logged in successfully! Enjoy!');
      navigate('/');
    } else {
      const { alert } = useStore.getState();
      setError('root', {
        type: 'manual',
        message: alert?.description,
      });
    }
  });
  useEnter(handleLogin);

  return (
    <div className="flex justify-center items-center h-[80vh] relative overflow-hidden pt-5">
      {/* Background dark horizontal box */}
      <div className="background-box bg-secondary w-[85%] h-[280px] rounded-md flex items-center justify-between px-12 overflow-hidden">
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
          <h2 className="text-2xl font-semibold mb-3">Don’t have an account?</h2>
          <p className="text-sm mb-8 leading-relaxed">
            Banjo tote bag bicycle rights, High Life sartorial cray craft beer whatever street art
            fap.
          </p>
          <Button asChild variant="outline" className="px-6">
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>

      {/* Floating login card */}
      <Card
        className={clsx(
          'absolute top-1/2 -translate-y-1/2 w-[450px] max-[1300px]:w-[550px] max-[700px]:w-full shadow-xl rounded-md transition-all duration-700 ease-in-out',
          'right-[10%] max-[1300px]:right-0 max-[1300px]:left-1/2 max-[1300px]:-translate-x-1/2'
        )}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg tracking-wide">LOGIN</CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Username</FormLabel>
                      <FormMessage className="text-xs">
                        <span>
                          {form.formState.errors.username?.message ||
                            form.formState.errors.root?.message}
                        </span>
                      </FormMessage>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        className={`${
                          form.formState.errors.username || form.formState.errors.root
                            ? 'border border-red-500 shake'
                            : ''
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
                      <FormMessage className="text-xs">
                        <span>
                          {form.formState.errors.username?.message ||
                            form.formState.errors.root?.message}
                        </span>
                      </FormMessage>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className={`${
                            form.formState.errors.password || form.formState.errors.root
                              ? 'border border-red-500 shake'
                              : ''
                          }`}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={togglePasswordVisibility}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-500 hover:bg-transparent"
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

              <div className="text-right text-sm">
                <Link to="/reset-password" className="hover:text-red-400">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="uppercase tracking-wide w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Log In'}
              </Button>

              <Button
                asChild
                variant="outline"
                className="px-6 w-full hidden max-[1300px]:flex animate-dropIn"
              >
                <Link to="/signup">Sign Up</Link>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
