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

type UserData = {
  username: string;
  password: string;
};
export function Login() {
  const { memberLogin } = useStore((state) => state);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const { formState, handleFormChange } = useForm<UserData>({
    username: '',
    password: '',
  });

  const handleLogin = async () => {
    // Attempt login
    const result = await memberLogin(formState);

    if (result) {
      // Navigate to dashboard on successful login
      toast.success('Logged in succesfully! Enjoy!');
      navigate('/');
    } else {
      // If login fails, show an alert using CustomAlert
      toast.error('Oops! Invalid credentials!');
      console.log('login failed');
    }
  };

  return (
    <div className="flex justify-center items-center py-20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Welcome back!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 ">
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formState.username}
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
              className="pr-10 w-full" // Ensure padding and full width
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
        </CardContent>
        <div className="text-center text-sm text-gray-600 mt-1">
          <Link to="/signup" className="text-primary hover:underline">
            You don't have an account? Sign up here!
          </Link>
        </div>
        <CardFooter className="flex justify-center">
          <Button onClick={handleLogin}>Login</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
