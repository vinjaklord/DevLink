import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useForm from '../../hooks/useForm';
import useStore from '../../hooks/useStore';
import { Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import ImageUploader from '../../constant/ImageUploader';

export type UserData = {
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  email: string;
  photo: unknown;
};

export function Signup() {
  const { memberSignup } = useStore((state) => state);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const navigate = useNavigate();

  const { formState, handleFormChange } = useForm<UserData>({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    photo: null,
  });

  // Signup.tsx
  const handleSignup = async () => {
    if (formState.password !== formState.confirmPassword) {
      toast.warning('Passwords do not match!');
      return;
    }
    if (!formState.photo) {
      toast.warning('Please select a photo!');
      return;
    }

    const formData = new FormData();
    formData.append('username', formState.username);
    formData.append('password', formState.password);
    formData.append('confirmPassword', formState.confirmPassword);
    formData.append('email', formState.email);
    formData.append('firstName', formState.firstName);
    formData.append('lastName', formState.lastName);
    formData.append('photo', formState.photo); // Send File object

    const response = await memberSignup(formData);

    if (response) {
      navigate('/login');
      toast.success('Successfully signed up. Welcome!');
    } else {
      toast.error('Error while signing up!');
    }
  };

  return (
    <div className="flex justify-center items-center ">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Welcome, Stranger!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 ">
          <div className="space-y-1">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formState.firstName}
              onChange={handleFormChange}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formState.lastName}
              onChange={handleFormChange}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formState.username}
              onChange={handleFormChange}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              value={formState.email}
              onChange={handleFormChange}
            />
          </div>
          <div className="space-y-1 relative">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formState.password}
              onChange={handleFormChange}
              className="pr-10 w-full"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-5 h-8 w-8 p-0 flex items-center justify-center" // Adjusted positioning
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-500" />
              )}
            </Button>
          </div>
          <div className="space-y-1 relative">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formState.confirmPassword}
              onChange={handleFormChange}
              className="pr-10 w-full"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-5 h-8 w-8 p-0 flex items-center justify-center" // Adjusted positioning
              onClick={toggleConfirmPasswordVisibility}
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-500" />
              )}
            </Button>
          </div>
          <div className="space-y-1">
            <Label htmlFor="photo">Photo</Label>
            <ImageUploader
              handleFormChange={handleFormChange}
              photo={formState.photo}
            />
          </div>
        </CardContent>
        <div className="text-center text-sm text-gray-600 ">
          <Link to="/login" className="text-primary hover:underline">
            Already have an account! Login here!
          </Link>
        </div>

        <CardFooter className="flex justify-center">
          <Button onClick={handleSignup}>Sign Up</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
