<<<<<<< HEAD
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
=======
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useForm from "../hooks/useForm";
import useStore from "../hooks/useStore";
>>>>>>> 6d20355e57951d7fc0081343aee732ce15e82fa0

type UserData = {
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  email: string;
};
export function Signup() {
  const { memberSignup, raiseAlert } = useStore((state) => state);
  const [showPassword, setShowPassword] = useState(false);
<<<<<<< HEAD
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
=======
  const navigate = useNavigate();

  const { formState, handleFormChange } = useForm<UserData>({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    email: "",
>>>>>>> 6d20355e57951d7fc0081343aee732ce15e82fa0
  });

  const handleSignup = async () => {
    if (formState.password !== formState.confirmPassword) {
      return raiseAlert({
<<<<<<< HEAD
        severity: 'warning',
        text: 'Passwords do not match.',
=======
        severity: "warning",
        text: "Passwords do not match.",
>>>>>>> 6d20355e57951d7fc0081343aee732ce15e82fa0
      });
    }

    const userData: UserData = {
      username: formState.username,
      password: formState.password,
      confirmPassword: formState.confirmPassword, // Include if backend expects it
      email: formState.email,
      firstName: formState.firstName,
      lastName: formState.lastName,
    };

<<<<<<< HEAD
    console.log('userData:', userData); // Debug the data
    const response = await memberSignup(userData);

    if (response) {
      navigate('/login');
      console.log('success');
    } else {
      raiseAlert({
        severity: 'error',
        text: 'There was an issue with the signup. Please check the fields.',
=======
    console.log("userData:", userData); // Debug the data
    const response = await memberSignup(userData);

    if (response) {
      // navigate("/login");
      console.log("success");
    } else {
      raiseAlert({
        severity: "error",
        text: "There was an issue with the signup. Please check the fields.",
>>>>>>> 6d20355e57951d7fc0081343aee732ce15e82fa0
      });
    }
  };

  return (
    <div className="flex justify-center items-center ">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
<<<<<<< HEAD
          <CardDescription>Welcome, Stranger!</CardDescription>
=======
          <CardDescription>Make changes to your account here. Click save when you're done.</CardDescription>
>>>>>>> 6d20355e57951d7fc0081343aee732ce15e82fa0
        </CardHeader>
        <CardContent className="space-y-2 ">
          <div className="space-y-1">
            <Label htmlFor="firstName">First Name</Label>
<<<<<<< HEAD
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
        </CardContent>
        <div className="text-center text-sm text-gray-600 ">
          <Link to="/login" className="text-primary hover:underline">
            Already have an account! Login here!
          </Link>
        </div>

=======
            <Input id="firstName" name="firstName" value={formState.firstName} onChange={handleFormChange} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" name="lastName" value={formState.lastName} onChange={handleFormChange} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" value={formState.username} onChange={handleFormChange} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" value={formState.email} onChange={handleFormChange} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" value={formState.password} onChange={handleFormChange} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" value={formState.confirmPassword} onChange={handleFormChange} />
          </div>
        </CardContent>
>>>>>>> 6d20355e57951d7fc0081343aee732ce15e82fa0
        <CardFooter className="flex justify-center">
          <Button onClick={handleSignup}>Sign Up</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
