import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import Logo from '@/assets/DevLinkLogo.png';

import { useStore } from '@/hooks';
import { useEnter } from '@/hooks';

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

export function SignUpForm() {
  const { t } = useTranslation();
  const { memberSignup } = useStore((state) => state);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const SignupSchema = z
    .object({
      firstName: z.string().min(1, t('firstNameReq')),
      lastName: z.string().min(1, t('lastNameReq')),
      username: z.string().min(1, t('usernameReq')),
      email: z.string().min(1, t('emailReq')).email(t('invalidEmail')),
      password: z.string().min(1, t('passwordReq')),
      confirmPassword: z.string().min(1, t('confirmPasswordReq')),
      photo: z.any().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('passwordsMatchError'),
      path: ['confirmPassword'],
    });

  type UserData = z.infer<typeof SignupSchema>;

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

  const form = useForm<UserData>({
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
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const loadingToast = toast.loading(t('creatingAccount'));

      const response = await memberSignup(values);
      toast.dismiss(loadingToast);

      if (response === true) {
        toast.success(t('signupSuccess'), { duration: 3000 });
        setTimeout(() => {
          navigate('/welcome-test');
        }, 500);
      } else {
        throw new Error(t('signupFailed'));
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || t('signupFailed');
      const lowerMsg = errorMsg.toLowerCase();

      if (lowerMsg.includes('username')) {
        setError('username', { type: 'manual', message: errorMsg });
        toast.error(t('usernameTaken'));
      } else if (lowerMsg.includes('email')) {
        setError('email', { type: 'manual', message: errorMsg });
        toast.error(t('emailRegistered'));
      } else if (lowerMsg.includes('transaction') || lowerMsg.includes('retry')) {
        toast.error(t('serverBusy'), { duration: 5000 });
      } else {
        setError('root', { type: 'manual', message: errorMsg });
        toast.error(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  useEnter(handleSignup);

  return (
    <div className="flex justify-center items-center h-[80vh] relative overflow-hidden pt-5">
      <div className="signup-background-box bg-secondary w-[85%] h-[280px] rounded-md flex items-center justify-end px-12 overflow-hidden">
        <div className="max-w-md">
          <div className="flex justify-center mb-6">
            <div className="font-poppins flex items-center gap-2">
              <div className="flex justify-center items-center">
                <img src={Logo} alt="Logo" className="h-6 w-6" />
              </div>
              <div className="flex gap-1 items-center text-xl">
                <span>
                  Dev<strong>Link</strong>
                </span>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-3">{t('alreadyHaveAccount')}</h2>
          <p className="text-sm mb-8 leading-relaxed">
            Connect with a global community of developers to share code, insights, and innovation.
          </p>
          <Button asChild variant="outline" className="px-6">
            <Link to="/login">{t('login')}</Link>
          </Button>
        </div>
      </div>

      <Card
        className={clsx(
          'absolute top-1/2 -translate-y-1/2 w-[450px] shadow-xl rounded-md transition-all duration-700 ease-in-out',
          'left-[10%] max-[1300px]:left-1/2 max-[1300px]:-translate-x-1/2 max-[1300px]:w-[550px] max-[700px]:w-full',
        )}
      >
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSignup} className="space-y-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <div className="flex items-center justify-between">
                      <FormLabel>{t('firstName')}</FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                    <FormControl>
                      <Input
                        placeholder={t('enterFirstName')}
                        disabled={isSubmitting}
                        className={clsx(
                          'pr-10',
                          form.formState.errors.firstName && 'border-red-500 shake',
                        )}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <div className="flex items-center justify-between">
                      <FormLabel>{t('lastName')}</FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                    <FormControl>
                      <Input
                        placeholder={t('enterLastName')}
                        disabled={isSubmitting}
                        className={clsx(
                          'pr-10',
                          form.formState.errors.lastName && 'border-red-500 shake',
                        )}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <div className="flex items-center justify-between">
                      <FormLabel>{t('username')}</FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                    <FormControl>
                      <Input
                        placeholder={t('enterUsername')}
                        disabled={isSubmitting}
                        className={clsx(
                          'pr-10',
                          form.formState.errors.username && 'border-red-500 shake',
                        )}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <div className="flex items-center justify-between">
                      <FormLabel>{t('email')}</FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                    <FormControl>
                      <Input
                        placeholder={t('enterEmail')}
                        disabled={isSubmitting}
                        className={clsx(
                          'pr-10',
                          form.formState.errors.email && 'border-red-500 shake',
                        )}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="relative mt-6">
                    <div className="flex items-center justify-between">
                      <FormLabel>{t('password')}</FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('enterPassword')}
                          disabled={isSubmitting}
                          className={clsx(
                            'pr-10',
                            form.formState.errors.password && 'border-red-500 shake',
                          )}
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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="relative mt-6">
                    <div className="flex items-center justify-between">
                      <FormLabel>{t('confirmPassword')}</FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder={t('confirmYourPassword')}
                          disabled={isSubmitting}
                          className={clsx(
                            'pr-10',
                            form.formState.errors.confirmPassword && 'border-red-500 shake',
                          )}
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
                    {t('creatingAccountBtn')}
                  </>
                ) : (
                  t('signup')
                )}
              </Button>

              <Button
                asChild
                variant="outline"
                className="px-6 w-full hidden max-[1300px]:flex animate-dropIn"
              >
                <Link to="/login">{t('login')}</Link>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
