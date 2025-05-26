import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useForm from "../hooks/useForm";
import useStore from "../hooks/useStore";

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
  const navigate = useNavigate();

  const { formState, handleFormChange } = useForm<UserData>({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    email: "",
  });

  const handleSignup = async () => {
    if (formState.password !== formState.confirmPassword) {
      return raiseAlert({
        severity: "warning",
        text: "Passwords do not match.",
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

    console.log("userData:", userData); // Debug the data
    const response = await memberSignup(userData);

    if (response) {
      // navigate("/login");
      console.log("success");
    } else {
      raiseAlert({
        severity: "error",
        text: "There was an issue with the signup. Please check the fields.",
      });
    }
  };

  return (
    <div className="flex justify-center items-center ">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Make changes to your account here. Click save when you're done.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 ">
          <div className="space-y-1">
            <Label htmlFor="firstName">First Name</Label>
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
        <CardFooter className="flex justify-center">
          <Button onClick={handleSignup}>Sign Up</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
