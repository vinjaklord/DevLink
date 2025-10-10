import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
    <div className="flex justify-center items-center h-[80vh] relative overflow-hidden pt-5">
      {/* Background dark horizontal box */}
      <div className="bg-secondary w-[85%] h-[280px] rounded-md flex items-center justify-between px-12">
        <div className="max-w-md">
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
      <Card className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[450px] shadow-xl rounded-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg tracking-wide">LOGIN</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Email */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="username" className="text-sm text-gray-700">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={formState.username}
                onChange={handleFormChange}
                placeholder="Enter your username"
                className="border-gray-300 focus-visible:ring-red-300"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col space-y-2 relative">
              <Label htmlFor="password" className="text-sm text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formState.password}
                onChange={handleFormChange}
                placeholder="Enter your password"
                className="pr-10 border-gray-300 focus-visible:ring-red-300"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={togglePasswordVisibility}
                className="absolute right-2 top-8 h-8 w-8 p-0 text-gray-500 hover:bg-transparent"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Forgot password */}
            <div className="text-right text-sm">
              <Link to="/forgot-password" className="hover:text-red-400">
                Forgot password?
              </Link>
            </div>

            {/* Login button */}
            <Button onClick={handleLogin} className="uppercase tracking-wide w-full">
              Log In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
